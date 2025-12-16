'use client'

import { useState } from 'react'
import Link from 'next/link'

// ============================================================================
// COLORS & THEME (matching Build Clock)
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
// AI OPPORTUNITY DATA
// ============================================================================

interface AIUseCase {
  id: string
  name: string
  description: string
  valueChainStage: string
  laborImpact: string
  roi: string
  sflPositioning: string
  examples: string[]
}

interface SectorAIOpportunities {
  sectorId: string
  sectorName: string
  icon: string
  color: string
  valueChain: string[]
  aiUseCases: AIUseCase[]
  strategicRationale: string
  sflServices: string[]
}

const AI_OPPORTUNITIES: SectorAIOpportunities[] = [
  {
    sectorId: 'rare-earths',
    sectorName: 'Rare Earths',
    icon: '🧲',
    color: COLORS.warning,
    valueChain: ['Mining', 'Separation', 'Refining', 'Metal/Alloy', 'Magnet Manufacturing'],
    aiUseCases: [
      {
        id: 'separation-optimization',
        name: 'Solvent Extraction Optimization',
        description: 'AI optimizes extraction parameters (temperature, pH, flow rates) to maximize rare earth yield and minimize waste in separation processes.',
        valueChainStage: 'Separation',
        laborImpact: 'Reduces need for manual process monitoring and adjustment (typically 20-30 operators per facility)',
        roi: '15-25% yield improvement, 20-30% waste reduction, payback: 12-18 months',
        sflPositioning: 'AI-powered process optimization for chemical separation — core to competitive advantage in rare earth processing',
        examples: [
          'MP Materials separation facility expansion',
          'Lynas separation facility (Texas)',
          'Future rare earth refining facilities',
        ],
      },
      {
        id: 'batch-processing',
        name: 'Batch Process Optimization',
        description: 'AI predicts optimal batch conditions, reduces cycle time, and improves quality consistency in refining processes.',
        valueChainStage: 'Refining',
        laborImpact: 'Reduces batch monitoring labor (typically 15-25 operators per facility)',
        roi: '10-20% cycle time reduction, 15-25% quality improvement, payback: 12-24 months',
        sflPositioning: 'AI for batch process optimization — enables competitive costs despite higher U.S. labor rates',
        examples: [
          'Rare earth oxide refining facilities',
          'Metal/alloy production facilities',
        ],
      },
      {
        id: 'quality-inspection',
        name: 'Automated Quality Inspection',
        description: 'AI vision systems for automated inspection of magnet quality, replacing manual inspection processes.',
        valueChainStage: 'Magnet Manufacturing',
        laborImpact: 'Replaces 50-100 manual inspectors per facility',
        roi: '30-40% inspection cost reduction, 20-30% defect rate reduction, payback: 6-12 months',
        sflPositioning: 'AI vision for precision manufacturing — critical for competing with China\'s low-cost manual inspection',
        examples: [
          'Future rare earth magnet manufacturing facilities',
          'EV motor magnet production',
        ],
      },
      {
        id: 'predictive-maintenance',
        name: 'Predictive Maintenance',
        description: 'AI predicts equipment failures (furnaces, pumps, reactors) before they happen, reducing downtime and maintenance costs.',
        valueChainStage: 'All Stages',
        laborImpact: 'Reduces maintenance labor (typically 10-20% of workforce)',
        roi: '20-30% downtime reduction, 15-25% maintenance cost reduction, payback: 12-18 months',
        sflPositioning: 'AI for predictive maintenance — maximizes uptime in capital-intensive processes',
        examples: [
          'All rare earth processing facilities',
          'Magnet manufacturing facilities',
        ],
      },
    ],
    strategicRationale: 'China has $6-8/hr labor vs. U.S. $30/hr = 3-5x cost disadvantage. AI process optimization, quality control, and predictive maintenance are the only path to competitive costs.',
    sflServices: [
      'Process optimization AI (separation, refining)',
      'Batch process AI (refining, metal/alloy)',
      'AI vision systems (quality inspection)',
      'Predictive maintenance AI (all equipment)',
      'Process development AI (accelerate R&D)',
    ],
  },
  {
    sectorId: 'semiconductors',
    sectorName: 'Semiconductors',
    icon: '🔬',
    color: COLORS.blue,
    valueChain: ['Materials', 'Equipment', 'Fab Operations', 'Packaging'],
    aiUseCases: [
      {
        id: 'yield-optimization',
        name: 'Yield Optimization',
        description: 'AI optimizes process parameters (temperature, pressure, flow) in real-time to maximize wafer yield and reduce defects.',
        valueChainStage: 'Fab Operations',
        laborImpact: 'Reduces need for process engineers to manually tune parameters (typically 50-100 engineers per fab)',
        roi: '5-10% yield improvement = $50M-$100M+ annual value per fab, payback: 6-12 months',
        sflPositioning: 'AI yield optimization — core to fab profitability, enables competitive yield despite higher U.S. labor costs',
        examples: [
          'Intel Ohio fab (Phase 1)',
          'TSMC Arizona fabs',
          'Samsung Taylor fab',
          'Micron New York fab',
        ],
      },
      {
        id: 'defect-prediction',
        name: 'Defect Prediction',
        description: 'AI predicts defects before they occur, enabling real-time process adjustment to prevent yield loss.',
        valueChainStage: 'Fab Operations',
        laborImpact: 'Reduces need for manual defect analysis (typically 30-50 engineers per fab)',
        roi: '10-15% defect reduction, 5-10% yield improvement, payback: 6-12 months',
        sflPositioning: 'AI for defect prediction — prevents yield loss before it happens',
        examples: [
          'All new semiconductor fabs',
          'Existing fab yield improvement programs',
        ],
      },
      {
        id: 'equipment-maintenance',
        name: 'Equipment Predictive Maintenance',
        description: 'AI predicts tool failures (lithography, etch, deposition) before they happen, maximizing tool utilization.',
        valueChainStage: 'Fab Operations',
        laborImpact: 'Reduces maintenance labor (typically 100-200 technicians per fab)',
        roi: '15-25% tool utilization improvement, 20-30% maintenance cost reduction, payback: 12-18 months',
        sflPositioning: 'AI for equipment maintenance — maximizes utilization of $100M+ tools',
        examples: [
          'All semiconductor fabs',
          'Equipment suppliers (Applied Materials, ASML)',
        ],
      },
      {
        id: 'quality-testing',
        name: 'Automated Quality Testing',
        description: 'AI vision systems and metrology AI for automated wafer inspection and measurement, replacing manual processes.',
        valueChainStage: 'Fab Operations',
        laborImpact: 'Replaces 50-100 manual inspectors per fab',
        roi: '30-40% inspection cost reduction, 20-30% faster testing, payback: 6-12 months',
        sflPositioning: 'AI vision and metrology — enables competitive quality despite higher U.S. labor costs',
        examples: [
          'All semiconductor fabs',
          'Packaging facilities',
        ],
      },
      {
        id: 'process-development',
        name: 'Process Development Acceleration',
        description: 'AI accelerates development of new process nodes (3nm, 2nm, etc.) by optimizing R&D experiments.',
        valueChainStage: 'Fab Operations',
        laborImpact: 'Reduces R&D time (typically 2-3 years → 1-2 years)',
        roi: '30-50% faster time-to-market, $500M-$1B+ value per node, payback: immediate',
        sflPositioning: 'AI for process development — accelerates new node development, competitive advantage',
        examples: [
          'Intel process development',
          'TSMC process development',
          'Samsung process development',
        ],
      },
    ],
    strategicRationale: 'Taiwan has $15-20/hr labor vs. U.S. $30/hr = 1.5-2x cost disadvantage. AI yield optimization, defect prediction, and automated quality testing are essential to compete on productivity.',
    sflServices: [
      'Yield optimization AI (real-time process control)',
      'Defect prediction AI (prevent yield loss)',
      'Equipment maintenance AI (predictive maintenance)',
      'AI vision/metrology (quality testing)',
      'Process development AI (accelerate R&D)',
    ],
  },
  {
    sectorId: 'batteries',
    sectorName: 'Batteries',
    icon: '🔋',
    color: COLORS.accent,
    valueChain: ['Mining', 'Processing', 'Materials', 'Cell Manufacturing', 'Pack Assembly'],
    aiUseCases: [
      {
        id: 'processing-optimization',
        name: 'Chemical Processing Optimization',
        description: 'AI optimizes process parameters (temperature, pressure, pH) in lithium/nickel processing to maximize yield and minimize waste.',
        valueChainStage: 'Processing',
        laborImpact: 'Reduces need for manual process monitoring (typically 30-50 operators per facility)',
        roi: '15-25% yield improvement, 20-30% waste reduction, payback: 12-18 months',
        sflPositioning: 'AI for chemical processing — core to competitive costs in battery materials processing',
        examples: [
          'Albemarle lithium processing expansion',
          'Livent lithium processing',
          'Future nickel processing facilities',
        ],
      },
      {
        id: 'cell-assembly',
        name: 'Cell Assembly Optimization',
        description: 'AI optimizes assembly parameters (pressure, temperature, timing) in cell manufacturing to maximize quality and yield.',
        valueChainStage: 'Cell Manufacturing',
        laborImpact: 'Reduces need for manual process tuning (typically 50-100 operators per facility)',
        roi: '10-20% yield improvement, 15-25% quality improvement, payback: 12-18 months',
        sflPositioning: 'AI for cell assembly — enables competitive quality despite higher U.S. labor costs',
        examples: [
          'Ford/SK battery plants (KY, TN)',
          'Toyota battery plant (NC)',
          'LG Energy Solution battery plants',
        ],
      },
      {
        id: 'thermal-runaway',
        name: 'Thermal Runaway Prevention',
        description: 'AI predicts thermal runaway risk in battery cells, enabling real-time process adjustment to prevent safety incidents.',
        valueChainStage: 'Cell Manufacturing',
        laborImpact: 'Reduces need for manual safety monitoring (typically 20-30 safety engineers per facility)',
        roi: 'Prevents safety incidents (priceless), 10-15% quality improvement, payback: immediate',
        sflPositioning: 'AI for safety — prevents catastrophic failures, regulatory compliance, competitive advantage',
        examples: [
          'All battery cell manufacturing facilities',
          'Battery pack assembly facilities',
        ],
      },
      {
        id: 'quality-inspection-battery',
        name: 'Automated Quality Inspection',
        description: 'AI vision systems for automated inspection of battery cells, replacing manual inspection processes.',
        valueChainStage: 'Cell Manufacturing',
        laborImpact: 'Replaces 50-100 manual inspectors per facility',
        roi: '30-40% inspection cost reduction, 20-30% defect rate reduction, payback: 6-12 months',
        sflPositioning: 'AI vision for battery quality — critical for competing with China\'s low-cost manual inspection',
        examples: [
          'All battery cell manufacturing facilities',
          'Battery pack assembly facilities',
        ],
      },
    ],
    strategicRationale: 'China has $6-8/hr labor vs. U.S. $30/hr = 3-5x cost disadvantage. AI process optimization, quality control, and safety systems are essential to compete.',
    sflServices: [
      'Chemical processing AI (lithium, nickel processing)',
      'Cell assembly AI (optimize manufacturing)',
      'Thermal runaway AI (safety prevention)',
      'AI vision systems (quality inspection)',
      'Predictive maintenance AI (equipment)',
    ],
  },
  {
    sectorId: 'nuclear',
    sectorName: 'Nuclear',
    icon: '⚛️',
    color: COLORS.warning,
    valueChain: ['Fuel Cycle', 'Components', 'Reactor Construction', 'Reactor Operations'],
    aiUseCases: [
      {
        id: 'construction-automation',
        name: 'Construction Automation',
        description: 'AI for automated welding, inspection, and quality control in reactor construction, reducing labor content.',
        valueChainStage: 'Reactor Construction',
        laborImpact: 'Reduces construction labor (typically 30-40% of construction workforce)',
        roi: '20-30% construction cost reduction, 15-25% faster construction, payback: immediate',
        sflPositioning: 'AI for construction automation — enables competitive construction costs despite higher U.S. labor rates',
        examples: [
          'TerraPower Natrium reactor (Kemmerer, WY)',
          'X-energy Xe-100 reactor (Seadrift, TX)',
          'Three Mile Island restart',
        ],
      },
      {
        id: 'fuel-optimization',
        name: 'Fuel Optimization',
        description: 'AI optimizes fuel loading, burnup, and refueling schedules to maximize efficiency and minimize fuel costs.',
        valueChainStage: 'Reactor Operations',
        laborImpact: 'Reduces need for manual fuel management (typically 10-15 engineers per reactor)',
        roi: '5-10% fuel cost reduction, 2-5% efficiency improvement, payback: 12-18 months',
        sflPositioning: 'AI for fuel optimization — maximizes efficiency in highest-consequence environments',
        examples: [
          'Constellation nuclear fleet',
          'Southern Company nuclear fleet',
          'Future SMR deployments',
        ],
      },
      {
        id: 'predictive-maintenance-nuclear',
        name: 'Predictive Maintenance',
        description: 'AI predicts equipment failures (pumps, valves, I&C systems) before they happen, reducing downtime and maintenance costs.',
        valueChainStage: 'Reactor Operations',
        laborImpact: 'Reduces maintenance labor (typically 15-20% of operations workforce)',
        roi: '20-30% downtime reduction, 15-25% maintenance cost reduction, payback: 12-18 months',
        sflPositioning: 'AI for predictive maintenance — maximizes uptime in critical infrastructure',
        examples: [
          'All nuclear reactors',
          'HALEU production facilities',
        ],
      },
      {
        id: 'safety-systems',
        name: 'Safety System Optimization',
        description: 'AI predicts safety system needs and optimizes safety system performance, ensuring regulatory compliance.',
        valueChainStage: 'Reactor Operations',
        laborImpact: 'Reduces need for manual safety analysis (typically 10-15 safety engineers per reactor)',
        roi: 'Prevents safety incidents (priceless), regulatory compliance, payback: immediate',
        sflPositioning: 'AI for safety systems — enables regulatory compliance, competitive advantage',
        examples: [
          'All nuclear reactors',
          'SMR deployments',
        ],
      },
    ],
    strategicRationale: 'South Korea has $10-15/hr construction labor vs. U.S. $30/hr = 2-3x cost disadvantage. AI construction automation, fuel optimization, and predictive maintenance are essential to compete.',
    sflServices: [
      'Construction automation AI (welding, inspection)',
      'Fuel optimization AI (maximize efficiency)',
      'Predictive maintenance AI (equipment)',
      'Safety system AI (regulatory compliance)',
      'Process optimization AI (HALEU production)',
    ],
  },
  {
    sectorId: 'grid',
    sectorName: 'Grid Infrastructure',
    icon: '⚡',
    color: COLORS.warning,
    valueChain: ['Generation', 'Transmission', 'Substations', 'Distribution'],
    aiUseCases: [
      {
        id: 'load-forecasting',
        name: 'Load Forecasting',
        description: 'AI predicts electricity demand (short-term and long-term) to optimize generation and prevent grid congestion.',
        valueChainStage: 'All Stages',
        laborImpact: 'Reduces need for manual load forecasting (typically 10-20 analysts per utility)',
        roi: '10-15% generation cost reduction, 5-10% congestion reduction, payback: 6-12 months',
        sflPositioning: 'AI for load forecasting — core to grid optimization, enables efficient generation dispatch',
        examples: [
          'Grid operators (PJM, ERCOT, CAISO)',
          'Utilities (transmission, distribution)',
          'Generation companies',
        ],
      },
      {
        id: 'grid-optimization',
        name: 'Grid Optimization',
        description: 'AI optimizes transmission, prevents congestion, and manages distributed energy resources (DERs) in real-time.',
        valueChainStage: 'Transmission, Distribution',
        laborImpact: 'Reduces need for manual grid management (typically 20-30 operators per utility)',
        roi: '10-15% congestion reduction, 5-10% efficiency improvement, payback: 12-18 months',
        sflPositioning: 'AI for grid optimization — enables efficient power delivery, DER management',
        examples: [
          'Grid operators',
          'Utilities',
          'Transmission companies',
        ],
      },
      {
        id: 'transformer-maintenance',
        name: 'Transformer Predictive Maintenance',
        description: 'AI predicts transformer failures before they happen, reducing downtime and extending transformer life.',
        valueChainStage: 'Substations',
        laborImpact: 'Reduces maintenance labor (typically 10-15% of substation workforce)',
        roi: '20-30% downtime reduction, 15-25% maintenance cost reduction, extends transformer life, payback: 12-18 months',
        sflPositioning: 'AI for transformer maintenance — critical given 2-3 year lead times for new transformers',
        examples: [
          'All utilities',
          'Transmission companies',
          'Substation operators',
        ],
      },
      {
        id: 'construction-automation-grid',
        name: 'Construction Automation',
        description: 'AI for automated construction processes (transmission lines, substations) to reduce labor content.',
        valueChainStage: 'Transmission, Substations',
        laborImpact: 'Reduces construction labor (typically 30-40% of construction workforce)',
        roi: '20-30% construction cost reduction, 15-25% faster construction, payback: immediate',
        sflPositioning: 'AI for construction automation — enables competitive construction costs despite higher U.S. labor rates',
        examples: [
          'SunZia transmission project',
          'DOE transmission corridor projects',
          'Substation modernization projects',
        ],
      },
    ],
    strategicRationale: 'China has $6-8/hr construction labor vs. U.S. $30/hr = 3-5x cost disadvantage. AI grid optimization, predictive maintenance, and construction automation are essential to compete.',
    sflServices: [
      'Load forecasting AI (demand prediction)',
      'Grid optimization AI (transmission, DER management)',
      'Transformer maintenance AI (predictive maintenance)',
      'Construction automation AI (reduce labor content)',
      'Smart grid AI (distribution optimization)',
    ],
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function AIOpportunitiesPage() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)

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
            <p style={styles.subtitle}>AI Application Opportunities: Positioning SFL Scientific</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/sectors" style={styles.radarLink}>
              ← Back to Sectors
            </Link>
            <Link href="/policy-gaps" style={styles.radarLink}>
              Policy Gaps →
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/references" style={styles.radarLink}>
              References →
            </Link>
          </div>
        </header>

        <section style={styles.introSection}>
          <h2 style={styles.introTitle}>AI Opportunities in Prerequisites</h2>
          <p style={styles.introText}>
            The Build Clock reveals <strong>$800B+ in industrial investment</strong>, but many projects depend on 
            <strong> prerequisites</strong> that don't exist in the U.S. — rare earth refining, battery materials processing, 
            HALEU fuel production, transmission infrastructure.
          </p>
          <p style={styles.introText}>
            <strong>The challenge:</strong> China and other countries have <strong>$6-8/hour labor</strong> vs. U.S. 
            <strong> $30/hour</strong> = <strong>3-5x cost disadvantage</strong>.
          </p>
          <p style={styles.introText}>
            <strong>The solution:</strong> <strong>AI and automation are not optional</strong> — they are strategic necessities 
            to offset labor cost disadvantages and accelerate development. <strong>SFL Scientific</strong> can position AI 
            applications at the <strong>core of these prerequisite processes</strong> — where they're not just efficiency gains, 
            but competitive requirements.
          </p>
        </section>

        <div style={styles.sectorsGrid}>
          {AI_OPPORTUNITIES.map(sector => (
            <div 
              key={sector.sectorId} 
              style={{
                ...styles.sectorCard,
                borderColor: selectedSector === sector.sectorId ? sector.color : COLORS.border,
              }}
            >
              <div 
                style={styles.sectorCardHeader}
                onClick={() => setSelectedSector(selectedSector === sector.sectorId ? null : sector.sectorId)}
              >
                <span style={styles.sectorIcon}>{sector.icon}</span>
                <div>
                  <div style={styles.sectorName}>{sector.sectorName}</div>
                  <div style={styles.sectorSubtitle}>
                    {sector.aiUseCases.length} AI opportunities • Click to expand
                  </div>
                </div>
              </div>
              
              {selectedSector === sector.sectorId && (
                <div style={styles.sectorDetails}>
                  {/* Strategic Rationale */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>Strategic Rationale</h3>
                    <div style={styles.rationaleBox}>
                      {sector.strategicRationale}
                    </div>
                  </div>

                  {/* SFL Services */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>SFL Scientific Services</h3>
                    <ul style={styles.servicesList}>
                      {sector.sflServices.map((service, idx) => (
                        <li key={idx} style={styles.serviceItem}>{service}</li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Use Cases */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>AI Use Cases</h3>
                    <div style={styles.useCasesGrid}>
                      {sector.aiUseCases.map(useCase => (
                        <div 
                          key={useCase.id}
                          style={{
                            ...styles.useCaseCard,
                            borderColor: selectedUseCase === useCase.id ? sector.color : COLORS.border,
                          }}
                          onClick={() => setSelectedUseCase(selectedUseCase === useCase.id ? null : useCase.id)}
                        >
                          <div style={styles.useCaseHeader}>
                            <span style={styles.useCaseStage}>{useCase.valueChainStage}</span>
                            <div style={styles.useCaseName}>{useCase.name}</div>
                          </div>
                          <div style={styles.useCaseDescription}>{useCase.description}</div>
                          
                          {selectedUseCase === useCase.id && (
                            <div style={styles.useCaseDetails}>
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Labor Impact:</span>
                                <span style={styles.detailValue}>{useCase.laborImpact}</span>
                              </div>
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>ROI:</span>
                                <span style={{ ...styles.detailValue, color: COLORS.accent }}>{useCase.roi}</span>
                              </div>
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>SFL Positioning:</span>
                                <span style={styles.detailValue}>{useCase.sflPositioning}</span>
                              </div>
                              <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Examples:</span>
                                <ul style={styles.examplesList}>
                                  {useCase.examples.map((example, idx) => (
                                    <li key={idx} style={styles.exampleItem}>{example}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <section style={styles.positioningSection}>
          <h2 style={styles.positioningTitle}>SFL Scientific Positioning Strategy</h2>
          <div style={styles.positioningGrid}>
            <div style={styles.positioningCard}>
              <div style={styles.positioningIcon}>🎯</div>
              <div style={styles.positioningName}>Core Business Focus</div>
              <div style={styles.positioningText}>
                Position AI at the <strong>core of prerequisite processes</strong> — not as efficiency gains, 
                but as <strong>competitive requirements</strong>. AI is the only path to competitive costs despite 
                higher U.S. labor rates.
              </div>
            </div>
            <div style={styles.positioningCard}>
              <div style={styles.positioningIcon}>⚡</div>
              <div style={styles.positioningName}>Value Chain Positioning</div>
              <div style={styles.positioningText}>
                Focus on <strong>prerequisites</strong> (separation, refining, processing) where bottlenecks are, 
                not just end products (fabs, batteries, reactors). Prerequisites are where AI is most needed and 
                least understood.
              </div>
            </div>
            <div style={styles.positioningCard}>
              <div style={styles.positioningIcon}>🤖</div>
              <div style={styles.positioningName}>AI as Strategic Necessity</div>
              <div style={styles.positioningText}>
                Frame AI not as "nice to have" but as <strong>strategic necessity</strong> due to labor cost 
                disadvantages. China has 3-5x labor cost advantage — AI is the only path to compete.
              </div>
            </div>
            <div style={styles.positioningCard}>
              <div style={styles.positioningIcon}>🔗</div>
              <div style={styles.positioningName}>Integration with OT Security</div>
              <div style={styles.positioningText}>
                Partner with OT Security practice — every AI-enabled industrial system needs security. 
                <strong> AI + Security = complete solution</strong> for build economy clients.
              </div>
            </div>
          </div>
        </section>

        <section style={styles.conclusionSection}>
          <h2 style={styles.conclusionTitle}>The Opportunity</h2>
          <p style={styles.conclusionText}>
            The Build Clock reveals <strong>$800B+ in industrial investment</strong> creating thousands of new OT environments. 
            Many projects depend on <strong>prerequisites</strong> that don't exist in the U.S. — and those prerequisites are 
            labor-intensive, giving China a cost advantage.
          </p>
          <p style={styles.conclusionText}>
            <strong>AI and automation are not optional</strong> — they are strategic necessities. <strong>SFL Scientific</strong> 
            can position AI applications at the <strong>core of prerequisite processes</strong>, where they're not just efficiency 
            gains, but competitive requirements.
          </p>
          <p style={styles.conclusionText}>
            <strong>The play:</strong> Focus on prerequisites (separation, refining, processing) where bottlenecks are, 
            where AI is most needed, and where competitors aren't looking. Position AI as strategic necessity, not nice-to-have.
          </p>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • AI Application Opportunities</span>
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
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 2.5rem',
  },
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
  introSection: {
    marginBottom: '3rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  introTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  introText: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: COLORS.textMuted,
    marginBottom: '1rem',
  },
  sectorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  sectorCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s',
  },
  sectorCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  sectorIcon: {
    fontSize: '2rem',
  },
  sectorName: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  sectorSubtitle: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  sectorDetails: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  detailSection: {
    marginBottom: '2rem',
  },
  detailTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: COLORS.accent,
  },
  rationaleBox: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  servicesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  serviceItem: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    borderLeft: `3px solid ${COLORS.blue}`,
  },
  useCasesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  useCaseCard: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  useCaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  useCaseStage: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  useCaseName: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  useCaseDescription: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  useCaseDetails: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginBottom: '0.75rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: COLORS.textDim,
    fontWeight: 600,
  },
  detailValue: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  examplesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    marginTop: '0.25rem',
  },
  exampleItem: {
    padding: '0.5rem',
    marginBottom: '0.25rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  positioningSection: {
    marginTop: '3rem',
    marginBottom: '3rem',
  },
  positioningTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
  },
  positioningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  positioningCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  positioningIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  positioningName: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
    color: COLORS.accent,
  },
  positioningText: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  conclusionSection: {
    marginTop: '3rem',
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    borderLeft: `4px solid ${COLORS.accent}`,
  },
  conclusionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  conclusionText: {
    fontSize: '0.95rem',
    lineHeight: 1.7,
    color: COLORS.textMuted,
    marginBottom: '1rem',
  },
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
}

