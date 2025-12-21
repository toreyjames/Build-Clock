'use client'

import { useState } from 'react'
import Link from 'next/link'

// ============================================================================
// COLORS & THEME
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
  usBlue: '#3b82f6',
  chinaRed: '#ef4444',
}

// ============================================================================
// US VS CHINA DATA - The Race
// ============================================================================
const RACE_METRICS = {
  semiconductors: {
    category: 'Semiconductors',
    icon: '🔬',
    metrics: [
      {
        name: 'Global Chip Production Share',
        us: { value: 12, unit: '%', trend: 'down' },
        china: { value: 18, unit: '%', trend: 'up' },
        target: { us: 20, label: 'CHIPS Act Target 2030' },
        source: 'SIA/BCG 2024',
        insight: 'US share has declined from 37% in 1990. China has grown from 3% to 18%.',
      },
      {
        name: 'Advanced Chips (<7nm)',
        us: { value: 0, unit: '%', trend: 'flat', note: 'Manufactured in Taiwan' },
        china: { value: 0, unit: '%', trend: 'up', note: 'SMIC 7nm breakthrough' },
        target: { us: 20, label: 'Intel/TSMC Arizona target' },
        source: 'IC Insights 2024',
        insight: 'Zero advanced chips made in US. Taiwan makes 92%. Strategic vulnerability.',
      },
      {
        name: 'Semiconductor Fabs Under Construction',
        us: { value: 14, unit: ' fabs', trend: 'up' },
        china: { value: 31, unit: ' fabs', trend: 'up' },
        target: { us: 25, label: 'Needed by 2030' },
        source: 'SEMI 2024',
        insight: 'China building 2x more fabs despite US CHIPS Act. Scale matters.',
      },
      {
        name: 'CHIPS Investment (Public + Private)',
        us: { value: 280, unit: 'B', trend: 'up', prefix: '$' },
        china: { value: 150, unit: 'B', trend: 'up', prefix: '$' },
        target: { us: 400, label: 'Full domestic supply chain' },
        source: 'SIA, CSET 2024',
        insight: 'US leading in announced investment. Execution is the challenge.',
      },
    ],
  },
  power: {
    category: 'Power & Energy',
    icon: '⚡',
    metrics: [
      {
        name: 'Data Center Power Capacity',
        us: { value: 35, unit: ' GW', trend: 'up' },
        china: { value: 28, unit: ' GW', trend: 'up' },
        target: { us: 100, label: 'AI demand by 2030' },
        source: 'IEA, McKinsey 2024',
        insight: 'AI demand will 3x power needs. Current grid cannot support.',
      },
      {
        name: 'Nuclear Capacity Under Construction',
        us: { value: 2.2, unit: ' GW', trend: 'flat' },
        china: { value: 26, unit: ' GW', trend: 'up' },
        target: { us: 20, label: 'SMR + restarts needed' },
        source: 'IAEA PRIS 2024',
        insight: 'China building 12x more nuclear than US. Clean baseload for AI.',
      },
      {
        name: 'Grid Transmission Investment',
        us: { value: 25, unit: 'B/yr', trend: 'flat', prefix: '$' },
        china: { value: 85, unit: 'B/yr', trend: 'up', prefix: '$' },
        target: { us: 75, label: 'DOE estimate needed' },
        source: 'BloombergNEF 2024',
        insight: 'China investing 3.4x more in grid. Transmission is the bottleneck.',
      },
      {
        name: 'Clean Energy Investment (Annual)',
        us: { value: 303, unit: 'B', trend: 'up', prefix: '$' },
        china: { value: 676, unit: 'B', trend: 'up', prefix: '$' },
        target: { us: 500, label: 'IRA trajectory' },
        source: 'BloombergNEF 2024',
        insight: 'China outspending US 2:1 on clean energy. IRA closing gap.',
      },
    ],
  },
  ai: {
    category: 'AI & Data Centers',
    icon: '🧠',
    metrics: [
      {
        name: 'AI Research Papers (Top Conferences)',
        us: { value: 28, unit: '%', trend: 'down' },
        china: { value: 26, unit: '%', trend: 'up' },
        target: { us: 35, label: 'Maintain leadership' },
        source: 'Stanford AI Index 2024',
        insight: 'Gap closing fast. China catching up in research output.',
      },
      {
        name: 'AI Companies',
        us: { value: 5509, unit: '', trend: 'up' },
        china: { value: 1446, unit: '', trend: 'up' },
        target: { us: 7000, label: 'Ecosystem growth' },
        source: 'Stanford AI Index 2024',
        insight: 'US leads in AI companies. Ecosystem advantage.',
      },
      {
        name: 'Private AI Investment (2023)',
        us: { value: 67, unit: 'B', trend: 'up', prefix: '$' },
        china: { value: 8, unit: 'B', trend: 'down', prefix: '$' },
        target: { us: 100, label: 'Maintain lead' },
        source: 'Stanford AI Index 2024',
        insight: 'US dominates private AI investment. 8x China.',
      },
      {
        name: 'GPU Access (H100 Equivalent)',
        us: { value: 85, unit: '%', trend: 'up', note: 'of global supply' },
        china: { value: 10, unit: '%', trend: 'down', note: 'Export controls' },
        target: { us: 90, label: 'Maintain compute lead' },
        source: 'SemiAnalysis 2024',
        insight: 'Export controls working. China GPU-constrained.',
      },
    ],
  },
  criticalMinerals: {
    category: 'Critical Minerals',
    icon: '🧲',
    metrics: [
      {
        name: 'Rare Earth Processing',
        us: { value: 0, unit: '%', trend: 'flat', note: 'MP Materials ramping' },
        china: { value: 90, unit: '%', trend: 'flat' },
        target: { us: 20, label: 'Minimum for security' },
        source: 'USGS 2024',
        insight: 'Total China dependency. Single point of failure.',
      },
      {
        name: 'Lithium Refining',
        us: { value: 1, unit: '%', trend: 'up' },
        china: { value: 65, unit: '%', trend: 'flat' },
        target: { us: 15, label: 'IRA incentives' },
        source: 'BloombergNEF 2024',
        insight: 'Even with domestic lithium, refining in China.',
      },
      {
        name: 'Cobalt Refining',
        us: { value: 0, unit: '%', trend: 'flat' },
        china: { value: 73, unit: '%', trend: 'flat' },
        target: { us: 10, label: 'Defense minimum' },
        source: 'USGS 2024',
        insight: 'Zero domestic cobalt refining. Battery supply chain risk.',
      },
      {
        name: 'Gallium/Germanium (Chip Materials)',
        us: { value: 0, unit: '%', trend: 'flat' },
        china: { value: 98, unit: '%', trend: 'flat' },
        target: { us: 25, label: 'Security requirement' },
        source: 'USGS 2024',
        insight: 'China controls chip materials. Export restrictions active.',
      },
    ],
  },
  workforce: {
    category: 'Workforce & Talent',
    icon: '👷',
    metrics: [
      {
        name: 'STEM PhD Graduates (Annual)',
        us: { value: 45000, unit: '', trend: 'flat' },
        china: { value: 80000, unit: '', trend: 'up' },
        target: { us: 60000, label: 'Needed for pipeline' },
        source: 'NSF 2024',
        insight: 'China graduates 1.8x more STEM PhDs annually.',
      },
      {
        name: 'AI/ML Talent Pool',
        us: { value: 28, unit: '%', trend: 'flat', note: 'of global' },
        china: { value: 18, unit: '%', trend: 'up', note: 'of global' },
        target: { us: 35, label: 'Immigration + training' },
        source: 'LinkedIn Economic Graph 2024',
        insight: 'US leads but talent gap closing. Immigration critical.',
      },
      {
        name: 'Skilled Trades Gap',
        us: { value: 500000, unit: '', trend: 'up', note: 'unfilled jobs' },
        china: { value: 0, unit: '', trend: 'flat', note: 'surplus' },
        target: { us: 100000, label: 'Acceptable gap' },
        source: 'DOL, AGC 2024',
        insight: '500K unfilled skilled trades jobs. Bottleneck for construction.',
      },
      {
        name: 'Manufacturing Labor Cost ($/hr)',
        us: { value: 30, unit: '', trend: 'up', prefix: '$' },
        china: { value: 8, unit: '', trend: 'up', prefix: '$' },
        target: { us: 30, label: 'Offset with automation' },
        source: 'BLS, Euromonitor 2024',
        insight: '3.75x labor cost gap. Automation is the answer.',
      },
    ],
  },
}

// ============================================================================
// TIMELINE DATA
// ============================================================================
const TIMELINE_SCENARIOS = {
  currentPace: {
    label: 'Current Pace',
    color: COLORS.danger,
    description: 'Business as usual. No acceleration.',
    milestones: [
      { year: 2025, event: 'First CHIPS Act fabs online' },
      { year: 2028, event: 'US chip share: 15%' },
      { year: 2032, event: 'Grid capacity: 1.5 TW' },
      { year: 2040, event: 'US chip share: 18%' },
      { year: 2045, event: 'Full AI infrastructure' },
    ],
    chinaLead: 2028,
  },
  accelerated: {
    label: 'Accelerated',
    color: COLORS.warning,
    description: 'All announced projects execute on time.',
    milestones: [
      { year: 2025, event: 'First CHIPS Act fabs online' },
      { year: 2027, event: 'US chip share: 16%' },
      { year: 2030, event: 'US chip share: 20%' },
      { year: 2032, event: 'Grid capacity: 1.8 TW' },
      { year: 2035, event: 'Full AI infrastructure' },
    ],
    chinaLead: 2033,
  },
  warFooting: {
    label: 'War Footing',
    color: COLORS.accent,
    description: 'Manhattan Project urgency. All barriers removed.',
    milestones: [
      { year: 2025, event: 'Emergency permitting reform' },
      { year: 2026, event: 'First SMRs online' },
      { year: 2028, event: 'US chip share: 20%' },
      { year: 2030, event: 'Grid capacity: 2.0 TW' },
      { year: 2032, event: 'Full AI infrastructure' },
    ],
    chinaLead: 'Never',
  },
}

// ============================================================================
// POLICY RECOMMENDATIONS
// ============================================================================
const POLICY_RECOMMENDATIONS = [
  {
    id: 'nepa-reform',
    title: 'NEPA Reform for Grid Infrastructure',
    category: 'Permitting',
    impact: 'Critical',
    impactColor: COLORS.danger,
    currentState: 'Grid interconnection queue: 2,600 GW waiting, 5+ year delays',
    recommendation: 'Categorical exclusions for transmission upgrades, 2-year max review',
    benefit: 'Unlocks $200B+ grid investment, reduces permitting from 5 years to 2',
    who: 'Congress, CEQ',
    bill: 'Permitting Reform Act provisions',
  },
  {
    id: 'nrc-reform',
    title: 'NRC Licensing for Advanced Reactors',
    category: 'Nuclear',
    impact: 'Critical',
    impactColor: COLORS.danger,
    currentState: 'SMR licensing: 4-7 years, $500M+ in regulatory costs',
    recommendation: 'Risk-informed licensing, standardized designs, 2-year approval path',
    benefit: 'Enables 50+ SMR deployments by 2035, clean baseload for AI data centers',
    who: 'NRC, Congress',
    bill: 'ADVANCE Act (passed), implementation needed',
  },
  {
    id: 'immigration',
    title: 'STEM Immigration Fast-Track',
    category: 'Talent',
    impact: 'High',
    impactColor: COLORS.warning,
    currentState: 'H-1B cap: 85K/year. Green card backlog: 1M+. PhD graduates leaving.',
    recommendation: 'Uncapped visas for STEM PhDs, staple green card to diploma',
    benefit: 'Retain 50K+ STEM PhDs annually, fill AI talent gap',
    who: 'Congress, DHS',
    bill: 'Various immigration bills stalled',
  },
  {
    id: 'dpa-chips',
    title: 'Defense Production Act for Chip Equipment',
    category: 'Semiconductors',
    impact: 'High',
    impactColor: COLORS.warning,
    currentState: 'ASML, LAM, AMAT equipment: 18-24 month lead times',
    recommendation: 'DPA priority ratings for domestic fab equipment orders',
    benefit: 'Accelerates fab timelines by 6-12 months, prioritizes US facilities',
    who: 'DOD, Commerce',
    bill: 'Executive action available',
  },
  {
    id: 'critical-minerals',
    title: 'Critical Minerals Stockpile + Fast-Track Permits',
    category: 'Supply Chain',
    impact: 'High',
    impactColor: COLORS.warning,
    currentState: '90%+ rare earth dependency on China. No strategic stockpile.',
    recommendation: '5-year strategic stockpile, fast-track mining permits on federal land',
    benefit: 'Reduces China leverage, enables domestic EV/chip supply chain',
    who: 'DOI, DOD, Congress',
    bill: 'Critical Minerals Security Act',
  },
  {
    id: 'workforce',
    title: 'Skilled Trades Apprenticeship Tax Credit',
    category: 'Workforce',
    impact: 'Medium',
    impactColor: COLORS.blue,
    currentState: '500K unfilled skilled trades jobs. Construction bottleneck.',
    recommendation: '$10K tax credit per apprentice, community college partnerships',
    benefit: 'Train 200K+ electricians, welders, technicians over 5 years',
    who: 'Congress, DOL',
    bill: 'Bipartisan apprenticeship bills exist',
  },
]

// ============================================================================
// PORTFOLIO COMPANY MAPPING
// ============================================================================
const PORTFOLIO_COMPANIES = {
  lonsdale8VC: {
    name: '8VC / Lonsdale Portfolio',
    companies: [
      {
        name: 'Anduril Industries',
        sector: 'Defense Tech',
        needs: ['Edge compute', 'AI chips', 'Power for manufacturing'],
        bottlenecks: ['Chip supply', 'Cleared workforce'],
        icon: '🛡️',
      },
      {
        name: 'Palantir',
        sector: 'AI/Data',
        needs: ['Data center capacity', 'Cloud infrastructure', 'GPU access'],
        bottlenecks: ['Power for data centers', 'Chip supply'],
        icon: '📊',
      },
      {
        name: 'Epirus',
        sector: 'Defense Tech',
        needs: ['Power electronics', 'Advanced manufacturing'],
        bottlenecks: ['Rare earth magnets', 'Skilled workforce'],
        icon: '⚡',
      },
      {
        name: 'Joby Aviation',
        sector: 'eVTOL',
        needs: ['Battery cells', 'Power electronics', 'Manufacturing capacity'],
        bottlenecks: ['Battery supply chain', 'FAA certification'],
        icon: '🚁',
      },
    ],
  },
  broader: {
    name: 'Broader Defense Tech Ecosystem',
    companies: [
      {
        name: 'Shield AI',
        sector: 'Defense AI',
        needs: ['Edge AI chips', 'GPU compute', 'Manufacturing'],
        bottlenecks: ['Chip supply', 'Cleared workforce'],
        icon: '🤖',
      },
      {
        name: 'SpaceX',
        sector: 'Space/Defense',
        needs: ['Starlink manufacturing', 'Launch infrastructure', 'Power'],
        bottlenecks: ['Chip supply', 'Manufacturing capacity'],
        icon: '🚀',
      },
      {
        name: 'Tesla',
        sector: 'EV/Energy',
        needs: ['Battery cells', 'Chips', 'Grid infrastructure'],
        bottlenecks: ['Lithium supply', 'Grid connection'],
        icon: '🔋',
      },
    ],
  },
}

// ============================================================================
// BOTTLENECK ANALYSIS
// ============================================================================
const BOTTLENECKS = [
  {
    id: 'transformers',
    name: 'Large Power Transformers',
    severity: 'Critical',
    severityColor: COLORS.danger,
    icon: '🔧',
    problem: '2-3 year lead times. Only 2 US manufacturers. Each data center needs multiple.',
    marketSize: '$5B',
    investmentNeeded: '$2-3B for domestic manufacturing capacity',
    companies: ['Hitachi Energy', 'Siemens', 'ABB'],
    opportunity: 'Build domestic transformer manufacturing. Guaranteed demand from data centers.',
    affectedSectors: ['AI Data Centers', 'Grid', 'Nuclear'],
    whoCaresInPortfolio: ['Palantir (data centers)', 'All AI companies'],
  },
  {
    id: 'upw',
    name: 'Ultra-Pure Water Systems',
    severity: 'High',
    severityColor: COLORS.warning,
    icon: '💧',
    problem: 'Every semiconductor fab needs UPW. Limited domestic capacity for fab-scale systems.',
    marketSize: '$3B',
    investmentNeeded: '$500M-1B for domestic capacity',
    companies: ['Veolia', 'Evoqua (Xylem)', 'Pall'],
    opportunity: 'Build UPW treatment facilities near fab clusters (AZ, TX, OH).',
    affectedSectors: ['Semiconductors'],
    whoCaresInPortfolio: ['All chip-dependent companies'],
  },
  {
    id: 'chips-equipment',
    name: 'Semiconductor Equipment',
    severity: 'Critical',
    severityColor: COLORS.danger,
    icon: '🔬',
    problem: 'ASML (lithography), LAM, AMAT have 18-24 month lead times. Bottleneck for all fabs.',
    marketSize: '$100B+',
    investmentNeeded: 'DPA priority + domestic equipment investment',
    companies: ['ASML', 'LAM Research', 'Applied Materials', 'KLA'],
    opportunity: 'DPA priority ratings. Invest in domestic equipment manufacturing.',
    affectedSectors: ['Semiconductors'],
    whoCaresInPortfolio: ['All AI/chip companies'],
  },
  {
    id: 'rare-earths',
    name: 'Rare Earth Processing',
    severity: 'Critical',
    severityColor: COLORS.danger,
    icon: '🧲',
    problem: '90% China dependency. Single point of failure for chips, EVs, defense.',
    marketSize: '$10B',
    investmentNeeded: '$5B for full domestic processing',
    companies: ['MP Materials', 'Lynas', 'USA Rare Earth'],
    opportunity: 'Build rare earth separation and processing. Defense demand guaranteed.',
    affectedSectors: ['Semiconductors', 'EV/Battery', 'Defense'],
    whoCaresInPortfolio: ['Anduril', 'Joby', 'All defense tech'],
  },
  {
    id: 'grid-interconnection',
    name: 'Grid Interconnection Queue',
    severity: 'Critical',
    severityColor: COLORS.danger,
    icon: '🔌',
    problem: '2,600 GW waiting in queue. 5+ year delays. Blocking all new generation.',
    marketSize: '$200B+',
    investmentNeeded: 'Regulatory reform (no $, just policy)',
    companies: ['Utilities', 'ISOs/RTOs', 'FERC'],
    opportunity: 'FERC Order 2023 implementation. State-level permitting reform.',
    affectedSectors: ['All - this blocks everything'],
    whoCaresInPortfolio: ['Everyone - data centers, factories, all infrastructure'],
  },
  {
    id: 'skilled-trades',
    name: 'Skilled Trades Workforce',
    severity: 'High',
    severityColor: COLORS.warning,
    icon: '👷',
    problem: '500K unfilled jobs. Electricians, welders, technicians. Blocking construction.',
    marketSize: 'N/A',
    investmentNeeded: '$10B over 5 years for training',
    companies: ['Community colleges', 'Trade unions', 'Corporate training'],
    opportunity: 'Apprenticeship programs. Immigration for skilled trades.',
    affectedSectors: ['All construction-dependent sectors'],
    whoCaresInPortfolio: ['All companies building physical infrastructure'],
  },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<'currentPace' | 'accelerated' | 'warFooting'>('currentPace')

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <Link href="/" style={styles.backLink}>← Build Clock</Link>
            <h1 style={styles.title}>
              <span style={{ color: COLORS.usBlue }}>US</span>
              <span style={{ color: COLORS.textMuted }}> vs </span>
              <span style={{ color: COLORS.chinaRed }}>China</span>
              <span style={{ color: COLORS.text }}> AI Race</span>
            </h1>
            <p style={styles.subtitle}>
              Real-time comparison of AI infrastructure buildout. Who's winning?
            </p>
          </div>
          <div style={styles.headerMeta}>
            <div style={styles.lastUpdated}>Last Updated: December 2024</div>
          </div>
        </header>

        {/* Executive Summary */}
        <section style={styles.execSummary}>
          <h2 style={styles.execTitle}>Executive Summary</h2>
          <div style={styles.execGrid}>
            <div style={styles.execCard}>
              <div style={styles.execIcon}>🏆</div>
              <div style={styles.execLabel}>Current Leader</div>
              <div style={{ ...styles.execValue, color: COLORS.usBlue }}>US</div>
              <div style={styles.execNote}>In AI models, investment, talent</div>
            </div>
            <div style={styles.execCard}>
              <div style={styles.execIcon}>⚠️</div>
              <div style={styles.execLabel}>At Risk</div>
              <div style={{ ...styles.execValue, color: COLORS.warning }}>2028</div>
              <div style={styles.execNote}>If current pace continues</div>
            </div>
            <div style={styles.execCard}>
              <div style={styles.execIcon}>🎯</div>
              <div style={styles.execLabel}>Key Bottleneck</div>
              <div style={{ ...styles.execValue, color: COLORS.danger }}>Power</div>
              <div style={styles.execNote}>Grid & nuclear capacity</div>
            </div>
            <div style={styles.execCard}>
              <div style={styles.execIcon}>💰</div>
              <div style={styles.execLabel}>Investment Gap</div>
              <div style={{ ...styles.execValue, color: COLORS.warning }}>$268B</div>
              <div style={styles.execNote}>To close infrastructure gap</div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div style={styles.categoryFilter}>
          <button
            style={selectedCategory === null ? styles.categoryButtonActive : styles.categoryButton}
            onClick={() => setSelectedCategory(null)}
          >
            All Sectors
          </button>
          {Object.entries(RACE_METRICS).map(([key, data]) => (
            <button
              key={key}
              style={selectedCategory === key ? styles.categoryButtonActive : styles.categoryButton}
              onClick={() => setSelectedCategory(key)}
            >
              {data.icon} {data.category}
            </button>
          ))}
        </div>

        {/* Race Metrics */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>The Metrics</h2>
          <p style={styles.sectionSubtitle}>
            Side-by-side comparison. Red = China leading. Blue = US leading.
          </p>
          
          {Object.entries(RACE_METRICS)
            .filter(([key]) => selectedCategory === null || selectedCategory === key)
            .map(([key, category]) => (
              <div key={key} style={styles.categorySection}>
                <div style={styles.categoryHeader}>
                  <span style={styles.categoryIcon}>{category.icon}</span>
                  <h3 style={styles.categoryTitle}>{category.category}</h3>
                </div>
                
                <div style={styles.metricsGrid}>
                  {category.metrics.map((metric, idx) => {
                    const usValue = typeof metric.us.value === 'number' ? metric.us.value : 0
                    const chinaValue = typeof metric.china.value === 'number' ? metric.china.value : 0
                    const usLeading = usValue > chinaValue
                    const maxValue = Math.max(usValue, chinaValue, metric.target?.us || 0) * 1.2
                    
                    return (
                      <div key={idx} style={styles.metricCard}>
                        <div style={styles.metricName}>{metric.name}</div>
                        
                        <div style={styles.comparisonBars}>
                          {/* US Bar */}
                          <div style={styles.barRow}>
                            <div style={styles.barLabel}>
                              <span style={{ color: COLORS.usBlue }}>US</span>
                            </div>
                            <div style={styles.barContainer}>
                              <div 
                                style={{ 
                                  ...styles.bar, 
                                  width: `${(usValue / maxValue) * 100}%`,
                                  backgroundColor: COLORS.usBlue,
                                }} 
                              />
                              {metric.target && (
                                <div 
                                  style={{ 
                                    ...styles.targetLine,
                                    left: `${(metric.target.us / maxValue) * 100}%`,
                                  }} 
                                />
                              )}
                            </div>
                            <div style={styles.barValue}>
                              {'prefix' in metric.us ? metric.us.prefix : ''}{metric.us.value}{metric.us.unit}
                            </div>
                          </div>
                          
                          {/* China Bar */}
                          <div style={styles.barRow}>
                            <div style={styles.barLabel}>
                              <span style={{ color: COLORS.chinaRed }}>CN</span>
                            </div>
                            <div style={styles.barContainer}>
                              <div 
                                style={{ 
                                  ...styles.bar, 
                                  width: `${(chinaValue / maxValue) * 100}%`,
                                  backgroundColor: COLORS.chinaRed,
                                }} 
                              />
                            </div>
                            <div style={styles.barValue}>
                              {'prefix' in metric.china ? metric.china.prefix : ''}{metric.china.value}{metric.china.unit}
                            </div>
                          </div>
                        </div>
                        
                        {metric.target && (
                          <div style={styles.targetNote}>
                            Target: {metric.target.us}{metric.us.unit} ({metric.target.label})
                          </div>
                        )}
                        
                        <div style={styles.metricInsight}>{metric.insight}</div>
                        <div style={styles.metricSource}>Source: {metric.source}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
        </section>

        {/* Timeline Scenarios */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Timeline Scenarios</h2>
          <p style={styles.sectionSubtitle}>
            When do we achieve AI infrastructure parity? Depends on policy.
          </p>
          
          <div style={styles.scenarioButtons}>
            {Object.entries(TIMELINE_SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                style={selectedScenario === key ? { ...styles.scenarioButton, borderColor: scenario.color, color: scenario.color } : styles.scenarioButton}
                onClick={() => setSelectedScenario(key as 'currentPace' | 'accelerated' | 'warFooting')}
              >
                {scenario.label}
              </button>
            ))}
          </div>
          
          <div style={styles.scenarioDetail}>
            <div style={{ 
              ...styles.scenarioHeader, 
              borderLeftColor: TIMELINE_SCENARIOS[selectedScenario].color 
            }}>
              <div style={styles.scenarioTitle}>{TIMELINE_SCENARIOS[selectedScenario].label}</div>
              <div style={styles.scenarioDesc}>{TIMELINE_SCENARIOS[selectedScenario].description}</div>
            </div>
            
            <div style={styles.timeline}>
              {TIMELINE_SCENARIOS[selectedScenario].milestones.map((milestone, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={{ 
                    ...styles.timelineYear, 
                    color: TIMELINE_SCENARIOS[selectedScenario].color 
                  }}>
                    {milestone.year}
                  </div>
                  <div style={styles.timelineDot} />
                  <div style={styles.timelineEvent}>{milestone.event}</div>
                </div>
              ))}
            </div>
            
            <div style={styles.scenarioOutcome}>
              <strong>China takes sustained lead:</strong>{' '}
              <span style={{ 
                color: TIMELINE_SCENARIOS[selectedScenario].chinaLead === 'Never' 
                  ? COLORS.accent 
                  : COLORS.danger 
              }}>
                {TIMELINE_SCENARIOS[selectedScenario].chinaLead === 'Never' 
                  ? 'Never (US maintains lead)' 
                  : TIMELINE_SCENARIOS[selectedScenario].chinaLead}
              </span>
            </div>
          </div>
        </section>

        {/* Bottleneck Analysis */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Bottleneck Analysis</h2>
          <p style={styles.sectionSubtitle}>
            The chokepoints. What's blocking us? Where should capital flow?
          </p>
          
          <div style={styles.bottleneckGrid}>
            {BOTTLENECKS.map((bottleneck) => (
              <div key={bottleneck.id} style={styles.bottleneckCard}>
                <div style={styles.bottleneckHeader}>
                  <span style={styles.bottleneckIcon}>{bottleneck.icon}</span>
                  <div>
                    <div style={styles.bottleneckName}>{bottleneck.name}</div>
                    <div style={{ 
                      ...styles.bottleneckSeverity, 
                      color: bottleneck.severityColor 
                    }}>
                      {bottleneck.severity} Bottleneck
                    </div>
                  </div>
                </div>
                
                <div style={styles.bottleneckProblem}>
                  <strong>Problem:</strong> {bottleneck.problem}
                </div>
                
                <div style={styles.bottleneckDetails}>
                  <div style={styles.bottleneckDetail}>
                    <span style={styles.bottleneckDetailLabel}>Market Size:</span>
                    <span style={styles.bottleneckDetailValue}>{bottleneck.marketSize}</span>
                  </div>
                  <div style={styles.bottleneckDetail}>
                    <span style={styles.bottleneckDetailLabel}>Investment Needed:</span>
                    <span style={styles.bottleneckDetailValue}>{bottleneck.investmentNeeded}</span>
                  </div>
                </div>
                
                <div style={styles.bottleneckOpportunity}>
                  <strong>Opportunity:</strong> {bottleneck.opportunity}
                </div>
                
                <div style={styles.bottleneckAffects}>
                  <strong>Affects:</strong> {bottleneck.affectedSectors.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Policy Recommendations */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Policy Recommendations</h2>
          <p style={styles.sectionSubtitle}>
            The 6 policy changes that would accelerate AI Manhattan. Use this to lobby.
          </p>
          
          <div style={styles.policyGrid}>
            {POLICY_RECOMMENDATIONS.map((policy) => (
              <div key={policy.id} style={styles.policyCard}>
                <div style={styles.policyHeader}>
                  <div style={styles.policyTitle}>{policy.title}</div>
                  <div style={{ 
                    ...styles.policyImpact, 
                    backgroundColor: policy.impactColor + '22',
                    color: policy.impactColor,
                  }}>
                    {policy.impact}
                  </div>
                </div>
                
                <div style={styles.policyCategory}>{policy.category}</div>
                
                <div style={styles.policySection}>
                  <div style={styles.policySectionLabel}>Current State:</div>
                  <div style={styles.policySectionContent}>{policy.currentState}</div>
                </div>
                
                <div style={styles.policySection}>
                  <div style={styles.policySectionLabel}>Recommendation:</div>
                  <div style={{ ...styles.policySectionContent, color: COLORS.accent }}>
                    {policy.recommendation}
                  </div>
                </div>
                
                <div style={styles.policySection}>
                  <div style={styles.policySectionLabel}>Benefit:</div>
                  <div style={styles.policySectionContent}>{policy.benefit}</div>
                </div>
                
                <div style={styles.policyMeta}>
                  <span><strong>Who:</strong> {policy.who}</span>
                  {policy.bill && <span><strong>Vehicle:</strong> {policy.bill}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio Company Mapping */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Defense Tech Portfolio Mapping</h2>
          <p style={styles.sectionSubtitle}>
            How this infrastructure affects 8VC portfolio and the defense tech ecosystem.
          </p>
          
          {Object.entries(PORTFOLIO_COMPANIES).map(([key, portfolio]) => (
            <div key={key} style={styles.portfolioSection}>
              <h3 style={styles.portfolioTitle}>{portfolio.name}</h3>
              <div style={styles.portfolioGrid}>
                {portfolio.companies.map((company, idx) => (
                  <div key={idx} style={styles.companyCard}>
                    <div style={styles.companyHeader}>
                      <span style={styles.companyIcon}>{company.icon}</span>
                      <div>
                        <div style={styles.companyName}>{company.name}</div>
                        <div style={styles.companySector}>{company.sector}</div>
                      </div>
                    </div>
                    
                    <div style={styles.companySection}>
                      <div style={styles.companySectionLabel}>Infrastructure Needs:</div>
                      <div style={styles.companyTags}>
                        {company.needs.map((need, i) => (
                          <span key={i} style={styles.companyTag}>{need}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div style={styles.companySection}>
                      <div style={styles.companySectionLabel}>Current Bottlenecks:</div>
                      <div style={styles.companyTags}>
                        {company.bottlenecks.map((bottleneck, i) => (
                          <span key={i} style={{ ...styles.companyTag, borderColor: COLORS.danger, color: COLORS.danger }}>
                            {bottleneck}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>The Choice</h2>
            <p style={styles.ctaText}>
              At current pace, China takes the lead by 2028. With accelerated execution, we maintain parity through 2033. 
              With wartime urgency, we never fall behind.
            </p>
            <p style={styles.ctaText}>
              The infrastructure gap is $268B. The policy changes are known. The bottlenecks are identified.
              The only question is: <strong style={{ color: COLORS.accent }}>How fast do we want to win?</strong>
            </p>
            <div style={styles.ctaButtons}>
              <Link href="/" style={styles.ctaButton}>
                ← Back to Build Clock
              </Link>
              <Link href="/heart" style={{ ...styles.ctaButton, backgroundColor: COLORS.danger }}>
                The Heart: Why This Matters →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • US vs China AI Race</span>
            <span style={styles.footerDivider}>•</span>
            <span>Sources: SIA, IAEA, BloombergNEF, Stanford AI Index, USGS</span>
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 2.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  backLink: {
    color: COLORS.textMuted,
    textDecoration: 'none',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    display: 'block',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  headerMeta: {},
  lastUpdated: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
  },
  
  // Executive Summary
  execSummary: {
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  execTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  execGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  execCard: {
    textAlign: 'center' as const,
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  execIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  execLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  execValue: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  execNote: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
  },
  
  // Category Filter
  categoryFilter: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    marginBottom: '2rem',
  },
  categoryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.textMuted,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryButtonActive: {
    padding: '0.5rem 1rem',
    backgroundColor: COLORS.accent + '22',
    border: `1px solid ${COLORS.accent}`,
    borderRadius: '6px',
    color: COLORS.accent,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  
  // Sections
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  sectionSubtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginBottom: '2rem',
  },
  
  // Category Section
  categorySection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  categoryIcon: {
    fontSize: '1.5rem',
  },
  categoryTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
  },
  
  // Metrics Grid
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  metricCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  metricName: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  comparisonBars: {
    marginBottom: '1rem',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  barLabel: {
    width: '30px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  barContainer: {
    flex: 1,
    height: '20px',
    backgroundColor: COLORS.bgCard,
    borderRadius: '4px',
    position: 'relative' as const,
    overflow: 'visible',
  },
  bar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  targetLine: {
    position: 'absolute' as const,
    top: '-4px',
    width: '2px',
    height: '28px',
    backgroundColor: COLORS.accent,
  },
  barValue: {
    width: '80px',
    fontSize: '0.9rem',
    fontWeight: 700,
    textAlign: 'right' as const,
  },
  targetNote: {
    fontSize: '0.75rem',
    color: COLORS.accent,
    marginBottom: '0.75rem',
  },
  metricInsight: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '4px',
  },
  metricSource: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  
  // Timeline
  scenarioButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  scenarioButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `2px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textMuted,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  scenarioDetail: {
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  scenarioHeader: {
    marginBottom: '2rem',
    paddingLeft: '1rem',
    borderLeft: '4px solid',
  },
  scenarioTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  scenarioDesc: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '2rem',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  timelineYear: {
    width: '60px',
    fontSize: '1rem',
    fontWeight: 700,
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: COLORS.border,
  },
  timelineEvent: {
    flex: 1,
    fontSize: '0.9rem',
    color: COLORS.textMuted,
  },
  scenarioOutcome: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '1rem',
  },
  
  // Bottlenecks
  bottleneckGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  bottleneckCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  bottleneckHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  bottleneckIcon: {
    fontSize: '2rem',
  },
  bottleneckName: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  bottleneckSeverity: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  bottleneckProblem: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
  },
  bottleneckDetails: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  bottleneckDetail: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  bottleneckDetailLabel: {
    color: COLORS.textMuted,
    display: 'block',
    marginBottom: '0.25rem',
  },
  bottleneckDetailValue: {
    color: COLORS.accent,
    fontWeight: 600,
  },
  bottleneckOpportunity: {
    fontSize: '0.85rem',
    color: COLORS.text,
    lineHeight: 1.5,
    marginBottom: '0.75rem',
  },
  bottleneckAffects: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
  },
  
  // Policy
  policyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  policyCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  policyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  policyTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    flex: 1,
  },
  policyImpact: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  policyCategory: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  policySection: {
    marginBottom: '0.75rem',
  },
  policySectionLabel: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginBottom: '0.25rem',
  },
  policySectionContent: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  policyMeta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    fontSize: '0.75rem',
    color: COLORS.textDim,
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  
  // Portfolio
  portfolioSection: {
    marginBottom: '2rem',
  },
  portfolioTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: COLORS.purple,
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  companyCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  companyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  companyIcon: {
    fontSize: '1.5rem',
  },
  companyName: {
    fontSize: '1rem',
    fontWeight: 700,
  },
  companySector: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  companySection: {
    marginBottom: '0.75rem',
  },
  companySectionLabel: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
    marginBottom: '0.5rem',
  },
  companyTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem',
  },
  companyTag: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
  },
  
  // CTA
  ctaSection: {
    padding: '3rem',
    backgroundColor: COLORS.bgCard,
    border: `2px solid ${COLORS.accent}50`,
    borderRadius: '16px',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '1.5rem',
    color: COLORS.accent,
  },
  ctaText: {
    fontSize: '1.1rem',
    color: COLORS.textMuted,
    lineHeight: 1.7,
    marginBottom: '1rem',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  ctaButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  
  // Footer
  footer: {
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: '1.5rem',
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

