create table if not exists slop (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  url text not null,
  title text,
  tagline text,
  screenshot_url text,
  type text check (type in ('wrapper', 'tool', 'game', 'cursed', 'useless', 'demo')),
  slopper_handle text,
  email text,
  manage_token text,
  reslop_used boolean default false,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists reaction (
  id uuid primary key default gen_random_uuid(),
  slop_id uuid references slop(id) on delete cascade,
  reaction_type text check (
    reaction_type in (
      'peak-slop',
      'em-dash-deluxe',
      'tokens-well-spent',
      'absolutely',
      'load-bearing',
      'one-shotted',
      'delve'
    )
  ),
  session_id text,
  ip_hash text,
  created_at timestamptz default now(),
  unique(slop_id, reaction_type, session_id)
);

create table if not exists slop_of_the_day (
  date date primary key,
  slop_id uuid references slop(id),
  total_reactions int not null default 0
);

create index if not exists slop_created_at_idx on slop(created_at desc);
create index if not exists slop_deleted_at_idx on slop(deleted_at);
create index if not exists slop_manage_token_idx on slop(manage_token);
create index if not exists reaction_slop_id_idx on reaction(slop_id);
create index if not exists reaction_created_at_idx on reaction(created_at desc);

alter table slop enable row level security;
alter table reaction enable row level security;
alter table slop_of_the_day enable row level security;

create policy "public slop read"
  on slop for select
  using (deleted_at is null);

create policy "public reaction read"
  on reaction for select
  using (true);

create policy "public winners read"
  on slop_of_the_day for select
  using (true);
