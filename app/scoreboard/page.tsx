'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  textDim: '#484f58',
  accent: '#7ee787',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

type FredLatestOk = { ok: true; id: string; date: string; value: number; source: 'FRED'; sourceUrl: string }
type FredLatestResp = FredLatestOk | { ok: false; error: string }

type MtsLatestOk = {
  ok: true
  classification: string
  recordDate: string
  value: number
  field: string
  source: 'Treasury Fiscal Data (MTS Table 4)'
  sourceUrl: string
}
type MtsLatestResp = MtsLatestOk | { ok: false; error: string }

function formatPercent(v: number, decimals = 1) {
  return `${v.toFixed(decimals)}%`
}

function formatBillionsUsd(v: number) {
  // Most FRED series here are in billions or index units; keep conservative formatting.
  const abs = Math.abs(v)
  if (abs >= 1000) return `$${(v / 1000).toFixed(2)}T`
  return `$${v.toFixed(1)}B`
}

function formatDollars(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(2)}T`
  if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${v.toFixed(0)}`
}

async function fetchFredLatest(id: string): Promise<FredLatestResp> {
  const res = await fetch(`/api/fred-latest?id=${encodeURIComponent(id)}`)
  return (await res.json()) as FredLatestResp
}

async function fetchMtsLatest(classification: string): Promise<MtsLatestResp> {
  const res = await fetch(`/api/treasury-mts-latest?classification=${encodeURIComponent(classification)}`)
  return (await res.json()) as MtsLatestResp
}

export default function ScoreboardPage() {
  const [fred, setFred] = useState<Record<string, FredLatestResp>>({})
  const [mts, setMts] = useState<Record<string, MtsLatestResp>>({})
  const [loading, setLoading] = useState(true)

  const series = useMemo(
    () => [
      { id: 'TLMFGCONS', label: 'Factory construction spending', unitHint: '($, SAAR)', format: (v: number) => formatBillionsUsd(v) },
      { id: 'W170RC1Q027SBEA', label: 'Government investment (% of GDP)', unitHint: '(%)', format: (v: number) => formatPercent(v, 1) },
      { id: 'VAPGDPMA', label: 'Manufacturing share of GDP', unitHint: '(%)', format: (v: number) => formatPercent(v, 1) },
      { id: 'IMPCH', label: 'Import price index (all commodities)', unitHint: '(index)', format: (v: number) => v.toFixed(1) },
      { id: 'BOPGSTB', label: 'Trade balance (goods & services)', unitHint: '($, SAAR)', format: (v: number) => formatBillionsUsd(v) },
    ],
    [],
  )

  const treasurySeries = useMemo(
    () => [
      { classification: 'Customs Duties', label: 'Customs duties receipts (monthly)', format: (v: number) => formatDollars(v) },
    ],
    [],
  )

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        const fredEntries = await Promise.all(series.map(s => fetchFredLatest(s.id).then(r => [s.id, r] as const)))
        const mtsEntries = await Promise.all(
          treasurySeries.map(s => fetchMtsLatest(s.classification).then(r => [s.classification, r] as const)),
        )

        if (cancelled) return
        setFred(Object.fromEntries(fredEntries))
        setMts(Object.fromEntries(mtsEntries))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [series, treasurySeries])

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ color: COLORS.accent }}>BUILD</span> CLOCK
              </Link>
            </h1>
            <p style={styles.subtitle}>Manhattan Scoreboard: live macro + tariff/trade indicators</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/" style={styles.radarLink}>
              ← Build Clock
            </Link>
            <Link href="/tariff-tracker" style={styles.radarLink}>
              Tariff Tracker →
            </Link>
            <Link href="/policy-gaps" style={styles.radarLink}>
              Policy Gaps →
            </Link>
            <Link href="/references" style={styles.radarLink}>
              References →
            </Link>
          </div>
        </header>

        <section style={styles.intro}>
          <h2 style={styles.h2}>What’s “live” vs. “framed”</h2>
          <p style={styles.p}>
            This scoreboard pulls the <strong>latest public observations</strong> from primary sources and shows their timestamps.
            Use it to track whether the AI Manhattan buildout is translating into real capacity and macro outcomes.
          </p>
          <div style={styles.noteBox}>
            <div style={styles.noteTitle}>Attribution caveat (important)</div>
            <div style={styles.noteText}>
              These indicators are best treated as <strong>outcome telemetry</strong> (what’s happening), not proof of causality.
              Policy impacts are lagged and confounded. Where we can, we’ll add event windows (e.g., CHIPS/IRA, major tariff changes)
              and show “before/after” context, but causal attribution requires formal econometrics.
            </div>
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>MACRO</div>
            <div style={styles.sectionTitle}>Core series</div>
            <div style={styles.sectionSub}>{loading ? 'Loading live pulls…' : 'Latest observations shown with dates.'}</div>
          </div>

          <div style={styles.cards}>
            {series.map(s => {
              const r = fred[s.id]
              const ok = r && (r as FredLatestOk).ok
              return (
                <div key={s.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardLabel}>{s.label}</div>
                    <div style={styles.badge}>{ok ? 'LIVE' : 'ERROR'}</div>
                  </div>
                  <div style={styles.value}>
                    {ok ? s.format((r as FredLatestOk).value) : '—'}
                    <span style={styles.unitHint}>{s.unitHint}</span>
                  </div>
                  <div style={styles.meta}>
                    {ok ? (
                      <>
                        <span style={styles.metaItem}>As of {(r as FredLatestOk).date}</span>
                        <span style={styles.metaSep}>•</span>
                        <a href={(r as FredLatestOk).sourceUrl} target="_blank" rel="noreferrer" style={styles.link}>
                          FRED ↗
                        </a>
                      </>
                    ) : (
                      <span style={styles.metaItem}>{r ? (r as { ok: false; error: string }).error : 'No data'}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>TARIFF/TRADE PROXY</div>
            <div style={styles.sectionTitle}>Treasury receipts</div>
            <div style={styles.sectionSub}>
              Directly tracks collections associated with imports (not total economic welfare impact).
            </div>
          </div>

          <div style={styles.cards}>
            {treasurySeries.map(s => {
              const r = mts[s.classification]
              const ok = r && (r as MtsLatestOk).ok
              return (
                <div key={s.classification} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardLabel}>{s.label}</div>
                    <div style={styles.badge}>{ok ? 'LIVE' : 'ERROR'}</div>
                  </div>
                  <div style={styles.value}>{ok ? s.format((r as MtsLatestOk).value) : '—'}</div>
                  <div style={styles.meta}>
                    {ok ? (
                      <>
                        <span style={styles.metaItem}>As of {(r as MtsLatestOk).recordDate}</span>
                        <span style={styles.metaSep}>•</span>
                        <a href={(r as MtsLatestOk).sourceUrl} target="_blank" rel="noreferrer" style={styles.link}>
                          Treasury Fiscal Data ↗
                        </a>
                      </>
                    ) : (
                      <span style={styles.metaItem}>{r ? (r as { ok: false; error: string }).error : 'No data'}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* TARIFF TRACKER CALLOUT */}
        <section style={styles.tariffCallout}>
          <div style={styles.tariffCalloutIcon}>📊</div>
          <div style={styles.tariffCalloutContent}>
            <div style={styles.tariffCalloutTitle}>Tariff Tracker</div>
            <div style={styles.tariffCalloutText}>
              Are tariffs working? The J-curve hypothesis says drag now, payoff later—<strong>but only if reshoring is AI Manhattan-aligned</strong>. 
              We track sector-by-sector investment to measure alignment.
            </div>
            <Link href="/tariff-tracker" style={styles.tariffCalloutLink}>
              Open Tariff Tracker →
            </Link>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • Scoreboard</span>
            <span style={styles.footerDivider}>•</span>
            <span>Last Updated: December 2025</span>
          </div>
        </footer>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    padding: '2rem 1rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  radarLink: {
    padding: '0.6rem 1.2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.text,
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-block',
  },
  intro: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  h2: {
    margin: 0,
    marginBottom: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: 800,
  },
  p: {
    margin: 0,
    color: COLORS.textMuted,
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  noteBox: {
    marginTop: '1.25rem',
    padding: '1.1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.warning}`,
    borderRadius: '10px',
  },
  noteTitle: {
    fontWeight: 900,
    marginBottom: '0.35rem',
    color: COLORS.warning,
  },
  noteText: {
    color: COLORS.textMuted,
    lineHeight: 1.65,
    fontSize: '0.9rem',
  },
  grid: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    marginBottom: '1rem',
  },
  sectionKicker: {
    color: COLORS.textDim,
    fontWeight: 900,
    letterSpacing: '0.12em',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: 900,
    marginTop: '0.35rem',
  },
  sectionSub: {
    color: COLORS.textMuted,
    fontSize: '0.9rem',
    marginTop: '0.35rem',
    lineHeight: 1.6,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '1.25rem',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    alignItems: 'center',
    marginBottom: '0.9rem',
  },
  cardLabel: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: COLORS.text,
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    padding: '0.25rem 0.5rem',
    borderRadius: '999px',
    border: `1px solid ${COLORS.accent}55`,
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '14',
  },
  value: {
    fontSize: '1.6rem',
    fontWeight: 900,
    marginBottom: '0.75rem',
  },
  unitHint: {
    marginLeft: '0.35rem',
    fontSize: '0.8rem',
    color: COLORS.textDim,
    fontWeight: 700,
  },
  meta: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    lineHeight: 1.5,
  },
  metaItem: {},
  metaSep: { color: COLORS.border },
  link: { color: COLORS.blue, textDecoration: 'none' },
  footer: {
    marginTop: '3rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: 'center',
  },
  footerContent: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  footerDivider: {
    margin: '0 0.75rem',
    color: COLORS.border,
  },
  // Reality Check section
  realityCheck: {
    marginBottom: '2rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.danger}40`,
    borderRadius: '12px',
  },
  realityHeader: {
    marginBottom: '1.5rem',
  },
  realityKicker: {
    color: COLORS.danger,
    fontWeight: 900,
    letterSpacing: '0.12em',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  realityTitle: {
    fontSize: '1.5rem',
    fontWeight: 900,
    marginTop: '0.35rem',
  },
  realitySub: {
    color: COLORS.textMuted,
    fontSize: '0.95rem',
    marginTop: '0.35rem',
    lineHeight: 1.6,
  },
  realityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  realityCard: {
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '1.25rem',
  },
  realityCardLabel: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: COLORS.textMuted,
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  realityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  realityBefore: {
    textAlign: 'center' as const,
  },
  realityAfter: {
    textAlign: 'center' as const,
  },
  realityArrow: {
    fontSize: '1.2rem',
    color: COLORS.textDim,
  },
  realitySmallLabel: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  realityBigNum: {
    fontSize: '1.5rem',
    fontWeight: 900,
    color: COLORS.text,
  },
  realitySingleNum: {
    textAlign: 'center' as const,
    marginBottom: '0.75rem',
  },
  realitySource: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
  },
  verdictBox: {
    padding: '1.25rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.danger}`,
    borderRadius: '10px',
  },
  verdictTitle: {
    fontSize: '1rem',
    fontWeight: 900,
    color: COLORS.danger,
    marginBottom: '0.5rem',
  },
  verdictText: {
    fontSize: '0.95rem',
    color: COLORS.textMuted,
    lineHeight: 1.65,
    marginBottom: '0.75rem',
  },
  verdictImplication: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.65,
    paddingTop: '0.75rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  // Tariff Callout
  tariffCallout: {
    display: 'flex',
    gap: '1.25rem',
    padding: '1.5rem',
    backgroundColor: COLORS.purple + '15',
    border: `1px solid ${COLORS.purple}40`,
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  tariffCalloutIcon: {
    fontSize: '2rem',
  },
  tariffCalloutContent: {},
  tariffCalloutTitle: {
    fontSize: '1.1rem',
    fontWeight: 900,
    marginBottom: '0.5rem',
  },
  tariffCalloutText: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    marginBottom: '0.75rem',
  },
  tariffCalloutLink: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: COLORS.purple,
    textDecoration: 'none',
  },
}


