// Genesis Program Framework - The AI Manhattan Project
// Two layers: Infrastructure (build AI) + Applications (apply AI to national challenges)

// INFRASTRUCTURE PILLARS - Build the AI capacity
export type InfraPillar =
  | 'ai-compute'      // Data centers, hyperscale, AI infrastructure
  | 'power'           // Nuclear, grid, generation - feeds compute
  | 'semiconductors'  // Fabs - enable compute
  | 'cooling'         // Water, thermal management - sustains compute
  | 'supply-chain';   // Critical minerals, materials - builds everything

// APPLICATION PILLARS - Apply AI to national challenges (Genesis Mission)
export type AppPillar =
  | 'defense'         // DARPA, Palantir, Anduril, autonomous systems
  | 'healthcare'      // Drug discovery, diagnostics, autonomous labs
  | 'energy-systems'  // Grid optimization, nuclear design, fusion
  | 'manufacturing'   // Reshoring, automation, robotics
  | 'research';       // Scientific acceleration, autonomous labs

// Combined type for all pillars
export type GenesisPillar = InfraPillar | AppPillar;

// Helper to identify pillar layer
export type PillarLayer = 'infrastructure' | 'application';
export const PILLAR_LAYER: Record<GenesisPillar, PillarLayer> = {
  'ai-compute': 'infrastructure',
  'power': 'infrastructure',
  'semiconductors': 'infrastructure',
  'cooling': 'infrastructure',
  'supply-chain': 'infrastructure',
  'defense': 'application',
  'healthcare': 'application',
  'energy-systems': 'application',
  'manufacturing': 'application',
  'research': 'application',
};

export type Sector =
  | 'data-centers'
  | 'nuclear'
  | 'grid'
  | 'semiconductors'
  | 'critical-minerals'
  | 'water'
  | 'ev-battery'
  | 'clean-energy'
  | 'manufacturing'
  | 'defense'
  | 'pharma-biotech'
  | 'healthcare'
  | 'research-labs'
  | 'aerospace';

export type ProcurementStage =
  | 'pre-solicitation'  // Early - position now
  | 'rfp-open'          // Active - respond now
  | 'evaluation'        // Waiting - follow up
  | 'awarded'           // Won/lost - if won, staff up
  | 'execution'         // In progress - delivery
  | 'operational';      // Running - O&M opportunities

export type OTRelevance = 'critical' | 'high' | 'medium' | 'low';

export type Urgency = 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'watching';

// Regulatory frameworks that drive OT security requirements
export type RegulatoryDriver =
  | 'nerc-cip'      // Electric utilities - mandatory
  | 'nrc-cyber'     // Nuclear - 10 CFR 73.54
  | 'cfats'         // Chemical facilities
  | 'mtsa'          // Maritime
  | 'tsa-pipeline'  // Pipeline security directives
  | 'fedramp'       // Federal cloud
  | 'cmmc'          // Defense contractors
  | 'executive-order'; // EO mandates

// OT/ICS systems that Deloitte can secure
export type OTSystem =
  | 'scada'
  | 'dcs'
  | 'plc'
  | 'hmi'
  | 'historian'
  | 'ems'           // Energy management system
  | 'bms'           // Building management system
  | 'mes'           // Manufacturing execution system
  | 'sis';          // Safety instrumented system

// Deloitte service offerings
export type DeloitteService =
  | 'ot-assessment'
  | 'ics-architecture'
  | 'nerc-cip-compliance'
  | 'nuclear-cyber'
  | 'incident-response'
  | 'soc-integration'
  | 'network-segmentation'
  | 'secure-remote-access'
  | 'vendor-risk'
  | 'tabletop-exercises';

export interface Opportunity {
  id: string;
  title: string;
  subtitle: string;  // One-liner on what this is

  // Genesis connection
  genesisPillar: GenesisPillar;
  genesisConnection: string;  // How does this connect to the AI buildout?

  // Basic info
  entity: string;
  entityType: 'federal' | 'utility' | 'enterprise' | 'state-local';
  sector: Sector;
  location: string;
  state: string;

  // The money
  estimatedValue: number | null;
  contractType: 'prime' | 'subcontract' | 'direct' | 'unknown';
  fundingSource: string;  // CHIPS, IRA, BIL, DOE, private, etc.

  // Timeline & urgency
  procurementStage: ProcurementStage;
  urgency: Urgency;
  keyDate: string | null;       // Next important date
  keyDateDescription: string | null;  // What happens on that date
  postedDate: string;
  responseDeadline: string | null;

  // OT Cyber specifics - this is the meat
  otRelevance: OTRelevance;
  otSystems: OTSystem[];
  otScope: string;  // Detailed description of OT security needs
  regulatoryDrivers: RegulatoryDriver[];
  complianceRequirements: string;  // Specific compliance needs

  // Deloitte angle
  deloitteServices: DeloitteService[];
  deloitteAngle: string;  // Why Deloitte? What's our differentiator?
  existingRelationship: 'strong' | 'some' | 'none' | 'unknown';

  // Competition & ecosystem
  likelyPrimes: string[];
  competitors: string[];
  partnerOpportunities: string[];  // Who could we team with?

  // Evidence & sources
  sources: {
    title: string;
    url: string;
    date: string;
  }[];

  // Strategic context - US vs China competition
  gapsAddressed?: string[];  // IDs of strategic gaps this opportunity helps close

  // Meta
  lastUpdated: string;
  confidence: 'confirmed' | 'likely' | 'speculative';
  notes: string;
  source?: 'curated' | 'sam.gov';
}

export interface Signal {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  genesisPillar: GenesisPillar;
  sectors: Sector[];
  signalType: 'policy' | 'funding' | 'contract-award' | 'rfp' | 'news' | 'earnings';
  relevance: OTRelevance;
  actionRequired: string | null;  // What should Jason do about this?
}

// Labels for display
export const GENESIS_PILLAR_INFO: Record<GenesisPillar, { label: string; description: string; icon: string; layer: PillarLayer }> = {
  // INFRASTRUCTURE PILLARS
  'ai-compute': {
    label: 'AI Compute',
    description: 'Data centers, hyperscale infrastructure, AI training facilities',
    icon: '🖥️',
    layer: 'infrastructure'
  },
  'power': {
    label: 'Power',
    description: 'Nuclear, grid infrastructure, generation capacity to feed AI compute',
    icon: '⚡',
    layer: 'infrastructure'
  },
  'semiconductors': {
    label: 'Semiconductors',
    description: 'Chip fabrication enabling AI compute',
    icon: '🔬',
    layer: 'infrastructure'
  },
  'cooling': {
    label: 'Cooling & Water',
    description: 'Thermal management, water treatment sustaining compute and fabs',
    icon: '💧',
    layer: 'infrastructure'
  },
  'supply-chain': {
    label: 'Supply Chain',
    description: 'Critical minerals, rare earths, materials building everything',
    icon: '⛏️',
    layer: 'infrastructure'
  },
  // APPLICATION PILLARS
  'defense': {
    label: 'Defense & Security',
    description: 'AI for national security, autonomous systems, battlefield AI',
    icon: '🛡️',
    layer: 'application'
  },
  'healthcare': {
    label: 'Healthcare & Biotech',
    description: 'AI drug discovery, diagnostics, autonomous labs, precision medicine',
    icon: '🧬',
    layer: 'application'
  },
  'energy-systems': {
    label: 'Energy Systems',
    description: 'AI grid optimization, smart grids, nuclear design, fusion research',
    icon: '🔋',
    layer: 'application'
  },
  'manufacturing': {
    label: 'Manufacturing',
    description: 'AI-powered reshoring, smart factories, automation, robotics',
    icon: '🏭',
    layer: 'application'
  },
  'research': {
    label: 'Scientific Research',
    description: 'Autonomous labs, materials discovery, accelerated R&D',
    icon: '🔭',
    layer: 'application'
  }
};

export const SECTOR_LABELS: Record<Sector, string> = {
  'data-centers': 'Data Centers',
  'nuclear': 'Nuclear',
  'grid': 'Grid',
  'semiconductors': 'Semiconductors',
  'critical-minerals': 'Critical Minerals',
  'water': 'Water',
  'ev-battery': 'EV & Battery',
  'clean-energy': 'Clean Energy',
  'manufacturing': 'Manufacturing',
  'defense': 'Defense',
  'pharma-biotech': 'Pharma & Biotech',
  'healthcare': 'Healthcare',
  'research-labs': 'Research Labs',
  'aerospace': 'Aerospace'
};

export const STAGE_LABELS: Record<ProcurementStage, string> = {
  'pre-solicitation': 'Pre-Solicitation',
  'rfp-open': 'RFP Open',
  'evaluation': 'Evaluation',
  'awarded': 'Awarded',
  'execution': 'Execution',
  'operational': 'Operational'
};

export const URGENCY_LABELS: Record<Urgency, { label: string; color: string }> = {
  'this-week': { label: 'This Week', color: 'red' },
  'this-month': { label: 'This Month', color: 'orange' },
  'this-quarter': { label: 'This Quarter', color: 'yellow' },
  'this-year': { label: 'This Year', color: 'blue' },
  'watching': { label: 'Watching', color: 'gray' }
};

export const OT_SYSTEM_LABELS: Record<OTSystem, string> = {
  'scada': 'SCADA',
  'dcs': 'DCS',
  'plc': 'PLC/RTU',
  'hmi': 'HMI',
  'historian': 'Historian',
  'ems': 'Energy Management',
  'bms': 'Building Management',
  'mes': 'Manufacturing Execution',
  'sis': 'Safety Systems'
};

export const REGULATORY_LABELS: Record<RegulatoryDriver, string> = {
  'nerc-cip': 'NERC CIP',
  'nrc-cyber': 'NRC 10 CFR 73.54',
  'cfats': 'CFATS',
  'mtsa': 'MTSA',
  'tsa-pipeline': 'TSA Pipeline SD',
  'fedramp': 'FedRAMP',
  'cmmc': 'CMMC',
  'executive-order': 'Executive Order'
};

export const DELOITTE_SERVICE_LABELS: Record<DeloitteService, string> = {
  'ot-assessment': 'OT Security Assessment',
  'ics-architecture': 'ICS Security Architecture',
  'nerc-cip-compliance': 'NERC CIP Compliance',
  'nuclear-cyber': 'Nuclear Cybersecurity',
  'incident-response': 'ICS Incident Response',
  'soc-integration': 'OT/IT SOC Integration',
  'network-segmentation': 'Network Segmentation',
  'secure-remote-access': 'Secure Remote Access',
  'vendor-risk': 'OT Vendor Risk',
  'tabletop-exercises': 'ICS Tabletop Exercises'
};
