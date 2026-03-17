import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const OT_RADAR_URL = process.env.OT_RADAR_URL || '';
const FETCH_TIMEOUT_MS = 15_000;

export interface OTRadarSignal {
  id: string;
  source: string;
  sourceId: string;
  timestamp: string;
  entity: string;
  sector: string;
  signalType: string;
  location: string;
  value: number;
  description: string;
  url: string;
  otRelevanceScore: number;
  otKeywords: string[];
  rawData?: Record<string, unknown>;
}

interface RadarResponse {
  success: boolean;
  signals: OTRadarSignal[];
  meta: { total: number; filtered: number; timestamp: string; source: string };
}

async function fetchRadar(params: URLSearchParams): Promise<{ signals: OTRadarSignal[]; available: boolean }> {
  if (!OT_RADAR_URL) return { signals: [], available: false };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const qs = params.toString();
    const url = `${OT_RADAR_URL}/api/signals${qs ? `?${qs}` : ''}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (!res.ok) return { signals: [], available: false };

    const body = (await res.json()) as RadarResponse;
    if (!body.success || !Array.isArray(body.signals)) return { signals: [], available: false };

    return { signals: body.signals, available: true };
  } catch {
    return { signals: [], available: false };
  }
}

async function checkHealth(): Promise<boolean> {
  if (!OT_RADAR_URL) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${OT_RADAR_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    for (const key of ['sector', 'since', 'signalType', 'minRelevance', 'limit']) {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    }
    if (!params.has('limit')) params.set('limit', '200');

    const [radarResult, available] = await Promise.all([fetchRadar(params), checkHealth()]);

    return NextResponse.json({
      success: true,
      signals: radarResult.signals,
      radarStatus: radarResult.available ? 'connected' : available ? 'connected' : 'unavailable',
      meta: {
        count: radarResult.signals.length,
        timestamp: new Date().toISOString(),
        source: 'ot-radar',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, signals: [], radarStatus: 'error', error: String(error) },
      { status: 502 },
    );
  }
}
