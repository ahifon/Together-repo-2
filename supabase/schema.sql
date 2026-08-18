-- ============================================================
--  Budget de mariage a deux — schema Supabase
--  A coller dans Supabase > SQL Editor > Run
--  Idempotent : peut etre relance sans casse.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.weddings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default 'Notre mariage',
  wedding_date date,
  budget_max   numeric(12,2) not null default 20000,
  invite_code  text not null unique,
  created_at   timestamptz not null default now()
);

create table if not exists public.wedding_members (
  wedding_id   uuid not null references public.weddings(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  accent       text not null default 'violet',
  joined_at    timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references public.weddings(id) on delete cascade,
  group_name     text not null default 'Lieux & Prestataires',
  name           text not null,
  icon           text not null default 'tag',
  planned_amount numeric(12,2) not null default 0,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.expenses (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references public.weddings(id) on delete cascade,
  category_id    uuid references public.categories(id) on delete set null,
  label          text not null,
  vendor         text,
  amount         numeric(12,2) not null default 0,
  settled_amount numeric(12,2) not null default 0,
  quote_url      text,
  due_date       date,
  notes          text,
  archived       boolean not null default false,
  created_by     uuid not null references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.approvals (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  decision   text not null check (decision in ('approve','reject')),
  note       text,
  created_at timestamptz not null default now(),
  primary key (expense_id, user_id)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_wedding_idx  on public.expenses (wedding_id);
create index if not exists expenses_category_idx on public.expenses (category_id);
create index if not exists categories_wedding_idx on public.categories (wedding_id);
create index if not exists comments_expense_idx  on public.comments (expense_id);

-- ---------- Helpers (SECURITY DEFINER, evite la recursion RLS) ----------

create or replace function public.is_wedding_member(w uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.wedding_members m
    where m.wedding_id = w and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_expense_member(e uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.expenses x
    join public.wedding_members m on m.wedding_id = x.wedding_id
    where x.id = e and m.user_id = auth.uid()
  );
$$;

-- ---------- RLS ----------

alter table public.weddings        enable row level security;
alter table public.wedding_members enable row level security;
alter table public.categories      enable row level security;
alter table public.expenses        enable row level security;
alter table public.approvals       enable row level security;
alter table public.comments        enable row level security;

drop policy if exists weddings_select on public.weddings;
create policy weddings_select on public.weddings
  for select using (public.is_wedding_member(id));

drop policy if exists weddings_update on public.weddings;
create policy weddings_update on public.weddings
  for update using (public.is_wedding_member(id))
  with check (public.is_wedding_member(id));

drop policy if exists members_select on public.wedding_members;
create policy members_select on public.wedding_members
  for select using (public.is_wedding_member(wedding_id));

drop policy if exists members_update_self on public.wedding_members;
create policy members_update_self on public.wedding_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists members_delete_self on public.wedding_members;
create policy members_delete_self on public.wedding_members
  for delete using (user_id = auth.uid());

drop policy if exists categories_all on public.categories;
create policy categories_all on public.categories
  for all using (public.is_wedding_member(wedding_id))
  with check (public.is_wedding_member(wedding_id));

drop policy if exists expenses_all on public.expenses;
create policy expenses_all on public.expenses
  for all using (public.is_wedding_member(wedding_id))
  with check (public.is_wedding_member(wedding_id));

drop policy if exists approvals_select on public.approvals;
create policy approvals_select on public.approvals
  for select using (public.is_expense_member(expense_id));

drop policy if exists approvals_write_self on public.approvals;
create policy approvals_write_self on public.approvals
  for all using (user_id = auth.uid() and public.is_expense_member(expense_id))
  with check (user_id = auth.uid() and public.is_expense_member(expense_id));

drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select using (public.is_expense_member(expense_id));

drop policy if exists comments_write_self on public.comments;
create policy comments_write_self on public.comments
  for all using (user_id = auth.uid() and public.is_expense_member(expense_id))
  with check (user_id = auth.uid() and public.is_expense_member(expense_id));

-- ---------- Droits de table (RLS fait le tri ligne a ligne) ----------

grant usage on schema public to anon, authenticated;
grant select, update                   on public.weddings        to authenticated;
grant select, update, delete           on public.wedding_members to authenticated;
grant select, insert, update, delete   on public.categories      to authenticated;
grant select, insert, update, delete   on public.expenses        to authenticated;
grant select, insert, update, delete   on public.approvals       to authenticated;
grant select, insert, update, delete   on public.comments        to authenticated;

-- ---------- RPC : creer un mariage (+ categories par defaut) ----------

create or replace function public.create_wedding(
  p_name         text,
  p_display_name text,
  p_budget_max   numeric default 20000,
  p_wedding_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id   uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  -- md5/random vivent dans pg_catalog : pas de dependance a pgcrypto,
  -- qui n'est pas dans le search_path fige de cette fonction.
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.weddings w where w.invite_code = v_code);
  end loop;

  insert into public.weddings (name, wedding_date, budget_max, invite_code)
  values (coalesce(nullif(trim(p_name), ''), 'Notre mariage'), p_wedding_date,
          coalesce(p_budget_max, 20000), v_code)
  returning id into v_id;

  insert into public.wedding_members (wedding_id, user_id, display_name, accent)
  values (v_id, auth.uid(), coalesce(nullif(trim(p_display_name), ''), 'Moi'), 'violet');

  insert into public.categories (wedding_id, group_name, name, icon, planned_amount, sort_order)
  values
    (v_id, 'Lieux & Prestataires', 'Lieu de reception',            'building',   3500, 10),
    (v_id, 'Lieux & Prestataires', 'Traiteur (nourriture & boissons)', 'plate',  6000, 20),
    (v_id, 'Lieux & Prestataires', 'Photographe',                  'camera',     1000, 30),
    (v_id, 'Lieux & Prestataires', 'Musique',                      'music',      1000, 40),
    (v_id, 'Lieux & Prestataires', 'Fleuriste',                    'flower',      500, 50),
    (v_id, 'Lieux & Prestataires', 'Gateau',                       'cake',       1000, 60),
    (v_id, 'Lieux & Prestataires', 'Transport',                    'car',        1000, 70),
    (v_id, 'Lieux & Prestataires', 'Decorations et location',       'sparkles',      0, 80),
    (v_id, 'Lieux & Prestataires', 'Chapiteau',                    'tent',          0, 90),
    (v_id, 'Tenues & Accessoires', 'Robe de mariee et accessoires', 'dress',      2000, 110),
    (v_id, 'Tenues & Accessoires', 'Costumes',                     'suit',       1000, 120),
    (v_id, 'Tenues & Accessoires', 'Alliances & bijoux',            'ring',       2000, 130),
    (v_id, 'Tenues & Accessoires', 'Beaute, coiffure & maquillage', 'scissors',    365, 140),
    (v_id, 'Couts additionnels',   'Frais notaire / contrat',       'file',          0, 210),
    (v_id, 'Couts additionnels',   'Nuit de noce',                 'bed',           0, 220),
    (v_id, 'Couts additionnels',   'Cadeaux',                      'gift',        405, 230),
    (v_id, 'Couts additionnels',   'Lune de miel',                 'plane',      5000, 240),
    (v_id, 'Couts additionnels',   'Cartes de remerciements',       'mail',          0, 250),
    (v_id, 'Couts additionnels',   'Faire-part & papeterie',        'mail',          0, 260);

  return v_id;
end;
$$;

-- ---------- RPC : rejoindre un mariage avec le code ----------

create or replace function public.join_wedding(
  p_code         text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    uuid;
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  select id into v_id
  from public.weddings
  where invite_code = upper(trim(p_code));

  if v_id is null then
    raise exception 'Code invalide';
  end if;

  if exists (select 1 from public.wedding_members m
             where m.wedding_id = v_id and m.user_id = auth.uid()) then
    return v_id;
  end if;

  select count(*) into v_count from public.wedding_members m where m.wedding_id = v_id;
  if v_count >= 2 then
    raise exception 'Ce mariage a deja deux membres';
  end if;

  insert into public.wedding_members (wedding_id, user_id, display_name, accent)
  values (v_id, auth.uid(), coalesce(nullif(trim(p_display_name), ''), 'Moi'), 'rose');

  return v_id;
end;
$$;

grant execute on function public.create_wedding(text, text, numeric, date) to authenticated;
grant execute on function public.join_wedding(text, text) to authenticated;

-- ---------- Temps reel ----------

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare t text;
begin
  foreach t in array array['weddings','wedding_members','categories','expenses','approvals','comments']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
