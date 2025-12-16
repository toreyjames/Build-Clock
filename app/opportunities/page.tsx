'use client'

import { useState } from 'react'
import Link from 'next/link'
import { opportunities, type Opportunity } from '../../lib/data/opportunities'

// ============================================================================
// COLORS & THEME (matching Build Clock)
// ============================================================================
const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  accent: '#7ee787',       // Hamiltonian green
  accentDim: '#238636',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

// ============================================================================
// OPPORTUNITY DATA - Now imported from shared lib/data/opportunities.ts
// ============================================================================
// All opportunities are managed in lib/data/opportunities.ts

// ============================================================================
// UTILITY FUNCTIONS


const formatCurrency = (millions: number) => {
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B';
  return '$' + millions + 'M';
};

const formatNumber = (n: number) => n.toLocaleString();

const getSectorLabel = (sector: string) => ({
  'semiconductors': 'Semiconductors',
  'ev-battery': 'EV & Battery',
  'clean-energy': 'Clean Energy',
  'data-centers': 'Data Centers',
  'pharma': 'Pharma',
  'defense': 'Defense',
  'advanced-mfg': 'Advanced Mfg',
  'nuclear': 'Nuclear',
  'oil-gas': 'Oil & Gas',
  'critical-minerals': 'Critical Minerals',
}[sector]);

const getStageLabel = (stage: string) => ({
  'monitoring': 'Monitoring',
  'pre-rfp': 'Pre-RFP',
  'rfp-open': 'RFP Open',
  'proposal-submitted': 'Proposal In',
  'evaluation': 'In Evaluation',
  'awarded': 'Won',
  'lost': 'Lost',
}[stage]);

const getStageColor = (stage: string) => ({
  'monitoring': COLORS.textMuted,
  'pre-rfp': COLORS.purple,
  'rfp-open': COLORS.blue,
  'proposal-submitted': COLORS.warning,
  'evaluation': COLORS.warning,
  'awarded': COLORS.accent,
  'lost': COLORS.danger,
}[stage]);

const getRfpStatusLabel = (status: string) => ({
  'not-issued': 'Not Issued',
  'expected': 'Expected',
  'open': 'Open',
  'closed': 'Closed',
}[status]);

const getRelationshipLabel = (rel: string) => ({
  'none': 'No Relationship',
  'known': 'Known Contact',
  'active-pursuit': 'Active Pursuit',
  'teaming': 'Teaming',
  'incumbent': 'Incumbent',
}[rel]);

const getPriorityColor = (priority: string) => ({
  'hot': COLORS.danger,
  'warm': COLORS.warning,
  'tracking': COLORS.textMuted,
}[priority]);

const NOW = new Date();
const parseISODate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

type Horizon = 'now' | 'next' | 'soon' | 'later' | 'none';
const getHorizon = (milestoneDate: string | null | undefined): Horizon => {
  const d = parseISODate(milestoneDate);
  if (!d) return 'none';
  const diffDays = Math.ceil((d.getTime() - NOW.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'now';
  if (diffDays <= 90) return 'next';
  if (diffDays <= 180) return 'soon';
  return 'later';
};

const inferOtRelevance = (opp: Opportunity) => {
  if (opp.otRelevance) return opp.otRelevance;
  if (opp.services.includes('smart-factory') || opp.services.includes('ot-strategy')) return 'core';
  if (opp.services.includes('erp') || opp.services.includes('supply-chain') || opp.services.includes('workforce')) return 'adjacent';
  return 'low';
};

const getOtLabel = (r: string | undefined) => r === 'core' ? 'OT Core' : r === 'adjacent' ? 'OT Adjacent' : 'OT Low';

const getOtColor = (r: string | undefined) => r === 'core' ? COLORS.accent : r === 'adjacent' ? COLORS.warning : COLORS.textMuted;

const getFrontierLabel = (f: string | undefined) => ({
  'leading-edge': '★★★★★ Leading Edge',
  'advanced': '★★★★☆ Advanced',
  'mature': '★★★☆☆ Mature',
  'commodity': '★★☆☆☆ Commodity',
}[f || 'mature']);

const getFrontierColor = (f: string | undefined) => ({
  'leading-edge': COLORS.accent,
  'advanced': COLORS.blue,
  'mature': COLORS.warning,
  'commodity': COLORS.textMuted,
}[f || 'mature']);

const getEconomicImpactLabel = (e: string | undefined) => ({
  'transformational': 'Transformational (3-5x GDP)',
  'catalytic': 'Catalytic (2-3x GDP)',
  'significant': 'Significant (1-2x GDP)',
  'direct-only': 'Direct Only (<1x GDP)',
}[e || 'direct-only']);

const getEconomicImpactColor = (e: string | undefined) => ({
  'transformational': COLORS.accent,
  'catalytic': COLORS.blue,
  'significant': COLORS.warning,
  'direct-only': COLORS.textMuted,
}[e || 'direct-only']);

const isRfpPastDue = (opp: Opportunity) => {
  if (opp.rfpStatus !== 'open') return false;
  const d = parseISODate(opp.rfpDueDate);
  if (!d) return false;
  return d.getTime() < NOW.getTime();
};

// ============================================================================
// COMPONENT
// ============================================================================
type ViewMode = 'cards' | 'table' | 'timeline';

export default function OpportunitiesPage() {
  const [viewMode, setViewMode] = useState('cards');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedOt, setSelectedOt] = useState('core');
  const [selectedHorizon, setSelectedHorizon] = useState('next');
  const [includeSoon, setIncludeSoon] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = opportunities.filter(opp => {
    if (selectedStage !== 'all' && opp.procurementStage !== selectedStage) return false;
    if (selectedPriority !== 'all' && opp.priority !== selectedPriority) return false;
    const ot = inferOtRelevance(opp);
    if (selectedOt !== 'all' && ot !== selectedOt) return false;
    const horizon = getHorizon(opp.nextMilestone?.date);
    if (selectedHorizon !== 'all') {
      if (includeSoon && selectedHorizon === 'next') {
        if (!(horizon === 'next' || horizon === 'soon')) return false;
      } else {
        if (horizon !== selectedHorizon) return false;
      }
    }
    return true;
  });

  const totalPipeline = opportunities.reduce((sum, o) => sum + o.investmentSize, 0);
  const openRfps = opportunities.filter(o => {
    if (o.rfpStatus !== 'open' || !o.rfpUrl) return false;
    if (isRfpPastDue(o)) return false;
    if (!o.rfpDueDate) return o.rfpVisibility === 'public';
    return true;
  }).length;
  const inEvaluation = opportunities.filter(o => o.procurementStage === 'evaluation').length;
  const hotCount = opportunities.filter(o => o.priority === 'hot').length;

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <Link href="/" style={styles.backLink}>← Build Clock</Link>
            <h1 style={styles.title}>
              <span style={{ color: COLORS.accent }}>OPPORTUNITY</span> RADAR
            </h1>
            <p style={styles.subtitle}>
              From policy waves to pipeline — where Deloitte OT fits
            </p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.headerStat}>
              <div style={styles.headerStatValue}>{formatCurrency(totalPipeline)}</div>
              <div style={styles.headerStatLabel}>Tracked Pipeline</div>
            </div>
            <div style={styles.headerStat}>
              <div style={{ ...styles.headerStatValue, color: COLORS.accent }}>{opportunities.length}</div>
              <div style={styles.headerStatLabel}>Opportunities</div>
            </div>
            <div style={styles.headerStat}>
              <div style={{ ...styles.headerStatValue, color: COLORS.warning }}>{inEvaluation}</div>
              <div style={styles.headerStatLabel}>In Evaluation</div>
            </div>
            <div style={styles.headerStat}>
              <div style={{ ...styles.headerStatValue, color: COLORS.danger }}>{hotCount}</div>
              <div style={styles.headerStatLabel}>Hot Pursuits</div>
            </div>
          </div>
        </header>
        
        <div style={styles.narrativeContext}>
          <div style={styles.narrativeBox}>
            <span style={styles.narrativeLabel}>THE CONNECTION</span>
            <span style={styles.narrativeText}>
              Policy waves (CHIPS, IRA, tariffs, AI infrastructure) → create these opportunities → 
              Deloitte OT helps build them
            </span>
          </div>
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Stage:</span>
            {(['all', 'monitoring', 'pre-rfp', 'rfp-open', 'evaluation', 'awarded']).map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedStage === stage ? styles.filterBtnActive : {}),
                }}
              >
                {stage === 'all' ? 'All' : getStageLabel(stage)}
              </button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Priority:</span>
            {(['all', 'hot', 'warm', 'tracking']).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedPriority === p ? styles.filterBtnActive : {}),
                  ...(selectedPriority === p && p !== 'all' ? { backgroundColor: getPriorityColor(p) + '33', borderColor: getPriorityColor(p) } : {}),
                }}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>OT:</span>
            {(['all', 'core', 'adjacent', 'low']).map(v => (
              <button
                key={v}
                onClick={() => setSelectedOt(v)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedOt === v ? styles.filterBtnActive : {}),
                  ...(selectedOt === v && v !== 'all' ? { backgroundColor: getOtColor(v) + '22', borderColor: getOtColor(v), color: getOtColor(v) } : {}),
                }}
              >
                {v === 'all' ? 'All' : getOtLabel(v)}
              </button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Horizon:</span>
            {(['all', 'now', 'next', 'soon', 'later', 'none']).map(v => (
              <button
                key={v}
                onClick={() => setSelectedHorizon(v)}
                style={{
                  ...styles.filterBtn,
                  ...(selectedHorizon === v ? styles.filterBtnActive : {}),
                }}
              >
                {v === 'all' ? 'All' : v === 'none' ? 'Unscheduled' : v.toUpperCase()}
              </button>
            ))}
            {selectedHorizon === 'next' && (
              <button
                onClick={() => setIncludeSoon(!includeSoon)}
                style={{
                  ...styles.filterBtn,
                  ...(includeSoon ? styles.filterBtnActive : {}),
                }}
                title="When enabled, NEXT includes SOON as well"
              >
                + SOON
              </button>
            )}
          </div>
          <div style={styles.filterCount}>{filtered.length} opportunities</div>
          
          <div style={styles.viewToggle}>
            {(['cards', 'table', 'timeline']).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  ...styles.viewBtn,
                  ...(viewMode === mode ? styles.viewBtnActive : {}),
                }}
              >
                {mode === 'cards' ? '▦ Cards' : mode === 'table' ? '☰ Table' : '◷ Timeline'}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'cards' && (
        <div style={styles.grid}>
          {filtered
            .sort((a, b) => {
              const priorityOrder = { hot: 0, warm: 1, tracking: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map(opp => (
              <div
                key={opp.id}
                style={{
                  ...styles.card,
                  borderLeftColor: getPriorityColor(opp.priority),
                }}
                onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardCompany}>{opp.company}</div>
                    <div style={styles.cardProject}>{opp.project}</div>
                  </div>
                  <div style={styles.cardAmount}>{formatCurrency(opp.investmentSize)}</div>
                </div>

                <div style={styles.tagsRow}>
                  <span style={{ ...styles.tag, backgroundColor: getStageColor(opp.procurementStage) + '22', color: getStageColor(opp.procurementStage) }}>
                    {getStageLabel(opp.procurementStage)}
                  </span>
                  <span style={styles.tagMuted}>{getSectorLabel(opp.sector)}</span>
                  <span style={styles.tagMuted}>{opp.location.city}, {opp.location.state}</span>
                  <span style={{ ...styles.tag, backgroundColor: getOtColor(inferOtRelevance(opp)) + '22', color: getOtColor(inferOtRelevance(opp)) }}>
                    {getOtLabel(inferOtRelevance(opp))}
                  </span>
                  {opp.nextMilestone?.date && (
                    <span style={{ ...styles.tagMuted }}>
                      Next: {opp.nextMilestone.label} ({opp.nextMilestone.date})
                    </span>
                  )}
                  {opp.rfpStatus === 'open' && opp.rfpDueDate && (
                    <span style={{ ...styles.tag, backgroundColor: COLORS.blue + '22', color: COLORS.blue }}>
                      {isRfpPastDue(opp) ? 'RFP Closed' : (opp.rfpUrl ? 'RFP Due' : (opp.rfpVisibility === 'internal' ? 'RFP (internal)' : 'RFP (unverified)'))}: {opp.rfpDueDate}
                    </span>
                  )}
                  {opp.rfpUrl && (
                    <a
                      href={opp.rfpUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.tag, backgroundColor: COLORS.blue + '22', color: COLORS.blue, textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View RFP ↗
                    </a>
                  )}
                  {opp.sourceUrl && (
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...styles.tagMuted, textDecoration: 'none' }}
                      onClick={(e) => e.stopPropagation()}
                      title={opp.sourceLabel || 'Source'}
                    >
                      Source ↗
                    </a>
                  )}
                </div>

                <div style={styles.cardMeta}>
                  <div>
                    <span style={styles.metaLabel}>Relationship:</span>
                    <span style={{
                      color: opp.deloitteRelationship === 'incumbent' ? COLORS.accent :
                             opp.deloitteRelationship === 'teaming' ? COLORS.blue :
                             opp.deloitteRelationship === 'active-pursuit' ? COLORS.warning : COLORS.textMuted
                    }}>
                      {getRelationshipLabel(opp.deloitteRelationship)}
                    </span>
                  </div>
                  {opp.expectedDecision && (
                    <div>
                      <span style={styles.metaLabel}>Decision:</span>
                      <span>{opp.expectedDecision}</span>
                    </div>
                  )}
                </div>

                {expandedId === opp.id && (
                  <div style={styles.expandedSection}>
                    <div style={styles.expandedGrid}>
                      <div>
                        {opp.nextMilestone && (
                          <div style={styles.expandedBlock}>
                            <div style={styles.expandedLabel}>Next Milestone</div>
                            <div>
                              {opp.nextMilestone.url ? (
                                <a
                                  href={opp.nextMilestone.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: COLORS.blue, textDecoration: 'none' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {opp.nextMilestone.label} — {opp.nextMilestone.date} ↗
                                </a>
                              ) : (
                                <span>{opp.nextMilestone.label} — {opp.nextMilestone.date}</span>
                              )}
                            </div>
                            <div style={{ marginTop: '0.35rem' }}>
                              <span style={{ ...styles.tag, backgroundColor: getOtColor(inferOtRelevance(opp)) + '22', color: getOtColor(inferOtRelevance(opp)) }}>
                                Horizon: {getHorizon(opp.nextMilestone.date).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                        <div style={styles.expandedBlock}>
                          <div style={styles.expandedLabel}>Policy Drivers</div>
                          <div style={styles.expandedTags}>
                            {opp.policyDriver.map(p => (
                              <span key={p} style={styles.policyTag}>
                                {p === 'chips-act' ? 'CHIPS Act' : p === 'ira' ? 'IRA' : p === 'state-incentives' ? 'State $' : p === 'tariffs' ? 'Tariffs' : 'Defense'}
                              </span>
                            ))}
                          </div>
                        </div>
                        {opp.otUseCases && opp.otUseCases.length > 0 && (
                          <div style={styles.expandedBlock}>
                            <div style={styles.expandedLabel}>OT Use-Cases</div>
                            <div style={styles.expandedTags}>
                              {opp.otUseCases.map(u => (
                                <span key={u} style={styles.otTag}>{u}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div style={styles.expandedBlock}>
                          <div style={styles.expandedLabel}>Service Opportunities</div>
                          <div style={styles.expandedTags}>
                            {opp.services.map(s => (
                              <span key={s} style={styles.serviceTag}>
                                {s === 'ot-strategy' ? 'OT Strategy' : s === 'smart-factory' ? 'Smart Factory' : s === 'supply-chain' ? 'Supply Chain' : s === 'erp' ? 'ERP' : s === 'workforce' ? 'Workforce' : s === 'sustainability' ? 'Sustainability' : 'Tax'}
                              </span>
                            ))}
                          </div>
                        </div>
                        {opp.incumbent && (
                          <div style={styles.expandedBlock}>
                            <div style={styles.expandedLabel}>Incumbent</div>
                            <div>{opp.incumbent}</div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {opp.strategicQuality && (
                          <div style={styles.qualityBlock}>
                            <div style={styles.expandedLabel}>Strategic Quality</div>
                            <div style={styles.qualityRow}>
                              <span style={{ color: getFrontierColor(opp.strategicQuality.frontier) }}>
                                {getFrontierLabel(opp.strategicQuality.frontier)}
                              </span>
                            </div>
                            <div style={styles.qualityRow}>
                              <span style={styles.qualityLabel}>Economic Impact:</span>
                              <span style={{ color: getEconomicImpactColor(opp.strategicQuality.economicImpact) }}>
                                {getEconomicImpactLabel(opp.strategicQuality.economicImpact)}
                              </span>
                            </div>
                            {opp.strategicQuality.impactBasis && (
                              <div style={styles.qualityRow}>
                                <span style={styles.qualityLabel}>Basis:</span>
                                <span style={{ color: COLORS.textMuted, fontStyle: 'italic', fontSize: '0.75rem' }}>
                                  {opp.strategicQuality.impactBasis}
                                </span>
                              </div>
                            )}
                            {opp.strategicQuality.firstMover && (
                              <div style={styles.qualityRow}>
                                <span style={{ color: COLORS.accent }}>✓ First Mover</span>
                              </div>
                            )}
                            {opp.strategicQuality.note && (
                              <div style={styles.qualityNote}>
                                {opp.strategicQuality.note}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {opp.keyContacts && opp.keyContacts.length > 0 && (
                          <div style={styles.expandedBlock}>
                            <div style={styles.expandedLabel}>Key Contacts</div>
                            <div>{opp.keyContacts.join(', ')}</div>
                          </div>
                        )}
                        {opp.competitors && opp.competitors.length > 0 && (
                          <div style={styles.expandedBlock}>
                            <div style={styles.expandedLabel}>Competitors</div>
                            <div style={{ color: COLORS.danger }}>{opp.competitors.join(', ')}</div>
                          </div>
                        )}
                        <div style={styles.expandedBlock}>
                          <div style={styles.expandedLabel}>Investment / Jobs</div>
                          <div>{formatCurrency(opp.investmentSize)} • {formatNumber(opp.jobs)} jobs</div>
                        </div>
                      </div>
                    </div>
                    
                    {opp.notes && (
                      <div style={styles.notes}>
                        <strong>Notes:</strong> {opp.notes}
                      </div>
                    )}
                    
                    <div style={styles.lastUpdated}>
                      Last updated: {opp.lastUpdated}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
        )}

        {viewMode === 'table' && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Sector</th>
                  <th style={styles.th}>Investment</th>
                  <th style={styles.th}>Stage</th>
                  <th style={styles.th}>OT</th>
                  <th style={styles.th}>Next Milestone</th>
                  <th style={styles.th}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .sort((a, b) => {
                    const priorityOrder = { hot: 0, warm: 1, tracking: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map(opp => (
                    <tr key={opp.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.tdCompany}>{opp.company}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.tdProject}>{opp.project}</div>
                        <div style={styles.tdLocation}>{opp.location.state}</div>
                      </td>
                      <td style={styles.td}>{getSectorLabel(opp.sector)}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{formatCurrency(opp.investmentSize)}</td>
                      <td style={styles.td}>
                        <span style={{ color: getStageColor(opp.procurementStage) }}>
                          {getStageLabel(opp.procurementStage)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: getOtColor(inferOtRelevance(opp)) }}>
                          {inferOtRelevance(opp) === 'core' ? '●' : inferOtRelevance(opp) === 'adjacent' ? '◐' : '○'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {opp.nextMilestone ? (
                          <div>
                            <div style={styles.tdMilestone}>{opp.nextMilestone.label}</div>
                            <div style={styles.tdDate}>{opp.nextMilestone.date}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.priorityDot, 
                          backgroundColor: getPriorityColor(opp.priority) 
                        }}>
                          {opp.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div style={styles.timeline}>
            {(() => {
              const withMilestones = filtered.filter(o => o.nextMilestone?.date);
              const sorted = withMilestones.sort((a, b) => 
                (a.nextMilestone?.date || '').localeCompare(b.nextMilestone?.date || '')
              );
              
              const groups: Record<string, Opportunity[]> = {};
              sorted.forEach(opp => {
                if (!opp.nextMilestone?.date) return;
                const date = new Date(opp.nextMilestone.date);
                const q = Math.ceil((date.getMonth() + 1) / 3);
                const key = `Q${q} ${date.getFullYear()}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(opp);
              });
              
              const noMilestone = filtered.filter(o => !o.nextMilestone?.date);
              
              return (
                <>
                  {Object.entries(groups).map(([quarter, opps]) => (

                    <div key={quarter} style={styles.timelineQuarter}>
                      <div style={styles.timelineQuarterHeader}>
                        <div style={styles.timelineQuarterLabel}>{quarter}</div>
                        <div style={styles.timelineQuarterCount}>{opps.length} milestones</div>
                      </div>
                      <div style={styles.timelineItems}>
                        {opps.map(opp => (
                          <div key={opp.id} style={styles.timelineItem}>
                            <div style={styles.timelineDate}>{opp.nextMilestone?.date}</div>
                            <div style={styles.timelineContent}>
                              <div style={styles.timelineCompany}>{opp.company}</div>
                              <div style={styles.timelineMilestone}>{opp.nextMilestone?.label}</div>
                              <div style={styles.timelineProject}>{opp.project}</div>
                              <div style={styles.timelineMeta}>
                                <span style={{ color: getStageColor(opp.procurementStage) }}>
                                  {getStageLabel(opp.procurementStage)}
                                </span>
                                <span style={{ color: getPriorityColor(opp.priority) }}>
                                  {opp.priority}
                                </span>
                                <span>{formatCurrency(opp.investmentSize)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {noMilestone.length > 0 && (
                    <div style={styles.timelineQuarter}>
                      <div style={styles.timelineQuarterHeader}>
                        <div style={styles.timelineQuarterLabel}>Unscheduled</div>
                        <div style={styles.timelineQuarterCount}>{noMilestone.length} opportunities</div>
                      </div>
                      <div style={styles.timelineItems}>
                        {noMilestone.map(opp => (
                          <div key={opp.id} style={styles.timelineItem}>
                            <div style={styles.timelineDate}>TBD</div>
                            <div style={styles.timelineContent}>
                              <div style={styles.timelineCompany}>{opp.company}</div>
                              <div style={styles.timelineProject}>{opp.project}</div>
                              <div style={styles.timelineMeta}>
                                <span style={{ color: getStageColor(opp.procurementStage) }}>
                                  {getStageLabel(opp.procurementStage)}
                                </span>
                                <span>{formatCurrency(opp.investmentSize)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Footer */}
        <footer style={styles.footer}>
          Internal Use Only • Deloitte Consulting LLP • Operating Transformation
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
    padding: '2rem',
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
    color: COLORS.accent,
    textDecoration: 'none',
    fontSize: '0.85rem',
    display: 'inline-block',
    marginBottom: '0.5rem',
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
    marginTop: '0.5rem',
  },
  narrativeContext: {
    marginBottom: '1.5rem',
  },
  narrativeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: COLORS.accent + '11',
    border: `1px solid ${COLORS.accent}33`,
    borderRadius: '6px',
  },
  narrativeLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: COLORS.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    flexShrink: 0,
  },
  narrativeText: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  headerStats: {
    display: 'flex',
    gap: '2rem',
  },
  headerStat: {
    textAlign: 'right' as const,
  },
  headerStatValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  headerStatLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  filters: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  filterBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
    color: COLORS.accent,
  },
  filterCount: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },
  viewToggle: {
    display: 'flex',
    gap: '0.25rem',
    marginLeft: 'auto',
  },
  viewBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    cursor: 'pointer',
  },
  viewBtnActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
    color: COLORS.accent,
  },

  // Table View Styles
  tableContainer: {
    overflowX: 'auto' as const,
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.8rem',
  },
  tableHeaderRow: {
    borderBottom: `2px solid ${COLORS.border}`,
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem 0.5rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    fontSize: '0.7rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: '0.75rem 0.5rem',
    verticalAlign: 'top' as const,
  },
  tdCompany: {
    fontWeight: 600,
    color: COLORS.text,
  },
  tdProject: {
    color: COLORS.text,
    marginBottom: '0.15rem',
  },
  tdLocation: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  tdMilestone: {
    fontSize: '0.75rem',
    color: COLORS.text,
  },
  tdDate: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  priorityDot: {
    padding: '0.2rem 0.5rem',
    borderRadius: '3px',
    fontSize: '0.65rem',
    textTransform: 'uppercase' as const,
  },

  // Timeline View Styles
  timeline: {
    marginBottom: '2rem',
  },
  timelineQuarter: {
    marginBottom: '2rem',
  },
  timelineQuarterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: `2px solid ${COLORS.accent}`,
  },
  timelineQuarterLabel: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  timelineQuarterCount: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
  },
  timelineItems: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    paddingLeft: '1rem',
    borderLeft: `2px solid ${COLORS.border}`,
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bgCard,
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    minWidth: '80px',
    flexShrink: 0,
  },
  timelineContent: {
    flex: 1,
  },
  timelineCompany: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: COLORS.accent,
    marginBottom: '0.1rem',
  },
  timelineMilestone: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: COLORS.text,
    marginBottom: '0.25rem',
  },
  timelineProject: {
    fontSize: '0.8rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  timelineMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.7rem',
  },

  grid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderLeft: '3px solid',
    borderRadius: '8px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  cardCompany: {
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  cardProject: {
    fontSize: '0.9rem',
    color: COLORS.textMuted,
  },
  cardAmount: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  tagsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    marginBottom: '0.75rem',
  },
  tag: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    borderRadius: '4px',
    fontWeight: 600,
  },
  tagMuted: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    borderRadius: '4px',
    backgroundColor: COLORS.border,
    color: COLORS.textMuted,
  },
  cardMeta: {
    display: 'flex',
    gap: '2rem',
    fontSize: '0.85rem',
  },
  metaLabel: {
    color: COLORS.textMuted,
    marginRight: '0.5rem',
  },
  expandedSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  expandedBlock: {
    marginBottom: '1rem',
  },
  expandedLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '0.25rem',
  },
  expandedTags: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap' as const,
  },
  policyTag: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.65rem',
    borderRadius: '3px',
    backgroundColor: COLORS.blue + '22',
    color: COLORS.blue,
  },
  serviceTag: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.65rem',
    borderRadius: '3px',
    backgroundColor: COLORS.accent + '22',
    color: COLORS.accent,
  },
  // Strategic Quality styles
  qualityBlock: {
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
    marginBottom: '0.75rem',
  },
  qualityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.35rem',
    fontSize: '0.8rem',
  },
  qualityLabel: {
    color: COLORS.textMuted,
    fontSize: '0.75rem',
  },
  qualityNote: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: '0.5rem',
    paddingTop: '0.5rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  
  otTag: {
    padding: '0.2rem 0.4rem',
    fontSize: '0.65rem',
    borderRadius: '3px',
    backgroundColor: COLORS.purple + '22',
    color: COLORS.purple,
  },
  notes: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: COLORS.textMuted,
  },
  lastUpdated: {
    marginTop: '0.75rem',
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  footer: {
    marginTop: '3rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: 'center' as const,
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
}

