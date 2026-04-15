import prisma from "./prisma";

/**
 * Spec IQ Engine — Computes percentile rankings for phone specifications.
 * 
 * For each numeric spec (battery, RAM, camera, etc.), computes where a phone
 * stands relative to all other phones in the database. Returns badges like
 * "Better than 82% of phones" for each rankable spec.
 * 
 * Higher-is-better specs: battery, ram, storage, main_camera, front_camera, 
 *   refresh_rate, charger, display_size
 * Lower-is-better specs: weight
 * Neutral specs (not ranked): bluetooth
 */

// Spec ranking configuration: direction and display metadata
const RANKABLE_SPECS: Record<string, {
  direction: "higher" | "lower";
  label: string;
  category: "performance" | "camera" | "battery" | "display" | "design";
  icon: string;
  badgeTemplate: string;
}> = {
  battery: {
    direction: "higher",
    label: "Battery Life",
    category: "battery",
    icon: "battery",
    badgeTemplate: "battery capacity",
  },
  ram: {
    direction: "higher",
    label: "RAM",
    category: "performance",
    icon: "ram",
    badgeTemplate: "RAM",
  },
  storage: {
    direction: "higher",
    label: "Storage",
    category: "performance",
    icon: "storage",
    badgeTemplate: "storage",
  },
  main_camera: {
    direction: "higher",
    label: "Main Camera",
    category: "camera",
    icon: "main_camera",
    badgeTemplate: "main camera resolution",
  },
  front_camera: {
    direction: "higher",
    label: "Front Camera",
    category: "camera",
    icon: "front_camera",
    badgeTemplate: "front camera resolution",
  },
  refresh_rate: {
    direction: "higher",
    label: "Refresh Rate",
    category: "display",
    icon: "refresh_rate",
    badgeTemplate: "refresh rate",
  },
  charger: {
    direction: "higher",
    label: "Fast Charging",
    category: "battery",
    icon: "charger",
    badgeTemplate: "charging speed",
  },
  display_size: {
    direction: "higher",
    label: "Display Size",
    category: "display",
    icon: "display_size",
    badgeTemplate: "display size",
  },
  weight: {
    direction: "lower",
    label: "Weight",
    category: "design",
    icon: "weight",
    badgeTemplate: "lightweight design",
  },
};

export interface SpecIQBadge {
  specKey: string;
  specName: string;
  category: string;
  value: number;
  unit: string;
  percentile: number; // 0-100, how this phone compares
  rank: number; // 1-based rank
  totalPhones: number;
  badge: string; // Human-readable badge text
  tier: "exceptional" | "great" | "good" | "average" | "below_average";
  icon: string;
}

export interface SpecIQSummary {
  overallScore: number; // 0-100 composite score
  tier: "exceptional" | "great" | "good" | "average" | "below_average";
  tierLabel: string;
  badges: SpecIQBadge[];
  topStrengths: SpecIQBadge[]; // Top 3 best percentile specs
  priceTier: string; // "budget" | "mid-range" | "flagship" | "ultra-premium"
  valueScore: number; // Score relative to price tier
}

function getTier(percentile: number): SpecIQBadge["tier"] {
  if (percentile >= 90) return "exceptional";
  if (percentile >= 75) return "great";
  if (percentile >= 50) return "good";
  if (percentile >= 25) return "average";
  return "below_average";
}

function getTierLabel(tier: string): string {
  switch (tier) {
    case "exceptional": return "Exceptional";
    case "great": return "Great";
    case "good": return "Good";
    case "average": return "Average";
    case "below_average": return "Below Average";
    default: return "Unknown";
  }
}

function getPriceTier(price: number | null): string {
  if (!price) return "unknown";
  if (price < 400) return "budget";
  if (price < 800) return "mid-range";
  if (price < 1100) return "flagship";
  return "ultra-premium";
}

function getPriceTierLabel(tier: string): string {
  switch (tier) {
    case "budget": return "Budget";
    case "mid-range": return "Mid-Range";
    case "flagship": return "Flagship";
    case "ultra-premium": return "Ultra Premium";
    default: return "Unknown";
  }
}

/**
 * Compute Spec IQ for a single phone.
 * Fetches all published phones' numeric specs and computes percentile rankings.
 */
export async function computeSpecIQ(phoneId: string): Promise<SpecIQSummary | null> {
  // Fetch the target phone
  const phone = await prisma.phone.findUnique({
    where: { id: phoneId },
    select: {
      id: true,
      name: true,
      priceUsd: true,
      specs: {
        include: { spec: { select: { key: true, name: true, unit: true } } },
      },
    },
  });

  if (!phone) return null;

  // Fetch all published phones with numeric specs
  const allPhones = await prisma.phone.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      priceUsd: true,
      specs: {
        where: { numericValue: { not: null } },
        select: {
          numericValue: true,
          spec: { select: { key: true } },
        },
      },
    },
  });

  const totalPhones = allPhones.length;
  if (totalPhones < 2) return null;

  // Build spec distributions: for each rankable spec, collect all values
  const specDistributions: Record<string, number[]> = {};
  for (const p of allPhones) {
    for (const ps of p.specs) {
      if (ps.numericValue !== null && RANKABLE_SPECS[ps.spec.key]) {
        if (!specDistributions[ps.spec.key]) {
          specDistributions[ps.spec.key] = [];
        }
        specDistributions[ps.spec.key].push(ps.numericValue);
      }
    }
  }

  // Sort distributions
  for (const key of Object.keys(specDistributions)) {
    specDistributions[key].sort((a, b) => a - b);
  }

  // Compute percentiles for target phone
  const badges: SpecIQBadge[] = [];

  for (const ps of phone.specs) {
    const config = RANKABLE_SPECS[ps.spec.key];
    if (!config) continue;

    const phoneSpec = allPhones
      .find((p) => p.id === phone.id)
      ?.specs.find((s) => s.spec.key === ps.spec.key);

    if (!phoneSpec?.numericValue) continue;

    const distribution = specDistributions[ps.spec.key];
    if (!distribution || distribution.length < 2) continue;

    const value = phoneSpec.numericValue;

    // Calculate percentile using rank method
    const belowCount = distribution.filter((v) =>
      config.direction === "higher" ? v < value : v > value
    ).length;
    const equalCount = distribution.filter((v) => v === value).length;
    
    // Percentile = (below + 0.5 * equal) / total * 100
    const percentile = Math.round(
      ((belowCount + 0.5 * equalCount) / distribution.length) * 100
    );

    // Rank (1 = best)
    const sortedForRank = [...distribution].sort((a, b) =>
      config.direction === "higher" ? b - a : a - b
    );
    const rank = sortedForRank.indexOf(value) + 1;

    const tier = getTier(percentile);
    const badge =
      percentile >= 75
        ? `Better than ${percentile}% of phones in ${config.badgeTemplate}`
        : percentile >= 50
          ? `Above average ${config.badgeTemplate}`
          : `${config.badgeTemplate}`;

    badges.push({
      specKey: ps.spec.key,
      specName: ps.spec.name,
      category: config.category,
      value,
      unit: ps.spec.unit || "",
      percentile,
      rank,
      totalPhones: distribution.length,
      badge,
      tier,
      icon: config.icon,
    });
  }

  // Sort badges by percentile descending
  badges.sort((a, b) => b.percentile - a.percentile);

  // Overall score = weighted average of all percentiles
  const overallScore = badges.length > 0
    ? Math.round(badges.reduce((sum, b) => sum + b.percentile, 0) / badges.length)
    : 0;

  const overallTier = getTier(overallScore);
  const priceTier = getPriceTier(phone.priceUsd);

  // Value score: how good is the phone relative to its price tier?
  // Compare overall score to expected score for price tier
  const expectedScore: Record<string, number> = {
    budget: 30,
    "mid-range": 50,
    flagship: 70,
    "ultra-premium": 85,
    unknown: 50,
  };
  const expected = expectedScore[priceTier] || 50;
  const valueScore = Math.min(100, Math.round(overallScore + (overallScore - expected) * 0.5));

  return {
    overallScore,
    tier: overallTier,
    tierLabel: getTierLabel(overallTier),
    badges,
    topStrengths: badges.slice(0, 3),
    priceTier: getPriceTierLabel(priceTier),
    valueScore: Math.max(0, valueScore),
  };
}

/**
 * Compute Spec IQ for multiple phones at once (batch operation).
 * More efficient than calling computeSpecIQ for each phone individually.
 */
export async function computeBatchSpecIQ(phoneIds: string[]): Promise<Record<string, SpecIQSummary>> {
  // Fetch all published phones with numeric specs (one query)
  const allPhones = await prisma.phone.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      name: true,
      priceUsd: true,
      specs: {
        include: { spec: { select: { key: true, name: true, unit: true } } },
      },
    },
  });

  const totalPhones = allPhones.length;
  if (totalPhones < 2) return {};

  // Build spec distributions
  const specDistributions: Record<string, number[]> = {};
  for (const p of allPhones) {
    for (const ps of p.specs) {
      if (ps.numericValue !== null && RANKABLE_SPECS[ps.spec.key]) {
        if (!specDistributions[ps.spec.key]) {
          specDistributions[ps.spec.key] = [];
        }
        specDistributions[ps.spec.key].push(ps.numericValue);
      }
    }
  }
  for (const key of Object.keys(specDistributions)) {
    specDistributions[key].sort((a, b) => a - b);
  }

  const results: Record<string, SpecIQSummary> = {};

  for (const phoneId of phoneIds) {
    const phone = allPhones.find((p) => p.id === phoneId);
    if (!phone) continue;

    const badges: SpecIQBadge[] = [];

    for (const ps of phone.specs) {
      const config = RANKABLE_SPECS[ps.spec.key];
      if (!config || ps.numericValue === null) continue;

      const distribution = specDistributions[ps.spec.key];
      if (!distribution || distribution.length < 2) continue;

      const value = ps.numericValue;
      const belowCount = distribution.filter((v) =>
        config.direction === "higher" ? v < value : v > value
      ).length;
      const equalCount = distribution.filter((v) => v === value).length;
      const percentile = Math.round(
        ((belowCount + 0.5 * equalCount) / distribution.length) * 100
      );

      const sortedForRank = [...distribution].sort((a, b) =>
        config.direction === "higher" ? b - a : a - b
      );
      const rank = sortedForRank.indexOf(value) + 1;
      const tier = getTier(percentile);
      const badge =
        percentile >= 75
          ? `Better than ${percentile}% of phones in ${config.badgeTemplate}`
          : percentile >= 50
            ? `Above average ${config.badgeTemplate}`
            : `${config.badgeTemplate}`;

      badges.push({
        specKey: ps.spec.key,
        specName: ps.spec.name,
        category: config.category,
        value,
        unit: ps.spec.unit || "",
        percentile,
        rank,
        totalPhones: distribution.length,
        badge,
        tier,
        icon: config.icon,
      });
    }

    badges.sort((a, b) => b.percentile - a.percentile);

    const overallScore = badges.length > 0
      ? Math.round(badges.reduce((sum, b) => sum + b.percentile, 0) / badges.length)
      : 0;

    const overallTier = getTier(overallScore);
    const priceTier = getPriceTier(phone.priceUsd);
    const expected = ({ budget: 30, "mid-range": 50, flagship: 70, "ultra-premium": 85, unknown: 50 } as Record<string, number>)[priceTier.toLowerCase().replace(" ", "-")] || 50;
    const valueScore = Math.min(100, Math.max(0, Math.round(overallScore + (overallScore - expected) * 0.5)));

    results[phoneId] = {
      overallScore,
      tier: overallTier,
      tierLabel: getTierLabel(overallTier),
      badges,
      topStrengths: badges.slice(0, 3),
      priceTier: getPriceTierLabel(priceTier),
      valueScore,
    };
  }

  return results;
}

export { RANKABLE_SPECS, getPriceTier, getPriceTierLabel };
