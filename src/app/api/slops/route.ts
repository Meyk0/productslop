import { type NextRequest, NextResponse } from "next/server";
import { checkSubmissionRateLimit, verifyTurnstileToken } from "@/lib/server/abuse";
import { getClientIp } from "@/lib/server/request";
import { createSlopWithStatusFromUnknown } from "@/lib/server/slop-service";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkSubmissionRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Let the slop cool down.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429 },
      );
    }

    const body = await request.json();
    const turnstile = await verifyTurnstileToken({
      token: typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
      ip,
    });

    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.message }, { status: 403 });
    }

    const result = await createSlopWithStatusFromUnknown(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit slop." },
      { status: 400 },
    );
  }
}
