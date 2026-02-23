'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Opportunity, GenesisPillar } from '@/lib/types';

// ============================================
// STRATEGIC ROADMAP with SECTOR AGENTS
// Each pillar has an AI agent monitoring it
// Goals are PROJECTIONS based on industry analysis
// ============================================

interface GoalMetric {
  name: string;
  now: string;
  nowSource: string; // Where we got the current value
  target: string;
  targetYear: string; // When is this target supposed to be hit (e.g., "2030", "2035")
  targetSource: string; // Regulation, agency, or report driving the target
  deloitteView: string; // Deloitte's adjusted target based on realistic assessment
  deloitteYear: string; // When Deloitte thinks this is achievable
  blocker: string; // Key blocker or accelerator explaining the difference
  incentives: string; // Available funding/programs that could help
  policyGap: string; // What's needed but doesn't exist
  moonshot: boolean; // True if gap requires breakthrough, not incremental progress
  gap: string;
  progress: number;
}

interface Milestone {
  date: string; // YYYY-MM format
  event: string;
  type: 'deadline' | 'launch' | 'decision' | 'regulatory';
}

interface PillarRoadmap {
  id: GenesisPillar;
  name: string;
  icon: string;
  problem: string;
  metrics: GoalMetric[];
  milestones: Milestone[];
  moonshot: { name: string; why: string };
}

interface SectorAgent {
  id: GenesisPillar;
  name: string;
  icon: string;
  status: 'idle' | 'working' | 'error';
  lastRun: string | null;
  memory: {
    marketTrends?: string[];
    regulatoryUpdates?: string[];
    recentNews?: { date: string; headline: string; source: string }[];
    risks?: { description: string; severity: string }[];
  };
  findings: {
    id: string;
    timestamp: string;
    type: string;
    title: string;
    summary: string;
    relevance: string;
    actionRequired: boolean;
  }[];
  alerts: {
    id: string;
    priority: string;
    message: string;
    action: string;
    status: string;
  }[];
}

const PILLARS: PillarRoadmap[] = [
  {
    id: 'power',
    name: 'Power & Grid',
    icon: '⚡',
    problem: 'Grid is 25% industrial vs China 66%. AI needs industrial baseload.',
    metrics: [
      { name: 'Nuclear Capacity', now: '95 GW', nowSource: 'EIA 2025', target: '200 GW', targetYear: '2050', targetSource: 'DOE Liftoff Report 2024', deloitteView: '140 GW', deloitteYear: '2050', blocker: 'NRC licensing backlog; only 2 restarts in pipeline', incentives: 'IRA 45U PTC ($15/MWh); DOE OCED loans', policyGap: 'NRC reform needed; 10-year licensing too slow', moonshot: true, gap: '+105 GW', progress: 48 },
      { name: 'Grid Queue Cleared', now: '~8%', nowSource: 'LBNL 2025', target: '50%', targetYear: '2030', targetSource: 'FERC Order 2023', deloitteView: '25%', deloitteYear: '2030', blocker: 'Interconnection study workforce shortage', incentives: 'FERC Order 2023 cluster study reforms', policyGap: 'No funding for utility workforce expansion', moonshot: false, gap: '+42%', progress: 16 },
      { name: 'New Transmission', now: '0 mi/yr', nowSource: 'DOE', target: '2,000 mi/yr', targetYear: '2035', targetSource: 'DOE National Transmission Needs Study', deloitteView: '500 mi/yr', deloitteYear: '2035', blocker: 'State permitting conflicts; no federal siting authority', incentives: 'BIL $2.5B transmission grants; DOE CITAP', policyGap: 'Federal siting authority for interstate lines', moonshot: true, gap: '+2,000 mi', progress: 0 },
    ],
    milestones: [
      { date: '2026-03', event: 'Palisades restart target', type: 'launch' },
      { date: '2026-06', event: 'FERC Order 2023 compliance deadline', type: 'regulatory' },
      { date: '2026-09', event: 'TMI Unit 1 restart decision', type: 'decision' },
      { date: '2027-Q1', event: 'First SMR (NuScale VOYGR) online', type: 'launch' },
    ],
    moonshot: { name: 'Fusion', why: 'Unlimited clean baseload, no waste' },
  },
  {
    id: 'ai-compute',
    name: 'AI Compute',
    icon: '🖥️',
    problem: 'US leads 70% but hitting power ceiling. Stargate is $100B bet.',
    metrics: [
      { name: 'US DC Power', now: '~35 GW', nowSource: 'McKinsey 2024', target: '80-130 GW', targetYear: '2030', targetSource: 'EPRI AI Data Center Report', deloitteView: '70 GW', deloitteYear: '2030', blocker: 'Grid connection delays avg 4+ years', incentives: 'IRA clean energy credits; state incentives', policyGap: 'Fast-track permitting for AI infrastructure', moonshot: false, gap: '+45-95 GW', progress: 35 },
      { name: 'Stargate Investment', now: '$100B', nowSource: 'OpenAI Jan 2025', target: '$500B', targetYear: '2029', targetSource: 'OpenAI/SoftBank MOU', deloitteView: '$300B', deloitteYear: '2029', blocker: 'Capital dependent on AI revenue growth sustaining', incentives: 'Private capital; potential CHIPS-like AI act', policyGap: 'No federal AI infrastructure program', moonshot: false, gap: '+$400B', progress: 20 },
      { name: 'Clean Energy %', now: '~40%', nowSource: 'Industry Est.', target: '100%', targetYear: '2030', targetSource: 'Big Tech Net Zero Pledges', deloitteView: '65%', deloitteYear: '2030', blocker: 'Nuclear PPAs limited; renewables intermittency', incentives: 'IRA 45Y/48E clean electricity credits', policyGap: 'Carbon accounting standards for data centers', moonshot: false, gap: '+60%', progress: 40 },
    ],
    milestones: [
      { date: '2026-04', event: 'Stargate Abilene groundbreaking', type: 'launch' },
      { date: '2026-06', event: 'Meta Louisiana campus permits', type: 'decision' },
      { date: '2026-Q3', event: 'Microsoft-Constellation PPA active', type: 'launch' },
      { date: '2027-01', event: 'Stargate Phase 1 operational', type: 'launch' },
    ],
    moonshot: { name: 'Space DCs', why: 'No grid, free cooling, no permits' },
  },
  {
    id: 'semiconductors',
    name: 'Semiconductors',
    icon: '🔬',
    problem: 'Zero leading-edge production. Taiwan has 92%. Single point of failure.',
    metrics: [
      { name: 'US Leading-Edge', now: '0%', nowSource: 'SIA 2024', target: '20%', targetYear: '2030', targetSource: 'CHIPS Act Goal (Commerce)', deloitteView: '8%', deloitteYear: '2030', blocker: 'TSMC AZ delayed 2 yrs; Intel 18A yield issues', incentives: 'CHIPS $39B manufacturing grants; 25% ITC', policyGap: 'CHIPS 2.0 needed for sustained funding', moonshot: true, gap: '+20%', progress: 0 },
      { name: 'CHIPS Committed', now: '$36B', nowSource: 'Commerce Feb 2025', target: '$52.7B', targetYear: '2027', targetSource: 'CHIPS & Science Act', deloitteView: '$52.7B', deloitteYear: '2027', blocker: 'On track - political will sustained', incentives: 'CHIPS & Science Act fully funded', policyGap: 'None - execution focus', moonshot: false, gap: '+$17B', progress: 68 },
      { name: 'Fab Workers', now: '~25K', nowSource: 'BLS', target: '115K', targetYear: '2030', targetSource: 'SIA Workforce Study', deloitteView: '60K', deloitteYear: '2030', blocker: 'Training pipeline 5+ years; visa restrictions', incentives: 'CHIPS workforce grants; NSF programs', policyGap: 'H-1B reform for semiconductor workers', moonshot: true, gap: '+90K', progress: 22 },
    ],
    milestones: [
      { date: '2026-04', event: 'TSMC Arizona N4 production start', type: 'launch' },
      { date: '2026-06', event: 'Intel 18A process ready', type: 'launch' },
      { date: '2026-09', event: 'CHIPS Act Tranche 2 awards', type: 'decision' },
      { date: '2027-Q2', event: 'Samsung Taylor fab online', type: 'launch' },
    ],
    moonshot: { name: 'Photonics', why: 'Different manufacturing, US could lead' },
  },
  {
    id: 'cooling',
    name: 'Cooling',
    icon: '❄️',
    problem: 'Water scarcity limits DC expansion. H100 needs 700W cooling.',
    metrics: [
      { name: 'Liquid Cooling %', now: '~15%', nowSource: 'Uptime Institute', target: '80%', targetYear: '2030', targetSource: 'ASHRAE TC 9.9 Guidance', deloitteView: '90%', deloitteYear: '2030', blocker: 'ACCELERATOR: GB200 mandate forcing adoption', incentives: 'DOE Better Buildings; utility rebates', policyGap: 'None - market driven', moonshot: false, gap: '+65%', progress: 19 },
      { name: 'Avg AI Rack PUE', now: '1.4', nowSource: 'Uptime 2024', target: '1.1', targetYear: '2030', targetSource: 'DOE Better Buildings', deloitteView: '1.15', deloitteYear: '2030', blocker: 'Legacy facilities slow to retrofit', incentives: 'DOE efficiency grants; ESG pressure', policyGap: 'Mandatory PUE reporting for large DCs', moonshot: false, gap: '-0.3', progress: 50 },
      { name: 'Water Intensity', now: '1.8 L/kWh', nowSource: 'WRI', target: '0.5 L/kWh', targetYear: '2030', targetSource: 'EPA WaterSense DC', deloitteView: '0.8 L/kWh', deloitteYear: '2030', blocker: 'Closed-loop adoption slower than projected', incentives: 'EPA WaterSense certification', policyGap: 'Water use disclosure requirements', moonshot: false, gap: '-1.3 L', progress: 28 },
    ],
    milestones: [
      { date: '2026-Q2', event: 'NVIDIA GB200 liquid cooling mandate', type: 'regulatory' },
      { date: '2026-06', event: 'Microsoft Project Natick Phase 3', type: 'launch' },
      { date: '2026-Q3', event: 'ASHRAE liquid cooling standards', type: 'regulatory' },
      { date: '2027-01', event: 'GRC 100MW immersion facility', type: 'launch' },
    ],
    moonshot: { name: 'Undersea DCs', why: 'Ocean cooling, Microsoft proved it' },
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    icon: '⛏️',
    problem: 'China controls 60-90% of mineral processing. US processes zero.',
    metrics: [
      { name: 'US Rare Earth', now: '<1%', nowSource: 'USGS 2024', target: '15%', targetYear: '2035', targetSource: 'DOE Critical Materials Strategy', deloitteView: '5%', deloitteYear: '2035', blocker: 'Processing facility permits 7+ years', incentives: 'DPA Title III; IRA 45X production credit', policyGap: 'NEPA reform for critical minerals', moonshot: true, gap: '+14%', progress: 7 },
      { name: 'US Lithium', now: '1%', nowSource: 'DOE', target: '10%', targetYear: '2030', targetSource: 'IRA Sec 45X Requirements', deloitteView: '6%', deloitteYear: '2030', blocker: 'Thacker Pass litigation delays', incentives: 'IRA 45X ($3/kg); DOE LPO loans', policyGap: 'Streamlined mining permits on federal land', moonshot: false, gap: '+9%', progress: 10 },
      { name: 'HALEU Supply', now: '0.9 MT/yr', nowSource: 'Centrus 2025', target: '40 MT/yr', targetYear: '2035', targetSource: 'DOE HALEU Availability Program', deloitteView: '15 MT/yr', deloitteYear: '2035', blocker: 'Centrus only domestic supplier; capacity constrained', incentives: 'DOE HALEU $700M program', policyGap: 'Second domestic enrichment facility', moonshot: true, gap: '+39 MT', progress: 2 },
    ],
    milestones: [
      { date: '2026-03', event: 'MP Materials Texas processing start', type: 'launch' },
      { date: '2026-06', event: 'Centrus HALEU expansion decision', type: 'decision' },
      { date: '2026-Q4', event: 'Thacker Pass lithium production', type: 'launch' },
      { date: '2027-Q1', event: 'DOE strategic reserve awards', type: 'decision' },
    ],
    moonshot: { name: 'Asteroid Mining', why: 'Infinite rare earths, multiple companies pursuing' },
  },
];

const APP_PILLARS: PillarRoadmap[] = [
  {
    id: 'defense',
    name: 'Defense & Security',
    icon: '🛡️',
    problem: 'China outspends on AI military R&D. US needs autonomous edge.',
    metrics: [
      { name: 'DoD AI Budget', now: '$1.8B', nowSource: 'DoD FY25 Budget', target: '$8B', targetYear: '2030', targetSource: 'NSCAI Final Report', deloitteView: '$5B', deloitteYear: '2030', blocker: 'Appropriations lag; competing priorities', incentives: 'NDAA AI provisions; DIU OTAs', policyGap: 'Dedicated AI acquisition authority', moonshot: false, gap: '+$6.2B', progress: 23 },
      { name: 'CMMC L2+ Certified', now: '~800', nowSource: 'CMMC-AB Feb 2026', target: '80,000', targetYear: '2028', targetSource: 'DFARS 252.204-7021', deloitteView: '15,000', deloitteYear: '2028', blocker: 'C3PAO assessor shortage; SMB cost burden', incentives: 'DoD Project Spectrum; SBA resources', policyGap: 'Tiered compliance for small DIB', moonshot: true, gap: '+79K', progress: 1 },
      { name: 'Replicator Units', now: '0', nowSource: 'DoD', target: '2,000', targetYear: '2026', targetSource: 'Deputy SecDef Directive', deloitteView: '500', deloitteYear: '2026', blocker: 'Production scaling; supply chain validation', incentives: 'DIU rapid acquisition; OTA contracts', policyGap: 'Autonomous systems doctrine clarity', moonshot: false, gap: '+2,000', progress: 0 },
    ],
    milestones: [
      { date: '2026-03', event: 'TITAN IOC declaration', type: 'launch' },
      { date: '2026-06', event: 'Replicator first deliveries', type: 'launch' },
      { date: '2026-10', event: 'CMMC 2.0 enforcement begins', type: 'regulatory' },
      { date: '2027-Q1', event: 'JADC2 initial capability', type: 'launch' },
    ],
    moonshot: { name: 'Full Autonomy', why: 'AI-first military doctrine by 2030' },
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Biotech',
    icon: '🧬',
    problem: 'Drug development takes 10 years, costs $2B. AI can cut to 2-3 years.',
    metrics: [
      { name: 'AI Drug Trials', now: '~24', nowSource: 'Insilico Medicine', target: '150', targetYear: '2030', targetSource: 'McKinsey Pharma 2030', deloitteView: '200+', deloitteYear: '2030', blocker: 'ACCELERATOR: Pharma cost pressure driving adoption', incentives: 'FDA breakthrough therapy; BARDA funding', policyGap: 'None - market accelerating', moonshot: false, gap: '+126', progress: 16 },
      { name: 'FDA AI/ML Devices', now: '882', nowSource: 'FDA Oct 2025', target: '2,000', targetYear: '2028', targetSource: 'FDA AI Action Plan', deloitteView: '2,500', deloitteYear: '2028', blocker: 'ACCELERATOR: FDA guidance clarity improving', incentives: 'FDA De Novo pathway; CDRH pre-sub', policyGap: 'None - regulatory modernizing', moonshot: false, gap: '+1,118', progress: 44 },
      { name: 'Bridge2AI Datasets', now: '2', nowSource: 'NIH', target: '8', targetYear: '2027', targetSource: 'NIH Bridge2AI Program', deloitteView: '8', deloitteYear: '2027', blocker: 'On track - NIH funding secured', incentives: 'NIH Bridge2AI $130M; ARPA-H', policyGap: 'None - execution focus', moonshot: false, gap: '+6', progress: 25 },
    ],
    milestones: [
      { date: '2026-Q2', event: 'FDA AI drug discovery guidance', type: 'regulatory' },
      { date: '2026-06', event: 'Recursion Phase 2 readout', type: 'decision' },
      { date: '2026-Q3', event: 'Bridge2AI datasets release', type: 'launch' },
      { date: '2027-01', event: 'First AI-discovered drug approval?', type: 'decision' },
    ],
    moonshot: { name: 'AI Scientist', why: 'Fully autonomous drug discovery' },
  },
  {
    id: 'energy-systems',
    name: 'Energy Systems',
    icon: '🔋',
    problem: 'Grid needs AI to manage complexity. Renewables + storage + demand.',
    metrics: [
      { name: 'Grid Storage', now: '20 GW', nowSource: 'EIA Jan 2026', target: '225 GW', targetYear: '2035', targetSource: 'DOE Long Duration Storage Shot', deloitteView: '100 GW', deloitteYear: '2035', blocker: 'LDES technology not cost-competitive yet', incentives: 'IRA 45X storage ITC; DOE LDES demos', policyGap: 'LDES-specific production credit', moonshot: true, gap: '+205 GW', progress: 9 },
      { name: 'DER Penetration', now: '~12%', nowSource: 'LBNL', target: '30%', targetYear: '2030', targetSource: 'FERC Order 2222', deloitteView: '22%', deloitteYear: '2030', blocker: 'Utility integration systems lagging', incentives: 'FERC Order 2222 market access', policyGap: 'Utility DER integration mandates', moonshot: false, gap: '+18%', progress: 40 },
      { name: 'VPP Capacity', now: '30 GW', nowSource: 'Wood Mackenzie', target: '160 GW', targetYear: '2030', targetSource: 'DOE VPP Liftoff', deloitteView: '80 GW', deloitteYear: '2030', blocker: 'Customer acquisition costs; aggregator fragmentation', incentives: 'IRA demand response credits', policyGap: 'VPP participation standards', moonshot: false, gap: '+130 GW', progress: 19 },
    ],
    milestones: [
      { date: '2026-06', event: 'FERC Order 2222 DER deadline', type: 'regulatory' },
      { date: '2026-Q3', event: 'DOE Grid Modernization FOA', type: 'decision' },
      { date: '2026-09', event: 'CAISO AI dispatch pilot', type: 'launch' },
      { date: '2027-Q1', event: 'NERC CIP DER requirements', type: 'regulatory' },
    ],
    moonshot: { name: 'Autonomous Grid', why: 'Self-healing, self-optimizing power system' },
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: '🏭',
    problem: 'US lost 5M manufacturing jobs. AI + robots enable reshoring.',
    metrics: [
      { name: 'Robot Density', now: '285/10K', nowSource: 'IFR 2024', target: '400/10K', targetYear: '2030', targetSource: 'NIST MFG USA Roadmap', deloitteView: '450/10K', deloitteYear: '2030', blocker: 'ACCELERATOR: Labor costs + humanoid advances', incentives: 'NIST MEP; ARM Institute funding', policyGap: 'None - market accelerating', moonshot: false, gap: '+115', progress: 71 },
      { name: 'Reshored Jobs', now: '364K', nowSource: 'Reshoring Initiative', target: '1M', targetYear: '2030', targetSource: 'Commerce Dept Goal', deloitteView: '600K', deloitteYear: '2030', blocker: 'Automation reduces labor need per facility', incentives: 'IRA Sec 45X; CHIPS manufacturing', policyGap: 'Reshoring tax incentive clarity', moonshot: false, gap: '+636K', progress: 36 },
      { name: 'IIoT Adoption', now: '~35%', nowSource: 'Deloitte MFG Survey', target: '75%', targetYear: '2030', targetSource: 'NIST Smart MFG', deloitteView: '60%', deloitteYear: '2030', blocker: 'SMB cybersecurity concerns; integration costs', incentives: 'NIST MEP cybersecurity; SBA programs', policyGap: 'SMB IIoT security standards', moonshot: false, gap: '+40%', progress: 47 },
    ],
    milestones: [
      { date: '2026-Q2', event: 'Tesla Optimus factory deployment', type: 'launch' },
      { date: '2026-06', event: 'NIST AI Manufacturing SP', type: 'regulatory' },
      { date: '2026-Q3', event: 'Figure AI factory pilots', type: 'launch' },
      { date: '2027-01', event: 'CHIPS fab automation standards', type: 'regulatory' },
    ],
    moonshot: { name: 'Lights Out', why: 'Fully autonomous factories, 24/7 production' },
  },
  {
    id: 'research',
    name: 'Scientific Research',
    icon: '🔭',
    problem: 'Scientific productivity flat for 50 years. AI can 2x output.',
    metrics: [
      { name: 'Self-Driving Labs', now: '~20', nowSource: 'Nature 2025', target: '100', targetYear: '2030', targetSource: 'DOE ASCR Strategic Plan', deloitteView: '150', deloitteYear: '2030', blocker: 'ACCELERATOR: Foundation models enabling automation', incentives: 'DOE ASCR; NSF AI Institutes', policyGap: 'None - momentum exceeding targets', moonshot: false, gap: '+80', progress: 20 },
      { name: 'AI Papers %', now: '~12%', nowSource: 'Semantic Scholar', target: '30%', targetYear: '2030', targetSource: 'NSF AI Research Institutes', deloitteView: '40%', deloitteYear: '2030', blocker: 'ACCELERATOR: AI co-authorship becoming standard', incentives: 'NSF $140M AI Institutes; NIH AI', policyGap: 'None - organic adoption', moonshot: false, gap: '+18%', progress: 40 },
      { name: 'DOE AI Projects', now: '65', nowSource: 'DOE SC', target: '200', targetYear: '2028', targetSource: 'DOE AI for Science Report', deloitteView: '180', deloitteYear: '2028', blocker: 'Funding on track but talent competition', incentives: 'DOE SC AI initiative; national labs', policyGap: 'AI researcher visa priority', moonshot: false, gap: '+135', progress: 33 },
    ],
    milestones: [
      { date: '2026-Q2', event: 'ORNL INTERSECT expansion', type: 'launch' },
      { date: '2026-06', event: 'NSF AI Institute awards', type: 'decision' },
      { date: '2026-Q3', event: 'A-Lab 5,000 materials milestone', type: 'launch' },
      { date: '2027-01', event: 'DOE Autonomous Science Hub', type: 'launch' },
    ],
    moonshot: { name: 'AI Scientist', why: 'Autonomous hypothesis generation and testing' },
  },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getMilestoneColor(type: Milestone['type']): string {
  switch (type) {
    case 'deadline': return 'text-red-400';
    case 'launch': return 'text-green-400';
    case 'decision': return 'text-yellow-400';
    case 'regulatory': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

function getRelevanceColor(relevance: string): string {
  switch (relevance) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'bg-red-600 text-white';
    case 'high': return 'bg-orange-600 text-white';
    default: return 'bg-yellow-600 text-black';
  }
}

// Agent Panel Component
function AgentPanel({
  agent,
  isExpanded,
  onToggle,
  onRunAgent,
  isRunning,
}: {
  agent: SectorAgent | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  onRunAgent: () => void;
  isRunning: boolean;
}) {
  const activeAlerts = agent?.alerts?.filter(a => a.status === 'active') || [];
  const recentFindings = agent?.findings?.slice(-5) || [];

  return (
    <div className="border-t border-gray-800">
      <div
        className="flex items-center justify-between px-5 py-2 bg-gradient-to-r from-indigo-900/20 to-transparent cursor-pointer hover:from-indigo-900/30"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-medium text-indigo-300">Sector Agent</span>
          <span className={`w-2 h-2 rounded-full ${
            isRunning ? 'bg-yellow-400 animate-pulse' :
            agent?.status === 'error' ? 'bg-red-400' :
            agent?.lastRun ? 'bg-green-400' : 'bg-gray-500'
          }`} />
          <span className="text-xs text-gray-500">
            {isRunning ? 'Running...' : `Last: ${formatTimeAgo(agent?.lastRun || null)}`}
          </span>
          {activeAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
              {activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onRunAgent();
            }}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '▶ Run Agent'}
          </Button>
          <span className="text-gray-500">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 py-4 bg-[#0d0d14] space-y-4">
          {activeAlerts.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-400 mb-2">⚠️ ACTIVE ALERTS</div>
              <div className="space-y-2">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(alert.priority)}`}>
                      {alert.priority.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-white">{alert.message}</div>
                      <div className="text-xs text-gray-400 mt-1">Action: {alert.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentFindings.length > 0 && (
            <div>
              <div className="text-xs font-medium text-indigo-400 mb-2">📊 RECENT FINDINGS</div>
              <div className="space-y-2">
                {recentFindings.map(finding => (
                  <div key={finding.id} className={`p-3 rounded-lg border ${getRelevanceColor(finding.relevance)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-medium">{finding.type}</span>
                      {finding.actionRequired && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 rounded">Action Needed</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-white">{finding.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{finding.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agent?.memory && (
            <div className="grid grid-cols-2 gap-4">
              {(agent.memory.marketTrends?.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">📈 MARKET TRENDS</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {agent.memory.marketTrends?.slice(-3).map((trend, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-500">•</span>
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(agent.memory.recentNews?.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">📰 RECENT NEWS</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {agent.memory.recentNews?.slice(-3).map((news, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{news.headline} <span className="text-gray-600">({news.source})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(agent.memory.risks?.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">⚠️ IDENTIFIED RISKS</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {agent.memory.risks?.slice(-3).map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={risk.severity === 'high' ? 'text-red-500' : 'text-yellow-500'}>•</span>
                        {risk.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(agent.memory.regulatoryUpdates?.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-2">📋 REGULATORY</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {agent.memory.regulatoryUpdates?.slice(-3).map((reg, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        {reg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!agent?.lastRun && recentFindings.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm">Agent hasn&apos;t run yet</div>
              <div className="text-xs mt-1">Click &quot;Run Agent&quot; to start monitoring this sector</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BackendPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [agents, setAgents] = useState<Record<GenesisPillar, SectorAgent>>({} as Record<GenesisPillar, SectorAgent>);
  const [expandedAgents, setExpandedAgents] = useState<Set<GenesisPillar>>(new Set());
  const [runningAgents, setRunningAgents] = useState<Set<GenesisPillar>>(new Set());

  useEffect(() => {
    fetch('/api/opportunities')
      .then(res => res.json())
      .then(data => setOpportunities(data.opportunities || []))
      .catch(console.error);
  }, []);

  const fetchAgents = useCallback(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        const agentMap: Record<GenesisPillar, SectorAgent> = {} as Record<GenesisPillar, SectorAgent>;
        (data.agents || []).forEach((agent: SectorAgent) => {
          agentMap[agent.id] = agent;
        });
        setAgents(agentMap);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const runAgent = async (sectorId: GenesisPillar) => {
    setRunningAgents(prev => new Set(prev).add(sectorId));

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-sector-agent', sectorId }),
      });

      const data = await response.json();

      if (data.success && data.agent) {
        setAgents(prev => ({
          ...prev,
          [sectorId]: data.agent,
        }));
        setExpandedAgents(prev => new Set(prev).add(sectorId));
      }
    } catch (error) {
      console.error('Failed to run agent:', error);
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev);
        next.delete(sectorId);
        return next;
      });
    }
  };

  const toggleAgent = (pillarId: GenesisPillar) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(pillarId)) {
        next.delete(pillarId);
      } else {
        next.add(pillarId);
      }
      return next;
    });
  };

  const pipelineByPillar: Record<GenesisPillar, { count: number; value: number }> = {
    'power': { count: 0, value: 0 },
    'ai-compute': { count: 0, value: 0 },
    'semiconductors': { count: 0, value: 0 },
    'cooling': { count: 0, value: 0 },
    'supply-chain': { count: 0, value: 0 },
    'defense': { count: 0, value: 0 },
    'healthcare': { count: 0, value: 0 },
    'energy-systems': { count: 0, value: 0 },
    'manufacturing': { count: 0, value: 0 },
    'research': { count: 0, value: 0 },
  };

  opportunities.forEach(opp => {
    pipelineByPillar[opp.genesisPillar].count += 1;
    pipelineByPillar[opp.genesisPillar].value += opp.estimatedValue || 0;
  });

  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
  const totalAlerts = Object.values(agents).reduce(
    (sum, agent) => sum + (agent?.alerts?.filter(a => a.status === 'active')?.length || 0),
    0
  );

  const runAllAgents = async () => {
    const allPillars = [...PILLARS, ...APP_PILLARS].map(p => p.id);
    for (const pillarId of allPillars) {
      setRunningAgents(prev => new Set(prev).add(pillarId));
    }

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-all-sectors' }),
      });

      await response.json();
      fetchAgents();
    } catch (error) {
      console.error('Failed to run all agents:', error);
    } finally {
      setRunningAgents(new Set());
    }
  };

  // Current date for context
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <header className="border-b border-gray-800 bg-[#0d0d14] sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Strategic Roadmap</h1>
            <span className="text-xs text-gray-500">{currentMonth}</span>
            {totalAlerts > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                {totalAlerts} alert{totalAlerts > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runAllAgents}
              disabled={runningAgents.size > 0}
              className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 disabled:opacity-50"
            >
              {runningAgents.size > 0 ? `Running...` : 'Run Agents'}
            </button>
            <div className="text-lg font-bold text-cyan-400">{formatCurrency(totalPipeline)}</div>
            <Link href="/insights" className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-xs text-purple-300 border border-purple-500/30">
              Insights
            </Link>
            <Link href="/radar" className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">
              Radar
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6 space-y-4">
        {/* MONTHLY BRIEFING SUMMARY */}
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Genesis Monthly Briefing</h2>
              <p className="text-sm text-gray-400">{currentMonth} - Deloitte OT Cyber Market Intelligence</p>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {[...PILLARS, ...APP_PILLARS].reduce((sum, p) => sum + p.metrics.filter(m => m.moonshot).length, 0)}
                </div>
                <div className="text-xs text-gray-500">Moonshots Needed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {[...PILLARS, ...APP_PILLARS].reduce((sum, p) => sum + p.metrics.filter(m => m.blocker.startsWith('ACCELERATOR')).length, 0)}
                </div>
                <div className="text-xs text-gray-500">Accelerating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {[...PILLARS, ...APP_PILLARS].reduce((sum, p) => sum + p.metrics.filter(m => !m.policyGap.startsWith('None')).length, 0)}
                </div>
                <div className="text-xs text-gray-500">Policy Gaps</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Moonshot Candidates */}
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs font-medium text-yellow-400 mb-2">MOONSHOT CANDIDATES</div>
              <div className="space-y-1.5">
                {[...PILLARS, ...APP_PILLARS]
                  .flatMap(p => p.metrics.filter(m => m.moonshot).map(m => ({ pillar: p.name, metric: m.name, blocker: m.blocker })))
                  .slice(0, 4)
                  .map((item, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-white">{item.metric}</span>
                      <span className="text-gray-500"> ({item.pillar})</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Key Policy Gaps */}
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs font-medium text-red-400 mb-2">KEY POLICY GAPS</div>
              <div className="space-y-1.5">
                {[...PILLARS, ...APP_PILLARS]
                  .flatMap(p => p.metrics.filter(m => !m.policyGap.startsWith('None')).map(m => ({ pillar: p.name, gap: m.policyGap })))
                  .slice(0, 4)
                  .map((item, i) => (
                    <div key={i} className="text-xs text-gray-300">{item.gap}</div>
                  ))}
              </div>
            </div>

            {/* Available Incentives */}
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-xs font-medium text-green-400 mb-2">KEY INCENTIVES IN PLAY</div>
              <div className="space-y-1.5 text-xs text-gray-300">
                <div>IRA clean energy credits (45Y, 45X, 48E)</div>
                <div>CHIPS $52.7B manufacturing grants</div>
                <div>DOE Loan Programs Office ($400B+)</div>
                <div>DPA Title III critical materials</div>
              </div>
            </div>
          </div>
        </div>

        {/* INFRASTRUCTURE LAYER */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
            INF
          </div>
          <h2 className="text-lg font-bold text-white">INFRASTRUCTURE</h2>
          <span className="text-sm text-gray-500">Build the AI capacity</span>
          <div className="flex-1 border-t border-gray-800 ml-4"></div>
        </div>

        {PILLARS.map(pillar => {
          const pipeline = pipelineByPillar[pillar.id];
          const agent = agents[pillar.id];
          const isExpanded = expandedAgents.has(pillar.id);
          const isRunning = runningAgents.has(pillar.id);

          return (
            <div key={pillar.id} className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-800/50 to-transparent border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pillar.icon}</span>
                  <div>
                    <span className="font-bold text-white">{pillar.name}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="text-sm text-gray-400">{pillar.problem}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Pipeline: </span>
                  <span className="font-bold text-cyan-400">{formatCurrency(pipeline.value)}</span>
                  <span className="text-gray-600 ml-1">({pipeline.count})</span>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-12 gap-4">
                  {/* Metrics Table */}
                  <div className="col-span-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-800">
                          <th className="text-left pb-2 font-medium">Metric</th>
                          <th className="text-right pb-2 font-medium">Current</th>
                          <th className="text-right pb-2 font-medium">Official Target</th>
                          <th className="text-right pb-2 font-medium">
                            <span className="text-green-400">Deloitte View</span>
                          </th>
                          <th className="text-left pb-2 font-medium pl-3">Blocker / Accelerator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pillar.metrics.map((m, i) => (
                          <tr key={i} className="border-b border-gray-800/50">
                            <td className="py-2 text-gray-300">{m.name}</td>
                            <td className="py-2 text-right">
                              <div className="font-mono text-white">{m.now}</div>
                              <div className="text-[10px] text-gray-600">{m.nowSource}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-mono text-gray-400">{m.target}</span>
                                <span className="text-[10px] text-gray-600">({m.targetYear})</span>
                              </div>
                              <div className="text-[10px] text-gray-600">{m.targetSource}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className={`font-mono font-bold ${m.blocker.startsWith('ACCELERATOR') ? 'text-green-400' : m.blocker.startsWith('On track') ? 'text-cyan-400' : 'text-yellow-400'}`}>
                                  {m.deloitteView}
                                </span>
                                <span className="text-[10px] text-gray-500">({m.deloitteYear})</span>
                              </div>
                            </td>
                            <td className="py-2 pl-3">
                              <div className={`text-[11px] ${m.blocker.startsWith('ACCELERATOR') ? 'text-green-400' : m.blocker.startsWith('On track') ? 'text-cyan-400' : 'text-yellow-500'}`}>
                                {m.blocker}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Milestones */}
                  <div className="col-span-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">UPCOMING MILESTONES</div>
                    <div className="space-y-1.5">
                      {pillar.milestones.slice(0, 3).map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-[10px] font-mono text-gray-500 w-14 flex-shrink-0">{m.date}</span>
                          <span className={`text-xs ${getMilestoneColor(m.type)}`}>{m.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <AgentPanel
                agent={agent}
                isExpanded={isExpanded}
                onToggle={() => toggleAgent(pillar.id)}
                onRunAgent={() => runAgent(pillar.id)}
                isRunning={isRunning}
              />
            </div>
          );
        })}

        {/* APPLICATION LAYER */}
        <div className="flex items-center gap-3 pt-6">
          <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
            APP
          </div>
          <h2 className="text-lg font-bold text-white">APPLICATIONS</h2>
          <span className="text-sm text-gray-500">Apply AI to national challenges</span>
          <div className="flex-1 border-t border-gray-800 ml-4"></div>
        </div>

        {APP_PILLARS.map(pillar => {
          const pipeline = pipelineByPillar[pillar.id];
          const agent = agents[pillar.id];
          const isExpanded = expandedAgents.has(pillar.id);
          const isRunning = runningAgents.has(pillar.id);

          return (
            <div key={pillar.id} className="bg-[#12121a] rounded-xl border border-cyan-800/30 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-cyan-900/30 to-transparent border-b border-cyan-800/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pillar.icon}</span>
                  <div>
                    <span className="font-bold text-white">{pillar.name}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="text-sm text-gray-400">{pillar.problem}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Pipeline: </span>
                  <span className="font-bold text-cyan-400">{formatCurrency(pipeline.value)}</span>
                  <span className="text-gray-600 ml-1">({pipeline.count})</span>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-12 gap-4">
                  {/* Metrics Table */}
                  <div className="col-span-8">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-800">
                          <th className="text-left pb-2 font-medium">Metric</th>
                          <th className="text-right pb-2 font-medium">Current</th>
                          <th className="text-right pb-2 font-medium">Official Target</th>
                          <th className="text-right pb-2 font-medium">
                            <span className="text-green-400">Deloitte View</span>
                          </th>
                          <th className="text-left pb-2 font-medium pl-3">Blocker / Accelerator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pillar.metrics.map((m, i) => (
                          <tr key={i} className="border-b border-gray-800/50">
                            <td className="py-2 text-gray-300">{m.name}</td>
                            <td className="py-2 text-right">
                              <div className="font-mono text-white">{m.now}</div>
                              <div className="text-[10px] text-gray-600">{m.nowSource}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-mono text-gray-400">{m.target}</span>
                                <span className="text-[10px] text-gray-600">({m.targetYear})</span>
                              </div>
                              <div className="text-[10px] text-gray-600">{m.targetSource}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className={`font-mono font-bold ${m.blocker.startsWith('ACCELERATOR') ? 'text-green-400' : m.blocker.startsWith('On track') ? 'text-cyan-400' : 'text-yellow-400'}`}>
                                  {m.deloitteView}
                                </span>
                                <span className="text-[10px] text-gray-500">({m.deloitteYear})</span>
                              </div>
                            </td>
                            <td className="py-2 pl-3">
                              <div className={`text-[11px] ${m.blocker.startsWith('ACCELERATOR') ? 'text-green-400' : m.blocker.startsWith('On track') ? 'text-cyan-400' : 'text-yellow-500'}`}>
                                {m.blocker}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Milestones */}
                  <div className="col-span-4">
                    <div className="text-xs font-medium text-gray-500 mb-2">UPCOMING MILESTONES</div>
                    <div className="space-y-1.5">
                      {pillar.milestones.slice(0, 3).map((m, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-[10px] font-mono text-gray-500 w-14 flex-shrink-0">{m.date}</span>
                          <span className={`text-xs ${getMilestoneColor(m.type)}`}>{m.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <AgentPanel
                agent={agent}
                isExpanded={isExpanded}
                onToggle={() => toggleAgent(pillar.id)}
                onRunAgent={() => runAgent(pillar.id)}
                isRunning={isRunning}
              />
            </div>
          );
        })}

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <span className="font-bold text-red-400">The Core Issue: </span>
              <span className="text-gray-200">US grid is 25% industrial vs China 66%. We built infrastructure for homes, they built for factories. AI is industrial load. Every opportunity in your pipeline addresses some piece of this structural gap.</span>
            </div>
          </div>
        </div>

        {/* Space DCs Banner */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🚀</span>
            <div className="flex-1">
              <span className="font-bold text-white">The Bypass: Space Data Centers</span>
              <span className="text-gray-400 ml-2">SpaceX launch costs make orbital compute viable. 24/7 solar, free radiative cooling, no permits, no grid. Timeline: 2027-2030.</span>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="text-center"><div className="text-green-400 font-bold">Power</div><div className="text-gray-500">24/7 solar</div></div>
              <div className="text-center"><div className="text-green-400 font-bold">Cooling</div><div className="text-gray-500">Free</div></div>
              <div className="text-center"><div className="text-green-400 font-bold">Permits</div><div className="text-gray-500">None</div></div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 pt-2">
          Genesis Program • {currentDate.toLocaleDateString()} • 10 Sector Agents Active
        </div>
      </main>
    </div>
  );
}
