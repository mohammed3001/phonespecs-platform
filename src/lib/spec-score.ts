/**
 * Spec Score Calculation System
 * 
 * Calculates a percentage-based spec score for phones based on their specifications.
 * Scores are computed per category and overall, similar to mobiledokan.com's scoring.
 * 
 * Scoring methodology:
 * - Each spec category (Display, Camera, Battery, etc.) gets a sub-score (0-10)
 * - Overall score is weighted average of category scores (0-100%)
 * - Scores are derived from numeric spec values compared against known benchmarks
 */

interface SpecValue {
  key: string;
  value: string;
  numericValue: number | null;
  group: { slug: string };
}

// Benchmark ranges for scoring (min = 0 score, max = 10 score)
const BENCHMARKS: Record<string, { min: number; max: number; higherIsBetter: boolean }> = {
  // Display
  display_size: { min: 5.0, max: 7.0, higherIsBetter: true },
  display_ppi: { min: 200, max: 600, higherIsBetter: true },
  display_refresh_rate: { min: 60, max: 144, higherIsBetter: true },
  // Camera
  cam_pri_resolution: { min: 8, max: 200, higherIsBetter: true },
  cam_sel_resolution: { min: 5, max: 50, higherIsBetter: true },
  // Battery
  bat_capacity: { min: 3000, max: 7000, higherIsBetter: true },
  // Memory
  mem_ram: { min: 2, max: 16, higherIsBetter: true },
  mem_storage: { min: 32, max: 512, higherIsBetter: true },
  // Design (lower is better for weight/thickness)
  design_weight: { min: 140, max: 250, higherIsBetter: false },
  design_thickness: { min: 6.5, max: 12, higherIsBetter: false },
  // Hardware
  hw_cpu_cores: { min: 4, max: 8, higherIsBetter: true },
};

// Text-based scoring rules
const TEXT_SCORES: Record<string, Record<string, number>> = {
  display_type: {
    "AMOLED": 10, "Dynamic AMOLED": 10, "Dynamic AMOLED 2X": 10, "Super AMOLED": 10,
    "LTPO AMOLED": 10, "OLED": 9, "IPS LCD": 7, "TFT LCD": 5, "LCD": 5, "TN": 3,
  },
  hw_fabrication: {
    "3 nm": 10, "4 nm": 9, "5 nm": 8, "6 nm": 7, "7 nm": 6, "8 nm": 5, "10 nm": 4, "12 nm": 3, "14 nm": 2,
  },
  net_network: {
    "5G": 10, "4G": 7, "3G": 4, "2G": 2,
  },
  design_ip_rating: {
    "IP68": 10, "IP67": 9, "IP65": 7, "IP64": 6, "IP54": 5, "IP53": 4,
  },
  mem_storage_type: {
    "UFS 4.0": 10, "UFS 3.1": 8, "UFS 3.0": 7, "UFS 2.2": 6, "UFS 2.1": 5, "eMMC 5.1": 3,
  },
};

// Category weights for overall score
const CATEGORY_WEIGHTS: Record<string, number> = {
  "hardware-software": 20,
  "display": 20,
  "cameras": 20,
  "battery": 15,
  "memory": 15,
  "design": 5,
  "network-connectivity": 5,
};

function scoreNumeric(key: string, value: number): number {
  const benchmark = BENCHMARKS[key];
  if (!benchmark) return -1;

  const { min, max, higherIsBetter } = benchmark;
  let normalized: number;

  if (higherIsBetter) {
    normalized = (value - min) / (max - min);
  } else {
    normalized = (max - value) / (max - min);
  }

  return Math.max(0, Math.min(10, Math.round(normalized * 10)));
}

function scoreText(key: string, value: string): number {
  const rules = TEXT_SCORES[key];
  if (!rules) return -1;

  // Try exact match first
  if (rules[value] !== undefined) return rules[value];

  // Try partial match (e.g., "Dynamic AMOLED 2X" matches "AMOLED")
  const valueLower = value.toLowerCase();
  for (const [pattern, score] of Object.entries(rules)) {
    if (valueLower.includes(pattern.toLowerCase())) return score;
  }

  // For network, check for highest generation mentioned
  if (key === "net_network") {
    if (valueLower.includes("5g")) return 10;
    if (valueLower.includes("4g") || valueLower.includes("lte")) return 7;
    if (valueLower.includes("3g")) return 4;
    return 2;
  }

  return 5; // Default middle score for unrecognized values
}

export interface CategoryScore {
  slug: string;
  name: string;
  score: number; // 0-10
  specCount: number;
}

export interface SpecScoreResult {
  overall: number; // 0-100 percentage
  categories: CategoryScore[];
}

export function calculateSpecScore(specs: SpecValue[]): SpecScoreResult {
  // Group specs by category
  const categoryScores: Record<string, { scores: number[]; name: string }> = {};

  for (const spec of specs) {
    const groupSlug = spec.group.slug;
    if (!categoryScores[groupSlug]) {
      categoryScores[groupSlug] = { scores: [], name: groupSlug };
    }

    let score = -1;

    // Try numeric scoring first
    if (spec.numericValue !== null) {
      score = scoreNumeric(spec.key, spec.numericValue);
    }

    // Try text-based scoring if no numeric score
    if (score === -1) {
      score = scoreText(spec.key, spec.value);
    }

    if (score >= 0) {
      categoryScores[groupSlug].scores.push(score);
    }
  }

  // Calculate category averages
  const categories: CategoryScore[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  const categoryNames: Record<string, string> = {
    "general": "General",
    "hardware-software": "Hardware & Software",
    "display": "Display",
    "cameras": "Cameras",
    "design": "Design",
    "battery": "Battery",
    "memory": "Memory",
    "network-connectivity": "Network",
    "sensors-security": "Sensors",
    "multimedia": "Multimedia",
    "more": "More",
  };

  for (const [slug, data] of Object.entries(categoryScores)) {
    if (data.scores.length === 0) continue;
    if (slug === "general" || slug === "more") continue; // Skip non-scorable categories

    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const rounded = Math.round(avg * 10) / 10;

    categories.push({
      slug,
      name: categoryNames[slug] || slug,
      score: rounded,
      specCount: data.scores.length,
    });

    const weight = CATEGORY_WEIGHTS[slug] || 5;
    weightedSum += rounded * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) : 0;

  // Sort categories by the standard order
  const categoryOrder = Object.keys(CATEGORY_WEIGHTS);
  categories.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.slug);
    const bi = categoryOrder.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return { overall, categories };
}

/**
 * Get the color class for a spec score percentage
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 ring-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:ring-emerald-500/20";
  if (score >= 60) return "text-teal-600 bg-teal-50 ring-teal-500/20 dark:text-teal-400 dark:bg-teal-500/10 dark:ring-teal-500/20";
  if (score >= 40) return "text-amber-600 bg-amber-50 ring-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:ring-amber-500/20";
  return "text-red-600 bg-red-50 ring-red-500/20 dark:text-red-400 dark:bg-red-500/10 dark:ring-red-500/20";
}

/**
 * Get simple color for category score (0-10)
 */
export function getCategoryScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 6) return "text-teal-600 dark:text-teal-400";
  if (score >= 4) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}
