'use client'

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
// REFERENCE PAPERS
// ============================================================================

interface Reference {
  id: string
  title: string
  description: string
  category: string
  filename: string
  keyInsights: string[]
}

const REFERENCES: Reference[] = [
  {
    id: 'prerequisites-ai',
    title: 'Prerequisites, Labor Gaps, and the AI Imperative',
    description: 'Why automation and AI are strategic necessities in the build economy. Maps prerequisite dependencies, labor gaps, and demonstrates why AI-enabled automation is the only path to competitive advantage.',
    category: 'Strategic Analysis',
    filename: 'PREREQUISITES_AND_AI_IMPERATIVE.md',
    keyInsights: [
      'China has 4-5x labor cost advantage in prerequisite sectors',
      'AI/automation is not optional — it\'s a strategic necessity',
      'Value chain mapping reveals critical bottlenecks',
      'SFL Scientific positioning within prerequisite automation',
    ],
  },
  {
    id: 'ot-security',
    title: 'Build Economy OT Security Section',
    description: 'Real OT cyber attacks and why AI/connectivity increases risk. Emphasizes the OT security imperative in the build economy with documented case studies.',
    category: 'OT Security',
    filename: 'BUILD_ECONOMY_OT_SECURITY_SECTION.md',
    keyInsights: [
      'Stuxnet, Triton, Colonial Pipeline — real attacks with physical impact',
      'AI/connectivity expands attack surface in new facilities',
      'Security-by-design vs. bolt-on approach',
      'Build cycle creates thousands of new OT environments',
    ],
  },
  {
    id: 'niche-opportunities',
    title: 'Deloitte Niche Opportunities in the Build Economy',
    description: 'Identifies 5 niche opportunities where Deloitte can establish unique positioning: OT Asset Canonization, Commissioning-to-Operate OT Security, Industrial AI Security, EPC/Vendor OT Security Governance, and Build Cycle Intelligence.',
    category: 'Business Development',
    filename: 'DELOITTE_NICHE_OPPORTUNITIES.md',
    keyInsights: [
      'Assurance Twin is unique differentiator',
      'Greenfield security-by-design opportunity',
      'Industrial AI Security is emerging niche',
      'Build Cycle Intelligence connects policy to services',
    ],
  },
  {
    id: 'sector-dependencies',
    title: 'Sector Dependencies Analysis',
    description: 'Detailed analysis of sector-specific dependencies and value chain bottlenecks across rare earths, batteries, nuclear, and other critical sectors.',
    category: 'Sector Analysis',
    filename: 'SECTOR_DEPENDENCIES_ANALYSIS.md',
    keyInsights: [
      'Sector-by-sector value chain mapping',
      'Prerequisite identification methodology',
      'Labor gap quantification',
      'OT requirements by sector',
    ],
  },
  {
    id: 'state-research',
    title: 'State Research Framework',
    description: 'Framework for analyzing state-level industrial policy, incentives, and competitive positioning in the build economy.',
    category: 'Research Methodology',
    filename: 'STATE_RESEARCH_FRAMEWORK.md',
    keyInsights: [
      'State-level policy tracking',
      'Incentive comparison framework',
      'Competitive positioning analysis',
    ],
  },
  {
    id: 'gdp-impact',
    title: 'GDP Impact Validation',
    description: 'Methodology and validation for GDP impact calculations, multiplier effects, and economic modeling of the build economy.',
    category: 'Economic Analysis',
    filename: 'GDP_IMPACT_VALIDATION_NEEDED.md',
    keyInsights: [
      'CBO-validated multiplier ranges',
      'GDP impact calculation methodology',
      'Federal spending composition analysis',
      'Economic modeling framework',
    ],
  },
  {
    id: 'data-guide',
    title: 'Data Update Guide',
    description: 'Technical guide for updating Build Clock data, maintaining the single source of truth, and ensuring consistency across pages.',
    category: 'Technical Documentation',
    filename: 'DATA_UPDATE_GUIDE.md',
    keyInsights: [
      'Single source of truth architecture',
      'Automatic calculation methodology',
      'Data update workflow',
    ],
  },
]

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
    marginBottom: '3rem',
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
    padding: '0.5rem 1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.text,
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    display: 'inline-block',
  },
  introSection: {
    marginBottom: '3rem',
  },
  introText: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: COLORS.textMuted,
    maxWidth: '800px',
  },
  categorySection: {
    marginBottom: '3rem',
  },
  categoryTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: COLORS.accent,
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: `2px solid ${COLORS.border}`,
  },
  referenceCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    transition: 'all 0.2s',
  },
  referenceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  referenceTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
    flex: 1,
  },
  referenceCategory: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: COLORS.blue + '22',
    color: COLORS.blue,
    borderRadius: '4px',
    border: `1px solid ${COLORS.blue}40`,
  },
  referenceDescription: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: COLORS.textMuted,
    marginBottom: '1rem',
  },
  referenceFilename: {
    fontSize: '0.8rem',
    color: COLORS.textDim,
    fontFamily: 'monospace',
    marginBottom: '1rem',
    padding: '0.5rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
  },
  insightsTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: COLORS.accent,
    marginBottom: '0.5rem',
  },
  insightsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  insightItem: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
    paddingLeft: '1rem',
    position: 'relative' as const,
  },
  insightItemBefore: {
    content: '"•"',
    position: 'absolute' as const,
    left: 0,
    color: COLORS.accent,
  },
  footer: {
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: 'center' as const,
    color: COLORS.textMuted,
    fontSize: '0.85rem',
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ReferencesPage() {
  const categories = Array.from(new Set(REFERENCES.map(r => r.category)))

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
            <p style={styles.subtitle}>Reference Papers & Research</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/" style={styles.radarLink}>
              ← Build Clock
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/sectors" style={styles.radarLink}>
              Sector Deep-Dives →
            </Link>
            <Link href="/policy-gaps" style={styles.radarLink}>
              Policy Gaps →
            </Link>
          </div>
        </header>

        <section style={styles.introSection}>
          <p style={styles.introText}>
            This page contains the research papers, analysis frameworks, and strategic documents that underpin the Build Clock analysis. 
            These references provide detailed methodology, sector deep-dives, and business development insights for Deloitte's positioning in the build economy.
          </p>
        </section>

        {categories.map(category => (
          <section key={category} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{category}</h2>
            {REFERENCES.filter(r => r.category === category).map(ref => (
              <div key={ref.id} style={styles.referenceCard}>
                <div style={styles.referenceHeader}>
                  <h3 style={styles.referenceTitle}>{ref.title}</h3>
                  <span style={styles.referenceCategory}>{ref.category}</span>
                </div>
                <p style={styles.referenceDescription}>{ref.description}</p>
                <div style={styles.referenceFilename}>
                  📄 {ref.filename}
                </div>
                <div>
                  <div style={styles.insightsTitle}>Key Insights:</div>
                  <ul style={styles.insightsList}>
                    {ref.keyInsights.map((insight, idx) => (
                      <li key={idx} style={styles.insightItem}>
                        <span style={styles.insightItemBefore}>•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        ))}

        <footer style={styles.footer}>
          <div>
            <p>Internal Use Only • Deloitte Consulting LLP • Operating Transformation</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: COLORS.textDim }}>
              Reference papers are available in the Build Clock repository. Contact the project team for access.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}

