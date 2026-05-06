import type { Slop } from "@/lib/domain/slop";
import { totalReactions } from "@/lib/domain/slop";

export type SlopOfTheDaySelection = {
  date: string;
  slop: Slop;
  totalReactions: number;
};

const dayMs = 24 * 60 * 60 * 1000;
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function previousUtcDateKey(now = new Date()): string {
  return toUtcDateKey(new Date(startOfUtcDay(now) - dayMs));
}

export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isDateKey(value: string): boolean {
  return dateKeyPattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));
}

export function selectSlopOfTheDay(
  slops: Slop[],
  dateKey: string,
): SlopOfTheDaySelection | null {
  if (!isDateKey(dateKey)) {
    throw new Error("Use a YYYY-MM-DD UTC date.");
  }

  const start = Date.parse(`${dateKey}T00:00:00.000Z`);
  const end = start + dayMs;
  const winner = slops
    .filter((slop) => !slop.deletedAt)
    .filter((slop) => {
      const createdAt = Date.parse(slop.createdAt);
      return createdAt >= start && createdAt < end;
    })
    .toSorted((left, right) => {
      const reactionDelta = totalReactions(right) - totalReactions(left);
      if (reactionDelta !== 0) {
        return reactionDelta;
      }

      return Date.parse(right.createdAt) - Date.parse(left.createdAt);
    })[0];

  if (!winner) {
    return null;
  }

  return {
    date: dateKey,
    slop: winner,
    totalReactions: totalReactions(winner),
  };
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
