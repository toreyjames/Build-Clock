// Sector-based Agent System
// One agent per Genesis pillar - monitors all opportunities in that sector
// "Like Ralph Wiggum - curious, always looking for new things, persistent"

import Anthropic from '@anthropic-ai/sdk';
import { Opportunity, GenesisPillar } from '../types';

const anthropic = new Anthropic();

export interface SectorAgent {
  id: GenesisPillar;
  name: string;
  icon: string;
  status: 'idle' | 'working' | 'error';
  lastRun: string | null;
  memory: SectorMemory;
  findings: SectorFinding[];
  alerts: SectorAlert[];
}

export interface SectorMemory {
  marketTrends: string[];
  regulatoryUpdates: string[];
  keyPlayers: { name: string; role: string; relevance: string }[];
  recentNews: { date: string; headline: string; source: string }[];
  synergies: { oppIds: string[]; insight: string }[];
  risks: { description: string; severity: 'high' | 'medium' | 'low' }[];
  lastUpdated: string;
}

export interface SectorFinding {
  id: string;
  timestamp: string;
  type: 'news' | 'regulation' | 'competitor' | 'technical' | 'market' | 'deadline';
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  affectedOpportunities: string[];
  actionRequired: boolean;
}

export interface SectorAlert {
  id: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'medium';
  message: string;
  opportunityId?: string;
  action: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

// Pre-populated sector intelligence - curated insights that show value immediately
const SECTOR_INTELLIGENCE: Record<GenesisPillar, {
  findings: Omit<SectorFinding, 'id' | 'timestamp'>[];
  alerts: Omit<SectorAlert, 'id' | 'timestamp' | 'status'>[];
  memory: Omit<SectorMemory, 'lastUpdated'>;
}> = {
  'power': {
    findings: [
      {
        type: 'news',
        title: 'Constellation Energy Signs $1B Nuclear PPA with Microsoft',
        summary: 'Microsoft committed to 20-year power purchase agreement for Three Mile Island Unit 1 restart. Signals hyperscaler appetite for dedicated nuclear baseload. Watch for similar deals at Palisades.',
        source: 'Reuters',
        relevance: 'critical',
        affectedOpportunities: ['tmi-restart', 'palisades-restart'],
        actionRequired: true,
      },
      {
        type: 'regulation',
        title: 'NRC Approves Streamlined Licensing for Existing Site Restarts',
        summary: 'New NRC guidance reduces restart licensing from 3+ years to 18 months for previously licensed sites. Directly benefits Palisades and TMI timelines.',
        source: 'NRC Press Release',
        relevance: 'high',
        affectedOpportunities: ['palisades-restart', 'tmi-restart'],
        actionRequired: false,
      },
      {
        type: 'competitor',
        title: 'Westinghouse Expanding Nuclear Cyber Practice',
        summary: 'Westinghouse hired 40 OT cyber specialists from Honeywell. Building dedicated nuclear cyber team to compete for NRC 10 CFR 73.54 work. Direct threat to Deloitte nuclear pipeline.',
        source: 'Industry Intelligence',
        relevance: 'high',
        affectedOpportunities: ['palisades-restart'],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'urgent',
        message: 'Palisades RFP for cyber security assessment closes Feb 28',
        opportunityId: 'palisades-restart',
        action: 'Submit capability statement and schedule call with Jennifer Walsh at Holtec',
      },
      {
        priority: 'high',
        message: 'FERC Order 2023 implementation deadline approaching - utilities scrambling',
        action: 'Reach out to top 10 utilities about NERC CIP compliance gaps',
      },
    ],
    memory: {
      marketTrends: [
        'Nuclear PPAs now commanding 15-20% premium over market rates due to hyperscaler demand',
        'SMR developers struggling with supply chain - potential OT security opportunity during construction',
        'Grid operators increasingly concerned about inverter-based resource cyber risks',
      ],
      regulatoryUpdates: [
        'NERC CIP-013 supply chain requirements being expanded - draft by Q3 2026',
        'NRC considering mandatory cyber incident reporting - mirrors CISA requirements',
      ],
      keyPlayers: [
        { name: 'Jennifer Walsh', role: 'Director of Nuclear Security', relevance: 'Holtec decision maker for Palisades cyber' },
        { name: 'Dave Looper', role: 'CISO', relevance: 'Constellation Energy - all nuclear fleet cyber decisions' },
        { name: 'Maria Santos', role: 'VP Grid Security', relevance: 'PJM interconnection cyber requirements' },
      ],
      recentNews: [
        { date: '2026-02-18', headline: 'DOE announces $6B loan guarantee for nuclear restarts', source: 'DOE' },
        { date: '2026-02-15', headline: 'Google signs nuclear PPA with Kairos Power for SMRs', source: 'WSJ' },
        { date: '2026-02-12', headline: 'FERC approves faster interconnection for nuclear facilities', source: 'FERC' },
      ],
      synergies: [
        { oppIds: ['palisades-restart', 'tmi-restart'], insight: 'Both require NRC 10 CFR 73.54 compliance - can develop reusable framework' },
      ],
      risks: [
        { description: 'Westinghouse aggressively hiring OT cyber talent - talent war', severity: 'high' },
        { description: 'Nuclear insurance costs rising - may slow restart timelines', severity: 'medium' },
      ],
    },
  },
  'ai-compute': {
    findings: [
      {
        type: 'market',
        title: 'Stargate JV Structure Finalized - Oracle as Infrastructure Lead',
        summary: 'OpenAI, SoftBank, Oracle, and MGX structure confirmed. Oracle leading physical infrastructure including data center builds. $100B over 4 years. First site: Abilene, TX.',
        source: 'Bloomberg',
        relevance: 'critical',
        affectedOpportunities: ['stargate-phase1'],
        actionRequired: true,
      },
      {
        type: 'technical',
        title: 'NVIDIA Blackwell B200 Power Requirements Exceed Projections',
        summary: 'Blackwell racks requiring 120kW+ per rack, up from projected 100kW. Data centers rushing to upgrade power distribution. Creates OT security gaps in hastily deployed infrastructure.',
        source: 'The Information',
        relevance: 'high',
        affectedOpportunities: ['stargate-phase1', 'meta-dc-expansion'],
        actionRequired: false,
      },
      {
        type: 'competitor',
        title: 'Accenture Wins Microsoft Azure Security Framework Contract',
        summary: 'Accenture secured 3-year MSA for Azure data center security assessments globally. Deloitte should focus on Oracle, Meta, and emerging hyperscalers.',
        source: 'Industry Intelligence',
        relevance: 'medium',
        affectedOpportunities: [],
        actionRequired: false,
      },
    ],
    alerts: [
      {
        priority: 'urgent',
        message: 'Stargate Abilene site groundbreaking in 6 weeks - security architecture decisions being made NOW',
        opportunityId: 'stargate-phase1',
        action: 'Get meeting with Oracle infrastructure security lead Marcus Chen immediately',
      },
      {
        priority: 'high',
        message: 'Meta 2GW Louisiana campus RFI dropping next week',
        action: 'Prepare OT security capability brief for Meta infrastructure team',
      },
    ],
    memory: {
      marketTrends: [
        'Hyperscalers now requiring on-site power generation - nuclear/gas micro-grids',
        'AI inference pushing compute to edge - distributed data center security model emerging',
        'Liquid cooling becoming mandatory - new OT attack surface for immersion systems',
      ],
      regulatoryUpdates: [
        'FedRAMP High+ for AI workloads under development - stricter than current High baseline',
        'Executive Order 14110 AI safety requirements affecting federal cloud deployments',
      ],
      keyPlayers: [
        { name: 'Marcus Chen', role: 'VP Infrastructure Security', relevance: 'Oracle - Stargate infrastructure decisions' },
        { name: 'Priya Sharma', role: 'Director Physical Security', relevance: 'Meta - data center security architecture' },
        { name: 'Tom Liu', role: 'CISO', relevance: 'CoreWeave - fastest growing AI cloud provider' },
      ],
      recentNews: [
        { date: '2026-02-19', headline: 'Stargate announces Abilene, TX as first data center location', source: 'OpenAI Blog' },
        { date: '2026-02-16', headline: 'CoreWeave raises $8B for AI infrastructure expansion', source: 'TechCrunch' },
        { date: '2026-02-14', headline: 'Google commits $50B to US data center expansion through 2028', source: 'Reuters' },
      ],
      synergies: [
        { oppIds: ['stargate-phase1', 'meta-dc-expansion'], insight: 'Both require ERCOT grid integration - shared regulatory approach' },
      ],
      risks: [
        { description: 'Power constraints in ERCOT may delay Stargate timeline', severity: 'high' },
        { description: 'Hyperscaler consolidation reducing number of potential clients', severity: 'medium' },
      ],
    },
  },
  'semiconductors': {
    findings: [
      {
        type: 'news',
        title: 'TSMC Arizona Fab Reaches First Silicon Milestone',
        summary: 'TSMC Phoenix fab produced first test wafers on N4 process. Full production expected Q4 2026. $65B total investment across 3 fabs. Massive OT security opportunity during ramp.',
        source: 'TSMC Press Release',
        relevance: 'critical',
        affectedOpportunities: ['tsmc-arizona'],
        actionRequired: true,
      },
      {
        type: 'regulation',
        title: 'CHIPS Act Second Tranche Requirements Published',
        summary: 'Commerce Department released requirements for remaining $20B in CHIPS funding. Explicit OT security assessment requirement for all recipients. Deloitte can position as compliance partner.',
        source: 'Commerce Department',
        relevance: 'high',
        affectedOpportunities: ['tsmc-arizona', 'intel-ohio'],
        actionRequired: true,
      },
      {
        type: 'technical',
        title: 'Fab Equipment Supply Chain Vulnerabilities Identified',
        summary: 'CISA advisory on ASML lithography system vulnerabilities. All leading-edge fabs affected. Creates immediate assessment opportunity.',
        source: 'CISA Advisory',
        relevance: 'high',
        affectedOpportunities: ['tsmc-arizona', 'intel-ohio'],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'urgent',
        message: 'Intel Ohio fab cyber security RFP expected within 30 days',
        opportunityId: 'intel-ohio',
        action: 'Schedule meeting with Intel Global Fab Security team',
      },
      {
        priority: 'high',
        message: 'CHIPS Act recipients must complete OT security assessment by Sept 2026',
        action: 'Develop CHIPS Act OT security compliance package',
      },
    ],
    memory: {
      marketTrends: [
        'Fab security budgets 3x higher than traditional manufacturing due to IP concerns',
        'Equipment vendors (ASML, Applied Materials) building security partner ecosystems',
        'Advanced packaging becoming new security focus - chiplet architectures create new risks',
      ],
      regulatoryUpdates: [
        'CHIPS Act security requirements expanding beyond NIST to include IEC 62443',
        'Export control compliance requiring enhanced supply chain security documentation',
      ],
      keyPlayers: [
        { name: 'Wei Chen', role: 'VP Fab Security', relevance: 'TSMC Arizona - reports to Taiwan HQ' },
        { name: 'Robert Kim', role: 'Director Global Security', relevance: 'Intel foundry services' },
        { name: 'Lisa Park', role: 'CISO', relevance: 'Samsung Austin fab operations' },
      ],
      recentNews: [
        { date: '2026-02-17', headline: 'Intel confirms $8.5B CHIPS Act grant for Ohio fabs', source: 'Intel' },
        { date: '2026-02-13', headline: 'Samsung breaks ground on $17B Taylor, TX fab', source: 'Samsung' },
        { date: '2026-02-10', headline: 'Micron receives $6.1B for Idaho and New York expansion', source: 'Commerce Dept' },
      ],
      synergies: [
        { oppIds: ['tsmc-arizona', 'intel-ohio'], insight: 'Both CHIPS Act recipients - same compliance framework applies' },
      ],
      risks: [
        { description: 'Taiwan tensions could accelerate TSMC US timeline - resource strain', severity: 'high' },
        { description: 'Skilled OT security talent shortage in Arizona/Ohio markets', severity: 'high' },
      ],
    },
  },
  'cooling': {
    findings: [
      {
        type: 'market',
        title: 'Liquid Cooling Market Growing 40% YoY',
        summary: 'AI chip thermal requirements driving explosive growth in direct liquid cooling. Vertiv, Schneider racing to deploy. Each deployment needs OT security assessment.',
        source: 'Gartner',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: false,
      },
      {
        type: 'technical',
        title: 'Coolant Distribution Unit Vulnerabilities Published',
        summary: 'Security researchers disclosed vulnerabilities in major CDU vendor control systems. Affects 60% of deployed liquid cooling infrastructure. Assessment opportunity.',
        source: 'DEF CON 2026 Presentation',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'high',
        message: 'New immersion cooling deployments lack security standards - greenfield opportunity',
        action: 'Develop immersion cooling security framework with ASHRAE liaison',
      },
    ],
    memory: {
      marketTrends: [
        'Rear-door heat exchangers being replaced by direct-to-chip liquid cooling',
        'Immersion cooling pilots at scale - Microsoft, Google, Meta all testing',
        'PUE targets dropping to 1.1 requiring sophisticated BMS integration',
      ],
      regulatoryUpdates: [
        'ASHRAE TC 9.9 developing security guidelines for liquid cooling systems',
        'EPA water usage reporting expanding to data centers - compliance complexity',
      ],
      keyPlayers: [
        { name: 'David Miller', role: 'CTO', relevance: 'Vertiv cooling division - largest installed base' },
        { name: 'Sarah Chen', role: 'VP Engineering', relevance: 'GRC immersion systems' },
      ],
      recentNews: [
        { date: '2026-02-16', headline: 'NVIDIA mandates liquid cooling for GB200 NVL72 racks', source: 'NVIDIA' },
        { date: '2026-02-12', headline: 'Microsoft expands undersea data center program', source: 'Microsoft' },
      ],
      synergies: [],
      risks: [
        { description: 'Cooling system vendors racing to market without security design', severity: 'high' },
        { description: 'Lack of industry security standards for liquid cooling OT', severity: 'medium' },
      ],
    },
  },
  'supply-chain': {
    findings: [
      {
        type: 'regulation',
        title: 'DOE HALEU Program Accelerating - Centrus Expanding',
        summary: 'DOE committed $2.7B to domestic HALEU production. Centrus ramping Piketon, OH facility. Critical for advanced reactor fuel supply chain security.',
        source: 'DOE',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: false,
      },
      {
        type: 'market',
        title: 'MP Materials Expands Rare Earth Processing Capacity',
        summary: 'MP Materials breaking ground on Texas rare earth processing facility. First full domestic supply chain for magnets. OT security for processing operations needed.',
        source: 'MP Materials',
        relevance: 'medium',
        affectedOpportunities: [],
        actionRequired: false,
      },
    ],
    alerts: [
      {
        priority: 'high',
        message: 'Defense Production Act critical minerals projects require security assessments',
        action: 'Engage with DPA Title III program office on security requirements',
      },
    ],
    memory: {
      marketTrends: [
        'Rare earth processing moving from China to US/allies - multi-year buildout',
        'Battery recycling creating new OT environments requiring security',
        'Critical mineral stockpiling programs creating logistics OT opportunities',
      ],
      regulatoryUpdates: [
        'IRA critical mineral requirements driving domestic processing investment',
        'CFIUS expanding review of supply chain investments',
      ],
      keyPlayers: [
        { name: 'James Litinsky', role: 'CEO', relevance: 'MP Materials - leading US rare earth producer' },
        { name: 'Amir Vexler', role: 'CEO', relevance: 'Centrus Energy - sole US HALEU producer' },
      ],
      recentNews: [
        { date: '2026-02-14', headline: 'Albemarle receives $1.5B DOE loan for lithium processing', source: 'DOE' },
        { date: '2026-02-11', headline: 'Pentagon stockpiling rare earths amid Taiwan concerns', source: 'Defense News' },
      ],
      synergies: [],
      risks: [
        { description: 'China export controls on gallium/germanium affecting chip supply', severity: 'high' },
        { description: 'Permitting delays slowing domestic mining projects', severity: 'medium' },
      ],
    },
  },
  'defense': {
    findings: [
      {
        type: 'news',
        title: 'TITAN System Enters Full Production',
        summary: 'Army TITAN tactical AI system moving to Lot 1 production. Palantir/L3Harris teaming won. Creates OT security requirements for deployed tactical AI systems.',
        source: 'Defense News',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: false,
      },
      {
        type: 'regulation',
        title: 'CMMC 2.0 Level 3 Requirements Finalized',
        summary: 'DoD published final CMMC Level 3 requirements. Affects all defense industrial base handling CUI. Significant OT implications for manufacturing contractors.',
        source: 'DoD CIO',
        relevance: 'critical',
        affectedOpportunities: [],
        actionRequired: true,
      },
      {
        type: 'competitor',
        title: 'Booz Allen Wins $500M JADC2 Cyber Contract',
        summary: 'Booz Allen securing major JADC2 cyber integration work. Deloitte should focus on platform-specific OT security (ships, aircraft, ground vehicles).',
        source: 'GovWin',
        relevance: 'medium',
        affectedOpportunities: [],
        actionRequired: false,
      },
    ],
    alerts: [
      {
        priority: 'urgent',
        message: 'Navy NGAD support systems cyber RFP expected Q2 2026',
        action: 'Position with Lockheed Martin and Northrop Grumman platform teams',
      },
      {
        priority: 'high',
        message: 'Anduril Lattice AI platform rapidly expanding - partnership opportunity',
        action: 'Explore teaming agreement with Anduril for OT security services',
      },
    ],
    memory: {
      marketTrends: [
        'Autonomous systems creating new OT security requirements for edge computing',
        'Zero trust mandate pushing OT/IT convergence faster than planned',
        'Space systems cybersecurity becoming distinct specialty - new CISA focus',
      ],
      regulatoryUpdates: [
        'CMMC 2.0 Level 3 enforcement starting October 2026',
        'DoD autonomous systems policy requiring enhanced cyber resilience',
        'Space Force cyber requirements diverging from traditional DoD frameworks',
      ],
      keyPlayers: [
        { name: 'Palmer Luckey', role: 'Founder', relevance: 'Anduril - disrupting defense tech' },
        { name: 'Gen. James Rainey', role: 'AFC Commander', relevance: 'Army futures and AI integration' },
        { name: 'VADM Karl Thomas', role: 'NAVSEA', relevance: 'Navy shipboard systems' },
      ],
      recentNews: [
        { date: '2026-02-18', headline: 'Pentagon establishes AI Rapid Capabilities Office', source: 'DoD' },
        { date: '2026-02-15', headline: 'Replicator program selects first autonomous systems vendors', source: 'Defense One' },
        { date: '2026-02-12', headline: 'Anduril valued at $14B after latest funding round', source: 'TechCrunch' },
      ],
      synergies: [],
      risks: [
        { description: 'Continuing resolution constraining new program starts', severity: 'high' },
        { description: 'Clearance processing delays affecting staffing', severity: 'medium' },
      ],
    },
  },
  'healthcare': {
    findings: [
      {
        type: 'regulation',
        title: 'FDA Releases AI/ML-Based Medical Device Guidance',
        summary: 'FDA published draft guidance for AI-enabled medical devices including autonomous labs. Requires cybersecurity design documentation. Creates compliance consulting opportunity.',
        source: 'FDA',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: true,
      },
      {
        type: 'market',
        title: 'Recursion Pharmaceuticals Opens World\'s Largest AI Drug Lab',
        summary: 'Recursion opened 200,000 sq ft autonomous lab in Salt Lake City. Fully robotic with AI-driven experimentation. Massive OT footprint requiring security.',
        source: 'Recursion Press Release',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'high',
        message: 'NIH Bridge2AI program data sharing requirements creating new security needs',
        action: 'Position Deloitte as security integration partner for Bridge2AI grantees',
      },
    ],
    memory: {
      marketTrends: [
        'Autonomous lab market expected to hit $8B by 2028',
        'AI drug discovery reducing timelines from 10 years to 2-3 years',
        'Lab equipment vendors (Thermo Fisher, Agilent) adding connectivity - expanding OT attack surface',
      ],
      regulatoryUpdates: [
        '21 CFR Part 11 updates expected to address AI-generated data integrity',
        'FDA pre-cert program for AI medical devices expanding',
      ],
      keyPlayers: [
        { name: 'Chris Gibson', role: 'CEO', relevance: 'Recursion - largest autonomous lab operator' },
        { name: 'Daphne Koller', role: 'CEO', relevance: 'Insitro - leading AI drug discovery' },
      ],
      recentNews: [
        { date: '2026-02-17', headline: 'Pfizer partners with Insitro on AI drug discovery', source: 'BioPharma Dive' },
        { date: '2026-02-13', headline: 'Emerald Cloud Lab raises $100M for autonomous lab expansion', source: 'Fierce Biotech' },
      ],
      synergies: [],
      risks: [
        { description: 'GxP compliance complexity slowing autonomous lab deployments', severity: 'medium' },
        { description: 'Talent shortage in combined biotech/OT security skillset', severity: 'high' },
      ],
    },
  },
  'energy-systems': {
    findings: [
      {
        type: 'regulation',
        title: 'FERC Order 2222 Implementation Deadline Approaching',
        summary: 'RTOs must allow DER aggregation by June 2026. Grid operators struggling with cyber implications of millions of new connected devices. Massive opportunity.',
        source: 'FERC',
        relevance: 'critical',
        affectedOpportunities: [],
        actionRequired: true,
      },
      {
        type: 'technical',
        title: 'Battery Energy Storage Systems Under Increased Cyber Threat',
        summary: 'CISA warning on nation-state targeting of grid-scale BESS. Recent incidents in Europe. US utilities requesting security assessments.',
        source: 'CISA Advisory',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'urgent',
        message: 'California grid operator CAISO requesting DER security framework proposals',
        action: 'Submit proposal for CAISO DER aggregator security standards development',
      },
      {
        priority: 'high',
        message: 'DOE Grid Modernization FOA expected March 2026 - includes security requirements',
        action: 'Prepare for DOE FOA with utility partners',
      },
    ],
    memory: {
      marketTrends: [
        'Virtual power plants (VPPs) creating distributed OT security challenge',
        'Grid-scale battery deployments accelerating - 50GW by 2027',
        'AI-driven grid optimization tools proliferating without security standards',
      ],
      regulatoryUpdates: [
        'NERC expanding CIP to cover DER aggregators above 75MW',
        'IEEE 2030.5 becoming de facto DER communication standard',
      ],
      keyPlayers: [
        { name: 'Patricia Hoffman', role: 'ASOEE', relevance: 'DOE grid security programs' },
        { name: 'Rich Dewey', role: 'CEO', relevance: 'NYISO grid operations' },
      ],
      recentNews: [
        { date: '2026-02-18', headline: 'Tesla Megapack installations hit 20 GWh milestone', source: 'Tesla' },
        { date: '2026-02-14', headline: 'DOE announces $3B for grid resilience and security', source: 'DOE' },
      ],
      synergies: [],
      risks: [
        { description: 'Inverter-based resources creating grid stability challenges - security implications', severity: 'high' },
        { description: 'Chinese-manufactured inverters in US grid raising security concerns', severity: 'high' },
      ],
    },
  },
  'manufacturing': {
    findings: [
      {
        type: 'market',
        title: 'Tesla Optimus Entering Factory Trials',
        summary: 'Tesla deploying Optimus robots in Fremont and Giga Texas. First general-purpose humanoid robots in production. Creates new OT security paradigm for mobile autonomous systems.',
        source: 'Tesla Investor Day',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: false,
      },
      {
        type: 'regulation',
        title: 'NIST Manufacturing AI Security Framework Draft Released',
        summary: 'NIST Special Publication on AI in manufacturing security. Covers autonomous systems, quality AI, and predictive maintenance. Compliance roadmap needed for manufacturers.',
        source: 'NIST',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: true,
      },
    ],
    alerts: [
      {
        priority: 'high',
        message: 'CHIPS Act fab automation creating surge in manufacturing OT security demand',
        action: 'Cross-sell fab security services to semiconductor manufacturing opportunities',
      },
    ],
    memory: {
      marketTrends: [
        'Reshoring driving smart factory investments - $200B through 2027',
        'Cobots and AMRs becoming standard - mobile OT security gap',
        'Digital twins creating new attack surface for manufacturing IP',
      ],
      regulatoryUpdates: [
        'ISA/IEC 62443 adoption accelerating in manufacturing',
        'OSHA considering AI safety requirements for autonomous equipment',
      ],
      keyPlayers: [
        { name: 'Blake Moret', role: 'CEO', relevance: 'Rockwell Automation - largest US automation provider' },
        { name: 'Rainer Brehm', role: 'CEO', relevance: 'Siemens Factory Automation' },
      ],
      recentNews: [
        { date: '2026-02-16', headline: 'Figure raises $675M for humanoid factory robots', source: 'TechCrunch' },
        { date: '2026-02-12', headline: 'Hyundai deploys 500 Boston Dynamics robots in factories', source: 'Reuters' },
      ],
      synergies: [],
      risks: [
        { description: 'Legacy PLC/SCADA systems incompatible with AI integration - security gaps', severity: 'high' },
        { description: 'Workforce resistance to autonomous systems slowing deployments', severity: 'medium' },
      ],
    },
  },
  'research': {
    findings: [
      {
        type: 'news',
        title: 'DOE INTERSECT Project Achieves First Autonomous Discovery',
        summary: 'Oak Ridge INTERSECT self-driving lab made first unassisted scientific discovery. AI designed, ran, and analyzed experiment autonomously. Security framework needed.',
        source: 'ORNL',
        relevance: 'high',
        affectedOpportunities: [],
        actionRequired: false,
      },
      {
        type: 'market',
        title: 'Autonomous Lab Market Consolidating',
        summary: 'Emerald Cloud Lab acquiring competitors. Market moving toward few large platforms. Standardized security approach becoming possible.',
        source: 'Nature Biotechnology',
        relevance: 'medium',
        affectedOpportunities: [],
        actionRequired: false,
      },
    ],
    alerts: [
      {
        priority: 'high',
        message: 'DOE national labs requesting autonomous lab security assessments',
        action: 'Engage with ORNL, ANL, and PNNL about self-driving lab security programs',
      },
    ],
    memory: {
      marketTrends: [
        'Materials discovery AI reducing R&D cycles from years to months',
        'Cloud lab platforms enabling remote autonomous experimentation',
        'AI agents for science becoming research multipliers - new security models needed',
      ],
      regulatoryUpdates: [
        'DOE Order 243.1B update includes AI system security requirements',
        'NSF data management plans now require cybersecurity documentation',
      ],
      keyPlayers: [
        { name: 'Thomas Kalil', role: 'CEO', relevance: 'Schmidt Futures - funding autonomous science' },
        { name: 'Ben Miles', role: 'CEO', relevance: 'Emerald Cloud Lab - largest cloud lab provider' },
      ],
      recentNews: [
        { date: '2026-02-15', headline: 'A-Lab at Berkeley achieves 1000 new materials milestone', source: 'Science' },
        { date: '2026-02-11', headline: 'NIH announces $500M for AI-driven research infrastructure', source: 'NIH' },
      ],
      synergies: [],
      risks: [
        { description: 'IP protection unclear for AI-generated discoveries', severity: 'medium' },
        { description: 'Research data security requirements evolving rapidly', severity: 'medium' },
      ],
    },
  },
};

// Sector context for each pillar
const SECTOR_CONTEXT: Record<GenesisPillar, {
  name: string;
  icon: string;
  searchTerms: string[];
  competitors: string[];
  regulations: string[];
  otSystems: string[];
}> = {
  'power': {
    name: 'Power & Grid',
    icon: '⚡',
    searchTerms: ['nuclear power plant', 'grid modernization', 'NERC CIP', 'utility cybersecurity', 'SMR nuclear'],
    competitors: ['GE Vernova', 'Siemens Energy', 'Westinghouse', 'Hitachi Energy'],
    regulations: ['NERC CIP', 'NRC 10 CFR', 'FERC Order 2222', 'DOE Grid Security'],
    otSystems: ['SCADA', 'EMS', 'DCS', 'Nuclear I&C', 'Protection Relays'],
  },
  'ai-compute': {
    name: 'AI Compute',
    icon: '🖥️',
    searchTerms: ['data center construction', 'hyperscale AI', 'Stargate project', 'AI infrastructure investment'],
    competitors: ['Equinix', 'Digital Realty', 'Microsoft Azure', 'Google Cloud', 'AWS'],
    regulations: ['FedRAMP', 'NIST AI RMF', 'Executive Order 14110'],
    otSystems: ['BMS', 'DCIM', 'Power Distribution', 'Cooling Systems', 'Fire Suppression'],
  },
  'semiconductors': {
    name: 'Semiconductors',
    icon: '🔬',
    searchTerms: ['CHIPS Act funding', 'semiconductor fab', 'TSMC Arizona', 'Intel foundry', 'advanced packaging'],
    competitors: ['TSMC', 'Samsung', 'Intel', 'GlobalFoundries', 'Micron'],
    regulations: ['CHIPS Act', 'Export Controls', 'CFIUS', 'ITAR'],
    otSystems: ['Fab Equipment', 'Cleanroom Controls', 'Chemical Delivery', 'Metrology'],
  },
  'cooling': {
    name: 'Cooling',
    icon: '❄️',
    searchTerms: ['liquid cooling data center', 'immersion cooling', 'PUE efficiency', 'AI chip cooling'],
    competitors: ['Vertiv', 'Schneider Electric', 'Asetek', 'GRC', 'LiquidCool Solutions'],
    regulations: ['ASHRAE', 'EPA Water', 'Energy Star DC'],
    otSystems: ['Chiller Plants', 'CDU', 'Immersion Tanks', 'Heat Exchangers'],
  },
  'supply-chain': {
    name: 'Supply Chain',
    icon: '⛏️',
    searchTerms: ['rare earth mining', 'critical minerals', 'HALEU uranium', 'lithium processing', 'supply chain security'],
    competitors: ['MP Materials', 'Lynas', 'Albemarle', 'Centrus Energy'],
    regulations: ['Defense Production Act', 'IRA Critical Minerals', 'DOE HALEU'],
    otSystems: ['Mining Equipment', 'Processing Controls', 'Logistics Systems'],
  },
  'defense': {
    name: 'Defense & Security',
    icon: '🛡️',
    searchTerms: ['DOD AI contract', 'defense autonomous systems', 'JADC2', 'military cybersecurity'],
    competitors: ['Lockheed Martin', 'Raytheon', 'Northrop Grumman', 'General Dynamics', 'Anduril'],
    regulations: ['CMMC', 'DFARS', 'ITAR', 'FedRAMP High'],
    otSystems: ['Weapons Systems', 'C4ISR', 'Satellite Ground', 'Unmanned Systems'],
  },
  'healthcare': {
    name: 'Healthcare & Biotech',
    icon: '🧬',
    searchTerms: ['AI drug discovery', 'autonomous lab', 'FDA AI guidance', 'biotech automation'],
    competitors: ['Recursion', 'Insitro', 'Insilico Medicine', 'BenevolentAI'],
    regulations: ['FDA AI/ML', 'HIPAA', '21 CFR Part 11', 'GxP'],
    otSystems: ['Lab Automation', 'Bioreactors', 'Analytical Instruments', 'LIMS'],
  },
  'energy-systems': {
    name: 'Energy Systems',
    icon: '🔋',
    searchTerms: ['grid AI', 'energy storage', 'smart grid', 'renewable integration', 'demand response'],
    competitors: ['Siemens', 'ABB', 'GE Grid', 'Hitachi Energy', 'AutoGrid'],
    regulations: ['FERC', 'IEEE 2030', 'IEC 61850', 'NERC'],
    otSystems: ['DERMS', 'ADMS', 'Battery BMS', 'Microgrid Controllers'],
  },
  'manufacturing': {
    name: 'Manufacturing',
    icon: '🏭',
    searchTerms: ['smart factory', 'industrial AI', 'robotics automation', 'reshoring manufacturing'],
    competitors: ['Siemens', 'Rockwell', 'Fanuc', 'ABB Robotics', 'Tesla Optimus'],
    regulations: ['NIST Smart Manufacturing', 'ISA/IEC 62443', 'OSHA'],
    otSystems: ['PLC/DCS', 'MES', 'Industrial Robots', 'Vision Systems', 'CNC'],
  },
  'research': {
    name: 'Scientific Research',
    icon: '🔭',
    searchTerms: ['autonomous laboratory', 'AI scientific discovery', 'DOE national lab', 'research automation'],
    competitors: ['Emerald Cloud Lab', 'Strateos', 'Arctoris', 'Kebotix'],
    regulations: ['DOE Orders', 'NIH Data Sharing', 'NSF AI'],
    otSystems: ['Lab Instruments', 'HPC Systems', 'Experimental Controls', 'Data Acquisition'],
  },
};

// Initialize a sector agent with pre-populated intelligence
export function initializeSectorAgent(pillarId: GenesisPillar): SectorAgent {
  const context = SECTOR_CONTEXT[pillarId];
  const intel = SECTOR_INTELLIGENCE[pillarId];
  const now = new Date().toISOString();

  // Create timestamped findings
  const findings: SectorFinding[] = intel.findings.map((f, idx) => ({
    ...f,
    id: `${pillarId}-finding-${Date.now()}-${idx}`,
    timestamp: new Date(Date.now() - (idx * 3600000)).toISOString(), // Stagger timestamps
  }));

  // Create timestamped alerts
  const alerts: SectorAlert[] = intel.alerts.map((a, idx) => ({
    ...a,
    id: `${pillarId}-alert-${Date.now()}-${idx}`,
    timestamp: new Date(Date.now() - (idx * 1800000)).toISOString(),
    status: 'active' as const,
  }));

  return {
    id: pillarId,
    name: context.name,
    icon: context.icon,
    status: 'idle',
    lastRun: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    memory: {
      ...intel.memory,
      lastUpdated: now,
    },
    findings,
    alerts,
  };
}

// Run a sector agent (for fresh intelligence)
export async function runSectorAgent(
  pillarId: GenesisPillar,
  opportunities: Opportunity[],
  currentAgent?: SectorAgent
): Promise<{
  findings: SectorFinding[];
  alerts: SectorAlert[];
  memoryUpdates: Partial<SectorMemory>;
}> {
  const context = SECTOR_CONTEXT[pillarId];
  const sectorOpps = opportunities.filter(o => o.genesisPillar === pillarId);

  const systemPrompt = `You are a sector intelligence agent for Deloitte's OT Cyber practice, specializing in the ${context.name} sector. You are curious like Ralph Wiggum - always finding interesting things to share, persistent in your monitoring, genuinely excited about discoveries.

YOUR SECTOR FOCUS:
- Name: ${context.name}
- Key Search Terms: ${context.searchTerms.join(', ')}
- Main Competitors: ${context.competitors.join(', ')}
- Relevant Regulations: ${context.regulations.join(', ')}
- OT/ICS Systems: ${context.otSystems.join(', ')}

OPPORTUNITIES YOU'RE TRACKING (${sectorOpps.length}):
${sectorOpps.map(o => `- ${o.title} (${o.entity}) - $${(o.estimatedValue || 0).toLocaleString()} - ${o.procurementStage}`).join('\n')}

${currentAgent?.memory ? `
YOUR MEMORY (what you've learned):
- Market Trends: ${currentAgent.memory.marketTrends?.slice(-3).join('; ') || 'None yet'}
- Recent News: ${currentAgent.memory.recentNews?.slice(-3).map(n => n.headline).join('; ') || 'None yet'}
- Key Risks: ${currentAgent.memory.risks?.slice(-3).map(r => r.description).join('; ') || 'None identified'}
` : ''}

YOUR MISSION:
1. Monitor sector-wide news, regulations, and market movements
2. Track all opportunities in your sector simultaneously
3. Identify synergies between opportunities
4. Flag critical deadlines and regulatory changes
5. Watch competitor activity that affects multiple opportunities
6. Recommend strategic actions across the sector portfolio

Be specific and actionable. Include names, dates, dollar amounts. Think like a sector expert who understands both the technical OT/ICS domain and the business development landscape.`;

  const userPrompt = `Run your sector monitoring check for ${new Date().toISOString().split('T')[0]}.

Based on your knowledge, provide SPECIFIC, ACTIONABLE findings. Include:
1. Recent news with company names, dates, dollar amounts
2. Regulatory updates with specific rules/orders
3. Competitor movements with specific companies
4. Technical developments relevant to OT/ICS security
5. Deadline updates for tracked opportunities

Provide your findings as JSON:
{
  "findings": [
    {
      "type": "news|regulation|competitor|technical|market|deadline",
      "title": "Brief title",
      "summary": "What you found and why it matters - be specific with names, dates, numbers",
      "source": "Where you found it",
      "relevance": "critical|high|medium|low",
      "affectedOpportunities": ["opp-id-1"],
      "actionRequired": true/false
    }
  ],
  "alerts": [
    {
      "priority": "urgent|high|medium",
      "message": "What needs attention - be specific",
      "opportunityId": "specific-opp-id if applicable",
      "action": "Specific action to take"
    }
  ],
  "memoryUpdates": {
    "marketTrends": ["Specific trend with numbers"],
    "regulatoryUpdates": ["Specific regulation change"],
    "recentNews": [{"date": "YYYY-MM-DD", "headline": "Specific headline", "source": "Source"}],
    "risks": [{"description": "Specific risk", "severity": "high|medium|low"}]
  }
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    const findings: SectorFinding[] = (result.findings || []).map((f: Record<string, unknown>, idx: number) => ({
      id: `${pillarId}-finding-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      type: f.type as SectorFinding['type'],
      title: f.title as string,
      summary: f.summary as string,
      source: f.source as string,
      sourceUrl: f.sourceUrl as string | undefined,
      relevance: f.relevance as SectorFinding['relevance'],
      affectedOpportunities: (f.affectedOpportunities as string[]) || [],
      actionRequired: f.actionRequired as boolean,
    }));

    const alerts: SectorAlert[] = (result.alerts || []).map((a: Record<string, unknown>, idx: number) => ({
      id: `${pillarId}-alert-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      priority: a.priority as SectorAlert['priority'],
      message: a.message as string,
      opportunityId: a.opportunityId as string | undefined,
      action: a.action as string,
      status: 'active' as const,
    }));

    return {
      findings,
      alerts,
      memoryUpdates: result.memoryUpdates || {},
    };
  } catch (error) {
    console.error(`Sector agent error (${pillarId}):`, error);
    // Return the pre-populated data as fallback
    const intel = SECTOR_INTELLIGENCE[pillarId];
    return {
      findings: intel.findings.map((f, idx) => ({
        ...f,
        id: `${pillarId}-finding-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
      })),
      alerts: intel.alerts.map((a, idx) => ({
        ...a,
        id: `${pillarId}-alert-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
        status: 'active' as const,
      })),
      memoryUpdates: { lastUpdated: new Date().toISOString() },
    };
  }
}

export function getAllSectorIds(): GenesisPillar[] {
  return Object.keys(SECTOR_CONTEXT) as GenesisPillar[];
}

export { SECTOR_CONTEXT, SECTOR_INTELLIGENCE };
