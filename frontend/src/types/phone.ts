// src/types/phone.ts

export interface PhoneKeySpecs {
  os?: string;
  storage?: string;
  ram?: string;
  mainCamera?: string;
  frontCamera?: string;
  display?: string;
  battery?: string;
  fingerprint?: string;
  charger?: string;
  resistanceRating?: string;
  wifi?: string;
  glassProtection?: string;
  bluetooth?: string;
}

export interface PhonePrice {
  amount: number;
  currency: string;
  label?: string;
}

export interface PhoneImage {
  id: string;
  url: string;
  thumbUrl?: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PhoneBrand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  description?: string;
  phoneCount?: number;
}

export interface PhoneSpecGroup {
  category: string;
  categorySlug: string;
  icon?: string;
  specs: PhoneSpecItem[];
}

export interface PhoneSpecItem {
  id: string;
  name: string;
  slug: string;
  value: string;
  displayValue?: string;
  unit?: string;
  isHighlight: boolean;
  isComparable: boolean;
}

export interface PhoneReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  pros: string[];
  cons: string[];
  verdict?: string;
  authorName?: string;
  publishedAt?: string;
}

export interface Phone {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brand: PhoneBrand;
  status: 'AVAILABLE' | 'UPCOMING' | 'DISCONTINUED';
  releaseDate?: string;
  price?: PhonePrice;
  priceUsd?: number;
  images: PhoneImage[];
  keySpecs: PhoneKeySpecs;
  specGroups: PhoneSpecGroup[];
  reviews: PhoneReview[];
  isSponsored?: boolean;
  isFeatured?: boolean;
  popularity: number;
  viewCount: number;
}

export interface SearchFilters {
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  ram?: string;
  storage?: string;
  battery?: string;
  camera?: string;
  display?: string;
  network?: string;
  status?: string;
  sortBy?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'popularity';
}

export interface SearchResult {
  phones: Phone[];
  total: number;
  page: number;
  pageSize: number;
  sponsored: Phone[];
}

export interface SponsoredAd {
  id: string;
  type: 'search_result' | 'sidebar' | 'banner' | 'brand_promotion';
  phone?: Phone;
  imageUrl?: string;
  title?: string;
  description?: string;
  targetUrl?: string;
  impressions: number;
  clicks: number;
}

export const SPEC_ICONS: Record<string, string> = {
  os: 'mdi:android',
  storage: 'mdi:harddisk',
  ram: 'mdi:memory',
  main_camera: 'mdi:camera-outline',
  mainCamera: 'mdi:camera-outline',
  front_camera: 'mdi:camera-front',
  frontCamera: 'mdi:camera-front',
  display: 'mdi:cellphone',
  battery: 'mdi:battery-high',
  fingerprint: 'mdi:fingerprint',
  charger: 'mdi:flash-outline',
  resistance_rating: 'mdi:shield-check-outline',
  resistanceRating: 'mdi:shield-check-outline',
  wifi: 'mdi:wifi',
  glass_protection: 'mdi:shield-outline',
  glassProtection: 'mdi:shield-outline',
  bluetooth: 'mdi:bluetooth',
  chipset: 'mdi:chip',
  cpu: 'mdi:cpu-64-bit',
  gpu: 'mdi:expansion-card',
  network: 'mdi:signal-4g',
  nfc: 'mdi:nfc',
  usb: 'mdi:usb',
  sensors: 'mdi:access-point',
  weight: 'mdi:weight',
  dimensions: 'mdi:ruler-square',
  sim: 'mdi:sim',
  price: 'mdi:tag-outline',
};
