# supabase/

This directory contains all Supabase-managed infrastructure for LinguaNomad: database migrations, Edge Functions, and seed data.

---

## Directory Structure

```
supabase/
├── config.toml              # Supabase CLI project config
├── migrations/              # Postgres migrations (applied in order)
│   └── YYYYMMDDHHMMSS_*.sql
├── functions/               # Edge Functions (Deno TypeScript)
│   └── sync/
│       └── index.ts         # Batched LWW sync push/pull
└── seed.sql                 # Optional: local dev seed data
```

---

## Running Locally

Requires [Docker](https://docs.docker.com/get-docker/) and the [Supabase CLI](https://supabase.com/docs/guides/cli).

### Start the local stack

```bash
supabase start
```

This spins up a local Postgres instance, Auth, Storage, and the Edge Function runtime. The CLI prints the local API URL, anon key, and service role key on first run — copy these into your `.env.local`.

### Reset the database

```bash
supabase db reset
```

Drops and recreates the local database, re-runs all migrations, and applies `seed.sql` if present. Use this when migrations change or to get back to a clean state.

### Serve Edge Functions locally

```bash
supabase functions serve
```

Starts the Deno Edge Function runtime locally. Functions are hot-reloaded on file changes. The sync function will be available at:

```
http://localhost:54321/functions/v1/sync/push
http://localhost:54321/functions/v1/sync/pull
```

---

## Deploying to Production

### Apply database migrations

```bash
supabase db push
```

Runs any pending migrations against the linked remote project. Always run this before deploying a new app version that depends on schema changes.

### Deploy the sync Edge Function

```bash
supabase functions deploy sync
```

Deploys the `functions/sync/` function to the remote project. The function is deployed atomically — the old version continues serving until the new version is live.

To deploy all functions at once:

```bash
supabase functions deploy
```

---

## Required Environment Variables

| Variable | Description | Where to set |
|----------|-------------|--------------|
| `SUPABASE_URL` | Project API URL (`https://<project-ref>.supabase.co`) | `.env.local`, CI secrets, app config |
| `SUPABASE_ANON_KEY` | Public anon key — safe to include in the mobile app | `.env.local`, CI secrets, app config |
| `SUPABASE_SERVICE_ROLE_KEY` | Full-access key — **never expose in client code** | Server-only: CI secrets, Edge Function env |

For local development, `supabase start` prints all three values. For production, find them in the Supabase dashboard under **Project Settings → API**.

### Setting Edge Function secrets

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<value>
```

Edge Functions receive secrets as environment variables at runtime. Do not hard-code keys in `functions/`.

---

## Architecture Notes

- **Migrations are the source of truth** for the database schema. Never modify the remote schema directly through the Supabase dashboard; always create a migration.
- **The `sync` Edge Function** implements batched LWW (Last-Write-Wins) conflict resolution for multi-device progress sync. See [ADR-005](../docs/architecture/decisions/ADR-005-sync-edge-function.md) for the full rationale.
- **No domain logic lives here.** SRS scheduling, lesson sequencing, and content validation are all on-device. The backend is a durable store with auth; the sync function is transport infrastructure only.

---

## Further Reading

- [ADR-003: Supabase as Backend](../docs/architecture/decisions/ADR-003-supabase-backend.md)
- [ADR-005: Sync Edge Function](../docs/architecture/decisions/ADR-005-sync-edge-function.md)
- [Supabase CLI reference](https://supabase.com/docs/reference/cli)
- [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions)
