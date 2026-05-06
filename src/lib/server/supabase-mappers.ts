import {
  createEmptyReactionCounts,
  isReactionType,
  isSlopType,
  type ReactionCounts,
  type Slop,
} from "@/lib/domain/slop";

export type SlopRow = {
  id: string;
  slug: string;
  url: string;
  title: string | null;
  tagline: string | null;
  screenshot_url: string | null;
  type: string | null;
  slopper_handle: string | null;
  email: string | null;
  manage_token: string | null;
  reslop_used: boolean | null;
  created_at: string | null;
  deleted_at: string | null;
};

export type ReactionRow = {
  slop_id: string;
  reaction_type: string | null;
};

export type SlopInsert = {
  id: string;
  slug: string;
  url: string;
  title: string;
  tagline: string;
  screenshot_url?: string;
  type: string;
  slopper_handle?: string;
  email?: string;
  manage_token?: string;
  reslop_used: boolean;
  created_at: string;
};

export function toSlop(row: SlopRow, reactions: ReactionRow[] = []): Slop {
  return {
    id: row.id,
    slug: row.slug,
    url: row.url,
    title: row.title ?? "Untitled Slop",
    tagline: row.tagline ?? "No tagline generated yet",
    screenshotUrl: row.screenshot_url ?? undefined,
    type: row.type && isSlopType(row.type) ? row.type : "demo",
    slopperHandle: row.slopper_handle ?? undefined,
    email: row.email ?? undefined,
    manageToken: row.manage_token ?? undefined,
    reslopUsed: row.reslop_used ?? false,
    founding: false,
    createdAt: row.created_at ?? new Date(0).toISOString(),
    deletedAt: row.deleted_at ?? undefined,
    reactionCounts: countReactions(row.id, reactions),
  };
}

export function toSlopInsert(slop: Slop): SlopInsert {
  return {
    id: slop.id,
    slug: slop.slug,
    url: slop.url,
    title: slop.title,
    tagline: slop.tagline,
    screenshot_url: slop.screenshotUrl,
    type: slop.type,
    slopper_handle: slop.slopperHandle,
    email: slop.email,
    manage_token: slop.manageToken,
    reslop_used: slop.reslopUsed,
    created_at: slop.createdAt,
  };
}

export function countReactions(slopId: string, reactions: ReactionRow[]): ReactionCounts {
  return reactions.reduce((counts, reaction) => {
    if (reaction.slop_id === slopId && reaction.reaction_type && isReactionType(reaction.reaction_type)) {
      counts[reaction.reaction_type] += 1;
    }

    return counts;
  }, createEmptyReactionCounts());
}
