import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const YIELD_BLOCKED_COUNTRIES = ["US"];

export function middleware(request: NextRequest) {
  const country = request.headers.get("cf-ipcountry") ??
                  request.headers.get("x-vercel-ip-country") ?? "";

  const isYieldPage = request.nextUrl.pathname.startsWith("/vault");

  if (YIELD_BLOCKED_COUNTRIES.includes(country) && isYieldPage) {
    // Don't block the page — just set a header the frontend reads
    const response = NextResponse.next();
    response.headers.set("x-yield-restricted", "true");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vault/:path*"],
};