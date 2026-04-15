/**
 * Returns the canonical site URL for SEO, sitemap, robots, and metadata.
 * Uses NEXT_PUBLIC_SITE_URL (public pages) > NEXTAUTH_URL (auth) > fallback.
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
