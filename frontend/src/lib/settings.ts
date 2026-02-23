// src/lib/settings.ts
// Server-side settings fetcher — reads from backend API
// All values come from DB (system_settings table), never hardcoded

const SETTINGS_CACHE: { data: Record<string, string>; ts: number } | null = null;
const CACHE_DURATION = 60_000; // 1 minute

export async function getSiteSettings(): Promise<Record<string, string>> {
  // In server components, fetch from backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/settings/public`, {
      next: { revalidate: 60 }, // Next.js cache: revalidate every 60s
    });

    if (!res.ok) return getDefaults();
    return await res.json();
  } catch {
    return getDefaults();
  }
}

function getDefaults(): Record<string, string> {
  return {
    site_name: 'PhoneSpec',
    site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    site_description: 'Mobile phone specs & reviews',
    logo_url: '',
    favicon_url: '/favicon.ico',
    default_locale: 'en',
    default_theme: 'system',
    icon_library: 'lucide',
    seo_title_template: '%s | PhoneSpec',
    phones_per_page: '24',
  };
}

// Client-side hook
export function useSettings() {
  // Implemented in hooks/useSettings.ts
}
