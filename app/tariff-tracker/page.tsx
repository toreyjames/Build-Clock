'use client'

import { useEffect, useState } from 'react'
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

// ============================================================================
// AI MANHATTAN PHYSICAL PREREQUISITES
// The infrastructure required to capture AI's GDP potential
// ============================================================================

// GDP LEVERAGE: What AI could deliver vs what it requires physically
// Sources: McKinsey Global Institute, PwC, Goldman Sachs AI research
const AI_GDP_LEVERAGE = {
  globalPotential: { low: 13, high: 25, unit: 'T', source: 'McKinsey 2023', note: 'Global AI GDP impact by 2030' },
  usPotential: { low: 2.6, high: 4.6, unit: 'T', source: 'PwC/Goldman estimates', note: 'US share of AI GDP boost' },
  usGdp2024: 29.2, // $29.2T current US GDP
  targetGdpBoost: 3.5, // Midpoint estimate: $3.5T potential GDP from AI
}

// PHYSICAL PREREQUISITES: What must be built to capture AI GDP
// Each prerequisite has: current state, required state, gap, and investment needed
interface PhysicalPrerequisite {
  id: string
  name: string
  icon: string
  current: { value: number; unit: string; label: string }
  required: { value: number; unit: string; label: string; by: string }
  gap: { value: number; unit: string }
  investmentNeeded: number // $B
  investmentTracked: number // $B in current pipeline
  source: string
  sourceUrl: string
  aiRelevance: string
}

const PHYSICAL_PREREQUISITES: PhysicalPrerequisite[] = [
  {
    id: 'power',
    name: 'Power Generation',
    icon: '⚡',
    current: { value: 20, unit: 'GW', label: 'Data center power today' },
    required: { value: 50, unit: 'GW', label: 'Data center power needed', by: '2030' },
    gap: { value: 30, unit: 'GW' },
    investmentNeeded: 150, // ~$5B/GW for mixed generation
    investmentTracked: 115, // Grid + nuclear from pipeline
    source: 'IEA, DOE',
    sourceUrl: 'https://www.iea.org/reports/electricity-2024',
    aiRelevance: 'AI data centers need 100MW+ each. No power = no AI.',
  },
  {
    id: 'chips',
    name: 'AI Chip Production',
    icon: '🔬',
    current: { value: 12, unit: '%', label: 'US share of global chips' },
    required: { value: 25, unit: '%', label: 'Strategic independence target', by: '2030' },
    gap: { value: 13, unit: '%' },
    investmentNeeded: 350, // Major fab buildout
    investmentTracked: 295, // Semiconductor fabs + packaging from pipeline
    source: 'SIA, CHIPS Act',
    sourceUrl: 'https://www.semiconductors.org/',
    aiRelevance: 'AI runs on chips. Taiwan makes 90% of advanced chips. Single point of failure.',
  },
  {
    id: 'datacenters',
    name: 'AI Data Centers',
    icon: '🧠',
    current: { value: 5500, unit: 'MW', label: 'AI-capable DC capacity' },
    required: { value: 15000, unit: 'MW', label: 'AI DC capacity needed', by: '2028' },
    gap: { value: 9500, unit: 'MW' },
    investmentNeeded: 200, // Stargate + hyperscaler builds
    investmentTracked: 150, // From announced projects
    source: 'Synergy Research, Stargate',
    sourceUrl: 'https://www.srgresearch.com/',
    aiRelevance: 'Physical compute infrastructure for AI training and inference.',
  },
  {
    id: 'grid',
    name: 'Grid & Transmission',
    icon: '🔌',
    current: { value: 1.2, unit: 'TW', label: 'Current grid capacity' },
    required: { value: 1.8, unit: 'TW', label: 'Needed for AI + factories', by: '2035' },
    gap: { value: 0.6, unit: 'TW' },
    investmentNeeded: 200, // Transmission + transformers + substations
    investmentTracked: 85, // From grid projects
    source: 'DOE, Princeton Net Zero',
    sourceUrl: 'https://www.energy.gov/gdo',
    aiRelevance: 'New power is useless without transmission. 2-3yr lead time on transformers.',
  },
  {
    id: 'water',
    name: 'Water & Cooling',
    icon: '💧',
    current: { value: 0, unit: '', label: 'Constraint emerging' },
    required: { value: 0, unit: '', label: 'UPW + cooling systems', by: '2028' },
    gap: { value: 0, unit: '' },
    investmentNeeded: 25, // Water treatment + ultra-pure water
    investmentTracked: 12, // Estimated from fab requirements
    source: 'Semiconductor fabs',
    sourceUrl: 'https://www.semiconductors.org/',
    aiRelevance: 'Fabs need ultra-pure water. Data centers need cooling. Water rights contested.',
  },
]

// Calculate totals
const TOTAL_INVESTMENT_NEEDED = PHYSICAL_PREREQUISITES.reduce((sum, p) => sum + p.investmentNeeded, 0)
const TOTAL_INVESTMENT_TRACKED = PHYSICAL_PREREQUISITES.reduce((sum, p) => sum + p.investmentTracked, 0)
const PHYSICAL_UPLIFT_COVERAGE = Math.round((TOTAL_INVESTMENT_TRACKED / TOTAL_INVESTMENT_NEEDED) * 100)

// ============================================================================
// TARIFF ALIGNMENT: Where is reshoring investment actually going?
// ============================================================================

interface SectorInvestment {
  name: string
  category: 'ai-manhattan' | 'enabling' | 'off-target'
  investmentB: number
  projects: string[]
  aiRelevance: 'direct' | 'prerequisite' | 'tangential' | 'none'
  status: 'building' | 'announced' | 'operational'
}

const SECTOR_INVESTMENTS: SectorInvestment[] = [
  // AI MANHATTAN CORE - Direct AI infrastructure
  { name: 'AI Data Centers', category: 'ai-manhattan', investmentB: 150, projects: ['Stargate ($100B)', 'Microsoft', 'Google', 'Amazon'], aiRelevance: 'direct', status: 'building' },
  { name: 'Semiconductor Fabs', category: 'ai-manhattan', investmentB: 280, projects: ['TSMC Arizona', 'Intel Ohio', 'Samsung Texas', 'Micron NY'], aiRelevance: 'direct', status: 'building' },
  { name: 'Advanced Packaging', category: 'ai-manhattan', investmentB: 15, projects: ['Amkor AZ', 'Intel packaging'], aiRelevance: 'direct', status: 'building' },
  
  // ENABLING INFRASTRUCTURE - Prerequisites for AI Manhattan
  { name: 'Grid & Transmission', category: 'enabling', investmentB: 85, projects: ['HVDC lines', 'Substation upgrades', 'Transformer mfg'], aiRelevance: 'prerequisite', status: 'building' },
  { name: 'Nuclear (Restarts + SMR)', category: 'enabling', investmentB: 30, projects: ['TMI restart', 'Palisades', 'TerraPower', 'X-energy'], aiRelevance: 'prerequisite', status: 'announced' },
  { name: 'Battery & Storage', category: 'enabling', investmentB: 120, projects: ['LG Georgia', 'Panasonic KS', 'Ford/SK BlueOval'], aiRelevance: 'prerequisite', status: 'building' },
  { name: 'Critical Minerals', category: 'enabling', investmentB: 12, projects: ['MP Materials', 'Lynas TX', 'Redwood Materials'], aiRelevance: 'prerequisite', status: 'building' },
  
  // OFF-TARGET - Tariff-protected but not AI-relevant
  { name: 'Steel & Aluminum', category: 'off-target', investmentB: 25, projects: ['Nucor expansions', 'US Steel', 'Century Aluminum'], aiRelevance: 'tangential', status: 'building' },
  { name: 'General Manufacturing', category: 'off-target', investmentB: 40, projects: ['Appliances', 'Furniture', 'Consumer goods'], aiRelevance: 'none', status: 'announced' },
]

// Calculate alignment metrics
const AI_MANHATTAN_CORE = SECTOR_INVESTMENTS.filter(s => s.category === 'ai-manhattan').reduce((sum, s) => sum + s.investmentB, 0)
const ENABLING_INFRA = SECTOR_INVESTMENTS.filter(s => s.category === 'enabling').reduce((sum, s) => sum + s.investmentB, 0)
const OFF_TARGET = SECTOR_INVESTMENTS.filter(s => s.category === 'off-target').reduce((sum, s) => sum + s.investmentB, 0)
const TOTAL_RESHORING = AI_MANHATTAN_CORE + ENABLING_INFRA + OFF_TARGET

const AI_ALIGNMENT_SCORE = Math.round(((AI_MANHATTAN_CORE + ENABLING_INFRA) / TOTAL_RESHORING) * 100)
const DIRECT_AI_SCORE = Math.round((AI_MANHATTAN_CORE / TOTAL_RESHORING) * 100)

// ============================================================================
// LIVE DATA HOOKS
// ============================================================================

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

async function fetchFredLatest(id: string): Promise<FredLatestResp> {
  const res = await fetch(`/api/fred-latest?id=${encodeURIComponent(id)}`)
  return (await res.json()) as FredLatestResp
}

async function fetchMtsLatest(classification: string): Promise<MtsLatestResp> {
  const res = await fetch(`/api/treasury-mts-latest?classification=${encodeURIComponent(classification)}`)
  return (await res.json()) as MtsLatestResp
}

function formatBillionsUsd(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1000) return `$${(v / 1000).toFixed(1)}T`
  return `$${v.toFixed(0)}B`
}

function formatDollars(v: number) {
  const abs = Math.abs(v)
  if (abs >= 1_000_000_000_000) return `$${(v / 1_000_000_000_000).toFixed(2)}T`
  if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  return `$${(v / 1_000_000).toFixed(0)}M`
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TariffTrackerPage() {
  const [factoryConstruction, setFactoryConstruction] = useState<FredLatestResp | null>(null)
  const [importPrices, setImportPrices] = useState<FredLatestResp | null>(null)
  const [customsDuties, setCustomsDuties] = useState<MtsLatestResp | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [fc, ip, cd] = await Promise.all([
        fetchFredLatest('TLMFGCONS'),
        fetchFredLatest('IMPCH'),
        fetchMtsLatest('Customs Duties'),
      ])
      if (!cancelled) {
        setFactoryConstruction(fc)
        setImportPrices(ip)
        setCustomsDuties(cd)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ color: COLORS.accent }}>BUILD</span> CLOCK
              </Link>
            </h1>
            <p style={styles.subtitle}>Tariff Tracker: AI Manhattan Alignment</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" style={styles.navLink}>← Home</Link>
            <Link href="/scoreboard" style={styles.navLink}>Scoreboard →</Link>
            <Link href="/opportunities" style={styles.navLink}>Pipeline →</Link>
          </div>
        </header>

        {/* ================================================================ */}
        {/* SECTION 1: THE THESIS */}
        {/* ================================================================ */}
        <section style={styles.thesisSection}>
          <div style={styles.thesisKicker}>THE THESIS</div>
          <h2 style={styles.thesisTitle}>AI is the GDP leverage. Tariffs are justified IF they build the physical prerequisites.</h2>
          <div style={styles.thesisGrid}>
            <div style={styles.thesisCard}>
              <div style={styles.thesisCardLabel}>AI GDP Potential (US)</div>
              <div style={styles.thesisCardValue}>
                ${AI_GDP_LEVERAGE.usPotential.low}T – ${AI_GDP_LEVERAGE.usPotential.high}T
              </div>
              <div style={styles.thesisCardNote}>by 2030 • {AI_GDP_LEVERAGE.usPotential.source}</div>
            </div>
            <div style={styles.thesisCardDivider}>
              <div style={styles.thesisCardDividerText}>requires</div>
              <div style={styles.thesisCardDividerArrow}>→</div>
            </div>
            <div style={styles.thesisCard}>
              <div style={styles.thesisCardLabel}>Physical Uplift Required</div>
              <div style={styles.thesisCardValue}>${(TOTAL_INVESTMENT_NEEDED / 1000).toFixed(1)}T+</div>
              <div style={styles.thesisCardNote}>power, chips, data centers, grid</div>
            </div>
          </div>
          <div style={styles.thesisExplainer}>
            <strong>The logic:</strong> AI could add $3-4T to US GDP—but only if we build the physical infrastructure first. 
            Tariffs create short-term pain. The question is whether they're driving investment toward <em>these specific prerequisites</em>, 
            not scattered legacy protection. This tracker measures that alignment.
          </div>
          <div style={styles.thesisScope}>
            <strong>Scope:</strong> This tracks tariffs as an <em>AI Manhattan enabler</em>. Other tariff rationales (military readiness, 
            fentanyl pressure, trade rebalancing) are real but separate. Here we measure: are tariffs building what AI needs?
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 2: PHYSICAL UPLIFT REQUIRED */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>PHYSICAL PREREQUISITES</div>
            <div style={styles.sectionTitle}>What AI Manhattan Requires</div>
            <div style={styles.sectionSubtitle}>The infrastructure gaps that must close for AI to deliver GDP leverage</div>
          </div>

          {/* Summary Card */}
          <div style={styles.upliftSummary}>
            <div style={styles.upliftSummaryLeft}>
              <div style={styles.upliftSummaryLabel}>Total Physical Uplift Required</div>
              <div style={styles.upliftSummaryValue}>${(TOTAL_INVESTMENT_NEEDED / 1000).toFixed(2)}T</div>
              <div style={styles.upliftSummaryNote}>across power, chips, data centers, grid, water</div>
            </div>
            <div style={styles.upliftSummaryRight}>
              <div style={styles.upliftSummaryLabel}>Currently Tracked in Pipeline</div>
              <div style={{ ...styles.upliftSummaryValue, color: COLORS.accent }}>
                ${(TOTAL_INVESTMENT_TRACKED / 1000).toFixed(2)}T
              </div>
              <div style={styles.upliftSummaryNote}>{PHYSICAL_UPLIFT_COVERAGE}% coverage of required uplift</div>
            </div>
            <div style={styles.upliftSummaryBar}>
              <div style={styles.upliftSummaryBarFill} />
              <div style={styles.upliftSummaryBarLabel}>{PHYSICAL_UPLIFT_COVERAGE}% of physical uplift addressed</div>
            </div>
          </div>

          {/* Prerequisites Grid */}
          <div style={styles.prerequisitesGrid}>
            {PHYSICAL_PREREQUISITES.map(prereq => {
              const coverage = prereq.investmentNeeded > 0 
                ? Math.round((prereq.investmentTracked / prereq.investmentNeeded) * 100)
                : 0
              return (
                <div key={prereq.id} style={styles.prerequisiteCard}>
                  <div style={styles.prerequisiteHeader}>
                    <span style={styles.prerequisiteIcon}>{prereq.icon}</span>
                    <span style={styles.prerequisiteName}>{prereq.name}</span>
                  </div>
                  
                  {prereq.current.value > 0 && (
                    <div style={styles.prerequisiteGap}>
                      <div style={styles.gapRow}>
                        <span style={styles.gapLabel}>Current:</span>
                        <span style={styles.gapValue}>{prereq.current.value} {prereq.current.unit}</span>
                      </div>
                      <div style={styles.gapRow}>
                        <span style={styles.gapLabel}>Needed:</span>
                        <span style={styles.gapValue}>{prereq.required.value} {prereq.required.unit}</span>
                      </div>
                      <div style={styles.gapRow}>
                        <span style={styles.gapLabel}>Gap:</span>
                        <span style={{ ...styles.gapValue, color: COLORS.warning }}>
                          {prereq.gap.value} {prereq.gap.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.prerequisiteInvestment}>
                    <div style={styles.investmentRow}>
                      <span>Investment needed:</span>
                      <span style={{ fontWeight: 700 }}>${prereq.investmentNeeded}B</span>
                    </div>
                    <div style={styles.investmentRow}>
                      <span>Currently tracked:</span>
                      <span style={{ fontWeight: 700, color: COLORS.accent }}>${prereq.investmentTracked}B</span>
                    </div>
                    <div style={styles.coverageBar}>
                      <div style={{ ...styles.coverageBarFill, width: `${Math.min(coverage, 100)}%` }} />
                    </div>
                    <div style={styles.coverageLabel}>{coverage}% covered</div>
                  </div>
                  
                  <div style={styles.prerequisiteRelevance}>
                    <strong>AI relevance:</strong> {prereq.aiRelevance}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 3: TARIFF ALIGNMENT SCORE */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>TARIFF ALIGNMENT</div>
            <div style={styles.sectionTitle}>Is Reshoring Going to the Right Places?</div>
            <div style={styles.sectionSubtitle}>Tracking whether tariff-driven investment is AI Manhattan-aligned</div>
          </div>

          {/* Big Score */}
          <div style={styles.alignmentScoreCard}>
            <div style={styles.scoreMain}>
              <div style={styles.scoreNumber}>{AI_ALIGNMENT_SCORE}%</div>
              <div style={styles.scoreLabel}>AI Manhattan Aligned</div>
              <div style={styles.scoreBreakdown}>
                <span style={{ color: COLORS.purple }}>${AI_MANHATTAN_CORE}B direct</span>
                <span style={{ color: COLORS.textDim }}>+</span>
                <span style={{ color: COLORS.blue }}>${ENABLING_INFRA}B enabling</span>
                <span style={{ color: COLORS.textDim }}>/</span>
                <span>${TOTAL_RESHORING}B total</span>
              </div>
            </div>
            <div style={styles.scoreContext}>
              <div style={styles.scoreContextItem}>
                <div style={styles.scoreContextValue}>{DIRECT_AI_SCORE}%</div>
                <div style={styles.scoreContextLabel}>Direct AI Infrastructure</div>
                <div style={styles.scoreContextNote}>Data centers, fabs, packaging</div>
              </div>
              <div style={styles.scoreContextItem}>
                <div style={styles.scoreContextValue}>{AI_ALIGNMENT_SCORE - DIRECT_AI_SCORE}%</div>
                <div style={styles.scoreContextLabel}>AI Prerequisites</div>
                <div style={styles.scoreContextNote}>Power, grid, batteries, minerals</div>
              </div>
              <div style={styles.scoreContextItem}>
                <div style={{ ...styles.scoreContextValue, color: COLORS.warning }}>{100 - AI_ALIGNMENT_SCORE}%</div>
                <div style={styles.scoreContextLabel}>Off-Target</div>
                <div style={styles.scoreContextNote}>Steel, aluminum, general mfg</div>
              </div>
            </div>
          </div>

          {/* Sector Breakdown */}
          <div style={styles.sectorColumns}>
            {/* AI Manhattan Core */}
            <div style={styles.sectorColumn}>
              <div style={{ ...styles.sectorColumnHeader, borderColor: COLORS.purple }}>
                <span style={{ color: COLORS.purple }}>🧠 AI MANHATTAN CORE</span>
                <span style={styles.sectorColumnTotal}>${AI_MANHATTAN_CORE}B</span>
              </div>
              {SECTOR_INVESTMENTS.filter(s => s.category === 'ai-manhattan').map(sector => (
                <div key={sector.name} style={styles.sectorRow}>
                  <div style={styles.sectorName}>{sector.name}</div>
                  <div style={styles.sectorAmount}>${sector.investmentB}B</div>
                  <div style={styles.sectorProjects}>{sector.projects.slice(0, 2).join(', ')}</div>
                  <div style={{ ...styles.sectorStatus, color: COLORS.accent }}>
                    Direct AI infrastructure
                  </div>
                </div>
              ))}
            </div>

            {/* Enabling Infrastructure */}
            <div style={styles.sectorColumn}>
              <div style={{ ...styles.sectorColumnHeader, borderColor: COLORS.blue }}>
                <span style={{ color: COLORS.blue }}>⚡ ENABLING INFRASTRUCTURE</span>
                <span style={styles.sectorColumnTotal}>${ENABLING_INFRA}B</span>
              </div>
              {SECTOR_INVESTMENTS.filter(s => s.category === 'enabling').map(sector => (
                <div key={sector.name} style={styles.sectorRow}>
                  <div style={styles.sectorName}>{sector.name}</div>
                  <div style={styles.sectorAmount}>${sector.investmentB}B</div>
                  <div style={styles.sectorProjects}>{sector.projects.slice(0, 2).join(', ')}</div>
                  <div style={{ ...styles.sectorStatus, color: COLORS.blue }}>
                    AI prerequisite
                  </div>
                </div>
              ))}
            </div>

            {/* Off-Target */}
            <div style={styles.sectorColumn}>
              <div style={{ ...styles.sectorColumnHeader, borderColor: COLORS.warning }}>
                <span style={{ color: COLORS.warning }}>⚠️ OFF-TARGET</span>
                <span style={styles.sectorColumnTotal}>${OFF_TARGET}B</span>
              </div>
              {SECTOR_INVESTMENTS.filter(s => s.category === 'off-target').map(sector => (
                <div key={sector.name} style={styles.sectorRow}>
                  <div style={styles.sectorName}>{sector.name}</div>
                  <div style={styles.sectorAmount}>${sector.investmentB}B</div>
                  <div style={styles.sectorProjects}>{sector.projects.slice(0, 2).join(', ')}</div>
                  <div style={{ ...styles.sectorStatus, color: COLORS.warning }}>
                    Not AI-relevant
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 4: LIVE INDICATORS */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>LIVE TELEMETRY</div>
            <div style={styles.sectionTitle}>Real-Time Indicators</div>
            <div style={styles.sectionSubtitle}>Tracking reshoring activity and tariff impact</div>
          </div>

          <div style={styles.indicatorGrid}>
            {/* Factory Construction */}
            <div style={styles.indicatorCard}>
              <div style={styles.indicatorLabel}>Factory Construction Spending</div>
              <div style={styles.indicatorValue}>
                {loading ? '...' : factoryConstruction?.ok ? formatBillionsUsd((factoryConstruction as FredLatestOk).value) : '—'}
                <span style={styles.indicatorUnit}>/year</span>
              </div>
              <div style={styles.indicatorDelta}>
                <span style={{ color: COLORS.accent }}>+150% since 2021</span>
              </div>
              <div style={styles.indicatorMeta}>
                {factoryConstruction?.ok && <span>As of {(factoryConstruction as FredLatestOk).date} • <a href={(factoryConstruction as FredLatestOk).sourceUrl} target="_blank" rel="noreferrer" style={styles.link}>FRED ↗</a></span>}
              </div>
              <div style={styles.indicatorSignal}>
                <span style={{ color: COLORS.accent }}>✓</span> Reshoring is happening
              </div>
            </div>

            {/* Import Prices */}
            <div style={styles.indicatorCard}>
              <div style={styles.indicatorLabel}>Import Price Index</div>
              <div style={styles.indicatorValue}>
                {loading ? '...' : importPrices?.ok ? (importPrices as FredLatestOk).value.toFixed(1) : '—'}
                <span style={styles.indicatorUnit}>index</span>
              </div>
              <div style={styles.indicatorDelta}>
                <span style={{ color: COLORS.warning }}>Elevated (tariff pass-through)</span>
              </div>
              <div style={styles.indicatorMeta}>
                {importPrices?.ok && <span>As of {(importPrices as FredLatestOk).date} • <a href={(importPrices as FredLatestOk).sourceUrl} target="_blank" rel="noreferrer" style={styles.link}>FRED ↗</a></span>}
              </div>
              <div style={styles.indicatorSignal}>
                <span style={{ color: COLORS.warning }}>⚠</span> Short-term drag (expected)
              </div>
            </div>

            {/* Customs Duties */}
            <div style={styles.indicatorCard}>
              <div style={styles.indicatorLabel}>Customs Duties (Monthly)</div>
              <div style={styles.indicatorValue}>
                {loading ? '...' : customsDuties?.ok ? formatDollars((customsDuties as MtsLatestOk).value) : '—'}
              </div>
              <div style={styles.indicatorDelta}>
                <span style={{ color: COLORS.blue }}>Tariff revenue active</span>
              </div>
              <div style={styles.indicatorMeta}>
                {customsDuties?.ok && <span>As of {(customsDuties as MtsLatestOk).recordDate} • <a href={(customsDuties as MtsLatestOk).sourceUrl} target="_blank" rel="noreferrer" style={styles.link}>Treasury ↗</a></span>}
              </div>
              <div style={styles.indicatorSignal}>
                <span style={{ color: COLORS.blue }}>ℹ</span> Policy is active
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 5: THE VERDICT */}
        {/* ================================================================ */}
        <section style={styles.verdictSection}>
          <div style={styles.verdictTitle}>Current Assessment</div>
          
          <div style={styles.verdictGrid}>
            <div style={styles.verdictItem}>
              <div style={{ ...styles.verdictIcon, color: COLORS.accent }}>✓</div>
              <div style={styles.verdictItemText}>
                <strong>Physical uplift is {PHYSICAL_UPLIFT_COVERAGE}% addressed.</strong> Current pipeline covers 
                ${(TOTAL_INVESTMENT_TRACKED / 1000).toFixed(2)}T of ${(TOTAL_INVESTMENT_NEEDED / 1000).toFixed(2)}T required.
              </div>
            </div>
            <div style={styles.verdictItem}>
              <div style={{ ...styles.verdictIcon, color: COLORS.accent }}>✓</div>
              <div style={styles.verdictItemText}>
                <strong>{AI_ALIGNMENT_SCORE}% of reshoring is AI Manhattan-aligned.</strong> Most investment is going 
                to the right places: chips, data centers, power, grid.
              </div>
            </div>
            <div style={styles.verdictItem}>
              <div style={{ ...styles.verdictIcon, color: COLORS.warning }}>⚠</div>
              <div style={styles.verdictItemText}>
                <strong>Short-term drag is real.</strong> Import prices elevated. This is expected during the 
                build phase—the question is whether GDP payoff arrives 2026-2028.
              </div>
            </div>
            <div style={styles.verdictItem}>
              <div style={{ ...styles.verdictIcon, color: COLORS.blue }}>?</div>
              <div style={styles.verdictItemText}>
                <strong>Payoff depends on execution.</strong> Capacity must come online. Policy must stay focused 
                on AI prerequisites, not scatter into legacy protection.
              </div>
            </div>
          </div>

          <div style={styles.verdictBottom}>
            <strong>Bottom line:</strong> Tariffs are driving significant reshoring, and {AI_ALIGNMENT_SCORE}% is 
            AI Manhattan-aligned. The physical uplift required for AI GDP leverage is {PHYSICAL_UPLIFT_COVERAGE}% 
            addressed by current pipeline. The thesis holds—but only if investment stays focused on prerequisites 
            and capacity actually comes online by 2026-2028.
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • Tariff Tracker</span>
            <span style={styles.footerDivider}>•</span>
            <span>Last Updated: December 2025</span>
          </div>
        </footer>
      </div>
    </main>
  )
}

// ============================================================================
// STYLES
// ============================================================================

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
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  navLink: {
    padding: '0.6rem 1.2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.text,
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
  },

  // Thesis Section
  thesisSection: {
    padding: '2rem',
    backgroundColor: COLORS.purple + '12',
    border: `1px solid ${COLORS.purple}35`,
    borderRadius: '12px',
    marginBottom: '2.5rem',
  },
  thesisKicker: {
    fontSize: '0.75rem',
    fontWeight: 900,
    letterSpacing: '0.12em',
    color: COLORS.purple,
    marginBottom: '0.75rem',
  },
  thesisTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '1.5rem',
    lineHeight: 1.4,
  },
  thesisGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  thesisCard: {
    flex: 1,
    minWidth: '200px',
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  thesisCardLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  thesisCardValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: COLORS.accent,
    marginBottom: '0.25rem',
  },
  thesisCardNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  thesisCardDivider: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0 0.5rem',
  },
  thesisCardDividerText: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
  },
  thesisCardDividerArrow: {
    fontSize: '1.5rem',
    color: COLORS.purple,
  },
  thesisExplainer: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.7,
    marginBottom: '1rem',
  },
  thesisScope: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
    lineHeight: 1.6,
    padding: '0.75rem 1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    borderLeft: `3px solid ${COLORS.purple}50`,
  },

  // Section
  section: {
    marginBottom: '2.5rem',
  },
  sectionHeader: {
    marginBottom: '1.5rem',
  },
  sectionKicker: {
    fontSize: '0.75rem',
    fontWeight: 900,
    letterSpacing: '0.12em',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    marginTop: '0.35rem',
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginTop: '0.35rem',
  },

  // Uplift Summary
  upliftSummary: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  upliftSummaryLeft: {},
  upliftSummaryRight: {},
  upliftSummaryLabel: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  upliftSummaryValue: {
    fontSize: '2.5rem',
    fontWeight: 900,
    marginBottom: '0.25rem',
  },
  upliftSummaryNote: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
  },
  upliftSummaryBar: {
    gridColumn: '1 / -1',
    marginTop: '0.5rem',
  },
  upliftSummaryBarFill: {
    height: '8px',
    width: `${PHYSICAL_UPLIFT_COVERAGE}%`,
    backgroundColor: COLORS.accent,
    borderRadius: '4px',
  },
  upliftSummaryBarLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginTop: '0.5rem',
  },

  // Prerequisites Grid
  prerequisitesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  prerequisiteCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '1.25rem',
  },
  prerequisiteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  prerequisiteIcon: {
    fontSize: '1.25rem',
  },
  prerequisiteName: {
    fontSize: '0.95rem',
    fontWeight: 700,
  },
  prerequisiteGap: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
  },
  gapRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
  },
  gapLabel: {
    color: COLORS.textMuted,
  },
  gapValue: {
    fontWeight: 600,
  },
  prerequisiteInvestment: {
    marginBottom: '1rem',
  },
  investmentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    marginBottom: '0.35rem',
  },
  coverageBar: {
    height: '4px',
    backgroundColor: COLORS.border,
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  coverageBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  coverageLabel: {
    fontSize: '0.7rem',
    color: COLORS.accent,
    marginTop: '0.35rem',
    fontWeight: 600,
  },
  prerequisiteRelevance: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    paddingTop: '0.75rem',
    borderTop: `1px solid ${COLORS.border}`,
  },

  // Alignment Score
  alignmentScoreCard: {
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  scoreMain: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  scoreNumber: {
    fontSize: '4.5rem',
    fontWeight: 900,
    color: COLORS.accent,
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  scoreLabel: {
    fontSize: '1.1rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  scoreBreakdown: {
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  },
  scoreContext: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  scoreContextItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  scoreContextValue: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  scoreContextLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  scoreContextNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },

  // Sector Columns
  sectorColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  sectorColumn: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },
  sectorColumnHeader: {
    padding: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
    borderLeft: '4px solid',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 900,
    letterSpacing: '0.05em',
  },
  sectorColumnTotal: {
    color: COLORS.text,
    fontSize: '0.9rem',
  },
  sectorRow: {
    padding: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  sectorName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  sectorAmount: {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  sectorProjects: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    marginBottom: '0.5rem',
  },
  sectorStatus: {
    fontSize: '0.7rem',
    fontWeight: 600,
  },

  // Indicators
  indicatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  indicatorCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
  },
  indicatorLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  indicatorValue: {
    fontSize: '2rem',
    fontWeight: 900,
    marginBottom: '0.25rem',
  },
  indicatorUnit: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: COLORS.textDim,
    marginLeft: '0.25rem',
  },
  indicatorDelta: {
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  indicatorMeta: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginBottom: '0.75rem',
  },
  indicatorSignal: {
    fontSize: '0.85rem',
    fontWeight: 600,
    padding: '0.5rem 0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
  },
  link: {
    color: COLORS.blue,
    textDecoration: 'none',
  },

  // Verdict
  verdictSection: {
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  verdictTitle: {
    fontSize: '1.25rem',
    fontWeight: 900,
    marginBottom: '1.25rem',
  },
  verdictGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  verdictItem: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  verdictIcon: {
    fontSize: '1.25rem',
    fontWeight: 900,
  },
  verdictItemText: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  verdictBottom: {
    fontSize: '0.95rem',
    color: COLORS.text,
    lineHeight: 1.7,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    borderLeft: `4px solid ${COLORS.purple}`,
  },

  // Footer
  footer: {
    marginTop: '3rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: 'center' as const,
  },
  footerContent: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  footerDivider: {
    margin: '0 0.75rem',
    color: COLORS.border,
  },
}
