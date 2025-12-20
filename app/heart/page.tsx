'use client'

import Link from 'next/link'
import { useState } from 'react'

// ============================================================================
// COLORS & THEME
// ============================================================================
const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  bgCardAlt: '#161b22',
  border: '#21262d',
  borderLight: '#30363d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  textDim: '#484f58',
  accent: '#7ee787',
  accentDim: '#238636',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
  pink: '#f778ba',
  heart: '#f85149',
  heartGlow: 'rgba(248, 81, 73, 0.3)',
}

// ============================================================================
// INFRASTRUCTURE DATA (from tariff-tracker)
// ============================================================================
const INFRASTRUCTURE = {
  dataCenters: { needed: 200, tracked: 150, icon: '🧠', name: 'Data Centers', color: COLORS.purple },
  chips: { needed: 350, tracked: 295, icon: '🔬', name: 'AI Chips', color: COLORS.blue },
  power: { needed: 150, tracked: 115, icon: '⚡', name: 'Power Generation', color: COLORS.warning },
  grid: { needed: 200, tracked: 85, icon: '🔌', name: 'Grid & Transmission', color: COLORS.danger },
  water: { needed: 25, tracked: 12, icon: '💧', name: 'Water & Cooling', color: COLORS.accent },
}

const TOTAL_NEEDED = Object.values(INFRASTRUCTURE).reduce((sum, i) => sum + i.needed, 0)
const TOTAL_TRACKED = Object.values(INFRASTRUCTURE).reduce((sum, i) => sum + i.tracked, 0)

// ============================================================================
// PROBLEMS / "HEARTS" - AI solving America's hardest problems
// ============================================================================
interface HeartProblem {
  id: string
  icon: string
  title: string
  subtitle: string
  problem: {
    headline: string
    stats: { value: string; label: string }[]
    humanCost: string
  }
  aiSolution: {
    approach: string
    howItWorks: string[]
    improvement: string
  }
  dataNeeded: string[]
  computeIntensity: 'medium' | 'high' | 'very-high'
  infrastructureNeed: string
  timeline: string
  status: 'emerging' | 'developing' | 'proven'
}

const HEART_PROBLEMS: HeartProblem[] = [
  {
    id: 'cancer',
    icon: '🔬',
    title: 'Early Cancer Detection',
    subtitle: 'Finding cancer years before symptoms appear',
    problem: {
      headline: 'We catch cancer too late.',
      stats: [
        { value: '600K', label: 'Americans die of cancer yearly' },
        { value: '1 in 3', label: 'Americans will get cancer' },
        { value: '90%+', label: 'Stage 1 survival rate' },
        { value: '~20%', label: 'Stage 4 survival rate' },
      ],
      humanCost: 'Your mom. Your dad. Your spouse. You. Caught early, most cancers are beatable. Caught late, many are death sentences. The difference is detection.',
    },
    aiSolution: {
      approach: 'AI trained on 50 million+ medical images learns patterns invisible to human eyes',
      howItWorks: [
        'Train AI on millions of X-rays, CT scans, MRIs paired with outcomes',
        'AI learns: "This subtle shadow pattern → cancer develops in 3 years"',
        'Patterns too faint, too complex for humans to perceive',
        'AI never gets tired, never rushes, never misses',
        'Doctors + AI together > either alone',
      ],
      improvement: '2-3 years earlier detection → dramatically higher survival rates',
    },
    dataNeeded: ['50M+ medical images', 'Patient outcomes (what happened after?)', 'Genomic data for personalization', 'Treatment response data'],
    computeIntensity: 'high',
    infrastructureNeed: 'Visual AI models need massive image processing. Training requires thousands of GPUs for weeks.',
    timeline: '2-5 years to widespread deployment',
    status: 'proven',
  },
  {
    id: 'drug-discovery',
    icon: '💊',
    title: 'Drug Discovery',
    subtitle: 'Cures in years, not decades',
    problem: {
      headline: 'New drugs take too long and cost too much.',
      stats: [
        { value: '10-15 yrs', label: 'Average drug development time' },
        { value: '$2.6B', label: 'Average cost per new drug' },
        { value: '90%', label: 'Failure rate in clinical trials' },
        { value: '7,000+', label: 'Rare diseases with no treatment' },
      ],
      humanCost: "Alzheimer's, ALS, Parkinson's, thousands of rare diseases — people die waiting for cures that move at bureaucratic speed.",
    },
    aiSolution: {
      approach: 'AI simulates molecular interactions, predicts what works before expensive lab trials',
      howItWorks: [
        'AlphaFold solved protein structures that took decades — in hours',
        'AI tests millions of virtual compounds before making any in lab',
        'Predicts which candidates will fail before spending years on them',
        'Finds unexpected connections across diseases',
        'Designs novel molecules optimized for specific targets',
      ],
      improvement: 'Cut development time by 50-70%, find cures for "undruggable" diseases',
    },
    dataNeeded: ['Molecular structures database', 'Clinical trial results', 'Protein interaction data', 'Patient response data'],
    computeIntensity: 'very-high',
    infrastructureNeed: 'Molecular simulation is the most compute-intensive AI application. Requires extreme parallelism.',
    timeline: '3-7 years to transformed pipeline',
    status: 'developing',
  },
  {
    id: 'education',
    icon: '📚',
    title: 'Personalized Education',
    subtitle: 'Every child learns their way',
    problem: {
      headline: 'One-size-fits-all education fails most kids.',
      stats: [
        { value: '66%', label: 'Students not proficient in reading' },
        { value: '30:1', label: 'Typical student-teacher ratio' },
        { value: '1 in 6', label: 'Students significantly behind grade level' },
        { value: '$800B', label: 'Annual US education spending' },
      ],
      humanCost: 'Kids who learn differently get left behind. The student who needs visual learning, the one who needs more time, the one bored by the pace — all forced through the same pipe.',
    },
    aiSolution: {
      approach: 'AI tutors that adapt to how each individual student learns',
      howItWorks: [
        'Identifies exactly where each student is confused',
        'Adapts explanation style to how that student learns best',
        'Provides infinite patience, instant feedback',
        'Frees teachers to do what humans do best: inspire, mentor, connect',
        'Closes achievement gaps by giving every kid a personal tutor',
      ],
      improvement: 'Studies show AI tutoring can double learning speed for struggling students',
    },
    dataNeeded: ['Learning pattern data', 'What explanations work for which students', 'Curriculum content', 'Assessment results'],
    computeIntensity: 'medium',
    infrastructureNeed: 'Needs fast inference at scale — millions of students, real-time responses.',
    timeline: '1-3 years to widespread access',
    status: 'proven',
  },
  {
    id: 'energy',
    icon: '⚡',
    title: 'Energy Abundance',
    subtitle: 'Clean, cheap, reliable power for all',
    problem: {
      headline: 'Our grid is fragile, dirty, and expensive.',
      stats: [
        { value: '70%', label: 'Grid infrastructure over 25 years old' },
        { value: '$150B', label: 'Annual cost of power outages' },
        { value: '60%', label: 'Electricity still from fossil fuels' },
        { value: '2-3x', label: 'Power demand increase expected by 2040' },
      ],
      humanCost: 'Blackouts. High bills. Climate damage. Energy poverty. The foundation of modern life is crumbling while demand explodes.',
    },
    aiSolution: {
      approach: 'AI optimizes the grid in real-time, accelerates fusion/storage research',
      howItWorks: [
        'Predicts demand before it happens — hours, days ahead',
        'Routes power around failures before they cascade',
        'Integrates renewables by predicting wind/solar output',
        'Accelerates materials discovery for better batteries, fusion',
        'Finds efficiencies invisible to human operators',
      ],
      improvement: '30-40% efficiency gains, near-zero blackouts, faster path to clean energy',
    },
    dataNeeded: ['Real-time grid sensor data', 'Weather predictions', 'Demand patterns', 'Equipment failure history'],
    computeIntensity: 'high',
    infrastructureNeed: 'Real-time processing at grid scale. Edge compute at substations + central AI.',
    timeline: '2-5 years to smart grid deployment',
    status: 'developing',
  },
  {
    id: 'manufacturing',
    icon: '🏭',
    title: 'Manufacturing Renaissance',
    subtitle: 'Built in America, better than before',
    problem: {
      headline: 'We forgot how to make things.',
      stats: [
        { value: '11%', label: 'Manufacturing share of GDP (was 28%)' },
        { value: '5M', label: 'Manufacturing jobs lost since 2000' },
        { value: '90%', label: 'Advanced chips made overseas' },
        { value: '100%', label: 'Rare earth processing in China' },
      ],
      humanCost: 'Hollowed-out towns. Supply chain vulnerabilities. Strategic dependence on adversaries. A generation told "learn to code" while their communities died.',
    },
    aiSolution: {
      approach: 'AI makes American manufacturing competitive despite higher labor costs',
      howItWorks: [
        'Quality control: AI catches defects humans miss',
        'Process optimization: AI finds efficiencies that offset labor cost gap',
        'Predictive maintenance: AI prevents failures before they happen',
        'Human-AI partnership: Workers supervise AI systems, not replaced by them',
        'Automation where it matters, human judgment where it counts',
      ],
      improvement: 'Close the labor cost gap through productivity, bring production home',
    },
    dataNeeded: ['Production line data', 'Quality metrics', 'Equipment sensor data', 'Process parameters'],
    computeIntensity: 'medium',
    infrastructureNeed: 'Edge compute in factories, real-time quality inspection, predictive systems.',
    timeline: 'Already happening — accelerating 2025-2030',
    status: 'emerging',
  },
]

// ============================================================================
// STYLES
// ============================================================================
const styles: { [key: string]: React.CSSProperties } = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
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
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  navLink: {
    color: COLORS.textMuted,
    textDecoration: 'none',
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
    transition: 'all 0.2s',
  },
  
  // Hero Section
  hero: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    marginBottom: '3rem',
    background: `radial-gradient(ellipse at center, ${COLORS.heartGlow} 0%, transparent 70%)`,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
  },
  heroIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    display: 'block',
    animation: 'pulse 2s ease-in-out infinite',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: COLORS.textMuted,
    maxWidth: '700px',
    margin: '0 auto 2rem auto',
    lineHeight: 1.6,
  },
  heroExplainer: {
    fontSize: '1rem',
    color: COLORS.textDim,
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: 1.7,
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },

  // Section styles
  section: {
    marginBottom: '4rem',
  },
  sectionHeader: {
    marginBottom: '2rem',
  },
  sectionKicker: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: COLORS.heart,
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    margin: 0,
  },

  // Problem Cards
  problemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  problemCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  problemCardActive: {
    backgroundColor: COLORS.bgCardAlt,
    borderColor: COLORS.heart,
    boxShadow: `0 0 20px ${COLORS.heartGlow}`,
  },
  problemCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  problemCardIcon: {
    fontSize: '2rem',
  },
  problemCardTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: 0,
  },
  problemCardSubtitle: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    margin: 0,
  },
  problemCardStatus: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 600,
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    marginTop: '0.75rem',
  },

  // Detail Panel
  detailPanel: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '3rem',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  detailIcon: {
    fontSize: '3rem',
  },
  detailTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: 0,
  },
  detailSubtitle: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    margin: '0.25rem 0 0 0',
  },

  // Problem Section
  problemSection: {
    marginBottom: '2.5rem',
  },
  problemHeadline: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.danger,
    margin: '0 0 1.5rem 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statBox: {
    backgroundColor: COLORS.bgCardAlt,
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    margin: '0.25rem 0 0 0',
  },
  humanCost: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    lineHeight: 1.7,
    fontStyle: 'italic',
    padding: '1rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '8px',
    borderLeft: `3px solid ${COLORS.danger}`,
  },

  // Solution Section
  solutionSection: {
    marginBottom: '2.5rem',
  },
  solutionHeadline: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: COLORS.accent,
    margin: '0 0 1rem 0',
  },
  solutionApproach: {
    fontSize: '1.1rem',
    color: COLORS.text,
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
  howItWorksList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 1.5rem 0',
  },
  howItWorksItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
  },
  howItWorksNumber: {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    backgroundColor: COLORS.accentDim,
    color: COLORS.text,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  improvement: {
    fontSize: '1rem',
    color: COLORS.accent,
    fontWeight: 600,
    padding: '1rem',
    backgroundColor: 'rgba(126, 231, 135, 0.1)',
    borderRadius: '8px',
    borderLeft: `3px solid ${COLORS.accent}`,
  },

  // Chain Section
  chainSection: {
    marginBottom: '2.5rem',
  },
  chainTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: COLORS.text,
    margin: '0 0 1.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chainVisual: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  chainNode: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  chainNodeIcon: {
    fontSize: '1.5rem',
    width: '40px',
    textAlign: 'center' as const,
  },
  chainNodeContent: {
    flex: 1,
  },
  chainNodeName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    margin: 0,
  },
  chainNodeDetail: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    margin: '0.25rem 0 0 0',
  },
  chainArrow: {
    textAlign: 'center' as const,
    color: COLORS.textDim,
    fontSize: '1.25rem',
    padding: '0.25rem 0',
  },
  chainNodeBar: {
    width: '100px',
    height: '6px',
    backgroundColor: COLORS.bgCard,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  chainNodeBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s',
  },

  // Infrastructure Summary
  infraSummary: {
    backgroundColor: COLORS.bgCardAlt,
    padding: '1.5rem',
    borderRadius: '12px',
    border: `1px solid ${COLORS.border}`,
    marginTop: '2rem',
  },
  infraSummaryTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 1rem 0',
    color: COLORS.text,
  },
  infraGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infraItem: {
    textAlign: 'center' as const,
  },
  infraIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  infraName: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    margin: '0 0 0.25rem 0',
  },
  infraBar: {
    height: '8px',
    backgroundColor: COLORS.bgCard,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  infraBarFill: {
    height: '100%',
    borderRadius: '4px',
  },
  infraPercent: {
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  infraTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  infraTotalLabel: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
  },
  infraTotalValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.accent,
  },

  // CTA Section
  ctaSection: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
    marginTop: '3rem',
  },
  ctaTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
  },
  ctaText: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    maxWidth: '600px',
    margin: '0 auto 2rem auto',
    lineHeight: 1.7,
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  ctaButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  ctaButtonSecondary: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: COLORS.text,
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    border: `1px solid ${COLORS.border}`,
    transition: 'all 0.2s',
  },
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function HeartPage() {
  const [selectedProblem, setSelectedProblem] = useState<string>('cancer')
  
  const activeProblem = HEART_PROBLEMS.find(p => p.id === selectedProblem) || HEART_PROBLEMS[0]
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'proven':
        return { backgroundColor: 'rgba(126, 231, 135, 0.2)', color: COLORS.accent }
      case 'developing':
        return { backgroundColor: 'rgba(88, 166, 255, 0.2)', color: COLORS.blue }
      case 'emerging':
        return { backgroundColor: 'rgba(210, 153, 34, 0.2)', color: COLORS.warning }
      default:
        return { backgroundColor: 'rgba(125, 133, 144, 0.2)', color: COLORS.textMuted }
    }
  }

  const getComputeLabel = (intensity: string) => {
    switch (intensity) {
      case 'very-high': return 'Extreme compute needed'
      case 'high': return 'High compute needed'
      case 'medium': return 'Moderate compute needed'
      default: return 'Compute needed'
    }
  }

  return (
    <main style={styles.main}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ color: COLORS.accent }}>BUILD</span> CLOCK
              </Link>
            </h1>
            <p style={styles.subtitle}>The Heart: AI Solving America's Hardest Problems</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/" style={styles.navLink}>← Home</Link>
            <Link href="/opportunities" style={styles.navLink}>Pipeline →</Link>
          </div>
        </header>

        {/* Hero Section */}
        <section style={styles.hero}>
          <span style={styles.heroIcon}>❤️</span>
          <h2 style={styles.heroTitle}>The Heart</h2>
          <p style={styles.heroSubtitle}>
            The infrastructure we track isn't the goal. It's the body that keeps the heart beating.
            The heart is AI — trained on the right data, running on the right chips — solving the problems 
            that have resisted solution for decades.
          </p>
          <div style={styles.heroExplainer}>
            <strong>How this connects:</strong> Every data center, every chip fab, every power plant we track 
            enables AI models to solve real problems. Without the infrastructure, AI stays in labs. 
            With it, AI reaches every American — detecting cancer earlier, educating every child, 
            bringing manufacturing home.
          </div>
        </section>

        {/* What Works Now vs. What We Need */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>THE REALITY CHECK</div>
            <h2 style={styles.sectionTitle}>What AI Can Do Now vs. What We Need to Build</h2>
            <p style={styles.sectionSubtitle}>AI isn&apos;t magic. Here&apos;s what actually works — and what we still need to figure out.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* What Works Now */}
            <div style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.accentDim}`,
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: COLORS.accent,
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span>✅</span> What Works Now
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.accent }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Clear wins:</strong> AI is great at problems with clear answers — drug molecules that bind to targets, energy grids that stay stable, manufacturing defects that are obvious.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.accent }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Local AI:</strong> AI that runs on your computer (like doctors&apos; workstations, school computers) works better than cloud-only — it sees your data, your context, your tools.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.accent }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Specialized apps:</strong> AI apps built for specific problems (cancer detection app, education app) work better than trying to use one general AI for everything.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.accent }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Visual outputs:</strong> AI that shows you images, diagrams, and visualizations (not just text) helps doctors, teachers, and engineers understand what it&apos;s thinking.</span>
                </li>
              </ul>
            </div>

            {/* What We Need to Build */}
            <div style={{
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.warning}`,
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: COLORS.warning,
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span>🔨</span> What We Need to Build
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.warning }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Long-term tracking:</strong> Cancer detection success shows up 2-3 years later. We need systems that track outcomes for years, not just train on today&apos;s data.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.warning }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Human-AI teams:</strong> AI is brilliant in some areas, confused in others. We need doctors, teachers, and engineers working with AI, not replaced by it.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.warning }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Real-world testing:</strong> AI that aces tests but fails in real hospitals or classrooms isn&apos;t useful. We need validation in the real world, not just benchmarks.</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: COLORS.textMuted,
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: COLORS.warning }}>•</span>
                  <span><strong style={{ color: COLORS.text }}>Data infrastructure:</strong> AI needs the right data at the right time. We need systems that gather patient history, student records, factory data — and keep it private and secure.</span>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            backgroundColor: COLORS.bgCardAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              color: COLORS.textMuted,
              lineHeight: 1.7,
              margin: 0,
            }}>
              <strong style={{ color: COLORS.text }}>The bottom line:</strong> AI can solve these problems, but only if we build the right infrastructure. 
              Not just data centers and chips — but systems that track long-term outcomes, connect AI to real-world tools, 
              and keep humans in the loop. That&apos;s what the AI Manhattan Project is really about: building AI that actually works, 
              not just AI that looks good on paper.
            </p>
          </div>
        </section>

        {/* Problems Grid */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>AMERICA&apos;S HARDEST PROBLEMS</div>
            <h2 style={styles.sectionTitle}>What AI Can Solve</h2>
            <p style={styles.sectionSubtitle}>Select a problem to see how AI solves it — and what infrastructure it requires</p>
          </div>

          <div style={styles.problemGrid}>
            {HEART_PROBLEMS.map(problem => (
              <div 
                key={problem.id}
                style={{
                  ...styles.problemCard,
                  ...(selectedProblem === problem.id ? styles.problemCardActive : {}),
                }}
                onClick={() => setSelectedProblem(problem.id)}
              >
                <div style={styles.problemCardHeader}>
                  <span style={styles.problemCardIcon}>{problem.icon}</span>
                  <div>
                    <h3 style={styles.problemCardTitle}>{problem.title}</h3>
                    <p style={styles.problemCardSubtitle}>{problem.subtitle}</p>
                  </div>
                </div>
                <span style={{ ...styles.problemCardStatus, ...getStatusStyle(problem.status) }}>
                  {problem.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Detail Panel */}
        <section style={styles.detailPanel}>
          <div style={styles.detailHeader}>
            <span style={styles.detailIcon}>{activeProblem.icon}</span>
            <div>
              <h2 style={styles.detailTitle}>{activeProblem.title}</h2>
              <p style={styles.detailSubtitle}>{activeProblem.subtitle}</p>
            </div>
          </div>

          {/* The Problem */}
          <div style={styles.problemSection}>
            <h3 style={styles.problemHeadline}>{activeProblem.problem.headline}</h3>
            <div style={styles.statsGrid}>
              {activeProblem.problem.stats.map((stat, i) => (
                <div key={i} style={styles.statBox}>
                  <p style={styles.statValue}>{stat.value}</p>
                  <p style={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
            <p style={styles.humanCost}>{activeProblem.problem.humanCost}</p>
          </div>

          {/* The AI Solution */}
          <div style={styles.solutionSection}>
            <h3 style={styles.solutionHeadline}>How AI Solves This</h3>
            <p style={styles.solutionApproach}>{activeProblem.aiSolution.approach}</p>
            <ul style={styles.howItWorksList}>
              {activeProblem.aiSolution.howItWorks.map((step, i) => (
                <li key={i} style={styles.howItWorksItem}>
                  <span style={styles.howItWorksNumber}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <p style={styles.improvement}>
              <strong>The improvement:</strong> {activeProblem.aiSolution.improvement}
            </p>
          </div>

          {/* The Chain */}
          <div style={styles.chainSection}>
            <h3 style={styles.chainTitle}>
              <span>🔗</span> The Chain: From Problem to Solution
            </h3>
            <div style={styles.chainVisual}>
              {/* Lives Saved / Problem Solved */}
              <div style={{ ...styles.chainNode, borderColor: COLORS.heart, borderWidth: '2px' }}>
                <span style={styles.chainNodeIcon}>❤️</span>
                <div style={styles.chainNodeContent}>
                  <p style={styles.chainNodeName}>{activeProblem.title}</p>
                  <p style={styles.chainNodeDetail}>{activeProblem.aiSolution.improvement}</p>
                </div>
              </div>
              
              <div style={styles.chainArrow}>↑ enables</div>
              
              {/* AI Model */}
              <div style={styles.chainNode}>
                <span style={styles.chainNodeIcon}>🤖</span>
                <div style={styles.chainNodeContent}>
                  <p style={styles.chainNodeName}>AI Model</p>
                  <p style={styles.chainNodeDetail}>{activeProblem.aiSolution.approach}</p>
                </div>
              </div>
              
              <div style={styles.chainArrow}>↑ trained on</div>
              
              {/* Data */}
              <div style={styles.chainNode}>
                <span style={styles.chainNodeIcon}>📊</span>
                <div style={styles.chainNodeContent}>
                  <p style={styles.chainNodeName}>Training Data</p>
                  <p style={styles.chainNodeDetail}>{activeProblem.dataNeeded.join(', ')}</p>
                </div>
              </div>
              
              <div style={styles.chainArrow}>↑ processed by</div>
              
              {/* Compute */}
              <div style={styles.chainNode}>
                <span style={styles.chainNodeIcon}>🧠</span>
                <div style={styles.chainNodeContent}>
                  <p style={styles.chainNodeName}>Compute Infrastructure</p>
                  <p style={styles.chainNodeDetail}>{activeProblem.infrastructureNeed}</p>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: activeProblem.computeIntensity === 'very-high' ? 'rgba(248, 81, 73, 0.2)' : 
                                   activeProblem.computeIntensity === 'high' ? 'rgba(210, 153, 34, 0.2)' : 
                                   'rgba(88, 166, 255, 0.2)',
                  color: activeProblem.computeIntensity === 'very-high' ? COLORS.danger : 
                         activeProblem.computeIntensity === 'high' ? COLORS.warning : 
                         COLORS.blue,
                  borderRadius: '4px',
                  fontWeight: 600,
                }}>
                  {getComputeLabel(activeProblem.computeIntensity)}
                </span>
              </div>
              
              <div style={styles.chainArrow}>↑ powered by</div>
              
              {/* Infrastructure */}
              <div style={{ ...styles.chainNode, borderColor: COLORS.accent }}>
                <span style={styles.chainNodeIcon}>🔌</span>
                <div style={styles.chainNodeContent}>
                  <p style={styles.chainNodeName}>Physical Infrastructure</p>
                  <p style={styles.chainNodeDetail}>Chips → Data Centers → Power → Grid → Water</p>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Summary */}
          <div style={styles.infraSummary}>
            <h4 style={styles.infraSummaryTitle}>What Build Clock Tracks: The Infrastructure This Heart Needs</h4>
            <div style={styles.infraGrid}>
              {Object.entries(INFRASTRUCTURE).map(([key, infra]) => {
                const percent = Math.round((infra.tracked / infra.needed) * 100)
                return (
                  <div key={key} style={styles.infraItem}>
                    <span style={styles.infraIcon}>{infra.icon}</span>
                    <p style={styles.infraName}>{infra.name}</p>
                    <div style={styles.infraBar}>
                      <div style={{ 
                        ...styles.infraBarFill, 
                        width: `${percent}%`,
                        backgroundColor: infra.color,
                      }} />
                    </div>
                    <span style={{ ...styles.infraPercent, color: infra.color }}>{percent}%</span>
                  </div>
                )
              })}
            </div>
            <div style={styles.infraTotal}>
              <span style={styles.infraTotalLabel}>
                ${TOTAL_TRACKED}B tracked of ${TOTAL_NEEDED}B needed
              </span>
              <span style={styles.infraTotalValue}>
                {Math.round((TOTAL_TRACKED / TOTAL_NEEDED) * 100)}% Coverage
              </span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>This Is What We're Building</h2>
          <p style={styles.ctaText}>
            Not just infrastructure for infrastructure's sake. Every chip fab, every data center, 
            every power plant tracked on Build Clock is part of the chain that makes these solutions real.
            <br /><br />
            <strong>The infrastructure is the body. The AI solving problems is the heart. Together, they transform America.</strong>
          </p>
          <div style={styles.ctaButtons}>
            <Link href="/" style={styles.ctaButton}>
              See What We&apos;re Building →
            </Link>
            <Link href="/opportunities" style={styles.ctaButtonSecondary}>
              Explore the Pipeline
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

