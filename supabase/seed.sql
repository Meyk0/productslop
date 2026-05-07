with seeded_slops(
  id,
  slug,
  url,
  canonical_url,
  title,
  tagline,
  type,
  slopper_handle,
  created_at
) as (
  values
    (
      '00000000-0000-4000-8000-000000000007'::uuid,
      'standup-arcade-order-picker',
      'https://www.standuparca.de',
      'https://www.standuparca.de',
      'Standup Arcade',
      'A retro slot machine that picks standup order before the meeting stalls',
      'game',
      '@meyk0',
      now() - interval '30 minutes'
    ),
    (
      '00000000-0000-4000-8000-000000000008'::uuid,
      'evalarena-llm-evals',
      'https://evalarena.xyz',
      'https://evalarena.xyz',
      'EvalArena',
      'Practice LLM evals with real-world challenges and hidden tests',
      'tool',
      '@meyk0',
      now() - interval '45 minutes'
    )
),
upserted_slops as (
  insert into slop (
    id,
    slug,
    url,
    canonical_url,
    title,
    tagline,
    type,
    slopper_handle,
    reslop_used,
    created_at,
    deleted_at
  )
  select
    id,
    slug,
    url,
    canonical_url,
    title,
    tagline,
    type,
    slopper_handle,
    false,
    created_at,
    null
  from seeded_slops
  on conflict (slug) do update set
    url = excluded.url,
    canonical_url = excluded.canonical_url,
    title = excluded.title,
    tagline = excluded.tagline,
    type = excluded.type,
    slopper_handle = excluded.slopper_handle,
    created_at = excluded.created_at,
    deleted_at = null
  returning id, slug
),
reaction_seed(slug, reaction_type, reaction_count) as (
  values
    ('standup-arcade-order-picker', 'one-shotted', 102),
    ('standup-arcade-order-picker', 'peak-slop', 96),
    ('standup-arcade-order-picker', 'tokens-well-spent', 94),
    ('standup-arcade-order-picker', 'load-bearing', 70),
    ('evalarena-llm-evals', 'tokens-well-spent', 128),
    ('evalarena-llm-evals', 'one-shotted', 77),
    ('evalarena-llm-evals', 'peak-slop', 77),
    ('evalarena-llm-evals', 'load-bearing', 62)
),
expanded_reactions as (
  select
    upserted_slops.id as slop_id,
    reaction_seed.reaction_type,
    format(
      'seed-%s-%s-%s',
      reaction_seed.slug,
      reaction_seed.reaction_type,
      series.index
    ) as session_id
  from reaction_seed
  join upserted_slops on upserted_slops.slug = reaction_seed.slug
  cross join lateral generate_series(1, reaction_seed.reaction_count) as series(index)
),
inserted_reactions as (
  insert into reaction (slop_id, reaction_type, session_id)
  select slop_id, reaction_type, session_id
  from expanded_reactions
  on conflict (slop_id, reaction_type, session_id) do nothing
)
insert into slop_of_the_day (date, slop_id, total_reactions)
select
  ((now() at time zone 'utc')::date - 1) as date,
  upserted_slops.id,
  362
from upserted_slops
where upserted_slops.slug = 'standup-arcade-order-picker'
on conflict (date) do update set
  slop_id = excluded.slop_id,
  total_reactions = excluded.total_reactions;
