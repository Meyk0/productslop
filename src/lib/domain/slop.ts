export const REACTION_TYPES = [
  { id: "peak-slop", label: "Peak Slop", vibe: "Highest meta-praise" },
  {
    id: "em-dash-deluxe",
    label: "Em Dash Deluxe",
    vibe: "Clearly AI-written, and somehow lovable",
  },
  {
    id: "tokens-well-spent",
    label: "Tokens Well Spent",
    vibe: "Sincere praise for a worthy build",
  },
  { id: "absolutely", label: "Absolutely!", vibe: "AI's enthusiasm tic, reclaimed" },
  {
    id: "load-bearing",
    label: "Load-Bearing",
    vibe: "One strange thing holds it together",
  },
  {
    id: "one-shotted",
    label: "One-Shotted",
    vibe: "Built in one glorious model session",
  },
  { id: "delve", label: "Delve", vibe: "The prose got a little too generated" },
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number]["id"];

export const SLOP_TYPES = [
  {
    id: "wrapper",
    label: "Wrapper",
    meaning: "GPT or Claude wrapper",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    cardClass: "border-sky-300 bg-sky-50",
    artClass: "from-sky-200 via-white to-slate-900",
  },
  {
    id: "tool",
    label: "Tool",
    meaning: "Actually useful",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cardClass: "border-emerald-300 bg-emerald-50",
    artClass: "from-emerald-200 via-white to-teal-800",
  },
  {
    id: "game",
    label: "Game",
    meaning: "Playable",
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    cardClass: "border-violet-300 bg-violet-50",
    artClass: "from-violet-200 via-white to-fuchsia-800",
  },
  {
    id: "cursed",
    label: "Cursed",
    meaning: "Works and should not",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
    cardClass: "border-rose-300 bg-rose-50",
    artClass: "from-rose-200 via-white to-zinc-950",
  },
  {
    id: "useless",
    label: "Useless",
    meaning: "Pure vibes, no function",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    cardClass: "border-amber-300 bg-amber-50",
    artClass: "from-amber-200 via-white to-orange-700",
  },
  {
    id: "demo",
    label: "Demo",
    meaning: "Clearly not a product",
    badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
    cardClass: "border-slate-300 bg-slate-50",
    artClass: "from-slate-200 via-white to-slate-700",
  },
] as const;

export type SlopType = (typeof SLOP_TYPES)[number]["id"];
export type ReactionCounts = Record<ReactionType, number>;

export type Slop = {
  id: string;
  slug: string;
  url: string;
  title: string;
  tagline: string;
  screenshotUrl?: string;
  type: SlopType;
  slopperHandle?: string;
  email?: string;
  manageToken?: string;
  reslopUsed: boolean;
  founding: boolean;
  createdAt: string;
  deletedAt?: string;
  reactionCounts: ReactionCounts;
};

export function createEmptyReactionCounts(): ReactionCounts {
  return REACTION_TYPES.reduce((counts, reaction) => {
    counts[reaction.id] = 0;
    return counts;
  }, {} as ReactionCounts);
}

export function isReactionType(value: string): value is ReactionType {
  return REACTION_TYPES.some((reaction) => reaction.id === value);
}

export function isSlopType(value: string): value is SlopType {
  return SLOP_TYPES.some((type) => type.id === value);
}

export function getSlopTypeMeta(type: SlopType) {
  return SLOP_TYPES.find((candidate) => candidate.id === type) ?? SLOP_TYPES[5];
}

export function totalReactions(slop: Pick<Slop, "reactionCounts">): number {
  return Object.values(slop.reactionCounts).reduce((sum, count) => sum + count, 0);
}

export function topReaction(slop: Pick<Slop, "reactionCounts">): ReactionType {
  let winner: ReactionType = REACTION_TYPES[0].id;

  for (const reaction of REACTION_TYPES) {
    if (slop.reactionCounts[reaction.id] > slop.reactionCounts[winner]) {
      winner = reaction.id;
    }
  }

  return winner;
}

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createSlug(title: string, uniquePart: string): string {
  const base = slugifyTitle(title) || "slop";
  const suffix = uniquePart.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6);
  return suffix ? `${base}-${suffix}` : base;
}
