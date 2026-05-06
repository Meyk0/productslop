import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { checkReactionRateLimit, verifyTurnstileToken } from "@/lib/server/abuse";
import { getClientIp } from "@/lib/server/request";
import { recordReaction } from "@/lib/server/slop-service";

const sessionCookie = "ps_session";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkReactionRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many reactions. Give the menu a minute.", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      slug?: string;
      reactionType?: string;
      turnstileToken?: string;
    };

    if (!body.slug || !body.reactionType) {
      return NextResponse.json({ error: "Missing reaction payload." }, { status: 400 });
    }

    const existingSessionId = request.cookies.get(sessionCookie)?.value;
    const turnstile = existingSessionId
      ? ({ ok: true, skipped: true } as const)
      : await verifyTurnstileToken({
          token: body.turnstileToken,
          ip,
        });

    if (!turnstile.ok) {
      return NextResponse.json({ error: turnstile.message }, { status: 403 });
    }

    const sessionId = existingSessionId ?? nanoid(32);
    const result = await recordReaction({
      slug: body.slug,
      reactionType: body.reactionType,
      sessionId,
    });

    const response = NextResponse.json(result);
    if (!existingSessionId) {
      response.cookies.set(sessionCookie, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to react." },
      { status: 400 },
    );
  }
}
