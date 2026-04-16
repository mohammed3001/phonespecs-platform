import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

async function rateLimitedHandler(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  // Only rate-limit POST requests (login attempts)
  if (req.method === "POST") {
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(`auth:${clientId}`, { maxRequests: 10, windowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      );
    }
  }
  return handler(req, ctx);
}

export { rateLimitedHandler as GET, rateLimitedHandler as POST };
