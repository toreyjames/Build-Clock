// Grid Supply-Side Data
// Existing generation, interconnection queue, planned retirements

import {
  GridRegion,
  FuelType,
  QueueProject,
  PlannedRetirement,
} from './grid-supply-types';

// Regional capacity summary (GW) - based on EIA and ISO data
export const REGIONAL_CAPACITY: Record<GridRegion, {
  totalGW: number;
  peakDemandGW: number;
  byFuel: Record<FuelType, number>;
}> = {
  'ERCOT': {
    totalGW: 152,
    peakDemandGW: 85,
    byFuel: {
      'natural-gas': 65,
      'coal': 14,
      'nuclear': 5,
      'wind': 40,
      'solar': 22,
      'hydro': 0.5,
      'battery': 5,
      'other': 0.5,
    },
  },
  'PJM': {
    totalGW: 185,
    peakDemandGW: 150,
    byFuel: {
      'natural-gas': 85,
      'coal': 28,
      'nuclear': 33,
      'wind': 12,
      'solar': 8,
      'hydro': 8,
      'battery': 3,
      'other': 8,
    },
  },
  'MISO': {
    totalGW: 140,
    peakDemandGW: 127,
    byFuel: {
      'natural-gas': 55,
      'coal': 32,
      'nuclear': 12,
      'wind': 28,
      'solar': 5,
      'hydro': 2,
      'battery': 1,
      'other': 5,
    },
  },
  'CAISO': {
    totalGW: 85,
    peakDemandGW: 52,
    byFuel: {
      'natural-gas': 42,
      'coal': 0,
      'nuclear': 2.3,
      'wind': 7,
      'solar': 22,
      'hydro': 8,
      'battery': 8,
      'other': 0.7,
    },
  },
  'SPP': {
    totalGW: 90,
    peakDemandGW: 55,
    byFuel: {
      'natural-gas': 35,
      'coal': 15,
      'nuclear': 2,
      'wind': 35,
      'solar': 3,
      'hydro': 2,
      'battery': 0.5,
      'other': 0.5,
    },
  },
  'NYISO': {
    totalGW: 40,
    peakDemandGW: 32,
    byFuel: {
      'natural-gas': 22,
      'coal': 0,
      'nuclear': 3.3,
      'wind': 2.5,
      'solar': 4,
      'hydro': 6,
      'battery': 0.5,
      'other': 1.7,
    },
  },
  'ISO-NE': {
    totalGW: 32,
    peakDemandGW: 26,
    byFuel: {
      'natural-gas': 18,
      'coal': 0.5,
      'nuclear': 3.4,
      'wind': 1.5,
      'solar': 5,
      'hydro': 2,
      'battery': 0.6,
      'other': 1,
    },
  },
  'SERC': {
    totalGW: 120,
    peakDemandGW: 95,
    byFuel: {
      'natural-gas': 55,
      'coal': 22,
      'nuclear': 20,
      'wind': 2,
      'solar': 12,
      'hydro': 5,
      'battery': 2,
      'other': 2,
    },
  },
  'WECC': {
    totalGW: 95,
    peakDemandGW: 70,
    byFuel: {
      'natural-gas': 35,
      'coal': 12,
      'nuclear': 4,
      'wind': 15,
      'solar': 18,
      'hydro': 8,
      'battery': 2,
      'other': 1,
    },
  },
  'OTHER': {
    totalGW: 20,
    peakDemandGW: 15,
    byFuel: {
      'natural-gas': 8,
      'coal': 4,
      'nuclear': 0,
      'wind': 3,
      'solar': 2,
      'hydro': 2,
      'battery': 0.5,
      'other': 0.5,
    },
  },
};

// Major interconnection queue projects (sample - real queues have 1000s of projects)
export const QUEUE_PROJECTS: QueueProject[] = [
  // ERCOT Queue
  {
    id: 'q-ercot-1',
    name: 'West Texas Solar Complex',
    developer: 'NextEra Energy',
    fuelType: 'solar',
    capacityMW: 2500,
    gridRegion: 'ERCOT',
    state: 'TX',
    county: 'Pecos',
    queueDate: '2023-06-15',
    expectedOnline: '2026-12-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-ercot-2',
    name: 'Permian Basin Wind',
    developer: 'Invenergy',
    fuelType: 'wind',
    capacityMW: 1800,
    gridRegion: 'ERCOT',
    state: 'TX',
    county: 'Andrews',
    queueDate: '2023-03-22',
    expectedOnline: '2027-06-01',
    status: 'active',
    studyPhase: 'system-impact',
  },
  {
    id: 'q-ercot-3',
    name: 'Houston BESS Project',
    developer: 'Plus Power',
    fuelType: 'battery',
    capacityMW: 800,
    gridRegion: 'ERCOT',
    state: 'TX',
    county: 'Harris',
    queueDate: '2024-01-10',
    expectedOnline: '2026-06-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-ercot-4',
    name: 'Abilene Gas Peaker',
    developer: 'Talen Energy',
    fuelType: 'natural-gas',
    capacityMW: 1200,
    gridRegion: 'ERCOT',
    state: 'TX',
    county: 'Taylor',
    queueDate: '2024-04-05',
    expectedOnline: '2028-01-01',
    status: 'active',
    studyPhase: 'system-impact',
  },

  // PJM Queue
  {
    id: 'q-pjm-1',
    name: 'Virginia Solar Farm',
    developer: 'Dominion Energy',
    fuelType: 'solar',
    capacityMW: 1500,
    gridRegion: 'PJM',
    state: 'VA',
    county: 'Spotsylvania',
    queueDate: '2023-09-01',
    expectedOnline: '2027-03-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-pjm-2',
    name: 'Ohio Valley Gas Plant',
    developer: 'NRG Energy',
    fuelType: 'natural-gas',
    capacityMW: 1100,
    gridRegion: 'PJM',
    state: 'OH',
    county: 'Jefferson',
    queueDate: '2023-07-15',
    expectedOnline: '2028-06-01',
    status: 'active',
    studyPhase: 'system-impact',
  },
  {
    id: 'q-pjm-3',
    name: 'Maryland Offshore Wind',
    developer: 'US Wind',
    fuelType: 'wind',
    capacityMW: 2000,
    gridRegion: 'PJM',
    state: 'MD',
    queueDate: '2022-11-20',
    expectedOnline: '2028-12-01',
    status: 'active',
    studyPhase: 'facilities',
    interconnectionCostM: 450,
  },
  {
    id: 'q-pjm-4',
    name: 'Pennsylvania Battery Storage',
    developer: 'LS Power',
    fuelType: 'battery',
    capacityMW: 600,
    gridRegion: 'PJM',
    state: 'PA',
    county: 'Dauphin',
    queueDate: '2024-02-28',
    expectedOnline: '2026-09-01',
    status: 'active',
    studyPhase: 'feasibility',
  },

  // MISO Queue
  {
    id: 'q-miso-1',
    name: 'Iowa Wind Expansion',
    developer: 'MidAmerican Energy',
    fuelType: 'wind',
    capacityMW: 2200,
    gridRegion: 'MISO',
    state: 'IA',
    county: 'Buena Vista',
    queueDate: '2023-04-10',
    expectedOnline: '2027-01-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-miso-2',
    name: 'Minnesota Solar Array',
    developer: 'Xcel Energy',
    fuelType: 'solar',
    capacityMW: 1200,
    gridRegion: 'MISO',
    state: 'MN',
    county: 'Chisago',
    queueDate: '2023-08-25',
    expectedOnline: '2026-08-01',
    status: 'active',
    studyPhase: 'system-impact',
  },
  {
    id: 'q-miso-3',
    name: 'Illinois Gas Combined Cycle',
    developer: 'Vistra',
    fuelType: 'natural-gas',
    capacityMW: 900,
    gridRegion: 'MISO',
    state: 'IL',
    county: 'Will',
    queueDate: '2024-01-15',
    expectedOnline: '2028-03-01',
    status: 'active',
    studyPhase: 'feasibility',
  },

  // CAISO Queue
  {
    id: 'q-caiso-1',
    name: 'Mojave Solar + Storage',
    developer: 'AES',
    fuelType: 'solar',
    capacityMW: 1800,
    gridRegion: 'CAISO',
    state: 'CA',
    county: 'San Bernardino',
    queueDate: '2023-05-01',
    expectedOnline: '2026-06-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-caiso-2',
    name: 'Central Valley Battery',
    developer: 'Tesla Energy',
    fuelType: 'battery',
    capacityMW: 1500,
    gridRegion: 'CAISO',
    state: 'CA',
    county: 'Kern',
    queueDate: '2023-11-01',
    expectedOnline: '2026-03-01',
    status: 'active',
    studyPhase: 'construction',
  },

  // SPP Queue
  {
    id: 'q-spp-1',
    name: 'Oklahoma Wind Farm',
    developer: 'Enel',
    fuelType: 'wind',
    capacityMW: 1500,
    gridRegion: 'SPP',
    state: 'OK',
    county: 'Woodward',
    queueDate: '2023-06-20',
    expectedOnline: '2026-12-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-spp-2',
    name: 'Kansas Solar Project',
    developer: 'Lightsource BP',
    fuelType: 'solar',
    capacityMW: 800,
    gridRegion: 'SPP',
    state: 'KS',
    county: 'Finney',
    queueDate: '2024-02-01',
    expectedOnline: '2027-04-01',
    status: 'active',
    studyPhase: 'system-impact',
  },

  // SERC Queue
  {
    id: 'q-serc-1',
    name: 'Georgia Solar Complex',
    developer: 'Southern Company',
    fuelType: 'solar',
    capacityMW: 2000,
    gridRegion: 'SERC',
    state: 'GA',
    county: 'Burke',
    queueDate: '2023-03-15',
    expectedOnline: '2026-09-01',
    status: 'active',
    studyPhase: 'construction',
  },
  {
    id: 'q-serc-2',
    name: 'Florida Battery Network',
    developer: 'FPL',
    fuelType: 'battery',
    capacityMW: 1200,
    gridRegion: 'SERC',
    state: 'FL',
    county: 'Manatee',
    queueDate: '2023-09-10',
    expectedOnline: '2026-04-01',
    status: 'active',
    studyPhase: 'facilities',
  },

  // NYISO Queue
  {
    id: 'q-nyiso-1',
    name: 'Empire Wind',
    developer: 'Equinor/BP',
    fuelType: 'wind',
    capacityMW: 2100,
    gridRegion: 'NYISO',
    state: 'NY',
    queueDate: '2021-06-01',
    expectedOnline: '2027-06-01',
    status: 'active',
    studyPhase: 'construction',
    interconnectionCostM: 800,
  },
  {
    id: 'q-nyiso-2',
    name: 'Long Island Solar',
    developer: 'PSEG',
    fuelType: 'solar',
    capacityMW: 400,
    gridRegion: 'NYISO',
    state: 'NY',
    county: 'Suffolk',
    queueDate: '2024-01-20',
    expectedOnline: '2026-08-01',
    status: 'active',
    studyPhase: 'feasibility',
  },

  // ISO-NE Queue
  {
    id: 'q-isone-1',
    name: 'Vineyard Wind 1',
    developer: 'Avangrid/CIP',
    fuelType: 'wind',
    capacityMW: 800,
    gridRegion: 'ISO-NE',
    state: 'MA',
    queueDate: '2020-01-15',
    expectedOnline: '2025-12-01',
    status: 'active',
    studyPhase: 'construction',
  },
  {
    id: 'q-isone-2',
    name: 'Maine Solar Array',
    developer: 'Longroad Energy',
    fuelType: 'solar',
    capacityMW: 350,
    gridRegion: 'ISO-NE',
    state: 'ME',
    county: 'Aroostook',
    queueDate: '2023-10-05',
    expectedOnline: '2026-06-01',
    status: 'active',
    studyPhase: 'system-impact',
  },

  // WECC Queue
  {
    id: 'q-wecc-1',
    name: 'Nevada Solar Valley',
    developer: '8minute Solar',
    fuelType: 'solar',
    capacityMW: 2200,
    gridRegion: 'WECC',
    state: 'NV',
    county: 'Clark',
    queueDate: '2023-04-01',
    expectedOnline: '2027-01-01',
    status: 'active',
    studyPhase: 'facilities',
  },
  {
    id: 'q-wecc-2',
    name: 'Arizona Battery Hub',
    developer: 'Fluence',
    fuelType: 'battery',
    capacityMW: 1000,
    gridRegion: 'WECC',
    state: 'AZ',
    county: 'Maricopa',
    queueDate: '2024-01-10',
    expectedOnline: '2026-06-01',
    status: 'active',
    studyPhase: 'system-impact',
  },
];

// Planned retirements
export const PLANNED_RETIREMENTS: PlannedRetirement[] = [
  // Coal retirements
  {
    id: 'ret-1',
    plantName: 'Martin Lake Power Plant',
    owner: 'Luminant',
    fuelType: 'coal',
    capacityMW: 2250,
    gridRegion: 'ERCOT',
    state: 'TX',
    retirementDate: '2028-12-31',
    reason: 'economic',
    notes: 'Largest coal plant in Texas',
  },
  {
    id: 'ret-2',
    plantName: 'Homer City Generating Station',
    owner: 'NRG',
    fuelType: 'coal',
    capacityMW: 1884,
    gridRegion: 'PJM',
    state: 'PA',
    retirementDate: '2027-06-30',
    reason: 'economic',
  },
  {
    id: 'ret-3',
    plantName: 'Bruce Mansfield Power Station',
    owner: 'FirstEnergy',
    fuelType: 'coal',
    capacityMW: 2490,
    gridRegion: 'PJM',
    state: 'PA',
    retirementDate: '2026-12-31',
    reason: 'economic',
  },
  {
    id: 'ret-4',
    plantName: 'Rush Island Power Plant',
    owner: 'Ameren',
    fuelType: 'coal',
    capacityMW: 1178,
    gridRegion: 'MISO',
    state: 'MO',
    retirementDate: '2025-10-15',
    reason: 'environmental',
    notes: 'EPA Clean Air Act compliance',
  },
  {
    id: 'ret-5',
    plantName: 'Scherer Plant Units 1-4',
    owner: 'Georgia Power',
    fuelType: 'coal',
    capacityMW: 3520,
    gridRegion: 'SERC',
    state: 'GA',
    retirementDate: '2028-12-31',
    reason: 'policy',
    notes: 'Largest coal plant in US - partial retirement',
  },
  {
    id: 'ret-6',
    plantName: 'J.H. Campbell Plant',
    owner: 'Consumers Energy',
    fuelType: 'coal',
    capacityMW: 1400,
    gridRegion: 'MISO',
    state: 'MI',
    retirementDate: '2025-12-31',
    reason: 'policy',
  },
  {
    id: 'ret-7',
    plantName: 'Waukegan Generating Station',
    owner: 'NRG',
    fuelType: 'coal',
    capacityMW: 690,
    gridRegion: 'PJM',
    state: 'IL',
    retirementDate: '2025-06-01',
    reason: 'environmental',
  },
  {
    id: 'ret-8',
    plantName: 'Jim Bridger Power Plant (Units 1-2)',
    owner: 'PacifiCorp',
    fuelType: 'coal',
    capacityMW: 1080,
    gridRegion: 'WECC',
    state: 'WY',
    retirementDate: '2028-01-01',
    reason: 'policy',
  },
  {
    id: 'ret-9',
    plantName: 'Colstrip Units 3-4',
    owner: 'Talen/NorthWestern',
    fuelType: 'coal',
    capacityMW: 1480,
    gridRegion: 'WECC',
    state: 'MT',
    retirementDate: '2029-12-31',
    reason: 'policy',
    notes: 'Washington state clean energy law',
  },
  {
    id: 'ret-10',
    plantName: 'Intermountain Power Plant',
    owner: 'IPA',
    fuelType: 'coal',
    capacityMW: 1800,
    gridRegion: 'WECC',
    state: 'UT',
    retirementDate: '2027-12-31',
    reason: 'policy',
    replacementPlan: 'Hydrogen turbines',
  },

  // Nuclear retirements
  {
    id: 'ret-11',
    plantName: 'Diablo Canyon (Unit 1)',
    owner: 'PG&E',
    fuelType: 'nuclear',
    capacityMW: 1100,
    gridRegion: 'CAISO',
    state: 'CA',
    retirementDate: '2030-11-02',
    reason: 'policy',
    notes: 'Extended from 2024 - last CA nuclear plant',
  },
  {
    id: 'ret-12',
    plantName: 'Palisades Nuclear Plant',
    owner: 'Holtec',
    fuelType: 'nuclear',
    capacityMW: 811,
    gridRegion: 'MISO',
    state: 'MI',
    retirementDate: '2025-12-31',
    reason: 'economic',
    notes: 'Potential restart under DOE program',
  },

  // Gas plant retirements (older units)
  {
    id: 'ret-13',
    plantName: 'Moss Landing Units 1-2',
    owner: 'Vistra',
    fuelType: 'natural-gas',
    capacityMW: 1020,
    gridRegion: 'CAISO',
    state: 'CA',
    retirementDate: '2026-12-31',
    reason: 'environmental',
    replacementPlan: 'Battery storage already online',
  },
  {
    id: 'ret-14',
    plantName: 'Encina Power Station',
    owner: 'NRG',
    fuelType: 'natural-gas',
    capacityMW: 965,
    gridRegion: 'CAISO',
    state: 'CA',
    retirementDate: '2026-01-01',
    reason: 'environmental',
    notes: 'Once-through cooling phase out',
  },
];

// Queue summary by region (GW in active queue)
export const QUEUE_SUMMARY: Record<GridRegion, {
  totalGW: number;
  solarGW: number;
  windGW: number;
  batteryGW: number;
  gasGW: number;
  otherGW: number;
  completionRatePct: number; // Historical % that actually get built
}> = {
  'ERCOT': { totalGW: 200, solarGW: 85, windGW: 60, batteryGW: 35, gasGW: 15, otherGW: 5, completionRatePct: 18 },
  'PJM': { totalGW: 290, solarGW: 140, windGW: 50, batteryGW: 60, gasGW: 30, otherGW: 10, completionRatePct: 12 },
  'MISO': { totalGW: 180, solarGW: 65, windGW: 75, batteryGW: 25, gasGW: 10, otherGW: 5, completionRatePct: 15 },
  'CAISO': { totalGW: 150, solarGW: 80, windGW: 10, batteryGW: 55, gasGW: 2, otherGW: 3, completionRatePct: 20 },
  'SPP': { totalGW: 120, solarGW: 35, windGW: 70, batteryGW: 10, gasGW: 3, otherGW: 2, completionRatePct: 22 },
  'NYISO': { totalGW: 95, solarGW: 30, windGW: 45, batteryGW: 15, gasGW: 3, otherGW: 2, completionRatePct: 10 },
  'ISO-NE': { totalGW: 45, solarGW: 18, windGW: 15, batteryGW: 8, gasGW: 2, otherGW: 2, completionRatePct: 14 },
  'SERC': { totalGW: 110, solarGW: 60, windGW: 8, batteryGW: 30, gasGW: 8, otherGW: 4, completionRatePct: 25 },
  'WECC': { totalGW: 130, solarGW: 65, windGW: 25, batteryGW: 30, gasGW: 5, otherGW: 5, completionRatePct: 18 },
  'OTHER': { totalGW: 20, solarGW: 8, windGW: 6, batteryGW: 3, gasGW: 2, otherGW: 1, completionRatePct: 15 },
};

// Retirement summary by region (GW retiring by 2030)
export const RETIREMENT_SUMMARY: Record<GridRegion, {
  totalGW: number;
  coalGW: number;
  gasGW: number;
  nuclearGW: number;
  otherGW: number;
}> = {
  'ERCOT': { totalGW: 5.5, coalGW: 4.5, gasGW: 1, nuclearGW: 0, otherGW: 0 },
  'PJM': { totalGW: 12, coalGW: 10, gasGW: 1.5, nuclearGW: 0, otherGW: 0.5 },
  'MISO': { totalGW: 8, coalGW: 6, gasGW: 1, nuclearGW: 0.8, otherGW: 0.2 },
  'CAISO': { totalGW: 4, coalGW: 0, gasGW: 2.5, nuclearGW: 1.1, otherGW: 0.4 },
  'SPP': { totalGW: 3, coalGW: 2.5, gasGW: 0.4, nuclearGW: 0, otherGW: 0.1 },
  'NYISO': { totalGW: 2, coalGW: 0, gasGW: 1.8, nuclearGW: 0, otherGW: 0.2 },
  'ISO-NE': { totalGW: 1.5, coalGW: 0.5, gasGW: 0.8, nuclearGW: 0, otherGW: 0.2 },
  'SERC': { totalGW: 8, coalGW: 6, gasGW: 1.5, nuclearGW: 0, otherGW: 0.5 },
  'WECC': { totalGW: 7, coalGW: 5.5, gasGW: 1, nuclearGW: 0, otherGW: 0.5 },
  'OTHER': { totalGW: 1, coalGW: 0.6, gasGW: 0.3, nuclearGW: 0, otherGW: 0.1 },
};

// Helper functions
export function getRegionalSupplySummary() {
  const regions = Object.keys(REGIONAL_CAPACITY) as GridRegion[];

  return regions.map(region => {
    const capacity = REGIONAL_CAPACITY[region];
    const queue = QUEUE_SUMMARY[region];
    const retirements = RETIREMENT_SUMMARY[region];

    // Expected additions = queue total * completion rate
    const expectedAdditionsGW = queue.totalGW * (queue.completionRatePct / 100);

    // Net change = additions - retirements
    const netChangeBy2030GW = expectedAdditionsGW - retirements.totalGW;

    // Reserve margin = (capacity - peak) / peak * 100
    const reserveMarginPct = ((capacity.totalGW - capacity.peakDemandGW) / capacity.peakDemandGW) * 100;

    return {
      region,
      existingCapacityGW: capacity.totalGW,
      peakDemandGW: capacity.peakDemandGW,
      reserveMarginPct: Math.round(reserveMarginPct),
      queueTotalGW: queue.totalGW,
      queueCompletionRatePct: queue.completionRatePct,
      expectedAdditionsGW: Math.round(expectedAdditionsGW * 10) / 10,
      retirementsGW: retirements.totalGW,
      netChangeBy2030GW: Math.round(netChangeBy2030GW * 10) / 10,
      capacityByFuel: capacity.byFuel,
    };
  });
}

export function getTotalSupply() {
  const regions = Object.keys(REGIONAL_CAPACITY) as GridRegion[];

  let totalCapacity = 0;
  let totalPeakDemand = 0;
  let totalQueue = 0;
  let totalRetirements = 0;

  const byFuel: Record<FuelType, number> = {
    'natural-gas': 0,
    'coal': 0,
    'nuclear': 0,
    'wind': 0,
    'solar': 0,
    'hydro': 0,
    'battery': 0,
    'other': 0,
  };

  regions.forEach(region => {
    const capacity = REGIONAL_CAPACITY[region];
    const queue = QUEUE_SUMMARY[region];
    const retirements = RETIREMENT_SUMMARY[region];

    totalCapacity += capacity.totalGW;
    totalPeakDemand += capacity.peakDemandGW;
    totalQueue += queue.totalGW;
    totalRetirements += retirements.totalGW;

    Object.keys(capacity.byFuel).forEach(fuel => {
      byFuel[fuel as FuelType] += capacity.byFuel[fuel as FuelType];
    });
  });

  // Average completion rate weighted by queue size
  const avgCompletionRate = regions.reduce((sum, r) => {
    return sum + (QUEUE_SUMMARY[r].totalGW * QUEUE_SUMMARY[r].completionRatePct);
  }, 0) / totalQueue;

  const expectedAdditions = totalQueue * (avgCompletionRate / 100);

  return {
    totalCapacityGW: Math.round(totalCapacity),
    totalPeakDemandGW: Math.round(totalPeakDemand),
    totalQueueGW: Math.round(totalQueue),
    avgCompletionRatePct: Math.round(avgCompletionRate),
    expectedAdditionsGW: Math.round(expectedAdditions),
    totalRetirementsGW: Math.round(totalRetirements * 10) / 10,
    netChangeBy2030GW: Math.round((expectedAdditions - totalRetirements) * 10) / 10,
    byFuel,
  };
}
