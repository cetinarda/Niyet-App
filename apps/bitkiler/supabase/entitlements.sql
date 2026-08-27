-- ============================================================
-- sakin.life cross-platform entitlement schema
-- Run in Supabase SQL editor
-- ============================================================

-- Main entitlement table
create table if not exists sakin_entitlements (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        references auth.users(id) on delete cascade,
  license_key  text        unique,              -- null for account-based (Stripe/IAP)
  source       text        not null,            -- 'stripe_web' | 'ios_iap' | 'android_iap' | 'key'
  product      text        not null,            -- 'mikro' | 'premium' | 'sakin_all'
  expires_at   timestamptz,                     -- null = lifetime / until cancelled
  redeemed_by  uuid        references auth.users(id),  -- set when a key is redeemed
  redeemed_at  timestamptz,
  created_at   timestamptz default now()
);

-- Row level security
alter table sakin_entitlements enable row level security;

-- Users can read their own entitlements (either owned or redeemed)
create policy "select own" on sakin_entitlements for select
  using (auth.uid() = user_id or auth.uid() = redeemed_by);

-- Service role can do anything (used by Stripe webhook + admin)
-- (service_role bypasses RLS by default)

-- ============================================================
-- RPC: check if calling user has any active entitlement
-- Called by mobile app to check web/key premium status
-- ============================================================
create or replace function check_sakin_entitlement()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from sakin_entitlements
    where (user_id = auth.uid() or redeemed_by = auth.uid())
      and (expires_at is null or expires_at > now())
  );
end;
$$;

-- ============================================================
-- RPC: redeem a license key
-- Called by mobile after user types a key
-- Returns JSON: { success, product, expires_at, error }
-- ============================================================
create or replace function redeem_license_key(p_key text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ent sakin_entitlements;
begin
  if auth.uid() is null then
    return json_build_object('success', false, 'error', 'not-authenticated');
  end if;

  -- Check if this user already has an active entitlement (avoid double-redeem)
  if (select check_sakin_entitlement()) then
    return json_build_object('success', true, 'error', null, 'already_active', true);
  end if;

  -- Find an unredeemed, non-expired key
  select * into v_ent
  from sakin_entitlements
  where license_key = lower(trim(p_key))
    and redeemed_by is null
    and (expires_at is null or expires_at > now());

  if not found then
    return json_build_object('success', false, 'error', 'invalid-or-used-key');
  end if;

  -- Redeem
  update sakin_entitlements
  set redeemed_by  = auth.uid(),
      redeemed_at  = now()
  where id = v_ent.id;

  return json_build_object(
    'success',    true,
    'product',    v_ent.product,
    'expires_at', v_ent.expires_at,
    'error',      null
  );
end;
$$;

-- ============================================================
-- RPC: delete calling user's account (GDPR / Apple 5.1.1(v))
-- Called by mobile "Hesabı Sil" button
-- ============================================================
create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Revoke entitlements owned by this user
  update sakin_entitlements
  set user_id = null
  where user_id = auth.uid();

  -- Delete the auth user (cascades to profile etc.)
  delete from auth.users where id = auth.uid();
end;
$$;

-- ============================================================
-- Stripe webhook helper (call from your Edge Function)
-- Usage: select upsert_stripe_entitlement('user-uuid', 'premium', '2026-05-16T00:00:00Z');
-- ============================================================
create or replace function upsert_stripe_entitlement(
  p_user_id  uuid,
  p_product  text,
  p_expires  timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into sakin_entitlements (user_id, source, product, expires_at)
  values (p_user_id, 'stripe_web', p_product, p_expires)
  on conflict (user_id, source, product)
    -- upsert: just extend the expiry
    do update set expires_at = excluded.expires_at;
end;
$$;
-- Note: add unique constraint for upsert to work:
-- alter table sakin_entitlements add constraint uniq_user_source_product
--   unique (user_id, source, product);
