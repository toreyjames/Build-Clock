import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type RefreshRunStatus = 'ok' | 'partial' | 'error';

export interface RefreshRunRecord {
  trigger: string;
  status: RefreshRunStatus;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  details: Record<string, unknown>;
  error_message?: string | null;
}

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function insertRefreshRun(record: RefreshRunRecord) {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, reason: 'supabase-not-configured' as const };

  const { error } = await supabase.from('refresh_runs').insert(record);
  if (error) return { success: false, reason: error.message as string };
  return { success: true as const };
}

export async function getLatestRefreshRun() {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, reason: 'supabase-not-configured' as const, data: null };

  const { data, error } = await supabase
    .from('refresh_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { success: false, reason: error.message as string, data: null };
  return { success: true as const, data };
}
