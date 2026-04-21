"use client";

import { Icon } from "@/components/shared/Icon";

const specIconMap: Record<string, string> = {
  storage: "mdi:micro-sd",
  ram: "mdi:memory",
  main_camera: "mdi:camera",
  front_camera: "mdi:camera-front",
  display_size: "mdi:cellphone-screenshot",
  display_type: "mdi:monitor",
  resolution: "mdi:quality-high",
  refresh_rate: "mdi:monitor-shimmer",
  glass_protection: "mdi:shield-check",
  battery: "mdi:battery-high",
  charger: "mdi:flash",
  wireless_charging: "mdi:access-point",
  wifi: "mdi:wifi",
  bluetooth: "mdi:bluetooth",
  five_g: "mdi:signal-5g",
  nfc: "mdi:nfc",
  processor: "mdi:chip",
  os: "mdi:cellphone-cog",
  camera_features: "mdi:camera-enhance",
  fingerprint_sensor: "mdi:fingerprint",
  face_unlock: "mdi:face-recognition",
  resistance_rating: "mdi:water-check",
  dimensions: "mdi:ruler-square",
  weight: "mdi:scale-balance",
  colors: "mdi:palette",
};

// Group icons
const groupIconMap: Record<string, string> = {
  display: "mdi:cellphone-screenshot",
  camera: "mdi:camera",
  performance: "mdi:speedometer",
  battery: "mdi:battery-charging",
  connectivity: "mdi:access-point-network",
  design: "mdi:cellphone",
  security: "mdi:shield-lock",
};

export function SpecIcon({
  specKey,
  size = 18,
  className = "",
}: {
  specKey: string;
  size?: number;
  className?: string;
}) {
  const iconName = specIconMap[specKey] || "mdi:information-outline";
  return <Icon icon={iconName} width={size} height={size} className={className} />;
}

export function GroupIcon({
  groupSlug,
  size = 20,
  className = "",
}: {
  groupSlug: string;
  size?: number;
  className?: string;
}) {
  const iconName = groupIconMap[groupSlug] || "mdi:format-list-bulleted";
  return <Icon icon={iconName} width={size} height={size} className={className} />;
}

export function NavIcon({
  icon,
  size = 20,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  return <Icon icon={icon} width={size} height={size} className={className} />;
}

export { specIconMap, groupIconMap };
