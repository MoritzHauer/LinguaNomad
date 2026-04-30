-- =============================================================================
-- seed.sql — Development seed data for LinguaNomad
-- =============================================================================
-- ⚠️  For local development only. Do NOT run against production.
-- Run after migrations:
--   supabase db reset   (applies migrations + seed)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Kyrgyz Starter Content Pack
-- ---------------------------------------------------------------------------
insert into public.content_pack_metadata (
  id,
  language_code,
  version,
  slug,
  title,
  item_count,
  published_at,
  pack_url
) values (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'ky',
  '1.0.0',
  'kyrgyz-starter',
  'Kyrgyz Starter Pack',
  120,
  now(),
  'https://your-supabase-project.supabase.co/storage/v1/object/public/content-packs/kyrgyz-starter-1.0.0.json'
)
on conflict (slug) do update set
  version    = excluded.version,
  title      = excluded.title,
  item_count = excluded.item_count,
  pack_url   = excluded.pack_url,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Test User Profile
-- ---------------------------------------------------------------------------
-- Note: the corresponding auth.users row must already exist.
-- When using Supabase local dev, create the user via the Dashboard or CLI:
--   supabase auth admin create-user --email dev@test.local --password devpassword
-- Then replace the UUID below with the actual UUID issued.
--
-- Placeholder UUID (dev environment only):
do $$
declare
  dev_user_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  -- Only seed if the auth.users row exists (avoids FK violation on clean db)
  if exists (select 1 from auth.users where id = dev_user_id) then
    insert into public.profiles (
      id,
      display_name,
      preferred_language
    ) values (
      dev_user_id,
      'Dev User',
      'ky'
    )
    on conflict (id) do update set
      display_name       = excluded.display_name,
      preferred_language = excluded.preferred_language;

    raise notice 'Dev profile seeded for user %', dev_user_id;
  else
    raise notice 'Skipping dev profile seed: auth.users row % not found. Create the user first.', dev_user_id;
  end if;
end;
$$;
