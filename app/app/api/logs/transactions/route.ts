import { NextResponse } from "next/server";

export async function GET() {
  const logServer = process.env.NEXT_PUBLIC_LOG_SERVER_URL;

  // If log server URL is localhost, don't try to fetch on Vercel
  if (!logServer || logServer.includes("localhost")) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(`${logServer}/transactions`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}