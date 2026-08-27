-- SoulProfile initial schema
-- Run via: supabase db push  (or in Supabase SQL editor)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  birth_time time,
  birth_time_known boolean default true,
  birth_place text,
  latitude double precision,
  longitude double precision,
  timezone text,
  photo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  kind text not null check (kind in ('galactic','weekly','monthly','solar_return','relationship','custom')),
  payload jsonb not null,
  is_premium boolean default false,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null check (provider in ('revenuecat','stripe')),
  product_id text not null,
  status text not null,
  current_period_end timestamptz,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reports_user on reports(user_id);
create index if not exists idx_reports_profile on reports(profile_id);
create index if not exists idx_profiles_user on profiles(user_id);

-- Row-level security
alter table profiles enable row level security;
alter table reports enable row level security;
alter table subscriptions enable row level security;

create policy "profiles_own" on profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reports_own" on reports
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_read_own" on subscriptions
  for select
  using (auth.uid() = user_id);
