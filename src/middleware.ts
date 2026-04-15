import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "mobileplatform-secret-key-change-in-production",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role
    if (token.role !== "admin" && token.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect company portal routes
  if (pathname.startsWith("/company") && pathname !== "/company") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "mobileplatform-secret-key-change-in-production",
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check company association
    if (!token.companyId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Add security headers to API responses
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/api/:path*",
  ],
};
