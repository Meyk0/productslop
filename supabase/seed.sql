with seeded_slops(
  id,
  slug,
  url,
  title,
  tagline,
  type,
  slopper_handle,
  created_at
) as (
  values
    (
      '00000000-0000-4000-8000-000000000001'::uuid,
      'kanwas-open-source-brain',
      'https://example.com/kanwas',
      'Kanwas',
      'An open-source brain for the team channel that never closes',
      'tool',
      '@kanwas',
      now() - interval '1 hour'
    ),
    (
      '00000000-0000-4000-8000-000000000002'::uuid,
      'shadow-2-meeting-aftermath',
      'https://example.com/shadow',
      'Shadow 2.0',
      'The work your meetings create, done before they end',
      'wrapper',
      '@shadowai',
      now() - interval '2 hours'
    ),
    (
      '00000000-0000-4000-8000-000000000003'::uuid,
      'superset-agent-swarm',
      'https://example.com/superset',
      'Superset 2.0',
      'Run a hallway full of coding agents from one tired laptop',
      'tool',
      '@superset',
      now() - interval '4 hours'
    ),
    (
      '00000000-0000-4000-8000-000000000004'::uuid,
      'paysh-api-wallet',
      'https://example.com/paysh',
      'pay.sh',
      'Discover, access, and pay for any API autonomously',
      'demo',
      '@paysh',
      now() - interval '7 hours'
    ),
    (
      '00000000-0000-4000-8000-000000000005'::uuid,
      'cursor-kart-vibe-racer',
      'https://example.com/cursor-kart',
      'Cursor Kart',
      'Mario Kart for people who think merge conflicts are lore',
      'game',
      '@vibekart',
      (date_trunc('day', now() at time zone 'utc') - interval '1 day' + interval '12 hours') at time zone 'utc'
    ),
    (
      '00000000-0000-4000-8000-000000000006'::uuid,
      'deckspell-slide-cult',
      'https://example.com/deckspell',
      'DeckSpell',
      'Turns founder notes into decks that sound legally optimistic',
      'cursed',
      '@deckspell',
      (date_trunc('day', now() at time zone 'utc') - interval '2 days' + interval '12 hours') at time zone 'utc'
    )
),
upserted_slops as (
  insert into slop (
    id,
    slug,
    url,
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
    ('kanwas-open-source-brain', 'peak-slop', 84),
    ('kanwas-open-source-brain', 'tokens-well-spent', 122),
    ('kanwas-open-source-brain', 'load-bearing', 39),
    ('kanwas-open-source-brain', 'one-shotted', 80),
    ('shadow-2-meeting-aftermath', 'em-dash-deluxe', 59),
    ('shadow-2-meeting-aftermath', 'tokens-well-spent', 106),
    ('shadow-2-meeting-aftermath', 'absolutely', 51),
    ('shadow-2-meeting-aftermath', 'peak-slop', 89),
    ('superset-agent-swarm', 'peak-slop', 71),
    ('superset-agent-swarm', 'one-shotted', 88),
    ('superset-agent-swarm', 'tokens-well-spent', 93),
    ('superset-agent-swarm', 'delve', 36),
    ('paysh-api-wallet', 'load-bearing', 65),
    ('paysh-api-wallet', 'tokens-well-spent', 76),
    ('paysh-api-wallet', 'one-shotted', 42),
    ('paysh-api-wallet', 'absolutely', 48),
    ('cursor-kart-vibe-racer', 'peak-slop', 109),
    ('cursor-kart-vibe-racer', 'one-shotted', 72),
    ('cursor-kart-vibe-racer', 'em-dash-deluxe', 31),
    ('deckspell-slide-cult', 'delve', 91),
    ('deckspell-slide-cult', 'load-bearing', 33),
    ('deckspell-slide-cult', 'em-dash-deluxe', 87)
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
  212
from upserted_slops
where upserted_slops.slug = 'cursor-kart-vibe-racer'
on conflict (date) do update set
  slop_id = excluded.slop_id,
  total_reactions = excluded.total_reactions;
