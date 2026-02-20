import {
  Opportunity,
  SAMOpportunity,
  Sector,
  ProcurementStage,
  OTRelevance,
  OT_CYBER_KEYWORDS,
  OT_RELEVANT_NAICS
} from './types';

const SAM_API_BASE = 'https://api.sam.gov/opportunities/v2/search';

// Keywords to identify sectors
const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  'data-centers': ['data center', 'datacenter', 'cloud', 'server farm', 'colocation', 'hyperscale'],
  'nuclear': ['nuclear', 'reactor', 'uranium', 'nrc', 'atomic', 'fission', 'smr', 'small modular reactor'],
  'grid': ['grid', 'transmission', 'substation', 'ferc', 'nerc', 'electric power', 'utility', 'ems', 'energy management'],
  'semiconductors': ['semiconductor', 'chip', 'fab', 'foundry', 'wafer', 'integrated circuit', 'microelectronics'],
  'critical-minerals': ['rare earth', 'lithium', 'cobalt', 'mining', 'mineral', 'graphite', 'nickel'],
  'water': ['water treatment', 'wastewater', 'desalination', 'water infrastructure', 'water utility', 'potable'],
  'ev-battery': ['battery', 'ev', 'electric vehicle', 'charging', 'gigafactory', 'energy storage', 'bess'],
  'clean-energy': ['solar', 'wind', 'renewable', 'hydrogen', 'geothermal', 'clean energy', 'green energy'],
  'manufacturing': ['manufacturing', 'industrial', 'factory', 'production facility', 'assembly']
};

// Genesis-adjacent agency keywords
const GENESIS_AGENCIES = [
  'department of energy', 'doe', 'department of defense', 'dod',
  'department of homeland security', 'dhs', 'cisa',
  'nuclear regulatory commission', 'nrc', 'ferc',
  'environmental protection agency', 'epa',
  'national nuclear security administration', 'nnsa',
  'army corps of engineers', 'navy', 'air force',
  'general services administration', 'gsa',
  'tennessee valley authority', 'tva',
  'bonneville power administration', 'bpa'
];

function detectSector(text: string, naicsCode?: string): Sector {
  const lowerText = text.toLowerCase();

  // Check NAICS code first
  if (naicsCode) {
    if (naicsCode.startsWith('2211')) return 'grid'; // Electric power
    if (naicsCode.startsWith('2212')) return 'grid'; // Natural gas
    if (naicsCode.startsWith('2213')) return 'water';
    if (naicsCode === '334413') return 'semiconductors';
    if (naicsCode === '518210') return 'data-centers';
  }

  // Check keywords
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return sector as Sector;
    }
  }

  return 'manufacturing'; // Default
}

function detectProcurementStage(type: string, baseType: string): ProcurementStage {
  const lowerType = (type + ' ' + baseType).toLowerCase();

  if (lowerType.includes('award') || lowerType.includes('justification')) return 'awarded';
  if (lowerType.includes('solicitation') || lowerType.includes('combined')) return 'rfp-open';
  if (lowerType.includes('sources sought') || lowerType.includes('rfi')) return 'planning';
  if (lowerType.includes('presolicitation')) return 'planning';
  if (lowerType.includes('special notice')) return 'announced';

  return 'rfp-open';
}

function scoreOTRelevance(text: string, naicsCode?: string): { score: OTRelevance; reason: string } {
  const lowerText = text.toLowerCase();

  // Check NAICS first
  if (naicsCode && OT_RELEVANT_NAICS.includes(naicsCode)) {
    // High-value NAICS codes
    if (['221111', '221112', '221113', '221121', '221122', '221310', '221320'].includes(naicsCode)) {
      return { score: 'high', reason: 'Critical infrastructure NAICS code' };
    }
  }

  // Check high-relevance keywords
  for (const keyword of OT_CYBER_KEYWORDS.high) {
    if (lowerText.includes(keyword)) {
      return { score: 'high', reason: `Contains OT/ICS keyword: "${keyword}"` };
    }
  }

  // Check medium-relevance keywords
  for (const keyword of OT_CYBER_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) {
      return { score: 'medium', reason: `Contains infrastructure keyword: "${keyword}"` };
    }
  }

  // Check low-relevance keywords
  for (const keyword of OT_CYBER_KEYWORDS.low) {
    if (lowerText.includes(keyword)) {
      return { score: 'low', reason: `Contains general security keyword: "${keyword}"` };
    }
  }

  return { score: 'low', reason: 'No specific OT indicators' };
}

function detectPolicyAlignment(text: string): string[] {
  const lowerText = text.toLowerCase();
  const policies: string[] = [];

  if (lowerText.includes('chips') || lowerText.includes('semiconductor')) {
    policies.push('CHIPS Act');
  }
  if (lowerText.includes('inflation reduction') || lowerText.includes('ira') ||
      lowerText.includes('clean energy') || lowerText.includes('renewable')) {
    policies.push('IRA');
  }
  if (lowerText.includes('infrastructure') || lowerText.includes('bipartisan infrastructure')) {
    policies.push('BIL');
  }
  if (lowerText.includes('ai') || lowerText.includes('artificial intelligence') ||
      lowerText.includes('machine learning')) {
    policies.push('AI EO');
  }
  if (GENESIS_AGENCIES.some(agency => lowerText.includes(agency))) {
    policies.push('Genesis Adjacent');
  }

  return policies.length > 0 ? policies : ['Federal Procurement'];
}

function parseValue(text: string): number | null {
  // Look for dollar amounts in the text
  const patterns = [
    /\$[\d,]+(?:\.\d{2})?\s*(?:million|m)/gi,
    /\$[\d,]+(?:\.\d{2})?\s*(?:billion|b)/gi,
    /\$[\d,]+(?:\.\d{2})?/g
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[0].replace(/[$,]/g, '');
      let value = parseFloat(numStr);
      if (match[0].toLowerCase().includes('billion') || match[0].toLowerCase().includes('b')) {
        value *= 1_000_000_000;
      } else if (match[0].toLowerCase().includes('million') || match[0].toLowerCase().includes('m')) {
        value *= 1_000_000;
      }
      return value;
    }
  }

  return null;
}

export function transformSAMOpportunity(sam: SAMOpportunity): Opportunity {
  const fullText = `${sam.title} ${sam.description || ''} ${sam.fullParentPathName || ''}`;
  const otScore = scoreOTRelevance(fullText, sam.naicsCode);

  return {
    id: sam.noticeId,
    title: sam.title,
    description: sam.description || 'No description available',
    entity: sam.fullParentPathName || 'Federal Agency',
    sector: detectSector(fullText, sam.naicsCode),
    procurementStage: detectProcurementStage(sam.type, sam.baseType),
    otRelevance: otScore.score,
    otRelevanceReason: otScore.reason,
    estimatedValue: sam.award?.amount ? parseFloat(sam.award.amount) : parseValue(fullText),
    location: sam.placeOfPerformance?.city?.name || sam.officeAddress?.city || 'USA',
    state: sam.placeOfPerformance?.state?.code || sam.officeAddress?.state || 'US',
    policyAlignment: detectPolicyAlignment(fullText),
    source: 'sam.gov',
    sourceUrl: sam.uiLink || `https://sam.gov/opp/${sam.noticeId}/view`,
    postedDate: sam.postedDate,
    responseDeadline: sam.responseDeadLine || null,
    lastUpdated: new Date().toISOString(),
    naicsCode: sam.naicsCode,
    solicitationNumber: sam.solicitationNumber
  };
}

export async function fetchSAMOpportunities(apiKey: string): Promise<Opportunity[]> {
  // Build search queries for OT-relevant opportunities
  const searchQueries = [
    'cybersecurity SCADA',
    'industrial control system',
    'operational technology security',
    'NERC CIP',
    'critical infrastructure cybersecurity',
    'nuclear security',
    'power grid cybersecurity',
    'energy sector cybersecurity',
    'water treatment security',
    'ICS security assessment',
    'data center security',
    'semiconductor manufacturing',
    'electric utility',
    'grid modernization'
  ];

  const allOpportunities: Opportunity[] = [];
  const seenIds = new Set<string>();

  for (const query of searchQueries.slice(0, 5)) { // Limit to avoid rate limits
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        q: query,
        postedFrom: getDateDaysAgo(90),
        postedTo: getTodayDate(),
        limit: '50',
        ptype: 'o,k,p', // Solicitation types
      });

      const response = await fetch(`${SAM_API_BASE}?${params}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`SAM API error for query "${query}":`, response.status);
        continue;
      }

      const data = await response.json();
      const opportunities = data.opportunitiesData || [];

      for (const opp of opportunities) {
        if (!seenIds.has(opp.noticeId)) {
          seenIds.add(opp.noticeId);
          allOpportunities.push(transformSAMOpportunity(opp));
        }
      }
    } catch (error) {
      console.error(`Error fetching SAM data for query "${query}":`, error);
    }
  }

  // Sort by OT relevance, then by date
  return allOpportunities.sort((a, b) => {
    const relevanceOrder = { high: 0, medium: 1, low: 2 };
    const relevanceDiff = relevanceOrder[a.otRelevance] - relevanceOrder[b.otRelevance];
    if (relevanceDiff !== 0) return relevanceDiff;
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
  });
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '/');
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0].replace(/-/g, '/');
}
