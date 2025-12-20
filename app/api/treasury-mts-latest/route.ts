import { NextResponse } from 'next/server'

type TreasuryMtsLatestResponse =
  | {
      ok: true
      classification: string
      recordDate: string
      value: number
      field: string
      source: 'Treasury Fiscal Data (MTS Table 4)'
      sourceUrl: string
    }
  | { ok: false; error: string }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const classification = (searchParams.get('classification') || 'Customs Duties').trim()
  const field = (searchParams.get('field') || 'current_month_net_rcpt_amt').trim()

  // MTS Table 4 includes receipts by classification (incl. "Customs Duties")
  const base =
    'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_4'

  const qs = new URLSearchParams()
  qs.set('filter', `classification_desc:eq:${classification}`)
  qs.set('sort', '-record_date')
  qs.set('page[size]', '1')

  const url = `${base}?${qs.toString()}`
  const sourceUrl = 'https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/receipts'

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 } }) // 1h cache
    if (!res.ok) {
      return NextResponse.json<TreasuryMtsLatestResponse>(
        { ok: false, error: `Treasury MTS fetch failed (${res.status})` },
        { status: 502 },
      )
    }

    const json = (await res.json()) as { data?: Record<string, string>[] }
    const row = json.data?.[0]
    if (!row) {
      return NextResponse.json<TreasuryMtsLatestResponse>({ ok: false, error: 'No data returned' }, { status: 502 })
    }

    const recordDate = row.record_date
    const rawValue = row[field]
    const value = Number(rawValue)
    if (!recordDate || !Number.isFinite(value)) {
      return NextResponse.json<TreasuryMtsLatestResponse>(
        { ok: false, error: `Missing/invalid fields. record_date=${String(recordDate)} ${field}=${String(rawValue)}` },
        { status: 502 },
      )
    }

    return NextResponse.json<TreasuryMtsLatestResponse>({
      ok: true,
      classification,
      recordDate,
      value,
      field,
      source: 'Treasury Fiscal Data (MTS Table 4)',
      sourceUrl,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json<TreasuryMtsLatestResponse>({ ok: false, error: msg }, { status: 502 })
  }
}


