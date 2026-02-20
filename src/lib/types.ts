export type Sector =
  | 'data-centers'
  | 'nuclear'
  | 'grid'
  | 'semiconductors'
  | 'critical-minerals'
  | 'water'
  | 'ev-battery'
  | 'clean-energy'
  | 'manufacturing';

export type ProcurementStage =
  | 'announced'
  | 'planning'
  | 'rfp-open'
  | 'awarded'
  | 'construction'
  | 'operational';

export type OTRelevance = 'high' | 'medium' | 'low';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  entity: string; // Company or agency
  sector: Sector;
  procurementStage: ProcurementStage;
  otRelevance: OTRelevance;
  otRelevanceReason: string;
  estimatedValue: number | null; // in USD
  location: string;
  state: string;
  policyAlignment: string[]; // CHIPS, IRA, Genesis, etc.
  source: 'sam.gov' | 'news' | 'sec' | 'doe' | 'manual';
  sourceUrl: string;
  postedDate: string;
  responseDeadline: string | null;
  lastUpdated: string;
  naicsCode?: string;
  solicitationNumber?: string;
}

export interface Signal {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  sectors: Sector[];
  signalType: 'policy' | 'funding' | 'contract' | 'news';
  relevance: 'high' | 'medium' | 'low';
}

export interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  setAsideDescription: string;
  responseDeadLine: string;
  naicsCode: string;
  classificationCode: string;
  active: string;
  description: string;
  organizationType: string;
  resourceLinks: string[];
  uiLink: string;
  officeAddress: {
    city: string;
    state: string;
    zipcode: string;
    countryCode: string;
  };
  placeOfPerformance?: {
    city?: { name: string };
    state?: { code: string; name: string };
    country?: { code: string; name: string };
  };
  award?: {
    amount: string;
    date: string;
    number: string;
    awardee: {
      name: string;
      location: {
        city: { name: string };
        state: { code: string };
      };
    };
  };
}

// OT Cyber relevance keywords for scoring
export const OT_CYBER_KEYWORDS = {
  high: [
    'scada', 'ics', 'industrial control', 'operational technology', 'ot security',
    'nerc cip', 'nuclear', 'power plant', 'grid security', 'substation',
    'plc', 'dcs', 'hmi', 'rtu', 'critical infrastructure protection',
    'cybersecurity assessment', 'penetration testing', 'vulnerability assessment',
    'control system', 'energy management system', 'ems', 'nuclear regulatory',
    'nrc', 'ferc', 'pipeline security', 'water treatment', 'wastewater'
  ],
  medium: [
    'cybersecurity', 'network security', 'data center', 'cloud security',
    'security operations', 'soc', 'incident response', 'threat detection',
    'manufacturing', 'smart grid', 'renewable energy', 'battery storage',
    'electric vehicle', 'charging infrastructure', 'semiconductor', 'fab'
  ],
  low: [
    'it security', 'information security', 'compliance', 'audit',
    'risk assessment', 'security awareness', 'identity management'
  ]
};

// NAICS codes relevant to OT Cyber
export const OT_RELEVANT_NAICS = [
  '221111', // Nuclear Electric Power Generation
  '221112', // Fossil Fuel Electric Power Generation
  '221113', // Nuclear Electric Power Generation
  '221114', // Solar Electric Power Generation
  '221115', // Wind Electric Power Generation
  '221116', // Geothermal Electric Power Generation
  '221117', // Biomass Electric Power Generation
  '221118', // Other Electric Power Generation
  '221121', // Electric Bulk Power Transmission
  '221122', // Electric Power Distribution
  '221210', // Natural Gas Distribution
  '221310', // Water Supply and Irrigation Systems
  '221320', // Sewage Treatment Facilities
  '237130', // Power and Communication Line Construction
  '334413', // Semiconductor Manufacturing
  '334511', // Search, Detection, Navigation, Guidance Systems
  '518210', // Data Processing, Hosting
  '541512', // Computer Systems Design
  '541519', // Other Computer Related Services
  '541690', // Other Scientific and Technical Consulting
  '561621', // Security Systems Services
];

export const SECTOR_LABELS: Record<Sector, string> = {
  'data-centers': 'Data Centers',
  'nuclear': 'Nuclear Energy',
  'grid': 'Grid Infrastructure',
  'semiconductors': 'Semiconductors',
  'critical-minerals': 'Critical Minerals',
  'water': 'Water Infrastructure',
  'ev-battery': 'EV & Battery',
  'clean-energy': 'Clean Energy',
  'manufacturing': 'Manufacturing'
};

export const STAGE_LABELS: Record<ProcurementStage, string> = {
  'announced': 'Announced',
  'planning': 'Planning',
  'rfp-open': 'RFP Open',
  'awarded': 'Awarded',
  'construction': 'Construction',
  'operational': 'Operational'
};
