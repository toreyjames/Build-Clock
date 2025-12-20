import { NextResponse } from 'next/server'

type FredLatestResponse =
  | {
      ok: true
      id: string
      date: string
      value: number
      source: 'FRED'
      sourceUrl: string
    }
  | {
      ok: false
      error: string
    }

function parseFredGraphCsvLatest(csvText: string): { date: string; value: number } | null {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  // Expected format:
  // DATE,VALUE
  // 2024-01-01,123.4
  for (let i = lines.length - 1; i >= 1; i--) {
    const line = lines[i]
    const [date, rawValue] = line.split(',')
    if (!date || !rawValue) continue
    if (rawValue === '.' || rawValue.toLowerCase() === 'nan') continue
    const value = Number(rawValue)
    if (!Number.isFinite(value)) continue
    return { date, value }
  }

  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')?.trim()

  if (!id) {
    return NextResponse.json<FredLatestResponse>({ ok: false, error: 'Missing required query param: id' }, { status: 400 })
  }

  const sourceUrl = `https://fred.stlouisfed.org/series/${encodeURIComponent(id)}`
  const csvUrl = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}`

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 60 * 60 } }) // 1h cache
    if (!res.ok) {
      return NextResponse.json<FredLatestResponse>(
        { ok: false, error: `FRED fetch failed (${res.status})` },
        { status: 502 },
      )
    }
    const text = await res.text()
    const latest = parseFredGraphCsvLatest(text)
    if (!latest) {
      return NextResponse.json<FredLatestResponse>({ ok: false, error: 'Could not parse latest observation' }, { status: 502 })
    }

    return NextResponse.json<FredLatestResponse>({
      ok: true,
      id,
      date: latest.date,
      value: latest.value,
      source: 'FRED',
      sourceUrl,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json<FredLatestResponse>({ ok: false, error: msg }, { status: 502 })
  }
}


