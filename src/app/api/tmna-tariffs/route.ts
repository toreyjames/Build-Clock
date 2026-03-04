import { NextResponse } from 'next/server';

type CountryCode = 'US' | 'MX' | 'CA' | 'JP' | 'KR' | 'VN' | 'CN';

interface TariffFeedEntry {
  id: string;
  countryCode: CountryCode;
  hsPrefix: string;
  tariffRate: number;
  authority: string;
  effectiveDate: string;
  sourceLabel?: string;
}

interface TreasuryOverlay {
  customsCollectionsLatest: number | null;
  sampleCount: number;
  sourceUrl: string;
  fetchedAt: string;
}

const DEFAULT_USITC_HTS_URL =
  process.env.TMNA_USITC_HTS_URL ||
  'https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_3_json.json';

const DEFAULT_USTR_SECTION301_URL = process.env.TMNA_USTR_SECTION301_URL || '';

const DEFAULT_TREASURY_REVENUE_URL =
  process.env.TMNA_TREASURY_REVENUE_URL ||
  'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/revenue/rcm?sort=-record_date&page[size]=200';

const FALLBACK_ENTRIES: TariffFeedEntry[] = [
  { id: 'fb-1', countryCode: 'US', hsPrefix: '8708', tariffRate: 0, authority: 'Domestic baseline', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-2', countryCode: 'MX', hsPrefix: '8708', tariffRate: 0.03, authority: 'USMCA treatment', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-3', countryCode: 'CA', hsPrefix: '9401', tariffRate: 0.02, authority: 'USMCA treatment', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-4', countryCode: 'JP', hsPrefix: '8415', tariffRate: 0.08, authority: 'Tariff schedule', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-5', countryCode: 'KR', hsPrefix: '8537', tariffRate: 0.1, authority: 'Tariff schedule', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-6', countryCode: 'VN', hsPrefix: '8544', tariffRate: 0.19, authority: 'Tariff schedule', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-7', countryCode: 'CN', hsPrefix: '8507', tariffRate: 0.4, authority: 'Section 301 schedule', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
  { id: 'fb-8', countryCode: 'CN', hsPrefix: '7326', tariffRate: 0.38, authority: 'Section 301 schedule', effectiveDate: '2026-01-01', sourceLabel: 'Fallback' },
];

function toCountryCode(value: string): CountryCode | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'US' || normalized === 'MX' || normalized === 'CA' || normalized === 'JP' || normalized === 'KR' || normalized === 'VN' || normalized === 'CN') {
    return normalized;
  }
  return null;
}

function toRate(value: string | number): number {
  if (typeof value === 'number') return Math.max(0, value > 1 ? value / 100 : value);
  const cleaned = value.replace('%', '').trim();
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed > 1 ? parsed / 100 : parsed);
}

function parseCsvPayload(csv: string): TariffFeedEntry[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((value) => value.trim().toLowerCase());
  const indexOf = (name: string) => headers.indexOf(name);
  return lines.slice(1).reduce<TariffFeedEntry[]>((acc, line, rowIndex) => {
    const cols = line.split(',').map((value) => value.trim());
    const code = toCountryCode(cols[indexOf('countrycode')] || cols[indexOf('country')] || '');
    if (!code) return acc;
    acc.push({
      id: cols[indexOf('id')] || `csv-${rowIndex}`,
      countryCode: code,
      hsPrefix: (cols[indexOf('hsprefix')] || cols[indexOf('hts')] || cols[indexOf('hs')] || '0000').slice(0, 6),
      tariffRate: toRate(cols[indexOf('tariffrate')] || cols[indexOf('rate')] || '0'),
      authority: cols[indexOf('authority')] || cols[indexOf('program')] || 'Federal schedule',
      effectiveDate: cols[indexOf('effectivedate')] || cols[indexOf('date')] || '2026-01-01',
      sourceLabel: cols[indexOf('sourcelabel')] || 'Treasury GitHub',
    });
    return acc;
  }, []);
}

function inferCountryCode(record: Record<string, unknown>): CountryCode {
  const text = [
    record.country,
    record.country_code,
    record.partner_country,
    record.origin_country,
    record.name,
  ]
    .map((value) => String(value || '').toUpperCase())
    .join(' ');

  if (text.includes('MEX')) return 'MX';
  if (text.includes('CAN')) return 'CA';
  if (text.includes('JAP')) return 'JP';
  if (text.includes('KOR')) return 'KR';
  if (text.includes('VIE')) return 'VN';
  if (text.includes('CHINA') || text.includes('PRC') || text.includes('CN')) return 'CN';
  return 'US';
}

function parseUsitcPayload(payload: unknown): TariffFeedEntry[] {
  if (!Array.isArray(payload)) return [];
  return payload.slice(0, 12000).reduce<TariffFeedEntry[]>((acc, row, idx) => {
    if (typeof row !== 'object' || row === null) return acc;
    const rec = row as Record<string, unknown>;
    const hs = String(rec.htsno || rec.hts8 || rec.hts10 || rec.hs || '').replace(/[^\d]/g, '');
    if (hs.length < 4) return acc;
    const dutyText = String(
      rec.general || rec.general_rate || rec.rate || rec['rate of duty 1'] || rec['rate_of_duty_1'] || ''
    );
    const duty = toRate(dutyText);
    acc.push({
      id: `usitc-${idx}`,
      countryCode: inferCountryCode(rec),
      hsPrefix: hs.slice(0, 6),
      tariffRate: duty,
      authority: 'USITC HTS',
      effectiveDate: String(rec.effective_date || rec.date || '2026-02-11'),
      sourceLabel: 'USITC HTS',
    });
    return acc;
  }, []);
}

function parseUstrPayload(payload: unknown): TariffFeedEntry[] {
  if (!Array.isArray(payload)) return [];
  return payload.reduce<TariffFeedEntry[]>((acc, row, index) => {
    if (typeof row !== 'object' || row === null) return acc;
    const rec = row as Record<string, unknown>;
    const hs = String(rec.hts || rec.hs || rec.hts_subheading || '').replace(/[^\d]/g, '');
    if (hs.length < 4) return acc;
    acc.push({
      id: `ustr-${index}`,
      countryCode: 'CN',
      hsPrefix: hs.slice(0, 6),
      tariffRate: toRate(rec.section301_rate as string | number),
      authority: String(rec.action || rec.list || 'USTR Section 301'),
      effectiveDate: String(rec.effective_date || rec.date || '2026-01-01'),
      sourceLabel: 'USTR Section 301',
    });
    return acc;
  }, []);
}

async function fetchTreasuryOverlay(): Promise<TreasuryOverlay | null> {
  try {
    const response = await fetch(DEFAULT_TREASURY_REVENUE_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: Record<string, unknown>[] };
    const rows = Array.isArray(json.data) ? json.data : [];
    const customs = rows.filter((row) =>
      Object.values(row).some((value) => String(value || '').toLowerCase().includes('customs'))
    );
    const amountFieldOrder = ['net_collections_amt', 'current_fytd_net_rcpt_amt', 'transaction_today_amt'];
    const latest =
      customs.find((row) => amountFieldOrder.some((field) => row[field] !== undefined)) ||
      rows.find((row) => amountFieldOrder.some((field) => row[field] !== undefined));
    const amount = latest
      ? Number(
          amountFieldOrder
            .map((field) => latest[field])
            .find((value) => value !== undefined && value !== null && String(value).length > 0)
        )
      : Number.NaN;
    return {
      customsCollectionsLatest: Number.isFinite(amount) ? amount : null,
      sampleCount: customs.length,
      sourceUrl: DEFAULT_TREASURY_REVENUE_URL,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const fetchedAt = new Date().toISOString();
  const treasuryOverlay = await fetchTreasuryOverlay();

  try {
    const usitcResponse = await fetch(DEFAULT_USITC_HTS_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!usitcResponse.ok) throw new Error(`USITC upstream returned ${usitcResponse.status}`);

    const usitcBody = await usitcResponse.text();
    const usitcEntries = parseUsitcPayload(JSON.parse(usitcBody));

    let ustrEntries: TariffFeedEntry[] = [];
    if (DEFAULT_USTR_SECTION301_URL) {
      try {
        const ustrResponse = await fetch(DEFAULT_USTR_SECTION301_URL, {
          headers: { Accept: 'application/json, text/csv;q=0.9, text/plain;q=0.8' },
          cache: 'no-store',
        });
        if (ustrResponse.ok) {
          const ct = ustrResponse.headers.get('content-type') || '';
          const body = await ustrResponse.text();
          ustrEntries = ct.includes('json') ? parseUstrPayload(JSON.parse(body)) : parseCsvPayload(body);
          ustrEntries = ustrEntries.map((entry) => ({ ...entry, sourceLabel: 'USTR Section 301', countryCode: 'CN' }));
        }
      } catch {
        ustrEntries = [];
      }
    }

    const entries = [...usitcEntries, ...ustrEntries];

    if (entries.length === 0) {
      throw new Error('Feed parsed but produced zero usable entries');
    }

    return NextResponse.json({
      entries,
      sourceUrl: DEFAULT_USITC_HTS_URL,
      ustrSourceUrl: DEFAULT_USTR_SECTION301_URL || null,
      treasuryOverlay,
      fetchedAt,
      fallbackUsed: false,
    });
  } catch (error) {
    return NextResponse.json({
      entries: FALLBACK_ENTRIES,
      sourceUrl: DEFAULT_USITC_HTS_URL,
      ustrSourceUrl: DEFAULT_USTR_SECTION301_URL || null,
      treasuryOverlay,
      fetchedAt,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
