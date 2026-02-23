import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching our schema
export interface DBOpportunity {
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
  sources: { title: string; url: string; date: string }[];
  confidence: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Convert DB format to app format
export function dbToOpportunity(db: DBOpportunity) {
  return {
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
    otSystems: db.ot_systems,
    otScope: db.ot_scope,
    regulatoryDrivers: db.regulatory_drivers,
    complianceRequirements: db.compliance_requirements,
    deloitteServices: db.deloitte_services,
    deloitteAngle: db.deloitte_angle,
    existingRelationship: db.existing_relationship,
    likelyPrimes: db.likely_primes,
    competitors: db.competitors,
    partnerOpportunities: db.partner_opportunities,
    sources: db.sources,
    confidence: db.confidence,
    notes: db.notes,
    lastUpdated: db.updated_at,
  };
}
