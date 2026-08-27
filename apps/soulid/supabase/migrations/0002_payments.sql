-- Ödeme + entitlement cache şeması.
-- RevenueCat webhook bunu günceller; usePremium hook'u buradan okur.

create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz default now()
);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id text not null,
  entitlement text not null check (entitlement in ('premium', 'relationship', 'galactic')),
  source text not null check (source in ('stripe', 'apple', 'google', 'promo', 'manual')),
  active boolean default true,
  expires_at timestamptz,
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, entitlement, source)
);

create index if not exists idx_entitlements_user_active
  on entitlements(user_id, active)
  where active = true;

create index if not exists idx_entitlements_expiry
  on entitlements(expires_at)
  where active = true;

-- RLS
alter table stripe_customers enable row level security;
alter table entitlements enable row level security;

create policy "stripe_customers_read_own" on stripe_customers
  for select using (auth.uid() = user_id);

create policy "entitlements_read_own" on entitlements
  for select using (auth.uid() = user_id);

-- updated_at trigger
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entitlements_updated_at
  before update on entitlements
  for each row execute function touch_updated_at();
