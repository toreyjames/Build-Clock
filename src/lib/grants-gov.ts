// Grants.gov API Integration
// Docs: https://www.grants.gov/web/grants/s2s/applicant/schemas/grantscommonelements.html

const GRANTS_API_BASE = 'https://www.grants.gov/grantsws/rest/opportunities/search';
const GRANTS_RSS_FEED = 'https://www.grants.gov/rss/GG_NewOpp.xml';

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

interface ApiGrantRecord {
  id?: string | number;
  title?: string;
  agencyName?: string;
  openDate?: string;
  closeDate?: string;
  awardCeiling?: number;
  awardFloor?: number;
  description?: string;
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
  let apiAttempted = false;

  try {
    // Try API search first using both GET and POST patterns.
    for (const keyword of OT_KEYWORDS.slice(0, 3)) {
      apiAttempted = true;
      const opportunities = await searchGrantApi(keyword);

      for (const opp of opportunities) {
        const oppId = String(opp.id || '').trim();
        if (!oppId) continue;
        if (results.some((r) => r.id === `grant-${oppId}`)) continue;

        const relevance = detectRelevance(opp.title || '', opp.description || '', opp.agencyName || '');
        if (relevance === 'low') continue;

        const closeDate = opp.closeDate ? new Date(opp.closeDate) : null;
        const daysUntilClose = closeDate
          ? Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        results.push({
          id: `grant-${oppId}`,
          title: opp.title || 'Untitled Grant',
          agency: opp.agencyName || 'Federal Agency',
          amount: {
            min: opp.awardFloor || 0,
            max: opp.awardCeiling || 0,
          },
          openDate: opp.openDate || '',
          closeDate: opp.closeDate || '',
          description: (opp.description || '').substring(0, 300),
          url: `https://www.grants.gov/search-results-detail/${oppId}`,
          relevance,
          daysUntilClose,
        });

        if (results.length >= limit) break;
      }

      if (results.length >= limit) break;
    }
  } catch (error) {
    console.warn('Grants.gov API search failed; continuing with fallback.', error);
  }

  if (results.length === 0) {
    try {
      const rssResults = await fetchGrantsFromRss(limit);
      results.push(...rssResults);
    } catch (error) {
      if (!apiAttempted) {
        console.warn('Grants.gov fetch failed (API + RSS).', error);
      }
    }
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

async function searchGrantApi(keyword: string): Promise<ApiGrantRecord[]> {
  // Attempt 1: legacy GET query style.
  const getResponse = await fetch(
    `${GRANTS_API_BASE}?keyword=${encodeURIComponent(keyword)}&oppStatuses=forecasted,posted`,
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    }
  );

  if (getResponse.ok) {
    const data = await getResponse.json();
    return Array.isArray(data.oppHits) ? (data.oppHits as ApiGrantRecord[]) : [];
  }

  // Attempt 2: POST payload style seen in newer Grants patterns.
  if (getResponse.status === 405 || getResponse.status === 415 || getResponse.status === 400) {
    const postResponse = await fetch(GRANTS_API_BASE, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        oppStatuses: ['forecasted', 'posted'],
        sortBy: 'closeDate|asc',
        rows: 50,
      }),
      next: { revalidate: 3600 },
    });

    if (postResponse.ok) {
      const data = await postResponse.json();
      return Array.isArray(data.oppHits) ? (data.oppHits as ApiGrantRecord[]) : [];
    }
  }

  return [];
}

async function fetchGrantsFromRss(limit: number): Promise<TransformedGrant[]> {
  const response = await fetch(GRANTS_RSS_FEED, { next: { revalidate: 3600 } });
  if (!response.ok) return [];

  const xml = await response.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  const out: TransformedGrant[] = [];

  for (const item of items) {
    const title = extractTag(item, 'title');
    const description = extractTag(item, 'description');
    const link = extractTag(item, 'link');
    const pubDate = extractTag(item, 'pubDate');
    const agency = inferAgency(title, description);
    const relevance = detectRelevance(title, description, agency);
    if (relevance === 'low') continue;

    out.push({
      id: `grant-rss-${simpleHash(link || title)}`,
      title: title || 'Untitled Grant',
      agency,
      amount: { min: 0, max: 0 },
      openDate: pubDate || '',
      closeDate: '',
      description: (description || '').substring(0, 300),
      url: link || 'https://www.grants.gov/search-grants',
      relevance,
      daysUntilClose: null,
    });

    if (out.length >= limit) break;
  }

  return out;
}

function extractTag(input: string, tag: string): string {
  const match = input.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim() : '';
}

function inferAgency(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const directMatch = RELEVANT_AGENCIES.find((agency) => text.includes(agency.toLowerCase()));
  if (directMatch) return directMatch;
  if (text.includes('department of energy') || text.includes('doe')) return 'Department of Energy';
  if (text.includes('homeland security') || text.includes('dhs')) return 'Department of Homeland Security';
  if (text.includes('defense') || text.includes('dod')) return 'Department of Defense';
  if (text.includes('epa') || text.includes('environmental protection')) return 'Environmental Protection Agency';
  if (text.includes('nuclear regulatory')) return 'Nuclear Regulatory Commission';
  return 'Federal Agency';
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
