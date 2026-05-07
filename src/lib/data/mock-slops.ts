import type { Slop } from "@/lib/domain/slop";
import { createEmptyReactionCounts } from "@/lib/domain/slop";

function counts(input: Partial<Slop["reactionCounts"]>): Slop["reactionCounts"] {
  return { ...createEmptyReactionCounts(), ...input };
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const seedSlops: Slop[] = [
  {
    id: "seed-standup-arcade",
    slug: "standup-arcade-order-picker",
    url: "https://www.standuparca.de",
    canonicalUrl: "https://www.standuparca.de",
    title: "Standup Arcade",
    tagline: "A retro slot machine that picks standup order before the meeting stalls",
    type: "game",
    slopperHandle: "@meyk0",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(0.5),
    reactionCounts: counts({
      "one-shotted": 102,
      "peak-slop": 96,
      "tokens-well-spent": 94,
      "load-bearing": 70,
    }),
  },
  {
    id: "seed-evalarena",
    slug: "evalarena-llm-evals",
    url: "https://evalarena.xyz",
    canonicalUrl: "https://evalarena.xyz",
    title: "EvalArena",
    tagline: "Practice LLM evals with real-world challenges and hidden tests",
    type: "tool",
    slopperHandle: "@meyk0",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(0.75),
    reactionCounts: counts({
      "tokens-well-spent": 128,
      "one-shotted": 77,
      "peak-slop": 77,
      "load-bearing": 62,
    }),
  },
];

export const retiredSeedSlugs = new Set([
  "kanwas-open-source-brain",
  "shadow-2-meeting-aftermath",
  "superset-agent-swarm",
  "paysh-api-wallet",
  "cursor-kart-vibe-racer",
  "deckspell-slide-cult",
]);
