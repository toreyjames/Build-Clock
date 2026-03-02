// Energy Demand Database Types
// Track announced data centers, fabs, manufacturing that need grid power

export type DemandCategory =
  | 'data-center'      // AI/ML, hyperscale, colo
  | 'semiconductor'    // Fabs, packaging, test
  | 'ev-battery'       // Battery plants, EV manufacturing
  | 'manufacturing'    // General industrial reshoring
  | 'hydrogen'         // Green hydrogen production
  | 'other';

export type ProjectStatus =
  | 'announced'        // Press release, no permits yet
  | 'planning'         // In permitting/planning phase
  | 'approved'         // Permits approved
  | 'under-construction' // Breaking ground
  | 'operational'      // Live and consuming power
  | 'cancelled';       // No longer happening

export type PowerStrategy =
  | 'grid-only'        // Relying entirely on grid
  | 'grid-plus-ppa'    // Grid + renewable PPA
  | 'self-gen'         // Building own generation
  | 'behind-meter'     // On-site generation
  | 'nuclear-smr'      // Small modular reactor
  | 'unknown';

export type GridRegion =
  | 'ERCOT'    // Texas
  | 'PJM'      // Mid-Atlantic, Midwest
  | 'MISO'     // Midwest
  | 'CAISO'    // California
  | 'SPP'      // Southwest Power Pool
  | 'NYISO'    // New York
  | 'ISO-NE'   // New England
  | 'SERC'     // Southeast
  | 'WECC'     // Western (non-CAISO)
  | 'OTHER';

export interface EnergyDemandProject {
  id: string;

  // Basic info
  name: string;
  company: string;
  category: DemandCategory;
  status: ProjectStatus;

  // Location
  location: string;        // City/region
  state: string;           // State abbreviation
  gridRegion: GridRegion;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Power demand
  powerMW: number;           // Peak demand in MW
  powerMWRange?: {           // If uncertain
    low: number;
    high: number;
  };

  // Timeline
  announcedDate: string;     // When announced
  targetOnline: string;      // Target operational date
  constructionStart?: string;

  // Power strategy
  powerStrategy: PowerStrategy;
  selfGenMW?: number;        // If building own generation
  selfGenType?: string;      // Solar, gas, nuclear, etc.
  ppaDetails?: string;       // PPA info if known

  // Investment
  investmentUSD?: number;    // Total project investment
  fundingSource?: string;    // CHIPS Act, IRA, private, etc.

  // Links to opportunity tracker
  opportunityIds?: string[]; // Related opportunities in tracker

  // Sources
  sources: {
    title: string;
    url: string;
    date: string;
  }[];

  notes: string;
  lastUpdated: string;
}

// Aggregated regional stats
export interface RegionDemandSummary {
  region: GridRegion;

  // Current state
  existingCapacityGW: number;
  currentPeakGW: number;
  reserveMarginPct: number;

  // Announced demand
  announcedProjects: number;
  announcedDemandGW: number;

  // By category
  demandByCategory: {
    category: DemandCategory;
    projectCount: number;
    demandGW: number;
  }[];

  // Timeline
  demandBy2026GW: number;
  demandBy2028GW: number;
  demandBy2030GW: number;

  // Supply side
  queuedGenerationGW: number;
  plannedRetirementsGW: number;

  // The gap
  projectedGap2028GW: number;
  projectedGap2030GW: number;
}

// Display labels
export const DEMAND_CATEGORY_LABELS: Record<DemandCategory, { label: string; icon: string; color: string }> = {
  'data-center': { label: 'Data Center', icon: '🖥️', color: 'text-cyan-400 bg-cyan-500/20' },
  'semiconductor': { label: 'Semiconductor', icon: '🔬', color: 'text-purple-400 bg-purple-500/20' },
  'ev-battery': { label: 'EV & Battery', icon: '🔋', color: 'text-green-400 bg-green-500/20' },
  'manufacturing': { label: 'Manufacturing', icon: '🏭', color: 'text-orange-400 bg-orange-500/20' },
  'hydrogen': { label: 'Hydrogen', icon: '💨', color: 'text-blue-400 bg-blue-500/20' },
  'other': { label: 'Other', icon: '📦', color: 'text-gray-400 bg-gray-500/20' },
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, { label: string; color: string }> = {
  'announced': { label: 'Announced', color: 'text-blue-300 bg-blue-500/20 border-blue-500/40' },
  'planning': { label: 'Planning', color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' },
  'approved': { label: 'Approved', color: 'text-green-300 bg-green-500/20 border-green-500/40' },
  'under-construction': { label: 'Construction', color: 'text-orange-300 bg-orange-500/20 border-orange-500/40' },
  'operational': { label: 'Operational', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40' },
  'cancelled': { label: 'Cancelled', color: 'text-red-300 bg-red-500/20 border-red-500/40' },
};

export const GRID_REGION_INFO: Record<GridRegion, { name: string; states: string[]; color: string }> = {
  'ERCOT': { name: 'ERCOT (Texas)', states: ['TX'], color: '#f59e0b' },
  'PJM': { name: 'PJM Interconnection', states: ['PA', 'NJ', 'MD', 'DE', 'VA', 'WV', 'OH', 'DC', 'NC', 'IL', 'IN', 'KY', 'MI'], color: '#3b82f6' },
  'MISO': { name: 'MISO', states: ['MN', 'WI', 'IA', 'IL', 'IN', 'MI', 'MO', 'AR', 'LA', 'MS', 'TX'], color: '#10b981' },
  'CAISO': { name: 'California ISO', states: ['CA'], color: '#8b5cf6' },
  'SPP': { name: 'Southwest Power Pool', states: ['KS', 'OK', 'NE', 'NM', 'TX', 'AR', 'LA', 'MO', 'MT', 'ND', 'SD', 'WY'], color: '#ec4899' },
  'NYISO': { name: 'New York ISO', states: ['NY'], color: '#06b6d4' },
  'ISO-NE': { name: 'ISO New England', states: ['MA', 'CT', 'RI', 'NH', 'VT', 'ME'], color: '#14b8a6' },
  'SERC': { name: 'SERC Southeast', states: ['GA', 'FL', 'AL', 'SC', 'TN', 'NC'], color: '#f97316' },
  'WECC': { name: 'Western', states: ['WA', 'OR', 'NV', 'AZ', 'UT', 'CO', 'WY', 'MT', 'ID', 'NM'], color: '#6366f1' },
  'OTHER': { name: 'Other', states: [], color: '#6b7280' },
};
