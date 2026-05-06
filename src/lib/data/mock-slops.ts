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
    id: "seed-kanwas",
    slug: "kanwas-open-source-brain",
    url: "https://example.com/kanwas",
    title: "Kanwas",
    tagline: "An open-source brain for the team channel that never closes",
    type: "tool",
    slopperHandle: "@kanwas",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(1),
    reactionCounts: counts({
      "peak-slop": 84,
      "tokens-well-spent": 122,
      "load-bearing": 39,
      "one-shotted": 80,
    }),
  },
  {
    id: "seed-shadow",
    slug: "shadow-2-meeting-aftermath",
    url: "https://example.com/shadow",
    title: "Shadow 2.0",
    tagline: "The work your meetings create, done before the meeting ends",
    type: "wrapper",
    slopperHandle: "@shadowai",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(2),
    reactionCounts: counts({
      "em-dash-deluxe": 59,
      "tokens-well-spent": 106,
      absolutely: 51,
      "peak-slop": 89,
    }),
  },
  {
    id: "seed-superset",
    slug: "superset-agent-swarm",
    url: "https://example.com/superset",
    title: "Superset 2.0",
    tagline: "Run a hallway full of coding agents from one tired laptop",
    type: "tool",
    slopperHandle: "@superset",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(4),
    reactionCounts: counts({
      "peak-slop": 71,
      "one-shotted": 88,
      "tokens-well-spent": 93,
      delve: 36,
    }),
  },
  {
    id: "seed-paysh",
    slug: "paysh-api-wallet",
    url: "https://example.com/paysh",
    title: "pay.sh",
    tagline: "Discover, access, and pay for any API autonomously",
    type: "demo",
    slopperHandle: "@paysh",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(7),
    reactionCounts: counts({
      "load-bearing": 65,
      "tokens-well-spent": 76,
      "one-shotted": 42,
      absolutely: 48,
    }),
  },
  {
    id: "seed-cursor-kart",
    slug: "cursor-kart-vibe-racer",
    url: "https://example.com/cursor-kart",
    title: "Cursor Kart",
    tagline: "Mario Kart for people who think merge conflicts are lore",
    type: "game",
    slopperHandle: "@vibekart",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(27),
    reactionCounts: counts({
      "peak-slop": 109,
      "one-shotted": 72,
      "em-dash-deluxe": 31,
    }),
  },
  {
    id: "seed-deck-spell",
    slug: "deckspell-slide-cult",
    url: "https://example.com/deckspell",
    title: "DeckSpell",
    tagline: "Turns founder notes into decks that sound legally optimistic",
    type: "cursed",
    slopperHandle: "@deckspell",
    reslopUsed: false,
    founding: true,
    createdAt: hoursAgo(64),
    reactionCounts: counts({
      delve: 91,
      "load-bearing": 33,
      "em-dash-deluxe": 87,
    }),
  },
];
