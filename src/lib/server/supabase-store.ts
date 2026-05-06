import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactionCounts, Slop } from "@/lib/domain/slop";
import {
  countReactions,
  toSlop,
  toSlopInsert,
  type ReactionRow,
  type SlopRow,
} from "@/lib/server/supabase-mappers";

export async function listSlopsFromSupabase(client: SupabaseClient): Promise<Slop[]> {
  const { data: rows, error } = await client
    .from("slop")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const slopRows = (rows ?? []) as SlopRow[];
  const reactionRows = await listReactionRows(client, slopRows.map((row) => row.id));

  return slopRows.map((row) => toSlop(row, reactionRows));
}

export async function getSlopBySlugFromSupabase(
  client: SupabaseClient,
  slug: string,
): Promise<Slop | undefined> {
  const { data: row, error } = await client
    .from("slop")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!row) {
    return undefined;
  }

  const slopRow = row as SlopRow;
  const reactionRows = await listReactionRows(client, [slopRow.id]);
  return toSlop(slopRow, reactionRows);
}

export async function getSlopByManageTokenFromSupabase(
  client: SupabaseClient,
  token: string,
): Promise<Slop | undefined> {
  const { data: row, error } = await client
    .from("slop")
    .select("*")
    .eq("manage_token", token)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!row) {
    return undefined;
  }

  const slopRow = row as SlopRow;
  const reactionRows = await listReactionRows(client, [slopRow.id]);
  return toSlop(slopRow, reactionRows);
}

export async function insertSlopIntoSupabase(
  client: SupabaseClient,
  slop: Slop,
): Promise<Slop> {
  const { data: row, error } = await client
    .from("slop")
    .insert(toSlopInsert(slop))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toSlop(row as SlopRow);
}

export async function insertReactionIntoSupabase(
  client: SupabaseClient,
  params: {
    slopId: string;
    reactionType: string;
    sessionId: string;
    ipHash?: string;
  },
): Promise<{ changed: boolean; counts: ReactionCounts }> {
  const { error } = await client.from("reaction").insert({
    slop_id: params.slopId,
    reaction_type: params.reactionType,
    session_id: params.sessionId,
    ip_hash: params.ipHash,
  });

  if (error && error.code !== "23505") {
    throw error;
  }

  const reactionRows = await listReactionRows(client, [params.slopId]);
  return {
    changed: !error,
    counts: countReactions(params.slopId, reactionRows),
  };
}

export async function updateSlopTaglineInSupabase(
  client: SupabaseClient,
  params: { token: string; tagline: string },
): Promise<Slop | undefined> {
  const { data: row, error } = await client
    .from("slop")
    .update({ tagline: params.tagline })
    .eq("manage_token", params.token)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return row ? toSlop(row as SlopRow) : undefined;
}

export async function reslopSlopInSupabase(
  client: SupabaseClient,
  params: { token: string; tagline: string },
): Promise<Slop | undefined> {
  const { data: row, error } = await client
    .from("slop")
    .update({ tagline: params.tagline, reslop_used: true })
    .eq("manage_token", params.token)
    .or("reslop_used.eq.false,reslop_used.is.null")
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return row ? toSlop(row as SlopRow) : undefined;
}

export async function softDeleteSlopInSupabase(
  client: SupabaseClient,
  token: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("slop")
    .update({ deleted_at: new Date().toISOString() })
    .eq("manage_token", token)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function listReactionRows(
  client: SupabaseClient,
  slopIds: string[],
): Promise<ReactionRow[]> {
  if (slopIds.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("reaction")
    .select("slop_id,reaction_type")
    .in("slop_id", slopIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as ReactionRow[];
}
