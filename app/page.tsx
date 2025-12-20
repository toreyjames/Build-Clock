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

// POLICY WAVES - Current focus: Wave 2 (winding down) and Wave 3 (active now)
// Sources: congress.gov, commerce.gov/chips, energy.gov, treasury.gov
const POLICY_WAVES = [
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
    description: 'Tariffs drive investment through protectionism, not subsidies',
    policies: [
      { name: 'Tariff Policy', amount: null, status: 'enacted', icon: '🚢', note: 'Strategic protectionism: 50% steel/aluminum, 10% universal + sector-specific. Drives reshoring through protection, not subsidies.' },
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
// TARIFF FUNDING TRACKER
// ============================================================================
function TariffFundingTracker() {
  // Real data from tariff tracker prerequisites
  const TOTAL_NEEDED = 925 // $925B from tariff tracker
  const TOTAL_TRACKED = 657 // $657B tracked
  const GAP = TOTAL_NEEDED - TOTAL_TRACKED // $268B gap
  
  // Estimate tariff revenue (from customs duties - need to fetch live)
  const [customsDuties, setCustomsDuties] = useState<{ value: number; date: string } | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchDuties() {
      try {
        const res = await fetch('/api/treasury-mts-latest?classification=Customs Duties')
        const data = await res.json()
        if (data.ok) {
          setCustomsDuties({ value: data.value, date: data.recordDate })
        }
      } catch (e) {
        // Fallback estimate
        setCustomsDuties({ value: 8_000_000_000, date: '2025-12' }) // ~$8B/month estimate
      } finally {
        setLoading(false)
      }
    }
    fetchDuties()
  }, [])
  
  // Annual tariff revenue estimate (monthly * 12)
  const annualTariffRevenue = customsDuties ? (customsDuties.value * 12) / 1_000_000_000 : 96 // $96B/year estimate
  
  // How many years of tariffs to close the gap
  const yearsToCloseGap = GAP / annualTariffRevenue
  
  return (
    <div style={styles.fundingTracker}>
      {/* Summary Cards */}
      <div style={styles.fundingSummary}>
        <div style={styles.fundingCard}>
          <div style={styles.fundingCardLabel}>Total Needed</div>
          <div style={styles.fundingCardValue}>${TOTAL_NEEDED}B</div>
          <div style={styles.fundingCardNote}>AI Manhattan prerequisites</div>
        </div>
        <div style={styles.fundingCard}>
          <div style={styles.fundingCardLabel}>Currently Tracked</div>
          <div style={{ ...styles.fundingCardValue, color: COLORS.accent }}>${TOTAL_TRACKED}B</div>
          <div style={styles.fundingCardNote}>{Math.round((TOTAL_TRACKED / TOTAL_NEEDED) * 100)}% covered</div>
        </div>
        <div style={styles.fundingCard}>
          <div style={styles.fundingCardLabel}>Gap Remaining</div>
          <div style={{ ...styles.fundingCardValue, color: COLORS.warning }}>${GAP}B</div>
          <div style={styles.fundingCardNote}>
            {loading ? '...' : `~${yearsToCloseGap.toFixed(1)} years at current tariff rate`}
          </div>
        </div>
        <div style={styles.fundingCard}>
          <div style={styles.fundingCardLabel}>Tariff Revenue (Annual)</div>
          <div style={{ ...styles.fundingCardValue, color: COLORS.blue }}>
            {loading ? '...' : `$${annualTariffRevenue.toFixed(0)}B`}
          </div>
          <div style={styles.fundingCardNote}>
            {customsDuties && `As of ${customsDuties.date}`}
          </div>
        </div>
      </div>
      
      {/* Gap Breakdown by Prerequisite */}
      <div style={styles.gapBreakdown}>
        <div style={styles.gapBreakdownTitle}>Investment Gaps by Prerequisite</div>
        <div style={styles.gapBreakdownGrid}>
          {[
            { name: 'Power Generation', needed: 150, tracked: 115, gap: 35, icon: '⚡' },
            { name: 'AI Chip Production', needed: 350, tracked: 295, gap: 55, icon: '🔬' },
            { name: 'AI Data Centers', needed: 200, tracked: 150, gap: 50, icon: '🧠' },
            { name: 'Grid & Transmission', needed: 200, tracked: 85, gap: 115, icon: '🔌' },
            { name: 'Water & Cooling', needed: 25, tracked: 12, gap: 13, icon: '💧' },
          ].map(prereq => {
            const coverage = Math.round((prereq.tracked / prereq.needed) * 100)
            return (
              <div key={prereq.name} style={styles.gapItem}>
                <div style={styles.gapItemHeader}>
                  <span style={styles.gapItemIcon}>{prereq.icon}</span>
                  <span style={styles.gapItemName}>{prereq.name}</span>
                </div>
                <div style={styles.gapItemNumbers}>
                  <div style={styles.gapItemRow}>
                    <span>Needed:</span>
                    <span style={{ fontWeight: 700 }}>${prereq.needed}B</span>
                  </div>
                  <div style={styles.gapItemRow}>
                    <span>Tracked:</span>
                    <span style={{ fontWeight: 700, color: COLORS.accent }}>${prereq.tracked}B</span>
                  </div>
                  <div style={styles.gapItemRow}>
                    <span>Gap:</span>
                    <span style={{ fontWeight: 700, color: COLORS.warning }}>${prereq.gap}B</span>
                  </div>
                </div>
                <div style={styles.gapItemBar}>
                  <div style={{ ...styles.gapItemBarFill, width: `${coverage}%` }} />
                </div>
                <div style={styles.gapItemCoverage}>{coverage}% covered</div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Tariff Validation - Evidence that tariffs are going to AI Manhattan */}
      <div style={styles.tariffValidation}>
        <div style={styles.tariffValidationTitle}>Validation: Tariff Revenue → AI Manhattan Investment</div>
        <div style={styles.tariffValidationSubtitle}>
          Evidence that tariff policy is driving investment into AI Manhattan prerequisites
        </div>
        
        <div style={styles.tariffValidationGrid}>
          {/* Tariff-Driven Projects */}
          <div style={styles.tariffValidationCard}>
            <div style={styles.tariffValidationCardHeader}>
              <span style={styles.tariffValidationIcon}>✅</span>
              <span style={styles.tariffValidationCardTitle}>Tariff-Driven Projects</span>
            </div>
            <div style={styles.tariffValidationList}>
              {[
                { sector: 'Semiconductors', projects: ['TSMC Arizona ($40B)', 'Intel Ohio ($28B)', 'Samsung Texas ($17B)'], investment: 85, evidence: '100% tariff threat on imported chips → domestic fab requirement' },
                { sector: 'AI Data Centers', projects: ['Microsoft Stargate ($100B)', 'Google expansions', 'Amazon data centers'], investment: 150, evidence: 'Strategic AI infrastructure → tariff protection for domestic buildout' },
                { sector: 'Grid & Transmission', projects: ['HVDC lines', 'Transformer manufacturing', 'Substation upgrades'], investment: 85, evidence: 'Tariff protection for grid equipment → enables data center power delivery' },
                { sector: 'Critical Minerals', projects: ['MP Materials', 'Lynas Texas', 'Rare earth processing'], investment: 12, evidence: 'Tariff-driven reshoring → prerequisite for chip manufacturing' },
              ].map((item, idx) => (
                <div key={idx} style={styles.tariffValidationItem}>
                  <div style={styles.tariffValidationItemHeader}>
                    <strong style={{ color: COLORS.accent }}>{item.sector}</strong>
                    <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>${item.investment}B</span>
                  </div>
                  <div style={styles.tariffValidationItemProjects}>
                    {item.projects.map((p, i) => (
                      <span key={i} style={styles.tariffValidationProjectTag}>{p}</span>
                    ))}
                  </div>
                  <div style={styles.tariffValidationItemEvidence}>
                    <span style={{ fontSize: '0.75rem', color: COLORS.textDim }}>Evidence: </span>
                    <span style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{item.evidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Mechanisms */}
          <div style={styles.tariffValidationCard}>
            <div style={styles.tariffValidationCardHeader}>
              <span style={styles.tariffValidationIcon}>🔗</span>
              <span style={styles.tariffValidationCardTitle}>Policy Mechanisms</span>
            </div>
            <div style={styles.tariffValidationList}>
              {[
                { 
                  mechanism: '100% Tariff on Imported Chips',
                  target: 'Semiconductor fabs',
                  validation: 'Companies must produce domestically or face 100% tariff → forces AI chip production in U.S.',
                  examples: 'TSMC, Intel, Samsung expansions',
                },
                { 
                  mechanism: '1:1 Production Ratio',
                  target: 'Domestic chip capacity',
                  validation: 'Import 1M chips → must produce 1M domestically → massive capacity ramp required',
                  examples: 'Forces $100B+ annual domestic production',
                },
                { 
                  mechanism: 'Strategic Protectionism',
                  target: 'AI infrastructure',
                  validation: 'Tariffs protect domestic AI data center buildout → enables strategic AI autonomy',
                  examples: 'Microsoft Stargate, Google, Amazon data centers',
                },
                { 
                  mechanism: 'CHIPS Act + Tariffs',
                  target: 'Semiconductor ecosystem',
                  validation: 'CHIPS Act provides subsidies, tariffs provide protection → combined incentive for domestic fabs',
                  examples: '$50B+ CHIPS awards + tariff protection',
                },
              ].map((item, idx) => (
                <div key={idx} style={styles.tariffValidationItem}>
                  <div style={styles.tariffValidationItemHeader}>
                    <strong style={{ color: COLORS.blue }}>{item.mechanism}</strong>
                  </div>
                  <div style={styles.tariffValidationItemTarget}>
                    <span style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Target: </span>
                    <span style={{ fontSize: '0.8rem' }}>{item.target}</span>
                  </div>
                  <div style={styles.tariffValidationItemEvidence}>
                    <span style={{ fontSize: '0.75rem', color: COLORS.textDim }}>Validation: </span>
                    <span style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>{item.validation}</span>
                  </div>
                  <div style={styles.tariffValidationItemExamples}>
                    <span style={{ fontSize: '0.75rem', color: COLORS.textDim }}>Examples: </span>
                    <span style={{ fontSize: '0.75rem', color: COLORS.accent }}>{item.examples}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.tariffValidationSummary}>
          <strong>Validation Summary:</strong> Tariff policy is directly driving ${TOTAL_TRACKED}B in AI Manhattan-aligned 
          investments through protection mechanisms (100% chip tariffs, 1:1 production ratio) and strategic protectionism 
          for AI infrastructure. Tariff revenue (${loading ? '...' : annualTariffRevenue.toFixed(0)}B/yr) supports federal 
          programs (CHIPS Act, IRA) that fund these prerequisites, while tariff protection ensures private investment 
          flows to domestic AI Manhattan buildout rather than imports.
        </div>
      </div>

      {/* Funding Sources */}
      <div style={styles.fundingSources}>
        <div style={styles.fundingSourcesTitle}>Funding Sources</div>
        <div style={styles.fundingSourcesGrid}>
          <div style={styles.fundingSourceCard}>
            <div style={styles.fundingSourceLabel}>Tariffs</div>
            <div style={styles.fundingSourceValue}>
              {loading ? '...' : `$${annualTariffRevenue.toFixed(0)}B/yr`}
            </div>
            <div style={styles.fundingSourceNote}>Current annual revenue</div>
          </div>
          <div style={styles.fundingSourceCard}>
            <div style={styles.fundingSourceLabel}>Federal Spending</div>
            <div style={styles.fundingSourceValue}>$490B/yr</div>
            <div style={styles.fundingSourceNote}>Physical investment (8% of $6.1T)</div>
          </div>
          <div style={styles.fundingSourceCard}>
            <div style={styles.fundingSourceLabel}>Private Investment</div>
            <div style={styles.fundingSourceValue}>$657B</div>
            <div style={styles.fundingSourceNote}>Tracked in pipeline</div>
          </div>
        </div>
        <div style={styles.fundingSourcesNote}>
          <strong>Gap Analysis:</strong> ${GAP}B remaining. At current tariff rate ({loading ? '...' : `$${annualTariffRevenue.toFixed(0)}B/yr`}), 
          would take {loading ? '...' : yearsToCloseGap.toFixed(1)} years to close gap. Additional tariffs or federal spending increases needed to accelerate.
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AI IMPACT TARGETS - The Strategic Goal: GDP Growth to Reduce Debt-to-GDP
// ============================================================================
function AIImpactTargets() {
  // Main strategic goal: Increase GDP to reduce debt-to-GDP ratio
  // Sources: Treasury Fiscal Data, CBO, BEA
  const STRATEGIC_GOAL = {
    currentDebtToGDP: 122, // ~122% of GDP (2024, Treasury/CBO)
    usGDP2024: 29200, // $29.2T current US GDP (2024, BEA)
    debtToGDPSource: 'Treasury Fiscal Data, CBO',
    debtToGDPUrl: 'https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny',
    gdpSource: 'BEA',
    gdpUrl: 'https://www.bea.gov/data/gdp/gross-domestic-product',
  }

  // Map sector names to icons (matching STRATEGIC_GAPS structure)
  const sectorIconMap: Record<string, string> = {
    'Semiconductors': '🔬',
    'AI Data Centers': '🧠',
    'EV & Battery': '🔋',
    'Grid & Clean Energy': '⚡',
    'Nuclear (SMRs)': '⚛️',
    'Critical Minerals': '🧲',
    'Water & Utilities': '💧',
    'Advanced Mfg': '⚙️',
  }
  
  // GDP multipliers source: CBO research (infrastructure multipliers range 0.4-2.2x, midpoint 1.3x)
  // Source: CBO, EPI analysis - https://www.epi.org/publication/methodology-estimating-jobs-impact/
  const MULTIPLIER_SOURCE = {
    text: 'CBO, EPI analysis',
    url: 'https://www.epi.org/publication/methodology-estimating-jobs-impact/',
  }
  
  // How each sector contributes to GDP growth
  const SECTOR_CONTRIBUTIONS = SECTOR_PIPELINE.map(sector => {
    const multiplierMap: Record<string, number> = {
      'transformational': 2.0, // High-end of CBO range for transformative projects
      'catalytic': 1.5, // Mid-high range for catalytic investments
      'significant': 1.3, // CBO midpoint for infrastructure
      'direct-only': 1.0, // Direct impact only
    }
    const multiplier = multiplierMap[sector.economicImpact] || 1.3
    const gdpImpact = sector.pipeline * multiplier // Already in billions
    
    return {
      sector: sector.sector,
      displayName: sector.sector, // sector is the display name
      icon: sectorIconMap[sector.sector] || '📦',
      investment: sector.pipeline, // $B
      gdpImpact, // $B (with multiplier)
      multiplier: multiplier.toFixed(1) + 'x',
      economicImpact: sector.economicImpact,
    }
  }).filter(s => s.investment > 0).sort((a, b) => b.gdpImpact - a.gdpImpact)
  
  return (
    <div style={styles.impactTargets}>
      {/* Main Strategic Goal */}
      <div style={styles.strategicGoalCard}>
        <div style={styles.strategicGoalHeader}>
          <div style={styles.strategicGoalTitle}>The Strategic Goal: GDP Growth to Reduce Debt-to-GDP Ratio</div>
        </div>
        <div style={styles.strategicGoalContent}>
          <div style={styles.strategicGoalMetrics}>
            <div style={styles.strategicGoalMetric}>
              <div style={styles.strategicGoalMetricLabel}>Current Debt-to-GDP</div>
              <div style={styles.strategicGoalMetricValue}>{STRATEGIC_GOAL.currentDebtToGDP}%</div>
              <div style={styles.strategicGoalMetricNote}>2024</div>
              <div style={styles.strategicGoalMetricSource}>
                <a href={STRATEGIC_GOAL.debtToGDPUrl} target="_blank" rel="noreferrer" style={styles.sourceLink}>
                  {STRATEGIC_GOAL.debtToGDPSource}
                </a>
              </div>
            </div>
            <div style={styles.strategicGoalArrow}>→</div>
            <div style={styles.strategicGoalMetric}>
              <div style={styles.strategicGoalMetricLabel}>US GDP (2024)</div>
              <div style={styles.strategicGoalMetricValue}>${(STRATEGIC_GOAL.usGDP2024 / 1000).toFixed(1)}T</div>
              <div style={styles.strategicGoalMetricNote}>Current GDP</div>
              <div style={styles.strategicGoalMetricSource}>
                <a href={STRATEGIC_GOAL.gdpUrl} target="_blank" rel="noreferrer" style={styles.sourceLink}>
                  {STRATEGIC_GOAL.gdpSource}
                </a>
              </div>
            </div>
          </div>
          <div style={styles.strategicGoalExplanation}>
            <strong>The Strategy:</strong> Instead of cutting spending or raising taxes, grow the economy faster than debt. 
            Growing GDP (the denominator) reduces the debt-to-GDP ratio even if debt continues to grow. AI productivity gains 
            from the physical infrastructure we're building could significantly boost GDP, reducing the ratio through economic expansion.
          </div>
        </div>
      </div>

      {/* Sector Contributions */}
      <div style={styles.sectorContributionsHeader}>
        <div style={styles.sectorContributionsTitle}>How We Get There: Sector Contributions to GDP Growth</div>
        <div style={styles.sectorContributionsSubtitle}>
          Current pipeline investment → GDP impact (with multipliers based on economic impact category)
        </div>
        <div style={styles.sectorContributionsSource}>
          Multipliers: <a href={MULTIPLIER_SOURCE.url} target="_blank" rel="noreferrer" style={styles.sourceLink}>
            {MULTIPLIER_SOURCE.text}
          </a> (CBO estimates infrastructure multipliers 0.4-2.2x, using conservative range)
        </div>
      </div>

      <div style={styles.sectorContributionsGrid}>
        {SECTOR_CONTRIBUTIONS.map((sector, idx) => (
          <div key={sector.sector} style={styles.sectorContributionCard}>
            <div style={styles.sectorContributionHeader}>
              <span style={styles.sectorContributionIcon}>{sector.icon}</span>
              <span style={styles.sectorContributionName}>{sector.displayName}</span>
            </div>
            <div style={styles.sectorContributionMetrics}>
              <div style={styles.sectorContributionRow}>
                <span style={styles.sectorContributionLabel}>Investment:</span>
                <span style={styles.sectorContributionValue}>${sector.investment.toFixed(0)}B</span>
              </div>
              <div style={styles.sectorContributionRow}>
                <span style={styles.sectorContributionLabel}>GDP Impact ({sector.multiplier}):</span>
                <span style={{ ...styles.sectorContributionValue, color: COLORS.accent }}>
                  ${sector.gdpImpact.toFixed(0)}B
                </span>
              </div>
              <div style={styles.sectorContributionRow}>
                <span style={styles.sectorContributionLabel}>Category:</span>
                <span style={{ ...styles.sectorContributionValue, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {sector.economicImpact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.impactTargetsNote}>
        <strong>Why Physical Infrastructure Matters:</strong> AI productivity gains require the physical prerequisites 
        to be built first—data centers, power, chips, water, grid. The ${(GDP_IMPACT.totalGDPImpact / 1000).toFixed(1)}T GDP impact 
        from current pipeline investments (with multipliers) helps drive the denominator growth needed to reduce debt-to-GDP, 
        but only if capacity comes online and enables broader economic productivity gains.
      </div>
    </div>
  )
}

// ============================================================================
// AI MANHATTAN PROJECT - DEPENDENCY UNIVERSE VISUALIZATION
// ============================================================================
// The AI data center buildout is the strategic driver that creates demand for everything
function StrategicGapsNetwork({ gaps }: { gaps: typeof STRATEGIC_GAPS }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // THE UNIVERSE: Inputs → Heart → Brain → Infrastructure
  // Heart needs: Data, Talent, Problems to solve
  // Heart runs on: Brain (Data Centers)
  // Brain needs: Power, Chips, Water, Storage
  // Those need: Nuclear, Grid, Transformers, Rare Earths, etc.
  
  const nodes = [
    // INPUTS TO THE HEART (what feeds it) - spread across top
    { id: 'data', label: 'Data', sublabel: 'Training & Learning', icon: '📊', color: '#4fc3f7', x: 15, y: 10, size: 'small', sector: null },
    { id: 'problems', label: 'Problems', sublabel: 'Cancer, Education...', icon: '🎯', color: COLORS.warning, x: 50, y: 5, size: 'small', sector: null },
    { id: 'talent', label: 'Talent', sublabel: 'Smartest People', icon: '👨‍🔬', color: COLORS.accent, x: 85, y: 10, size: 'small', sector: null },
    
    // The Heart - The PURPOSE (AI solving problems)
    { id: 'heart', label: 'The Heart', sublabel: 'AI Solving Problems', icon: '❤️', color: '#f85149', x: 50, y: 22, size: 'large', sector: null },
    
    // The Brain - Data Centers that run the models
    { id: 'brain', label: 'The Brain', sublabel: 'AI Data Centers', icon: '🧠', color: COLORS.purple, x: 50, y: 42, size: 'large', sector: 'data-centers' },
    
    // INFRASTRUCTURE RING: What the Brain needs
    { id: 'power', label: 'Power', sublabel: '100MW+ per DC', icon: '⚡', color: COLORS.warning, x: 50, y: 60, size: 'medium', sector: 'clean-energy' },
    { id: 'chips', label: 'AI Chips', sublabel: 'GPUs, TPUs, ASICs', icon: '🔬', color: COLORS.blue, x: 78, y: 50, size: 'medium', sector: 'semiconductors' },
    { id: 'water', label: 'Water', sublabel: 'Cooling Systems', icon: '💧', color: '#4fc3f7', x: 22, y: 50, size: 'medium', sector: 'water-utilities' },
    { id: 'storage', label: 'Storage', sublabel: 'Battery Backup', icon: '🔋', color: COLORS.accent, x: 22, y: 65, size: 'medium', sector: 'ev-battery' },
    
    // OUTER RING: Prerequisites (what the infrastructure needs)
    { id: 'nuclear', label: 'Nuclear', sublabel: 'Clean Baseload', icon: '⚛️', color: '#ff7043', x: 35, y: 78, size: 'small', sector: 'nuclear' },
    { id: 'grid', label: 'Grid', sublabel: 'Transmission', icon: '🔌', color: COLORS.warning, x: 50, y: 78, size: 'small', sector: 'clean-energy' },
    { id: 'transformers', label: 'Transformers', sublabel: '2-3yr lead times', icon: '🔧', color: COLORS.warning, x: 65, y: 78, size: 'small', sector: 'clean-energy' },
    { id: 'rare-earths', label: 'Rare Earths', sublabel: 'Magnets & Materials', icon: '🧲', color: '#ab47bc', x: 92, y: 60, size: 'small', sector: 'critical-minerals' },
    { id: 'chemicals', label: 'Chemicals', sublabel: 'Process Materials', icon: '🧪', color: '#26a69a', x: 92, y: 45, size: 'small', sector: 'chemicals' },
    { id: 'upw', label: 'Ultra-Pure Water', sublabel: 'Fab Requirements', icon: '🚰', color: '#4fc3f7', x: 8, y: 60, size: 'small', sector: 'water-utilities' },
    { id: 'water-rights', label: 'Water Rights', sublabel: 'Allocation', icon: '💧', color: '#4fc3f7', x: 8, y: 45, size: 'small', sector: 'water-utilities' },
    { id: 'workforce', label: 'Workforce', sublabel: '$30 vs $6/hr gap', icon: '👷', color: COLORS.danger, x: 8, y: 90, size: 'small', sector: null },
  ]

  // Connections show dependency flow
  const connections = [
    // INPUTS feed the Heart
    { from: 'problems', to: 'heart', label: 'defines', type: 'primary' },
    { from: 'data', to: 'heart', label: 'trains', type: 'primary' },
    { from: 'talent', to: 'heart', label: 'builds', type: 'primary' },
    
    // The Heart runs on the Brain
    { from: 'heart', to: 'brain', label: 'runs on', type: 'primary' },
    
    // The Brain needs infrastructure
    { from: 'brain', to: 'power', label: 'needs', type: 'primary' },
    { from: 'brain', to: 'chips', label: 'needs', type: 'primary' },
    { from: 'brain', to: 'water', label: 'needs', type: 'primary' },
    { from: 'brain', to: 'storage', label: 'needs', type: 'primary' },
    
    // SECONDARY: Power needs (outer ring)
    { from: 'power', to: 'nuclear', label: 'baseload', type: 'secondary' },
    { from: 'power', to: 'grid', label: 'transmission', type: 'secondary' },
    { from: 'power', to: 'transformers', label: 'interconnect', type: 'secondary' },
    
    // Chips need...
    { from: 'chips', to: 'rare-earths', label: 'materials', type: 'secondary' },
    { from: 'chips', to: 'chemicals', label: 'process', type: 'secondary' },
    { from: 'chips', to: 'upw', label: 'fab ops', type: 'secondary' },
    
    // SECONDARY: Water needs (outer ring)
    { from: 'water', to: 'water-rights', label: 'allocation', type: 'secondary' },
    { from: 'water', to: 'upw', label: 'treatment', type: 'secondary' },
    
    // Storage needs...
    { from: 'storage', to: 'rare-earths', label: 'magnets', type: 'secondary' },
    
    // CONSTRAINT: Workforce gap affects everything
    { from: 'workforce', to: 'brain', label: '$30 vs $6/hr', type: 'constraint' },
    { from: 'workforce', to: 'chips', label: 'automation', type: 'constraint' },
    
    // FEEDBACK: Nuclear feeds grid
    { from: 'nuclear', to: 'grid', label: 'feeds', type: 'feedback' },
    
    // CROSS-CONNECTIONS: Grid needs transformers
    { from: 'grid', to: 'transformers', label: 'needs', type: 'secondary' },
  ]

  const handleNodeClick = (sector: string | null) => {
    if (sector) {
      window.location.href = `/opportunities?sector=${sector}`
    }
  }

  return (
    <div style={styles.networkContainer}>
      {/* Title callout */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: COLORS.purple + '15',
        borderRadius: '8px',
        border: `1px solid ${COLORS.purple}40`
      }}>
        <div style={{ fontSize: '0.75rem', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.25rem' }}>
          The Strategic Driver
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: COLORS.text }}>
          AI Data Center Buildout: $500B+ Stargate & Hyperscalers
        </div>
        <div style={{ fontSize: '0.85rem', color: COLORS.textMuted, marginTop: '0.25rem' }}>
          Everything below exists to serve this demand. Follow the connections.
        </div>
      </div>

      <svg 
        viewBox="0 0 100 100" 
        style={{ ...styles.networkSvg, height: '450px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Defs */}
        <defs>
          <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 4 2, 0 4" fill={COLORS.accent} />
          </marker>
          <marker id="arrowhead-dim" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 4 2, 0 4" fill={COLORS.border} />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Center glow for AI */}
        <circle cx="50" cy="50" r="12" fill="url(#centerGlow)" />

        {/* Connection lines */}
        {connections.map((conn, idx) => {
          const fromNode = nodes.find(n => n.id === conn.from)
          const toNode = nodes.find(n => n.id === conn.to)
          if (!fromNode || !toNode) return null

          const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to || selectedNode === conn.from || selectedNode === conn.to
          const isPrimary = conn.type === 'primary'
          const isConstraint = conn.type === 'constraint'
          const isFeedback = conn.type === 'feedback'
          
          return (
            <g key={idx}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isHighlighted ? COLORS.accent : isConstraint ? COLORS.danger : isPrimary ? COLORS.purple + '60' : COLORS.border}
                strokeWidth={isHighlighted ? 0.4 : isPrimary ? 0.25 : 0.15}
                strokeDasharray={isFeedback ? '0.8,0.4' : isConstraint ? '0.5,0.5' : 'none'}
                opacity={isHighlighted ? 1 : isPrimary ? 0.7 : 0.4}
                markerEnd={isHighlighted ? "url(#arrowhead)" : isPrimary ? "url(#arrowhead-dim)" : undefined}
              />
              {isHighlighted && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 1.5}
                  fontSize="1.8"
                  fill={COLORS.text}
                  textAnchor="middle"
                  fontWeight={600}
                  style={{ pointerEvents: 'none' }}
                >
                  {conn.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isHovered = hoveredNode === node.id
          const isSelected = selectedNode === node.id
          const isActive = isHovered || isSelected
          const isCenter = node.id === 'heart' || node.id === 'brain'
          const baseRadius = node.size === 'large' ? 6 : node.size === 'medium' ? 4 : 3

          return (
            <g
              key={node.id}
              style={{ cursor: node.sector ? 'pointer' : 'default' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                setSelectedNode(node.id)
                handleNodeClick(node.sector)
              }}
            >
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isActive ? baseRadius + 1 : baseRadius}
                fill={isActive || isCenter ? node.color : COLORS.bgCard}
                stroke={isActive ? COLORS.accent : node.color}
                strokeWidth={isActive ? 0.5 : isCenter ? 0.4 : 0.2}
                opacity={isActive ? 1 : isCenter ? 1 : 0.85}
                filter={isCenter ? 'url(#glow)' : undefined}
                style={{ transition: 'all 0.2s' }}
              />
              
              {/* Node icon */}
              <text
                x={node.x}
                y={node.y + (isCenter ? 1.5 : 1)}
                fontSize={isCenter ? 4 : node.size === 'medium' ? 3 : 2.5}
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {node.icon}
              </text>

              {/* Labels */}
              <text
                x={node.x}
                y={node.y + baseRadius + 3}
                fontSize={isCenter ? 2.5 : 2}
                fill={isActive ? COLORS.text : COLORS.textMuted}
                textAnchor="middle"
                fontWeight={isActive || isCenter ? 700 : 500}
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
              {(isActive || isCenter) && (
                <text
                  x={node.x}
                  y={node.y + baseRadius + 5.5}
                  fontSize="1.6"
                  fill={COLORS.textDim}
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.sublabel}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem', fontSize: '0.75rem', color: COLORS.textMuted }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: COLORS.purple }} />
          <span>Primary dependency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: COLORS.border }} />
          <span>Prerequisite</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: COLORS.danger, borderStyle: 'dashed' }} />
          <span>Constraint</span>
        </div>
      </div>

      {/* Key Insights - What This Means */}
      <div style={styles.networkInsights}>
        <div style={styles.networkInsightTitle}>The Dependency Chain</div>
        <div style={styles.networkInsightGrid}>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: '#f85149' }}>The Heart</strong> solves problems—fed by data and talent. <strong style={{ color: COLORS.purple }}>The Brain</strong> (data centers) runs the models. All infrastructure below exists to keep the brain running so the heart can beat.
          </div>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: COLORS.warning }}>Power</strong> is the first constraint. 100MW+ per data center. Grid can't handle it. Nuclear provides clean baseload. Transformers have 2-3 year lead times—critical bottleneck.
          </div>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: COLORS.blue }}>Chips</strong> need fabs, which need rare earths (magnets), chemicals (process materials), and ultra-pure water. 2-3 year equipment lead times. Every fab needs MES, SCADA, OT systems.
          </div>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: '#4fc3f7' }}>Water</strong> is critical for cooling and fab operations. Water rights allocation is contested. Ultra-pure water systems are prerequisites for semiconductor fabs.
          </div>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: COLORS.danger }}>Workforce Gap</strong> ($30 vs $6/hr) means automation isn't optional—it's strategic necessity. AI solves its own prerequisite problem through industrial AI and OT automation.
          </div>
          <div style={styles.networkInsightItem}>
            <strong style={{ color: COLORS.accent }}>The Pattern:</strong> Every node needs OT systems. Every connection represents a dependency that can fail. Understanding this universe reveals where to invest and where bottlenecks will emerge.
          </div>
        </div>
      </div>
    </div>
  )
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
            <Link href="/heart" style={{ ...styles.radarLink, backgroundColor: 'rgba(248, 81, 73, 0.15)', borderColor: '#f85149' }}>
              ❤️ The Heart →
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/ai-opportunities" style={styles.radarLink}>
              SFL →
            </Link>
            <Link href="/references" style={styles.radarLink}>
              References →
            </Link>
          </div>
        </header>

        {/* ================================================================ */}
        {/* SECTION 1: THE SYSTEM - AI as the Strategic Driver */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>01</span>
            <span style={styles.narrativeLabel}>THE SYSTEM</span>
          </div>
          <h2 style={styles.sectionTitle}>Heart &amp; Brain: Purpose and Power</h2>
          <p style={styles.sectionSubtitle}>
            The Heart is AI solving problems. The Brain is data centers running the models. Everything else exists to keep them working.
          </p>
          
          {/* Interactive Dependency Network - AI at Center */}
          <StrategicGapsNetwork gaps={STRATEGIC_GAPS} />
          
          {/* CTA to Opportunities */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/opportunities" style={styles.viewAllLink}>
              Explore Opportunities →
            </Link>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SECTION 2: TARIFF FUNDING TRACKER */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>02</span>
            <span style={styles.narrativeLabel}>FUNDING STATUS</span>
          </div>
          <h2 style={styles.sectionTitle}>How Tariffs Are Paying for AI Manhattan</h2>
          <p style={styles.sectionSubtitle}>
            Real-time tracking of investment gaps and funding sources
          </p>
          
          <TariffFundingTracker />
        </section>

        {/* ================================================================ */}
        {/* SECTION 3: THE WHY - AI Impact Targets */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>03</span>
            <span style={styles.narrativeLabel}>THE WHY</span>
          </div>
          <h2 style={styles.sectionTitle}>Why AI Manhattan: The End Goal</h2>
          <p style={styles.sectionSubtitle}>
            Real stated targets for AI's impact in the physical world
          </p>
          
          <AIImpactTargets />
        </section>

        {/* ================================================================ */}
        {/* SECTION 4: THE HEART - AI Solving America's Problems */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <div style={styles.narrativeHeader}>
            <span style={styles.narrativeStep}>04</span>
            <span style={styles.narrativeLabel}>THE HEART</span>
          </div>
          <h2 style={styles.sectionTitle}>What This Is All For</h2>
          <p style={styles.sectionSubtitle}>
            The infrastructure is the body. AI solving America's hardest problems is the heart.
          </p>
          
          {/* Heart Callout */}
          <div style={{
            background: 'radial-gradient(ellipse at center, rgba(248, 81, 73, 0.15) 0%, transparent 70%)',
            border: `1px solid ${COLORS.danger}`,
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            marginTop: '1.5rem',
          }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>❤️</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1rem 0', color: COLORS.text }}>
              The Heart: AI Solving America's Hardest Problems
            </h3>
            <p style={{ fontSize: '1rem', color: COLORS.textMuted, maxWidth: '700px', margin: '0 auto 1.5rem auto', lineHeight: 1.7 }}>
              Every chip fab, data center, and power plant we track exists to enable AI models that solve real problems:
              <strong style={{ color: COLORS.text }}> detecting cancer years earlier</strong>,
              <strong style={{ color: COLORS.text }}> discovering cures in years not decades</strong>,
              <strong style={{ color: COLORS.text }}> educating every child their way</strong>,
              <strong style={{ color: COLORS.text }}> bringing manufacturing home</strong>.
            </p>
            <p style={{ fontSize: '0.9rem', color: COLORS.textDim, maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              This isn't magic — it's pattern recognition at inhuman scale. But it only works if we build the infrastructure.
              The data centers, chips, and power we track are the body that keeps this heart beating.
            </p>
            <Link href="/heart" style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: COLORS.danger,
              color: COLORS.text,
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              Explore What We're Building For →
            </Link>
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

  // Video Section
  videoSection: {
    marginBottom: '3rem',
  },
  videoContainer: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '2rem',
  },
  videoHeader: {
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  videoTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.5rem',
    color: COLORS.text,
  },
  videoSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    margin: 0,
    lineHeight: 1.5,
  },
  videoWrapper: {
    position: 'relative' as const,
    width: '100%',
    paddingBottom: '56.25%', // 16:9 aspect ratio
    height: 0,
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  videoIframe: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  videoPlaceholder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    border: `2px dashed ${COLORS.border}`,
  },
  videoPlaceholderContent: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  videoPlaceholderIcon: {
    fontSize: '4rem',
    color: COLORS.accent,
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  videoPlaceholderText: {
    color: COLORS.textMuted,
  },
  videoPlaceholderTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: '0.5rem',
  },
  videoPlaceholderDesc: {
    fontSize: '0.85rem',
    lineHeight: 1.5,
  },
  videoNote: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
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

  // Pipeline Roadmap
  roadmapContainer: {
    position: 'relative' as const,
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  roadmapNowBadge: {
    position: 'absolute' as const,
    right: '2rem',
    top: '-12px',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 900,
    letterSpacing: '0.05em',
    border: `2px solid ${COLORS.bg}`,
    zIndex: 10,
  },
  roadmapNowLabel: {
    color: COLORS.bg,
  },
  roadmapTimeline: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  roadmapWave: {
    display: 'flex',
    gap: '1.5rem',
    position: 'relative' as const,
  },
  roadmapWaveMarker: {
    flexShrink: 0,
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: `3px solid`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
  roadmapWaveNumber: {
    fontSize: '1.25rem',
    fontWeight: 900,
    color: COLORS.text,
  },
  roadmapWaveContent: {
    flex: 1,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  roadmapWaveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  roadmapWaveLabel: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  roadmapWavePeriod: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  roadmapWaveActive: {
    fontSize: '0.65rem',
    fontWeight: 900,
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  roadmapWaveWindingDown: {
    fontSize: '0.65rem',
    fontWeight: 900,
    color: COLORS.warning,
    backgroundColor: COLORS.warning + '22',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  roadmapWaveTotal: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: COLORS.accent,
    marginBottom: '0.75rem',
  },
  roadmapWavePolicies: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  roadmapPolicy: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
  },
  roadmapPolicyName: {
    flex: 1,
    color: COLORS.textMuted,
  },
  roadmapPolicyAmount: {
    fontWeight: 700,
    color: COLORS.accent,
  },

  // Policy Waves (legacy, keeping for reference but not using in roadmap)
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

  // Network Visualization
  networkContainer: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '1.5rem',
    position: 'relative' as const,
  },
  networkSvg: {
    width: '100%',
    height: '400px',
    minHeight: '300px',
  },
  networkLegend: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  networkLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  networkLegendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  networkLegendText: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  networkInsights: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  networkInsightTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '1rem',
  },
  networkInsightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  networkInsightItem: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
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
  
  // Tariff Funding Tracker
  fundingTracker: {
    marginTop: '1.5rem',
  },
  fundingSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  fundingCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    textAlign: 'center' as const,
  },
  fundingCardLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  fundingCardValue: {
    fontSize: '2rem',
    fontWeight: 900,
    marginBottom: '0.25rem',
  },
  fundingCardNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  gapBreakdown: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  gapBreakdownTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
  },
  gapBreakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  gapItem: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  gapItemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  gapItemIcon: {
    fontSize: '1.25rem',
  },
  gapItemName: {
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  gapItemNumbers: {
    marginBottom: '0.75rem',
  },
  gapItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
    color: COLORS.textMuted,
  },
  gapItemBar: {
    height: '4px',
    backgroundColor: COLORS.border,
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  gapItemBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  gapItemCoverage: {
    fontSize: '0.7rem',
    color: COLORS.accent,
    fontWeight: 600,
  },
  fundingSources: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  fundingSourcesTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  fundingSourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fundingSourceCard: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  fundingSourceLabel: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  fundingSourceValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  fundingSourceNote: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  fundingSourcesNote: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    borderLeft: `4px solid ${COLORS.warning}`,
  },
  // Tariff Validation
  tariffValidation: {
    marginTop: '2rem',
    marginBottom: '2rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `2px solid ${COLORS.blue}50`,
    borderRadius: '16px',
  },
  tariffValidationTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '0.5rem',
  },
  tariffValidationSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '2rem',
  },
  tariffValidationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  tariffValidationCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  tariffValidationCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tariffValidationIcon: {
    fontSize: '1.5rem',
  },
  tariffValidationCardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: COLORS.text,
  },
  tariffValidationList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  tariffValidationItem: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  tariffValidationItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  tariffValidationItemProjects: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  tariffValidationProjectTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
  },
  tariffValidationItemTarget: {
    marginBottom: '0.5rem',
  },
  tariffValidationItemEvidence: {
    marginBottom: '0.5rem',
    lineHeight: 1.5,
  },
  tariffValidationItemExamples: {
    lineHeight: 1.5,
  },
  tariffValidationSummary: {
    fontSize: '0.9rem',
    color: COLORS.text,
    lineHeight: 1.7,
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    borderLeft: `4px solid ${COLORS.blue}`,
  },
  
  // AI Impact Targets
  impactTargets: {
    marginTop: '1.5rem',
  },
  impactTargetsIntro: {
    padding: '1.5rem',
    backgroundColor: COLORS.purple + '15',
    border: `1px solid ${COLORS.purple}35`,
    borderRadius: '12px',
    marginBottom: '2rem',
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.7,
  },
  impactTargetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  impactCategory: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  impactCategoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  impactCategoryIcon: {
    fontSize: '1.5rem',
  },
  impactCategoryName: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  impactTargetsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  impactTarget: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  impactTargetMetric: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
  },
  impactTargetProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  impactTargetCurrent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  impactTargetTarget: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  impactTargetLabel: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
  },
  impactTargetValue: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  impactTargetArrow: {
    fontSize: '1.25rem',
    color: COLORS.textMuted,
  },
  impactTargetMeta: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  impactTargetSource: {
    color: COLORS.textMuted,
  },
  impactTargetsNote: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.7,
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    borderLeft: `4px solid ${COLORS.purple}`,
    marginTop: '2rem',
  },
  // Strategic Goal Card
  strategicGoalCard: {
    backgroundColor: COLORS.bgCard,
    border: `2px solid ${COLORS.purple}50`,
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '3rem',
  },
  strategicGoalHeader: {
    marginBottom: '2rem',
  },
  strategicGoalTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.text,
    textAlign: 'center' as const,
  },
  strategicGoalContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  strategicGoalMetrics: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  strategicGoalMetric: {
    flex: 1,
    minWidth: '200px',
    textAlign: 'center' as const,
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  strategicGoalMetricLabel: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  strategicGoalMetricValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: COLORS.text,
    marginBottom: '0.5rem',
  },
  strategicGoalMetricNote: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginBottom: '0.5rem',
  },
  strategicGoalMetricSource: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    marginTop: '0.5rem',
  },
  sourceLink: {
    color: COLORS.blue,
    textDecoration: 'none',
  },
  strategicGoalArrow: {
    fontSize: '2rem',
    color: COLORS.textMuted,
    fontWeight: 300,
  },
  strategicGoalExplanation: {
    fontSize: '0.95rem',
    color: COLORS.text,
    lineHeight: 1.8,
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  // Sector Contributions
  sectorContributionsHeader: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  sectorContributionsTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '0.5rem',
  },
  sectorContributionsSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  sectorContributionsSource: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
    fontStyle: 'italic',
  },
  sectorContributionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  sectorContributionCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  sectorContributionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  sectorContributionIcon: {
    fontSize: '1.5rem',
  },
  sectorContributionName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: COLORS.text,
  },
  sectorContributionMetrics: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  sectorContributionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  sectorContributionLabel: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },
  sectorContributionValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.text,
  },
}
