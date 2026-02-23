// Grants.gov API Integration
// Docs: https://www.grants.gov/web/grants/s2s/applicant/schemas/grantscommonelements.html

const GRANTS_API_BASE = 'https://www.grants.gov/grantsws/rest/opportunities/search';

// Keywords for OT/Critical Infrastructure grants
const OT_KEYWORDS = [
  'cybersecurity',
  'critical infrastructure',
  'energy grid',
  'industrial control',
  'SCADA',
  'nuclear',
  'water treatment',
  'power grid',
  'pipeline security',
];

// Agencies most likely to have OT-relevant grants
const RELEVANT_AGENCIES = [
  'Department of Energy',
  'Department of Homeland Security',
  'Department of Defense',
  'Environmental Protection Agency',
  'Nuclear Regulatory Commission',
  'National Science Foundation',
];

export interface GrantsGovOpportunity {
  id: string;
  number: string;
  title: string;
  agency: string;
  openDate: string;
  closeDate: string;
  awardCeiling: number;
  awardFloor: number;
  description: string;
  category: string;
  status: string;
}

export interface TransformedGrant {
  id: string;
  title: string;
  agency: string;
  amount: { min: number; max: number };
  openDate: string;
  closeDate: string;
  description: string;
  url: string;
  relevance: 'high' | 'medium' | 'low';
  daysUntilClose: number | null;
}

function detectRelevance(title: string, description: string, agency: string): 'high' | 'medium' | 'low' {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  // Keyword scoring
  if (text.includes('cybersecurity') || text.includes('cyber security')) score += 2;
  if (text.includes('critical infrastructure')) score += 3;
  if (text.includes('scada') || text.includes('industrial control')) score += 3;
  if (text.includes('grid') || text.includes('electric')) score += 2;
  if (text.includes('nuclear')) score += 2;
  if (text.includes('water') || text.includes('wastewater')) score += 1;
  if (text.includes('pipeline')) score += 2;
  if (text.includes('operational technology') || text.includes(' ot ')) score += 3;

  // Agency boost
  if (agency.includes('Energy') || agency.includes('Homeland')) score += 1;
  if (agency.includes('Defense')) score += 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export async function fetchGrants(limit: number = 15): Promise<TransformedGrant[]> {
  const results: TransformedGrant[] = [];

  try {
    // Grants.gov uses a different API structure - we'll search for relevant keywords
    for (const keyword of OT_KEYWORDS.slice(0, 3)) {
      const response = await fetch(`${GRANTS_API_BASE}?keyword=${encodeURIComponent(keyword)}&oppStatuses=forecasted,posted`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        console.error('Grants.gov API error:', response.status);
        continue;
      }

      const data = await response.json();
      const opportunities = data.oppHits || [];

      for (const opp of opportunities) {
        if (results.some(r => r.id === opp.id)) continue;

        const relevance = detectRelevance(opp.title || '', opp.description || '', opp.agencyName || '');
        if (relevance === 'low') continue;

        const closeDate = opp.closeDate ? new Date(opp.closeDate) : null;
        const daysUntilClose = closeDate
          ? Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        results.push({
          id: `grant-${opp.id}`,
          title: opp.title || 'Untitled Grant',
          agency: opp.agencyName || 'Federal Agency',
          amount: {
            min: opp.awardFloor || 0,
            max: opp.awardCeiling || 0,
          },
          openDate: opp.openDate || '',
          closeDate: opp.closeDate || '',
          description: (opp.description || '').substring(0, 300),
          url: `https://www.grants.gov/search-results-detail/${opp.id}`,
          relevance,
          daysUntilClose,
        });

        if (results.length >= limit) break;
      }

      if (results.length >= limit) break;
    }
  } catch (error) {
    console.error('Error fetching Grants.gov data:', error);
  }

  return results.sort((a, b) => {
    // Sort by relevance then by close date
    if (a.relevance !== b.relevance) {
      return a.relevance === 'high' ? -1 : 1;
    }
    if (a.daysUntilClose && b.daysUntilClose) {
      return a.daysUntilClose - b.daysUntilClose;
    }
    return 0;
  });
}
