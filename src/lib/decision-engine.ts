import prisma from "./prisma";

/**
 * Decision Engine — Deterministic phone recommendation scoring.
 * 
 * Takes user preferences (budget, priorities, optional brand) and returns
 * a ranked list of phones with explainable scores. No LLM dependency —
 * pure structured data scoring.
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
  brandPreference?: string; // Optional brand slug
  mustHave?: string[];      // Optional must-have features (e.g., "5g", "wireless_charging")
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
  matchReasons: string[];   // Human-readable explanations
  warnings: string[];       // Any trade-offs or caveats
  rank: number;
}

export interface DecisionResult {
  recommendations: ScoredPhone[];
  totalCandidates: number;
  filteredOut: number;
  preferences: UserPreferences;
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getProcessorTier(processor: string): number {
  const name = processor.toLowerCase();
  if (name.includes("snapdragon 8 gen 3") || name.includes("a17") || name.includes("dimensity 9300")) return 3;
  if (name.includes("snapdragon 8 gen 2") || name.includes("a16") || name.includes("tensor g3") || name.includes("dimensity 9200")) return 2.5;
  if (name.includes("snapdragon 8") || name.includes("a15") || name.includes("tensor g2") || name.includes("dimensity 9")) return 2;
  if (name.includes("snapdragon 7") || name.includes("dimensity 8") || name.includes("tensor")) return 1.5;
  if (name.includes("snapdragon 6") || name.includes("dimensity 7")) return 1;
  return 0.5;
}

function getResolutionTier(resolution: string): number {
  if (!resolution) return 0;
  const match = resolution.match(/(\d+)\s*x\s*(\d+)/);
  if (!match) return 0;
  const pixels = parseInt(match[1]) * parseInt(match[2]);
  if (pixels > 3500000) return 3;   // QHD+ and above
  if (pixels > 2500000) return 2;   // FHD+ (most flagships)
  if (pixels > 1500000) return 1;   // HD+
  return 0;
}

function countCameraFeatures(features: string): number {
  if (!features) return 0;
  const keywords = ["optical zoom", "ois", "night", "macro", "ultra-wide", "pro", "raw", "8k", "4k", "telephoto", "periscope"];
  const lower = features.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).length;
}

/**
 * Run the decision engine with given preferences.
 * Returns scored and ranked phones within budget.
 */
export async function findMyPhone(preferences: UserPreferences): Promise<DecisionResult> {
  // Fetch all published phones with specs
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

  // Score each phone
  const scored: ScoredPhone[] = phonesToScore.map((phone) => {
    const specMap = new Map<string, { value: string; numericValue: number | null }>();
    for (const ps of phone.specs) {
      specMap.set(ps.spec.key, { value: ps.value, numericValue: ps.numericValue });
    }

    const getNumeric = (key: string): number | null => specMap.get(key)?.numericValue ?? null;
    const getString = (key: string): string => specMap.get(key)?.value ?? "";

    // === Camera Score ===
    const mainCam = getNumeric("main_camera") || 0;
    const frontCam = getNumeric("front_camera") || 0;
    const camFeatures = countCameraFeatures(getString("camera_features"));
    const cameraScore = (
      normalize(mainCam, 12, 200) * 0.4 +
      normalize(frontCam, 8, 32) * 0.2 +
      normalize(camFeatures, 0, 5) * 0.4
    ) * 100;
    const cameraDetails: string[] = [];
    if (mainCam > 0) cameraDetails.push(`${mainCam}MP main camera`);
    if (frontCam > 0) cameraDetails.push(`${frontCam}MP front camera`);
    if (camFeatures > 2) cameraDetails.push(`${camFeatures} pro camera features`);

    // === Battery Score ===
    const battery = getNumeric("battery") || 0;
    const charger = getNumeric("charger") || 0;
    const hasWireless = getString("wireless_charging").toLowerCase().includes("yes") ||
      getString("wireless_charging").match(/\d+w/i) ? 1 : 0;
    const batteryScore = (
      normalize(battery, 3000, 6000) * 0.5 +
      normalize(charger, 15, 120) * 0.3 +
      hasWireless * 0.2
    ) * 100;
    const batteryDetails: string[] = [];
    if (battery > 0) batteryDetails.push(`${battery}mAh battery`);
    if (charger > 0) batteryDetails.push(`${charger}W fast charging`);
    if (hasWireless) batteryDetails.push("Wireless charging");

    // === Performance Score ===
    const ram = getNumeric("ram") || 0;
    const storage = getNumeric("storage") || 0;
    const procTier = getProcessorTier(getString("processor"));
    const performanceScore = (
      normalize(ram, 4, 24) * 0.35 +
      normalize(storage, 64, 1024) * 0.35 +
      normalize(procTier, 0, 3) * 0.3
    ) * 100;
    const performanceDetails: string[] = [];
    if (ram > 0) performanceDetails.push(`${ram}GB RAM`);
    if (storage > 0) performanceDetails.push(`${storage}GB storage`);
    const proc = getString("processor");
    if (proc) performanceDetails.push(proc);

    // === Display Score ===
    const displaySize = getNumeric("display_size") || 0;
    const refreshRate = getNumeric("refresh_rate") || 60;
    const resTier = getResolutionTier(getString("resolution"));
    const displayScore = (
      normalize(displaySize, 5.5, 7.0) * 0.2 +
      normalize(refreshRate, 60, 144) * 0.4 +
      normalize(resTier, 0, 3) * 0.4
    ) * 100;
    const displayDetails: string[] = [];
    if (displaySize > 0) displayDetails.push(`${displaySize}" display`);
    if (refreshRate > 60) displayDetails.push(`${refreshRate}Hz refresh rate`);
    const displayType = getString("display_type");
    if (displayType) displayDetails.push(displayType);

    // === Value Score ===
    const rawSpecScore = (cameraScore + batteryScore + performanceScore + displayScore) / 4;
    const priceNorm = phone.priceUsd ? normalize(phone.priceUsd, 100, 1500) : 0.5;
    // Value = high specs at low price
    const valueScore = rawSpecScore * (1 - priceNorm * 0.4) * 1.2;
    const valueDetails: string[] = [];
    if (phone.priceUsd) {
      const specPerDollar = (rawSpecScore / (phone.priceUsd / 100)).toFixed(1);
      valueDetails.push(`$${phone.priceUsd.toLocaleString()} price point`);
      valueDetails.push(`${specPerDollar} spec points per $100`);
    }

    // === Weighted Total ===
    const { camera, battery: batteryPri, performance, display, value } = preferences.priorities;
    const totalWeight = Math.max(1, camera + batteryPri + performance + display + value);
    const totalScore = Math.round(
      (cameraScore * camera +
        batteryScore * batteryPri +
        performanceScore * performance +
        displayScore * display +
        Math.min(100, valueScore) * value) /
      totalWeight
    );

    // Generate match reasons
    const matchReasons: string[] = [];
    const warnings: string[] = [];

    if (cameraScore >= 70 && camera >= 3) matchReasons.push("Excellent camera system matches your priority");
    if (batteryScore >= 70 && batteryPri >= 3) matchReasons.push("Strong battery life as you requested");
    if (performanceScore >= 70 && performance >= 3) matchReasons.push("Top-tier performance for demanding use");
    if (displayScore >= 70 && display >= 3) matchReasons.push("Premium display quality");
    if (valueScore >= 70 && value >= 3) matchReasons.push("Great value for the price");

    if (battery < 4500 && batteryPri >= 3) warnings.push("Battery capacity below average for your needs");
    if (mainCam < 48 && camera >= 3) warnings.push("Camera resolution is modest");
    if (ram < 8 && performance >= 3) warnings.push("RAM may limit heavy multitasking");

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
        camera: { score: Math.round(cameraScore), max: 100, details: cameraDetails },
        battery: { score: Math.round(batteryScore), max: 100, details: batteryDetails },
        performance: { score: Math.round(performanceScore), max: 100, details: performanceDetails },
        display: { score: Math.round(displayScore), max: 100, details: displayDetails },
        value: { score: Math.round(Math.min(100, valueScore)), max: 100, details: valueDetails },
      },
      matchReasons,
      warnings,
      rank: 0, // Will be set after sorting
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
 * Returns winner per category and overall verdict.
 */
export interface ComparisonVerdict {
  overallWinner: string | "tie";
  overallExplanation: string;
  categories: Record<string, {
    winner: string | "tie";
    phone1Score: number;
    phone2Score: number;
    explanation: string;
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

  const getSpec = (phone: typeof phone1, key: string) => {
    const s = phone.specs.find((ps) => ps.spec.key === key);
    return { value: s?.value || "", numeric: s?.numericValue || 0 };
  };

  // Score each category for both phones
  const scoreCategory = (
    key: string,
    label: string,
    specs: Array<{ specKey: string; weight: number; direction: "higher" | "lower" }>
  ) => {
    let score1 = 0;
    let score2 = 0;
    const explanations: string[] = [];

    for (const { specKey, weight, direction } of specs) {
      const v1 = getSpec(phone1, specKey).numeric;
      const v2 = getSpec(phone2, specKey).numeric;
      if (v1 === 0 && v2 === 0) continue;

      const better1 = direction === "higher" ? v1 > v2 : v1 < v2;
      const equal = v1 === v2;

      if (equal) {
        score1 += weight * 0.5;
        score2 += weight * 0.5;
      } else if (better1) {
        score1 += weight;
        const unit = phone1.specs.find((s) => s.spec.key === specKey)?.spec.unit || "";
        explanations.push(`${phone1.name} has ${direction === "higher" ? "higher" : "lower"} ${specKey.replace("_", " ")} (${v1}${unit} vs ${v2}${unit})`);
      } else {
        score2 += weight;
        const unit = phone2.specs.find((s) => s.spec.key === specKey)?.spec.unit || "";
        explanations.push(`${phone2.name} has ${direction === "higher" ? "higher" : "lower"} ${specKey.replace("_", " ")} (${v2}${unit} vs ${v1}${unit})`);
      }
    }

    const total = specs.reduce((s, sp) => s + sp.weight, 0) || 1;
    const winner = Math.abs(score1 - score2) < total * 0.05
      ? "tie" as const
      : score1 > score2
        ? phone1.id
        : phone2.id;

    return {
      winner,
      phone1Score: Math.round((score1 / total) * 100),
      phone2Score: Math.round((score2 / total) * 100),
      explanation: explanations[0] || `${label} scores are very close`,
    };
  };

  const categories: Record<string, ReturnType<typeof scoreCategory>> = {
    camera: scoreCategory("Camera", "Camera", [
      { specKey: "main_camera", weight: 3, direction: "higher" },
      { specKey: "front_camera", weight: 1.5, direction: "higher" },
    ]),
    battery: scoreCategory("Battery", "Battery", [
      { specKey: "battery", weight: 3, direction: "higher" },
      { specKey: "charger", weight: 2, direction: "higher" },
    ]),
    performance: scoreCategory("Performance", "Performance", [
      { specKey: "ram", weight: 2, direction: "higher" },
      { specKey: "storage", weight: 2, direction: "higher" },
    ]),
    display: scoreCategory("Display", "Display", [
      { specKey: "display_size", weight: 1, direction: "higher" },
      { specKey: "refresh_rate", weight: 2, direction: "higher" },
    ]),
    design: scoreCategory("Design", "Design", [
      { specKey: "weight", weight: 2, direction: "lower" },
    ]),
  };

  // Count category wins
  let phone1Wins = 0;
  let phone2Wins = 0;
  const phone1Strengths: string[] = [];
  const phone2Strengths: string[] = [];

  const categoryLabels: Record<string, string> = {
    camera: "Camera",
    battery: "Battery",
    performance: "Performance",
    display: "Display",
    design: "Design",
  };

  for (const [key, result] of Object.entries(categories)) {
    if (result.winner === phone1.id) {
      phone1Wins++;
      phone1Strengths.push(`Better ${categoryLabels[key]}`);
    } else if (result.winner === phone2.id) {
      phone2Wins++;
      phone2Strengths.push(`Better ${categoryLabels[key]}`);
    }
  }

  // Price comparison
  if (phone1.priceUsd && phone2.priceUsd) {
    if (phone1.priceUsd < phone2.priceUsd * 0.9) {
      phone1Strengths.push(`$${(phone2.priceUsd - phone1.priceUsd).toFixed(0)} cheaper`);
    } else if (phone2.priceUsd < phone1.priceUsd * 0.9) {
      phone2Strengths.push(`$${(phone1.priceUsd - phone2.priceUsd).toFixed(0)} cheaper`);
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
    ? `${phone1.name} and ${phone2.name} are evenly matched with different strengths`
    : `${winnerName} wins ${Math.max(phone1Wins, phone2Wins)} out of 5 categories`;

  return {
    overallWinner,
    overallExplanation,
    categories,
    phone1Strengths,
    phone2Strengths,
  };
}
