'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

// ============================================================================
// API & DATA FETCHING
// ============================================================================

// Treasury Fiscal Data API - Real federal debt data (no auth required)
const TREASURY_API = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?sort=-record_date&page[size]=1'

// FRED API - Federal Reserve Economic Data (free API key required)
// Get your free key at: https://fred.stlouisfed.org/docs/api/api_key.html
const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY || ''
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations'

// FRED Series IDs
const FRED_SERIES = {
  GDP: 'GDP',                    // Gross Domestic Product (Billions, Quarterly)
  DEBT_TO_GDP: 'GFDEGDQ188S',   // Federal Debt as % of GDP (Quarterly)
  GROSS_INVESTMENT: 'GPDI',      // Gross Private Domestic Investment
  GOV_INVESTMENT: 'W170RC1Q027SBEA', // Government gross investment
}

interface DebtData {
  totalDebt: number           // in trillions
  lastUpdated: string
  isLoading: boolean
  error: string | null
}

interface EconomicData {
  gdp: number                 // in trillions
  debtToGdp: number          // percentage
  grossInvestment: number    // in billions
  govInvestment: number      // in billions
  lastUpdated: string
  isLoading: boolean
  error: string | null
}

// Estimated daily debt increase (based on ~$1T/year deficit)
const DEBT_INCREASE_PER_SECOND = 1_000_000_000_000 / 365 / 24 / 60 / 60  // ~$31,709/second

// ============================================================================
// CONSTANTS & HAMILTONIAN METHODOLOGY
// ============================================================================

const US_POPULATION = 336_000_000  // US population

// Hamiltonian Share Breakdown (% of total federal spending that builds assets)
// Based on OMB Budget Object Class analysis + capital investment data
const HAMILTONIAN_BREAKDOWN = {
  energy: { share: 0.04, label: 'Energy', icon: '⚡', description: 'Power plants, grid, transmission, storage' },
  infrastructure: { share: 0.05, label: 'Infrastructure', icon: '🛣️', description: 'Roads, bridges, ports, airports, rail' },
  manufacturing: { share: 0.03, label: 'Manufacturing', icon: '🏭', description: 'CHIPS Act, IRA credits, reshoring incentives' },
  rnd: { share: 0.03, label: 'R&D', icon: '🔬', description: 'DOE labs, NSF, basic research, science' },
  defenseCapital: { share: 0.03, label: 'Defense Capital', icon: '🛡️', description: 'Ships, aircraft, facilities, equipment' },
}

// Calculate total Hamiltonian Share from breakdown
const HAMILTONIAN_SHARE = Object.values(HAMILTONIAN_BREAKDOWN).reduce((sum, cat) => sum + cat.share, 0)

// Historical Hamiltonian Share data (estimated from federal capital investment as % of spending)
const HAMILTONIAN_HISTORY = [
  { year: 1960, share: 35, event: 'Interstate Highway System + Apollo' },
  { year: 1970, share: 33, event: 'Nuclear fleet construction' },
  { year: 1980, share: 28, event: 'Last major infrastructure push' },
  { year: 1990, share: 24, event: 'NAFTA, offshoring begins' },
  { year: 2000, share: 22, event: 'Dot-com focus, manufacturing decline' },
  { year: 2010, share: 19, event: 'Financial crisis recovery' },
  { year: 2020, share: 17, event: 'COVID, awareness grows' },
  { year: 2024, share: 18, event: 'CHIPS + IRA + Genesis' },
]

// Monthly trend data (for tracking progress toward 30% target)
// In production, this would come from a database/API
const MONTHLY_TREND = [
  { month: 'Jan 24', actual: 17.2, target: 30 },
  { month: 'Feb 24', actual: 17.3, target: 30 },
  { month: 'Mar 24', actual: 17.4, target: 30 },
  { month: 'Apr 24', actual: 17.5, target: 30 },
  { month: 'May 24', actual: 17.6, target: 30 },
  { month: 'Jun 24', actual: 17.7, target: 30 },
  { month: 'Jul 24', actual: 17.8, target: 30 },
  { month: 'Aug 24', actual: 17.9, target: 30 },
  { month: 'Sep 24', actual: 18.0, target: 30 },
  { month: 'Oct 24', actual: 18.0, target: 30 },
  { month: 'Nov 24', actual: 18.0, target: 30 },
  // Projected future (dashed line in chart)
  { month: 'Dec 24', actual: null, projected: 18.1, target: 30 },
  { month: 'Jun 25', actual: null, projected: 19.0, target: 30 },
  { month: 'Dec 25', actual: null, projected: 20.5, target: 30 },
  { month: 'Jun 26', actual: null, projected: 22.0, target: 30 },
  { month: 'Dec 26', actual: null, projected: 24.0, target: 30 },
  { month: 'Jun 27', actual: null, projected: 26.5, target: 30 },
  { month: 'Dec 27', actual: null, projected: 29.0, target: 30 },
  { month: 'Jun 28', actual: null, projected: 30.5, target: 30 },
]

// American Advantages with REAL data
const americanAdvantages = [
  { 
    area: 'Frontier AI', 
    usPosition: '8 of top 10 models',
    evidence: 'GPT-4, Claude, Gemini, Llama — all American. China\'s best 12-18 months behind.',
    metric: '80%',
    metricLabel: 'of frontier AI',
    icon: '🧠',
    status: 'dominant'
  },
  { 
    area: 'Cloud Infrastructure', 
    usPosition: '65% global market',
    evidence: 'AWS (32%) + Azure (23%) + GCP (10%). Alibaba Cloud = 4%.',
    metric: '65%',
    metricLabel: 'market share',
    icon: '☁️',
    status: 'dominant'
  },
  { 
    area: 'Nuclear Technology', 
    usPosition: '90% of SMR IP',
    evidence: 'NuScale (NRC approved), TerraPower, X-energy. China: 0 approved SMR designs.',
    metric: '90%',
    metricLabel: 'of SMR patents',
    icon: '⚛️',
    status: 'dominant'
  },
  { 
    area: 'Commercial Space', 
    usPosition: '70%+ of launches',
    evidence: 'SpaceX: 96 launches in 2024. All of China: ~67. Reusable rockets = US only.',
    metric: '96',
    metricLabel: 'SpaceX launches/yr',
    icon: '🚀',
    status: 'dominant'
  },
  { 
    area: 'Biotech & Pharma', 
    usPosition: '60% of new drugs',
    evidence: '$150B US pharma R&D vs $30B China. mRNA vaccines, CRISPR, CAR-T = American.',
    metric: '$150B',
    metricLabel: 'R&D spending',
    icon: '🧬',
    status: 'dominant'
  },
  { 
    area: 'Venture Capital', 
    usPosition: '50%+ of global VC',
    evidence: '$170B US VC in 2024 vs $45B China. Startup ecosystem unmatched.',
    metric: '$170B',
    metricLabel: 'annual VC',
    icon: '💰',
    status: 'leading'
  },
  { 
    area: 'Research Universities', 
    usPosition: '17 of top 20',
    evidence: 'MIT, Stanford, Harvard, Caltech, Berkeley. China has 2 in top 50.',
    metric: '17',
    metricLabel: 'of top 20',
    icon: '🎓',
    status: 'dominant'
  },
  { 
    area: 'Energy Resources', 
    usPosition: '#1 gas producer',
    evidence: 'Largest natural gas producer globally. Vast uranium, shale, coal reserves.',
    metric: '#1',
    metricLabel: 'nat gas producer',
    icon: '⛽',
    status: 'leading'
  },
]

// Capacity gaps - what we need to build
const capacityGaps = [
  { area: 'Grid/HVDC', current: 25, target: 150, unit: 'GW', investment: 150, jobs: 500, timeline: '2030' },
  { area: 'Nuclear', current: 95, target: 300, unit: 'GW', investment: 200, jobs: 300, timeline: '2035' },
  { area: 'Chip Fabs', current: 12, target: 35, unit: '% global', investment: 150, jobs: 200, timeline: '2030' },
  { area: 'Rare Earths', current: 0, target: 30, unit: '% refining', investment: 25, jobs: 50, timeline: '2030' },
  { area: 'Shipbuilding', current: 5, target: 100, unit: 'ships/yr', investment: 80, jobs: 200, timeline: '2035' },
  { area: 'Water Storage', current: 480, target: 800, unit: 'MAF', investment: 120, jobs: 400, timeline: '2040' },
]

// Policy sequence - the strategy
const policySequence = [
  {
    step: 1,
    name: 'TARIFFS',
    action: 'Protect the Market',
    description: 'Raise import prices so American production can compete. Creates price parity.',
    examples: ['Steel/Aluminum: 25%', 'Solar panels: 50%', 'EVs from China: 100%', 'Chips: Export controls'],
    icon: '🛡️',
    status: 'active',
    revenue: '$80B/year'
  },
  {
    step: 2,
    name: 'INCENTIVES',
    action: 'Subsidize Investment',
    description: 'Tax credits and grants to make building here profitable. De-risk private investment.',
    examples: ['CHIPS Act: $52B', 'IRA clean energy: $370B', 'DOE Genesis: $8B', 'Tax credits: 30%'],
    icon: '💰',
    status: 'active',
    revenue: '$430B committed'
  },
  {
    step: 3,
    name: 'INFRASTRUCTURE',
    action: 'Enable Production',
    description: 'Cheap, reliable power. Water. Grid capacity. Permitting reform. Without this, factories can\'t run.',
    examples: ['Grid hardening', 'HVDC corridors', 'Water systems', 'Permitting: 2yr→6mo'],
    icon: '⚡',
    status: 'building',
    revenue: '$300B needed'
  },
  {
    step: 4,
    name: 'WORKFORCE',
    action: 'Train the Workers',
    description: 'Apprenticeships, technical schools, skills programs. The jobs are coming — workers must be ready.',
    examples: ['500K apprentices/yr', 'Trade school funding', 'Veteran transition', 'STEM pipeline'],
    icon: '👷',
    status: 'planned',
    revenue: '$50B needed'
  },
  {
    step: 5,
    name: 'CAPACITY',
    action: 'Factories Come Home',
    description: 'The result: Domestic manufacturing for critical goods. Supply chain security. Jobs.',
    examples: ['Intel fabs: OH, AZ', 'TSMC: Arizona', 'Battery plants: MI, TN', 'Steel: revival'],
    icon: '🏭',
    status: 'building',
    revenue: '3M+ jobs'
  },
]

// Leapfrog strategy
const leapfrogData = [
  { area: 'Transport', chinaHas: 'High-speed rail', weSkipTo: 'Hyperloop / Vacuum trains', icon: '🚄' },
  { area: 'Nuclear', chinaHas: 'Gen III reactors', weSkipTo: 'SMRs + Fusion', icon: '⚛️' },
  { area: 'Solar', chinaHas: 'Cheap silicon panels', weSkipTo: 'Perovskite + Tandem (40% eff)', icon: '☀️' },
  { area: 'Batteries', chinaHas: 'Lithium-ion', weSkipTo: 'Solid-state + Sodium-ion', icon: '🔋' },
  { area: 'Steel', chinaHas: 'Blast furnaces', weSkipTo: 'Green hydrogen steel', icon: '🏗️' },
  { area: 'Ships', chinaHas: 'Manual shipyards', weSkipTo: 'Modular + Automated', icon: '🚢' },
]

// Your Stake - state data with clear benefits
const stateData: Record<string, {
  projects: number
  jobsCreated: number
  energySavings: number
  investmentComing: number
  keyProjects: string[]
}> = {
  'Texas': { 
    projects: 12, 
    jobsCreated: 185000, 
    energySavings: 1400, 
    investmentComing: 45,
    keyProjects: ['Samsung fab expansion', 'Texas Instruments plants', 'LNG export terminals', 'Grid hardening']
  },
  'Ohio': { 
    projects: 8, 
    jobsCreated: 95000, 
    energySavings: 1100, 
    investmentComing: 32,
    keyProjects: ['Intel mega-fab ($20B)', 'Honda EV plant', 'Steel mill revival', 'Nuclear restart']
  },
  'Arizona': { 
    projects: 7, 
    jobsCreated: 78000, 
    energySavings: 1600, 
    investmentComing: 40,
    keyProjects: ['TSMC fabs (3 plants)', 'Intel expansion', 'Battery manufacturing', 'Solar manufacturing']
  },
  'Michigan': { 
    projects: 9, 
    jobsCreated: 110000, 
    energySavings: 1000, 
    investmentComing: 28,
    keyProjects: ['GM/Ford EV transition', 'Battery gigafactories', 'Semiconductor plants', 'Robotics hub']
  },
  'Pennsylvania': { 
    projects: 6, 
    jobsCreated: 65000, 
    energySavings: 950, 
    investmentComing: 18,
    keyProjects: ['Steel plant modernization', 'Nuclear plant restart', 'Pittsburgh AI corridor', 'Shale infrastructure']
  },
  'Tennessee': { 
    projects: 5, 
    jobsCreated: 55000, 
    energySavings: 900, 
    investmentComing: 15,
    keyProjects: ['Ford BlueOval City', 'Oak Ridge expansion', 'Volkswagen EV', 'SMR development']
  },
  'Georgia': { 
    projects: 6, 
    jobsCreated: 72000, 
    energySavings: 1100, 
    investmentComing: 22,
    keyProjects: ['Hyundai EV plant', 'Rivian expansion', 'SK Battery', 'Savannah port expansion']
  },
  'New York': { 
    projects: 7, 
    jobsCreated: 85000, 
    energySavings: 1200, 
    investmentComing: 25,
    keyProjects: ['Micron fab ($100B)', 'Offshore wind manufacturing', 'Albany nanotechnology', 'Grid modernization']
  },
}

// Historical data
const historicalData = [
  { year: 1960, hamiltonianShare: 35, label: 'Interstates + Apollo' },
  { year: 1970, hamiltonianShare: 33, label: 'Nuclear fleet built' },
  { year: 1980, hamiltonianShare: 28, label: 'Last major builds' },
  { year: 1990, hamiltonianShare: 24, label: 'NAFTA begins' },
  { year: 2000, hamiltonianShare: 22, label: 'Offshoring accelerates' },
  { year: 2010, hamiltonianShare: 19, label: 'Financial crisis' },
  { year: 2020, hamiltonianShare: 17, label: 'COVID + awareness' },
  { year: 2024, hamiltonianShare: 18, label: 'Genesis + CHIPS' },
]

// Colors
const COLORS = {
  hamiltonian: '#00ff88',
  other: '#ff4455',
  accent: '#00aaff',
  gold: '#ffd700',
  warning: '#ffaa00',
  bg: '#05050a',
  bgCard: '#0a0a12',
  bgCardAlt: '#0f0f18',
  border: '#1a1a25',
  text: '#e8e8e8',
  textMuted: '#888899',
  textDim: '#555566',
}

// ============================================================================
// COMPONENTS
// ============================================================================

function TickingDebt({ 
  baseValue, 
  prefix = '', 
  suffix = '', 
  decimals = 4, 
  color = COLORS.text, 
  size = '2rem',
  tickRate = DEBT_INCREASE_PER_SECOND
}: { 
  baseValue: number
  prefix?: string
  suffix?: string
  decimals?: number
  color?: string
  size?: string
  tickRate?: number
}) {
  const [displayValue, setDisplayValue] = useState(baseValue)
  
  useEffect(() => {
    setDisplayValue(baseValue)
  }, [baseValue])
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Add realistic debt increase per tick (100ms = 0.1 seconds)
      setDisplayValue(prev => prev + (tickRate * 0.1 / 1_000_000_000_000))
    }, 100)
    return () => clearInterval(interval)
  }, [tickRate])
  
  return (
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: size, fontWeight: 700, color, textShadow: `0 0 20px ${color}44` }}>
      {prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  const [selectedState, setSelectedState] = useState('Texas')
  const [householdSize, setHouseholdSize] = useState(3)
  const [buildScenario, setBuildScenario] = useState(4)
  
  // Real debt data from Treasury API
  const [debtData, setDebtData] = useState<DebtData>({
    totalDebt: 36.1,  // fallback value in trillions
    lastUpdated: '',
    isLoading: true,
    error: null
  })

  // Economic data from FRED API
  const [econData, setEconData] = useState<EconomicData>({
    gdp: 28.3,              // fallback: ~$28.3T GDP
    debtToGdp: 123,         // fallback: ~123%
    grossInvestment: 4800,  // fallback: ~$4.8T gross private domestic investment (not used for Build Rate)
    govInvestment: 570,     // fallback: ~$570B government capital investment (~2% of GDP)
    lastUpdated: '',
    isLoading: true,
    error: null
  })

  // Fetch real debt data from Treasury
  const fetchDebtData = useCallback(async () => {
    try {
      const response = await fetch(TREASURY_API)
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        const latestRecord = data.data[0]
        const totalDebtInTrillions = parseFloat(latestRecord.tot_pub_debt_out_amt) / 1_000_000_000_000
        
        setDebtData({
          totalDebt: totalDebtInTrillions,
          lastUpdated: latestRecord.record_date,
          isLoading: false,
          error: null
        })
      }
    } catch (err) {
      console.error('Failed to fetch debt data:', err)
      setDebtData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch live data. Using estimate.'
      }))
    }
  }, [])

  // Fetch economic data from FRED API
  const fetchFredData = useCallback(async (seriesId: string): Promise<number | null> => {
    if (!FRED_API_KEY) return null
    
    try {
      const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.observations && data.observations.length > 0) {
        return parseFloat(data.observations[0].value)
      }
    } catch (err) {
      console.error(`Failed to fetch FRED series ${seriesId}:`, err)
    }
    return null
  }, [])

  const fetchEconomicData = useCallback(async () => {
    if (!FRED_API_KEY) {
      setEconData(prev => ({
        ...prev,
        isLoading: false,
        error: 'FRED API key not configured. Using estimates.'
      }))
      return
    }

    try {
      const [gdp, debtToGdp, grossInvestment, govInvestment] = await Promise.all([
        fetchFredData(FRED_SERIES.GDP),
        fetchFredData(FRED_SERIES.DEBT_TO_GDP),
        fetchFredData(FRED_SERIES.GROSS_INVESTMENT),
        fetchFredData(FRED_SERIES.GOV_INVESTMENT),
      ])

      setEconData({
        gdp: gdp ? gdp / 1000 : 28.3,  // Convert billions to trillions
        debtToGdp: debtToGdp || 123,
        grossInvestment: grossInvestment || 4800,
        govInvestment: govInvestment || 570,  // ~$570B = ~2% of GDP
        lastUpdated: new Date().toISOString().split('T')[0],
        isLoading: false,
        error: null
      })
    } catch (err) {
      console.error('Failed to fetch economic data:', err)
      setEconData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch FRED data. Using estimates.'
      }))
    }
  }, [fetchFredData])

  useEffect(() => {
    fetchDebtData()
    fetchEconomicData()
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDebtData()
      fetchEconomicData()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDebtData, fetchEconomicData])

  // Calculated values based on real debt
  const totalDebt = debtData.totalDebt
  const hamiltonianDebt = totalDebt * HAMILTONIAN_SHARE
  const otherDebt = totalDebt * (1 - HAMILTONIAN_SHARE)
  const debtPerCitizen = (totalDebt * 1_000_000_000_000) / US_POPULATION
  const hamiltonianPerCitizen = debtPerCitizen * HAMILTONIAN_SHARE
  
  // Calculate build rate (government investment as % of GDP)
  // Only government investment, NOT gross private domestic investment
  const buildRate = econData.gdp > 0 
    ? (econData.govInvestment / (econData.gdp * 1000)) * 100 
    : 2.0
  
  // Cap at realistic range (currently ~2% of GDP goes to public infrastructure)
  const displayBuildRate = Math.min(buildRate, 25)
  
  // Calculate actual debt-to-GDP
  const actualDebtToGdp = econData.debtToGdp || (totalDebt / econData.gdp * 100)
  
  const stateInfo = stateData[selectedState]
  const multiplier = buildScenario >= 4 ? 2.2 : buildScenario >= 3 ? 1.8 : 1.4

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        
        {/* ================================================================ */}
        {/* HERO - The Debt Problem */}
        {/* ================================================================ */}
        <header style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.trustBadge}>IN GOD WE TRUST</div>
            <h1 style={styles.heroTitle}>
              <span style={{ color: COLORS.hamiltonian }}>HAMILTONIAN</span>
              <br />BUILD CLOCK
            </h1>
            <p style={styles.heroTagline}>The American System Dashboard</p>
            <p style={styles.heroSubtitle}>
              Not just how much we owe —<br />
              <strong style={{ color: COLORS.hamiltonian }}>how much of it is building America</strong>
            </p>
          </div>
          
          <div style={styles.heroRight}>
            <div style={styles.debtBox}>
              <div style={styles.debtLabel}>
                TOTAL FEDERAL DEBT
                {debtData.isLoading && <span style={styles.liveIndicator}> ⟳</span>}
                {!debtData.isLoading && !debtData.error && <span style={styles.liveIndicatorLive}> ● LIVE</span>}
              </div>
              <TickingDebt baseValue={totalDebt} prefix="$" suffix=" TRILLION" decimals={4} size="2.2rem" />
              {debtData.lastUpdated && (
                <div style={styles.dataSource}>
                  Source: Treasury Dept • Updated: {debtData.lastUpdated}
                </div>
              )}
            </div>
            
            <div style={styles.debtSplit}>
              <div style={{ ...styles.debtSplitBox, borderColor: COLORS.hamiltonian }}>
                <div style={styles.splitLabel}>BUILDING AMERICA</div>
                <TickingDebt baseValue={hamiltonianDebt} prefix="$" suffix="T" decimals={2} color={COLORS.hamiltonian} size="1.5rem" tickRate={DEBT_INCREASE_PER_SECOND * HAMILTONIAN_SHARE} />
                <div style={{ ...styles.splitPercent, color: COLORS.hamiltonian }}>{(HAMILTONIAN_SHARE * 100).toFixed(0)}%</div>
              </div>
              
              <div style={{ ...styles.debtSplitBox, borderColor: COLORS.other }}>
                <div style={styles.splitLabel}>ALREADY SPENT</div>
                <TickingDebt baseValue={otherDebt} prefix="$" suffix="T" decimals={2} color={COLORS.other} size="1.5rem" tickRate={DEBT_INCREASE_PER_SECOND * (1 - HAMILTONIAN_SHARE)} />
                <div style={{ ...styles.splitPercent, color: COLORS.other }}>{((1 - HAMILTONIAN_SHARE) * 100).toFixed(0)}%</div>
              </div>
            </div>
            
            <div style={styles.perCitizen}>
              Your share: <strong>${Math.round(debtPerCitizen).toLocaleString()}</strong> — 
              but only <span style={{ color: COLORS.hamiltonian }}>${Math.round(hamiltonianPerCitizen).toLocaleString()}</span> is invested in assets
            </div>
          </div>
        </header>

        {/* ================================================================ */}
        {/* KEY METRICS - Economic Dashboard */}
        {/* ================================================================ */}
        <section style={styles.kpiSection}>
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>
                U.S. GDP
                {econData.isLoading && <span style={styles.liveIndicator}> ⟳</span>}
                {!econData.isLoading && !econData.error && FRED_API_KEY && <span style={styles.liveIndicatorLive}> ● FRED</span>}
              </div>
              <div style={styles.kpiValue}>${econData.gdp.toFixed(1)}T</div>
              <div style={styles.kpiSubtext}>Gross Domestic Product</div>
            </div>
            
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>DEBT-TO-GDP</div>
              <div style={{ ...styles.kpiValue, color: actualDebtToGdp > 100 ? COLORS.warning : COLORS.text }}>
                {actualDebtToGdp.toFixed(1)}%
              </div>
              <div style={styles.kpiSubtext}>
                {actualDebtToGdp > 120 ? '⚠️ High — Fix: grow GDP, not cut' : actualDebtToGdp > 100 ? '⚠️ Elevated' : '✓ Manageable'}
              </div>
            </div>
            
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>BUILD RATE</div>
              <div style={{ ...styles.kpiValue, color: displayBuildRate >= 3 ? COLORS.hamiltonian : COLORS.warning }}>
                {displayBuildRate.toFixed(1)}%
              </div>
              <div style={styles.kpiSubtext}>
                Public investment as % of GDP {displayBuildRate < 3 && '(Target: 3-4%)'}
              </div>
            </div>
            
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>HAMILTONIAN SHARE</div>
              <div style={{ ...styles.kpiValue, color: COLORS.hamiltonian }}>
                {(HAMILTONIAN_SHARE * 100).toFixed(0)}%
              </div>
              <div style={styles.kpiSubtext}>
                Target: 30%+ (was 35% in 1960)
              </div>
            </div>
          </div>
          
          {econData.error && (
            <div style={styles.apiNote}>
              {econData.error} {!FRED_API_KEY && (
                <span>Get a free key at <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent }}>fred.stlouisfed.org</a></span>
              )}
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* THE HAMILTONIAN GAUGE - Hero Metric */}
        {/* ================================================================ */}
        <section style={styles.hamiltonianSection}>
          <div style={styles.hamiltonianHero}>
            <div style={styles.gaugeContainer}>
              <div style={styles.gaugeLabel}>THE HAMILTONIAN SHARE</div>
              <div style={styles.gaugeWrapper}>
                {/* Gauge scale: 0-50% (not 0-100%) because 30%+ is the ambitious target */}
                <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: '300px' }}>
                  {/* Background arc (full semi-circle = 50% on our scale) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={COLORS.border}
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Filled arc - 18% on 0-50% scale = 36% of arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={COLORS.hamiltonian}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${251.3 * (HAMILTONIAN_SHARE / 0.50)} 251.3`}
                    style={{ filter: `drop-shadow(0 0 10px ${COLORS.hamiltonian}88)` }}
                  />
                  {/* Target marker at 30% (which is 60% of the 0-50% arc) */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={COLORS.gold}
                    strokeWidth="20"
                    strokeLinecap="butt"
                    strokeDasharray="4 247.3"
                    strokeDashoffset={-251.3 * (0.30 / 0.50) + 2}
                  />
                  {/* Center text */}
                  <text x="100" y="75" textAnchor="middle" fill={COLORS.hamiltonian} fontSize="42" fontWeight="700" fontFamily="'JetBrains Mono', monospace" style={{ textShadow: `0 0 20px ${COLORS.hamiltonian}66` }}>
                    {(HAMILTONIAN_SHARE * 100).toFixed(0)}%
                  </text>
                  <text x="100" y="95" textAnchor="middle" fill={COLORS.textMuted} fontSize="11">
                    Target: 30%+
                  </text>
                  {/* Scale labels (0-50% scale) */}
                  <text x="15" y="115" textAnchor="start" fill={COLORS.textDim} fontSize="9">0%</text>
                  <text x="100" y="115" textAnchor="middle" fill={COLORS.textDim} fontSize="9">25%</text>
                  <text x="185" y="115" textAnchor="end" fill={COLORS.textDim} fontSize="9">50%</text>
                </svg>
              </div>
              <div style={styles.gaugeTagline}>
                Only <strong style={{ color: COLORS.hamiltonian }}>{(HAMILTONIAN_SHARE * 100).toFixed(0)}¢</strong> of every dollar borrowed is building something.
                <br />The rest is already spent.
              </div>
            </div>
            
            <div style={styles.breakdownContainer}>
              <div style={styles.breakdownTitle}>Where Hamiltonian Spending Goes</div>
              <div style={styles.breakdownGrid}>
                {Object.entries(HAMILTONIAN_BREAKDOWN).map(([key, cat]) => (
                  <div key={key} style={styles.breakdownItem}>
                    <div style={styles.breakdownIcon}>{cat.icon}</div>
                    <div style={styles.breakdownInfo}>
                      <div style={styles.breakdownLabel}>{cat.label}</div>
                      <div style={styles.breakdownBar}>
                        <div style={{ 
                          ...styles.breakdownBarFill, 
                          width: `${(cat.share / HAMILTONIAN_SHARE) * 100}%` 
                        }} />
                      </div>
                      <div style={styles.breakdownValue}>{(cat.share * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={styles.historySection}>
            <div style={styles.historyTitle}>The Decline: 1960 → Today</div>
            <div style={styles.historyTimeline}>
              {HAMILTONIAN_HISTORY.map((point, i) => (
                <div key={point.year} style={styles.historyPoint}>
                  <div style={styles.historyYear}>{point.year}</div>
                  <div style={{ 
                    ...styles.historyBar,
                    height: `${point.share * 2}px`,
                    backgroundColor: point.year === 2024 ? COLORS.hamiltonian : 
                      point.share >= 30 ? COLORS.hamiltonian + '88' : 
                      point.share >= 20 ? COLORS.warning + '88' : COLORS.other + '88'
                  }} />
                  <div style={styles.historyShare}>{point.share}%</div>
                  <div style={styles.historyEvent}>{point.event}</div>
                </div>
              ))}
            </div>
            <div style={styles.historyNote}>
              In 1960, 35% of federal borrowing built highways, power plants, and Apollo. Today it's 18%.
              <br />We borrowed 100x more but built proportionally less.
            </div>
          </div>
          
          {/* Monthly Progress Tracker */}
          <div style={styles.trendSection}>
            <div style={styles.trendTitle}>PROGRESS TRACKER — Path to 30%</div>
            <div style={styles.trendChart}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MONTHLY_TREND} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.hamiltonian} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.hamiltonian} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="month" tick={{ fill: COLORS.textDim, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} />
                  <YAxis domain={[0, 35]} tick={{ fill: COLORS.textDim, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
                    labelStyle={{ color: COLORS.text }}
                  />
                  {/* Target line at 30% */}
                  <Area type="monotone" dataKey="target" stroke={COLORS.gold} strokeWidth={2} strokeDasharray="5 5" fill="none" name="Target" />
                  {/* Actual data */}
                  <Area type="monotone" dataKey="actual" stroke={COLORS.hamiltonian} strokeWidth={2} fill="url(#colorActual)" name="Actual" />
                  {/* Projected data (dashed) */}
                  <Area type="monotone" dataKey="projected" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="5 5" fill="url(#colorProjected)" name="Projected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.trendLegend}>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: COLORS.hamiltonian }} /> Actual</span>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: COLORS.accent, border: '1px dashed' }} /> Projected</span>
              <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: COLORS.gold }} /> Target (30%)</span>
            </div>
            <div style={styles.trendNote}>
              At current pace: <strong style={{ color: COLORS.hamiltonian }}>+0.8%/year</strong> → Target reached by <strong>2032</strong><br />
              With Genesis + CHIPS momentum: <strong style={{ color: COLORS.accent }}>+3%/year</strong> → Target reached by <strong>2028</strong>
            </div>
          </div>
          
          <div style={styles.methodologyNote}>
            <strong>Methodology:</strong> Hamiltonian Share = Federal spending on capital assets (infrastructure, energy, manufacturing, R&D, defense capital) 
            as a percentage of total federal outlays. Based on OMB Budget Object Class data and BEA fixed investment series.
            <br /><em>A "national debt, if not excessive, will be to us a national blessing" — Hamilton, 1781</em>
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE STAKES - Why It Matters */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.warning }}>THE STAKES</span> — Why This Matters
          </h2>
          
          <div style={styles.stakesGrid}>
            <div style={styles.stakeCard}>
              <div style={styles.stakeIcon}>🏥</div>
              <h3>Benefits at Risk</h3>
              <p>Social Security and Medicare depend on GDP growth. Without productive investment, we can't fund benefits — we just borrow more.</p>
              <div style={styles.stakeEquation}>
                No building → No growth → Benefits cut or debt spiral
              </div>
            </div>
            <div style={styles.stakeCard}>
              <div style={styles.stakeIcon}>🔗</div>
              <h3>Supply Chain Vulnerability</h3>
              <p>90% of advanced chips from Taiwan. 90% of rare earths from China. If trade stops, can we feed ourselves? Power ourselves? Arm ourselves?</p>
              <div style={styles.stakeEquation}>
                Dependency = Vulnerability
              </div>
            </div>
            <div style={styles.stakeCard}>
              <div style={styles.stakeIcon}>📉</div>
              <h3>The Decline</h3>
              <p>1960: 35% Hamiltonian. 2024: 18%. Debt grew 100x while building share fell. We borrowed to consume, not invest.</p>
              <div style={styles.stakeEquation}>
                We forgot how to build
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHERE WE LEAD - American Advantages with REAL DATA */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.hamiltonian }}>WHERE WE LEAD</span> — American Advantages
          </h2>
          <p style={styles.sectionSubtitle}>
            We lead in <em>innovation and brains</em>. We're behind in <em>production</em>. The strategy: convert innovation into capacity.
          </p>
          
          <div style={styles.advantagesGrid}>
            {americanAdvantages.map((adv, i) => (
              <div key={i} style={styles.advantageCard}>
                <div style={styles.advHeader}>
                  <span style={styles.advIcon}>{adv.icon}</span>
                  <span style={styles.advArea}>{adv.area}</span>
                  <span style={styles.dominantBadge}>{adv.status.toUpperCase()}</span>
                </div>
                <div style={styles.advMetric}>
                  <span style={styles.advMetricValue}>{adv.metric}</span>
                  <span style={styles.advMetricLabel}>{adv.metricLabel}</span>
                </div>
                <p style={styles.advEvidence}>{adv.evidence}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* THE STRATEGY - Policy Sequence */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.accent }}>THE STRATEGY</span> — How We Win
          </h2>
          <p style={styles.sectionSubtitle}>
            A clear policy sequence: each step enables the next
          </p>
          
          <div style={styles.strategyFlow}>
            {policySequence.map((step, i) => (
              <div key={i} style={styles.strategyStep}>
                <div style={styles.stepNumber}>{step.step}</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepHeader}>
                    <span style={styles.stepIcon}>{step.icon}</span>
                    <span style={styles.stepName}>{step.name}</span>
                    <span style={{
                      ...styles.stepStatus,
                      backgroundColor: step.status === 'active' ? '#00ff8822' : step.status === 'building' ? '#00aaff22' : '#ffaa0022',
                      color: step.status === 'active' ? COLORS.hamiltonian : step.status === 'building' ? COLORS.accent : COLORS.warning,
                    }}>{step.status}</span>
                  </div>
                  <div style={styles.stepAction}>{step.action}</div>
                  <p style={styles.stepDesc}>{step.description}</p>
                  <div style={styles.stepExamples}>
                    {step.examples.map((ex, j) => (
                      <span key={j} style={styles.exampleTag}>{ex}</span>
                    ))}
                  </div>
                  <div style={styles.stepRevenue}>{step.revenue}</div>
                </div>
                {i < policySequence.length - 1 && <div style={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* CAPACITY GAPS - What We Need to Build */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.warning }}>CAPACITY GAPS</span> — What We Need to Build
          </h2>
          <p style={styles.sectionSubtitle}>
            Current capacity vs target. Investment needed. Jobs created.
          </p>
          
          <div style={styles.gapsGrid}>
            {capacityGaps.map((gap, i) => {
              const pct = (gap.current / gap.target) * 100
              return (
                <div key={i} style={styles.gapCard}>
                  <div style={styles.gapHeader}>
                    <span style={styles.gapArea}>{gap.area}</span>
                    <span style={styles.gapTimeline}>by {gap.timeline}</span>
                  </div>
                  <div style={styles.gapBar}>
                    <div style={{ ...styles.gapFill, width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <div style={styles.gapNumbers}>
                    <span>{gap.current} {gap.unit}</span>
                    <span style={{ color: COLORS.hamiltonian }}>{gap.target} {gap.unit}</span>
                  </div>
                  <div style={styles.gapFooter}>
                    <span style={styles.gapInvestment}>${gap.investment}B needed</span>
                    <span style={styles.gapJobs}>{gap.jobs}K jobs</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ================================================================ */}
        {/* LEAPFROG - Skip to Next-Gen */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.accent }}>LEAPFROG</span> — Don't Catch Up, Skip Ahead
          </h2>
          
          <div style={styles.leapfrogGrid}>
            {leapfrogData.map((item, i) => (
              <div key={i} style={styles.leapfrogCard}>
                <div style={styles.leapfrogIcon}>{item.icon}</div>
                <div style={styles.leapfrogArea}>{item.area}</div>
                <div style={styles.leapfrogRow}>
                  <span style={{ color: COLORS.textMuted }}>🇨🇳 {item.chinaHas}</span>
                </div>
                <div style={styles.leapfrogArrow}>↓</div>
                <div style={styles.leapfrogRow}>
                  <span style={{ color: COLORS.hamiltonian }}>🇺🇸 {item.weSkipTo}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* YOUR STAKE - Clear Personal Impact */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.gold }}>YOUR STAKE</span> — What This Means for You
          </h2>
          
          <div style={styles.stakeCalculator}>
            <div style={styles.stakeInputs}>
              <div style={styles.inputGroup}>
                <label>Your State</label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={styles.select}
                >
                  {Object.keys(stateData).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.inputGroup}>
                <label>Household Size</label>
                <select 
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(parseInt(e.target.value))}
                  style={styles.select}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label>Build Rate Scenario</label>
                <div style={styles.scenarioButtons}>
                  {[
                    { rate: 2, label: '2%', sublabel: 'Now' },
                    { rate: 3, label: '3%', sublabel: 'Genesis' },
                    { rate: 4, label: '4%', sublabel: 'Ambitious' },
                    { rate: 5, label: '5%', sublabel: 'Full System' },
                  ].map(({ rate, label, sublabel }) => (
                    <button
                      key={rate}
                      onClick={() => setBuildScenario(rate)}
                      style={{
                        ...styles.scenarioBtn,
                        backgroundColor: buildScenario === rate 
                          ? (rate === 2 ? COLORS.other : COLORS.hamiltonian) 
                          : 'transparent',
                        color: buildScenario === rate ? COLORS.bg : COLORS.text,
                        borderColor: rate === 2 ? COLORS.other : COLORS.border,
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{label}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{sublabel}</span>
                    </button>
                  ))}
                </div>
                <div style={styles.scenarioExplainer}>
                  {buildScenario === 2 && <span style={{ color: COLORS.other }}>Status quo — decline continues</span>}
                  {buildScenario === 3 && <span style={{ color: COLORS.warning }}>Genesis Direction — <strong>sustainable</strong>, stops the bleeding</span>}
                  {buildScenario === 4 && <span style={{ color: COLORS.accent }}>Beyond Genesis — Infrastructure Bank + Permitting Reform</span>}
                  {buildScenario === 5 && <span style={{ color: COLORS.hamiltonian }}>Full American System — <strong>winning</strong>, competitive with China</span>}
                </div>
              </div>
            </div>
            
            <div style={styles.stakeResults}>
              <h3 style={{ 
                ...styles.stakeResultsTitle, 
                color: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
              }}>
                {buildScenario === 2 
                  ? "Status Quo (2%) — What You're Missing:" 
                  : `If We Build at ${buildScenario}% of GDP:`}
              </h3>
              
              <div style={styles.benefitsGrid}>
                <div style={styles.benefitCard}>
                  <div style={styles.benefitIcon}>{buildScenario === 2 ? '📉' : '💵'}</div>
                  <div style={styles.benefitLabel}>{buildScenario === 2 ? 'Potential Savings Lost' : 'Your Energy Savings'}</div>
                  <div style={{ 
                    ...styles.benefitValue, 
                    color: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
                  }}>
                    {buildScenario === 2 
                      ? `−$${Math.round(stateInfo.energySavings * householdSize / 2).toLocaleString()}/yr`
                      : `$${Math.round(stateInfo.energySavings * (buildScenario - 2) / 3 * householdSize / 2).toLocaleString()}/year`}
                  </div>
                  <div style={styles.benefitNote}>{buildScenario === 2 ? 'vs 5% build rate' : 'Cheaper electricity from new capacity'}</div>
                </div>
                
                <div style={styles.benefitCard}>
                  <div style={styles.benefitIcon}>{buildScenario === 2 ? '🚫' : '👷'}</div>
                  <div style={styles.benefitLabel}>{buildScenario === 2 ? 'Jobs Not Created' : `Jobs Coming to ${selectedState}`}</div>
                  <div style={{ 
                    ...styles.benefitValue, 
                    color: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
                  }}>
                    {buildScenario === 2 
                      ? `−${Math.round(stateInfo.jobsCreated / 1000).toLocaleString()}K`
                      : `+${Math.round(stateInfo.jobsCreated * (buildScenario - 2) / 3 / 1000).toLocaleString()}K`}
                  </div>
                  <div style={styles.benefitNote}>{buildScenario === 2 ? 'That could exist' : 'Technical, union-scale positions'}</div>
                </div>
                
                <div style={styles.benefitCard}>
                  <div style={styles.benefitIcon}>{buildScenario === 2 ? '💸' : '💰'}</div>
                  <div style={styles.benefitLabel}>{buildScenario === 2 ? 'Investment Going Elsewhere' : 'Investment Coming'}</div>
                  <div style={{ 
                    ...styles.benefitValue, 
                    color: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
                  }}>
                    {buildScenario === 2 
                      ? `−$${Math.round(stateInfo.investmentComing * 0.75).toLocaleString()}B`
                      : `$${Math.round(stateInfo.investmentComing * ((buildScenario - 2) / 3 + 0.25)).toLocaleString()}B`}
                  </div>
                  <div style={styles.benefitNote}>{buildScenario === 2 ? 'To other countries' : 'Federal + private capital'}</div>
                </div>
                
                <div style={styles.benefitCard}>
                  <div style={styles.benefitIcon}>{buildScenario === 2 ? '⚠️' : '📈'}</div>
                  <div style={styles.benefitLabel}>{buildScenario === 2 ? 'Growth Foregone' : 'GDP Multiplier'}</div>
                  <div style={{ 
                    ...styles.benefitValue, 
                    color: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
                  }}>
                    {buildScenario === 2 ? '1.0x' : `${multiplier}x`}
                  </div>
                  <div style={styles.benefitNote}>{buildScenario === 2 ? 'Treading water' : `Every $1 invested → $${multiplier} GDP`}</div>
                </div>
              </div>
              
              <div style={styles.stateProjects}>
                <h4>Key Projects in {selectedState}:</h4>
                <div style={styles.projectsList}>
                  {stateInfo.keyProjects.map((project, i) => (
                    <span key={i} style={styles.projectTag}>{project}</span>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                ...styles.bottomLine, 
                borderColor: buildScenario === 2 ? COLORS.other : COLORS.hamiltonian 
              }}>
                {buildScenario === 2 ? (
                  <>
                    <strong>The Cost of Inaction:</strong> Every year at 2%, your household forgoes approximately{' '}
                    <span style={{ color: COLORS.other }}>
                      ${Math.round(stateInfo.energySavings * householdSize / 2 + 3 * 2000 * householdSize).toLocaleString()}/year
                    </span>{' '}
                    in potential savings and economic opportunity that a 5% build rate would create.
                  </>
                ) : (
                  <>
                    <strong>The Bottom Line:</strong> At {buildScenario}% build rate, your household gains approximately{' '}
                    <span style={{ color: COLORS.hamiltonian }}>
                      ${Math.round((stateInfo.energySavings * (buildScenario - 2) / 3 * householdSize / 2) + 
                        ((buildScenario - 2) * 2000 * householdSize)).toLocaleString()}/year
                    </span>{' '}
                    in savings and economic opportunity. Plus: job security, stable grid, funded benefits.
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHY WE BUILD - First Principles (Philosophy as conclusion) */}
        {/* ================================================================ */}
        <section style={styles.philosophySection}>
          <h2 style={styles.philosophyTitle}>WHY WE BUILD</h2>
          <div style={styles.philosophyGrid}>
            <div style={styles.philosophyCard}>
              <div style={styles.philIcon}>🎯</div>
              <p><strong>Create, Don't Copy</strong><br />
              America invents. Others mass-produce. We create the next breakthrough — that's who we are.</p>
            </div>
            <div style={styles.philosophyCard}>
              <div style={styles.philIcon}>🏛️</div>
              <p><strong>First Principles</strong><br />
              Hamilton knew: productive debt builds nations. We forgot. Time to remember.</p>
            </div>
            <div style={styles.philosophyCard}>
              <div style={styles.philIcon}>🦅</div>
              <p><strong>America First</strong><br />
              Build for us, not against anyone. Self-sufficiency is the goal. Independence is victory.</p>
            </div>
            <div style={styles.philosophyCard}>
              <div style={styles.philIcon}>⚒️</div>
              <p><strong>Work is Dignity</strong><br />
              AI is our tool, not our replacement. We are makers, not just consumers. Built to build.</p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WIN CONDITION */}
        {/* ================================================================ */}
        <section style={styles.winSection}>
          <h2 style={styles.winTitle}>THE WIN CONDITION</h2>
          <p style={styles.winSubtitle}>Self-sufficiency in critical capabilities. If trade stops tomorrow, can we survive and thrive?</p>
          
          <div style={styles.winGrid}>
            <div style={styles.winItem}>⚡ Energy independent</div>
            <div style={styles.winItem}>🔲 Chip sovereign</div>
            <div style={styles.winItem}>🏭 Manufacturing capable</div>
            <div style={styles.winItem}>💧 Water secure</div>
            <div style={styles.winItem}>👷 Workforce ready</div>
            <div style={styles.winItem}>🚀 Innovation leading</div>
          </div>
          
          <div style={styles.winQuote}>
            "A national debt, if it is not excessive, will be to us a national blessing."
            <span style={styles.quoteAuthor}>— Alexander Hamilton, 1781</span>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FOOTER */}
        {/* ================================================================ */}
        <footer style={styles.footer}>
          <p>The question isn't "how much do we owe?" — it's "what did we build?"</p>
          <p style={styles.footerMeta}>American System Dashboard v1.0 • Aligned with DOE Genesis Mission</p>
        </footer>
      </div>
    </main>
  )
}

// ============================================================================
// STYLES
// ============================================================================

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  
  // Hero
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: '3rem',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  heroLeft: {},
  heroRight: {},
  trustBadge: {
    display: 'inline-block',
    fontSize: '0.65rem',
    padding: '4px 10px',
    borderRadius: '4px',
    backgroundColor: '#ffd70022',
    color: '#ffd700',
    fontWeight: 700,
    letterSpacing: '2px',
    marginBottom: '0.75rem',
    border: '1px solid #ffd70044',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '0.5rem',
  },
  heroTagline: {
    fontSize: '0.85rem',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '0.75rem',
  },
  heroSubtitle: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  debtBox: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  debtLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  liveIndicator: {
    color: COLORS.textMuted,
    animation: 'spin 1s linear infinite',
  },
  liveIndicatorLive: {
    color: COLORS.hamiltonian,
    fontSize: '0.6rem',
    fontWeight: 600,
  },
  dataSource: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    marginTop: '0.5rem',
    textTransform: 'none',
    letterSpacing: '0',
  },
  kpiSection: {
    marginBottom: '2rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  kpiLabel: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '0.25rem',
  },
  kpiSubtext: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
  },
  apiNote: {
    marginTop: '0.75rem',
    fontSize: '0.65rem',
    color: COLORS.textDim,
    textAlign: 'center' as const,
  },
  
  // Hamiltonian Gauge Section
  hamiltonianSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: '16px',
    border: `2px solid ${COLORS.hamiltonian}44`,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: `0 0 40px ${COLORS.hamiltonian}11`,
  },
  hamiltonianHero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
  },
  gaugeContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '2px',
    color: COLORS.hamiltonian,
    marginBottom: '1rem',
  },
  gaugeWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  gaugeTagline: {
    textAlign: 'center' as const,
    fontSize: '1rem',
    color: COLORS.text,
    marginTop: '1rem',
    lineHeight: 1.6,
  },
  breakdownContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  breakdownTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  breakdownGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  breakdownIcon: {
    fontSize: '1.25rem',
    width: '2rem',
    textAlign: 'center' as const,
  },
  breakdownInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  breakdownLabel: {
    fontSize: '0.75rem',
    color: COLORS.text,
    width: '100px',
  },
  breakdownBar: {
    flex: 1,
    height: '8px',
    backgroundColor: COLORS.border,
    borderRadius: '4px',
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: COLORS.hamiltonian,
    borderRadius: '4px',
  },
  breakdownValue: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.hamiltonian,
    width: '35px',
    textAlign: 'right' as const,
  },
  historySection: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  historyTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    textAlign: 'center' as const,
  },
  historyTimeline: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '120px',
    gap: '0.5rem',
  },
  historyPoint: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
  },
  historyYear: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    marginBottom: '0.25rem',
  },
  historyBar: {
    width: '100%',
    maxWidth: '40px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  historyShare: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: COLORS.text,
    marginTop: '0.25rem',
  },
  historyEvent: {
    fontSize: '0.5rem',
    color: COLORS.textDim,
    textAlign: 'center' as const,
    marginTop: '0.25rem',
    lineHeight: 1.2,
    maxWidth: '60px',
  },
  historyNote: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textAlign: 'center' as const,
    marginTop: '1rem',
    lineHeight: 1.5,
  },
  methodologyNote: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    lineHeight: 1.5,
    borderLeft: `3px solid ${COLORS.hamiltonian}44`,
  },
  
  // Trend Chart Section
  trendSection: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  trendTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    textAlign: 'center' as const,
  },
  trendChart: {
    width: '100%',
    marginBottom: '0.75rem',
  },
  trendLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '0.75rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  trendNote: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textAlign: 'center' as const,
    lineHeight: 1.6,
  },
  
  debtSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  debtSplitBox: {
    backgroundColor: COLORS.bgCard,
    border: '2px solid',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  },
  splitLabel: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  splitPercent: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginTop: '0.25rem',
  },
  perCitizen: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: '0.75rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '6px',
  },
  
  // Philosophy section
  philosophySection: {
    marginBottom: '2.5rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
  },
  philosophyTitle: {
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '1.25rem',
    letterSpacing: '1px',
  },
  philosophyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  philosophyCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
  philIcon: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  
  // Sections
  section: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '1.25rem',
  },
  
  // Stakes
  stakesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  stakeCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
  },
  stakeIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.75rem',
  },
  stakeEquation: {
    marginTop: '0.75rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: COLORS.warning,
    textAlign: 'center',
  },
  
  // Advantages
  advantagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  advantageCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  advHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  advIcon: {
    fontSize: '1.2rem',
  },
  advArea: {
    fontWeight: 600,
    fontSize: '0.85rem',
    flex: 1,
  },
  dominantBadge: {
    fontSize: '0.55rem',
    padding: '2px 6px',
    borderRadius: '3px',
    backgroundColor: '#00ff8822',
    color: COLORS.hamiltonian,
    fontWeight: 700,
  },
  advMetric: {
    marginBottom: '0.5rem',
  },
  advMetricValue: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: COLORS.hamiltonian,
  },
  advMetricLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    marginLeft: '0.25rem',
  },
  advEvidence: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  
  // Strategy flow
  strategyFlow: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '1rem',
  },
  strategyStep: {
    flex: '1',
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    marginBottom: '0.75rem',
  },
  stepContent: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    flex: 1,
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  stepIcon: {
    fontSize: '1rem',
  },
  stepName: {
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  stepStatus: {
    fontSize: '0.55rem',
    padding: '2px 6px',
    borderRadius: '3px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  stepAction: {
    fontSize: '0.9rem',
    color: COLORS.hamiltonian,
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  stepDesc: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
    marginBottom: '0.75rem',
  },
  stepExamples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginBottom: '0.5rem',
  },
  exampleTag: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '3px',
    color: COLORS.textMuted,
  },
  stepRevenue: {
    fontSize: '0.75rem',
    color: COLORS.gold,
    fontWeight: 600,
  },
  stepArrow: {
    position: 'absolute',
    right: '-12px',
    top: '50%',
    fontSize: '1.2rem',
    color: COLORS.accent,
  },
  
  // Gaps
  gapsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
  },
  gapCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  gapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  gapArea: {
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  gapTimeline: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
  },
  gapBar: {
    height: '8px',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  gapFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: '4px',
  },
  gapNumbers: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '0.5rem',
  },
  gapFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
  },
  gapInvestment: {
    color: COLORS.warning,
  },
  gapJobs: {
    color: COLORS.hamiltonian,
  },
  
  // Leapfrog
  leapfrogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
  },
  leapfrogCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  },
  leapfrogIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  leapfrogArea: {
    fontWeight: 700,
    fontSize: '0.85rem',
    marginBottom: '0.75rem',
  },
  leapfrogRow: {
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
  },
  leapfrogArrow: {
    color: COLORS.hamiltonian,
    fontSize: '1rem',
    margin: '0.25rem 0',
  },
  
  // Your Stake Calculator
  stakeCalculator: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
  },
  stakeInputs: {
    borderRight: `1px solid ${COLORS.border}`,
    paddingRight: '2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.text,
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  scenarioButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  scenarioBtn: {
    flex: 1,
    padding: '0.5rem 0.25rem',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    minWidth: '70px',
  },
  scenarioLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: COLORS.textDim,
    marginTop: '0.5rem',
    paddingLeft: '0.5rem',
  },
  scenarioExplainer: {
    fontSize: '0.7rem',
    textAlign: 'center' as const,
    marginTop: '0.75rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    minHeight: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stakeResults: {},
  stakeResultsTitle: {
    fontSize: '1.1rem',
    marginBottom: '1.25rem',
    color: COLORS.hamiltonian,
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  benefitCard: {
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  },
  benefitIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  benefitLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.25rem',
  },
  benefitValue: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: COLORS.hamiltonian,
    marginBottom: '0.25rem',
  },
  benefitNote: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
  },
  stateProjects: {
    marginBottom: '1.25rem',
  },
  projectsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  projectTag: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '4px',
    color: COLORS.text,
  },
  bottomLine: {
    padding: '1rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '8px',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    border: `1px solid ${COLORS.hamiltonian}33`,
  },
  
  // Win section
  winSection: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  winTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: COLORS.hamiltonian,
    letterSpacing: '2px',
  },
  winSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '1.5rem',
  },
  winGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  winItem: {
    padding: '0.75rem 1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
  winQuote: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: COLORS.text,
    marginTop: '1.5rem',
  },
  quoteAuthor: {
    display: 'block',
    fontSize: '0.85rem',
    color: COLORS.hamiltonian,
    fontStyle: 'normal',
    marginTop: '0.5rem',
  },
  
  // Footer
  footer: {
    textAlign: 'center',
    padding: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    fontSize: '0.9rem',
    color: COLORS.textMuted,
  },
  footerMeta: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginTop: '0.5rem',
  },
}
