import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

// Dynamic locale detection - fetches from API at build/runtime
const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
const locales = (process.env.NEXT_PUBLIC_LOCALES || 'en,ar').split(',');

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|woff2?|ttf|otf|eot|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Apply admin path protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const loginPath = process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || '/admin-login';
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
