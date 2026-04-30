-- =============================================================================
-- Migration 002: Row Level Security Policies
-- LinguaNomad — Postgres 15 / Supabase
-- =============================================================================
-- RLS must be enabled on every table. The service role bypasses RLS by default
-- in Supabase (it uses the postgres/service key, not a JWT). No explicit
-- service-role policy is needed; service-role bypass is Supabase's built-in
-- behaviour. All policies below apply to the `authenticated` role (JWT users).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- SELECT: users can only see their own profile
create policy "profiles: owner can select"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- INSERT: users can insert only their own profile
create policy "profiles: owner can insert"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- UPDATE: users can update only their own profile
create policy "profiles: owner can update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- DELETE: users can delete only their own profile
create policy "profiles: owner can delete"
  on public.profiles
  for delete
  to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- progress_snapshots
-- ---------------------------------------------------------------------------
alter table public.progress_snapshots enable row level security;

create policy "progress_snapshots: owner can select"
  on public.progress_snapshots
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "progress_snapshots: owner can insert"
  on public.progress_snapshots
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "progress_snapshots: owner can update"
  on public.progress_snapshots
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progress_snapshots: owner can delete"
  on public.progress_snapshots
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- review_sync_records
-- ---------------------------------------------------------------------------
alter table public.review_sync_records enable row level security;

create policy "review_sync_records: owner can select"
  on public.review_sync_records
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "review_sync_records: owner can insert"
  on public.review_sync_records
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "review_sync_records: owner can update"
  on public.review_sync_records
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "review_sync_records: owner can delete"
  on public.review_sync_records
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- content_pack_metadata — public read, no write for authenticated users
-- ---------------------------------------------------------------------------
alter table public.content_pack_metadata enable row level security;

-- All authenticated users (and anonymous if anon key is used) can read
create policy "content_pack_metadata: public read"
  on public.content_pack_metadata
  for select
  to authenticated
  using (true);

-- No INSERT / UPDATE / DELETE for authenticated users; only service role writes.
-- (Service role bypasses RLS automatically in Supabase.)

-- ---------------------------------------------------------------------------
-- sync_log — users can insert and read their own rows; no update/delete
-- ---------------------------------------------------------------------------
alter table public.sync_log enable row level security;

create policy "sync_log: owner can select"
  on public.sync_log
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "sync_log: owner can insert"
  on public.sync_log
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- No UPDATE or DELETE: sync_log is append-only.
