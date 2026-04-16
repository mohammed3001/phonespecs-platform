import prisma from "./prisma";
import {
  buildSpecMap,
  normalize,
  scoreCameraCategory,
  scoreBatteryCategory,
  scorePerformanceCategory,
  scoreDisplayCategory,
  scoreDesignCategory,
  scoreAllCategories,
  getNumeric,
} from "./spec-extraction";

/**
 * Decision Engine — Deterministic phone recommendation scoring.
 * 
 * Uses the spec extraction layer to correctly map database keys to scoring
 * categories. All scoring is explainable and deterministic — no LLM dependency.
 */

export interface UserPreferences {
  budgetMax: number;
  budgetMin?: number;
  priorities: {
    camera: number;      // 0-5 importance
    battery: number;     // 0-5 importance
    performance: number; // 0-5 importance
    display: number;     // 0-5 importance
    value: number;       // 0-5 importance (price-to-specs ratio)
  };
  brandPreference?: string;
  mustHave?: string[];
}

export interface ScoredPhone {
  phone: {
    id: string;
    name: string;
    slug: string;
    brandName: string;
    brandSlug: string;
    price: number | null;
    priceDisplay: string | null;
    mainImage: string | null;
    marketStatus: string;
  };
  totalScore: number;      // 0-100 composite
  categoryScores: {
    camera: { score: number; max: number; details: string[] };
    battery: { score: number; max: number; details: string[] };
    performance: { score: number; max: number; details: string[] };
    display: { score: number; max: number; details: string[] };
    value: { score: number; max: number; details: string[] };
  };
  matchReasons: string[];
  warnings: string[];
  rank: number;
}

export interface DecisionResult {
  recommendations: ScoredPhone[];
  totalCandidates: number;
  filteredOut: number;
  preferences: UserPreferences;
}

/**
 * Run the decision engine with given preferences.
 */
export async function findMyPhone(preferences: UserPreferences): Promise<DecisionResult> {
  const allPhones = await prisma.phone.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      name: true,
      slug: true,
      priceUsd: true,
      priceDisplay: true,
      mainImage: true,
      marketStatus: true,
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { select: { key: true, name: true, unit: true } } },
      },
    },
  });

  const totalCandidates = allPhones.length;

  // Filter by budget
  const budgetMin = preferences.budgetMin || 0;
  const candidates = allPhones.filter((p) => {
    if (!p.priceUsd) return false;
    return p.priceUsd >= budgetMin && p.priceUsd <= preferences.budgetMax;
  });

  // Filter by brand preference
  const filtered = preferences.brandPreference
    ? candidates.filter((p) => p.brand.slug === preferences.brandPreference)
    : candidates;

  // Use candidates if brand filter results in empty set
  const phonesToScore = filtered.length > 0 ? filtered : candidates;

  // Score each phone using the extraction layer
  const scored: ScoredPhone[] = phonesToScore.map((phone) => {
    const specMap = buildSpecMap(phone.specs);

    // Use the centralized scoring functions
    const cameraResult = scoreCameraCategory(specMap);
    const batteryResult = scoreBatteryCategory(specMap);
    const performanceResult = scorePerformanceCategory(specMap);
    const displayResult = scoreDisplayCategory(specMap);
    scoreDesignCategory(specMap); // computed for completeness

    // Value score: specs-per-dollar
    const rawSpecScore = (cameraResult.score + batteryResult.score + performanceResult.score + displayResult.score) / 4;
    const priceNorm = phone.priceUsd ? normalize(phone.priceUsd, 100, 1500) : 0.5;
    const valueScore = Math.min(100, Math.round(rawSpecScore * (1.2 - priceNorm * 0.5)));
    const valueDetails: string[] = [];
    if (phone.priceUsd) {
      valueDetails.push(`$${phone.priceUsd.toLocaleString()} price point`);
      const specPerDollar = (rawSpecScore / (phone.priceUsd / 100)).toFixed(1);
      valueDetails.push(`${specPerDollar} spec points per $100`);
    }

    // Weighted total based on user priorities
    const { camera, battery: batteryPri, performance, display, value } = preferences.priorities;
    const totalWeight = Math.max(1, camera + batteryPri + performance + display + value);
    const totalScore = Math.round(
      (cameraResult.score * camera +
        batteryResult.score * batteryPri +
        performanceResult.score * performance +
        displayResult.score * display +
        valueScore * value) /
      totalWeight
    );

    // Generate match reasons based on actual scores
    const matchReasons: string[] = [];
    const warnings: string[] = [];

    if (cameraResult.score >= 70 && camera >= 3) matchReasons.push(`Excellent camera system (${cameraResult.score}/100)`);
    else if (cameraResult.score >= 50 && camera >= 3) matchReasons.push(`Good camera capabilities (${cameraResult.score}/100)`);

    if (batteryResult.score >= 70 && batteryPri >= 3) matchReasons.push(`Strong battery life (${batteryResult.score}/100)`);
    else if (batteryResult.score >= 50 && batteryPri >= 3) matchReasons.push(`Decent battery performance (${batteryResult.score}/100)`);

    if (performanceResult.score >= 70 && performance >= 3) matchReasons.push(`Top-tier performance (${performanceResult.score}/100)`);
    else if (performanceResult.score >= 50 && performance >= 3) matchReasons.push(`Solid performance (${performanceResult.score}/100)`);

    if (displayResult.score >= 70 && display >= 3) matchReasons.push(`Premium display quality (${displayResult.score}/100)`);
    else if (displayResult.score >= 50 && display >= 3) matchReasons.push(`Good display (${displayResult.score}/100)`);

    if (valueScore >= 70 && value >= 3) matchReasons.push(`Great value for the price (${valueScore}/100)`);

    // Warnings only for genuinely low scores in high-priority areas
    const batteryCapacity = getNumeric(specMap, "batteryCapacity");
    const mainCamMP = getNumeric(specMap, "mainCameraMP");
    const ram = getNumeric(specMap, "ram");

    if (batteryResult.score < 40 && batteryPri >= 4) warnings.push(`Battery score is modest (${batteryResult.score}/100) — ${batteryCapacity}mAh capacity`);
    if (cameraResult.score < 40 && camera >= 4) warnings.push(`Camera score is modest (${cameraResult.score}/100) — ${mainCamMP}MP main sensor`);
    if (performanceResult.score < 40 && performance >= 4) warnings.push(`Performance score is modest (${performanceResult.score}/100) — ${ram}GB RAM`);

    if (preferences.brandPreference && phone.brand.slug === preferences.brandPreference) {
      matchReasons.push(`Matches your ${phone.brand.name} brand preference`);
    }

    return {
      phone: {
        id: phone.id,
        name: phone.name,
        slug: phone.slug,
        brandName: phone.brand.name,
        brandSlug: phone.brand.slug,
        price: phone.priceUsd,
        priceDisplay: phone.priceDisplay,
        mainImage: phone.mainImage,
        marketStatus: phone.marketStatus,
      },
      totalScore: Math.min(100, Math.max(0, totalScore)),
      categoryScores: {
        camera: { score: cameraResult.score, max: 100, details: cameraResult.details },
        battery: { score: batteryResult.score, max: 100, details: batteryResult.details },
        performance: { score: performanceResult.score, max: 100, details: performanceResult.details },
        display: { score: displayResult.score, max: 100, details: displayResult.details },
        value: { score: Math.round(valueScore), max: 100, details: valueDetails },
      },
      matchReasons,
      warnings,
      rank: 0,
    };
  });

  // Sort by total score descending
  scored.sort((a, b) => b.totalScore - a.totalScore);
  scored.forEach((s, i) => (s.rank = i + 1));

  return {
    recommendations: scored,
    totalCandidates,
    filteredOut: totalCandidates - phonesToScore.length,
    preferences,
  };
}

/**
 * Compute comparison verdicts between two phones.
 */
export interface ComparisonVerdict {
  overallWinner: string | "tie";
  overallExplanation: string;
  categories: Record<string, {
    winner: string | "tie";
    phone1Score: number;
    phone2Score: number;
    explanation: string;
    details: { phone1: string[]; phone2: string[] };
  }>;
  phone1Strengths: string[];
  phone2Strengths: string[];
}

export async function computeComparisonVerdict(
  phone1Id: string,
  phone2Id: string
): Promise<ComparisonVerdict | null> {
  const [phone1, phone2] = await Promise.all([
    prisma.phone.findUnique({
      where: { id: phone1Id },
      select: {
        id: true,
        name: true,
        priceUsd: true,
        specs: {
          include: { spec: { select: { key: true, name: true, unit: true } } },
        },
      },
    }),
    prisma.phone.findUnique({
      where: { id: phone2Id },
      select: {
        id: true,
        name: true,
        priceUsd: true,
        specs: {
          include: { spec: { select: { key: true, name: true, unit: true } } },
        },
      },
    }),
  ]);

  if (!phone1 || !phone2) return null;

  // Build spec maps using the extraction layer
  const specMap1 = buildSpecMap(phone1.specs);
  const specMap2 = buildSpecMap(phone2.specs);

  // Score all categories for both phones
  const scores1 = scoreAllCategories(specMap1);
  const scores2 = scoreAllCategories(specMap2);

  const categoryLabels: Record<string, string> = {
    camera: "Camera",
    battery: "Battery",
    performance: "Performance",
    display: "Display",
    design: "Design",
  };

  const categories: ComparisonVerdict["categories"] = {};
  let phone1Wins = 0;
  let phone2Wins = 0;
  const phone1Strengths: string[] = [];
  const phone2Strengths: string[] = [];

  for (const [key, label] of Object.entries(categoryLabels)) {
    const s1 = scores1[key];
    const s2 = scores2[key];

    // A difference of less than 5 points is a tie
    const diff = Math.abs(s1.score - s2.score);
    const isTie = diff < 5;

    const winner = isTie ? "tie" as const : s1.score > s2.score ? phone1.id : phone2.id;

    if (winner === phone1.id) {
      phone1Wins++;
      phone1Strengths.push(`Better ${label} (${s1.score} vs ${s2.score})`);
    } else if (winner === phone2.id) {
      phone2Wins++;
      phone2Strengths.push(`Better ${label} (${s2.score} vs ${s1.score})`);
    }

    // Build explanation
    let explanation: string;
    if (isTie) {
      explanation = `${label} scores are very close (${s1.score} vs ${s2.score})`;
    } else if (winner === phone1.id) {
      explanation = `${phone1.name} scores higher in ${label.toLowerCase()} (${s1.score} vs ${s2.score})`;
    } else {
      explanation = `${phone2.name} scores higher in ${label.toLowerCase()} (${s2.score} vs ${s1.score})`;
    }

    categories[key] = {
      winner,
      phone1Score: s1.score,
      phone2Score: s2.score,
      explanation,
      details: {
        phone1: s1.details,
        phone2: s2.details,
      },
    };
  }

  // Price comparison
  if (phone1.priceUsd && phone2.priceUsd) {
    const priceDiff = Math.abs(phone1.priceUsd - phone2.priceUsd);
    if (phone1.priceUsd < phone2.priceUsd * 0.9) {
      phone1Strengths.push(`$${priceDiff.toFixed(0)} cheaper`);
    } else if (phone2.priceUsd < phone1.priceUsd * 0.9) {
      phone2Strengths.push(`$${priceDiff.toFixed(0)} cheaper`);
    }
  }

  const overallWinner = phone1Wins > phone2Wins
    ? phone1.id
    : phone2Wins > phone1Wins
      ? phone2.id
      : "tie" as const;

  const winnerName = overallWinner === phone1.id
    ? phone1.name
    : overallWinner === phone2.id
      ? phone2.name
      : null;

  const overallExplanation = overallWinner === "tie"
    ? `${phone1.name} and ${phone2.name} are evenly matched — each has different strengths`
    : `${winnerName} wins ${Math.max(phone1Wins, phone2Wins)} out of 5 categories`;

  return {
    overallWinner,
    overallExplanation,
    categories,
    phone1Strengths,
    phone2Strengths,
  };
}
