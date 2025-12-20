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
    description: 'Within the AI Manhattan Project framework, this paper maps how each prerequisite sector (power, chips, water, grid, critical minerals) serves the strategic driver — AI data centers. Analyzes labor cost gaps (China $6-8/hr vs. U.S. $30/hr) and demonstrates why AI-enabled automation is the only path to competitive advantage for each "player" in the ecosystem.',
    category: 'AI Manhattan Framework',
    filename: 'PREREQUISITES_AND_AI_IMPERATIVE.md',
    keyInsights: [
      'AI data centers are the strategic driver — all prerequisites serve this demand',
      'China has 4-5x labor cost advantage in prerequisite sectors',
      'AI/automation is not optional — it\'s a strategic necessity for each sector',
      'Dependency mapping reveals how sectors depend on each other',
      'SFL Scientific positioning within prerequisite automation',
    ],
  },
  {
    id: 'sector-dependencies',
    title: 'Sector Dependencies: Industries as Players in AI Manhattan',
    description: 'Detailed analysis positioning each industry (semiconductors, power/nuclear, grid/transmission, water, critical minerals) as "players" in the AI Manhattan Project with varying strategic importance and dependencies. Maps how chips need power and water, power needs grid and nuclear, grid needs transformers and critical minerals — all serving the central demand driver: AI data centers.',
    category: 'AI Manhattan Framework',
    filename: 'SECTOR_DEPENDENCIES_ANALYSIS.md',
    keyInsights: [
      'Each sector\'s role and importance in the AI Manhattan ecosystem',
      'Dependency chains: how sectors depend on each other',
      'Value chain mapping reveals critical bottlenecks between sectors',
      'Strategic positioning of each "player" relative to AI data centers',
      'OT requirements and interdependencies by sector',
    ],
  },
  {
    id: 'ot-security',
    title: 'OT Security in the AI Manhattan Buildout',
    description: 'Real OT cyber attacks and why AI/connectivity increases risk across all sectors in the AI Manhattan Project. Emphasizes the OT security imperative with documented case studies, framed within the context of building thousands of new facilities (data centers, fabs, power plants, grid infrastructure) that all interconnect.',
    category: 'AI Manhattan Framework',
    filename: 'BUILD_ECONOMY_OT_SECURITY_SECTION.md',
    keyInsights: [
      'Stuxnet, Triton, Colonial Pipeline — real attacks with physical impact',
      'AI/connectivity expands attack surface across all AI Manhattan sectors',
      'Security-by-design vs. bolt-on approach for interconnected infrastructure',
      'Build cycle creates thousands of new OT environments across sectors',
      'Inter-sector dependencies create new attack vectors',
    ],
  },
  {
    id: 'niche-opportunities',
    title: 'Deloitte Niche Opportunities in AI Manhattan',
    description: 'Identifies 5 niche opportunities where Deloitte can establish unique positioning within the AI Manhattan Project: OT Asset Canonization, Commissioning-to-Operate OT Security, Industrial AI Security, EPC/Vendor OT Security Governance, and Build Cycle Intelligence. Framed around serving the AI Manhattan ecosystem across all sectors.',
    category: 'Business Development',
    filename: 'DELOITTE_NICHE_OPPORTUNITIES.md',
    keyInsights: [
      'Assurance Twin is unique differentiator across AI Manhattan sectors',
      'Greenfield security-by-design opportunity across all infrastructure',
      'Industrial AI Security is emerging niche for all prerequisite sectors',
      'Build Cycle Intelligence connects policy to services across the ecosystem',
      'Positioning within the AI Manhattan framework',
    ],
  },
  {
    id: 'state-research',
    title: 'State Research Framework: AI Manhattan Alignment',
    description: 'Framework for analyzing state-level industrial policy, incentives, and competitive positioning — reframed to assess how states are positioning themselves to capture AI Manhattan investment. Evaluates which states are winning AI data centers, fabs, power projects, and how they\'re aligning prerequisites.',
    category: 'Research Methodology',
    filename: 'STATE_RESEARCH_FRAMEWORK.md',
    keyInsights: [
      'State-level AI Manhattan investment tracking',
      'Which states are winning in each sector (data centers, fabs, power, grid)',
      'Incentive alignment with AI Manhattan prerequisites',
      'Competitive positioning analysis within the framework',
    ],
  },
  {
    id: 'gdp-impact',
    title: 'GDP Impact Validation: AI Manhattan Economic Framework',
    description: 'Methodology and validation for GDP impact calculations, multiplier effects, and economic modeling — reframed to show how AI Manhattan investments (across all prerequisite sectors) contribute to GDP growth to reduce debt-to-GDP ratio. Shows how each sector\'s investments multiply through the economy.',
    category: 'Economic Analysis',
    filename: 'GDP_IMPACT_VALIDATION_NEEDED.md',
    keyInsights: [
      'CBO-validated multiplier ranges for AI Manhattan sectors',
      'GDP impact calculation methodology across the ecosystem',
      'How sector interdependencies affect multiplier effects',
      'Federal spending composition analysis aligned with AI Manhattan',
      'Economic modeling framework for the entire project',
    ],
  },
  {
    id: 'data-guide',
    title: 'Data Update Guide: AI Manhattan Alignment',
    description: 'Technical guide for updating Build Clock data, maintaining the single source of truth, and ensuring consistency — updated to reflect AI Manhattan alignment requirements. All opportunities must align with AI Manhattan prerequisites (semiconductors, data centers, power, grid, water, critical minerals).',
    category: 'Technical Documentation',
    filename: 'DATA_UPDATE_GUIDE.md',
    keyInsights: [
      'Single source of truth architecture for AI Manhattan sectors',
      'Automatic calculation methodology aligned with framework',
      'Data update workflow ensuring AI Manhattan alignment',
      'Sector classification within the dependency structure',
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
            <p style={styles.subtitle}>Reference Papers & Research: AI Manhattan Project Framework</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Link href="/" style={styles.radarLink}>
              ← Build Clock
            </Link>
            <Link href="/opportunities" style={styles.radarLink}>
              Opportunity Radar →
            </Link>
            <Link href="/ai-opportunities" style={styles.radarLink}>
              SFL →
            </Link>
          </div>
        </header>

        <section style={styles.introSection}>
          <p style={styles.introText}>
            <strong>The AI Manhattan Project</strong> — the strategic buildout of AI data centers and supporting infrastructure — 
            serves as the overarching framework for all industrial investment. Each industry (semiconductors, power, grid, water, 
            critical minerals) functions as a "player" with varying strategic importance and dependencies on one another. These 
            reference papers analyze how each sector contributes to the AI Manhattan ecosystem, their interdependencies, and the 
            strategic positioning opportunities within this framework.
          </p>
          <p style={styles.introText}>
            The papers below provide detailed methodology, sector analysis, and business development insights, all framed within 
            the AI Manhattan Project context — where AI data centers are the strategic driver, and everything else exists to 
            serve that demand.
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




