// =============================================================================
// Supabase Edge Function: sync
// Runtime: Deno (Supabase Edge Runtime)
// Endpoints:
//   POST /functions/v1/sync/push  — batch upsert review_sync_records
//   POST /functions/v1/sync/pull  — fetch delta since last_sync_at
// =============================================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewSyncRecord {
  content_id: string;
  content_type: string;
  ease_factor: number;
  interval_days: number;
  next_review_at: string; // ISO 8601
  last_grade: number | null;
  rep_count: number;
  client_updated_at: string; // ISO 8601
}

interface ProgressSnapshot {
  unit_id: string;
  language_code: string;
  lesson_completed_at: string | null;
  task_completed_at: string | null;
}

interface PushRequestBody {
  idempotency_key?: string;
  records: ReviewSyncRecord[];
  progress_snapshots?: ProgressSnapshot[];
}

interface PullRequestBody {
  last_sync_at: string; // ISO 8601
}

interface ConflictItem {
  content_id: string;
  reason: string;
  server_client_updated_at: string;
}

interface PushResponse {
  accepted: number;
  skipped: number;
  conflicts: ConflictItem[];
  synced_at: string;
}

interface PullResponse {
  synced_at: string;
  review_sync_records: ReviewSyncRecord[];
  progress_snapshots: ProgressSnapshot[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * Extract and verify the Supabase JWT from the Authorization header.
 * Returns the authenticated Supabase client scoped to the user.
 */
function getUserClient(req: Request): SupabaseClient | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

/** Service-role client for privileged operations (sync_log insert). */
function getServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Push handler
// ---------------------------------------------------------------------------

async function handlePush(
  req: Request,
  userClient: SupabaseClient,
  userId: string
): Promise<Response> {
  let body: PushRequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!Array.isArray(body.records)) {
    return errorResponse("'records' must be an array");
  }

  const now = new Date().toISOString();
  let accepted = 0;
  let skipped = 0;
  const conflicts: ConflictItem[] = [];

  // -------------------------------------------------------------------------
  // Upsert review_sync_records with LWW conflict resolution
  // -------------------------------------------------------------------------
  for (const record of body.records) {
    if (!record.content_id || !record.content_type) {
      skipped++;
      continue;
    }

    // Fetch existing record to compare client_updated_at
    const { data: existing } = await userClient
      .from("review_sync_records")
      .select("client_updated_at")
      .eq("user_id", userId)
      .eq("content_id", record.content_id)
      .maybeSingle();

    if (existing) {
      const serverTs = new Date(existing.client_updated_at).getTime();
      const clientTs = new Date(record.client_updated_at).getTime();

      if (clientTs < serverTs) {
        // Server has a newer record — skip this one
        skipped++;
        conflicts.push({
          content_id: record.content_id,
          reason: "server_newer",
          server_client_updated_at: existing.client_updated_at,
        });
        continue;
      }
      // Equal or newer: fall through to upsert
    }

    const { error } = await userClient.from("review_sync_records").upsert(
      {
        user_id: userId,
        content_id: record.content_id,
        content_type: record.content_type,
        ease_factor: record.ease_factor,
        interval_days: record.interval_days,
        next_review_at: record.next_review_at,
        last_grade: record.last_grade ?? null,
        rep_count: record.rep_count,
        client_updated_at: record.client_updated_at,
        // server_updated_at is set by DB trigger
      },
      { onConflict: "user_id,content_id" }
    );

    if (error) {
      skipped++;
    } else {
      accepted++;
    }
  }

  // -------------------------------------------------------------------------
  // Upsert progress_snapshots with field-level merge
  // -------------------------------------------------------------------------
  if (Array.isArray(body.progress_snapshots)) {
    for (const snap of body.progress_snapshots) {
      if (!snap.unit_id || !snap.language_code) continue;

      // Fetch existing to apply GREATEST merge
      const { data: existing } = await userClient
        .from("progress_snapshots")
        .select("lesson_completed_at, task_completed_at")
        .eq("user_id", userId)
        .eq("unit_id", snap.unit_id)
        .eq("language_code", snap.language_code)
        .maybeSingle();

      const mergedLesson = maxTimestamp(
        snap.lesson_completed_at,
        existing?.lesson_completed_at ?? null
      );
      const mergedTask = maxTimestamp(
        snap.task_completed_at,
        existing?.task_completed_at ?? null
      );

      await userClient.from("progress_snapshots").upsert(
        {
          user_id: userId,
          unit_id: snap.unit_id,
          language_code: snap.language_code,
          lesson_completed_at: mergedLesson,
          task_completed_at: mergedTask,
        },
        { onConflict: "user_id,unit_id,language_code" }
      );
    }
  }

  // -------------------------------------------------------------------------
  // Append sync_log row (service role to bypass RLS on insert validation)
  // -------------------------------------------------------------------------
  await getServiceClient().from("sync_log").insert({
    user_id: userId,
    synced_at: now,
    records_pushed: body.records.length,
    records_pulled: 0,
    conflict_count: conflicts.length,
  });

  const response: PushResponse = {
    accepted,
    skipped,
    conflicts,
    synced_at: now,
  };

  return jsonResponse(response);
}

// ---------------------------------------------------------------------------
// Pull handler
// ---------------------------------------------------------------------------

async function handlePull(
  req: Request,
  userClient: SupabaseClient,
  userId: string
): Promise<Response> {
  let body: PullRequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  if (!body.last_sync_at) {
    return errorResponse("'last_sync_at' is required");
  }

  const now = new Date().toISOString();

  // Fetch delta review records
  const { data: reviewRecords, error: reviewError } = await userClient
    .from("review_sync_records")
    .select(
      "content_id, content_type, ease_factor, interval_days, next_review_at, last_grade, rep_count, client_updated_at"
    )
    .eq("user_id", userId)
    .gt("server_updated_at", body.last_sync_at);

  if (reviewError) {
    return errorResponse(`Failed to fetch review records: ${reviewError.message}`, 500);
  }

  // Fetch delta progress snapshots
  const { data: snapshots, error: snapError } = await userClient
    .from("progress_snapshots")
    .select("unit_id, language_code, lesson_completed_at, task_completed_at")
    .eq("user_id", userId)
    .gt("updated_at", body.last_sync_at);

  if (snapError) {
    return errorResponse(`Failed to fetch progress snapshots: ${snapError.message}`, 500);
  }

  // Append sync_log
  await getServiceClient().from("sync_log").insert({
    user_id: userId,
    synced_at: now,
    records_pushed: 0,
    records_pulled: (reviewRecords?.length ?? 0) + (snapshots?.length ?? 0),
    conflict_count: 0,
  });

  const response: PullResponse = {
    synced_at: now,
    review_sync_records: reviewRecords ?? [],
    progress_snapshots: snapshots ?? [],
  };

  return jsonResponse(response);
}

// ---------------------------------------------------------------------------
// Utility: return the greater of two nullable ISO timestamps
// ---------------------------------------------------------------------------
function maxTimestamp(a: string | null, b: string | null): string | null {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;
  return new Date(a) >= new Date(b) ? a : b;
}

// ---------------------------------------------------------------------------
// Main entrypoint
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  // Authenticate
  const userClient = getUserClient(req);
  if (!userClient) {
    return errorResponse("Missing or invalid Authorization header", 401);
  }

  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return errorResponse("Unauthorized", 401);
  }

  const userId = user.id;

  if (path.endsWith("/push")) {
    return handlePush(req, userClient, userId);
  }

  if (path.endsWith("/pull")) {
    return handlePull(req, userClient, userId);
  }

  return errorResponse("Not found", 404);
});
