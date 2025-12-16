'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { opportunities, calculateSectorPipeline, type Opportunity } from '../lib/data/opportunities'

// ============================================================================
// COLORS & THEME (matching Opportunity Radar)
// ============================================================================
const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  textDim: '#484f58',
  accent: '#7ee787',
  accentDim: '#238636',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

// ============================================================================
// API & DATA
// ============================================================================
const TREASURY_API = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=1'
const US_POPULATION = 336_000_000

// ============================================================================
// FEDERAL SPENDING BREAKDOWN - OMB Historical Tables (Table 8.1)
// Source: https://www.whitehouse.gov/omb/budget/historical-tables/
// ============================================================================

// FEDERAL SPENDING BREAKDOWN
// Methodology: OMB Table 8.1 (outlays by function) grouped into 3 categories
// "Physical Investment" = Function 400 (Transportation) + 250 (Science) + 270 (Energy) + 050 capital
// This is an ANALYTICAL FRAMEWORK, not an official OMB category
const FEDERAL_SPENDING = {
  total: 6100, // $6.1T FY2024 (CBO)
  breakdown: [
    {
      category: 'investment',
      label: 'Physical Investment',
      amount: 490, // Functions 250, 270, 400 + defense capital (~8%)
      percent: 8,
      color: '#7ee787', // accent green
      description: 'Infrastructure, R&D, energy, defense capital',
      sublabel: 'Builds long-term capacity',
      methodology: 'OMB Table 8.1: Functions 250+270+400 + est. defense capital',
    },
    {
      category: 'operations',
      label: 'Government Operations',
      amount: 1220, // ~20%
      percent: 20,
      color: '#58a6ff', // blue
      description: 'Defense operations, federal agencies, administration',
      sublabel: 'Current services',
      methodology: 'OMB Table 8.1: Functions 050 (ops) + 750-800',
    },
    {
      category: 'transfers',
      label: 'Mandatory Programs',
      amount: 4390, // ~72% - SS, Medicare, Medicaid, interest
      percent: 72,
      color: '#f85149', // red
      description: 'Social Security, Medicare, Medicaid, net interest',
      sublabel: 'Entitlements & interest',
      methodology: 'OMB Table 8.1: Functions 550, 570, 650 + interest',
    },
  ],
  source: 'OMB Historical Tables 8.1',
  sourceUrl: 'https://www.whitehouse.gov/omb/budget/historical-tables/',
  methodologyNote: 'Categories are analytical groupings of OMB functional data, not official classifications.',
}

// ============================================================================
// TRACEABLE METRICS - All from real, citable sources
// ============================================================================

// Key Reshoring Metrics (real data, defensible sources)
const RESHORING_METRICS = [
  {
    id: 'public-investment',
    label: 'Public Investment Rate',
    current: '3.5%',
    historical: '5.5%',
    historicalYear: '1960s',
    direction: 'down' as const,
    source: 'BEA / FRED',
    sourceUrl: 'https://fred.stlouisfed.org/series/W170RC1Q027SBEA',
    insight: 'Gov investment as % of GDP. Peak was during Interstate Highway era.',
    highlight: true, // This is the "build rate" metric
  },
  {
    id: 'mfg-gdp',
    label: 'Manufacturing Share of GDP',
    current: '11%',
    historical: '28%',
    historicalYear: '1953',
    direction: 'down' as const,
    source: 'Bureau of Economic Analysis',
    sourceUrl: 'https://fred.stlouisfed.org/series/VAPGDPMA',
    insight: 'Lowest since before WWII. CHIPS & IRA aim to reverse.',
  },
  {
    id: 'factory-construction',
    label: 'Factory Construction Spending',
    current: '$225B/yr',
    historical: '$90B/yr',
    historicalYear: '2021',
    direction: 'up' as const,
    source: 'U.S. Census Bureau',
    sourceUrl: 'https://fred.stlouisfed.org/series/TLMFGCONS',
    insight: '2.5x increase since CHIPS/IRA passed. Historic spike.',
  },
  {
    id: 'chip-share',
    label: 'U.S. Share of Global Chip Production',
    current: '12%',
    historical: '37%',
    historicalYear: '1990',
    direction: 'down' as const,
    source: 'Semiconductor Industry Association',
    sourceUrl: 'https://www.semiconductors.org/',
    insight: 'CHIPS Act targets 20%+ by 2030.',
  },
  {
    id: 'reshoring-jobs',
    label: 'Reshoring Job Announcements',
    current: '350K+',
    historical: '6K',
    historicalYear: '2010',
    direction: 'up' as const,
    source: 'Reshoring Initiative',
    sourceUrl: 'https://reshorenow.org/',
    insight: 'Record year in 2023. Trend accelerating.',
  },
]

// ============================================================================
// POLICY WAVES - The evolving policy landscape driving reshoring
// ============================================================================

// POLICY WAVES - All amounts from enacted legislation or official announcements
// Sources: congress.gov, commerce.gov/chips, energy.gov, treasury.gov
const POLICY_WAVES = [
  {
    wave: 1,
    label: 'Foundation',
    period: '2021-2022',
    description: 'Enacted legislation — amounts authorized',
    policies: [
      { name: 'CHIPS & Science Act', amount: 280, status: 'enacted', icon: '🔬', note: 'PL 117-167 • Semiconductor mfg & R&D', sourceUrl: 'https://www.congress.gov/bill/117th-congress/house-bill/4346' },
      { name: 'Inflation Reduction Act', amount: 369, status: 'enacted', icon: '🌱', note: 'PL 117-169 • Clean energy & mfg credits', sourceUrl: 'https://www.congress.gov/bill/117th-congress/house-bill/5376' },
      { name: 'Infrastructure Law (IIJA)', amount: 550, status: 'enacted', icon: '🛣️', note: 'PL 117-58 • Roads, grid, broadband', sourceUrl: 'https://www.congress.gov/bill/117th-congress/house-bill/3684' },
    ],
    total: 1199,
    totalNote: 'Federal spending (grants, tax credits, loans) authorized over 5-10 years',
  },
  {
    wave: 2,
    label: 'Implementation',
    period: '2023-2025',
    description: 'Funds obligated or disbursing',
    policies: [
      { name: 'CHIPS Awards', amount: null, status: 'awarded', icon: '💰', note: 'Commerce Dept awards ongoing — $50B+ awarded through 2025', sourceUrl: 'https://www.nist.gov/chips' },
      { name: 'IRA 45X Credits', amount: null, status: 'active', icon: '📋', note: 'Advanced mfg production credits (uncapped)', sourceUrl: 'https://www.energy.gov/eere/solar/federal-solar-tax-credits-businesses' },
      { name: 'DOE Loan Programs', amount: null, status: 'committed', icon: '⚡', note: 'LPO commitments continuing through 2025', sourceUrl: 'https://www.energy.gov/lpo/loan-programs-office' },
    ],
    total: 0,
    totalNote: 'Ongoing disbursements — amounts cumulative',
  },
  {
    wave: 3,
    label: 'Strategic Protectionism',
    period: '2025+',
    description: 'Distinct approach: Tariffs drive investment through protectionism, not subsidies',
    policies: [
      { name: 'Tariff Policy', amount: null, status: 'enacted', icon: '🚢', note: 'Strategic protectionism: 50% steel/aluminum, 10% universal + sector-specific. Drives reshoring through protection, not subsidies. Admin distanced from CHIPS/IRA-style programs.' },
      { name: 'AI Data Center Buildout', amount: null, status: 'private', icon: '🧠', note: '$100B+ announced (MSFT, AMZN, Google)', sourceUrl: 'https://blogs.microsoft.com/blog/2025/01/21/the-stargate-project/' },
      { name: 'Nuclear Restarts', amount: null, status: 'active', icon: '⚛️', note: 'TMI, Palisades — private + DOE support', sourceUrl: 'https://www.energy.gov/ne' },
    ],
    total: 0,
    totalNote: 'Amounts TBD or private investment',
  },
]

const TOTAL_POLICY_INVESTMENT = POLICY_WAVES.reduce((sum, w) => sum + w.total, 0)

// Sector pipeline - AUTO-CALCULATED from opportunities data
// Updates automatically when opportunities change - single source of truth
const SECTOR_PIPELINE = calculateSectorPipeline(opportunities)

const getEconomicImpactLabel = (e: 'transformational' | 'catalytic' | 'significant' | 'direct-only'): string => ({
  'transformational': '3-5x GDP',
  'catalytic': '2-3x GDP',
  'significant': '1-2x GDP',
  'direct-only': '<1x GDP',
}[e])

// ============================================================================
// THE CASE - Why we need to invest (competitive gaps, strategic needs)
// ============================================================================
// STRATEGIC GAPS - Ordered by relevance to pipeline sectors and OT requirements
// These gaps drive the pipeline, which creates OT implementation demand
// Calculate gaps dynamically from opportunities data
const getStrategicGaps = () => {
  const semis = opportunities.filter(o => o.sector === 'semiconductors')
  const semisTotal = semis.reduce((sum, o) => sum + o.investmentSize, 0) / 1000
  
  const grid = opportunities.filter(o => o.sector === 'clean-energy')
  const gridTotal = grid.reduce((sum, o) => sum + o.investmentSize, 0) / 1000
  
  const ev = opportunities.filter(o => o.sector === 'ev-battery')
  const evTotal = ev.reduce((sum, o) => sum + o.investmentSize, 0) / 1000
  
  const nuclear = opportunities.filter(o => o.sector === 'nuclear')
  const nuclearTotal = nuclear.reduce((sum, o) => sum + o.investmentSize, 0) / 1000
  
  return [
    {
      id: 'semiconductor',
      category: 'Pipeline Sector',
      title: 'Semiconductor Production',
      us: '12%',
      usLabel: 'U.S. share of global chip production',
      them: '20%',
      themLabel: 'CHIPS Act target by 2030',
      gap: `$${Math.round(semisTotal)}B`,
      gapNote: `Tracked pipeline: ${semis.length} fab projects requiring MES, SCADA, OT systems`,
      source: 'SIA/BCG 2021 Report',
      sourceUrl: 'https://www.semiconductors.org/strengthening-the-global-semiconductor-supply-chain-in-an-uncertain-era/',
      icon: '🔬',
      color: COLORS.blue,
    },
    {
      id: 'grid-energy',
      category: 'Enabling Infrastructure',
      title: 'Grid & Energy Capacity',
      us: '1.2 TW',
      usLabel: 'Current U.S. grid capacity',
      them: '2.0 TW',
      themLabel: 'Needed by 2035 for factories + AI',
      gap: `$${Math.round(gridTotal)}B`,
      gapNote: `Tracked pipeline: ${grid.length} grid projects need SCADA, OT cyber, control systems`,
      source: 'DOE, Princeton Net Zero',
      sourceUrl: 'https://www.energy.gov/gdo/building-better-grid-initiative',
      icon: '⚡',
      color: COLORS.warning,
    },
    {
      id: 'ev-battery',
      category: 'Pipeline Sector',
      title: 'EV & Battery Manufacturing',
      us: `$${Math.round(evTotal)}B`,
      usLabel: `Tracked pipeline: ${ev.length} battery/EV projects`,
      them: 'IRA Target',
      themLabel: 'Domestic EV supply chain by 2030',
      gap: 'OT Required',
      gapNote: 'Every gigafactory needs MES, quality systems, supply chain OT',
      source: 'Opportunity Radar',
      sourceUrl: '/opportunities',
      icon: '🔋',
      color: COLORS.accent,
    },
    {
      id: 'nuclear',
      category: 'Pipeline Sector',
      title: 'Nuclear & Advanced Reactors',
      us: `$${Math.round(nuclearTotal)}B`,
      usLabel: `Tracked pipeline: ${nuclear.length} nuclear projects`,
      them: 'AI Power Demand',
      themLabel: 'Microsoft TMI restart, SMR deployments',
      gap: 'OT Critical',
      gapNote: 'Nuclear requires highest-grade SCADA, safety systems, digital twins',
      source: 'DOE, Opportunity Radar',
      sourceUrl: '/opportunities',
      icon: '⚛️',
      color: COLORS.warning,
    },
  ]
}

const STRATEGIC_GAPS = getStrategicGaps()

// Calculate GDP impact from pipeline investments
// Sources:
// - GDP: $29.2T (2024, BEA) - https://www.bea.gov/data/gdp/gross-domestic-product
// - Multipliers: CBO estimates infrastructure multipliers 0.4-2.2x (midpoint 1.3x)
//   Conservative approach: using 1.0-2.0x range based on CBO research
//   Source: CBO, EPI analysis - https://www.epi.org/publication/methodology-estimating-jobs-impact/
const calculateGDPImpact = () => {
  const US_GDP = 29_200 // $29.2T in billions (2024, BEA)
  // SECTOR_PIPELINE.pipeline is already in billions (from calculateSectorPipeline)
  const totalPipeline = SECTOR_PIPELINE.reduce((sum, s) => sum + s.pipeline, 0) // Already in billions
  
  // Apply GDP multipliers based on economic impact
  // Based on CBO research: infrastructure multipliers range 0.4-2.2x, midpoint 1.3x
  // Using conservative estimates within this range
  const multiplierMap: Record<string, number> = {
    'transformational': 2.0, // High-end of CBO range for transformative projects
    'catalytic': 1.5, // Mid-high range for catalytic investments
    'significant': 1.3, // CBO midpoint for infrastructure
    'direct-only': 1.0, // Direct impact only
  }
  
  let totalGDPImpact = 0
  SECTOR_PIPELINE.forEach(sector => {
    const multiplier = multiplierMap[sector.economicImpact] || 1.3
    totalGDPImpact += sector.pipeline * multiplier // pipeline already in billions
  })
  
  // Annual investment (spread over 5 years)
  const annualInvestment = totalPipeline / 5 // Spread over 5 years (in billions)
  
  return {
    totalPipeline,
    totalGDPImpact,
    annualInvestment,
    usGDP: US_GDP,
  }
}

// Calculate federal spending composition impact
// Sources:
// - Current: 8% of federal spending on physical investment (FEDERAL_SPENDING breakdown)
// - Target: 12-15% (fiscal sustainability goal)
// - Public Investment Rate: 3.5% of GDP (BEA/FRED - RESHORING_METRICS)
const calculateFederalSpendingImpact = () => {
  const currentInvestmentPercent = FEDERAL_SPENDING.breakdown.find(b => b.category === 'investment')?.percent || 8
  const targetMin = 12
  const targetMax = 15
  
  // Pipeline investment as % of federal spending (annualized over 5 years)
  const annualPipelineInvestment = calculateGDPImpact().annualInvestment
  const federalSpendingTotal = FEDERAL_SPENDING.total // $6.1T in billions
  const pipelineAsPercentOfFederal = (annualPipelineInvestment / federalSpendingTotal) * 100
  
  // This shows how much the pipeline contributes to federal investment spending
  // Note: Most pipeline is private investment, not federal spending
  // This metric shows the scale relative to federal budget
  
  return {
    currentInvestmentPercent,
    targetMin,
    targetMax,
    pipelineAsPercentOfFederal,
    annualPipelineInvestment,
  }
}

const GDP_IMPACT = calculateGDPImpact()
const FEDERAL_SPENDING_IMPACT = calculateFederalSpendingImpact()

interface DebtData {
  totalDebt: number
  lastUpdated: string
  isLoading: boolean
  error: string | null
}

// ============================================================================
// TICKING COUNTER COMPONENT
// ============================================================================
function TickingValue({ 
  value, 
  prefix = '', 
  suffix = '', 
  decimals = 2,
  color = COLORS.text,
  size = '2rem'
}: { 
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  color?: string
  size?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    setDisplayValue(value)
    // Simulate live ticking for debt (roughly $1T/year deficit = ~$31,709/second)
    const tickRate = value * 0.000000001 // tiny increment per tick
    const interval = setInterval(() => {
      setDisplayValue(v => v + tickRate)
    }, 100)
    return () => clearInterval(interval)
  }, [value])

  return (
    <span style={{ 
      fontSize: size, 
      fontWeight: 700, 
      color,
      fontVariantNumeric: 'tabular-nums',
      fontFamily: "'JetBrains Mono', monospace"
    }}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BuildClockPage() {
  const [debtData, setDebtData] = useState<DebtData>({
    totalDebt: 36.1,
    lastUpdated: '',
    isLoading: true,
    error: null
  })

  const fetchDebtData = useCallback(async () => {
    try {
      const res = await fetch(TREASURY_API)
      const json = await res.json()
      const record = json.data?.[0]
      if (record) {
        const totalDebt = parseFloat(record.tot_pub_debt_out_amt) / 1_000_000_000_000
        setDebtData({
          totalDebt,
          lastUpdated: record.record_date,
          isLoading: false,
          error: null
        })
      }
    } catch {
      setDebtData(prev => ({ ...prev, isLoading: false, error: 'Using estimate' }))
    }
  }, [])

  useEffect(() => {
    fetchDebtData()
    const interval = setInterval(fetchDebtData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDebtData])

  const totalDebt = debtData.totalDebt
  const debtPerCitizen = (totalDebt * 1_000_000_000_000) / US_POPULATION

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <span style={{ color: COLORS.accent }}>BUILD</span> CLOCK
            </h1>
            <p style={styles.subtitle}>
              U.S. Industrial Capacity Tracker
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/sectors" style={styles.radarLink}>
              Sectors →
            </Link>
            <Link href="/policy-gaps" style={styles.radarLink}>
              Policy Gaps →
            </Link>
            <Link href="/references" style={styles.radarLink}>
              References →
            </Link>
          </div>
        </header>

        {/* ================================================================ */}
        {/* THE PROBLEM - Only 8% Builds */}
        {/* ================================================================ */}
        <section style={styles.heroNew}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>01</span>
            <span style={styles.narrativeLabel}>THE PROBLEM</span>
          </div>
          
          {/* The Big Number */}
          <div style={styles.debtHero}>
            <div style={styles.debtHeroMain}>
              <div style={styles.debtHeroLabel}>
                FEDERAL DEBT
                {debtData.isLoading && <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>⟳</span>}
                {!debtData.isLoading && !debtData.error && (
                  <span style={{ marginLeft: '0.5rem', color: COLORS.accent, fontSize: '0.7rem' }}>● LIVE</span>
                )}
              </div>
              <div style={styles.debtHeroValue}>
                <TickingValue value={totalDebt} prefix="$" suffix="" decimals={4} size="4rem" color={COLORS.text} />
                <span style={styles.debtHeroUnit}>TRILLION</span>
              </div>
              {debtData.lastUpdated && (
                <div style={styles.debtHeroSource}>
                  Source: U.S. Treasury • Updated: {debtData.lastUpdated}
                </div>
              )}
            </div>
            <div style={styles.debtHeroQuestion}>
              <div style={styles.hamiltonQuestion}>The Core Question:</div>
              <div style={styles.hamiltonText}>
                Not <em>how much</em> we spend — but <em>what portion builds lasting capacity</em>?
              </div>
              <div style={{ fontSize: '0.65rem', color: COLORS.textDim, marginTop: '0.5rem' }}>
                Framework: Distinguishing capital investment from current consumption
              </div>
            </div>
          </div>

          {/* The Breakdown - Where Federal Spending Goes */}
          <div style={styles.breakdownSection}>
            <div style={styles.breakdownHeader}>
              <h3 style={styles.breakdownTitle}>Where Federal Spending Goes</h3>
              <div style={styles.breakdownSubtitle}>
                ${(FEDERAL_SPENDING.total / 1000).toFixed(1)}T annual spending • FY2024 • 
                <a 
                  href={FEDERAL_SPENDING.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: COLORS.blue, marginLeft: '0.25rem' }}
                >
                  {FEDERAL_SPENDING.source} ↗
                </a>
              </div>
            </div>
            
            {/* Visual Bar */}
            <div style={styles.breakdownBar}>
              {FEDERAL_SPENDING.breakdown.map(item => (
                <div 
                  key={item.category}
                  style={{
                    ...styles.breakdownBarSegment,
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.label}: ${item.percent}%`}
                />
              ))}
            </div>
            
            {/* Legend Cards */}
            <div style={styles.breakdownCards}>
              {FEDERAL_SPENDING.breakdown.map(item => (
                <div 
                  key={item.category} 
                  style={{
                    ...styles.breakdownCard,
                    borderLeftColor: item.color,
                  }}
                >
                  <div style={styles.breakdownCardHeader}>
                    <span style={{ ...styles.breakdownCardPercent, color: item.color }}>
                      {item.percent}%
                    </span>
                    <span style={styles.breakdownCardLabel}>{item.label}</span>
                  </div>
                  <div style={styles.breakdownCardAmount}>
                    ${item.amount}B/year
                  </div>
                  <div style={styles.breakdownCardDesc}>{item.description}</div>
                  <div style={styles.breakdownCardSublabel}>{item.sublabel}</div>
                </div>
              ))}
            </div>
            
            {/* Need-Based Context */}
            <div style={styles.historicalNote}>
              <strong style={{ color: COLORS.accent }}>The Gap:</strong> At 8%, we're not investing enough to meet actual needs — 
              <strong>$2.6T</strong> infrastructure gap (ASCE), <strong>20%</strong> chip production target (CHIPS Act), 
              grid capacity for AI/EV demand, critical mineral security. The policy waves aren't about restoring 
              the past — they're about building what the next economy requires.
            </div>
          </div>

          {/* Per Citizen Context */}
          <div style={styles.citizenContext}>
            <div style={styles.citizenStat}>
              <span style={styles.citizenLabel}>Your share of the debt:</span>
              <span style={styles.citizenValue}>${Math.round(debtPerCitizen).toLocaleString()}</span>
            </div>
            <div style={styles.citizenStat}>
              <span style={styles.citizenLabel}>Portion that built assets:</span>
              <span style={{ ...styles.citizenValue, color: COLORS.accent }}>
                ${Math.round(debtPerCitizen * 0.08).toLocaleString()}
              </span>
              <span style={styles.citizenNote}>(~8%)</span>
            </div>
            <div style={styles.citizenStat}>
              <span style={styles.citizenLabel}>Already consumed:</span>
              <span style={{ ...styles.citizenValue, color: COLORS.danger }}>
                ${Math.round(debtPerCitizen * 0.92).toLocaleString()}
              </span>
              <span style={styles.citizenNote}>(~92%)</span>
            </div>
          </div>

          {/* Fiscal Target - moved from section 04 */}
          <div style={styles.fiscalCard}>
            <div style={styles.fiscalHeader}>
              <span style={styles.fiscalIcon}>⚖️</span>
              <div>
                <div style={styles.fiscalTitle}>Fiscal Sustainability Target</div>
                <div style={styles.fiscalSubtitle}>Current trajectory vs. stabilization goal</div>
              </div>
            </div>
            <div style={styles.fiscalContent}>
              <div style={styles.fiscalStat}>
                <div style={styles.fiscalStatValue}>124%</div>
                <div style={styles.fiscalStatLabel}>
                  <a href="https://fred.stlouisfed.org/series/GFDEGDQ188S" target="_blank" rel="noreferrer" style={{ color: COLORS.blue, textDecoration: 'none' }}>
                    Current Debt/GDP (FRED) ↗
                  </a>
                </div>
              </div>
              <div style={styles.fiscalLogic}>
                <div style={styles.logicRow}>
                  <span style={{ color: COLORS.danger }}>→</span>
                  <span>CBO baseline: 166% by 2054 (unsustainable trajectory)</span>
                </div>
                <div style={styles.logicRow}>
                  <span style={{ color: COLORS.warning }}>→</span>
                  <span>Stabilization target: ~100% by 2030 (requires GDP growth faster than debt growth)</span>
                </div>
                <div style={styles.logicRow}>
                  <span style={{ color: COLORS.accent }}>→</span>
                  <span>Path: Increase productive investment share from 8% to 12-15% of spending</span>
                </div>
              </div>
              <div style={styles.fiscalNote}>
                <strong>The math:</strong> To stabilize debt/GDP at ~100% by 2030, GDP must grow faster than debt. 
                Productive investment (infrastructure, R&D, manufacturing capacity) has higher GDP multipliers 
                than transfers. Shifting spending composition toward investment can improve fiscal sustainability 
                without cutting total spending.
                <a href="https://www.cbo.gov/publication/59014" target="_blank" rel="noreferrer" style={{ color: COLORS.blue, marginLeft: '0.5rem' }}>
                  CBO analysis ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE RESPONSE - Policy Waves */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>02</span>
            <span style={styles.narrativeLabel}>THE RESPONSE</span>
          </div>
          <h2 style={styles.sectionTitle}>The Policy Response</h2>
          <p style={styles.sectionSubtitle}>
            Three waves of policy designed to increase productive investment — the path from 8% toward 12-15% needed for fiscal sustainability
          </p>
          
          <div style={styles.wavesContainer}>
            {POLICY_WAVES.map(wave => (
              <div key={wave.wave} style={styles.waveCard}>
                <div style={styles.waveHeader}>
                  <div style={styles.waveNumber}>Wave {wave.wave}</div>
                  <div style={styles.waveLabel}>{wave.label}</div>
                  <div style={styles.wavePeriod}>{wave.period}</div>
                </div>
                <div style={styles.waveDesc}>{wave.description}</div>
                <div style={styles.wavePolicies}>
                  {wave.policies.map(p => (
                    <div key={p.name} style={styles.wavePolicy}>
                      <span style={styles.wavePolicyIcon}>{p.icon}</span>
                      <div style={styles.wavePolicyContent}>
                        <div style={styles.wavePolicyName}>{p.name}</div>
                        {p.amount && <span style={styles.wavePolicyAmount}>${p.amount}B</span>}
                        {p.note && <div style={styles.wavePolicyNote}>{p.note}</div>}
                      </div>
                      <span style={{
                        ...styles.wavePolicyStatus,
                        backgroundColor: p.status === 'enacted' ? COLORS.accent + '22' :
                                        p.status === 'disbursing' ? COLORS.blue + '22' :
                                        p.status === 'active' ? COLORS.warning + '22' :
                                        p.status === 'incoming' ? COLORS.danger + '22' :
                                        COLORS.purple + '22',
                        color: p.status === 'enacted' ? COLORS.accent :
                               p.status === 'disbursing' ? COLORS.blue :
                               p.status === 'active' ? COLORS.warning :
                               p.status === 'incoming' ? COLORS.danger :
                               COLORS.purple,
                      }}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
                {wave.total > 0 && (
                  <div style={styles.waveTotal}>
                    ${wave.total}B+ authorized/active
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={styles.policyInsight}>
            <strong>How This Addresses the Target:</strong> Wave 1 authorized $1.2T in productive investment (CHIPS, IRA, IIJA) 
            through <strong>subsidy-based industrial policy</strong>. Wave 2 is disbursing those funds to factories, infrastructure, 
            and R&D. Wave 3 represents a <strong>distinct approach: strategic protectionism</strong> — tariffs (50% steel/aluminum, 
            10% universal + sector-specific) drive reshoring through protection rather than subsidies. The administration has 
            distanced itself from CHIPS/IRA-style programs, favoring tariff-driven investment. Combined, these waves shift spending 
            composition toward the 12-15% investment share needed to stabilize debt/GDP at ~100% by 2030.
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE EVIDENCE - Is It Working? */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>03</span>
            <span style={styles.narrativeLabel}>THE EVIDENCE</span>
          </div>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Is It Working?</h2>
              <p style={styles.sectionSubtitle}>
                Tracking progress: Are policy waves increasing productive investment toward the 12-15% target?
              </p>
            </div>
            <Link href="/opportunities" style={styles.viewAllLink}>
              View All Opportunities →
            </Link>
          </div>
          
          {/* The Flow - All numbers traceable */}
          <div style={styles.evidenceFlow}>
            <div style={styles.flowStep}>
              <div style={styles.flowValue}>$1.2T</div>
              <div style={styles.flowLabel}>Enacted Legislation</div>
              <div style={styles.flowNote}>CHIPS + IRA + IIJA authorized</div>
            </div>
            <div style={styles.flowArrow}>→</div>
            <div style={styles.flowStep}>
              <div style={styles.flowValue}>$225B/yr</div>
              <div style={styles.flowLabel}>Factory Construction</div>
              <div style={styles.flowNote}>
                <a href="https://fred.stlouisfed.org/series/TLMFGCONS" target="_blank" rel="noreferrer" style={{ color: COLORS.blue, textDecoration: 'none' }}>
                  Census Bureau ↗
                </a>
              </div>
            </div>
            <div style={styles.flowArrow}>→</div>
            <div style={styles.flowStep}>
              <div style={{ ...styles.flowValue, color: COLORS.accent }}>${SECTOR_PIPELINE.reduce((sum, s) => sum + s.pipeline, 0)}B</div>
              <div style={styles.flowLabel}>Pipeline Tracked</div>
              <div style={styles.flowNote}>{SECTOR_PIPELINE.reduce((sum, s) => sum + s.projects, 0)} opportunities in Radar</div>
            </div>
          </div>
          
          <div style={styles.sectorGrid}>
            {SECTOR_PIPELINE.map(sector => (
              <div key={sector.sector} style={styles.sectorCard}>
                <div style={styles.sectorHeader}>
                  <span style={styles.sectorName}>{sector.sector}</span>
                  <span style={styles.sectorProjects}>{sector.projects} projects</span>
                </div>
                <div style={{ ...styles.sectorValue, color: sector.color }}>
                  ${sector.pipeline}B
                </div>
                <div style={styles.sectorBar}>
                  <div 
                    style={{ 
                      ...styles.sectorBarFill, 
                      width: `${(sector.pipeline / 200) * 100}%`,
                      backgroundColor: sector.color 
                    }} 
                  />
                </div>
                <div style={styles.sectorQuality}>
                  <span style={{ 
                    color: sector.quality === 'leading-edge' ? COLORS.accent : 
                           sector.quality === 'advanced' ? COLORS.blue : COLORS.textMuted 
                  }}>
                    {sector.quality === 'leading-edge' ? '★★★★★' : 
                     sector.quality === 'advanced' ? '★★★★☆' : '★★★☆☆'}
                  </span>
                  <span style={{
                    ...styles.sectorImpact,
                    color: sector.economicImpact === 'transformational' ? COLORS.accent :
                           sector.economicImpact === 'catalytic' ? COLORS.blue : COLORS.textMuted
                  }}>
                    {getEconomicImpactLabel(sector.economicImpact)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* GDP Impact - Economic Multiplier Effect */}
          <div style={styles.gdpImpactCard}>
            <div style={styles.gdpImpactHeader}>
              <span style={styles.gdpImpactIcon}>📊</span>
              <div>
                <div style={styles.gdpImpactTitle}>GDP Impact (Economic Multiplier Effect)</div>
                <div style={styles.gdpImpactSubtitle}>Estimated GDP growth from pipeline investments using CBO-validated multipliers</div>
              </div>
            </div>
            <div style={styles.gdpImpactGrid}>
              <div style={styles.gdpImpactStat}>
                <div style={styles.gdpImpactValue}>${Math.round(GDP_IMPACT.totalPipeline)}B</div>
                <div style={styles.gdpImpactLabel}>Total Pipeline Investment</div>
              </div>
              <div style={styles.gdpImpactStat}>
                <div style={{ ...styles.gdpImpactValue, color: COLORS.accent }}>${Math.round(GDP_IMPACT.totalGDPImpact)}B</div>
                <div style={styles.gdpImpactLabel}>Estimated GDP Impact (multiplier effect)</div>
              </div>
              <div style={styles.gdpImpactStat}>
                <div style={{ ...styles.gdpImpactValue, color: COLORS.blue }}>${Math.round(GDP_IMPACT.annualInvestment)}B/yr</div>
                <div style={styles.gdpImpactLabel}>Annual Investment (5-year average)</div>
              </div>
            </div>
            <div style={styles.gdpImpactNote}>
              <strong>Methodology:</strong> Pipeline investment (${Math.round(GDP_IMPACT.totalPipeline)}B) estimated to generate ${Math.round(GDP_IMPACT.totalGDPImpact)}B in GDP impact over time. 
              Multipliers: Transformational 2.0x, Catalytic 1.5x, Significant 1.3x, Direct-only 1.0x. 
              Based on CBO research (infrastructure multipliers range 0.4-2.2x, midpoint 1.3x). 
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.7rem', color: COLORS.textDim }}>
                Sources: CBO multiplier estimates, EPI analysis. US GDP: $29.2T (2024, BEA).
              </span>
            </div>
          </div>

          {/* Federal Spending Composition - Investment Share */}
          <div style={styles.gdpImpactCard}>
            <div style={styles.gdpImpactHeader}>
              <span style={styles.gdpImpactIcon}>🏛️</span>
              <div>
                <div style={styles.gdpImpactTitle}>Federal Spending Composition</div>
                <div style={styles.gdpImpactSubtitle}>Physical investment as % of federal spending (target: 12-15%)</div>
              </div>
            </div>
            <div style={styles.gdpImpactProgress}>
              <div style={styles.gdpImpactProgressHeader}>
                <span>Physical Investment Share of Federal Spending</span>
                <span style={{ color: COLORS.accent }}>Target: 12-15%</span>
              </div>
              <div style={styles.gdpImpactProgressBar}>
                <div style={{
                  ...styles.gdpImpactProgressFill,
                  width: `${(FEDERAL_SPENDING_IMPACT.currentInvestmentPercent / 15) * 100}%`,
                  backgroundColor: COLORS.textMuted,
                }} />
                <div style={{
                  ...styles.gdpImpactProgressFill,
                  width: `${Math.min((FEDERAL_SPENDING_IMPACT.targetMin - FEDERAL_SPENDING_IMPACT.currentInvestmentPercent) / 15 * 100, 100 - (FEDERAL_SPENDING_IMPACT.currentInvestmentPercent / 15) * 100)}%`,
                  backgroundColor: COLORS.accent,
                  marginLeft: `${(FEDERAL_SPENDING_IMPACT.currentInvestmentPercent / 15) * 100}%`,
                  opacity: 0.3,
                }} />
              </div>
              <div style={styles.gdpImpactProgressLabels}>
                <span>Current: {FEDERAL_SPENDING_IMPACT.currentInvestmentPercent}%</span>
                <span style={{ color: COLORS.accent }}>Target: {FEDERAL_SPENDING_IMPACT.targetMin}-{FEDERAL_SPENDING_IMPACT.targetMax}%</span>
                <span style={{ color: FEDERAL_SPENDING_IMPACT.currentInvestmentPercent >= FEDERAL_SPENDING_IMPACT.targetMin ? COLORS.accent : COLORS.warning }}>
                  Gap: {FEDERAL_SPENDING_IMPACT.targetMin - FEDERAL_SPENDING_IMPACT.currentInvestmentPercent}%
                </span>
              </div>
            </div>
            <div style={styles.gdpImpactNote}>
              <strong>Current Status:</strong> Federal physical investment is {FEDERAL_SPENDING_IMPACT.currentInvestmentPercent}% of federal spending ($490B of $6.1T). 
              Target is 12-15% to shift spending composition toward productive investment. 
              <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.7rem', color: COLORS.textDim }}>
                Note: Pipeline investments are primarily private, not federal spending. This metric tracks federal budget composition shift needed for fiscal sustainability.
                Source: OMB Historical Tables 8.1.
              </span>
            </div>
          </div>
          
          {/* Quality Insight - with calculation basis */}
          <div style={styles.qualityInsight}>
            <strong>Progress Toward Target:</strong> Factory construction spending has increased 2.5x since CHIPS/IRA 
            (from $90B/yr to $225B/yr), indicating policy is driving investment. The ${SECTOR_PIPELINE.reduce((sum, s) => sum + s.pipeline, 0)}B tracked pipeline represents 
            productive capacity that will grow GDP. <strong style={{ color: COLORS.accent }}>Key question:</strong> Is this 
            enough to shift federal spending composition from 8% to 12-15% investment share? That depends on total spending 
            growth and whether investment grows faster than transfers.
            <span style={{ display: 'block', color: COLORS.textDim, fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Economic impact categories based on BLS employment multipliers and sector research.
            </span>
          </div>
          
          <div style={styles.totalPipeline}>
            <span style={styles.totalLabel}>Total Tracked Pipeline:</span>
            <span style={styles.totalValue}>
              ${SECTOR_PIPELINE.reduce((sum, s) => sum + s.pipeline, 0)}B
            </span>
            <span style={styles.totalProjects}>
              across {SECTOR_PIPELINE.reduce((sum, s) => sum + s.projects, 0)} projects
            </span>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE CASE - Why We Need to Invest */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>04</span>
            <span style={styles.narrativeLabel}>THE CASE</span>
          </div>
          <h2 style={styles.sectionTitle}>What's Still Needed</h2>
          <p style={styles.sectionSubtitle}>
            Even with current progress, these gaps show why reaching 12-15% investment share is necessary — not just for fiscal sustainability, but for strategic competitiveness
          </p>
          
          <div style={styles.gapsGrid}>
            {STRATEGIC_GAPS.map(gap => (
              <div key={gap.id} style={styles.gapCard}>
                <div style={styles.gapHeader}>
                  <span style={styles.gapIcon}>{gap.icon}</span>
                  <div>
                    <div style={styles.gapCategory}>{gap.category}</div>
                    <div style={styles.gapTitle}>{gap.title}</div>
                  </div>
                </div>
                <div style={styles.gapComparison}>
                  <div style={styles.gapSide}>
                    <div style={{ ...styles.gapValue, color: COLORS.danger }}>{gap.us}</div>
                    <div style={styles.gapLabel}>{gap.usLabel}</div>
                  </div>
                  <div style={styles.gapVs}>vs</div>
                  <div style={styles.gapSide}>
                    <div style={{ ...styles.gapValue, color: gap.color }}>{gap.them}</div>
                    <div style={styles.gapLabel}>{gap.themLabel}</div>
                  </div>
                </div>
                <div style={styles.gapBottom}>
                  <div style={styles.gapGap}>
                    <strong>Gap:</strong> {gap.gap} — {gap.gapNote}
                  </div>
                  <a 
                    href={gap.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ ...styles.gapSource, color: COLORS.blue, textDecoration: 'none' }}
                  >
                    {gap.source} ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div style={styles.caseInsight}>
            <div style={styles.insightIcon}>💡</div>
            <div>
              <strong>The OT Connection:</strong> Each gap above represents sectors in the ${SECTOR_PIPELINE.reduce((sum, s) => sum + s.pipeline, 0)}B tracked pipeline. 
              Every new semiconductor fab, battery plant, nuclear facility, and grid project requires <strong>Operating Technology</strong>: 
              MES, SCADA, historians, digital twins, industrial cybersecurity. Building the productive economy = building factories = 
              OT implementation demand. The 12-15% investment target closes these gaps while creating the OT opportunities that 
              enable the productive economy.
              <span style={{ display: 'block', fontSize: '0.75rem', color: COLORS.textDim, marginTop: '0.5rem' }}>
                Pipeline data from Opportunity Radar • See section 05 for OT requirements breakdown
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* PREREQUISITES & IMPLEMENTATION - Consolidated */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>05</span>
            <span style={styles.narrativeLabel}>PREREQUISITES</span>
          </div>
          <h2 style={styles.sectionTitle}>The Hidden Infrastructure</h2>
          <p style={styles.sectionSubtitle}>
            You can't build the end product without the prerequisites — and you can't operate without OT.
          </p>
          
          {/* Compact summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🧲</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rare Earths</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>95%+ refining in China. U.S. has mining but not processing.</div>
            </div>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔋</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Batteries</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>80%+ materials processing in China. Cells need precursors.</div>
            </div>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🔬</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Semiconductors</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Equipment 2-3yr lead times. Chemicals/gases concentrated.</div>
            </div>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚛️</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nuclear</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>No U.S. commercial HALEU. SMRs can't deploy without it.</div>
            </div>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Grid</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>3-5yr interconnect. 2-3yr transformer lead times.</div>
            </div>
            <div style={{ ...styles.gapCard, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Imperative</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>China $6-8/hr vs. U.S. $30/hr. Automation is strategic.</div>
            </div>
          </div>
          
          {/* OT Pipeline callout */}
          <div style={styles.totalPipeline}>
            <span style={styles.totalLabel}>OT-Relevant Pipeline:</span>
            <span style={styles.totalValue}>
              ${(() => {
                const otRelevantSectors = ['semiconductors', 'ev-battery', 'nuclear', 'advanced-mfg']
                const otRelevant = opportunities.filter(opp => 
                  otRelevantSectors.includes(opp.sector) && opp.investmentSize > 0
                )
                return Math.round(otRelevant.reduce((sum, opp) => sum + opp.investmentSize, 0) / 1000)
              })()}B
            </span>
            <span style={styles.totalProjects}>
              ({(() => {
                const otRelevantSectors = ['semiconductors', 'ev-battery', 'nuclear', 'advanced-mfg']
                return opportunities.filter(opp => otRelevantSectors.includes(opp.sector) && opp.investmentSize > 0).length
              })()} projects)
            </span>
          </div>
          
          {/* Insight box with deep-dive links */}
          <div style={styles.caseInsight}>
            <div style={styles.insightIcon}>💡</div>
            <div>
              <strong>The Pattern:</strong> Every sector needs prerequisites (refining, processing, fuel, transmission) that are labor-intensive, giving China a cost advantage. <strong>AI/automation + OT security</strong> are the path to compete.
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                <Link href="/sectors" style={{ ...styles.viewAllLink, fontSize: '0.8rem' }}>Sectors & AI Use Cases →</Link>
                <Link href="/policy-gaps" style={{ ...styles.viewAllLink, fontSize: '0.8rem' }}>Policy Gaps & Players →</Link>
                <Link href="/opportunities" style={{ ...styles.viewAllLink, fontSize: '0.8rem' }}>Opportunity Radar →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT'S COMING - Key Dates */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>06</span>
            <span style={styles.narrativeLabel}>WHAT'S COMING</span>
          </div>
          <h2 style={styles.sectionTitle}>Key Dates to Watch</h2>
          <p style={styles.sectionSubtitle}>
            Policy milestones, RFP deadlines, and expected announcements
          </p>
          
          <div style={styles.timelineGrid}>
            <div style={styles.timelineCard}>
              <div style={styles.timelineCardHeader}>Q4 2025</div>
              <ul style={styles.timelineList}>
                <li>Tariff policy fully implemented</li>
                <li>CHIPS Act awards continue through year-end</li>
                <li>Multiple fab production ramps ongoing</li>
                <li>Reshoring announcements accelerating</li>
              </ul>
            </div>
            <div style={styles.timelineCard}>
              <div style={styles.timelineCardHeader}>Q1 2026</div>
              <ul style={styles.timelineList}>
                <li>DOE transmission corridor designations</li>
                <li>TSMC Arizona fab production ramp</li>
                <li>TerraPower HALEU fuel availability</li>
                <li>IRA tax credit guidance updates</li>
              </ul>
            </div>
            <div style={styles.timelineCard}>
              <div style={styles.timelineCardHeader}>Q2-Q3 2026</div>
              <ul style={styles.timelineList}>
                <li>Samsung Taylor fab production start</li>
                <li>Multiple EV battery plant commissioning</li>
                <li>NRC advanced reactor reviews progress</li>
                <li>Critical minerals project awards</li>
              </ul>
            </div>
            <div style={styles.timelineCard}>
              <div style={styles.timelineCardHeader}>2027-2028</div>
              <ul style={styles.timelineList}>
                <li>Intel Ohio Phase 2 decisions</li>
                <li>Three Mile Island restart (2028 target)</li>
                <li>SunZia transmission operational</li>
                <li>Wave 3 acceleration full effect</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER - Sources & Methodology */}
        {/* ================================================================ */}
        <footer style={styles.footer}>
          <div style={styles.footerSources}>
            <div style={styles.footerSourcesTitle}>Data Sources</div>
            <div style={styles.footerSourcesGrid}>
              <a href="https://fiscaldata.treasury.gov/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                Treasury Fiscal Data
              </a>
              <a href="https://www.whitehouse.gov/omb/budget/historical-tables/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                OMB Historical Tables
              </a>
              <a href="https://www.energy.gov/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                Department of Energy
              </a>
              <a href="https://www.semiconductors.org/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                Semiconductor Industry Association
              </a>
              <a href="https://infrastructurereportcard.org/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                ASCE Infrastructure Report
              </a>
              <a href="https://reshorenow.org/" target="_blank" rel="noreferrer" style={styles.footerLink}>
                Reshoring Initiative
              </a>
            </div>
          </div>
          <div style={styles.footerContent}>
            <span>Build Clock • U.S. Industrial Investment Tracker</span>
            <span style={styles.footerDivider}>•</span>
            <span>Last Updated: December 2025</span>
          </div>
          <div style={styles.footerNote}>
            Internal Use Only • Deloitte Consulting LLP • Operating Transformation
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
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 2.5rem',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  radarLink: {
    padding: '0.6rem 1.2rem',
    backgroundColor: COLORS.accent + '22',
    border: `1px solid ${COLORS.accent}`,
    borderRadius: '6px',
    color: COLORS.accent,
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },

  // Hero - Debt Clock Design
  heroNew: {
    marginBottom: '3rem',
  },

  // Debt Hero (the big number)
  debtHero: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  debtHeroMain: {},
  debtHeroLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  debtHeroValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
  },
  debtHeroUnit: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    letterSpacing: '3px',
  },
  debtHeroSource: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    marginTop: '0.5rem',
  },
  debtHeroQuestion: {
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  hamiltonQuestion: {
    fontSize: '0.7rem',
    color: COLORS.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  hamiltonText: {
    fontSize: '1.1rem',
    color: COLORS.text,
    lineHeight: 1.5,
    fontStyle: 'italic',
  },

  // Breakdown Section
  breakdownSection: {
    marginBottom: '1.5rem',
  },
  breakdownHeader: {
    marginBottom: '1rem',
  },
  breakdownTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: '0.25rem',
  },
  breakdownSubtitle: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  breakdownBar: {
    display: 'flex',
    height: '24px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  breakdownBarSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  breakdownCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  breakdownCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderLeft: '4px solid',
    borderRadius: '8px',
    padding: '1rem',
  },
  breakdownCardHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  breakdownCardPercent: {
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  breakdownCardLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  breakdownCardAmount: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  breakdownCardDesc: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.25rem',
  },
  breakdownCardSublabel: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    fontStyle: 'italic',
  },
  historicalNote: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },

  // Citizen Context
  citizenContext: {
    display: 'flex',
    gap: '2rem',
    padding: '1rem 1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  citizenStat: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  citizenLabel: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  citizenValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  citizenNote: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
  },

  // Metrics Grid
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  metricCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    fontWeight: 600,
    marginBottom: '0.75rem',
    lineHeight: 1.3,
  },
  metricComparison: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  metricCurrent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  metricNow: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
  },
  metricArrow: {
    fontSize: '1rem',
    color: COLORS.textMuted,
  },
  metricHistorical: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    color: COLORS.textMuted,
    fontSize: '0.9rem',
  },
  metricYear: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
  },
  metricInsight: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
    marginBottom: '0.75rem',
  },
  metricSource: {
    fontSize: '0.65rem',
    color: COLORS.blue,
    textDecoration: 'none',
  },

  // Debt Context
  debtContext: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '2rem',
    padding: '1.25rem 1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    alignItems: 'center',
  },
  debtContextLeft: {},
  debtContextLabel: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.25rem',
  },
  debtContextValue: {},
  debtContextNote: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginTop: '0.25rem',
  },
  debtContextRight: {},
  debtContextInsight: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    borderLeft: `2px solid ${COLORS.accent}`,
    paddingLeft: '1rem',
  },

  // Narrative Headers
  narrativeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  narrativeStep: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  narrativeLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },

  // Sections
  section: {
    marginBottom: '3rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.25rem',
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    margin: 0,
  },
  viewAllLink: {
    color: COLORS.accent,
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 500,
  },

  // Policy Waves
  wavesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  waveCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
  },
  waveHeader: {
    marginBottom: '0.75rem',
  },
  waveNumber: {
    fontSize: '0.65rem',
    color: COLORS.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.25rem',
  },
  waveLabel: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '0.1rem',
  },
  wavePeriod: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  waveDesc: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '1rem',
    lineHeight: 1.4,
  },
  wavePolicies: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  wavePolicy: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
  },
  wavePolicyIcon: {
    fontSize: '1rem',
    flexShrink: 0,
  },
  wavePolicyContent: {
    flex: 1,
    minWidth: 0,
  },
  wavePolicyName: {
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.1rem',
  },
  wavePolicyAmount: {
    fontSize: '0.75rem',
    color: COLORS.accent,
    fontWeight: 600,
  },
  wavePolicyNote: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
    marginTop: '0.1rem',
  },
  wavePolicyStatus: {
    fontSize: '0.6rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '3px',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    flexShrink: 0,
  },
  waveTotal: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${COLORS.border}`,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: COLORS.accent,
  },
  policyInsight: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },

  // Evidence Flow
  evidenceFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  flowStep: {
    textAlign: 'center' as const,
    padding: '0 1rem',
  },
  flowValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: COLORS.text,
    marginBottom: '0.25rem',
  },
  flowLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.1rem',
  },
  flowNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  flowArrow: {
    fontSize: '1.5rem',
    color: COLORS.textMuted,
  },

  // Sector Grid
  sectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  sectorCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  sectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  sectorName: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  sectorProjects: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  sectorValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  sectorBar: {
    height: '4px',
    backgroundColor: COLORS.border,
    borderRadius: '2px',
    overflow: 'hidden',
  },
  sectorBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  sectorQuality: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    fontSize: '0.7rem',
  },
  sectorImpact: {
    fontSize: '0.65rem',
    fontWeight: 500,
  },
  qualityInsight: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },

  // Total Pipeline
  totalPipeline: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  totalLabel: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  totalProjects: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },

  // Quote Card
  quoteCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `3px solid ${COLORS.purple}`,
    borderRadius: '8px',
    padding: '1.5rem 2rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    position: 'relative' as const,
  },
  quoteIcon: {
    position: 'absolute' as const,
    top: '0.5rem',
    left: '1rem',
    fontSize: '3rem',
    color: COLORS.purple,
    opacity: 0.3,
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
  },
  quoteText: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 1.6,
    margin: 0,
    marginBottom: '1rem',
    paddingLeft: '1rem',
  },
  quoteCite: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    fontStyle: 'normal',
    paddingLeft: '1rem',
  },

  // Gap Analysis Grid
  gapsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  gapCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
  },
  gapHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  gapIcon: {
    fontSize: '1.5rem',
  },
  gapCategory: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  gapTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  gapComparison: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
  },
  gapSide: {
    textAlign: 'center' as const,
    flex: 1,
  },
  gapValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    marginBottom: '0.1rem',
  },
  gapLabel: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
    lineHeight: 1.3,
  },
  gapVs: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    padding: '0 0.5rem',
  },
  gapBottom: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: '0.75rem',
  },
  gapGap: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    marginBottom: '0.25rem',
  },
  gapSource: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
  },

  // Fiscal Sustainability Card
  fiscalCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  fiscalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  fiscalIcon: {
    fontSize: '1.5rem',
  },
  fiscalTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  fiscalSubtitle: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  fiscalContent: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  fiscalStat: {
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  fiscalStatValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: COLORS.warning,
  },
  fiscalStatLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  fiscalLogic: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  logicRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },
  fiscalNote: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    gridColumn: '1 / -1',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    borderLeft: `3px solid ${COLORS.accent}`,
  },

  // Case Insight
  caseInsight: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: COLORS.accent + '11',
    border: `1px solid ${COLORS.accent}33`,
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  insightIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },

  // Thesis Section
  thesisSection: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '2.5rem',
    marginBottom: '2rem',
  },
  thesisContent: {
    maxWidth: '700px',
  },
  thesisTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: COLORS.accent,
  },
  thesisPara: {
    fontSize: '1rem',
    lineHeight: 1.7,
    color: COLORS.textMuted,
    marginBottom: '1rem',
  },
  thesisHighlight: {
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    padding: '1.25rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  thesisHighlightLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  thesisHighlightValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  thesisCta: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },

  // Footer
  // What's Coming Timeline
  timelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  timelineCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  timelineCardHeader: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.accent,
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  timelineList: {
    margin: 0,
    padding: 0,
    paddingLeft: '1rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: '1.5rem',
    textAlign: 'center',
  },
  footerSources: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  footerSourcesTitle: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.75rem',
  },
  footerSourcesGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '0.5rem 1.5rem',
  },
  footerLink: {
    fontSize: '0.75rem',
    color: COLORS.blue,
    textDecoration: 'none',
  },
  footerContent: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  footerDivider: {
    margin: '0 0.75rem',
    color: COLORS.border,
  },
  footerNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  gdpImpactCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  gdpImpactHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  gdpImpactIcon: {
    fontSize: '1.5rem',
  },
  gdpImpactTitle: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  gdpImpactSubtitle: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  gdpImpactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  gdpImpactStat: {
    textAlign: 'center' as const,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
  },
  gdpImpactValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  gdpImpactLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  gdpImpactProgress: {
    marginBottom: '1rem',
  },
  gdpImpactProgressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
  },
  gdpImpactProgressBar: {
    height: '24px',
    backgroundColor: COLORS.border,
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative' as const,
    marginBottom: '0.5rem',
  },
  gdpImpactProgressFill: {
    height: '100%',
    position: 'absolute' as const,
    left: 0,
    top: 0,
    transition: 'width 0.3s ease',
  },
  gdpImpactProgressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  gdpImpactNote: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    borderLeft: `3px solid ${COLORS.accent}`,
  },
}
