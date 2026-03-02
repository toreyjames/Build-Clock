import type { EnergyDemandProject } from './energy-demand-types';

// Announced data centers, fabs, and manufacturing that will demand grid power
// Sources: Company announcements, news, DOE, state economic development

export const ENERGY_DEMAND_PROJECTS: EnergyDemandProject[] = [
  // ============================================
  // DATA CENTERS - HYPERSCALE
  // ============================================
  {
    id: 'ms-wi-datacenter',
    name: 'Microsoft Wisconsin Data Center',
    company: 'Microsoft',
    category: 'data-center',
    status: 'under-construction',
    location: 'Mount Pleasant',
    state: 'WI',
    gridRegion: 'MISO',
    coordinates: { lat: 42.7142, lng: -87.8787 },
    powerMW: 800,
    announcedDate: '2024-01-01',
    targetOnline: '2026-Q4',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 3_300_000_000,
    sources: [
      { title: 'Microsoft Wisconsin Investment', url: 'https://news.microsoft.com', date: '2024-01-01' }
    ],
    notes: 'Former Foxconn site redevelopment. Will require significant transmission upgrades.',
    lastUpdated: '2024-02-01',
  },
  {
    id: 'meta-tx-datacenter',
    name: 'Meta Texas Data Center',
    company: 'Meta',
    category: 'data-center',
    status: 'announced',
    location: 'Temple',
    state: 'TX',
    gridRegion: 'ERCOT',
    coordinates: { lat: 31.0982, lng: -97.3428 },
    powerMW: 600,
    announcedDate: '2024-03-01',
    targetOnline: '2027-Q2',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 1_500_000_000,
    sources: [
      { title: 'Meta Temple Datacenter', url: 'https://about.meta.com', date: '2024-03-01' }
    ],
    notes: 'Part of Meta AI infrastructure expansion',
    lastUpdated: '2024-03-01',
  },
  {
    id: 'google-nv-datacenter',
    name: 'Google Nevada Data Centers',
    company: 'Google',
    category: 'data-center',
    status: 'under-construction',
    location: 'Henderson/Las Vegas',
    state: 'NV',
    gridRegion: 'WECC',
    coordinates: { lat: 36.0395, lng: -114.9817 },
    powerMW: 500,
    announcedDate: '2023-06-01',
    targetOnline: '2025-Q4',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 1_200_000_000,
    ppaDetails: '350MW solar PPA with NV Energy',
    sources: [
      { title: 'Google Nevada Expansion', url: 'https://cloud.google.com', date: '2023-06-01' }
    ],
    notes: 'Expansion of existing Henderson campus',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'amazon-va-datacenter',
    name: 'AWS Virginia Data Center Campus',
    company: 'Amazon/AWS',
    category: 'data-center',
    status: 'under-construction',
    location: 'Northern Virginia',
    state: 'VA',
    gridRegion: 'PJM',
    coordinates: { lat: 38.9586, lng: -77.3570 },
    powerMW: 1200,
    powerMWRange: { low: 1000, high: 1500 },
    announcedDate: '2023-01-01',
    targetOnline: '2026-Q1',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 35_000_000_000,
    ppaDetails: 'Multiple nuclear and solar PPAs',
    sources: [
      { title: 'AWS Virginia Investment', url: 'https://aws.amazon.com', date: '2023-01-01' }
    ],
    notes: 'Largest data center market in the world. Dominion Energy struggling to keep up.',
    lastUpdated: '2024-02-15',
  },
  {
    id: 'oracle-tn-datacenter',
    name: 'Oracle Nashville Campus',
    company: 'Oracle',
    category: 'data-center',
    status: 'planning',
    location: 'Nashville',
    state: 'TN',
    gridRegion: 'SERC',
    coordinates: { lat: 36.1627, lng: -86.7816 },
    powerMW: 400,
    announcedDate: '2024-02-01',
    targetOnline: '2027-Q3',
    powerStrategy: 'grid-only',
    investmentUSD: 1_500_000_000,
    sources: [
      { title: 'Oracle Nashville', url: 'https://oracle.com', date: '2024-02-01' }
    ],
    notes: 'Part of Oracle Cloud expansion for AI workloads',
    lastUpdated: '2024-02-01',
  },
  {
    id: 'xai-memphis-datacenter',
    name: 'xAI Memphis Supercluster',
    company: 'xAI',
    category: 'data-center',
    status: 'under-construction',
    location: 'Memphis',
    state: 'TN',
    gridRegion: 'SERC',
    coordinates: { lat: 35.1495, lng: -90.0490 },
    powerMW: 150,
    powerMWRange: { low: 100, high: 200 },
    announcedDate: '2024-06-01',
    targetOnline: '2024-Q4',
    powerStrategy: 'grid-only',
    sources: [
      { title: 'xAI Memphis Datacenter', url: 'https://x.ai', date: '2024-06-01' }
    ],
    notes: '100,000 GPU cluster. Using gas turbines for backup. TVA providing power.',
    lastUpdated: '2024-08-01',
  },
  {
    id: 'coreweave-tx-datacenter',
    name: 'CoreWeave Texas AI Cloud',
    company: 'CoreWeave',
    category: 'data-center',
    status: 'announced',
    location: 'Dallas/Fort Worth',
    state: 'TX',
    gridRegion: 'ERCOT',
    coordinates: { lat: 32.8998, lng: -97.0403 },
    powerMW: 350,
    announcedDate: '2024-05-01',
    targetOnline: '2026-Q2',
    powerStrategy: 'grid-only',
    investmentUSD: 1_200_000_000,
    sources: [
      { title: 'CoreWeave Texas Expansion', url: 'https://coreweave.com', date: '2024-05-01' }
    ],
    notes: 'NVIDIA GPU cloud provider expanding for AI training',
    lastUpdated: '2024-05-01',
  },

  // ============================================
  // SEMICONDUCTOR FABS
  // ============================================
  {
    id: 'tsmc-az-fab',
    name: 'TSMC Arizona Fabs',
    company: 'TSMC',
    category: 'semiconductor',
    status: 'under-construction',
    location: 'Phoenix',
    state: 'AZ',
    gridRegion: 'WECC',
    coordinates: { lat: 33.6695, lng: -112.0277 },
    powerMW: 400,
    powerMWRange: { low: 300, high: 500 },
    announcedDate: '2020-05-15',
    targetOnline: '2025-Q1',
    constructionStart: '2021-04-01',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 40_000_000_000,
    fundingSource: 'CHIPS Act + Private',
    ppaDetails: '100MW solar + storage PPA',
    sources: [
      { title: 'TSMC Arizona Announcement', url: 'https://www.tsmc.com', date: '2020-05-15' },
      { title: 'CHIPS Act Award', url: 'https://www.commerce.gov', date: '2024-04-08' }
    ],
    notes: 'Three fabs: 4nm (2025), 3nm (2028), 2nm (2030). $6.6B CHIPS grant + $5B loan.',
    lastUpdated: '2024-04-08',
  },
  {
    id: 'intel-oh-fab',
    name: 'Intel Ohio Fabs',
    company: 'Intel',
    category: 'semiconductor',
    status: 'under-construction',
    location: 'New Albany',
    state: 'OH',
    gridRegion: 'PJM',
    coordinates: { lat: 40.0812, lng: -82.7579 },
    powerMW: 500,
    announcedDate: '2022-01-21',
    targetOnline: '2027-Q4',
    constructionStart: '2022-09-09',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 28_000_000_000,
    fundingSource: 'CHIPS Act + Private',
    sources: [
      { title: 'Intel Ohio Announcement', url: 'https://intel.com', date: '2022-01-21' }
    ],
    notes: '$8.5B CHIPS grant. Two fabs initially, up to 8 planned on 1000-acre site.',
    lastUpdated: '2024-03-20',
  },
  {
    id: 'intel-az-fab',
    name: 'Intel Arizona Expansion',
    company: 'Intel',
    category: 'semiconductor',
    status: 'under-construction',
    location: 'Chandler',
    state: 'AZ',
    gridRegion: 'WECC',
    coordinates: { lat: 33.2829, lng: -111.8540 },
    powerMW: 300,
    announcedDate: '2021-03-23',
    targetOnline: '2025-Q2',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 20_000_000_000,
    fundingSource: 'CHIPS Act + Private',
    sources: [
      { title: 'Intel Arizona Expansion', url: 'https://intel.com', date: '2021-03-23' }
    ],
    notes: 'Fab 52 and 62. Combined with existing Ocotillo campus.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'samsung-tx-fab',
    name: 'Samsung Taylor Fab',
    company: 'Samsung',
    category: 'semiconductor',
    status: 'under-construction',
    location: 'Taylor',
    state: 'TX',
    gridRegion: 'ERCOT',
    coordinates: { lat: 30.5710, lng: -97.4089 },
    powerMW: 350,
    announcedDate: '2021-11-23',
    targetOnline: '2026-Q4',
    constructionStart: '2022-01-01',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 17_000_000_000,
    fundingSource: 'CHIPS Act + Private',
    sources: [
      { title: 'Samsung Taylor Announcement', url: 'https://samsung.com', date: '2021-11-23' }
    ],
    notes: '$6.4B CHIPS grant. 4nm foundry. ERCOT interconnection in progress.',
    lastUpdated: '2024-04-15',
  },
  {
    id: 'micron-ny-fab',
    name: 'Micron New York Fab',
    company: 'Micron',
    category: 'semiconductor',
    status: 'planning',
    location: 'Clay',
    state: 'NY',
    gridRegion: 'NYISO',
    coordinates: { lat: 43.1868, lng: -76.1813 },
    powerMW: 450,
    announcedDate: '2022-10-04',
    targetOnline: '2028-Q4',
    powerStrategy: 'grid-plus-ppa',
    selfGenMW: 0,
    investmentUSD: 100_000_000_000,
    fundingSource: 'CHIPS Act + NY State + Private',
    sources: [
      { title: 'Micron NY Announcement', url: 'https://micron.com', date: '2022-10-04' }
    ],
    notes: '$6.1B CHIPS grant. Up to 4 fabs over 20 years. DRAM memory production.',
    lastUpdated: '2024-04-25',
  },
  {
    id: 'sk-hynix-in-fab',
    name: 'SK Hynix Indiana HBM Facility',
    company: 'SK Hynix',
    category: 'semiconductor',
    status: 'announced',
    location: 'West Lafayette',
    state: 'IN',
    gridRegion: 'MISO',
    coordinates: { lat: 40.4259, lng: -86.9081 },
    powerMW: 200,
    announcedDate: '2024-04-01',
    targetOnline: '2028-Q1',
    powerStrategy: 'grid-only',
    investmentUSD: 3_870_000_000,
    fundingSource: 'CHIPS Act + Private',
    sources: [
      { title: 'SK Hynix Indiana', url: 'https://skhynix.com', date: '2024-04-01' }
    ],
    notes: '$450M CHIPS grant. Advanced packaging for HBM (AI memory). Near Purdue.',
    lastUpdated: '2024-04-15',
  },

  // ============================================
  // EV & BATTERY MANUFACTURING
  // ============================================
  {
    id: 'panasonic-ks-battery',
    name: 'Panasonic Kansas Battery Plant',
    company: 'Panasonic',
    category: 'ev-battery',
    status: 'under-construction',
    location: 'De Soto',
    state: 'KS',
    gridRegion: 'SPP',
    coordinates: { lat: 38.9767, lng: -94.9586 },
    powerMW: 250,
    announcedDate: '2022-07-13',
    targetOnline: '2025-Q1',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 4_000_000_000,
    fundingSource: 'IRA + Private',
    ppaDetails: 'Wind PPA with Evergy',
    sources: [
      { title: 'Panasonic Kansas', url: 'https://panasonic.com', date: '2022-07-13' }
    ],
    notes: '30 GWh/year capacity. Supplying Tesla. Evergy adding transmission.',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'ford-tn-battery',
    name: 'Ford BlueOval City',
    company: 'Ford / SK On',
    category: 'ev-battery',
    status: 'under-construction',
    location: 'Stanton',
    state: 'TN',
    gridRegion: 'SERC',
    coordinates: { lat: 35.4500, lng: -89.4000 },
    powerMW: 400,
    announcedDate: '2021-09-27',
    targetOnline: '2025-Q4',
    powerStrategy: 'grid-plus-ppa',
    investmentUSD: 5_600_000_000,
    fundingSource: 'IRA + State + Private',
    sources: [
      { title: 'Ford BlueOval City', url: 'https://ford.com', date: '2021-09-27' }
    ],
    notes: 'EV assembly + 3 battery plants. 500,000 trucks/year. TVA power.',
    lastUpdated: '2024-02-01',
  },
  {
    id: 'rivian-ga-plant',
    name: 'Rivian Georgia Plant',
    company: 'Rivian',
    category: 'ev-battery',
    status: 'planning',
    location: 'Social Circle',
    state: 'GA',
    gridRegion: 'SERC',
    coordinates: { lat: 33.6554, lng: -83.7185 },
    powerMW: 300,
    announcedDate: '2021-12-16',
    targetOnline: '2028-Q1',
    powerStrategy: 'grid-only',
    investmentUSD: 5_000_000_000,
    sources: [
      { title: 'Rivian Georgia', url: 'https://rivian.com', date: '2021-12-16' }
    ],
    notes: 'Delayed from original 2024 target. 400,000 vehicles/year planned.',
    lastUpdated: '2024-03-15',
  },
  {
    id: 'lg-gm-mi-battery',
    name: 'Ultium Cells Michigan',
    company: 'LG / GM',
    category: 'ev-battery',
    status: 'operational',
    location: 'Lansing',
    state: 'MI',
    gridRegion: 'MISO',
    coordinates: { lat: 42.7325, lng: -84.5555 },
    powerMW: 150,
    announcedDate: '2022-01-25',
    targetOnline: '2024-Q4',
    powerStrategy: 'grid-only',
    investmentUSD: 2_600_000_000,
    fundingSource: 'IRA + State',
    sources: [
      { title: 'Ultium Cells Lansing', url: 'https://ultiumcell.com', date: '2022-01-25' }
    ],
    notes: '50 GWh capacity. Third Ultium plant after Ohio and Tennessee.',
    lastUpdated: '2024-11-01',
  },

  // ============================================
  // OTHER MANUFACTURING / INDUSTRIAL
  // ============================================
  {
    id: 'nucor-wv-steel',
    name: 'Nucor West Virginia Steel Mill',
    company: 'Nucor',
    category: 'manufacturing',
    status: 'under-construction',
    location: 'Apple Grove',
    state: 'WV',
    gridRegion: 'PJM',
    coordinates: { lat: 38.6832, lng: -82.1438 },
    powerMW: 200,
    announcedDate: '2022-09-01',
    targetOnline: '2025-Q2',
    powerStrategy: 'grid-only',
    investmentUSD: 2_700_000_000,
    sources: [
      { title: 'Nucor WV Mill', url: 'https://nucor.com', date: '2022-09-01' }
    ],
    notes: '3M tons/year capacity. Electric arc furnace. AEP providing power.',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'air-liquide-tx-hydrogen',
    name: 'Air Liquide Texas Hydrogen Hub',
    company: 'Air Liquide',
    category: 'hydrogen',
    status: 'planning',
    location: 'Corpus Christi',
    state: 'TX',
    gridRegion: 'ERCOT',
    coordinates: { lat: 27.8006, lng: -97.3964 },
    powerMW: 500,
    announcedDate: '2024-01-15',
    targetOnline: '2028-Q1',
    powerStrategy: 'grid-plus-ppa',
    selfGenMW: 200,
    selfGenType: 'Solar + Wind',
    investmentUSD: 2_000_000_000,
    fundingSource: 'DOE Hydrogen Hub + Private',
    sources: [
      { title: 'Gulf Coast Hydrogen Hub', url: 'https://energy.gov', date: '2024-01-15' }
    ],
    notes: 'Part of DOE Regional Clean Hydrogen Hub program. Green hydrogen for Gulf refineries.',
    lastUpdated: '2024-02-01',
  },
  {
    id: 'hyundai-ga-ev',
    name: 'Hyundai Metaplant America',
    company: 'Hyundai',
    category: 'ev-battery',
    status: 'under-construction',
    location: 'Bryan County',
    state: 'GA',
    gridRegion: 'SERC',
    coordinates: { lat: 32.0215, lng: -81.4045 },
    powerMW: 250,
    announcedDate: '2022-05-20',
    targetOnline: '2025-Q4',
    powerStrategy: 'grid-only',
    investmentUSD: 7_600_000_000,
    fundingSource: 'IRA + State',
    sources: [
      { title: 'Hyundai Metaplant', url: 'https://hyundai.com', date: '2022-05-20' }
    ],
    notes: '300,000 EVs/year. Georgia Power adding transmission. Near Savannah port.',
    lastUpdated: '2024-02-20',
  },
  {
    id: 'qcells-ga-solar',
    name: 'Qcells Georgia Solar Manufacturing',
    company: 'Hanwha Qcells',
    category: 'manufacturing',
    status: 'operational',
    location: 'Cartersville',
    state: 'GA',
    gridRegion: 'SERC',
    coordinates: { lat: 34.1651, lng: -84.7999 },
    powerMW: 120,
    announcedDate: '2022-01-11',
    targetOnline: '2024-Q2',
    powerStrategy: 'grid-only',
    investmentUSD: 2_500_000_000,
    fundingSource: 'IRA + State',
    sources: [
      { title: 'Qcells Georgia Expansion', url: 'https://qcells.com', date: '2022-01-11' }
    ],
    notes: '8.4 GW solar module capacity. Largest solar manufacturing in Western Hemisphere.',
    lastUpdated: '2024-06-01',
  },
];

// Helper to calculate regional totals
export function getRegionalDemandSummary(): Record<string, {
  projectCount: number;
  totalDemandMW: number;
  byCategory: Record<string, { count: number; mw: number }>;
}> {
  const summary: Record<string, {
    projectCount: number;
    totalDemandMW: number;
    byCategory: Record<string, { count: number; mw: number }>;
  }> = {};

  for (const project of ENERGY_DEMAND_PROJECTS) {
    if (project.status === 'cancelled') continue;

    const region = project.gridRegion;
    if (!summary[region]) {
      summary[region] = {
        projectCount: 0,
        totalDemandMW: 0,
        byCategory: {},
      };
    }

    summary[region].projectCount += 1;
    summary[region].totalDemandMW += project.powerMW;

    const cat = project.category;
    if (!summary[region].byCategory[cat]) {
      summary[region].byCategory[cat] = { count: 0, mw: 0 };
    }
    summary[region].byCategory[cat].count += 1;
    summary[region].byCategory[cat].mw += project.powerMW;
  }

  return summary;
}

// Total demand across all projects
export function getTotalDemand(): { projects: number; demandMW: number; investmentUSD: number } {
  let projects = 0;
  let demandMW = 0;
  let investmentUSD = 0;

  for (const project of ENERGY_DEMAND_PROJECTS) {
    if (project.status === 'cancelled') continue;
    projects += 1;
    demandMW += project.powerMW;
    investmentUSD += project.investmentUSD || 0;
  }

  return { projects, demandMW, investmentUSD };
}
