
import { NextResponse } from "next/server";

const LOG_SERVER = process.env.NEXT_PUBLIC_LOG_SERVER_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${LOG_SERVER}/runs`, {
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
