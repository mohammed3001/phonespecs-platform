import { z } from "zod";

// ==================== Phone Schemas ====================

export const createPhoneSchema = z.object({
  name: z.string().min(1, "Phone name is required").max(255),
  brandId: z.string().min(1, "Brand is required"),
  marketStatus: z.enum(["available", "coming_soon", "discontinued"]).default("available"),
  releaseDate: z.string().nullable().optional(),
  priceUsd: z.union([z.number().positive(), z.string().transform(v => parseFloat(v))]).nullable().optional(),
  priceDisplay: z.string().max(100).nullable().optional(),
  overview: z.string().max(5000).nullable().optional(),
  mainImage: z.string().max(500).nullable().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  specs: z.array(z.object({
    specId: z.string().min(1),
    value: z.string().min(1),
    numericValue: z.number().nullable().optional(),
  })).optional(),
});

export const updatePhoneSchema = createPhoneSchema.partial().extend({
  id: z.string().min(1),
});

// ==================== Brand Schemas ====================

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  logo: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
});

// ==================== Article Schemas ====================

export const createArticleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: z.string().min(1).max(500).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(1000).nullable().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().max(500).nullable().optional(),
  type: z.enum(["news", "review", "guide", "comparison"]).default("news"),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  categoryId: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  scheduledAt: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  phoneIds: z.array(z.string()).optional(),
});

// ==================== Campaign Schemas ====================

export const createCampaignSchema = z.object({
  advertiserId: z.string().min(1, "Advertiser is required"),
  name: z.string().min(1, "Campaign name is required").max(255),
  type: z.enum(["banner", "sponsored_product", "native", "brand_spotlight"]).default("banner"),
  pricingModel: z.enum(["cpm", "cpc", "flat"]).default("cpm"),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
  budgetTotal: z.number().positive().nullable().optional(),
  budgetDaily: z.number().positive().nullable().optional(),
  bidAmount: z.number().positive().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  priority: z.number().int().min(0).max(100).default(0),
  frequencyCap: z.number().int().positive().nullable().optional(),
  targeting: z.string().nullable().optional(), // JSON string
});

// ==================== Settings Schemas ====================

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  group: z.string().max(50).default("general"),
});

// ==================== Query Param Schemas ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const phoneQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  status: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name", "rating", "popular"]).default("newest"),
});

// ==================== Utility ====================

export type CreatePhoneInput = z.infer<typeof createPhoneSchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type PhoneQuery = z.infer<typeof phoneQuerySchema>;
