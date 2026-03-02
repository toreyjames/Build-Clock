import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IntelEvent, LiveStream, ProjectLifecycleStatus, StatusHistoryEntry } from "@/lib/intel-types";

type DbRow = Record<string, unknown>;

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function loadPersistedIntelEvents(projectId?: string, limit = 200): Promise<IntelEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("intel_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  return data.map((raw) => {
    const row = raw as DbRow;
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      timestamp: String(row.timestamp),
      type: row.type as IntelEvent["type"],
      impact: row.impact as IntelEvent["impact"],
      source: String(row.source),
      title: String(row.title),
      summary: String(row.summary),
      url: String(row.url),
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    };
  });
}

export async function insertIntelEvent(event: Omit<IntelEvent, "id"> & { id?: string }) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, reason: "supabase-not-configured" };

  const payload = {
    id: event.id ?? `${event.projectId}-${Date.now()}`,
    project_id: event.projectId,
    timestamp: event.timestamp,
    type: event.type,
    impact: event.impact,
    source: event.source,
    title: event.title,
    summary: event.summary,
    url: event.url,
    tags: event.tags,
  };

  const { error } = await supabase.from("intel_events").upsert(payload, { onConflict: "id" });
  if (error) return { success: false, reason: error.message };
  return { success: true };
}

export async function loadStatusHistory(projectId?: string, limit = 200): Promise<StatusHistoryEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("intel_status_history")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(limit);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((raw) => {
    const row = raw as DbRow;
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      fromStatus: (row.from_status ?? null) as ProjectLifecycleStatus | null,
      toStatus: row.to_status as ProjectLifecycleStatus,
      reason: String(row.reason),
      evidenceUrl: (row.evidence_url ?? null) as string | null,
      changedAt: String(row.changed_at),
    };
  });
}

export async function appendStatusHistory(
  entry: Omit<StatusHistoryEntry, "id"> & { id?: string },
) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, reason: "supabase-not-configured" };

  const payload = {
    id: entry.id ?? `${entry.projectId}-${Date.now()}`,
    project_id: entry.projectId,
    from_status: entry.fromStatus,
    to_status: entry.toStatus,
    reason: entry.reason,
    evidence_url: entry.evidenceUrl ?? null,
    changed_at: entry.changedAt,
  };

  const { error } = await supabase.from("intel_status_history").upsert(payload, { onConflict: "id" });
  if (error) return { success: false, reason: error.message };
  return { success: true };
}

export async function loadLiveStreams(projectId?: string, limit = 200): Promise<LiveStream[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("intel_live_streams")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((raw) => {
    const row = raw as DbRow;
    return {
      id: String(row.id),
      projectId: String(row.project_id),
      title: String(row.title),
      provider: String(row.provider),
      streamUrl: String(row.stream_url),
      verified: Boolean(row.verified),
      coverageScope: String(row.coverage_scope),
      lastVerifiedAt: (row.last_verified_at ?? null) as string | null,
    };
  });
}

export async function upsertLiveStream(stream: LiveStream) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, reason: "supabase-not-configured" };

  const payload = {
    id: stream.id,
    project_id: stream.projectId,
    title: stream.title,
    provider: stream.provider,
    stream_url: stream.streamUrl,
    verified: stream.verified,
    coverage_scope: stream.coverageScope,
    last_verified_at: stream.lastVerifiedAt,
  };

  const { error } = await supabase.from("intel_live_streams").upsert(payload, { onConflict: "id" });
  if (error) return { success: false, reason: error.message };
  return { success: true };
}
