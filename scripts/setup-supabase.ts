/**
 * Supabase Setup Script
 *
 * This script initializes the Supabase database with the schema and seed data.
 * Run with: npx ts-node scripts/setup-supabase.ts
 *
 * Prerequisites:
 * - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * - Or SUPABASE_SERVICE_ROLE_KEY for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { OPPORTUNITIES } from '../src/lib/opportunities-data';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedOpportunities() {
  console.log('Seeding opportunities...');

  for (const opp of OPPORTUNITIES) {
    const dbOpp = {
      id: opp.id,
      title: opp.title,
      subtitle: opp.subtitle,
      genesis_pillar: opp.genesisPillar,
      genesis_connection: opp.genesisConnection,
      entity: opp.entity,
      entity_type: opp.entityType,
      sector: opp.sector,
      location: opp.location,
      state: opp.state,
      estimated_value: opp.estimatedValue,
      contract_type: opp.contractType,
      funding_source: opp.fundingSource,
      procurement_stage: opp.procurementStage,
      urgency: opp.urgency,
      key_date: opp.keyDate,
      key_date_description: opp.keyDateDescription,
      posted_date: opp.postedDate,
      response_deadline: opp.responseDeadline,
      ot_relevance: opp.otRelevance,
      ot_systems: opp.otSystems,
      ot_scope: opp.otScope,
      regulatory_drivers: opp.regulatoryDrivers,
      compliance_requirements: opp.complianceRequirements,
      deloitte_services: opp.deloitteServices,
      deloitte_angle: opp.deloitteAngle,
      existing_relationship: opp.existingRelationship,
      likely_primes: opp.likelyPrimes,
      competitors: opp.competitors,
      partner_opportunities: opp.partnerOpportunities,
      sources: opp.sources,
      confidence: opp.confidence,
      notes: opp.notes,
    };

    const { error } = await supabase
      .from('opportunities')
      .upsert(dbOpp, { onConflict: 'id' });

    if (error) {
      console.error(`Error inserting ${opp.id}:`, error.message);
    } else {
      console.log(`✓ ${opp.title}`);
    }
  }

  console.log('\nDone! Seeded', OPPORTUNITIES.length, 'opportunities.');
}

seedOpportunities().catch(console.error);
