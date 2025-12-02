'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

// ============================================================================
// SCROLL REVEAL COMPONENT
// ============================================================================

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasAnimated) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true)
              setHasAnimated(true)
            }, delay)
          }
        })
      },
      { threshold: 0.05, rootMargin: '50px 0px -20px 0px' }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, hasAnimated])

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

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
  'California': { 
    projects: 3, 
    jobsCreated: 25000, 
    energySavings: -200, // Negative - energy costs rising
    investmentComing: 8,
    keyProjects: ['Grid upgrades (reactive)', 'Solar manufacturing (small)', 'Water systems (blocked)']
  },
  'Nevada': { 
    projects: 4, 
    jobsCreated: 45000, 
    energySavings: 1100, 
    investmentComing: 12,
    keyProjects: ['Thacker Pass lithium', 'Tesla Gigafactory expansion', 'Data centers', 'Solar expansion']
  },
  'Wyoming': { 
    projects: 3, 
    jobsCreated: 8000, 
    energySavings: 1500, 
    investmentComing: 8,
    keyProjects: ['TerraPower Natrium SMR', 'Wind expansion', 'Rare earth exploration']
  },
  'Alaska': { 
    projects: 4, 
    jobsCreated: 15000, 
    energySavings: 800, 
    investmentComing: 25,
    keyProjects: ['Willow Project', 'Alaska LNG', 'Port expansion', 'Critical minerals']
  },
  'Minnesota': { 
    projects: 2, 
    jobsCreated: 12000, 
    energySavings: 600, 
    investmentComing: 5,
    keyProjects: ['Cleveland-Cliffs rare earth', 'Wind expansion']
  },
  'Illinois': { 
    projects: 1, 
    jobsCreated: 8000, 
    energySavings: 400, 
    investmentComing: 3,
    keyProjects: ['Nuclear preservation (subsidized)']
  },
  'New Jersey': { 
    projects: 2, 
    jobsCreated: 5000, 
    energySavings: -100, 
    investmentComing: 2,
    keyProjects: ['Offshore wind (troubled)', 'Port expansion']
  },
  'Massachusetts': { 
    projects: 1, 
    jobsCreated: 15000, 
    energySavings: 200, 
    investmentComing: 3,
    keyProjects: ['Life sciences R&D']
  },
  'North Dakota': { 
    projects: 3, 
    jobsCreated: 8000, 
    energySavings: 900, 
    investmentComing: 5,
    keyProjects: ['Bakken production', 'Wind expansion', 'Data centers']
  },
  'New Mexico': { 
    projects: 4, 
    jobsCreated: 20000, 
    energySavings: 1000, 
    investmentComing: 10,
    keyProjects: ['Permian oil/gas', 'Los Alamos/Sandia', 'Solar expansion']
  },
  'Florida': { 
    projects: 4, 
    jobsCreated: 35000, 
    energySavings: 700, 
    investmentComing: 8,
    keyProjects: ['SpaceX/Blue Origin expansion', 'Port expansion']
  },
  'Indiana': { 
    projects: 5, 
    jobsCreated: 40000, 
    energySavings: 800, 
    investmentComing: 10,
    keyProjects: ['EV battery plants', 'Steel modernization', 'Logistics expansion']
  },
  'South Carolina': { 
    projects: 4, 
    jobsCreated: 35000, 
    energySavings: 850, 
    investmentComing: 8,
    keyProjects: ['BMW expansion', 'Scout Motors EV', 'Port Charleston expansion']
  },
  'Kentucky': { 
    projects: 4, 
    jobsCreated: 45000, 
    energySavings: 750, 
    investmentComing: 12,
    keyProjects: ['Ford battery plants', 'Toyota EV investment', 'Envision AESC battery']
  },
  'Louisiana': { 
    projects: 5, 
    jobsCreated: 35000, 
    energySavings: 900, 
    investmentComing: 28,
    keyProjects: ['LNG export terminals', 'Petrochemical expansion', 'Port upgrades']
  },
  'Virginia': { 
    projects: 4, 
    jobsCreated: 50000, 
    energySavings: 650, 
    investmentComing: 28,
    keyProjects: ['Data centers (Northern VA)', 'Newport News shipyard', 'Offshore wind']
  },
  'Washington': { 
    projects: 3, 
    jobsCreated: 25000, 
    energySavings: 500, 
    investmentComing: 6,
    keyProjects: ['Boeing production', 'Data centers']
  },
  'Colorado': { 
    projects: 2, 
    jobsCreated: 18000, 
    energySavings: 550, 
    investmentComing: 4,
    keyProjects: ['Aerospace R&D', 'Solar expansion']
  },
  'Wisconsin': { 
    projects: 3, 
    jobsCreated: 15000, 
    energySavings: 600, 
    investmentComing: 5,
    keyProjects: ['Shipyard revival (Marinette)', 'Microsoft data center']
  },
  'Utah': { 
    projects: 3, 
    jobsCreated: 22000, 
    energySavings: 700, 
    investmentComing: 5,
    keyProjects: ['Data centers', 'Tech expansion', 'Mining']
  },
  'West Virginia': { 
    projects: 2, 
    jobsCreated: 8000, 
    energySavings: 500, 
    investmentComing: 3,
    keyProjects: ['Gas development', 'Data centers (proposed)']
  },
  'Missouri': { 
    projects: 1, 
    jobsCreated: 5000, 
    energySavings: 400, 
    investmentComing: 2,
    keyProjects: ['No major projects']
  },
  'Alabama': { 
    projects: 4, 
    jobsCreated: 25000, 
    energySavings: 800, 
    investmentComing: 5,
    keyProjects: ['Hyundai EV expansion', 'Airbus expansion', 'Browns Ferry nuclear']
  },
  'Mississippi': { 
    projects: 2, 
    jobsCreated: 20000, 
    energySavings: 600, 
    investmentComing: 4,
    keyProjects: ['Ingalls Shipbuilding', 'Nissan (declining)']
  },
  'Maine': { 
    projects: 2, 
    jobsCreated: 8000, 
    energySavings: 450, 
    investmentComing: 2,
    keyProjects: ['Bath Iron Works', 'Offshore wind (proposed)']
  },
  'Connecticut': { 
    projects: 3, 
    jobsCreated: 25000, 
    energySavings: 500, 
    investmentComing: 5,
    keyProjects: ['Electric Boat submarines', 'Pratt & Whitney engines']
  },
  'Iowa': { 
    projects: 4, 
    jobsCreated: 20000, 
    energySavings: 900, 
    investmentComing: 5,
    keyProjects: ['Wind expansion', 'Data centers', 'Ethanol/biofuels']
  },
}

// Comprehensive State-Level Hamiltonian Analysis
interface StateHamiltonianAnalysis {
  state: string
  stateGDP: number // billions
  stateDebt: number // billions
  stateCapitalInvestment: number // billions
  hamiltonianShare: number // % of state spending on capital
  buildRate: number // % of GDP
  trend: 'rising' | 'flat' | 'declining' // is it getting better or worse?
  naturalAdvantages: string[]
  currentProjects: { name: string, category: string, status: string, investment: number }[]
  capacityGaps: { category: string, need: string, current: string }[]
  politicalFeasibility: 'high' | 'medium' | 'low'
  nationalRole: string
  energyProfile: string
  workforceReadiness: 'high' | 'medium' | 'low'
  assessment: string // honest assessment
  corruptionEvidence?: string // proven fraud/corruption cases
  pathToVictory?: string[] // how to unblock
}

// ALL 50 STATES - Honest Hamiltonian Analysis
const stateHamiltonianAnalysis: Record<string, StateHamiltonianAnalysis> = {
  // === TIER 1: BUILDING STATES (High Hamiltonian Activity) ===
  'Texas': {
    state: 'Texas',
    stateGDP: 2400,
    stateDebt: 45,
    stateCapitalInvestment: 12,
    hamiltonianShare: 22,
    buildRate: 0.5,
    trend: 'rising',
    naturalAdvantages: ['Oil/gas reserves', 'Wind/solar potential', 'Port access', 'Land availability', 'Business-friendly'],
    currentProjects: [
      { name: 'Samsung fab expansion', category: 'Chip Fabs', status: 'Building', investment: 17 },
      { name: 'LNG export terminals', category: 'Energy', status: 'Active', investment: 25 },
      { name: 'Grid hardening', category: 'Infrastructure', status: 'Planned', investment: 8 },
      { name: 'Nuclear SMRs', category: 'Energy', status: 'Proposed', investment: 12 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: '50 GW', current: '5 GW' },
      { category: 'Grid/HVDC', need: '25 GW', current: '8 GW' },
      { category: 'Water', need: 'Desalination', current: 'Groundwater depleting' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Energy dominance, chip manufacturing, export hub',
    energyProfile: 'Largest producer (oil, gas, wind). Needs nuclear for grid stability.',
    workforceReadiness: 'high',
    assessment: 'LEADING. Aggressive on energy and manufacturing. Grid remains vulnerable.'
  },
  'Ohio': {
    state: 'Ohio',
    stateGDP: 750,
    stateDebt: 18,
    stateCapitalInvestment: 5.2,
    hamiltonianShare: 24,
    buildRate: 0.7,
    trend: 'rising',
    naturalAdvantages: ['Freshwater', 'Central location', 'Existing manufacturing', 'Workforce'],
    currentProjects: [
      { name: 'Intel mega-fab ($20B)', category: 'Chip Fabs', status: 'Building', investment: 20 },
      { name: 'Honda EV plant', category: 'Manufacturing', status: 'Active', investment: 3.5 },
      { name: 'Nuclear restart', category: 'Energy', status: 'Proposed', investment: 2 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: '15 GW', current: '3 GW' },
      { category: 'Grid', need: 'HVDC to East Coast', current: 'Regional' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Chip manufacturing hub, Midwest manufacturing anchor',
    energyProfile: 'Coal legacy, transitioning to nuclear + renewables.',
    workforceReadiness: 'high',
    assessment: 'RESURGENT. Intel fab is transformative. Need to rebuild energy base.'
  },
  'Arizona': {
    state: 'Arizona',
    stateGDP: 450,
    stateDebt: 12,
    stateCapitalInvestment: 4.5,
    hamiltonianShare: 28,
    buildRate: 1.0,
    trend: 'rising',
    naturalAdvantages: ['Solar potential', 'Land', 'Tech talent from CA exodus'],
    currentProjects: [
      { name: 'TSMC fabs (3 plants)', category: 'Chip Fabs', status: 'Building', investment: 40 },
      { name: 'Intel expansion', category: 'Chip Fabs', status: 'Building', investment: 20 },
      { name: 'Battery manufacturing', category: 'Manufacturing', status: 'Planned', investment: 2.5 }
    ],
    capacityGaps: [
      { category: 'Water', need: 'Desalination/recycling', current: 'Colorado River (crisis)' },
      { category: 'Energy', need: 'Nuclear baseload', current: 'Solar + gas' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Chip manufacturing capital of America',
    energyProfile: 'Solar leader. Water crisis is existential threat to growth.',
    workforceReadiness: 'medium',
    assessment: 'BOOMING but fragile. $60B+ in fabs, but water crisis could derail everything.'
  },
  'Tennessee': {
    state: 'Tennessee',
    stateGDP: 450,
    stateDebt: 8,
    stateCapitalInvestment: 3.2,
    hamiltonianShare: 32,
    buildRate: 0.7,
    trend: 'rising',
    naturalAdvantages: ['Freshwater', 'Low cost', 'Business-friendly', 'TVA power'],
    currentProjects: [
      { name: 'Ford BlueOval City', category: 'Manufacturing', status: 'Building', investment: 5.6 },
      { name: 'SMR development (Oak Ridge)', category: 'Energy', status: 'Active', investment: 4 },
      { name: 'Battery plants', category: 'Manufacturing', status: 'Building', investment: 3 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'SMR fleet', current: '3 GW' },
      { category: 'Workforce', need: '50K skilled workers', current: 'Training gap' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'EV manufacturing, nuclear R&D, low-cost production',
    energyProfile: 'Nuclear + hydro via TVA. Best energy position in Southeast.',
    workforceReadiness: 'high',
    assessment: 'MODEL STATE. Low debt, high investment, pro-build politics. Watch this one.'
  },
  'Georgia': {
    state: 'Georgia',
    stateGDP: 700,
    stateDebt: 15,
    stateCapitalInvestment: 4.5,
    hamiltonianShare: 25,
    buildRate: 0.6,
    trend: 'rising',
    naturalAdvantages: ['Savannah port', 'Land', 'Business-friendly', 'Southeast hub'],
    currentProjects: [
      { name: 'Hyundai EV plant (Metaplant)', category: 'Manufacturing', status: 'Building', investment: 7.6 },
      { name: 'Savannah port expansion', category: 'Infrastructure', status: 'Active', investment: 1.8 },
      { name: 'SK/Hyundai Battery', category: 'Manufacturing', status: 'Active', investment: 5 },
      { name: 'Vogtle nuclear (Units 3&4)', category: 'Energy', status: 'Complete', investment: 35 }
    ],
    capacityGaps: [
      { category: 'Grid', need: 'Southeast interconnection', current: 'Regional' },
      { category: 'Water', need: 'Reservoir expansion', current: 'Adequate' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Port logistics, EV manufacturing, nuclear (Vogtle)',
    energyProfile: 'Just completed Vogtle nuclear. Only new nuclear in 30 years.',
    workforceReadiness: 'high',
    assessment: 'STRONG. Vogtle proves nuclear can be built. EV cluster forming.'
  },
  
  // === TIER 2: MIXED POTENTIAL (Could Go Either Way) ===
  'Michigan': {
    state: 'Michigan',
    stateGDP: 600,
    stateDebt: 22,
    stateCapitalInvestment: 4.8,
    hamiltonianShare: 20,
    buildRate: 0.8,
    trend: 'flat',
    naturalAdvantages: ['Freshwater (Great Lakes)', 'Manufacturing legacy', 'Auto supply chain'],
    currentProjects: [
      { name: 'GM/Ford EV transition', category: 'Manufacturing', status: 'Active', investment: 15 },
      { name: 'Battery gigafactories', category: 'Manufacturing', status: 'Building', investment: 8 },
      { name: 'Gotion battery (blocked?)', category: 'Manufacturing', status: 'Controversial', investment: 2.4 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Nuclear/gas', current: 'Coal phase-out, no replacement' },
      { category: 'Grid', need: 'Hardening', current: 'Aging, frequent outages' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Auto manufacturing transition to EV',
    energyProfile: 'Closing coal with no clear replacement. Grid reliability declining.',
    workforceReadiness: 'high',
    assessment: 'AT RISK. Great workforce, but energy policy is incoherent. Grid failing.'
  },
  'Pennsylvania': {
    state: 'Pennsylvania',
    stateGDP: 900,
    stateDebt: 35,
    stateCapitalInvestment: 6.5,
    hamiltonianShare: 18,
    buildRate: 0.7,
    trend: 'flat',
    naturalAdvantages: ['Shale gas (Marcellus)', 'Existing nuclear', 'Ports', 'Manufacturing history'],
    currentProjects: [
      { name: 'Steel plant modernization', category: 'Manufacturing', status: 'Active', investment: 1.2 },
      { name: 'Data centers (nuclear-powered)', category: 'Infrastructure', status: 'Proposed', investment: 8 },
      { name: 'Shale infrastructure', category: 'Energy', status: 'Active', investment: 2.5 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Preserve/expand', current: '9 GW (threatened)' },
      { category: 'Manufacturing', need: 'Steel revival', current: 'Declining' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Energy production (gas + nuclear), steel',
    energyProfile: 'Major gas producer, significant nuclear. Political gridlock on energy.',
    workforceReadiness: 'high',
    assessment: 'UNDERPERFORMING. Has resources but politics block development. Could be energy powerhouse.'
  },
  'Nevada': {
    state: 'Nevada',
    stateGDP: 200,
    stateDebt: 3.5,
    stateCapitalInvestment: 1.8,
    hamiltonianShare: 35,
    buildRate: 0.9,
    trend: 'rising',
    naturalAdvantages: ['Lithium deposits', 'Solar', 'Geothermal', 'Land'],
    currentProjects: [
      { name: 'Thacker Pass lithium', category: 'Mining', status: 'Construction', investment: 2.3 },
      { name: 'Tesla Gigafactory expansion', category: 'Manufacturing', status: 'Active', investment: 3.6 },
      { name: 'Data centers', category: 'Infrastructure', status: 'Building', investment: 5 }
    ],
    capacityGaps: [
      { category: 'Water', need: 'Desalination', current: 'Colorado River (crisis)' },
      { category: 'Energy', need: 'Nuclear', current: 'Solar + gas' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Critical minerals (lithium), data centers, battery manufacturing',
    energyProfile: 'Solar + geothermal. Water is the constraint.',
    workforceReadiness: 'medium',
    assessment: 'STRATEGIC. Lithium is critical. Water crisis shared with Arizona.'
  },
  'Minnesota': {
    state: 'Minnesota',
    stateGDP: 420,
    stateDebt: 12,
    stateCapitalInvestment: 2.5,
    hamiltonianShare: 18,
    buildRate: 0.6,
    trend: 'flat',
    naturalAdvantages: [
      'Freshwater (11,842 lakes, Mississippi headwaters)',
      'Iron Range minerals (copper, nickel, cobalt, rare earths)',
      'Top 5 agricultural state (#1 turkeys, sugar beets)',
      'Medical device powerhouse (Medtronic, Mayo Clinic)',
      'Great Lakes port access (Duluth-Superior)',
      'Strong universities (U of M, Mayo)',
      'Educated workforce',
      'Wind potential'
    ],
    currentProjects: [
      { name: 'Cleveland-Cliffs rare earth exploration', category: 'Mining', status: 'Exploration', investment: 0.3 },
      { name: 'Wind expansion', category: 'Energy', status: 'Active', investment: 1.2 },
      { name: 'Medical device manufacturing', category: 'Manufacturing', status: 'Active', investment: 2 },
      { name: 'Ag processing (Cargill, General Mills)', category: 'Agriculture', status: 'Active', investment: 1.5 },
      { name: 'Twin Metals copper-nickel', category: 'Mining', status: 'Blocked', investment: 0 },
      { name: 'PolyMet/NewRange', category: 'Mining', status: 'Blocked (20+ years)', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'SMR deployment for baseload', current: '0 GW' },
      { category: 'Mining', need: '$10B+ copper-nickel-rare earth', current: 'Blocked by politics' },
      { category: 'Defense minerals', need: 'Domestic rare earth supply', current: '90% from China' },
      { category: 'Water infrastructure', need: 'Leverage surplus for industry', current: 'Underutilized' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'SHOULD BE: Critical minerals hub, ag powerhouse, medical devices, water-rich industry magnet. ACTUALLY: Blocked by state politics, fraud-ridden, declining.',
    energyProfile: 'Wind + imports. Anti-nuclear politics. Could be energy EXPORTER with SMRs but blocks all development.',
    workforceReadiness: 'high',
    assessment: 'BLOCKED + CORRUPT. $250M+ Feeding Our Families fraud (largest COVID fraud in US). $1B+ total fraud exposure. Has EVERYTHING (water, minerals, workforce, infrastructure) but politics blocks development. Walz running for 3rd term in 2026.',
    corruptionEvidence: 'Feeding Our Families: $250M+ stolen (70+ indicted). Largest pandemic fraud case in US history. Additional COVID relief fraud under investigation. Total exposure: $1B+. AG Ellison under federal scrutiny. Low build rate (0.6%) + high non-physical spending (82%) = predictable corruption.',
    pathToVictory: [
      '2025: Federal fraud prosecutions continue, political damage to Walz accumulates',
      '2025-26: DOJ investigation expands, Walz 3rd term campaign under pressure',
      '2026: GOP candidate runs on "Build Minnesota" — mining jobs, accountability, anti-fraud',
      '2026: Walz vulnerable (fraud, VP loss, 8 years of stagnation) — 35-40% chance of defeat',
      '2027: New governor + legislature = permitting reform, Twin Metals reinstated',
      '2028-30: Mining development begins — 25,000+ jobs, $5B+ annual output',
      '2035: Minnesota transformed — energy exporter, critical minerals hub, Iron Range reborn'
    ]
  },
  
  // === TIER 3: STAGNANT/DECLINING (Not Building) ===
  'California': {
    state: 'California',
    stateGDP: 3800,
    stateDebt: 95,
    stateCapitalInvestment: 12,
    hamiltonianShare: 12,
    buildRate: 0.3,
    trend: 'declining',
    naturalAdvantages: ['Tech talent', 'Ports', 'Solar/wind potential', 'Research universities'],
    currentProjects: [
      { name: 'No major manufacturing', category: 'Manufacturing', status: 'Exiting', investment: 0 },
      { name: 'Grid upgrades (reactive)', category: 'Infrastructure', status: 'Planned', investment: 8 },
      { name: 'Desalination (blocked)', category: 'Infrastructure', status: 'Blocked', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Baseload', current: 'Banned, closing Diablo Canyon' },
      { category: 'Water', need: 'Desalination', current: 'Blocked, rationing' },
      { category: 'Manufacturing', need: 'Any', current: 'Exiting to TX, AZ, NV' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Tech innovation only. Manufacturing and energy in decline.',
    energyProfile: 'Grid unreliable. Rolling blackouts. Bans nuclear while closing last plant.',
    workforceReadiness: 'high',
    assessment: 'DECLINING. Massive economy but anti-build politics. Companies fleeing. Grid failing.'
  },
  'New York': {
    state: 'New York',
    stateGDP: 1900,
    stateDebt: 55,
    stateCapitalInvestment: 8.5,
    hamiltonianShare: 15,
    buildRate: 0.45,
    trend: 'flat',
    naturalAdvantages: ['Ports', 'Tech talent', 'Capital markets', 'Research'],
    currentProjects: [
      { name: 'Micron fab (Syracuse)', category: 'Chip Fabs', status: 'Building', investment: 100 },
      { name: 'Offshore wind', category: 'Energy', status: 'Troubled', investment: 2 },
      { name: 'Indian Point closure', category: 'Energy', status: 'Complete', investment: -6 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Replace Indian Point', current: 'Closed, gas imports' },
      { category: 'Energy', need: 'Baseload', current: 'Importing from PA, Canada' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Finance hub. Micron fab is exception in otherwise hostile environment.',
    energyProfile: 'Closed Indian Point nuclear. Now imports energy. Offshore wind failing.',
    workforceReadiness: 'high',
    assessment: 'MIXED. Micron is huge win, but closed nuclear, blocked pipelines. Self-sabotaging.'
  },
  'Illinois': {
    state: 'Illinois',
    stateGDP: 950,
    stateDebt: 45,
    stateCapitalInvestment: 4,
    hamiltonianShare: 14,
    buildRate: 0.4,
    trend: 'declining',
    naturalAdvantages: ['Freshwater', 'Rail hub', 'Nuclear fleet', 'Farmland'],
    currentProjects: [
      { name: 'No major new projects', category: 'Various', status: 'None', investment: 0 },
      { name: 'Nuclear preservation', category: 'Energy', status: 'Subsidized', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Manufacturing', need: 'Any', current: 'Exiting' },
      { category: 'Infrastructure', need: 'Road/bridge repair', current: 'Crumbling' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Agricultural, rail logistics. Declining industrial base.',
    energyProfile: 'Largest nuclear fleet (11 GW) but no new investment.',
    workforceReadiness: 'medium',
    assessment: 'STAGNANT. High debt, high taxes, business exodus. Nuclear fleet aging with no replacement.'
  },
  'New Jersey': {
    state: 'New Jersey',
    stateGDP: 700,
    stateDebt: 48,
    stateCapitalInvestment: 2.5,
    hamiltonianShare: 10,
    buildRate: 0.35,
    trend: 'declining',
    naturalAdvantages: ['Ports', 'Pharma hub', 'Proximity to NYC'],
    currentProjects: [
      { name: 'Offshore wind (troubled)', category: 'Energy', status: 'Cancellations', investment: -5 },
      { name: 'Port expansion', category: 'Infrastructure', status: 'Slow', investment: 1 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Reliable power', current: 'Nuclear aging, wind failing' },
      { category: 'Manufacturing', need: 'Retention', current: 'Exiting' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Pharma, ports. Declining otherwise.',
    energyProfile: 'Nuclear aging. Offshore wind projects collapsing. High costs.',
    workforceReadiness: 'high',
    assessment: 'STRUGGLING. High debt, high costs, business unfriendly. Offshore wind disasters.'
  },
  'Massachusetts': {
    state: 'Massachusetts',
    stateGDP: 650,
    stateDebt: 35,
    stateCapitalInvestment: 2,
    hamiltonianShare: 12,
    buildRate: 0.3,
    trend: 'flat',
    naturalAdvantages: ['Biotech hub', 'Universities', 'Tech talent'],
    currentProjects: [
      { name: 'No major infrastructure', category: 'Infrastructure', status: 'None', investment: 0 },
      { name: 'Life sciences R&D', category: 'R&D', status: 'Active', investment: 3 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Any generation', current: 'Imports from NH, Canada' },
      { category: 'Housing', need: 'Building', current: 'Blocked by zoning' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Biotech R&D. No physical capacity building.',
    energyProfile: 'Energy importer. No generation. High costs.',
    workforceReadiness: 'high',
    assessment: 'R&D ONLY. Great for biotech research, zero physical capacity building.'
  },
  
  // === TIER 4: ENERGY/RESOURCE STATES ===
  'Wyoming': {
    state: 'Wyoming',
    stateGDP: 45,
    stateDebt: 1.2,
    stateCapitalInvestment: 0.8,
    hamiltonianShare: 55,
    buildRate: 1.8,
    trend: 'rising',
    naturalAdvantages: ['Coal', 'Uranium', 'Wind', 'Land', 'Water rights', 'Business-friendly'],
    currentProjects: [
      { name: 'TerraPower Natrium SMR', category: 'Energy', status: 'Building', investment: 4 },
      { name: 'Wind expansion', category: 'Energy', status: 'Active', investment: 2 },
      { name: 'Rare earth exploration', category: 'Mining', status: 'Active', investment: 0.5 }
    ],
    capacityGaps: [
      { category: 'Grid', need: 'HVDC to West Coast', current: 'Regional only' },
      { category: 'Workforce', need: 'Skilled workers', current: 'Small population' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Energy exporter, nuclear pioneer, mining',
    energyProfile: 'Coal transitioning to nuclear + wind. First SMR deployment.',
    workforceReadiness: 'medium',
    assessment: 'PIONEER. Small but mighty. TerraPower SMR is nationally significant.'
  },
  'Alaska': {
    state: 'Alaska',
    stateGDP: 60,
    stateDebt: 2.5,
    stateCapitalInvestment: 1.2,
    hamiltonianShare: 40,
    buildRate: 2.0,
    trend: 'rising',
    naturalAdvantages: ['Oil/gas', 'Critical minerals', 'Ports', 'Strategic Pacific location'],
    currentProjects: [
      { name: 'Willow Project', category: 'Energy', status: 'Active', investment: 8 },
      { name: 'Alaska LNG', category: 'Energy', status: 'Proposed', investment: 38 },
      { name: 'Critical minerals mining', category: 'Mining', status: 'Permitting', investment: 2 }
    ],
    capacityGaps: [
      { category: 'Infrastructure', need: 'Roads, ports', current: 'Extremely limited' },
      { category: 'Grid', need: 'Connections', current: 'Isolated' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Energy dominance, Pacific defense, critical minerals',
    energyProfile: 'Major oil/gas. LNG export potential. Strategically critical.',
    workforceReadiness: 'medium',
    assessment: 'STRATEGIC. Willow is major win. LNG could be transformative.'
  },
  'North Dakota': {
    state: 'North Dakota',
    stateGDP: 65,
    stateDebt: 1.5,
    stateCapitalInvestment: 1,
    hamiltonianShare: 45,
    buildRate: 1.5,
    trend: 'flat',
    naturalAdvantages: ['Bakken shale', 'Wind', 'Farmland', 'Low cost'],
    currentProjects: [
      { name: 'Bakken production', category: 'Energy', status: 'Active', investment: 3 },
      { name: 'Wind expansion', category: 'Energy', status: 'Active', investment: 1 },
      { name: 'Data centers', category: 'Infrastructure', status: 'Building', investment: 0.5 }
    ],
    capacityGaps: [
      { category: 'Pipeline', need: 'Export capacity', current: 'Constrained' },
      { category: 'Workforce', need: 'Retention', current: 'Boom/bust cycles' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Oil production, wind energy',
    energyProfile: 'Major oil producer. Good wind. Pipeline constraints.',
    workforceReadiness: 'medium',
    assessment: 'STEADY. Producing energy. Need more pipeline capacity.'
  },
  'New Mexico': {
    state: 'New Mexico',
    stateGDP: 115,
    stateDebt: 5,
    stateCapitalInvestment: 1.2,
    hamiltonianShare: 25,
    buildRate: 1.0,
    trend: 'flat',
    naturalAdvantages: ['Permian Basin', 'Solar', 'Nuclear labs', 'Land'],
    currentProjects: [
      { name: 'Permian oil/gas', category: 'Energy', status: 'Active', investment: 5 },
      { name: 'Los Alamos/Sandia', category: 'R&D', status: 'Active', investment: 4 },
      { name: 'Solar expansion', category: 'Energy', status: 'Active', investment: 1 }
    ],
    capacityGaps: [
      { category: 'Water', need: 'Conservation', current: 'Stressed' },
      { category: 'Grid', need: 'HVDC export', current: 'Limited' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Energy production, nuclear R&D',
    energyProfile: 'Major oil/gas producer. Nuclear labs. Mixed political environment.',
    workforceReadiness: 'medium',
    assessment: 'PRODUCTIVE. Oil/gas strong. Nuclear labs critical. Politics unpredictable.'
  },
  
  // === TIER 5: OTHER NOTABLE STATES ===
  'Florida': {
    state: 'Florida',
    stateGDP: 1400,
    stateDebt: 25,
    stateCapitalInvestment: 5,
    hamiltonianShare: 15,
    buildRate: 0.35,
    trend: 'flat',
    naturalAdvantages: ['Ports', 'Space Coast', 'Population growth', 'Business-friendly'],
    currentProjects: [
      { name: 'SpaceX/Blue Origin expansion', category: 'Aerospace', status: 'Active', investment: 3 },
      { name: 'Port expansion', category: 'Infrastructure', status: 'Active', investment: 2 },
      { name: 'No major manufacturing', category: 'Manufacturing', status: 'None', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Nuclear expansion', current: '4 GW' },
      { category: 'Manufacturing', need: 'Industrial base', current: 'Minimal' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Aerospace, ports, population magnet',
    energyProfile: 'Gas + nuclear. Some solar. Hurricane vulnerability.',
    workforceReadiness: 'medium',
    assessment: 'SERVICES ECONOMY. Great for business HQs, weak on manufacturing.'
  },
  'Indiana': {
    state: 'Indiana',
    stateGDP: 425,
    stateDebt: 8,
    stateCapitalInvestment: 3,
    hamiltonianShare: 22,
    buildRate: 0.7,
    trend: 'rising',
    naturalAdvantages: ['Central location', 'Low cost', 'Manufacturing base', 'Workforce'],
    currentProjects: [
      { name: 'EV battery plants', category: 'Manufacturing', status: 'Building', investment: 4 },
      { name: 'Steel modernization', category: 'Manufacturing', status: 'Active', investment: 1.5 },
      { name: 'Logistics expansion', category: 'Infrastructure', status: 'Active', investment: 2 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Nuclear', current: 'Coal-heavy' },
      { category: 'Grid', need: 'Modernization', current: 'Adequate' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Manufacturing, logistics hub',
    energyProfile: 'Coal-heavy. Needs transition plan.',
    workforceReadiness: 'high',
    assessment: 'SOLID. Quiet performer. Manufacturing friendly. Energy transition needed.'
  },
  'South Carolina': {
    state: 'South Carolina',
    stateGDP: 280,
    stateDebt: 8,
    stateCapitalInvestment: 2.5,
    hamiltonianShare: 28,
    buildRate: 0.9,
    trend: 'rising',
    naturalAdvantages: ['Ports (Charleston)', 'Low cost', 'Business-friendly', 'BMW/Volvo cluster'],
    currentProjects: [
      { name: 'BMW expansion', category: 'Manufacturing', status: 'Active', investment: 2 },
      { name: 'Scout Motors EV', category: 'Manufacturing', status: 'Building', investment: 2 },
      { name: 'Port Charleston expansion', category: 'Infrastructure', status: 'Active', investment: 1 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Expansion', current: '7 GW (V.C. Summer abandoned)' },
      { category: 'Workforce', need: 'Technical training', current: 'Growing' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Auto manufacturing (BMW, Volvo, Scout), ports',
    energyProfile: 'Nuclear + gas. V.C. Summer failure was setback.',
    workforceReadiness: 'high',
    assessment: 'GROWING. Auto cluster strong. Need to recover from V.C. Summer nuclear failure.'
  },
  'Kentucky': {
    state: 'Kentucky',
    stateGDP: 230,
    stateDebt: 12,
    stateCapitalInvestment: 2,
    hamiltonianShare: 22,
    buildRate: 0.85,
    trend: 'rising',
    naturalAdvantages: ['Low cost', 'Central location', 'Coal reserves', 'Toyota cluster'],
    currentProjects: [
      { name: 'Ford battery plants', category: 'Manufacturing', status: 'Building', investment: 5.8 },
      { name: 'Toyota EV investment', category: 'Manufacturing', status: 'Active', investment: 1.3 },
      { name: 'Envision AESC battery', category: 'Manufacturing', status: 'Building', investment: 2 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Coal transition', current: 'Coal-dependent' },
      { category: 'Grid', need: 'Modernization', current: 'Coal-based' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'EV battery production, auto manufacturing',
    energyProfile: 'Coal-heavy. Energy transition is key challenge.',
    workforceReadiness: 'medium',
    assessment: 'TRANSITIONING. Major battery investments. Coal transition is the challenge.'
  },
  'Louisiana': {
    state: 'Louisiana',
    stateGDP: 280,
    stateDebt: 10,
    stateCapitalInvestment: 3,
    hamiltonianShare: 30,
    buildRate: 1.1,
    trend: 'flat',
    naturalAdvantages: ['Petrochemical hub', 'Ports', 'LNG export', 'Mississippi River'],
    currentProjects: [
      { name: 'LNG export terminals', category: 'Energy', status: 'Active', investment: 20 },
      { name: 'Petrochemical expansion', category: 'Manufacturing', status: 'Active', investment: 5 },
      { name: 'Port upgrades', category: 'Infrastructure', status: 'Active', investment: 2 }
    ],
    capacityGaps: [
      { category: 'Infrastructure', need: 'Hurricane resilience', current: 'Vulnerable' },
      { category: 'Grid', need: 'Hardening', current: 'Frequent outages' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'LNG export, petrochemicals, port logistics',
    energyProfile: 'Energy hub. LNG is nationally critical.',
    workforceReadiness: 'medium',
    assessment: 'ENERGY HUB. LNG exports crucial. Hurricane vulnerability is major risk.'
  },
  'Virginia': {
    state: 'Virginia',
    stateGDP: 600,
    stateDebt: 18,
    stateCapitalInvestment: 3,
    hamiltonianShare: 18,
    buildRate: 0.5,
    trend: 'flat',
    naturalAdvantages: ['Data center hub (NoVA)', 'Ports (Hampton Roads)', 'Shipyards', 'Federal proximity'],
    currentProjects: [
      { name: 'Data centers (Northern VA)', category: 'Infrastructure', status: 'Building', investment: 15 },
      { name: 'Newport News shipyard', category: 'Defense', status: 'Active', investment: 3 },
      { name: 'Offshore wind', category: 'Energy', status: 'Building', investment: 9 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Baseload for data centers', current: 'Gas + nuclear' },
      { category: 'Shipbuilding', need: 'Capacity expansion', current: 'At max' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Data centers, naval shipbuilding, federal hub',
    energyProfile: 'Data center demand outpacing supply. Nuclear needed.',
    workforceReadiness: 'high',
    assessment: 'MIXED. Data center boom, shipyards critical. Energy supply lagging demand.'
  },
  'Washington': {
    state: 'Washington',
    stateGDP: 700,
    stateDebt: 22,
    stateCapitalInvestment: 3.5,
    hamiltonianShare: 16,
    buildRate: 0.5,
    trend: 'flat',
    naturalAdvantages: ['Hydro power', 'Tech hub (Seattle)', 'Ports', 'Boeing'],
    currentProjects: [
      { name: 'Boeing production', category: 'Aerospace', status: 'Active', investment: 2 },
      { name: 'Data centers', category: 'Infrastructure', status: 'Building', investment: 3 },
      { name: 'No new energy', category: 'Energy', status: 'None', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Baseload backup', current: '1 GW (Columbia)' },
      { category: 'Manufacturing', need: 'Diversification', current: 'Boeing-dependent' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Tech, aerospace (Boeing), ports',
    energyProfile: 'Hydro-blessed. But anti-nuclear. Boeing troubles hurt.',
    workforceReadiness: 'high',
    assessment: 'COASTING. Hydro advantage but not building. Boeing problems are drag.'
  },
  'Colorado': {
    state: 'Colorado',
    stateGDP: 450,
    stateDebt: 12,
    stateCapitalInvestment: 2,
    hamiltonianShare: 14,
    buildRate: 0.45,
    trend: 'flat',
    naturalAdvantages: ['Tech hub', 'Aerospace', 'Solar/wind', 'NREL'],
    currentProjects: [
      { name: 'Aerospace R&D', category: 'R&D', status: 'Active', investment: 1.5 },
      { name: 'Solar expansion', category: 'Energy', status: 'Active', investment: 1 },
      { name: 'No major manufacturing', category: 'Manufacturing', status: 'None', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Nuclear', need: 'Any', current: '0 GW' },
      { category: 'Manufacturing', need: 'Industrial base', current: 'Minimal' }
    ],
    politicalFeasibility: 'low',
    nationalRole: 'Tech, aerospace, renewable R&D',
    energyProfile: 'Closing coal with no nuclear. Wind/solar only.',
    workforceReadiness: 'high',
    assessment: 'R&D STATE. Good for tech/aerospace. Not building physical capacity.'
  },
  'Wisconsin': {
    state: 'Wisconsin',
    stateGDP: 370,
    stateDebt: 15,
    stateCapitalInvestment: 2,
    hamiltonianShare: 16,
    buildRate: 0.55,
    trend: 'flat',
    naturalAdvantages: ['Freshwater', 'Manufacturing base', 'Shipbuilding potential', 'Dairy'],
    currentProjects: [
      { name: 'Shipyard revival (Marinette)', category: 'Defense', status: 'Active', investment: 1 },
      { name: 'Microsoft data center', category: 'Infrastructure', status: 'Building', investment: 3.3 },
      { name: 'Foxconn (failed)', category: 'Manufacturing', status: 'Failed', investment: -10 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Nuclear', current: '0 GW (closed)' },
      { category: 'Manufacturing', need: 'Revival', current: 'Declining' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Potential shipbuilding, manufacturing',
    energyProfile: 'Closed nuclear. Now dependent on imports.',
    workforceReadiness: 'high',
    assessment: 'RECOVERING. Foxconn failure hurt. Shipyards and data centers are bright spots.'
  },
  'Utah': {
    state: 'Utah',
    stateGDP: 240,
    stateDebt: 5,
    stateCapitalInvestment: 2,
    hamiltonianShare: 25,
    buildRate: 0.8,
    trend: 'rising',
    naturalAdvantages: ['Business-friendly', 'Tech hub', 'Minerals', 'Low cost'],
    currentProjects: [
      { name: 'Data centers', category: 'Infrastructure', status: 'Building', investment: 2 },
      { name: 'Tech expansion', category: 'Infrastructure', status: 'Active', investment: 1.5 },
      { name: 'Mining', category: 'Mining', status: 'Active', investment: 0.5 }
    ],
    capacityGaps: [
      { category: 'Water', need: 'Great Salt Lake crisis', current: 'Crisis' },
      { category: 'Energy', need: 'Nuclear', current: 'Coal transition' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Tech hub, potential mining',
    energyProfile: 'Coal transitioning. Water crisis is serious.',
    workforceReadiness: 'high',
    assessment: 'GROWING but water crisis could limit. Business-friendly but resource-constrained.'
  },
  'West Virginia': {
    state: 'West Virginia',
    stateGDP: 85,
    stateDebt: 6,
    stateCapitalInvestment: 0.8,
    hamiltonianShare: 20,
    buildRate: 0.9,
    trend: 'flat',
    naturalAdvantages: ['Coal', 'Gas (Marcellus)', 'Cheap land', 'Water'],
    currentProjects: [
      { name: 'Gas development', category: 'Energy', status: 'Active', investment: 2 },
      { name: 'Data centers (proposed)', category: 'Infrastructure', status: 'Proposed', investment: 1 },
      { name: 'No major manufacturing', category: 'Manufacturing', status: 'None', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Diversification', need: 'Beyond coal', current: 'Coal-dependent' },
      { category: 'Workforce', need: 'Retraining', current: 'Coal skills' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Energy production (coal, gas)',
    energyProfile: 'Coal state trying to transition. Gas is the bridge.',
    workforceReadiness: 'medium',
    assessment: 'TRANSITIONING. Coal declining. Gas is lifeline. Needs diversification.'
  },
  'Missouri': {
    state: 'Missouri',
    stateGDP: 380,
    stateDebt: 12,
    stateCapitalInvestment: 2,
    hamiltonianShare: 15,
    buildRate: 0.5,
    trend: 'flat',
    naturalAdvantages: ['Central location', 'Low cost', 'Workforce'],
    currentProjects: [
      { name: 'No major projects', category: 'Various', status: 'None', investment: 0 }
    ],
    capacityGaps: [
      { category: 'Manufacturing', need: 'Attraction', current: 'Stagnant' },
      { category: 'Energy', need: 'Nuclear', current: '1 GW' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Agricultural, logistics',
    energyProfile: 'Mix of sources. Not leading in any.',
    workforceReadiness: 'medium',
    assessment: 'STAGNANT. Has potential but not attracting investment.'
  },
  'Alabama': {
    state: 'Alabama',
    stateGDP: 280,
    stateDebt: 8,
    stateCapitalInvestment: 2.5,
    hamiltonianShare: 24,
    buildRate: 0.9,
    trend: 'rising',
    naturalAdvantages: ['Low cost', 'Port (Mobile)', 'Auto cluster', 'Nuclear'],
    currentProjects: [
      { name: 'Hyundai EV expansion', category: 'Manufacturing', status: 'Active', investment: 1 },
      { name: 'Airbus expansion', category: 'Aerospace', status: 'Active', investment: 1 },
      { name: 'Browns Ferry nuclear', category: 'Energy', status: 'Operating', investment: 0.5 }
    ],
    capacityGaps: [
      { category: 'Education', need: 'Workforce skills', current: 'Lagging' },
      { category: 'Infrastructure', need: 'Modernization', current: 'Adequate' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Auto manufacturing, aerospace, nuclear',
    energyProfile: 'Strong nuclear + hydro. Good energy position.',
    workforceReadiness: 'medium',
    assessment: 'QUIETLY BUILDING. Auto and aerospace clusters. Workforce skills gap.'
  },
  'Mississippi': {
    state: 'Mississippi',
    stateGDP: 130,
    stateDebt: 5,
    stateCapitalInvestment: 1,
    hamiltonianShare: 20,
    buildRate: 0.75,
    trend: 'flat',
    naturalAdvantages: ['Low cost', 'Shipbuilding (Ingalls)', 'Port (Gulfport)'],
    currentProjects: [
      { name: 'Ingalls Shipbuilding', category: 'Defense', status: 'Active', investment: 2 },
      { name: 'Nissan (declining)', category: 'Manufacturing', status: 'Declining', investment: -0.5 }
    ],
    capacityGaps: [
      { category: 'Diversification', need: 'Beyond shipbuilding', current: 'Limited' },
      { category: 'Workforce', need: 'Skills training', current: 'Lagging' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Naval shipbuilding (critical)',
    energyProfile: 'Gas + nuclear (Grand Gulf). Adequate.',
    workforceReadiness: 'medium',
    assessment: 'SHIPBUILDING STATE. Ingalls is nationally critical. Needs diversification.'
  },
  'Maine': {
    state: 'Maine',
    stateGDP: 85,
    stateDebt: 4,
    stateCapitalInvestment: 0.5,
    hamiltonianShare: 18,
    buildRate: 0.6,
    trend: 'flat',
    naturalAdvantages: ['Shipyard (Bath)', 'Forestry', 'Wind potential'],
    currentProjects: [
      { name: 'Bath Iron Works', category: 'Defense', status: 'Active', investment: 1 },
      { name: 'Offshore wind (proposed)', category: 'Energy', status: 'Proposed', investment: 1 }
    ],
    capacityGaps: [
      { category: 'Energy', need: 'Baseload', current: 'Imports' },
      { category: 'Manufacturing', need: 'Any', current: 'Minimal' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Naval shipbuilding (destroyers)',
    energyProfile: 'Energy importer. Closed nuclear. Wind potential.',
    workforceReadiness: 'high',
    assessment: 'SHIPBUILDING. Bath Iron Works is critical. Rest of economy stagnant.'
  },
  'Connecticut': {
    state: 'Connecticut',
    stateGDP: 300,
    stateDebt: 35,
    stateCapitalInvestment: 1.5,
    hamiltonianShare: 14,
    buildRate: 0.5,
    trend: 'declining',
    naturalAdvantages: ['Submarine base (Groton)', 'Aerospace (P&W)', 'Educated workforce'],
    currentProjects: [
      { name: 'Electric Boat submarines', category: 'Defense', status: 'Active', investment: 3 },
      { name: 'Pratt & Whitney engines', category: 'Aerospace', status: 'Active', investment: 1 }
    ],
    capacityGaps: [
      { category: 'Workforce', need: 'Skilled trades', current: 'Aging' },
      { category: 'Cost', need: 'Competitiveness', current: 'High cost state' }
    ],
    politicalFeasibility: 'medium',
    nationalRole: 'Submarines (critical), jet engines',
    energyProfile: 'Nuclear (Millstone) + gas. Adequate.',
    workforceReadiness: 'high',
    assessment: 'DEFENSE CRITICAL. Submarine production is irreplaceable. High costs are drag.'
  },
  'Iowa': {
    state: 'Iowa',
    stateGDP: 210,
    stateDebt: 5,
    stateCapitalInvestment: 1.5,
    hamiltonianShare: 20,
    buildRate: 0.7,
    trend: 'flat',
    naturalAdvantages: ['Wind', 'Farmland', 'Low cost', 'Workforce'],
    currentProjects: [
      { name: 'Wind expansion', category: 'Energy', status: 'Active', investment: 2 },
      { name: 'Data centers', category: 'Infrastructure', status: 'Building', investment: 2 },
      { name: 'Ethanol/biofuels', category: 'Energy', status: 'Active', investment: 0.5 }
    ],
    capacityGaps: [
      { category: 'Manufacturing', need: 'Diversification', current: 'Ag-focused' },
      { category: 'Nuclear', need: 'Baseload', current: '0 GW' }
    ],
    politicalFeasibility: 'high',
    nationalRole: 'Wind energy, agriculture, data centers',
    energyProfile: 'Wind leader. 60%+ renewable. Good example.',
    workforceReadiness: 'high',
    assessment: 'WIND MODEL. Shows renewable can work. Need diversification beyond ag.'
  }
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
        <ScrollReveal delay={0}>
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
        </ScrollReveal>

        {/* ================================================================ */}
        {/* WHERE WE LEAD - American Advantages with REAL DATA */}
        {/* ================================================================ */}
        <ScrollReveal delay={100}>
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
        </ScrollReveal>

        {/* ================================================================ */}
        {/* THE STRATEGY - Policy Sequence */}
        {/* ================================================================ */}
        <ScrollReveal delay={200}>
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
        {/* THE WORKFORCE - Build With Americans */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.warning }}>THE WORKFORCE</span> — Build With Americans
          </h2>
          <p style={styles.sectionSubtitle}>
            You can't build America without American workers. A tight labor market means rising wages and investment in training.
          </p>
          
          <div style={styles.workforceGrid}>
            <div style={styles.workforceCard}>
              <div style={styles.wfHeader}>
                <span style={styles.wfIcon}>📊</span>
                <span style={styles.wfLabel}>LABOR FORCE PARTICIPATION</span>
              </div>
              <div style={styles.wfMetric}>
                <span style={styles.wfValue}>62.5%</span>
                <span style={styles.wfTarget}>Target: 67%+</span>
              </div>
              <div style={styles.wfNote}>Millions of Americans sidelined from workforce</div>
            </div>
            
            <div style={{ ...styles.workforceCard, borderColor: COLORS.other }}>
              <div style={styles.wfHeader}>
                <span style={styles.wfIcon}>🚨</span>
                <span style={styles.wfLabel}>RECENT ILLEGAL ARRIVALS</span>
              </div>
              <div style={styles.wfMetric}>
                <span style={{ ...styles.wfValue, color: COLORS.other }}>6-8M</span>
                <span style={styles.wfTarget}>2021-2024</span>
              </div>
              <div style={styles.wfNote}>≈ 2 Chicagos of labor supply added</div>
            </div>
            
            <div style={styles.workforceCard}>
              <div style={styles.wfHeader}>
                <span style={styles.wfIcon}>🔨</span>
                <span style={styles.wfLabel}>CONSTRUCTION WAGES</span>
              </div>
              <div style={styles.wfMetric}>
                <span style={{ ...styles.wfValue, color: COLORS.warning }}>+2.1%/yr</span>
                <span style={styles.wfTarget}>Target: 4%+/yr</span>
              </div>
              <div style={styles.wfNote}>Wage growth stagnant due to labor surplus</div>
            </div>
            
            <div style={styles.workforceCard}>
              <div style={styles.wfHeader}>
                <span style={styles.wfIcon}>🎓</span>
                <span style={styles.wfLabel}>APPRENTICESHIPS/YEAR</span>
              </div>
              <div style={styles.wfMetric}>
                <span style={{ ...styles.wfValue, color: COLORS.warning }}>~500K</span>
                <span style={styles.wfTarget}>Target: 1M+</span>
              </div>
              <div style={styles.wfNote}>Need to double training investment</div>
            </div>
          </div>
          
          <div style={styles.workforcePolicy}>
            <div style={styles.wfPolicyTitle}>American System Workforce Policy</div>
            <div style={styles.wfPolicyGrid}>
              <div style={styles.wfPolicyItem}>
                <span style={styles.wfPolicyIcon}>🛡️</span>
                <div>
                  <strong>Secure Border</strong>
                  <p>Control inflows → tight labor market → rising wages</p>
                </div>
              </div>
              <div style={styles.wfPolicyItem}>
                <span style={styles.wfPolicyIcon}>⚖️</span>
                <div>
                  <strong>Enforce Laws</strong>
                  <p>E-Verify mandatory, employer penalties, deportations</p>
                </div>
              </div>
              <div style={styles.wfPolicyItem}>
                <span style={styles.wfPolicyIcon}>📚</span>
                <div>
                  <strong>Train Americans</strong>
                  <p>Apprenticeships, trade schools, veteran programs</p>
                </div>
              </div>
              <div style={styles.wfPolicyItem}>
                <span style={styles.wfPolicyIcon}>💪</span>
                <div>
                  <strong>Raise Wages</strong>
                  <p>Tight labor + training = American workers win</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.workforceQuote}>
            "Build with American hands, trained in American schools, paid American wages."
          </div>
          </section>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* NATIONAL CAPACITY - Hamiltonian System View */}
        {/* ================================================================ */}
        <ScrollReveal delay={300}>
          <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.accent }}>NATIONAL CAPACITY</span> — Build Where It's Best
          </h2>
          <p style={styles.sectionSubtitle}>
            Hamilton's approach: Build where natural advantages exist and politics allow. Route around obstacles. Serve national aims.
          </p>
          
          <div style={styles.nationalCapacityGrid}>
            {[
              {
                category: '⚛️ Nuclear',
                need: '300 GW',
                current: '95 GW',
                bestFit: 'TX, TN, WY, OH, PA',
                whyThere: 'Water, land, friendly politics, grid access',
                building: 'Vogtle (GA), SMRs (TN, WY)',
                blocked: 'CA, NY (political)',
                status: 'building'
              },
              {
                category: '🔲 Chip Fabs',
                need: '35% global',
                current: '12%',
                bestFit: 'AZ, OH, TX, NY',
                whyThere: 'Water, power, talent pipelines, incentives',
                building: 'TSMC (AZ), Intel (OH), Samsung (TX)',
                blocked: 'Permitting delays',
                status: 'building'
              },
              {
                category: '⚡ Grid/HVDC',
                need: '150 GW',
                current: '25 GW',
                bestFit: 'Plains corridor, Southeast',
                whyThere: 'Connect wind/solar to demand centers',
                building: 'SunZia (NM-AZ), Grain Belt (KS-IN)',
                blocked: 'State permitting, NIMBYism',
                status: 'planned'
              },
              {
                category: '🛢️ Oil & Gas',
                need: 'Energy dominance',
                current: '#1 producer',
                bestFit: 'TX, AK, NM, ND, PA',
                whyThere: 'Reserves, infrastructure, friendly politics',
                building: 'Willow (AK), Permian expansion',
                blocked: 'Federal lands (some), pipelines',
                status: 'active'
              },
              {
                category: '🚢 Shipbuilding',
                need: '100 ships/yr',
                current: '5 ships/yr',
                bestFit: 'VA, MS, ME, WI',
                whyThere: 'Existing yards, workforce, Navy contracts',
                building: 'Submarine expansion (CT, VA)',
                blocked: 'Workforce, funding',
                status: 'critical'
              },
              {
                category: '⛏️ Critical Minerals',
                need: '30% domestic',
                current: '< 5%',
                bestFit: 'NV, AZ, WY, MN, AK',
                whyThere: 'Known deposits (lithium, copper, rare earths)',
                building: 'Thacker Pass (NV), Resolution (AZ)',
                blocked: 'Permitting (10+ years avg)',
                status: 'blocked'
              },
            ].map((item, i) => (
              <div key={i} style={{
                ...styles.capacityCard,
                borderColor: item.status === 'active' ? COLORS.hamiltonian :
                  item.status === 'building' ? COLORS.accent :
                  item.status === 'planned' ? COLORS.warning :
                  item.status === 'critical' ? COLORS.other :
                  COLORS.other
              }}>
                <div style={styles.capHeader}>
                  <span style={styles.capCategory}>{item.category}</span>
                  <span style={{
                    ...styles.capStatus,
                    backgroundColor: item.status === 'active' ? COLORS.hamiltonian + '33' :
                      item.status === 'building' ? COLORS.accent + '33' :
                      item.status === 'planned' ? COLORS.warning + '33' :
                      COLORS.other + '33',
                    color: item.status === 'active' ? COLORS.hamiltonian :
                      item.status === 'building' ? COLORS.accent :
                      item.status === 'planned' ? COLORS.warning :
                      COLORS.other
                  }}>{item.status}</span>
                </div>
                <div style={styles.capMetrics}>
                  <div style={styles.capMetric}>
                    <span style={styles.capLabel}>Need</span>
                    <span style={styles.capValue}>{item.need}</span>
                  </div>
                  <div style={styles.capMetric}>
                    <span style={styles.capLabel}>Now</span>
                    <span style={styles.capValue}>{item.current}</span>
                  </div>
                </div>
                <div style={styles.capDetail}>
                  <div style={styles.capRow}>
                    <span style={styles.capRowLabel}>🎯 Best fit:</span>
                    <span>{item.bestFit}</span>
                  </div>
                  <div style={styles.capRow}>
                    <span style={styles.capRowLabel}>💡 Why:</span>
                    <span>{item.whyThere}</span>
                  </div>
                  <div style={styles.capRow}>
                    <span style={styles.capRowLabel}>🔨 Building:</span>
                    <span style={{ color: COLORS.hamiltonian }}>{item.building}</span>
                  </div>
                  <div style={styles.capRow}>
                    <span style={styles.capRowLabel}>🚫 Blocked:</span>
                    <span style={{ color: COLORS.other }}>{item.blocked}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={styles.hamiltonianPrinciple}>
            <div style={styles.hpTitle}>THE HAMILTONIAN PRINCIPLE</div>
            <div style={styles.hpContent}>
              <div style={styles.hpItem}>
                <span style={styles.hpIcon}>✅</span>
                <span><strong>Build where you can.</strong> Don't wait for every state to agree.</span>
              </div>
              <div style={styles.hpItem}>
                <span style={styles.hpIcon}>🔄</span>
                <span><strong>Route around obstacles.</strong> CA won't build nuclear? TX will. Build HVDC to export.</span>
              </div>
              <div style={styles.hpItem}>
                <span style={styles.hpIcon}>🎯</span>
                <span><strong>Optimize for the nation.</strong> States serve the system, not the reverse.</span>
              </div>
              <div style={styles.hpItem}>
                <span style={styles.hpIcon}>⏳</span>
                <span><strong>Political change follows success.</strong> When TX thrives on nuclear, others will follow.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CAPACITY GAPS - Detailed Targets */}
        {/* ================================================================ */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.warning }}>CAPACITY TARGETS</span> — The Numbers
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
        </ScrollReveal>

        {/* ================================================================ */}
        {/* GROWTH INITIATIVES - Moon, Defense, AI, Energy */}
        {/* ================================================================ */}
        <ScrollReveal delay={400}>
          <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.gold }}>GROWTH INITIATIVES</span> — The Next Frontiers
          </h2>
          <p style={styles.sectionSubtitle}>
            Major programs that will define American capacity for the next decade. Short-term wins and long-term moonshots.
          </p>
          
          <div style={styles.initiativesGrid}>
            {/* Short-Term (2025-2028) */}
            <div style={styles.initiativeColumn}>
              <div style={styles.initiativeHeader}>
                <span style={styles.initiativeTimeframe}>⚡ SHORT-TERM</span>
                <span style={styles.initiativeYears}>2025-2028</span>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🛢️</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Willow Project (Alaska)</div>
                  <div style={styles.initStats}>
                    <span>$8B investment</span>
                    <span>180K bbl/day</span>
                    <span>2,500+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>ConocoPhillips. First oil ~2029. Energy dominance.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>⛽</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>LNG Export Expansion</div>
                  <div style={styles.initStats}>
                    <span>$40B+ investment</span>
                    <span>TX, LA</span>
                    <span>10K+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>Golden Pass, Plaquemines. Europe/Asia demand.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🔋</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Battery Plants</div>
                  <div style={styles.initStats}>
                    <span>$20B+ investment</span>
                    <span>MI, TN, GA</span>
                    <span>15K+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>Ford, GM, SK, LG. EV supply chain reshoring.</div>
                </div>
              </div>
            </div>
            
            {/* Medium-Term (2028-2035) */}
            <div style={styles.initiativeColumn}>
              <div style={styles.initiativeHeader}>
                <span style={styles.initiativeTimeframe}>🎯 MEDIUM-TERM</span>
                <span style={styles.initiativeYears}>2028-2035</span>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🚀</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Artemis / Moon Base</div>
                  <div style={styles.initStats}>
                    <span>$25B+/year</span>
                    <span>Isaacman/NASA</span>
                    <span>50K+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>Moon landing 2026-27. Permanent base by 2030s. Mars prep.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🛡️</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Iron Dome for America</div>
                  <div style={styles.initStats}>
                    <span>$50-100B</span>
                    <span>Nationwide</span>
                    <span>100K+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>Comprehensive missile defense. Interceptors, radar, C2. Domestic manufacturing.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>⚛️</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>SMR Nuclear Fleet</div>
                  <div style={styles.initStats}>
                    <span>$60B+</span>
                    <span>20 reactors</span>
                    <span>30K+ jobs</span>
                  </div>
                  <div style={styles.initDesc}>NuScale, TerraPower, X-energy. Factory-built, fast deploy.</div>
                </div>
              </div>
            </div>
            
            {/* Long-Term (2030s+) */}
            <div style={styles.initiativeColumn}>
              <div style={styles.initiativeHeader}>
                <span style={styles.initiativeTimeframe}>🌟 LONG-TERM</span>
                <span style={styles.initiativeYears}>2030s+</span>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🤖</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>AI Manhattan Project</div>
                  <div style={styles.initStats}>
                    <span>$50-100B</span>
                    <span>Defense + Industrial</span>
                    <span>Tech leadership</span>
                  </div>
                  <div style={styles.initDesc}>Israel-style AI integration. Autonomous defense, industrial AI, cyber.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>🔴</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Mars Colony Prep</div>
                  <div style={styles.initStats}>
                    <span>$100B+</span>
                    <span>SpaceX + NASA</span>
                    <span>2030s crewed</span>
                  </div>
                  <div style={styles.initDesc}>Starship development. Propellant depots. Life support R&D.</div>
                </div>
              </div>
              
              <div style={styles.initiativeCard}>
                <div style={styles.initIcon}>⚡</div>
                <div style={styles.initContent}>
                  <div style={styles.initTitle}>Fusion Power</div>
                  <div style={styles.initStats}>
                    <span>$20B+ R&D</span>
                    <span>Commonwealth, TAE</span>
                    <span>2030s grid?</span>
                  </div>
                  <div style={styles.initDesc}>Private fusion race. Could be grid-ready by late 2030s.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.initiativeSummary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Total Investment Pipeline</span>
              <span style={styles.summaryValue}>$500B+</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Jobs Created</span>
              <span style={styles.summaryValue}>500K+</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Impact States</span>
              <span style={styles.summaryValue}>All 50</span>
            </div>
          </div>
          </section>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* YOUR STAKE - Clear Personal Impact */}
        {/* ================================================================ */}
        <ScrollReveal delay={500}>
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
              
              {/* Calculation Breakdown */}
              {buildScenario > 2 && (
                <div style={styles.calculationBreakdown}>
                  <div style={styles.calcTitle}>📊 How This Is Calculated</div>
                  <div style={styles.calcGrid}>
                    <div style={styles.calcItem}>
                      <span style={styles.calcLabel}>📉 Energy Savings</span>
                      <span style={styles.calcValue}>
                        ${Math.round(stateInfo.energySavings * (buildScenario - 2) / 3 * householdSize / 2).toLocaleString()}/yr
                      </span>
                      <span style={styles.calcExplain}>Lower utility bills from cheaper, abundant power</span>
                    </div>
                    <div style={styles.calcItem}>
                      <span style={styles.calcLabel}>💼 Wage/Opportunity Premium</span>
                      <span style={styles.calcValue}>
                        ${Math.round((buildScenario - 2) * 1200 * householdSize).toLocaleString()}/yr
                      </span>
                      <span style={styles.calcExplain}>Tighter labor market = higher wages, more job options</span>
                    </div>
                    <div style={styles.calcItem}>
                      <span style={styles.calcLabel}>🏠 Wealth Effect</span>
                      <span style={styles.calcValue}>
                        ${Math.round((buildScenario - 2) * 500 * householdSize).toLocaleString()}/yr
                      </span>
                      <span style={styles.calcExplain}>Property values, local economy growth, 401k gains</span>
                    </div>
                    <div style={styles.calcItem}>
                      <span style={styles.calcLabel}>🏛️ Better Services</span>
                      <span style={styles.calcValue}>
                        ${Math.round((buildScenario - 2) * 300 * householdSize).toLocaleString()}/yr
                      </span>
                      <span style={styles.calcExplain}>More tax revenue = better schools, roads, services</span>
                    </div>
                  </div>
                  <div style={styles.calcNote}>
                    Estimates based on economic multiplier effects from increased capital investment. 
                    Actual impact varies by location, industry, and individual circumstances.
                  </div>
                </div>
              )}
            </div>
          </div>
          </section>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* STATE REVIEW - Hamiltonian Analysis by State */}
        {/* ================================================================ */}
        <ScrollReveal delay={600}>
          <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={{ color: COLORS.gold }}>STATE REVIEW</span> — Hamiltonian Analysis
          </h2>
          <p style={styles.sectionSubtitle}>
            Every state evaluated through the Hamiltonian lens: What are they building? What should they build? How do they serve national capacity?
          </p>
          
          <div style={styles.stateReviewSelector}>
            <label style={styles.stateReviewLabel}>Select State:</label>
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={styles.stateReviewSelect}
            >
              {Object.keys(stateHamiltonianAnalysis).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          {(() => {
            const analysis = stateHamiltonianAnalysis[selectedState]
            if (!analysis) return null
            
            return (
              <div style={styles.stateReviewContent}>
                {/* State Metrics */}
                <div style={styles.stateMetricsGrid}>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>STATE GDP</div>
                    <div style={styles.stateMetricValue}>${analysis.stateGDP}B</div>
                  </div>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>STATE DEBT</div>
                    <div style={styles.stateMetricValue}>${analysis.stateDebt}B</div>
                  </div>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>CAPITAL INVESTMENT</div>
                    <div style={styles.stateMetricValue}>${analysis.stateCapitalInvestment}B</div>
                  </div>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>HAMILTONIAN SHARE</div>
                    <div style={{ ...styles.stateMetricValue, color: analysis.hamiltonianShare >= 25 ? COLORS.hamiltonian : analysis.hamiltonianShare >= 18 ? COLORS.warning : COLORS.other }}>
                      {analysis.hamiltonianShare}%
                    </div>
                    <div style={styles.stateMetricTarget}>Target: 25%+</div>
                  </div>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>BUILD RATE</div>
                    <div style={{ ...styles.stateMetricValue, color: analysis.buildRate >= 1.0 ? COLORS.hamiltonian : analysis.buildRate >= 0.6 ? COLORS.warning : COLORS.other }}>
                      {analysis.buildRate}%
                    </div>
                    <div style={styles.stateMetricTarget}>Target: 1%+ of GDP</div>
                  </div>
                  <div style={styles.stateMetricCard}>
                    <div style={styles.stateMetricLabel}>POLITICAL FEASIBILITY</div>
                    <div style={{
                      ...styles.stateMetricValue,
                      fontSize: '1rem',
                      color: analysis.politicalFeasibility === 'high' ? COLORS.hamiltonian :
                        analysis.politicalFeasibility === 'medium' ? COLORS.warning : COLORS.other
                    }}>
                      {analysis.politicalFeasibility.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Natural Advantages */}
                <div style={styles.stateAdvantages}>
                  <h3 style={styles.stateSubtitle}>🎯 Natural Advantages</h3>
                  <div style={styles.advantagesList}>
                    {analysis.naturalAdvantages.map((adv, i) => (
                      <span key={i} style={styles.advantageTag}>{adv}</span>
                    ))}
                  </div>
                </div>
                
                {/* Current Projects */}
                <div style={styles.stateProjectsSection}>
                  <h3 style={styles.stateSubtitle}>🔨 Current Projects</h3>
                  <div style={styles.projectsTable}>
                    {analysis.currentProjects.map((project, i) => (
                      <div key={i} style={styles.projectRow}>
                        <div style={styles.projectName}>{project.name}</div>
                        <div style={styles.projectCategory}>{project.category}</div>
                        <div style={{
                          ...styles.projectStatus,
                          color: project.status === 'Building' || project.status === 'Active' ? COLORS.hamiltonian :
                            project.status === 'Planned' ? COLORS.warning : COLORS.textMuted
                        }}>{project.status}</div>
                        <div style={styles.projectInvestment}>${project.investment}B</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Capacity Gaps */}
                <div style={styles.stateGaps}>
                  <h3 style={styles.stateSubtitle}>⚠️ Capacity Gaps</h3>
                  <div style={styles.gapsList}>
                    {analysis.capacityGaps.map((gap, i) => (
                      <div key={i} style={styles.gapItem}>
                        <span style={styles.gapCategory}>{gap.category}:</span>
                        <span style={styles.gapNeed}>Need {gap.need}</span>
                        <span style={styles.gapCurrent}>Now {gap.current}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* National Role & Energy Profile */}
                <div style={styles.stateInfoGrid}>
                  <div style={styles.stateInfoCard}>
                    <h4 style={styles.stateInfoTitle}>🇺🇸 National Role</h4>
                    <p style={styles.stateInfoText}>{analysis.nationalRole}</p>
                  </div>
                  <div style={styles.stateInfoCard}>
                    <h4 style={styles.stateInfoTitle}>⚡ Energy Profile</h4>
                    <p style={styles.stateInfoText}>{analysis.energyProfile}</p>
                  </div>
                  <div style={styles.stateInfoCard}>
                    <h4 style={styles.stateInfoTitle}>👷 Workforce Readiness</h4>
                    <div style={{
                      ...styles.workforceBadge,
                      backgroundColor: analysis.workforceReadiness === 'high' ? COLORS.hamiltonian + '33' :
                        analysis.workforceReadiness === 'medium' ? COLORS.warning + '33' : COLORS.other + '33',
                      color: analysis.workforceReadiness === 'high' ? COLORS.hamiltonian :
                        analysis.workforceReadiness === 'medium' ? COLORS.warning : COLORS.other
                    }}>
                      {analysis.workforceReadiness.toUpperCase()}
                    </div>
                    <p style={styles.stateInfoText}>
                      {analysis.workforceReadiness === 'high' ? 'Strong technical workforce, training programs in place' :
                        analysis.workforceReadiness === 'medium' ? 'Workforce available, needs training investment' :
                        'Workforce gaps, significant training needed'}
                    </p>
                  </div>
                </div>
                
                {/* Hamiltonian Assessment */}
                <div style={styles.stateAssessment}>
                  <h3 style={styles.stateSubtitle}>📊 Hamiltonian Assessment</h3>
                  
                  {/* Overall Assessment Banner */}
                  <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: analysis.trend === 'rising' ? COLORS.hamiltonian + '22' :
                      analysis.trend === 'flat' ? COLORS.warning + '22' : COLORS.other + '22',
                    borderRadius: '8px',
                    border: `2px solid ${analysis.trend === 'rising' ? COLORS.hamiltonian :
                      analysis.trend === 'flat' ? COLORS.warning : COLORS.other}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {analysis.trend === 'rising' ? '📈' : analysis.trend === 'flat' ? '➡️' : '📉'}
                      </span>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: analysis.trend === 'rising' ? COLORS.hamiltonian :
                          analysis.trend === 'flat' ? COLORS.warning : COLORS.other,
                        textTransform: 'uppercase',
                      }}>
                        {analysis.trend === 'rising' ? 'Building' : analysis.trend === 'flat' ? 'Stagnant' : 'Declining'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: COLORS.text, margin: 0, lineHeight: 1.5 }}>
                      {analysis.assessment}
                    </p>
                  </div>
                  
                  <div style={styles.assessmentContent}>
                    <div style={styles.assessmentItem}>
                      <span style={styles.assessmentLabel}>Trend:</span>
                      <span style={{
                        color: analysis.trend === 'rising' ? COLORS.hamiltonian :
                          analysis.trend === 'flat' ? COLORS.warning : COLORS.other
                      }}>
                        {analysis.trend === 'rising' ? '📈 Rising' : analysis.trend === 'flat' ? '➡️ Flat' : '📉 Declining'}
                      </span>
                    </div>
                    <div style={styles.assessmentItem}>
                      <span style={styles.assessmentLabel}>Hamiltonian Share:</span>
                      <span style={{
                        color: analysis.hamiltonianShare >= 25 ? COLORS.hamiltonian :
                          analysis.hamiltonianShare >= 18 ? COLORS.warning : COLORS.other
                      }}>
                        {analysis.hamiltonianShare >= 25 ? '✅ Strong' : analysis.hamiltonianShare >= 18 ? '⚠️ Moderate' : '❌ Weak'} ({analysis.hamiltonianShare}%)
                      </span>
                    </div>
                    <div style={styles.assessmentItem}>
                      <span style={styles.assessmentLabel}>Build Rate:</span>
                      <span style={{
                        color: analysis.buildRate >= 1.0 ? COLORS.hamiltonian :
                          analysis.buildRate >= 0.6 ? COLORS.warning : COLORS.other
                      }}>
                        {analysis.buildRate >= 1.0 ? '✅ Above Target' : analysis.buildRate >= 0.6 ? '⚠️ Near Target' : '❌ Below Target'} ({analysis.buildRate}%)
                      </span>
                    </div>
                    <div style={styles.assessmentItem}>
                      <span style={styles.assessmentLabel}>Political Feasibility:</span>
                      <span style={{
                        color: analysis.politicalFeasibility === 'high' ? COLORS.hamiltonian :
                          analysis.politicalFeasibility === 'medium' ? COLORS.warning : COLORS.other
                      }}>
                        {analysis.politicalFeasibility === 'high' ? '✅ Can Build Now' : 
                          analysis.politicalFeasibility === 'medium' ? '⚠️ Possible with Effort' : '❌ Blocked'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Accountability Index - Corruption Risk */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: COLORS.bgCard,
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.border}`,
                }}>
                  <h3 style={{ 
                    ...styles.stateSubtitle, 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🔍 Accountability Index
                  </h3>
                  
                  {/* Risk calculation based on build rate, hamiltonian share, and proven corruption */}
                  {(() => {
                    const nonHamiltonian = 100 - analysis.hamiltonianShare
                    // If there's proven corruption, automatically HIGH risk
                    const hasProvenCorruption = !!analysis.corruptionEvidence
                    const riskLevel = hasProvenCorruption ? 'PROVEN' :
                      analysis.buildRate < 0.5 ? 'HIGH' : 
                      analysis.buildRate < 0.8 ? 'ELEVATED' : 
                      analysis.buildRate < 1.0 ? 'MODERATE' : 'LOW'
                    const riskColor = riskLevel === 'PROVEN' ? '#ff0000' :
                      riskLevel === 'HIGH' ? COLORS.other :
                      riskLevel === 'ELEVATED' ? COLORS.warning :
                      riskLevel === 'MODERATE' ? '#f0ad4e' : COLORS.hamiltonian
                    
                    return (
                      <>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(3, 1fr)', 
                          gap: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginBottom: '0.25rem' }}>
                              Build Rate
                            </div>
                            <div style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: 700,
                              color: analysis.buildRate >= 1.0 ? COLORS.hamiltonian : 
                                analysis.buildRate >= 0.6 ? COLORS.warning : COLORS.other
                            }}>
                              {analysis.buildRate}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                              {analysis.buildRate >= 1.0 ? 'Sustainable' : 'Below sustainable'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginBottom: '0.25rem' }}>
                              Non-Physical Spending
                            </div>
                            <div style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: 700,
                              color: nonHamiltonian > 80 ? COLORS.other : 
                                nonHamiltonian > 70 ? COLORS.warning : COLORS.hamiltonian
                            }}>
                              {nonHamiltonian}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                              No physical output
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginBottom: '0.25rem' }}>
                              Audit Visibility
                            </div>
                            <div style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: 700,
                              color: analysis.hamiltonianShare >= 25 ? COLORS.hamiltonian : 
                                analysis.hamiltonianShare >= 18 ? COLORS.warning : COLORS.other
                            }}>
                              {analysis.hamiltonianShare >= 25 ? 'HIGH' : 
                                analysis.hamiltonianShare >= 18 ? 'MEDIUM' : 'LOW'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: COLORS.textMuted }}>
                              Visible projects
                            </div>
                          </div>
                        </div>
                        
                        {/* Risk Level Banner */}
                        <div style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: riskColor + '22',
                          borderRadius: '8px',
                          border: `1px solid ${riskColor}`,
                          marginBottom: '1rem',
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '0.85rem', color: COLORS.textMuted }}>
                              Corruption Risk Level:
                            </span>
                            <span style={{ 
                              fontSize: '1rem', 
                              fontWeight: 700, 
                              color: riskColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              {riskLevel === 'PROVEN' ? '🔴' : riskLevel === 'HIGH' ? '🚨' : riskLevel === 'ELEVATED' ? '⚠️' : riskLevel === 'MODERATE' ? '📊' : '✅'}
                              {riskLevel === 'PROVEN' ? 'PROVEN FRAUD' : riskLevel}
                            </span>
                          </div>
                        </div>
                        
                        {/* The Principle */}
                        <div style={{
                          padding: '1rem',
                          backgroundColor: COLORS.bg + '88',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${COLORS.accent}`,
                        }}>
                          <p style={{ 
                            fontSize: '0.85rem', 
                            color: COLORS.text, 
                            margin: 0,
                            lineHeight: 1.6,
                            fontStyle: 'italic'
                          }}>
                            <strong style={{ color: COLORS.accent }}>The Productivity-Corruption Law:</strong>{' '}
                            Productive spending is self-auditing — a bridge either exists or it doesn't. 
                            When {nonHamiltonian}% of spending has no physical output, accountability weakens. 
                            {analysis.buildRate < 0.8 && (
                              <span style={{ color: COLORS.warning }}>
                                {' '}Low build rates create opportunity for waste and fraud.
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {/* Corruption Evidence - if exists */}
                        {analysis.corruptionEvidence && (
                          <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: COLORS.other + '22',
                            borderRadius: '8px',
                            border: `2px solid ${COLORS.other}`,
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.2rem' }}>🚨</span>
                              <strong style={{ color: COLORS.other, fontSize: '0.9rem' }}>
                                PROVEN CORRUPTION
                              </strong>
                            </div>
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: COLORS.text, 
                              margin: 0,
                              lineHeight: 1.5
                            }}>
                              {analysis.corruptionEvidence}
                            </p>
                          </div>
                        )}
                        
                        {/* Path to Victory - if exists */}
                        {analysis.pathToVictory && analysis.pathToVictory.length > 0 && (
                          <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: COLORS.hamiltonian + '15',
                            borderRadius: '8px',
                            border: `1px solid ${COLORS.hamiltonian}44`,
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              marginBottom: '0.75rem'
                            }}>
                              <span style={{ fontSize: '1.2rem' }}>🎯</span>
                              <strong style={{ color: COLORS.hamiltonian, fontSize: '0.9rem' }}>
                                PATH TO VICTORY (Accelerated)
                              </strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {analysis.pathToVictory.map((step, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: '0.75rem',
                                  fontSize: '0.8rem',
                                  color: COLORS.text,
                                }}>
                                  <span style={{ 
                                    color: COLORS.hamiltonian, 
                                    fontWeight: 700,
                                    minWidth: '20px'
                                  }}>
                                    {idx + 1}.
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )
          })()}
          </section>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* WHY WE BUILD - First Principles (Philosophy as conclusion) */}
        {/* ================================================================ */}
        <ScrollReveal delay={700}>
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
        </ScrollReveal>

        {/* ================================================================ */}
        {/* WIN CONDITION */}
        {/* ================================================================ */}
        <ScrollReveal delay={800}>
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
        </ScrollReveal>

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
  
  // Workforce Section
  workforceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  workforceCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  wfHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  wfIcon: {
    fontSize: '1.25rem',
  },
  wfLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  wfMetric: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  wfValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.hamiltonian,
  },
  wfTarget: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  wfNote: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  workforcePolicy: {
    backgroundColor: COLORS.bgCardAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  wfPolicyTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  wfPolicyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  wfPolicyItem: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  wfPolicyIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  workforceQuote: {
    textAlign: 'center' as const,
    fontSize: '0.9rem',
    fontStyle: 'italic',
    color: COLORS.hamiltonian,
    padding: '1rem',
    borderLeft: `3px solid ${COLORS.hamiltonian}`,
    backgroundColor: COLORS.bgCard,
    borderRadius: '0 8px 8px 0',
  },
  
  // National Capacity Section
  nationalCapacityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  capacityCard: {
    backgroundColor: COLORS.bgCard,
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  capHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  capCategory: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  capStatus: {
    fontSize: '0.6rem',
    fontWeight: 600,
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  capMetrics: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  capMetric: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  capLabel: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
  },
  capValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.text,
  },
  capDetail: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.4rem',
  },
  capRow: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  capRowLabel: {
    flexShrink: 0,
    width: '70px',
  },
  hamiltonianPrinciple: {
    backgroundColor: COLORS.bgCardAlt,
    border: `1px solid ${COLORS.accent}44`,
    borderRadius: '8px',
    padding: '1.25rem',
  },
  hpTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: COLORS.accent,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  hpContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  hpItem: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  hpIcon: {
    fontSize: '1rem',
    flexShrink: 0,
  },
  
  // Growth Initiatives
  initiativesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  initiativeColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  initiativeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.5rem',
    borderBottom: `2px solid ${COLORS.border}`,
    marginBottom: '0.5rem',
  },
  initiativeTimeframe: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: COLORS.gold,
    textTransform: 'uppercase' as const,
  },
  initiativeYears: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
  },
  initiativeCard: {
    display: 'flex',
    gap: '0.75rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '0.75rem',
  },
  initIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  initContent: {
    flex: 1,
    minWidth: 0,
  },
  initTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '0.35rem',
  },
  initStats: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.65rem',
    color: COLORS.hamiltonian,
    marginBottom: '0.35rem',
    flexWrap: 'wrap' as const,
  },
  initDesc: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  initiativeSummary: {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '8px',
    border: `1px solid ${COLORS.gold}44`,
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
  },
  summaryLabel: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
  },
  summaryValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.gold,
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
  
  // Calculation Breakdown
  calculationBreakdown: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  calcTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  calcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  calcItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  calcLabel: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
  },
  calcValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.hamiltonian,
  },
  calcExplain: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    lineHeight: 1.3,
  },
  calcNote: {
    fontSize: '0.6rem',
    color: COLORS.textDim,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    paddingTop: '0.5rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  
  // State Review Section
  stateReviewSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  stateReviewLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: COLORS.text,
  },
  stateReviewSelect: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.text,
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  stateReviewContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  stateMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  stateMetricCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stateMetricLabel: {
    fontSize: '0.65rem',
    color: COLORS.textDim,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  stateMetricValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.text,
  },
  stateMetricTarget: {
    fontSize: '0.65rem',
    color: COLORS.textMuted,
  },
  stateAdvantages: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  stateSubtitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '0.75rem',
  },
  advantagesList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  advantageTag: {
    fontSize: '0.75rem',
    padding: '0.4rem 0.75rem',
    backgroundColor: COLORS.hamiltonian + '33',
    color: COLORS.hamiltonian,
    borderRadius: '4px',
    border: `1px solid ${COLORS.hamiltonian}66`,
  },
  stateProjectsSection: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  projectsTable: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  projectRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 0.8fr',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
    fontSize: '0.8rem',
    alignItems: 'center',
  },
  projectName: {
    fontWeight: 600,
    color: COLORS.text,
  },
  projectCategory: {
    color: COLORS.textMuted,
    fontSize: '0.75rem',
  },
  projectStatus: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  projectInvestment: {
    fontWeight: 700,
    color: COLORS.hamiltonian,
    textAlign: 'right' as const,
  },
  stateGaps: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.warning}44`,
    borderRadius: '8px',
    padding: '1rem',
  },
  gapsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  gapItem: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
  },
  gapCategory: {
    fontWeight: 600,
    color: COLORS.warning,
    minWidth: '100px',
  },
  gapNeed: {
    color: COLORS.text,
    flex: 1,
  },
  gapCurrent: {
    color: COLORS.textMuted,
  },
  stateInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  stateInfoCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1rem',
  },
  stateInfoTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '0.5rem',
  },
  stateInfoText: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  workforceBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  stateAssessment: {
    backgroundColor: COLORS.bgCardAlt,
    border: `1px solid ${COLORS.accent}44`,
    borderRadius: '8px',
    padding: '1rem',
  },
  assessmentContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  assessmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    fontSize: '0.85rem',
  },
  assessmentLabel: {
    color: COLORS.textMuted,
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
