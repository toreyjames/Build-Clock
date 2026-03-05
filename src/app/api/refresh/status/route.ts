import { NextResponse } from 'next/server';
import { getLatestRefreshRun } from '@/lib/refresh-health';

export async function GET() {
  const latest = await getLatestRefreshRun();
  const now = Date.now();

  if (!latest.success) {
    return NextResponse.json({
      success: false,
      reason: latest.reason,
      scheduler: {
        cadenceMinutes: 15,
        healthy: false,
      },
      latestRun: null,
    });
  }

  const row = latest.data as {
    started_at?: string;
    finished_at?: string;
    status?: string;
    duration_ms?: number;
    details?: Record<string, unknown>;
    error_message?: string | null;
  } | null;

  if (!row) {
    return NextResponse.json({
      success: true,
      scheduler: {
        cadenceMinutes: 15,
        healthy: false,
      },
      latestRun: null,
    });
  }

  const finishedAt = row.finished_at || row.started_at || null;
  const ageMinutes = finishedAt ? Math.round((now - new Date(finishedAt).getTime()) / 60000) : null;
  const healthy = row.status === 'ok' && ageMinutes !== null && ageMinutes <= 30;

  return NextResponse.json({
    success: true,
    scheduler: {
      cadenceMinutes: 15,
      healthy,
      ageMinutes,
    },
    latestRun: {
      status: row.status || 'unknown',
      startedAt: row.started_at || null,
      finishedAt,
      durationMs: row.duration_ms || null,
      details: row.details || {},
      error: row.error_message || null,
    },
  });
}
