// SAM.gov API Integration for live federal opportunities
// Docs: https://open.gsa.gov/api/sam-opportunities-api/

const SAM_API_BASE = 'https://api.sam.gov/opportunities/v2/search';

// Keywords that indicate OT/ICS/Critical Infrastructure relevance
const OT_SEARCH_QUERIES = [
  'SCADA cybersecurity',
  'industrial control system security',
  'operational technology',
  'OT security assessment',
  'NERC CIP',
  'critical infrastructure protection',
  'ICS security',
  'nuclear cybersecurity',
  'pipeline cybersecurity',
  'grid cybersecurity',
  'energy sector cybersecurity',
  'water treatment cybersecurity',
  'substation security',
  'control system assessment',
  'DCS security',
  'PLC security',
];

// NAICS codes relevant to OT Cyber work
const RELEVANT_NAICS = [
  '541512', // Computer Systems Design Services
  '541519', // Other Computer Related Services
  '541690', // Other Scientific and Technical Consulting
  '561621', // Security Systems Services
  '541330', // Engineering Services
  '221111', // Hydroelectric Power Generation
  '221112', // Fossil Fuel Electric Power Generation
  '221113', // Nuclear Electric Power Generation
  '221121', // Electric Bulk Power Transmission and Control
  '221122', // Electric Power Distribution
  '221210', // Natural Gas Distribution
  '221310', // Water Supply and Irrigation Systems
  '237130', // Power and Communication Line Construction
];

export interface SAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  department: string;
  subTier: string;
  office: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  setAsideDescription: string | null;
  responseDeadLine: string | null;
  naicsCode: string;
  naicsCodes: string[];
  classificationCode: string;
  active: string;
  description: string;
  uiLink: string;
  award: {
    amount: string;
    date: string;
    awardee: { name: string } | null;
  } | null;
  pointOfContact: Array<{
    fullName: string;
    email: string;
    phone: string;
  }>;
  officeAddress: {
    city: string;
    state: string;
    zipcode: string;
  };
  placeOfPerformance: {
    city: { name: string } | null;
    state: { code: string; name: string } | null;
  } | null;
}

export interface TransformedSAMOpportunity {
  id: string;
  title: string;
  subtitle: string;
  genesis_pillar: string;
  genesis_connection: string;
  entity: string;
  entity_type: string;
  sector: string;
  location: string;
  state: string;
  estimated_value: number | null;
  contract_type: string;
  funding_source: string;
  procurement_stage: string;
  urgency: string;
  key_date: string | null;
  key_date_description: string | null;
  posted_date: string;
  response_deadline: string | null;
  ot_relevance: string;
  ot_systems: string[];
  ot_scope: string;
  regulatory_drivers: string[];
  compliance_requirements: string;
  deloitte_services: string[];
  deloitte_angle: string;
  existing_relationship: string;
  likely_primes: string[];
  competitors: string[];
  partner_opportunities: string[];
  sources: Array<{ title: string; url: string; date: string }>;
  confidence: string;
  notes: string;
  source: string;
}

// Detect sector from text and NAICS
function detectSector(text: string, naicsCode: string): string {
  const lower = text.toLowerCase();

  if (naicsCode?.startsWith('2211')) return 'grid';
  if (naicsCode?.startsWith('2213')) return 'water';

  if (lower.includes('nuclear') || lower.includes('nrc')) return 'nuclear';
  if (lower.includes('data center') || lower.includes('datacenter')) return 'data-centers';
  if (lower.includes('semiconductor') || lower.includes('chip') || lower.includes('fab')) return 'semiconductors';
  if (lower.includes('grid') || lower.includes('transmission') || lower.includes('substation') || lower.includes('nerc')) return 'grid';
  if (lower.includes('water') || lower.includes('wastewater')) return 'water';
  if (lower.includes('pipeline') || lower.includes('natural gas')) return 'grid';
  if (lower.includes('battery') || lower.includes('ev ')) return 'ev-battery';
  if (lower.includes('hydrogen') || lower.includes('solar') || lower.includes('wind')) return 'clean-energy';
  if (lower.includes('mining') || lower.includes('mineral') || lower.includes('rare earth')) return 'critical-minerals';

  return 'manufacturing';
}

// Detect Genesis pillar
function detectGenesisPillar(sector: string, text: string): string {
  const lower = text.toLowerCase();

  if (sector === 'data-centers' || lower.includes('ai ') || lower.includes('artificial intelligence')) return 'ai-compute';
  if (sector === 'nuclear' || sector === 'grid' || sector === 'clean-energy') return 'power';
  if (sector === 'semiconductors') return 'semiconductors';
  if (sector === 'water') return 'cooling';
  if (sector === 'critical-minerals' || sector === 'ev-battery') return 'supply-chain';

  return 'power';
}

// Detect OT relevance level
function detectOTRelevance(text: string, naicsCode: string): { level: string; systems: string[]; reason: string } {
  const lower = text.toLowerCase();
  const systems: string[] = [];
  let score = 0;

  // High-value keywords
  if (lower.includes('scada')) { systems.push('scada'); score += 3; }
  if (lower.includes('ics') || lower.includes('industrial control')) { systems.push('dcs'); score += 3; }
  if (lower.includes('plc') || lower.includes('programmable logic')) { systems.push('plc'); score += 2; }
  if (lower.includes('dcs') || lower.includes('distributed control')) { systems.push('dcs'); score += 3; }
  if (lower.includes('hmi') || lower.includes('human machine')) { systems.push('hmi'); score += 2; }
  if (lower.includes('ot security') || lower.includes('operational technology')) { score += 3; }
  if (lower.includes('nerc cip')) { systems.push('ems'); score += 3; }
  if (lower.includes('nuclear')) { systems.push('sis'); score += 3; }
  if (lower.includes('safety system') || lower.includes('sis')) { systems.push('sis'); score += 2; }

  // Medium-value keywords
  if (lower.includes('cybersecurity assessment')) score += 2;
  if (lower.includes('penetration test')) score += 2;
  if (lower.includes('vulnerability assessment')) score += 2;
  if (lower.includes('critical infrastructure')) score += 2;
  if (lower.includes('control system')) score += 2;

  // NAICS boost
  if (RELEVANT_NAICS.includes(naicsCode)) score += 1;

  // Default systems if none detected
  if (systems.length === 0) systems.push('scada');

  const level = score >= 5 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'medium' : 'low';
  const reason = score >= 5 ? 'Multiple OT/ICS indicators' :
                 score >= 3 ? 'Contains OT-relevant keywords' :
                 score >= 1 ? 'Potential OT relevance' : 'General cybersecurity';

  return { level, systems: [...new Set(systems)], reason };
}

// Detect urgency based on response deadline
function detectUrgency(responseDeadline: string | null): string {
  if (!responseDeadline) return 'this-quarter';

  const deadline = new Date(responseDeadline);
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 7) return 'this-week';
  if (daysUntil <= 30) return 'this-month';
  if (daysUntil <= 90) return 'this-quarter';
  return 'this-year';
}

// Detect procurement stage from SAM type
function detectStage(type: string, baseType: string): string {
  const combined = `${type} ${baseType}`.toLowerCase();

  if (combined.includes('award')) return 'awarded';
  if (combined.includes('solicitation') || combined.includes('combined')) return 'rfp-open';
  if (combined.includes('presolicitation') || combined.includes('sources sought')) return 'pre-solicitation';
  if (combined.includes('intent to') || combined.includes('special notice')) return 'pre-solicitation';

  return 'rfp-open';
}

// Parse dollar amount from text
function parseAmount(text: string): number | null {
  if (!text) return null;

  const patterns = [
    /\$[\d,]+(?:\.\d{2})?\s*(?:billion|b)/gi,
    /\$[\d,]+(?:\.\d{2})?\s*(?:million|m)/gi,
    /\$[\d,]+(?:\.\d{2})?/g,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[0].replace(/[$,]/g, '');
      let value = parseFloat(numStr);
      if (/billion|b/i.test(match[0])) value *= 1_000_000_000;
      else if (/million|m/i.test(match[0])) value *= 1_000_000;
      if (value > 1000) return value; // Sanity check
    }
  }

  return null;
}

// Detect relevant Deloitte services
function detectDeloitteServices(text: string, sector: string): string[] {
  const lower = text.toLowerCase();
  const services: string[] = [];

  if (lower.includes('assessment') || lower.includes('evaluation')) services.push('ot-assessment');
  if (lower.includes('architecture') || lower.includes('design')) services.push('ics-architecture');
  if (lower.includes('nerc') || lower.includes('compliance')) services.push('nerc-cip-compliance');
  if (sector === 'nuclear') services.push('nuclear-cyber');
  if (lower.includes('incident') || lower.includes('response')) services.push('incident-response');
  if (lower.includes('soc') || lower.includes('monitoring')) services.push('soc-integration');
  if (lower.includes('segmentation') || lower.includes('network')) services.push('network-segmentation');
  if (lower.includes('vendor') || lower.includes('supply chain')) services.push('vendor-risk');
  if (lower.includes('tabletop') || lower.includes('exercise')) services.push('tabletop-exercises');

  if (services.length === 0) services.push('ot-assessment');

  return [...new Set(services)];
}

// Detect regulatory drivers
function detectRegulatory(text: string, sector: string): string[] {
  const lower = text.toLowerCase();
  const regs: string[] = [];

  if (lower.includes('nerc cip') || lower.includes('nerc-cip')) regs.push('nerc-cip');
  if (lower.includes('nrc') || lower.includes('10 cfr') || sector === 'nuclear') regs.push('nrc-cyber');
  if (lower.includes('cfats') || lower.includes('chemical')) regs.push('cfats');
  if (lower.includes('tsa') || lower.includes('pipeline')) regs.push('tsa-pipeline');
  if (lower.includes('fedramp')) regs.push('fedramp');
  if (lower.includes('cmmc') || lower.includes('dod') || lower.includes('defense')) regs.push('cmmc');

  return regs;
}

export function transformSAMOpportunity(sam: SAMOpportunity): TransformedSAMOpportunity {
  const fullText = `${sam.title} ${sam.description || ''}`;
  const sector = detectSector(fullText, sam.naicsCode);
  const pillar = detectGenesisPillar(sector, fullText);
  const otInfo = detectOTRelevance(fullText, sam.naicsCode);
  const stage = detectStage(sam.type, sam.baseType);
  const urgency = detectUrgency(sam.responseDeadLine);

  return {
    id: `sam-${sam.noticeId}`,
    title: sam.title.length > 80 ? sam.title.substring(0, 77) + '...' : sam.title,
    subtitle: `Federal ${sam.type} - ${sam.department || sam.subTier || 'Federal Agency'}`,
    genesis_pillar: pillar,
    genesis_connection: `Federal procurement opportunity in ${sector} sector. ${otInfo.reason}.`,
    entity: sam.department || sam.subTier || sam.office || 'Federal Agency',
    entity_type: 'federal',
    sector: sector,
    location: sam.placeOfPerformance?.city?.name || sam.officeAddress?.city || 'USA',
    state: sam.placeOfPerformance?.state?.code || sam.officeAddress?.state || 'US',
    estimated_value: sam.award?.amount ? parseFloat(sam.award.amount) : parseAmount(fullText),
    contract_type: 'prime',
    funding_source: 'Federal',
    procurement_stage: stage,
    urgency: urgency,
    key_date: sam.responseDeadLine,
    key_date_description: sam.responseDeadLine ? 'Response deadline' : null,
    posted_date: sam.postedDate,
    response_deadline: sam.responseDeadLine,
    ot_relevance: otInfo.level,
    ot_systems: otInfo.systems,
    ot_scope: sam.description?.substring(0, 500) || 'See solicitation for details.',
    regulatory_drivers: detectRegulatory(fullText, sector),
    compliance_requirements: 'Federal cybersecurity requirements apply.',
    deloitte_services: detectDeloitteServices(fullText, sector),
    deloitte_angle: 'Federal prime contract opportunity. Position Deloitte federal cyber capabilities.',
    existing_relationship: 'unknown',
    likely_primes: [],
    competitors: [],
    partner_opportunities: [],
    sources: [{
      title: 'SAM.gov Listing',
      url: sam.uiLink || `https://sam.gov/opp/${sam.noticeId}/view`,
      date: sam.postedDate
    }],
    confidence: 'confirmed',
    notes: `Source: SAM.gov | Solicitation: ${sam.solicitationNumber || 'N/A'}`,
    source: 'sam.gov'
  };
}

export async function fetchSAMOpportunities(apiKey: string, limit: number = 50): Promise<TransformedSAMOpportunity[]> {
  const allOpportunities: TransformedSAMOpportunity[] = [];
  const seenIds = new Set<string>();

  // Get date range (last 90 days)
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const postedFrom = ninetyDaysAgo.toISOString().split('T')[0].replace(/-/g, '/');
  const postedTo = today.toISOString().split('T')[0].replace(/-/g, '/');

  // Search with multiple queries to catch different opportunities
  const queriesToRun = OT_SEARCH_QUERIES.slice(0, 8); // Limit to avoid rate limits

  for (const query of queriesToRun) {
    try {
      const params = new URLSearchParams({
        api_key: apiKey,
        q: query,
        postedFrom: postedFrom,
        postedTo: postedTo,
        limit: '25',
        ptype: 'o,p,k', // Opportunities, Presolicitations, Combined
        status: 'active',
      });

      const response = await fetch(`${SAM_API_BASE}?${params}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!response.ok) {
        console.error(`SAM API error for "${query}":`, response.status);
        continue;
      }

      const data = await response.json();
      const opportunities = data.opportunitiesData || [];

      for (const opp of opportunities) {
        if (!seenIds.has(opp.noticeId)) {
          seenIds.add(opp.noticeId);
          const transformed = transformSAMOpportunity(opp);
          // Only include if it has some OT relevance
          if (transformed.ot_relevance !== 'low') {
            allOpportunities.push(transformed);
          }
        }
      }

      if (allOpportunities.length >= limit) break;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`Error fetching SAM data for "${query}":`, error);
    }
  }

  // Sort by urgency then relevance
  const urgencyOrder = { 'this-week': 0, 'this-month': 1, 'this-quarter': 2, 'this-year': 3, 'watching': 4 };
  const relevanceOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };

  return allOpportunities
    .sort((a, b) => {
      const urgencyDiff = (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 4) -
                          (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 4);
      if (urgencyDiff !== 0) return urgencyDiff;
      return (relevanceOrder[a.ot_relevance as keyof typeof relevanceOrder] || 3) -
             (relevanceOrder[b.ot_relevance as keyof typeof relevanceOrder] || 3);
    })
    .slice(0, limit);
}
