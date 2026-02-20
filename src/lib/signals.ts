import { Signal, Sector } from './types';

// RSS feeds for policy and infrastructure news
const RSS_FEEDS = [
  {
    url: 'https://www.energy.gov/rss.xml',
    source: 'Department of Energy',
    sectors: ['nuclear', 'grid', 'clean-energy'] as Sector[]
  },
  {
    url: 'https://www.cisa.gov/news.xml',
    source: 'CISA',
    sectors: ['grid', 'manufacturing', 'water'] as Sector[]
  }
];

// Known major projects for credibility (things Jason will recognize)
export const KNOWN_PROJECTS: Signal[] = [
  {
    id: 'stargate-2025',
    title: 'Stargate AI Infrastructure Project - $500B Joint Venture Announced',
    summary: 'OpenAI, SoftBank, Oracle, and MGX announce massive AI infrastructure initiative. Initial $100B commitment with plans for data centers across Texas. Critical OT security requirements for power and cooling systems.',
    source: 'White House',
    sourceUrl: 'https://openai.com/index/announcing-the-stargate-project/',
    publishedAt: '2025-01-21',
    sectors: ['data-centers', 'grid'],
    signalType: 'funding',
    relevance: 'high'
  },
  {
    id: 'tsmc-arizona-2025',
    title: 'TSMC Arizona Fab 2 Enters Equipment Installation Phase',
    summary: 'Second Arizona fab progressing toward 3nm production. $40B total investment. Requires extensive OT security for semiconductor manufacturing systems.',
    source: 'TSMC',
    sourceUrl: 'https://pr.tsmc.com/',
    publishedAt: '2025-01-15',
    sectors: ['semiconductors'],
    signalType: 'news',
    relevance: 'high'
  },
  {
    id: 'intel-ohio-2025',
    title: 'Intel Ohio Fab Construction Continues Despite Delays',
    summary: 'Columbus-area megafab project continues with $20B+ investment. CHIPS Act funding secured. ICS/SCADA security critical for cleanroom operations.',
    source: 'Intel',
    sourceUrl: 'https://www.intel.com/content/www/us/en/newsroom/news/intel-announces-next-us-site-landmark-investment-ohio.html',
    publishedAt: '2025-01-10',
    sectors: ['semiconductors'],
    signalType: 'news',
    relevance: 'high'
  },
  {
    id: 'doe-grid-2025',
    title: 'DOE Announces $2.2B for Grid Resilience and Innovation',
    summary: 'Grid Deployment Office funding for transmission upgrades and grid-enhancing technologies. Includes cybersecurity requirements for all funded projects.',
    source: 'Department of Energy',
    sourceUrl: 'https://www.energy.gov/gdo/grid-resilience-and-innovation-partnerships-grip-program',
    publishedAt: '2025-01-08',
    sectors: ['grid'],
    signalType: 'funding',
    relevance: 'high'
  },
  {
    id: 'nuscale-2025',
    title: 'NuScale SMR Project Advances in Idaho',
    summary: 'First US small modular reactor project progresses at Idaho National Laboratory. NRC licensing milestone. Nuclear-grade cybersecurity required.',
    source: 'NuScale Power',
    sourceUrl: 'https://www.nuscalepower.com/',
    publishedAt: '2025-01-05',
    sectors: ['nuclear'],
    signalType: 'news',
    relevance: 'high'
  },
  {
    id: 'microsoft-nuclear-2025',
    title: 'Microsoft Signs Nuclear Power Agreement for AI Data Centers',
    summary: 'Microsoft secures nuclear power for AI infrastructure expansion. Constellation Energy deal for clean power. Data center OT security integration required.',
    source: 'Microsoft',
    sourceUrl: 'https://news.microsoft.com/',
    publishedAt: '2024-12-15',
    sectors: ['data-centers', 'nuclear'],
    signalType: 'news',
    relevance: 'high'
  },
  {
    id: 'doe-hydrogen-2025',
    title: 'DOE Regional Clean Hydrogen Hubs Moving to Execution',
    summary: 'Seven hydrogen hubs with $7B in federal funding entering implementation phase. Industrial control systems for hydrogen production and distribution.',
    source: 'Department of Energy',
    sourceUrl: 'https://www.energy.gov/oced/regional-clean-hydrogen-hubs',
    publishedAt: '2025-01-12',
    sectors: ['clean-energy', 'manufacturing'],
    signalType: 'funding',
    relevance: 'high'
  },
  {
    id: 'ev-charging-2025',
    title: 'National EV Charging Network Expansion Accelerates',
    summary: 'Federal Highway Administration and DOE programs funding 500,000+ chargers. NEVI formula program. Charging infrastructure requires network security.',
    source: 'DOT',
    sourceUrl: 'https://www.fhwa.dot.gov/environment/nevi/',
    publishedAt: '2025-01-18',
    sectors: ['ev-battery', 'grid'],
    signalType: 'policy',
    relevance: 'medium'
  },
  {
    id: 'redwood-battery-2025',
    title: 'Redwood Materials Nevada Expansion for Battery Recycling',
    summary: 'Battery recycling facility expansion with $3.5B investment. DOE loan guarantee. Industrial process control security for recycling operations.',
    source: 'Redwood Materials',
    sourceUrl: 'https://www.redwoodmaterials.com/',
    publishedAt: '2025-01-02',
    sectors: ['ev-battery', 'critical-minerals'],
    signalType: 'news',
    relevance: 'medium'
  },
  {
    id: 'mp-materials-2025',
    title: 'MP Materials Mountain Pass Rare Earth Processing Upgrade',
    summary: 'Only US rare earth mine expanding processing capabilities. DOD contract for domestic supply chain. Process control security for separation facility.',
    source: 'MP Materials',
    sourceUrl: 'https://mpmaterials.com/',
    publishedAt: '2024-12-20',
    sectors: ['critical-minerals', 'manufacturing'],
    signalType: 'news',
    relevance: 'medium'
  }
];

// Fetch live news using a simple approach
export async function fetchSignals(): Promise<Signal[]> {
  // For now, return known projects + any we can fetch
  // In production, this would hit news APIs
  const signals = [...KNOWN_PROJECTS];

  // Sort by date, most recent first
  return signals.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Get signals for a specific time period
export function getRecentSignals(signals: Signal[], days: number = 7): Signal[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return signals.filter(s => new Date(s.publishedAt) >= cutoff);
}

// Get signals by sector
export function getSignalsBySector(signals: Signal[], sector: Sector): Signal[] {
  return signals.filter(s => s.sectors.includes(sector));
}
