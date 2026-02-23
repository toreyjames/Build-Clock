// USASpending.gov API Integration
// Docs: https://api.usaspending.gov/

const USA_SPENDING_BASE = 'https://api.usaspending.gov/api/v2';

// NAICS codes relevant to OT/Critical Infrastructure
const RELEVANT_NAICS = [
  '541512', // Computer Systems Design
  '541519', // Other Computer Related
  '541690', // Other Technical Consulting
  '221111', // Hydroelectric Power
  '221112', // Fossil Fuel Power
  '221113', // Nuclear Power
  '221121', // Electric Transmission
  '221122', // Electric Distribution
  '221210', // Natural Gas
  '221310', // Water Supply
  '334111', // Electronic Computer Manufacturing
  '334413', // Semiconductor Manufacturing
];

// Keywords for searching awards
const OT_KEYWORDS = [
  'cybersecurity',
  'SCADA',
  'industrial control',
  'critical infrastructure',
  'operational technology',
  'NERC CIP',
  'nuclear security',
];

export interface USASpendingAward {
  Award_ID: string;
  Recipient_Name: string;
  Award_Amount: number;
  Award_Date: string;
  Awarding_Agency: string;
  Awarding_Sub_Agency: string;
  Award_Type: string;
  Description: string;
  Place_of_Performance_City: string;
  Place_of_Performance_State: string;
  NAICS_Code: string;
  NAICS_Description: string;
  generated_unique_award_id: string;
}

export interface TransformedAward {
  id: string;
  title: string;
  recipient: string;
  amount: number;
  awardDate: string;
  agency: string;
  description: string;
  location: string;
  state: string;
  naics: string;
  url: string;
  sector: string;
  relevance: 'high' | 'medium' | 'low';
}

function detectSectorFromNAICS(naics: string): string {
  if (naics?.startsWith('2211')) return 'grid';
  if (naics?.startsWith('2213')) return 'water';
  if (naics?.startsWith('3341')) return 'semiconductors';
  if (naics?.startsWith('5415')) return 'data-centers';
  return 'manufacturing';
}

function detectRelevance(description: string, naics: string): 'high' | 'medium' | 'low' {
  const lower = (description || '').toLowerCase();
  let score = 0;

  if (lower.includes('scada') || lower.includes('ics ')) score += 3;
  if (lower.includes('cybersecurity') || lower.includes('cyber security')) score += 2;
  if (lower.includes('critical infrastructure')) score += 2;
  if (lower.includes('operational technology') || lower.includes('ot ')) score += 3;
  if (lower.includes('nuclear')) score += 2;
  if (lower.includes('grid') || lower.includes('electric')) score += 1;
  if (RELEVANT_NAICS.includes(naics)) score += 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function transformAward(award: USASpendingAward): TransformedAward {
  const sector = detectSectorFromNAICS(award.NAICS_Code);
  const relevance = detectRelevance(award.Description, award.NAICS_Code);

  return {
    id: `usa-${award.generated_unique_award_id || award.Award_ID}`,
    title: award.Description?.substring(0, 100) || 'Federal Contract Award',
    recipient: award.Recipient_Name,
    amount: award.Award_Amount,
    awardDate: award.Award_Date,
    agency: award.Awarding_Sub_Agency || award.Awarding_Agency,
    description: award.Description,
    location: award.Place_of_Performance_City || 'USA',
    state: award.Place_of_Performance_State || 'US',
    naics: award.NAICS_Code,
    url: `https://www.usaspending.gov/award/${award.generated_unique_award_id}`,
    sector,
    relevance,
  };
}

export async function fetchRecentAwards(limit: number = 20): Promise<TransformedAward[]> {
  try {
    // Get awards from last 90 days with relevant NAICS codes
    const today = new Date();
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    const response = await fetch(`${USA_SPENDING_BASE}/search/spending_by_award/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          time_period: [
            {
              start_date: ninetyDaysAgo.toISOString().split('T')[0],
              end_date: today.toISOString().split('T')[0],
            }
          ],
          naics_codes: RELEVANT_NAICS,
          award_type_codes: ['A', 'B', 'C', 'D'], // Contracts
        },
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Award Date',
          'Awarding Agency',
          'Awarding Sub Agency',
          'Award Type',
          'Description',
          'Place of Performance City',
          'Place of Performance State Code',
          'NAICS Code',
          'NAICS Description',
          'generated_unique_award_id',
        ],
        page: 1,
        limit: limit,
        sort: 'Award Amount',
        order: 'desc',
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('USASpending API error:', response.status);
      return [];
    }

    const data = await response.json();
    const results = data.results || [];

    return results
      .map((r: Record<string, unknown>) => transformAward({
        Award_ID: r['Award ID'] as string,
        Recipient_Name: r['Recipient Name'] as string,
        Award_Amount: r['Award Amount'] as number,
        Award_Date: r['Award Date'] as string,
        Awarding_Agency: r['Awarding Agency'] as string,
        Awarding_Sub_Agency: r['Awarding Sub Agency'] as string,
        Award_Type: r['Award Type'] as string,
        Description: r['Description'] as string,
        Place_of_Performance_City: r['Place of Performance City'] as string,
        Place_of_Performance_State: r['Place of Performance State Code'] as string,
        NAICS_Code: r['NAICS Code'] as string,
        NAICS_Description: r['NAICS Description'] as string,
        generated_unique_award_id: r['generated_unique_award_id'] as string,
      }))
      .filter((a: TransformedAward) => a.relevance !== 'low');
  } catch (error) {
    console.error('Error fetching USASpending data:', error);
    return [];
  }
}
