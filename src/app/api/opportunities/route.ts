import { NextResponse } from 'next/server';
import { OPPORTUNITIES } from '@/lib/opportunities-data';
import { createClient } from '@supabase/supabase-js';
import { fetchSAMOpportunities } from '@/lib/sam-gov';

export const dynamic = 'force-dynamic';

// Try to use Supabase if configured, otherwise fall back to static data
async function getCuratedOpportunities() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('estimated_value', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Supabase error:', error);
        return { opportunities: OPPORTUNITIES, source: 'static' };
      }

      if (data && data.length > 0) {
        // Convert DB format to app format
        const dbOpportunities = data.map(db => ({
          id: db.id,
          title: db.title,
          subtitle: db.subtitle,
          genesisPillar: db.genesis_pillar,
          genesisConnection: db.genesis_connection,
          entity: db.entity,
          entityType: db.entity_type,
          sector: db.sector,
          location: db.location,
          state: db.state,
          estimatedValue: db.estimated_value,
          contractType: db.contract_type,
          fundingSource: db.funding_source,
          procurementStage: db.procurement_stage,
          urgency: db.urgency,
          keyDate: db.key_date,
          keyDateDescription: db.key_date_description,
          postedDate: db.posted_date,
          responseDeadline: db.response_deadline,
          otRelevance: db.ot_relevance,
          otSystems: db.ot_systems || [],
          otScope: db.ot_scope,
          regulatoryDrivers: db.regulatory_drivers || [],
          complianceRequirements: db.compliance_requirements,
          deloitteServices: db.deloitte_services || [],
          deloitteAngle: db.deloitte_angle,
          existingRelationship: db.existing_relationship,
          likelyPrimes: db.likely_primes || [],
          competitors: db.competitors || [],
          partnerOpportunities: db.partner_opportunities || [],
          sources: db.sources || [],
          confidence: db.confidence,
          notes: db.notes,
          lastUpdated: db.updated_at,
          source: 'curated',
        }));

        // Merge strategy:
        // - Keep static opportunities as baseline (prevents accidental drops)
        // - Let Supabase rows override matching IDs
        // - Include Supabase-only IDs
        const mergedById = new Map<string, (typeof dbOpportunities)[number]>();

        for (const opp of OPPORTUNITIES) {
          mergedById.set(opp.id, { ...opp, source: 'curated' });
        }

        for (const opp of dbOpportunities) {
          mergedById.set(opp.id, opp);
        }

        return {
          opportunities: Array.from(mergedById.values()),
          source: 'supabase+static',
        };
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
    }
  }

  return { opportunities: OPPORTUNITIES.map(o => ({ ...o, source: 'curated' })), source: 'static' };
}

// Fetch live SAM.gov opportunities
async function getLiveOpportunities() {
  const samApiKey = process.env.SAM_API_KEY;

  if (!samApiKey) {
    return { opportunities: [], source: 'none', error: 'SAM_API_KEY is not configured' };
  }

  try {
    const samOpps = await fetchSAMOpportunities(samApiKey, 30);

    // Convert to app format
    const opportunities = samOpps.map(opp => ({
      id: opp.id,
      title: opp.title,
      subtitle: opp.subtitle,
      genesisPillar: opp.genesis_pillar,
      genesisConnection: opp.genesis_connection,
      entity: opp.entity,
      entityType: opp.entity_type,
      sector: opp.sector,
      location: opp.location,
      state: opp.state,
      estimatedValue: opp.estimated_value,
      contractType: opp.contract_type,
      fundingSource: opp.funding_source,
      procurementStage: opp.procurement_stage,
      urgency: opp.urgency,
      keyDate: opp.key_date,
      keyDateDescription: opp.key_date_description,
      postedDate: opp.posted_date,
      responseDeadline: opp.response_deadline,
      otRelevance: opp.ot_relevance,
      otSystems: opp.ot_systems,
      otScope: opp.ot_scope,
      regulatoryDrivers: opp.regulatory_drivers,
      complianceRequirements: opp.compliance_requirements,
      deloitteServices: opp.deloitte_services,
      deloitteAngle: opp.deloitte_angle,
      existingRelationship: opp.existing_relationship,
      likelyPrimes: opp.likely_primes,
      competitors: opp.competitors,
      partnerOpportunities: opp.partner_opportunities,
      sources: opp.sources,
      confidence: opp.confidence,
      notes: opp.notes,
      lastUpdated: new Date().toISOString(),
      source: 'sam.gov',
    }));

    return { opportunities, source: 'sam.gov', error: null as string | null };
  } catch (err) {
    console.error('SAM.gov fetch error:', err);
    return { opportunities: [], source: 'error', error: err instanceof Error ? err.message : 'Unknown SAM.gov error' };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pillar = searchParams.get('pillar');
  const urgency = searchParams.get('urgency');
  const sector = searchParams.get('sector');
  const otRelevance = searchParams.get('otRelevance');
  const includeLive = searchParams.get('live') !== 'false'; // Default to true

  // Fetch curated opportunities
  const { opportunities: curatedOpps, source: curatedSource } = await getCuratedOpportunities();

  // Fetch live SAM.gov opportunities
  let liveOpps: typeof curatedOpps = [];
  let liveSource = 'none';
  let liveError: string | null = null;
  if (includeLive) {
    const liveResult = await getLiveOpportunities();
    liveOpps = liveResult.opportunities;
    liveSource = liveResult.source;
    liveError = liveResult.error ?? null;
  }

  // Merge: curated first, then live (avoiding duplicates by title similarity)
  const allOpportunities = [...curatedOpps];
  const curatedTitles = new Set(curatedOpps.map(o => o.title.toLowerCase().substring(0, 30)));
  let liveAdded = 0;

  for (const liveOpp of liveOpps) {
    const titlePrefix = liveOpp.title.toLowerCase().substring(0, 30);
    if (!curatedTitles.has(titlePrefix)) {
      allOpportunities.push(liveOpp);
      liveAdded += 1;
    }
  }

  let opportunities = [...allOpportunities];

  // Apply filters
  if (pillar && pillar !== 'all') {
    opportunities = opportunities.filter(o => o.genesisPillar === pillar);
  }
  if (urgency && urgency !== 'all') {
    opportunities = opportunities.filter(o => o.urgency === urgency);
  }
  if (sector && sector !== 'all') {
    opportunities = opportunities.filter(o => o.sector === sector);
  }
  if (otRelevance && otRelevance !== 'all') {
    opportunities = opportunities.filter(o => o.otRelevance === otRelevance);
  }

  // Sort: curated first, then by urgency, then by value
  const urgencyOrder = { 'this-week': 0, 'this-month': 1, 'this-quarter': 2, 'this-year': 3, 'watching': 4 };
  opportunities.sort((a, b) => {
    // Curated first
    if (a.source === 'curated' && b.source !== 'curated') return -1;
    if (a.source !== 'curated' && b.source === 'curated') return 1;

    // Then by urgency
    const urgencyDiff = (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 4) -
                        (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 4);
    if (urgencyDiff !== 0) return urgencyDiff;

    // Then by value
    return (b.estimatedValue || 0) - (a.estimatedValue || 0);
  });

  // Calculate stats
  const stats = {
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
    curated: opportunities.filter(o => o.source === 'curated').length,
    live: opportunities.filter(o => o.source === 'sam.gov').length,
    byPillar: {
      // Infrastructure
      'ai-compute': allOpportunities.filter(o => o.genesisPillar === 'ai-compute').length,
      'power': allOpportunities.filter(o => o.genesisPillar === 'power').length,
      'semiconductors': allOpportunities.filter(o => o.genesisPillar === 'semiconductors').length,
      'cooling': allOpportunities.filter(o => o.genesisPillar === 'cooling').length,
      'supply-chain': allOpportunities.filter(o => o.genesisPillar === 'supply-chain').length,
      // Applications
      'defense': allOpportunities.filter(o => o.genesisPillar === 'defense').length,
      'healthcare': allOpportunities.filter(o => o.genesisPillar === 'healthcare').length,
      'energy-systems': allOpportunities.filter(o => o.genesisPillar === 'energy-systems').length,
      'manufacturing': allOpportunities.filter(o => o.genesisPillar === 'manufacturing').length,
      'research': allOpportunities.filter(o => o.genesisPillar === 'research').length,
    },
    byUrgency: {
      'this-week': opportunities.filter(o => o.urgency === 'this-week').length,
      'this-month': opportunities.filter(o => o.urgency === 'this-month').length,
      'this-quarter': opportunities.filter(o => o.urgency === 'this-quarter').length,
      'this-year': opportunities.filter(o => o.urgency === 'this-year').length,
    },
    criticalOT: opportunities.filter(o => o.otRelevance === 'critical').length,
  };

  return NextResponse.json({
    opportunities,
    stats,
    allOpportunities,
    dataSources: {
      curated: curatedSource,
      live: liveSource
    },
    liveDiagnostics: {
      enabled: includeLive,
      source: liveSource,
      error: liveError,
      rawLiveCount: liveOpps.length,
      addedLiveCount: liveAdded,
      droppedAsDuplicates: Math.max(0, liveOpps.length - liveAdded),
    },
  });
}
