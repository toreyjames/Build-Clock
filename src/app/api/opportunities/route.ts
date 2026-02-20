import { NextResponse } from 'next/server';
import { fetchSAMOpportunities } from '@/lib/sam-api';
import { Opportunity, Sector, OTRelevance } from '@/lib/types';

// Curated high-value opportunities that Jason will recognize
// These represent real projects in the Genesis/AI infrastructure space
const CURATED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'stargate-abilene',
    title: 'Stargate AI Data Center - Abilene Campus',
    description: 'Initial 1.2GW AI data center campus as part of the Stargate joint venture. Requires comprehensive OT security for power distribution, cooling systems, and physical security integration. SCADA systems for campus-wide energy management.',
    entity: 'Stargate LLC (OpenAI/SoftBank/Oracle)',
    sector: 'data-centers',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Critical infrastructure with ICS/SCADA for power and cooling',
    estimatedValue: 100_000_000_000,
    location: 'Abilene',
    state: 'TX',
    policyAlignment: ['Genesis Mission', 'AI EO'],
    source: 'news',
    sourceUrl: 'https://openai.com/index/announcing-the-stargate-project/',
    postedDate: '2025-01-21',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tsmc-arizona-fab2',
    title: 'TSMC Arizona Fab 2 - OT Security Integration',
    description: 'Second semiconductor fabrication facility in Phoenix requiring industrial control system security for cleanroom operations, chemical handling, and wafer processing. 3nm process node with extreme precision requirements.',
    entity: 'TSMC Arizona',
    sector: 'semiconductors',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Semiconductor fab with critical ICS for process control',
    estimatedValue: 40_000_000_000,
    location: 'Phoenix',
    state: 'AZ',
    policyAlignment: ['CHIPS Act', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://pr.tsmc.com/',
    postedDate: '2024-12-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'intel-ohio-fab',
    title: 'Intel Ohio Megafab Complex',
    description: 'Two leading-edge chip fabrication facilities in New Albany, Ohio. $20B investment with CHIPS Act funding. Extensive OT security needs for semiconductor manufacturing, cleanroom HVAC, chemical delivery, and water treatment.',
    entity: 'Intel Corporation',
    sector: 'semiconductors',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Major semiconductor facility with complex ICS environment',
    estimatedValue: 20_000_000_000,
    location: 'New Albany',
    state: 'OH',
    policyAlignment: ['CHIPS Act', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://www.intel.com/content/www/us/en/newsroom/',
    postedDate: '2024-06-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'doe-grip-cyber',
    title: 'DOE GRIP Program - Grid Cybersecurity Requirements',
    description: 'Grid Resilience and Innovation Partnerships program with $2.2B funding. All funded projects require NERC CIP compliance and cybersecurity assessments. Transmission upgrades across multiple states.',
    entity: 'Department of Energy - Grid Deployment Office',
    sector: 'grid',
    procurementStage: 'rfp-open',
    otRelevance: 'high',
    otRelevanceReason: 'Electric grid NERC CIP compliance requirements',
    estimatedValue: 2_200_000_000,
    location: 'Multiple',
    state: 'US',
    policyAlignment: ['BIL', 'Genesis Adjacent'],
    source: 'doe',
    sourceUrl: 'https://www.energy.gov/gdo/grid-resilience-and-innovation-partnerships-grip-program',
    postedDate: '2025-01-08',
    responseDeadline: '2025-04-15',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'nuscale-smr-idaho',
    title: 'NuScale VOYGR SMR - Carbon Free Power Project',
    description: 'First US small modular reactor deployment at Idaho National Laboratory. 462 MWe capacity. Nuclear-grade cybersecurity required for reactor control systems, safety systems, and physical security integration.',
    entity: 'NuScale Power / UAMPS',
    sector: 'nuclear',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Nuclear facility with NRC-regulated cybersecurity requirements',
    estimatedValue: 5_300_000_000,
    location: 'Idaho Falls',
    state: 'ID',
    policyAlignment: ['IRA', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://www.nuscalepower.com/',
    postedDate: '2024-11-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'microsoft-tmi-nuclear',
    title: 'Microsoft - Constellation Three Mile Island Restart',
    description: 'Microsoft agreement to purchase power from restarted Three Mile Island Unit 1 reactor. 835 MW nuclear capacity for data center operations. Requires nuclear facility cybersecurity and grid integration security.',
    entity: 'Microsoft / Constellation Energy',
    sector: 'nuclear',
    procurementStage: 'planning',
    otRelevance: 'high',
    otRelevanceReason: 'Nuclear restart with NRC cybersecurity requirements',
    estimatedValue: 1_600_000_000,
    location: 'Middletown',
    state: 'PA',
    policyAlignment: ['AI EO', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://news.microsoft.com/',
    postedDate: '2024-09-20',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'doe-hydrogen-hubs',
    title: 'Regional Clean Hydrogen Hubs - Cybersecurity Implementation',
    description: 'Seven regional hydrogen hubs with $7B federal funding entering implementation phase. Industrial control systems for hydrogen production, storage, and distribution. High-pressure systems require safety-critical controls.',
    entity: 'Department of Energy - OCED',
    sector: 'clean-energy',
    procurementStage: 'awarded',
    otRelevance: 'high',
    otRelevanceReason: 'Hydrogen production ICS with safety-critical systems',
    estimatedValue: 7_000_000_000,
    location: 'Multiple',
    state: 'US',
    policyAlignment: ['BIL', 'IRA', 'Genesis Adjacent'],
    source: 'doe',
    sourceUrl: 'https://www.energy.gov/oced/regional-clean-hydrogen-hubs',
    postedDate: '2025-01-12',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'panasonic-kansas-battery',
    title: 'Panasonic EV Battery Gigafactory - De Soto Kansas',
    description: '$4B battery manufacturing facility for EV batteries. Industrial automation and process control for cell production. High-voltage battery systems require safety-critical OT security.',
    entity: 'Panasonic Energy',
    sector: 'ev-battery',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Battery manufacturing with safety-critical process control',
    estimatedValue: 4_000_000_000,
    location: 'De Soto',
    state: 'KS',
    policyAlignment: ['IRA', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://na.panasonic.com/us/panasonic-energy',
    postedDate: '2024-07-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'redwood-materials-nv',
    title: 'Redwood Materials Battery Recycling Expansion',
    description: 'Battery recycling and materials processing expansion in Nevada. DOE loan guarantee. Process control for battery disassembly, chemical processing, and materials recovery.',
    entity: 'Redwood Materials',
    sector: 'critical-minerals',
    procurementStage: 'construction',
    otRelevance: 'medium',
    otRelevanceReason: 'Industrial chemical processing with process control systems',
    estimatedValue: 3_500_000_000,
    location: 'McCarran',
    state: 'NV',
    policyAlignment: ['IRA', 'BIL'],
    source: 'news',
    sourceUrl: 'https://www.redwoodmaterials.com/',
    postedDate: '2024-10-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'mp-materials-magnets',
    title: 'MP Materials Rare Earth Magnet Manufacturing',
    description: 'Domestic rare earth permanent magnet production in Fort Worth. DOD strategic materials contract. Process control for rare earth separation and magnet production.',
    entity: 'MP Materials',
    sector: 'critical-minerals',
    procurementStage: 'construction',
    otRelevance: 'medium',
    otRelevanceReason: 'Chemical processing with industrial control systems',
    estimatedValue: 700_000_000,
    location: 'Fort Worth',
    state: 'TX',
    policyAlignment: ['BIL', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://mpmaterials.com/',
    postedDate: '2024-08-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'aws-oregon-dc',
    title: 'AWS Oregon Data Center Campus Expansion',
    description: 'Major data center expansion in Eastern Oregon with dedicated power infrastructure. Building automation, power distribution, and cooling system controls.',
    entity: 'Amazon Web Services',
    sector: 'data-centers',
    procurementStage: 'construction',
    otRelevance: 'medium',
    otRelevanceReason: 'Data center infrastructure with building automation',
    estimatedValue: 12_000_000_000,
    location: 'Boardman',
    state: 'OR',
    policyAlignment: ['AI EO'],
    source: 'news',
    sourceUrl: 'https://aws.amazon.com/',
    postedDate: '2024-11-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'google-sc-dc',
    title: 'Google South Carolina Data Center Complex',
    description: '$3.5B data center investment in Berkeley County. Power infrastructure and cooling systems requiring OT security integration.',
    entity: 'Google',
    sector: 'data-centers',
    procurementStage: 'construction',
    otRelevance: 'medium',
    otRelevanceReason: 'Data center with power and cooling infrastructure',
    estimatedValue: 3_500_000_000,
    location: 'Goose Creek',
    state: 'SC',
    policyAlignment: ['AI EO'],
    source: 'news',
    sourceUrl: 'https://blog.google/',
    postedDate: '2024-12-10',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'tva-nuclear-smr',
    title: 'TVA Clinch River SMR Project',
    description: 'Tennessee Valley Authority pursuing small modular reactor deployment at Clinch River site. NRC early site permit approved. Nuclear-grade OT security required.',
    entity: 'Tennessee Valley Authority',
    sector: 'nuclear',
    procurementStage: 'planning',
    otRelevance: 'high',
    otRelevanceReason: 'Nuclear facility with NRC cybersecurity requirements',
    estimatedValue: 5_000_000_000,
    location: 'Oak Ridge',
    state: 'TN',
    policyAlignment: ['IRA', 'Genesis Adjacent'],
    source: 'news',
    sourceUrl: 'https://www.tva.com/',
    postedDate: '2024-10-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'sk-battery-georgia',
    title: 'SK Battery America Georgia Expansion',
    description: 'EV battery cell manufacturing expansion in Commerce, Georgia. $2.6B investment. Battery manufacturing automation and process control security.',
    entity: 'SK Battery America',
    sector: 'ev-battery',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Battery manufacturing with safety-critical controls',
    estimatedValue: 2_600_000_000,
    location: 'Commerce',
    state: 'GA',
    policyAlignment: ['IRA'],
    source: 'news',
    sourceUrl: 'https://www.skbatteryamerica.com/',
    postedDate: '2024-09-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'form-energy-wv',
    title: 'Form Energy Iron-Air Battery Manufacturing',
    description: 'First commercial iron-air battery manufacturing facility in Weirton, WV. DOE loan support. Novel battery technology requires specialized process control.',
    entity: 'Form Energy',
    sector: 'ev-battery',
    procurementStage: 'construction',
    otRelevance: 'medium',
    otRelevanceReason: 'Battery manufacturing with industrial process control',
    estimatedValue: 760_000_000,
    location: 'Weirton',
    state: 'WV',
    policyAlignment: ['IRA', 'BIL'],
    source: 'news',
    sourceUrl: 'https://formenergy.com/',
    postedDate: '2024-08-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'nextera-grid-tx',
    title: 'NextEra Texas Grid Infrastructure Upgrade',
    description: 'Major transmission infrastructure investment in ERCOT region. Substation automation and grid control systems. NERC CIP compliance required.',
    entity: 'NextEra Energy',
    sector: 'grid',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Electric transmission with NERC CIP requirements',
    estimatedValue: 1_800_000_000,
    location: 'Multiple',
    state: 'TX',
    policyAlignment: ['BIL'],
    source: 'news',
    sourceUrl: 'https://www.nexteraenergy.com/',
    postedDate: '2024-11-01',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'bp-houston-hydrogen',
    title: 'BP Houston Hydrogen Hub',
    description: 'Blue hydrogen production facility in Houston region as part of HyVelocity Hub. Carbon capture integration. Process control for hydrogen production and CCS.',
    entity: 'BP / HyVelocity',
    sector: 'clean-energy',
    procurementStage: 'planning',
    otRelevance: 'high',
    otRelevanceReason: 'Hydrogen production with safety-critical process control',
    estimatedValue: 2_000_000_000,
    location: 'Houston',
    state: 'TX',
    policyAlignment: ['BIL', 'IRA'],
    source: 'doe',
    sourceUrl: 'https://www.energy.gov/oced/regional-clean-hydrogen-hubs',
    postedDate: '2025-01-05',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lg-battery-arizona',
    title: 'LG Energy Solution Arizona Battery Plant',
    description: 'Cylindrical battery cell manufacturing in Queen Creek, Arizona. $5.5B investment. High-volume manufacturing automation and process control.',
    entity: 'LG Energy Solution',
    sector: 'ev-battery',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Battery manufacturing with industrial automation',
    estimatedValue: 5_500_000_000,
    location: 'Queen Creek',
    state: 'AZ',
    policyAlignment: ['IRA'],
    source: 'news',
    sourceUrl: 'https://www.lgensol.com/',
    postedDate: '2024-10-20',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'micron-idaho-fab',
    title: 'Micron Idaho Memory Fab Expansion',
    description: 'DRAM manufacturing expansion in Boise. $15B investment with CHIPS Act support. Semiconductor fab OT security for cleanroom and process systems.',
    entity: 'Micron Technology',
    sector: 'semiconductors',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Semiconductor fab with complex ICS environment',
    estimatedValue: 15_000_000_000,
    location: 'Boise',
    state: 'ID',
    policyAlignment: ['CHIPS Act'],
    source: 'news',
    sourceUrl: 'https://www.micron.com/',
    postedDate: '2024-09-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'samsung-texas-fab',
    title: 'Samsung Taylor Texas Semiconductor Fab',
    description: 'Advanced logic semiconductor fabrication in Taylor, Texas. $17B investment. Complex fab environment with extensive OT security requirements.',
    entity: 'Samsung Electronics',
    sector: 'semiconductors',
    procurementStage: 'construction',
    otRelevance: 'high',
    otRelevanceReason: 'Semiconductor fab with extensive process control',
    estimatedValue: 17_000_000_000,
    location: 'Taylor',
    state: 'TX',
    policyAlignment: ['CHIPS Act'],
    source: 'news',
    sourceUrl: 'https://news.samsung.com/',
    postedDate: '2024-07-15',
    responseDeadline: null,
    lastUpdated: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector') as Sector | null;
  const otRelevance = searchParams.get('otRelevance') as OTRelevance | null;
  const stage = searchParams.get('stage');

  let opportunities: Opportunity[] = [...CURATED_OPPORTUNITIES];

  // Try to fetch live SAM.gov data if API key is available
  const samApiKey = process.env.SAM_API_KEY;
  if (samApiKey) {
    try {
      const samOpportunities = await fetchSAMOpportunities(samApiKey);
      opportunities = [...opportunities, ...samOpportunities];
    } catch (error) {
      console.error('Error fetching SAM data:', error);
    }
  }

  // Apply filters
  if (sector) {
    opportunities = opportunities.filter(o => o.sector === sector);
  }
  if (otRelevance) {
    opportunities = opportunities.filter(o => o.otRelevance === otRelevance);
  }
  if (stage) {
    opportunities = opportunities.filter(o => o.procurementStage === stage);
  }

  // Sort by value descending
  opportunities.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));

  // Calculate stats
  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
    highOTRelevance: opportunities.filter(o => o.otRelevance === 'high').length,
    byStage: {
      announced: opportunities.filter(o => o.procurementStage === 'announced').length,
      planning: opportunities.filter(o => o.procurementStage === 'planning').length,
      'rfp-open': opportunities.filter(o => o.procurementStage === 'rfp-open').length,
      awarded: opportunities.filter(o => o.procurementStage === 'awarded').length,
      construction: opportunities.filter(o => o.procurementStage === 'construction').length,
      operational: opportunities.filter(o => o.procurementStage === 'operational').length,
    }
  };

  return NextResponse.json({ opportunities, stats });
}
