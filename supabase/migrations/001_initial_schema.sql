-- =============================================================================
-- Migration 001: Initial Schema
-- LinguaNomad — Postgres 15 / Supabase
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Utility: updated_at auto-trigger function
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- One row per authenticated user. References auth.users (Supabase managed).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  preferred_language text not null default 'ky',  -- ISO 639-1 / BCP-47
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists profiles_preferred_language_idx on public.profiles (preferred_language);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();

comment on table public.profiles is
  'Learner profile row, one-to-one with auth.users. Stores display preferences.';

-- ---------------------------------------------------------------------------
-- progress_snapshots
-- Captures lesson/task completion state per unit per language.
-- One row per (user_id, unit_id, language_code) — upserted by the client.
-- ---------------------------------------------------------------------------
create table if not exists public.progress_snapshots (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  unit_id              text not null,
  language_code        text not null,
  lesson_completed_at  timestamptz,
  task_completed_at    timestamptz,
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now(),

  -- Enforce one snapshot per user × unit × language
  unique (user_id, unit_id, language_code)
);

create index if not exists progress_snapshots_user_idx        on public.progress_snapshots (user_id);
create index if not exists progress_snapshots_language_idx    on public.progress_snapshots (user_id, language_code);
create index if not exists progress_snapshots_updated_at_idx  on public.progress_snapshots (user_id, updated_at);

create trigger progress_snapshots_updated_at
  before update on public.progress_snapshots
  for each row execute function set_updated_at();

comment on table public.progress_snapshots is
  'Per-unit progress markers. Conflict resolution merges by taking max of each completed_at field.';

-- ---------------------------------------------------------------------------
-- review_sync_records
-- SRS state for individual reviewable items. All scheduling lives on-device;
-- this table is a durable backup and cross-device sync target.
-- ---------------------------------------------------------------------------
create table if not exists public.review_sync_records (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  content_id        text not null,       -- opaque content-pack item identifier
  content_type      text not null,       -- e.g. 'lexeme', 'sentence', 'exercise'
  ease_factor       numeric(5,4) not null default 2.5,
  interval_days     integer not null default 1,
  next_review_at    timestamptz not null default now(),
  last_grade        smallint,            -- 0-5 SM-2 grade from last review
  rep_count         integer not null default 0,
  client_updated_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),

  -- One SRS record per user × content item
  unique (user_id, content_id)
);

create index if not exists review_sync_user_idx              on public.review_sync_records (user_id);
create index if not exists review_sync_next_review_idx       on public.review_sync_records (user_id, next_review_at);
create index if not exists review_sync_server_updated_idx    on public.review_sync_records (user_id, server_updated_at);
create index if not exists review_sync_content_type_idx      on public.review_sync_records (user_id, content_type);

comment on table public.review_sync_records is
  'SRS scheduling state per user per content item. Conflict resolution: last client_updated_at wins; ties resolved by server_updated_at.';

comment on column public.review_sync_records.client_updated_at is
  'Timestamp set by the device when the record was last modified locally. Used for conflict resolution (last-write-wins).';

comment on column public.review_sync_records.server_updated_at is
  'Timestamp set by the server on upsert. Used as tie-breaker when client_updated_at values are equal.';

-- server_updated_at is always set by the server on insert/update
create or replace function set_review_sync_server_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.server_updated_at = now();
  return new;
end;
$$;

create trigger review_sync_records_server_updated_at
  before insert or update on public.review_sync_records
  for each row execute function set_review_sync_server_updated_at();

-- ---------------------------------------------------------------------------
-- content_pack_metadata
-- Manifest of available content packs. Read by all authenticated users;
-- written only by service/admin roles.
-- ---------------------------------------------------------------------------
create table if not exists public.content_pack_metadata (
  id            uuid primary key default uuid_generate_v4(),
  language_code text not null,           -- BCP-47, e.g. 'ky'
  version       text not null,           -- semver, e.g. '1.0.0'
  slug          text not null unique,    -- URL-safe identifier, e.g. 'kyrgyz-starter'
  title         text not null,
  item_count    integer not null default 0,
  published_at  timestamptz not null default now(),
  pack_url      text not null,           -- Supabase Storage signed URL or CDN URL
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists content_pack_language_idx on public.content_pack_metadata (language_code);
create index if not exists content_pack_slug_idx     on public.content_pack_metadata (slug);

create trigger content_pack_metadata_updated_at
  before update on public.content_pack_metadata
  for each row execute function set_updated_at();

comment on table public.content_pack_metadata is
  'Catalogue of downloadable content packs. Public read; service-role write only.';

-- ---------------------------------------------------------------------------
-- sync_log
-- Audit trail of sync operations. Helps diagnose conflict rates and data loss.
-- ---------------------------------------------------------------------------
create table if not exists public.sync_log (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  synced_at       timestamptz not null default now(),
  records_pushed  integer not null default 0,
  records_pulled  integer not null default 0,
  conflict_count  integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists sync_log_user_idx     on public.sync_log (user_id);
create index if not exists sync_log_synced_at_idx on public.sync_log (user_id, synced_at desc);

comment on table public.sync_log is
  'Append-only log of sync operations. No updates; insert only.';
