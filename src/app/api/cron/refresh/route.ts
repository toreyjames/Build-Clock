import { NextResponse } from 'next/server';
import { insertRefreshRun, type RefreshRunStatus } from '@/lib/refresh-health';

type RefreshProbe = {
  endpoint: string;
  ok: boolean;
  status: number;
  count: number | null;
  error?: string;
};

function inferCount(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.opportunities)) return obj.opportunities.length;
  if (Array.isArray(obj.items)) return obj.items.length;
  if (Array.isArray(obj.news)) return obj.news.length;
  if (obj.stats && typeof obj.stats === 'object') {
    const stats = obj.stats as Record<string, unknown>;
    if (typeof stats.total === 'number') return stats.total;
  }
  return null;
}

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get('x-vercel-cron');
  const authHeader = request.headers.get('authorization');

  if (vercelCron) return true;
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const started = Date.now();
  const startedAt = new Date(started).toISOString();
  const origin = new URL(request.url).origin;
  const endpoints = [
    '/api/opportunities?live=true',
    '/api/live-feed',
    '/api/commercial',
    '/api/grid-infra',
  ];

  let probes: RefreshProbe[] = [];
  let topLevelError: string | null = null;

  try {
    probes = await Promise.all(endpoints.map(async (path): Promise<RefreshProbe> => {
      try {
        const res = await fetch(`${origin}${path}`, { cache: 'no-store' });
        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        return {
          endpoint: path,
          ok: res.ok,
          status: res.status,
          count: inferCount(payload),
          error: res.ok ? undefined : `HTTP ${res.status}`,
        };
      } catch (error) {
        return {
          endpoint: path,
          ok: false,
          status: 0,
          count: null,
          error: error instanceof Error ? error.message : 'request-failed',
        };
      }
    }));
  } catch (error) {
    topLevelError = error instanceof Error ? error.message : 'refresh-failed';
  }

  const allOk = probes.length > 0 && probes.every((probe) => probe.ok);
  const anyOk = probes.some((probe) => probe.ok);
  const finalStatus: RefreshRunStatus =
    topLevelError ? 'error' : allOk ? 'ok' : anyOk ? 'partial' : 'error';

  const finished = Date.now();
  const finishedAt = new Date(finished).toISOString();
  const runDetails = {
    probes,
    totalEndpoints: endpoints.length,
    okEndpoints: probes.filter((probe) => probe.ok).length,
    origin,
  };

  const persisted = await insertRefreshRun({
    trigger: 'cron',
    status: finalStatus,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: finished - started,
    details: runDetails,
    error_message: topLevelError,
  });

  return NextResponse.json({
    success: finalStatus !== 'error',
    status: finalStatus,
    startedAt,
    finishedAt,
    durationMs: finished - started,
    persisted,
    probes,
    error: topLevelError,
  }, { status: finalStatus === 'error' ? 500 : 200 });
}
