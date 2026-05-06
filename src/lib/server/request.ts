import "server-only";

import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "127.0.0.1";
}
