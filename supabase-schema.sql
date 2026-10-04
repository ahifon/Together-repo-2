create table if not exists public.wedding_data (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'wedding',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wedding_data enable row level security;

create policy "Public read access for wedding data"
  on public.wedding_data
  for select
  using (true);

create policy "Anonymous insert access for wedding data"
  on public.wedding_data
  for insert
  with check (true);

create policy "Anonymous update access for wedding data"
  on public.wedding_data
  for update
  using (true)
  with check (true);

-- Exemple de contenu JSON pour la première ligne :
-- insert into public.wedding_data (name, payload) values (
--   'wedding',
--   '{
--     "mariage": {...},
--     "programme": [...],
--     "livret": [...],
--     "tables": [...]
--   }'::jsonb
-- );
