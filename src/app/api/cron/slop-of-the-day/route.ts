import { type NextRequest, NextResponse } from "next/server";
import { isDateKey, previousUtcDateKey } from "@/lib/domain/slop-of-the-day";
import { calculateSlopOfTheDay } from "@/lib/server/slop-service";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") ?? previousUtcDateKey();
  if (!isDateKey(date)) {
    return NextResponse.json({ error: "Use a YYYY-MM-DD UTC date." }, { status: 400 });
  }

  const winner = await calculateSlopOfTheDay(date);
  return NextResponse.json({
    date,
    winner: winner
      ? {
          slug: winner.slop.slug,
          title: winner.slop.title,
          totalReactions: winner.totalReactions,
        }
      : null,
  });
}
