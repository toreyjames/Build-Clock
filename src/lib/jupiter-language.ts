import type { ProcurementStage } from '@/lib/types';

export type GenesisStatus = 'on-radar' | 'contacted' | 'meeting' | 'proposal' | 'closed';

export const GENESIS_STATUS_TO_SF_STAGE: Record<GenesisStatus, string> = {
  'on-radar': 'Qualification',
  'contacted': 'Needs Analysis',
  'meeting': 'Value Proposition',
  'proposal': 'Proposal/Price Quote',
  'closed': 'Closed Won',
};

export const PROCUREMENT_STAGE_TO_SF_STAGE: Record<ProcurementStage, string> = {
  'pre-solicitation': 'Qualification',
  'rfp-open': 'Needs Analysis',
  'evaluation': 'Value Proposition',
  'awarded': 'Negotiation/Review',
  'execution': 'Negotiation/Review',
  'operational': 'Closed Won',
};

export const SF_STAGE_TO_GENESIS_STATUS: Record<string, GenesisStatus> = {
  'Qualification': 'contacted',
  'Needs Analysis': 'contacted',
  'Value Proposition': 'meeting',
  'Meeting Scheduled': 'meeting',
  'Proposal': 'proposal',
  'Proposal/Price Quote': 'proposal',
  'Negotiation': 'proposal',
  'Negotiation/Review': 'proposal',
  'Closed Won': 'closed',
  'Closed Lost': 'closed',
};

export const CONFIDENCE_TO_PROBABILITY: Record<string, number> = {
  confirmed: 75,
  likely: 50,
  speculative: 25,
};

export interface BuildJupiterLanguageInput {
  opportunity_id: string;
  title: string;
  entity: string;
  amount: number | null;
  close_date: string | null;
  win_probability: number;
  stage_name: string;
  genesis_pillar: string;
  sector?: string | null;
  urgency?: string | null;
  confidence?: string | null;
}

export function normalizeSalesforceStageToGenesisStatus(stageName: string | null | undefined): GenesisStatus | null {
  if (!stageName) return null;
  return SF_STAGE_TO_GENESIS_STATUS[stageName] || null;
}

export function deriveSalesforceStage(params: {
  procurementStage?: ProcurementStage | null;
  genesisStatus?: GenesisStatus | null;
}): string {
  if (params.procurementStage) return PROCUREMENT_STAGE_TO_SF_STAGE[params.procurementStage];
  if (params.genesisStatus) return GENESIS_STATUS_TO_SF_STAGE[params.genesisStatus];
  return 'Qualification';
}

export function defaultProbabilityFromConfidence(confidence?: string | null): number | null {
  if (!confidence) return null;
  const key = confidence.toLowerCase();
  return CONFIDENCE_TO_PROBABILITY[key] ?? null;
}

export function buildJupiterLanguage(input: BuildJupiterLanguageInput) {
  return {
    source_system: 'build-clock',
    source_record_id: input.opportunity_id,
    opportunity_name: input.title,
    account_name: input.entity,
    amount: input.amount,
    close_date: input.close_date,
    stage_name: input.stage_name,
    probability: input.win_probability,
    genesis_pillar: input.genesis_pillar,
    sector: input.sector || null,
    urgency: input.urgency || null,
    confidence: input.confidence || null,
  };
}
