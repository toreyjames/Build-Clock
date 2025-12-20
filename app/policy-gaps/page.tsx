'use client'

import { useMemo, useState, type CSSProperties } from 'react'
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
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

// ============================================================================
// DATA MODEL
// ============================================================================

type SectorTag =
  | 'rare-earths'
  | 'batteries'
  | 'semiconductors'
  | 'nuclear'
  | 'grid'
  | 'ai-infrastructure'
  | 'all'

interface PolicyGap {
  id: string
  icon: string
  title: string
  whyItMatters: string
  whatBreaks: string[]
  resolutionPlaybook: {
    nearTerm: string[]
    structural: string[]
  }
  leadingIndicators: string[]
  sectors: SectorTag[]
}

const POLICY_GAPS: PolicyGap[] = [
  {
    id: 'permitting-speed',
    icon: '🧾',
    title: 'Permitting & Siting Speed (the critical path)',
    whyItMatters:
      'Prerequisite facilities (processing/refining, transmission, new plants) fail mostly on schedule risk. If time-to-permit is unpredictable, capital waits or leaves.',
    whatBreaks: [
      'Projects slip 12–36 months from serial approvals + litigation risk',
      'Cost of capital rises (uncertainty premium), FOAK projects become unbankable',
      'EPC schedules and workforce plans collapse from stop/start approvals',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Set enforceable “shot clocks” for federal permits and coordinated state reviews',
        'Move to one lead agency + one consolidated record for litigation',
        'Expand categorical exclusions / programmatic reviews for repeatable industrial scopes (brownfield expansions, standard utility upgrades)',
      ],
      structural: [
        'Standardize permitting data + templates (common application + digital workflow)',
        'Create pre-approved industrial zones with pre-cleared environmental baselines',
        'Align federal and state environmental permitting to run in parallel, not series',
      ],
    },
    leadingIndicators: [
      'Median time-to-permit for major industrial projects declines',
      'Interagency permit decisions tracked publicly with deadlines',
      'Fewer permit-related injunction delays post-NTP (notice to proceed)',
    ],
    sectors: ['all'],
  },
  {
    id: 'transmission-interconnect',
    icon: '⚡',
    title: 'Transmission + Interconnect (the meta-prerequisite)',
    whyItMatters:
      'Every industrial build (fabs, battery plants, data centers, refineries) is power-constrained. If the grid can’t connect load and generation fast, the pipeline stalls.',
    whatBreaks: [
      '3–5 year interconnect queues block plant commissioning and data center energization',
      'Transformer/substation lead times become the gating item for entire regions',
      'Projects migrate to “power-ready” states, not best-fit states',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Interconnect queue reform: cluster studies, firm milestones, penalties for zombie projects',
        'Fast-track substations, transformer upgrades, and reconductoring as “standard upgrades”',
        'Create “power-ready industrial sites” with pre-built substations and reserved capacity',
      ],
      structural: [
        'Long-range transmission planning + cost allocation that matches new load reality (AI + reindustrialization)',
        'Domestic transformer manufacturing scale-up (capacity + workforce + test labs)',
        'Streamlined federal siting for designated high-value corridors',
      ],
    },
    leadingIndicators: [
      'Average interconnect study time decreases; queue size stabilizes or shrinks',
      'Transformer lead times trend down; domestic production capacity expands',
      'More projects reach COD (commercial operation date) on-time vs. slipping for power',
    ],
    sectors: ['grid', 'ai-infrastructure', 'semiconductors', 'batteries', 'rare-earths', 'nuclear'],
  },
  {
    id: 'midstream-processing',
    icon: '🧪',
    title: 'Midstream Processing (mining/fabs are not enough)',
    whyItMatters:
      'The U.S. can announce end-product plants, but if processing/refining/materials are offshore, the supply chain stays dependent and exposed to shocks.',
    whatBreaks: [
      'Rare earth mining exists, but refining and magnets remain constrained',
      'Battery cell plants exist, but cathode/anode/processing becomes the bottleneck',
      'Semiconductor fabs exist, but chemicals/gases/packaging constrain ramp',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Bridge finance for first-of-a-kind processing plants (loan guarantees, offtake-backed facilities)',
        'Government/industry offtake commitments for processed materials (not just mined ore)',
        'Targeted infrastructure grants for water/waste/rail that processing sites require',
      ],
      structural: [
        'Create a “materials industrial base” program: refining + chemicals + packaging + test infrastructure',
        'Standardize safety/environmental compliance frameworks for chemical processing to reduce rework',
        'Incentivize domestic equipment ecosystems (pumps/valves/reactors, metrology, QA)',
      ],
    },
    leadingIndicators: [
      'New U.S. processing/refining capacity reaches sustained operations (not just groundbreakings)',
      'Domestic content share increases for key materials (processed lithium/nickel, RE oxides, cathode/anode)',
      'Less project slip due to missing upstream inputs during commissioning',
    ],
    sectors: ['rare-earths', 'batteries', 'semiconductors', 'nuclear'],
  },
  {
    id: 'demand-certainty',
    icon: '📉',
    title: 'Demand Certainty (avoid policy whiplash)',
    whyItMatters:
      'Prerequisites need multi-year demand visibility to finance plants. If demand-pull is volatile, investors discount the market and delay capacity.',
    whatBreaks: [
      'Projects built for a demand curve that policy later weakens become stranded or slowed',
      'Supply chain investment pauses even if tariffs increase “need”',
      'OEMs delay volume commitments, which delays prerequisites',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Use long-term procurement/offtake (federal fleets, defense, grid) to stabilize baseline demand',
        'Create demand floors for strategic materials via stockpiles / take-or-pay contracts',
        'Provide stable multi-year guidance windows (even if incentives decline over time)',
      ],
      structural: [
        'Codify long-term industrial strategy with predictable phase-down schedules',
        'Align trade policy with readiness (sequenced restrictions rather than cliffs)',
        'Build domestic standards bodies + testing infrastructure so markets can scale reliably',
      ],
    },
    leadingIndicators: [
      'More long-term offtake contracts signed for prerequisite outputs',
      'Fewer cancellations of midstream plants after policy changes',
      'Improved project finance terms for prerequisite facilities (lower spreads, longer tenors)',
    ],
    sectors: ['all'],
  },
  {
    id: 'trade-sequencing',
    icon: '🧭',
    title: 'Trade + Restriction Sequencing (no “cliffs”)',
    whyItMatters:
      'Tariffs and “foreign-entity” restrictions can accelerate domestic capacity, but only if domestic alternatives can ramp. Otherwise you get inflation and supply disruption.',
    whatBreaks: [
      'Domestic projects face higher input costs before domestic capacity exists',
      'Compliance complexity slows projects (sourcing traceability, licensing concerns)',
      'OEMs and EPCs delay procurement decisions due to rules uncertainty',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Publish clear transition rules and compliant-sourcing pathways (templates, safe harbors)',
        'Prioritize restrictions on the highest-risk categories first; grant temporary waivers where no domestic supply exists',
        'Fund supply chain traceability (origin tracking) so compliance is feasible at scale',
      ],
      structural: [
        'Tie restriction ramp to measurable domestic capacity milestones',
        'Build domestic upstream: test labs, qualification facilities, certified supplier networks',
        'Harmonize trade and industrial policy so incentives and restrictions don’t fight each other',
      ],
    },
    leadingIndicators: [
      'Reduced procurement cycle times (less “wait-and-see” behavior)',
      'Stable pricing for key industrial inputs despite trade actions',
      'Higher share of compliant domestic/ally sourcing over time',
    ],
    sectors: ['all'],
  },
  {
    id: 'workforce-execution',
    icon: '👷',
    title: 'Workforce & Execution Capacity (build + operate)',
    whyItMatters:
      'Prerequisites are labor-intensive (construction + operators + maintenance + QA). The U.S. labor constraint is structural, so productivity has to come from training + automation.',
    whatBreaks: [
      'EPC schedules slip due to craft shortages (welders, electricians, pipefitters)',
      'Plants can’t reach stable ops due to operator/maintenance skill gaps',
      'Quality failures increase (rework, scrap), raising effective cost',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Scale apprenticeships with employer guarantees (hire-on-completion commitments)',
        'Fast-track credential recognition and site-ready training programs',
        'Deploy automation where labor is scarcest (inspection, QA, predictive maintenance)',
      ],
      structural: [
        'Regional “industrial academies” tied to pipeline projects (fabs/batteries/grid)',
        'Rebuild the technician pipeline (community college + union + OEM programs)',
        'Standardize digital work instructions and AI-assisted commissioning to reduce labor content',
      ],
    },
    leadingIndicators: [
      'Reduced craft vacancy rates in key regions',
      'Higher first-pass yield during commissioning and ramp',
      'Fewer schedule slips attributed to labor shortages',
    ],
    sectors: ['all'],
  },
  {
    id: 'ot-security-by-design',
    icon: '🛡️',
    title: 'OT Security-by-Design (commissioning-to-operate)',
    whyItMatters:
      'New builds are adding connectivity + AI. If OT security isn’t designed in early, you get late-stage rework, delays to go-live, and persistent systemic risk.',
    whatBreaks: [
      'Commissioning delays from last-minute security controls and vendor access problems',
      'Expanded attack surface from rushed integrations and unmanaged vendor pathways',
      'Insurance/underwriting friction and compliance failures post go-live',
    ],
    resolutionPlaybook: {
      nearTerm: [
        'Mandate security requirements in EPC/vendor contracts (access, logging, segmentation, SBOM-equivalent for OT)',
        'Create a canonical OT asset baseline at commissioning (single source of truth)',
        'Define incident response for AI-enabled OT (model integrity, sensor spoofing, adversarial vision)',
      ],
      structural: [
        'Commissioning-to-operate security standards (repeatable patterns by sector)',
        'Industrial AI security governance (model lifecycle, data integrity, access controls)',
        'Shared actuarial-style incident data for OT risk benchmarking (build insurer confidence)',
      ],
    },
    leadingIndicators: [
      'Security requirements appear in RFPs and EPC scopes as standard, not add-ons',
      'Lower post-commissioning “urgent remediation” spend',
      'Fewer vendor remote-access exceptions; better segmentation baseline',
    ],
    sectors: ['all'],
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function PolicyGapsPage() {
  const [selectedSector, setSelectedSector] = useState<SectorTag>('all')
  const [expandedGapId, setExpandedGapId] = useState<string>('permitting-speed')

  const visibleGaps = useMemo(() => {
    if (selectedSector === 'all') return POLICY_GAPS
    return POLICY_GAPS.filter(g => g.sectors.includes('all') || g.sectors.includes(selectedSector))
  }, [selectedSector])

  const sectorButtons: { id: SectorTag; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'rare-earths', label: 'Rare Earths' },
    { id: 'batteries', label: 'Batteries' },
    { id: 'semiconductors', label: 'Semiconductors' },
    { id: 'nuclear', label: 'Nuclear' },
    { id: 'grid', label: 'Grid' },
    { id: 'ai-infrastructure', label: 'AI Infrastructure' },
  ]

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
            <p style={styles.subtitle}>Policy & Permitting Gaps: How to Unlock the Prerequisites</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/" style={styles.radarLink}>
              ← Build Clock
            </Link>
            <Link href="/sectors" style={styles.radarLink}>
              Sectors →
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
          </div>
        </header>

        <section style={styles.introSection}>
          <h2 style={styles.introTitle}>The “Prerequisite Unlock” Playbook</h2>
          <p style={styles.introText}>
            The Build Clock tracks the pipeline. This page answers the next question: <strong>what must change</strong> (policy,
            permitting, infrastructure, workforce, security) so prerequisites get built on time.
          </p>
          <div style={styles.filtersRow}>
            <div style={styles.filterLabel}>Filter by sector:</div>
            <div style={styles.filterButtons}>
              {sectorButtons.map(btn => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setSelectedSector(btn.id)}
                  style={{
                    ...styles.filterButton,
                    borderColor: selectedSector === btn.id ? COLORS.accent : COLORS.border,
                    color: selectedSector === btn.id ? COLORS.accent : COLORS.textMuted,
                    backgroundColor: selectedSector === btn.id ? COLORS.accent + '18' : 'transparent',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div style={styles.grid}>
          {/* Left rail: gap list */}
          <aside style={styles.leftRail}>
            <div style={styles.railTitle}>Gaps (click to view)</div>
            {visibleGaps.map(gap => {
              const active = expandedGapId === gap.id
              return (
                <button
                  key={gap.id}
                  type="button"
                  onClick={() => setExpandedGapId(gap.id)}
                  style={{
                    ...styles.gapNavItem,
                    borderColor: active ? COLORS.accent : COLORS.border,
                    backgroundColor: active ? COLORS.accent + '12' : COLORS.bgCard,
                  }}
                >
                  <span style={styles.gapNavIcon}>{gap.icon}</span>
                  <span style={{ ...styles.gapNavText, color: active ? COLORS.text : COLORS.textMuted }}>{gap.title}</span>
                </button>
              )
            })}
          </aside>

          {/* Right: detail */}
          <section style={styles.detailPane}>
            {visibleGaps
              .filter(g => g.id === expandedGapId)
              .map(gap => (
                <div key={gap.id} style={styles.detailCard}>
                  <div style={styles.detailHeader}>
                    <div style={styles.detailIcon}>{gap.icon}</div>
                    <div>
                      <div style={styles.detailTitle}>{gap.title}</div>
                      <div style={styles.detailSub}>{gap.whyItMatters}</div>
                    </div>
                  </div>

                  <div style={styles.detailSection}>
                    <div style={styles.detailSectionTitle}>What breaks if we don’t fix it</div>
                    <ul style={styles.list}>
                      {gap.whatBreaks.map((x, i) => (
                        <li key={i} style={styles.listItem}>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={styles.twoCol}>
                    <div style={styles.detailSection}>
                      <div style={styles.detailSectionTitle}>How to resolve (near-term)</div>
                      <ul style={styles.list}>
                        {gap.resolutionPlaybook.nearTerm.map((x, i) => (
                          <li key={i} style={styles.listItem}>
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={styles.detailSection}>
                      <div style={styles.detailSectionTitle}>How to resolve (structural)</div>
                      <ul style={styles.list}>
                        {gap.resolutionPlaybook.structural.map((x, i) => (
                          <li key={i} style={styles.listItem}>
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={styles.detailSection}>
                    <div style={styles.detailSectionTitle}>Leading indicators (prove it’s improving)</div>
                    <ul style={styles.list}>
                      {gap.leadingIndicators.map((x, i) => (
                        <li key={i} style={styles.listItem}>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={styles.callout}>
                    <div style={styles.calloutIcon}>🧩</div>
                    <div style={styles.calloutText}>
                      <strong>Why this matters for prerequisites:</strong> if this gap stays open, the “end-product” pipeline becomes
                      headline-driven but delivery-constrained. Closing it converts announcements into operating capacity.
                    </div>
                  </div>
                </div>
              ))}
          </section>
        </div>

        {/* ================================================================ */}
        {/* WHO'S ADDRESSING THIS - Market Players + Deloitte/SFL Play */}
        {/* ================================================================ */}
        <section style={{ marginTop: '2rem', padding: '2rem', backgroundColor: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Who's Addressing Prerequisite Unlock?</h2>
          <p style={{ fontSize: '0.9rem', color: COLORS.textMuted, marginBottom: '1.5rem', lineHeight: 1.6 }}>
            No single company solves prerequisites end-to-end. Here's who's active — and where <strong>Deloitte + SFL Scientific</strong> can play.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Rare Earths */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🧲</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rare Earths</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> MP Materials, Lynas (TX), USA Rare Earth<br/>
                <strong>SFL AI:</strong> Solvent extraction optimization, process quality<br/>
                <strong>Deloitte:</strong> OT security, commissioning, program delivery
              </div>
            </div>
            {/* Batteries */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔋</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Batteries</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> Albemarle, Livent, BASF, Redwood<br/>
                <strong>SFL AI:</strong> Batch optimization, thermal runaway prediction<br/>
                <strong>Deloitte:</strong> Supply chain, OT security, operational readiness
              </div>
            </div>
            {/* Semiconductors */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔬</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Semiconductors</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> Applied Materials, Lam, ASML, Air Liquide<br/>
                <strong>SFL AI:</strong> Yield optimization, defect prediction, metrology<br/>
                <strong>Deloitte:</strong> Vendor governance, commissioning OT security
              </div>
            </div>
            {/* Nuclear */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚛️</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nuclear</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> Centrus (HALEU), TerraPower, X-energy, BWX<br/>
                <strong>SFL AI:</strong> Fuel optimization, QA/documentation automation<br/>
                <strong>Deloitte:</strong> NRC compliance, OT security, I&C systems
              </div>
            </div>
            {/* Grid */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Grid</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> Pattern, NextEra, Hitachi, Siemens, ABB<br/>
                <strong>SFL AI:</strong> Load forecasting, grid optimization, pred. maint.<br/>
                <strong>Deloitte:</strong> NERC CIP, substation security, program PMO
              </div>
            </div>
            {/* AI Infrastructure */}
            <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Infrastructure</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: COLORS.textMuted, lineHeight: 1.5 }}>
                <strong>Players:</strong> MSFT, Google, Amazon, Vantage, QTS<br/>
                <strong>SFL AI:</strong> Cooling optimization, power/workload mgmt<br/>
                <strong>Deloitte:</strong> Power strategy, OT security, infra security
              </div>
            </div>
          </div>
          
          {/* Deloitte positioning summary */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem', backgroundColor: COLORS.bg, borderRadius: '10px', border: `1px solid ${COLORS.accent}`, borderLeft: `4px solid ${COLORS.accent}` }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Deloitte + SFL Scientific Positioning</div>
              <div style={{ fontSize: '0.85rem', color: COLORS.textMuted, lineHeight: 1.6 }}>
                <strong>The play:</strong> Integrate policy → prerequisites → implementation. Combine <strong>program delivery</strong> (permitting, siting, PMO) + 
                <strong> supply chain/traceability</strong> (USMCA, FEOC, 45X compliance) + <strong>OT security-by-design</strong> (commissioning-to-operate, vendor governance) + 
                <strong> industrial AI</strong> (SFL: process optimization, quality, predictive maintenance).<br/><br/>
                <strong>SFL Scientific niche:</strong> Position AI at the <strong>core of prerequisite processes</strong> (not just end-products) — as strategic necessity to offset labor cost gap, not nice-to-have.
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <Link href="/sectors" style={{ fontSize: '0.8rem', color: COLORS.accent, textDecoration: 'none', marginRight: '1rem' }}>Sector Deep-Dives (AI use cases) →</Link>
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <span>Build Clock • Policy & Permitting Gaps</span>
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
const styles: Record<string, CSSProperties> = {
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
    gap: '1rem',
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
    whiteSpace: 'nowrap',
  },
  introSection: {
    marginBottom: '1.5rem',
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
    marginBottom: '1.25rem',
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
    fontWeight: 700,
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
    marginBottom: '2rem',
  },
  leftRail: {
    position: 'sticky',
    top: '1rem',
    alignSelf: 'start',
  },
  railTitle: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
    fontWeight: 800,
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  gapNavItem: {
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    padding: '0.85rem',
    marginBottom: '0.75rem',
    cursor: 'pointer',
  },
  gapNavIcon: {
    fontSize: '1.2rem',
  },
  gapNavText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  detailPane: {},
  detailCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '1.75rem',
  },
  detailHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    paddingBottom: '1.25rem',
    marginBottom: '1.25rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  detailIcon: {
    fontSize: '2rem',
    lineHeight: 1,
  },
  detailTitle: {
    fontSize: '1.35rem',
    fontWeight: 800,
    marginBottom: '0.4rem',
  },
  detailSub: {
    fontSize: '0.95rem',
    color: COLORS.textMuted,
    lineHeight: 1.6,
  },
  detailSection: {
    marginBottom: '1.25rem',
  },
  detailSectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: COLORS.accent,
    marginBottom: '0.6rem',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  list: {
    margin: 0,
    paddingLeft: '1.1rem',
    color: COLORS.textMuted,
    fontSize: '0.9rem',
    lineHeight: 1.65,
  },
  listItem: {
    marginBottom: '0.5rem',
  },
  callout: {
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'flex-start',
    marginTop: '1.25rem',
    padding: '1.2rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    borderLeft: `4px solid ${COLORS.blue}`,
  },
  calloutIcon: {
    fontSize: '1.35rem',
    lineHeight: 1,
  },
  calloutText: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    lineHeight: 1.65,
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


