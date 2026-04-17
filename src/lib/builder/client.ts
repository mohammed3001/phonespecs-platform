// =============================================================================
// Builder.io Client Configuration
// =============================================================================

/**
 * Builder.io API key — must be set in .env as NEXT_PUBLIC_BUILDER_API_KEY
 */
export const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY ?? '';

/**
 * Builder.io model name for pages built with the Visual Editor
 */
export const BUILDER_PAGE_MODEL = 'page';

/**
 * Check if Builder.io is configured
 */
export function isBuilderConfigured(): boolean {
  return BUILDER_API_KEY.length > 0;
}
