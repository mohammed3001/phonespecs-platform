export interface PhoneWithDetails {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  marketStatus: string;
  releaseDate: string | null;
  priceUsd: number | null;
  priceDisplay: string | null;
  overview: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  reviewScore: number;
  reviewCount: number;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  specs: {
    id: string;
    value: string;
    numericValue: number | null;
    spec: {
      id: string;
      name: string;
      key: string;
      icon: string | null;
      unit: string | null;
      showInCard: boolean;
      showInDetail: boolean;
      showInCompare: boolean;
      isHighlighted: boolean;
      group: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        sortOrder: number;
      };
      sortOrder: number;
    };
  }[];
  images: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }[];
  variants: {
    id: string;
    name: string;
    storage: string | null;
    ram: string | null;
    priceUsd: number | null;
    isDefault: boolean;
  }[];
  updatedAt: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  marketStatus?: string;
  specs?: Record<string, string>;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AdminSidebarItem {
  name: string;
  href: string;
  icon: string;
  children?: AdminSidebarItem[];
}

export interface SpecWithValue {
  name: string;
  key: string;
  value: string;
  icon: string | null;
  unit: string | null;
  group: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  socialLinks: Record<string, string>;
  analyticsId: string;
  contactEmail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
