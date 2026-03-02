// Grid Supply-Side Types
// Track existing generation, interconnection queue, and retirements

export type FuelType =
  | 'natural-gas'
  | 'coal'
  | 'nuclear'
  | 'wind'
  | 'solar'
  | 'hydro'
  | 'battery'
  | 'other';

export type GenerationStatus =
  | 'operating'
  | 'under-construction'
  | 'permitted'
  | 'in-queue'
  | 'proposed'
  | 'retiring';

export type GridRegion =
  | 'ERCOT'
  | 'PJM'
  | 'MISO'
  | 'CAISO'
  | 'SPP'
  | 'NYISO'
  | 'ISO-NE'
  | 'SERC'
  | 'WECC'
  | 'OTHER';

// Existing generation capacity
export interface GenerationAsset {
  id: string;
  name: string;
  owner: string;
  fuelType: FuelType;
  capacityMW: number;
  gridRegion: GridRegion;
  state: string;
  status: GenerationStatus;
  onlineYear: number;
  retirementYear?: number;
  capacityFactor?: number; // Average output as % of nameplate
  notes?: string;
}

// Interconnection queue project
export interface QueueProject {
  id: string;
  name: string;
  developer: string;
  fuelType: FuelType;
  capacityMW: number;
  gridRegion: GridRegion;
  state: string;
  county?: string;
  queuePosition?: number;
  queueDate: string; // When entered queue
  expectedOnline?: string;
  status: 'active' | 'suspended' | 'withdrawn' | 'completed';
  studyPhase?: 'feasibility' | 'system-impact' | 'facilities' | 'construction';
  interconnectionCostM?: number; // Estimated cost in millions
  notes?: string;
}

// Planned retirement
export interface PlannedRetirement {
  id: string;
  plantName: string;
  owner: string;
  fuelType: FuelType;
  capacityMW: number;
  gridRegion: GridRegion;
  state: string;
  retirementDate: string;
  reason: 'economic' | 'environmental' | 'age' | 'policy' | 'other';
  replacementPlan?: string;
  notes?: string;
}

// Regional supply summary
export interface RegionSupplySummary {
  region: GridRegion;

  // Existing capacity
  totalCapacityGW: number;
  capacityByFuel: Record<FuelType, number>;

  // Current operations
  peakDemandGW: number;
  reserveMarginPct: number;

  // Queue
  queueTotalGW: number;
  queueByFuel: Record<FuelType, number>;
  queueCompletionRate: number; // Historical % that actually get built

  // Retirements
  retiringBy2030GW: number;
  retiringByFuel: Record<FuelType, number>;

  // Net position
  netAdditionsBy2030GW: number; // Queue * completion rate - retirements
}

// Display info
export const FUEL_TYPE_INFO: Record<FuelType, { label: string; icon: string; color: string; dispatchable: boolean }> = {
  'natural-gas': { label: 'Natural Gas', icon: '🔥', color: '#f97316', dispatchable: true },
  'coal': { label: 'Coal', icon: '�ite', color: '#78716c', dispatchable: true },
  'nuclear': { label: 'Nuclear', icon: '⚛️', color: '#a855f7', dispatchable: true },
  'wind': { label: 'Wind', icon: '💨', color: '#22d3ee', dispatchable: false },
  'solar': { label: 'Solar', icon: '☀️', color: '#facc15', dispatchable: false },
  'hydro': { label: 'Hydro', icon: '💧', color: '#3b82f6', dispatchable: true },
  'battery': { label: 'Battery Storage', icon: '🔋', color: '#22c55e', dispatchable: true },
  'other': { label: 'Other', icon: '⚡', color: '#6b7280', dispatchable: false },
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
