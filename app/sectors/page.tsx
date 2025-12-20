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
// SECTOR DATA
// ============================================================================

interface ValueChainStage {
  stage: string
  description: string
  usCapacity: string
  globalLeader: string
  gap: string
  laborIntensity: string
  aiNecessity: string
  otRequirements: string[]
}

interface Sector {
  id: string
  name: string
  icon: string
  color: string
  valueChain: ValueChainStage[]
  laborGap: {
    china: string
    us: string
    multiplier: string
  }
  aiSolutions: string[]
  otSecurityGaps: string[]
  deloitteOpportunity: string
}

const SECTORS: Sector[] = [
  {
    id: 'rare-earths',
    name: 'Rare Earths',
    icon: '🧲',
    color: COLORS.warning,
    valueChain: [
      {
        stage: 'Mining',
        description: 'Extract ore from ground (Mountain Pass, CA; other deposits)',
        usCapacity: 'Mountain Pass (15% global)',
        globalLeader: 'China: 60%',
        gap: 'Moderate',
        laborIntensity: 'Low (automated)',
        aiNecessity: 'Limited (already automated)',
        otRequirements: ['Process control', 'Safety systems', 'Environmental monitoring'],
      },
      {
        stage: 'Separation',
        description: 'Separate rare earths from each other (solvent extraction)',
        usCapacity: 'Limited (MP Materials expanding)',
        globalLeader: 'China: 90%+',
        gap: 'Critical',
        laborIntensity: 'High (manual processes)',
        aiNecessity: 'AI for solvent extraction optimization, batch processing, quality control',
        otRequirements: ['DCS (Distributed Control Systems)', 'Batch control', 'Quality systems', 'AI/ML integration'],
      },
      {
        stage: 'Refining',
        description: 'Process to high-purity oxides (99.9%+ purity)',
        usCapacity: 'Almost none',
        globalLeader: 'China: 95%+',
        gap: 'Critical',
        laborIntensity: 'High (batch processes)',
        aiNecessity: 'AI for process optimization, quality control, predictive maintenance',
        otRequirements: ['DCS', 'Batch control', 'Quality systems', 'Environmental monitoring', 'AI/ML integration'],
      },
      {
        stage: 'Metal/Alloy',
        description: 'Convert to metals/alloys (neodymium, dysprosium, etc.)',
        usCapacity: 'Almost none',
        globalLeader: 'China: 90%+',
        gap: 'Critical',
        laborIntensity: 'High (metallurgical)',
        aiNecessity: 'AI for furnace control, metallurgical processes, quality testing',
        otRequirements: ['Furnace control', 'Metallurgical processes', 'Quality testing'],
      },
      {
        stage: 'Magnet Manufacturing',
        description: 'Manufacture permanent magnets (for motors, EVs, wind turbines)',
        usCapacity: 'Almost none',
        globalLeader: 'China: 90%+',
        gap: 'Critical',
        laborIntensity: 'Very high (precision manual)',
        aiNecessity: 'AI vision systems for quality inspection, automated precision processes',
        otRequirements: ['Precision manufacturing control', 'Sintering furnaces', 'Coating systems', 'AI vision'],
      },
    ],
    laborGap: {
      china: '$6-8/hour',
      us: '$30/hour',
      multiplier: '3-5x cost disadvantage',
    },
    aiSolutions: [
      'Process optimization (maximize yield, reduce waste)',
      'Quality control (automated inspection)',
      'Predictive maintenance (reduce downtime)',
      'Process development (accelerate R&D)',
    ],
    otSecurityGaps: [
      'Chemical processing (high-consequence: environmental, safety)',
      'AI/ML systems (new attack vectors: model poisoning, adversarial inputs)',
      'Process IP protection (formulations, recipes, AI models)',
    ],
    deloitteOpportunity: 'OT security for separation/refining facilities, AI/OT integration security, process control modernization',
  },
  {
    id: 'semiconductors',
    name: 'Semiconductors',
    icon: '🔬',
    color: COLORS.blue,
    valueChain: [
      {
        stage: 'Materials',
        description: 'Silicon wafers, chemicals, gases, photoresist, specialty chemicals',
        usCapacity: 'Some (silicon, chemicals)',
        globalLeader: 'Japan, Taiwan, China',
        gap: 'Moderate',
        laborIntensity: 'Low (automated)',
        aiNecessity: 'Limited (already automated)',
        otRequirements: ['Chemical process control', 'Quality systems'],
      },
      {
        stage: 'Equipment',
        description: 'Lithography tools (ASML, Nikon), etch, deposition, metrology equipment',
        usCapacity: 'Applied Materials (U.S.), but ASML (Netherlands) dominates lithography',
        globalLeader: 'Netherlands (ASML), Japan',
        gap: 'Critical (lithography)',
        laborIntensity: 'High (precision assembly)',
        aiNecessity: 'AI for precision assembly, calibration, maintenance',
        otRequirements: ['Tool control systems', 'Calibration', 'Maintenance'],
      },
      {
        stage: 'Fab Operations',
        description: 'Wafer processing, testing, yield optimization',
        usCapacity: 'Intel, GlobalFoundries, but TSMC leads',
        globalLeader: 'Taiwan (TSMC)',
        gap: 'Critical (leading-edge)',
        laborIntensity: 'Very high (thousands of technicians)',
        aiNecessity: 'AI yield optimization, defect prediction, automated quality testing, predictive maintenance',
        otRequirements: ['MES', 'SCADA', 'Cleanroom controls', 'Quality systems', 'AI/ML integration', 'Yield optimization'],
      },
      {
        stage: 'Packaging',
        description: 'Package chips, test, ship',
        usCapacity: 'Limited advanced packaging',
        globalLeader: 'Taiwan, China',
        gap: 'Critical',
        laborIntensity: 'High (precision manual)',
        aiNecessity: 'AI vision systems for quality inspection, automated testing',
        otRequirements: ['Precision manufacturing control', 'Testing systems'],
      },
    ],
    laborGap: {
      china: '$15-20/hour (Taiwan)',
      us: '$30/hour',
      multiplier: '1.5-2x cost disadvantage',
    },
    aiSolutions: [
      'Yield optimization (maximize yield, reduce defects)',
      'Predictive maintenance (reduce tool downtime)',
      'Quality control (automated inspection, metrology)',
      'Process development (accelerate new node development)',
    ],
    otSecurityGaps: [
      'Fabs are high-value targets (IP theft, supply chain disruption)',
      'AI/ML systems (new attack vectors: model poisoning, adversarial inputs)',
      'Process IP protection (recipes, yield data, AI models)',
      'Vendor remote access (equipment suppliers need access)',
    ],
    deloitteOpportunity: 'OT security for fabs (greenfield and legacy), AI/OT integration security, equipment security, process IP protection',
  },
  {
    id: 'batteries',
    name: 'Batteries',
    icon: '🔋',
    color: COLORS.accent,
    valueChain: [
      {
        stage: 'Mining',
        description: 'Lithium, cobalt, nickel, graphite',
        usCapacity: 'Some lithium (Nevada)',
        globalLeader: 'Australia (lithium), DRC (cobalt), Indonesia (nickel)',
        gap: 'Moderate',
        laborIntensity: 'Low (automated)',
        aiNecessity: 'Limited (already automated)',
        otRequirements: ['Process control', 'Safety systems'],
      },
      {
        stage: 'Processing',
        description: 'Convert to battery-grade chemicals (lithium carbonate, nickel sulfate, etc.)',
        usCapacity: 'Almost none',
        globalLeader: 'China: 80%+',
        gap: 'Critical',
        laborIntensity: 'High (batch processes)',
        aiNecessity: 'AI for process optimization, quality control, predictive maintenance',
        otRequirements: ['DCS', 'Batch control', 'Quality systems', 'AI/ML integration'],
      },
      {
        stage: 'Materials',
        description: 'Cathode materials (NMC, LFP), anode materials (graphite), separators, electrolyte',
        usCapacity: 'Limited (some cathode)',
        globalLeader: 'China: 70%+',
        gap: 'Critical',
        laborIntensity: 'High (precision chemical)',
        aiNecessity: 'AI for precision chemical processes, quality testing',
        otRequirements: ['Precision chemical processes', 'Quality testing'],
      },
      {
        stage: 'Cell Manufacturing',
        description: 'Assemble cells (winding, stacking, electrolyte fill, sealing)',
        usCapacity: 'Growing (Ford/SK, Toyota, LG)',
        globalLeader: 'China: 70%+',
        gap: 'Moderate (improving)',
        laborIntensity: 'Very high (thousands of workers)',
        aiNecessity: 'AI for assembly optimization, quality control, safety (thermal runaway prevention)',
        otRequirements: ['MES', 'Quality systems', 'Process control', 'Safety (thermal runaway prevention)', 'AI/ML integration'],
      },
      {
        stage: 'Pack Assembly',
        description: 'Package cells into packs, test, ship',
        usCapacity: 'Growing (Tesla, Ford, etc.)',
        globalLeader: 'China: 60%+',
        gap: 'Moderate',
        laborIntensity: 'High (precision manual)',
        aiNecessity: 'AI vision systems for quality inspection, automated testing',
        otRequirements: ['Manufacturing control', 'Testing systems'],
      },
    ],
    laborGap: {
      china: '$6-8/hour',
      us: '$30/hour',
      multiplier: '3-5x cost disadvantage',
    },
    aiSolutions: [
      'Process optimization (maximize yield, reduce waste)',
      'Quality control (automated inspection, testing)',
      'Predictive maintenance (reduce downtime)',
      'Safety (thermal runaway prevention)',
    ],
    otSecurityGaps: [
      'Chemical processing (high-consequence: environmental, safety)',
      'Battery manufacturing (thermal runaway risk, quality critical)',
      'AI/ML systems (new attack vectors: model poisoning, adversarial inputs)',
      'Process IP protection (formulations, recipes, AI models)',
    ],
    deloitteOpportunity: 'OT security for processing facilities, OT security for cell manufacturing, AI/OT integration security, process IP protection',
  },
  {
    id: 'nuclear',
    name: 'Nuclear',
    icon: '⚛️',
    color: COLORS.warning,
    valueChain: [
      {
        stage: 'Fuel Cycle',
        description: 'Uranium mining, enrichment, fuel fabrication (HALEU for advanced reactors)',
        usCapacity: 'Limited (mining, some enrichment), no HALEU production',
        globalLeader: 'Russia (enrichment), France (fuel fabrication), China (enrichment/fabrication)',
        gap: 'Critical (HALEU)',
        laborIntensity: 'High (precision processes) — China: $6-8/hr vs US: $30/hr = 5x cost disadvantage',
        aiNecessity: 'AI for process optimization, quality control, predictive maintenance',
        otRequirements: ['Process control', 'Safety systems', 'Security (nuclear materials)', 'QA throughput systems'],
      },
      {
        stage: 'Components',
        description: 'Reactor vessels, steam generators, pumps, valves, instrumentation',
        usCapacity: 'Limited (reactor vessels, pumps)',
        globalLeader: 'South Korea, Japan, France, China (manufacturing)',
        gap: 'Critical',
        laborIntensity: 'High (precision manufacturing) — China: $6-8/hr vs US: $30/hr = 5x cost disadvantage',
        aiNecessity: 'AI for precision manufacturing, quality control',
        otRequirements: ['Manufacturing control', 'Quality systems', 'N-stamp compliance'],
      },
      {
        stage: 'Reactor Construction',
        description: 'Build containment, install systems, commission (PRIMARY bottleneck: QA documentation, inspection throughput, licensing — gates deployment more than physical tasks)',
        usCapacity: 'Limited (supply chain atrophied, QA/licensing bottlenecks)',
        globalLeader: 'South Korea (international exports), Russia, China (domestic)',
        gap: 'Critical',
        laborIntensity: 'Very high (thousands of workers) — South Korea: $10-15/hr vs US: $30/hr = 2-3x cost disadvantage',
        aiNecessity: 'AI for QA/documentation automation, inspection throughput, licensing acceleration — **PRIMARY bottleneck** (compliance throughput gates deployment more than physical tasks). Physical construction AI (welding, inspection) is valuable but secondary.',
        otRequirements: ['QA documentation systems', 'Inspection tracking', 'Licensing support systems', 'Compliance automation'],
      },
      {
        stage: 'Reactor Operations',
        description: 'I&C systems, safety systems, operations monitoring',
        usCapacity: 'Strong (existing fleet)',
        globalLeader: 'U.S., France, South Korea',
        gap: 'No gap',
        laborIntensity: 'Moderate (operators, technicians)',
        aiNecessity: 'AI for fuel optimization, predictive maintenance, safety systems',
        otRequirements: ['I&C systems', 'Safety-instrumented systems', 'Cybersecurity (NRC requirements)', 'AI/ML integration'],
      },
    ],
    laborGap: {
      china: 'Varies by stage: China $6-8/hr (fuel/components), South Korea $10-15/hr (construction)',
      us: '$30/hour',
      multiplier: '2-5x cost disadvantage (varies by value chain stage)',
    },
    aiSolutions: [
      'QA & Documentation Automation (PRIMARY bottleneck — compliance throughput, licensing acceleration)',
      'Physical Construction AI (welding, inspection — secondary, but valuable)',
      'Licensing Acceleration (Heartbeat AI)',
      'QA Throughput Automation (Heartbeat AI)',
      'Operations Optimization (Heartbeat AI)',
      'Predictive maintenance (reduce downtime)',
      'Fuel optimization (maximize efficiency)',
      'Safety systems (predict safety needs)',
    ],
    otSecurityGaps: [
      'Nuclear facilities are highest-consequence (safety, national security)',
      'NRC cybersecurity requirements (10 CFR 73.54)',
      'AI/ML systems (new attack vectors: model poisoning, adversarial inputs)',
      'Legacy systems (hard to secure, can\'t patch)',
    ],
    deloitteOpportunity: 'OT security, AI/OT integration, NRC compliance. Heartbeat AI: licensing acceleration, QA automation, operations optimization. ER&I clients: NuScale, TerraPower, X-energy, Oklo.',
  },
  {
    id: 'grid',
    name: 'Grid Infrastructure',
    icon: '⚡',
    color: COLORS.warning,
    valueChain: [
      {
        stage: 'Generation',
        description: 'Power plants (nuclear, gas, renewables)',
        usCapacity: 'Strong (nuclear, gas, renewables)',
        globalLeader: 'U.S., China',
        gap: 'No gap',
        laborIntensity: 'Low (automated)',
        aiNecessity: 'AI for load forecasting, grid optimization',
        otRequirements: ['SCADA', 'I&C systems', 'Safety systems', 'AI/ML integration'],
      },
      {
        stage: 'Transmission',
        description: 'High-voltage lines (765kV, 500kV, etc.)',
        usCapacity: 'Limited (aging, bottlenecks)',
        globalLeader: 'China (HVDC), Europe',
        gap: 'Critical',
        laborIntensity: 'High (construction, maintenance)',
        aiNecessity: 'AI for grid optimization, construction automation, predictive maintenance',
        otRequirements: ['EMS (Energy Management Systems)', 'Protection systems', 'AI/ML integration'],
      },
      {
        stage: 'Substations',
        description: 'Step-down transformers, protection systems',
        usCapacity: 'Aging (need modernization)',
        globalLeader: 'U.S., Europe',
        gap: 'Moderate',
        laborIntensity: 'High (construction, maintenance)',
        aiNecessity: 'AI for predictive maintenance, grid optimization',
        otRequirements: ['Substation automation', 'Protection relays', 'Monitoring', 'AI/ML integration'],
      },
      {
        stage: 'Distribution',
        description: 'Local lines, transformers, smart meters',
        usCapacity: 'Aging (smart grid limited)',
        globalLeader: 'U.S., Europe',
        gap: 'Moderate',
        laborIntensity: 'High (construction, maintenance)',
        aiNecessity: 'AI for distribution optimization, DER management',
        otRequirements: ['Smart grid', 'AMI (Advanced Metering Infrastructure)', 'Distribution management', 'AI/ML integration'],
      },
    ],
    laborGap: {
      china: '$6-8/hour',
      us: '$30/hour',
      multiplier: '3-5x cost disadvantage',
    },
    aiSolutions: [
      'Grid optimization (load forecasting, congestion management)',
      'Predictive maintenance (reduce downtime)',
      'Construction automation (reduce labor content)',
      'Smart grid (DER management, distribution optimization)',
    ],
    otSecurityGaps: [
      'Grid is critical infrastructure (NERC CIP requirements)',
      'AI/ML systems (new attack vectors: model poisoning, adversarial inputs)',
      'Legacy systems (hard to secure, can\'t patch)',
      'Supply chain security (transformers, equipment)',
    ],
    deloitteOpportunity: 'OT security for generation facilities, transmission/substation security (NERC CIP compliance), AI/OT integration security, smart grid security',
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function SectorsPage() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

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
            <p style={styles.subtitle}>Sector Deep-Dives: Prerequisites & Dependencies</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/" style={styles.radarLink}>
              ← Build Clock
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/policy-gaps" style={styles.radarLink}>
              Policy Gaps →
            </Link>
            <Link href="/ai-opportunities" style={{ ...styles.radarLink, backgroundColor: COLORS.blue + '22', borderColor: COLORS.blue, color: COLORS.blue }}>
              AI Use Cases (SFL) →
            </Link>
          </div>
        </header>

        <section style={styles.introSection}>
          <h2 style={styles.introTitle}>The Prerequisite Problem</h2>
          <p style={styles.introText}>
            You can't build the end product without the prerequisites. The Build Clock tracks <strong>$800B+ in announced investments</strong>, 
            but many depend on <strong>foundational infrastructure</strong> that doesn't get headlines.
          </p>
          <p style={styles.introText}>
            <strong>Example:</strong> You want rare earth magnets for EVs → but you need rare earth <strong>refining</strong> first. 
            The U.S. has rare earth <strong>mining</strong> (Mountain Pass, CA), but <strong>refining</strong> is dominated by China.
          </p>
          <p style={styles.introText}>
            <strong>The labor reality:</strong> China has <strong>$6-8/hour</strong> labor vs. U.S. <strong>$30/hour</strong> = 
            <strong> 3-5x cost disadvantage</strong>. <strong>AI and automation are not optional</strong> — they are strategic 
            necessities to offset labor cost disadvantages and accelerate development.
          </p>
        </section>

        <div style={styles.sectorsGrid}>
          {SECTORS.map(sector => (
            <div 
              key={sector.id} 
              style={{
                ...styles.sectorCard,
                borderColor: selectedSector === sector.id ? sector.color : COLORS.border,
              }}
              onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
            >
              <div style={styles.sectorCardHeader}>
                <span style={styles.sectorIcon}>{sector.icon}</span>
                <div>
                  <div style={styles.sectorName}>{sector.name}</div>
                  <div style={styles.sectorSubtitle}>Click to expand value chain</div>
                </div>
              </div>
              
              {selectedSector === sector.id && (
                <div style={styles.sectorDetails}>
                  {/* Value Chain */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>Value Chain</h3>
                    <div style={styles.valueChain}>
                      {sector.valueChain.map((stage, idx) => (
                        <div key={idx} style={styles.valueChainStage}>
                          <div style={styles.stageHeader}>
                            <span style={styles.stageNumber}>{idx + 1}</span>
                            <span style={styles.stageName}>{stage.stage}</span>
                          </div>
                          <div style={styles.stageDescription}>{stage.description}</div>
                          <div style={styles.stageMetrics}>
                            <div style={styles.metric}>
                              <span style={styles.metricLabel}>U.S. Capacity:</span>
                              <span style={styles.metricValue}>{stage.usCapacity}</span>
                            </div>
                            <div style={styles.metric}>
                              <span style={styles.metricLabel}>Global Leader:</span>
                              <span style={styles.metricValue}>{stage.globalLeader}</span>
                            </div>
                            <div style={styles.metric}>
                              <span style={styles.metricLabel}>Gap:</span>
                              <span style={{ ...styles.metricValue, color: stage.gap === 'Critical' ? COLORS.danger : COLORS.warning }}>
                                {stage.gap}
                              </span>
                            </div>
                            <div style={styles.metric}>
                              <span style={styles.metricLabel}>Labor Intensity:</span>
                              <span style={styles.metricValue}>{stage.laborIntensity}</span>
                            </div>
                            {stage.aiNecessity !== 'Limited (already automated)' && (
                              <div style={styles.metric}>
                                <span style={styles.metricLabel}>AI Necessity:</span>
                                <span style={{ ...styles.metricValue, color: COLORS.accent }}>{stage.aiNecessity}</span>
                              </div>
                            )}
                          </div>
                          <div style={styles.otRequirements}>
                            <strong>OT Requirements:</strong> {stage.otRequirements.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labor Gap */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>Labor Cost Gap</h3>
                    <div style={styles.laborGap}>
                      <div style={styles.laborSide}>
                        <div style={styles.laborLabel}>China/Global Leader</div>
                        <div style={{ ...styles.laborValue, color: COLORS.danger }}>{sector.laborGap.china}</div>
                      </div>
                      <div style={styles.laborVs}>vs</div>
                      <div style={styles.laborSide}>
                        <div style={styles.laborLabel}>United States</div>
                        <div style={{ ...styles.laborValue, color: COLORS.accent }}>{sector.laborGap.us}</div>
                      </div>
                    </div>
                    <div style={styles.laborMultiplier}>
                      <strong>Result:</strong> {sector.laborGap.multiplier}
                    </div>
                  </div>

                  {/* AI Solutions */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>Why AI/Automation Is Necessary</h3>
                    <ul style={styles.aiSolutionsList}>
                      {sector.aiSolutions.map((solution, idx) => (
                        <li key={idx} style={styles.aiSolutionItem}>{solution}</li>
                      ))}
                    </ul>
                  </div>

                  {/* OT Security Gaps */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>OT Security Gaps</h3>
                    <ul style={styles.securityGapsList}>
                      {sector.otSecurityGaps.map((gap, idx) => (
                        <li key={idx} style={styles.securityGapItem}>{gap}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Deloitte Opportunity */}
                  <div style={styles.detailSection}>
                    <h3 style={styles.detailTitle}>Deloitte Opportunity</h3>
                    <div style={styles.opportunityText}>{sector.deloitteOpportunity}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <section style={styles.conclusionSection}>
          <h2 style={styles.conclusionTitle}>The Meta-Pattern</h2>
          <p style={styles.conclusionText}>
            Every sector has the same pattern: <strong>you can't build the end product without the prerequisites</strong>. 
            And the prerequisites are often labor-intensive, giving China a cost advantage.
          </p>
          <p style={styles.conclusionText}>
            <strong>AI and automation are not optional</strong> — they are strategic necessities to offset labor cost 
            disadvantages and accelerate development. Every prerequisite facility needs OT systems — and every 
            AI-enabled OT system needs security.
          </p>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • Sector Deep-Dives</span>
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
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sectorCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
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
  valueChain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  valueChainStage: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  stageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  stageNumber: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  stageName: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  stageDescription: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  stageMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: COLORS.textDim,
  },
  metricValue: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  otRequirements: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    paddingTop: '0.75rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  laborGap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  laborSide: {
    textAlign: 'center',
    flex: 1,
  },
  laborLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  laborValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  laborVs: {
    fontSize: '1rem',
    color: COLORS.textMuted,
  },
  laborMultiplier: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  aiSolutionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  aiSolutionItem: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  securityGapsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  securityGapItem: {
    padding: '0.75rem',
    marginBottom: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    borderLeft: `3px solid ${COLORS.danger}`,
  },
  opportunityText: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
    borderLeft: `3px solid ${COLORS.blue}`,
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

