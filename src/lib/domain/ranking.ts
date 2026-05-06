import type { Slop } from "@/lib/domain/slop";
import { totalReactions } from "@/lib/domain/slop";

export const FEED_WINDOWS = ["today", "yesterday", "week", "all-time"] as const;
export type FeedWindow = (typeof FEED_WINDOWS)[number];

export function parseFeedWindow(value?: string | string[]): FeedWindow {
  const candidate = Array.isArray(value) ? value[0] : value;
  return FEED_WINDOWS.includes(candidate as FeedWindow)
    ? (candidate as FeedWindow)
    : "today";
}

export function rankSlops(slops: Slop[], window: FeedWindow, now = new Date()): Slop[] {
  return slops
    .filter((slop) => !slop.deletedAt)
    .filter((slop) => isInFeedWindow(slop.createdAt, window, now))
    .toSorted((left, right) => {
      const reactionDelta = totalReactions(right) - totalReactions(left);
      if (reactionDelta !== 0) {
        return reactionDelta;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    });
}

export function isInFeedWindow(isoDate: string, window: FeedWindow, now = new Date()): boolean {
  if (window === "all-time") {
    return true;
  }

  const createdAt = Date.parse(isoDate);
  const todayStart = startOfUtcDay(now);
  const tomorrowStart = todayStart + dayMs;

  if (window === "today") {
    return createdAt >= todayStart && createdAt < tomorrowStart;
  }

  if (window === "yesterday") {
    return createdAt >= todayStart - dayMs && createdAt < todayStart;
  }

  return createdAt >= now.getTime() - 7 * dayMs && createdAt < tomorrowStart;
}

const dayMs = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
