/**
 * Spec Extraction Layer — Maps actual database spec keys to scoring categories.
 * 
 * This is the single source of truth for extracting numeric values from the
 * phone_specs table. All scoring systems (Spec IQ, Comparison, Decision Engine)
 * must use this layer instead of hardcoding spec keys.
 * 
 * Database spec keys follow the pattern: {section}_{field}
 * Examples: bat_capacity, cam_pri_resolution, mem_ram, display_size
 */

// ============================================================
// KEY MAPPING: DB spec key → scoring field name
// ============================================================

/**
 * Maps a logical scoring field to its actual database spec key.
 * This is the ONLY place where DB key names should be referenced.
 */
export const SPEC_KEY_MAP = {
  // Camera
  mainCameraMP: "cam_pri_resolution",
  frontCameraMP: "cam_sel_resolution",
  cameraZoom: "cam_pri_zoom",
  cameraFeatures: "cam_pri_features",
  cameraSetup: "cam_pri_setup",
  cameraAperture: "cam_pri_aperture",
  cameraVideo: "cam_pri_video",
  cameraFPS: "cam_pri_fps",
  cameraImgRes: "cam_pri_img_res",
  cameraModes: "cam_pri_modes",
  selfieSetup: "cam_sel_setup",
  selfieAperture: "cam_sel_aperture",

  // Battery
  batteryCapacity: "bat_capacity",
  chargingSpeed: "bat_quick_charging",
  batteryType: "bat_type",
  usbTypeC: "bat_usb_type_c",

  // Performance
  ram: "mem_ram",
  storage: "mem_storage",
  chipset: "hw_chipset",
  cpu: "hw_cpu",
  cpuCores: "hw_cpu_cores",
  fabrication: "hw_fabrication",
  gpu: "hw_gpu",
  architecture: "hw_architecture",

  // Display
  displaySize: "display_size",
  refreshRate: "display_refresh_rate",
  resolution: "display_resolution",
  ppi: "display_ppi",
  displayType: "display_type",
  screenToBodyRatio: "display_stb_ratio",
  displayProtection: "display_protection",

  // Design
  weight: "design_weight",
  thickness: "design_thickness",
  height: "design_height",
  width: "design_width",
  buildBack: "design_build_back",
  ipRating: "design_ip_rating",
  waterproof: "design_waterproof",

  // Network
  network: "net_network",
  bluetooth: "net_bluetooth",
  nfc: "net_nfc",
  wifi: "net_wlan",

  // General
  os: "hw_os",
  osVersion: "hw_os_version",
} as const;

// ============================================================
// EXTRACTION HELPERS
// ============================================================

export type SpecMap = Map<string, { value: string; numericValue: number | null }>;

/**
 * Build a SpecMap from phone specs array.
 */
export function buildSpecMap(
  specs: Array<{ value: string; numericValue: number | null; spec: { key: string; name: string; unit?: string | null } }>
): SpecMap {
  const map: SpecMap = new Map();
  for (const ps of specs) {
    map.set(ps.spec.key, { value: ps.value, numericValue: ps.numericValue });
  }
  return map;
}

/**
 * Get numeric value from spec map using logical field name.
 */
export function getNumeric(specMap: SpecMap, field: keyof typeof SPEC_KEY_MAP): number {
  const dbKey = SPEC_KEY_MAP[field];
  return specMap.get(dbKey)?.numericValue ?? 0;
}

/**
 * Get string value from spec map using logical field name.
 */
export function getString(specMap: SpecMap, field: keyof typeof SPEC_KEY_MAP): string {
  const dbKey = SPEC_KEY_MAP[field];
  return specMap.get(dbKey)?.value ?? "";
}

/**
 * Get raw numeric value by DB key directly (for spec distributions).
 */
export function getNumericByKey(specMap: SpecMap, dbKey: string): number | null {
  return specMap.get(dbKey)?.numericValue ?? null;
}

// ============================================================
// NORMALIZATION LAYER
// ============================================================

/**
 * Normalize a value to 0-1 range using min/max bounds.
 * Values outside range are clamped.
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Processor tier scoring based on chipset name.
 * Returns 0-100 score.
 */
export function getProcessorScore(chipset: string): number {
  const name = chipset.toLowerCase();
  
  // Tier 1: Latest flagships (90-100)
  if (name.includes("snapdragon 8 gen 3") || name.includes("a17 pro") || name.includes("dimensity 9300")) return 95;
  if (name.includes("snapdragon 8 gen 2") || name.includes("a16") || name.includes("dimensity 9200")) return 90;
  
  // Tier 2: Previous gen flagships (75-89)
  if (name.includes("snapdragon 8 gen 1") || name.includes("tensor g3") || name.includes("a15")) return 85;
  if (name.includes("snapdragon 8+") || name.includes("tensor g2") || name.includes("dimensity 9000")) return 80;
  if (name.includes("snapdragon 888") || name.includes("exynos 2200") || name.includes("tensor")) return 75;
  
  // Tier 3: Upper mid-range (55-74)
  if (name.includes("snapdragon 7") || name.includes("dimensity 8")) return 65;
  if (name.includes("snapdragon 6") || name.includes("dimensity 7")) return 55;
  
  // Tier 4: Mid-range (35-54)
  if (name.includes("snapdragon 4") || name.includes("dimensity 6") || name.includes("helio g99")) return 45;
  if (name.includes("dimensity") || name.includes("helio")) return 35;
  
  // Tier 5: Entry-level (15-34)
  if (name.includes("unisoc") || name.includes("mediatek")) return 25;
  
  return 15; // Unknown
}

/**
 * Display resolution tier scoring.
 * Returns 0-100 score.
 */
export function getResolutionScore(resolution: string): number {
  if (!resolution) return 0;
  const match = resolution.match(/(\d+)\s*x\s*(\d+)/);
  if (!match) {
    // Try to extract single number (width)
    const singleMatch = resolution.match(/(\d{3,4})/);
    if (singleMatch) {
      const px = parseInt(singleMatch[1]);
      if (px >= 3000) return 95; // QHD+ width
      if (px >= 2400) return 80; // FHD+
      if (px >= 1080) return 60; // HD+
      return 40;
    }
    return 0;
  }
  const pixels = parseInt(match[1]) * parseInt(match[2]);
  if (pixels > 4000000) return 100; // 4K+
  if (pixels > 3000000) return 90;  // QHD+
  if (pixels > 2000000) return 75;  // FHD+ 
  if (pixels > 1000000) return 55;  // HD+
  return 35;
}

/**
 * Count camera features from feature string.
 * Returns 0-100 score.
 */
export function getCameraFeaturesScore(features: string, modes: string, setup: string): number {
  if (!features && !modes && !setup) return 0;
  const combined = `${features} ${modes} ${setup}`.toLowerCase();
  
  const featureKeywords = [
    "ois", "optical", "night", "macro", "ultra-wide", "ultrawide",
    "telephoto", "periscope", "pro", "raw", "8k", "4k",
    "hdr", "ai", "portrait", "panorama", "scene", "time-lapse",
    "slow-motion", "super", "zoom", "autofocus", "pdaf", "laser",
    "dual pixel", "stabilization", "cinematic", "action",
  ];
  
  let matched = 0;
  for (const kw of featureKeywords) {
    if (combined.includes(kw)) matched++;
  }
  
  return Math.min(100, Math.round((matched / 10) * 100)); // 10+ features = 100
}

/**
 * Score wireless charging and charging ecosystem.
 * Returns 0-100 score.
 */
export function getChargingEcosystemScore(chargingStr: string): number {
  if (!chargingStr) return 0;
  const lower = chargingStr.toLowerCase();
  let score = 0;
  
  // Wired charging speed
  const wiredMatch = lower.match(/(\d+)\s*w/);
  if (wiredMatch) {
    const watts = parseInt(wiredMatch[1]);
    score += normalize(watts, 10, 120) * 50; // Up to 50 points for wired speed
  }
  
  // Wireless charging
  if (lower.includes("wireless")) {
    score += 25;
    const wirelessMatch = lower.match(/(\d+)\s*w\s*wireless/);
    if (wirelessMatch) {
      score += normalize(parseInt(wirelessMatch[1]), 5, 50) * 15;
    }
  }
  
  // Reverse charging
  if (lower.includes("reverse")) {
    score += 10;
  }
  
  return Math.min(100, Math.round(score));
}

// ============================================================
// CATEGORY SCORING
// ============================================================

export interface CategoryScore {
  score: number;  // 0-100
  details: string[];
  breakdown: Record<string, number>; // Individual component scores
}

/**
 * Compute camera category score from specs.
 */
export function scoreCameraCategory(specMap: SpecMap): CategoryScore {
  const mainMP = getNumeric(specMap, "mainCameraMP");
  const frontMP = getNumeric(specMap, "frontCameraMP");
  const zoom = getNumeric(specMap, "cameraZoom");
  const features = getString(specMap, "cameraFeatures");
  const modes = getString(specMap, "cameraModes");
  const setup = getString(specMap, "cameraSetup");
  const video = getString(specMap, "cameraVideo");
  
  const mainScore = normalize(mainMP, 8, 200) * 100;
  const frontScore = normalize(frontMP, 5, 50) * 100;
  const zoomScore = normalize(zoom, 1, 100) * 100;
  const featureScore = getCameraFeaturesScore(features, modes, setup);
  const videoScore = video.toLowerCase().includes("8k") ? 100 : 
                     video.toLowerCase().includes("4k") ? 70 : 
                     video.toLowerCase().includes("1080") ? 40 : 20;
  
  const breakdown: Record<string, number> = {
    mainCamera: Math.round(mainScore),
    frontCamera: Math.round(frontScore),
    zoom: Math.round(zoomScore),
    features: Math.round(featureScore),
    video: Math.round(videoScore),
  };
  
  // Weighted average
  const score = Math.round(
    mainScore * 0.30 +
    frontScore * 0.10 +
    zoomScore * 0.15 +
    featureScore * 0.25 +
    videoScore * 0.20
  );
  
  const details: string[] = [];
  if (mainMP > 0) details.push(`${mainMP}MP main camera`);
  if (frontMP > 0) details.push(`${frontMP}MP front camera`);
  if (zoom > 1) details.push(`${zoom}x zoom`);
  if (video) details.push(video);
  
  return { score: Math.min(100, score), details, breakdown };
}

/**
 * Compute battery category score from specs.
 */
export function scoreBatteryCategory(specMap: SpecMap): CategoryScore {
  const capacity = getNumeric(specMap, "batteryCapacity");
  const chargingSpeed = getNumeric(specMap, "chargingSpeed");
  const chargingStr = getString(specMap, "chargingSpeed");
  
  const capacityScore = normalize(capacity, 3000, 6000) * 100;
  const chargingScore = normalize(chargingSpeed, 10, 120) * 100;
  const ecosystemScore = getChargingEcosystemScore(chargingStr);
  
  const breakdown: Record<string, number> = {
    capacity: Math.round(capacityScore),
    chargingSpeed: Math.round(chargingScore),
    ecosystem: Math.round(ecosystemScore),
  };
  
  const score = Math.round(
    capacityScore * 0.45 +
    chargingScore * 0.30 +
    ecosystemScore * 0.25
  );
  
  const details: string[] = [];
  if (capacity > 0) details.push(`${capacity}mAh battery`);
  if (chargingSpeed > 0) details.push(`${chargingSpeed}W charging`);
  if (chargingStr.toLowerCase().includes("wireless")) details.push("Wireless charging");
  
  return { score: Math.min(100, score), details, breakdown };
}

/**
 * Compute performance category score from specs.
 */
export function scorePerformanceCategory(specMap: SpecMap): CategoryScore {
  const ram = getNumeric(specMap, "ram");
  const storage = getNumeric(specMap, "storage");
  const chipset = getString(specMap, "chipset");
  const fabrication = getNumeric(specMap, "fabrication");
  
  const ramScore = normalize(ram, 2, 16) * 100;
  const storageScore = normalize(storage, 32, 1024) * 100;
  const processorScore = getProcessorScore(chipset);
  const fabScore = fabrication > 0 ? normalize(fabrication, 3, 10) * 100 : 0;
  // Lower fabrication = better (invert)
  const fabScoreInv = fabrication > 0 ? (100 - fabScore) : 0;
  
  const breakdown: Record<string, number> = {
    ram: Math.round(ramScore),
    storage: Math.round(storageScore),
    processor: Math.round(processorScore),
    fabrication: Math.round(fabScoreInv),
  };
  
  const score = Math.round(
    ramScore * 0.25 +
    storageScore * 0.15 +
    processorScore * 0.45 +
    fabScoreInv * 0.15
  );
  
  const details: string[] = [];
  if (ram > 0) details.push(`${ram}GB RAM`);
  if (storage > 0) details.push(`${storage}GB storage`);
  if (chipset) details.push(chipset);
  if (fabrication > 0) details.push(`${fabrication}nm process`);
  
  return { score: Math.min(100, score), details, breakdown };
}

/**
 * Compute display category score from specs.
 */
export function scoreDisplayCategory(specMap: SpecMap): CategoryScore {
  const size = getNumeric(specMap, "displaySize");
  const refreshRate = getNumeric(specMap, "refreshRate");
  const resolution = getString(specMap, "resolution");
  const ppi = getNumeric(specMap, "ppi");
  const displayType = getString(specMap, "displayType");
  
  const sizeScore = normalize(size, 5.0, 7.0) * 100;
  const refreshScore = normalize(refreshRate || 60, 60, 165) * 100;
  const resScore = getResolutionScore(resolution);
  const ppiScore = normalize(ppi, 200, 600) * 100;
  
  // Display type scoring
  const typeStr = displayType.toLowerCase();
  const typeScore = typeStr.includes("ltpo") ? 100 :
                    typeStr.includes("amoled") || typeStr.includes("oled") ? 85 :
                    typeStr.includes("ips") ? 50 :
                    typeStr.includes("lcd") ? 35 : 25;
  
  const breakdown: Record<string, number> = {
    size: Math.round(sizeScore),
    refreshRate: Math.round(refreshScore),
    resolution: Math.round(resScore),
    ppi: Math.round(ppiScore),
    displayType: Math.round(typeScore),
  };
  
  const score = Math.round(
    sizeScore * 0.10 +
    refreshScore * 0.25 +
    resScore * 0.20 +
    ppiScore * 0.15 +
    typeScore * 0.30
  );
  
  const details: string[] = [];
  if (size > 0) details.push(`${size}" display`);
  if (refreshRate > 0) details.push(`${refreshRate}Hz`);
  if (displayType) details.push(displayType);
  if (ppi > 0) details.push(`${ppi} PPI`);
  
  return { score: Math.min(100, score), details, breakdown };
}

/**
 * Compute design category score from specs.
 */
export function scoreDesignCategory(specMap: SpecMap): CategoryScore {
  const weight = getNumeric(specMap, "weight");
  const thickness = getNumeric(specMap, "thickness");
  const stbRatio = getNumeric(specMap, "screenToBodyRatio");
  const ipRating = getString(specMap, "ipRating");
  const waterproof = getString(specMap, "waterproof");
  const buildBack = getString(specMap, "buildBack");
  
  // Lower weight is better (invert)
  const weightScore = weight > 0 ? (1 - normalize(weight, 130, 250)) * 100 : 50;
  // Lower thickness is better (invert)
  const thicknessScore = thickness > 0 ? (1 - normalize(thickness, 6, 12)) * 100 : 50;
  // Higher screen-to-body is better
  const stbScore = stbRatio > 0 ? normalize(stbRatio, 75, 95) * 100 : 50;
  
  // IP rating scoring
  const ipStr = `${ipRating} ${waterproof}`.toLowerCase();
  const ipScore = ipStr.includes("ip68") ? 100 :
                  ipStr.includes("ip67") ? 80 :
                  ipStr.includes("ip65") || ipStr.includes("ip64") ? 60 :
                  ipStr.includes("ip5") ? 40 :
                  ipStr.includes("splash") ? 20 : 0;
  
  // Build quality
  const buildStr = buildBack.toLowerCase();
  const buildScore = buildStr.includes("ceramic") || buildStr.includes("titanium") ? 100 :
                     buildStr.includes("glass") && buildStr.includes("gorilla") ? 85 :
                     buildStr.includes("glass") ? 75 :
                     buildStr.includes("metal") || buildStr.includes("aluminum") ? 65 :
                     buildStr.includes("vegan") || buildStr.includes("leather") ? 55 :
                     buildStr.includes("plastic") ? 30 : 40;
  
  const breakdown: Record<string, number> = {
    weight: Math.round(weightScore),
    thickness: Math.round(thicknessScore),
    screenToBody: Math.round(stbScore),
    ipRating: Math.round(ipScore),
    build: Math.round(buildScore),
  };
  
  const score = Math.round(
    weightScore * 0.20 +
    thicknessScore * 0.15 +
    stbScore * 0.15 +
    ipScore * 0.25 +
    buildScore * 0.25
  );
  
  const details: string[] = [];
  if (weight > 0) details.push(`${weight}g`);
  if (thickness > 0) details.push(`${thickness}mm thick`);
  if (ipRating || waterproof) details.push(ipRating || waterproof);
  if (buildBack) details.push(buildBack);
  
  return { score: Math.min(100, score), details, breakdown };
}

/**
 * Compute all category scores for a phone.
 */
export function scoreAllCategories(specMap: SpecMap): Record<string, CategoryScore> {
  return {
    camera: scoreCameraCategory(specMap),
    battery: scoreBatteryCategory(specMap),
    performance: scorePerformanceCategory(specMap),
    display: scoreDisplayCategory(specMap),
    design: scoreDesignCategory(specMap),
  };
}
