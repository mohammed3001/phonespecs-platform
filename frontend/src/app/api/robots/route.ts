// src/app/api/robots/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/seo/robots`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return fallbackRobots();
    }

    const txt = await res.text();
    return new NextResponse(txt, {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return fallbackRobots();
  }
}

function fallbackRobots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';
  return new NextResponse(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${siteUrl}/sitemap.xml`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
}
