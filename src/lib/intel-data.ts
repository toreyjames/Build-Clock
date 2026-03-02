import { ENERGY_DEMAND_PROJECTS } from "@/lib/energy-demand-data";
import type { EnergyDemandProject } from "@/lib/energy-demand-types";
import { OPPORTUNITIES } from "@/lib/opportunities-data";
import type { Opportunity } from "@/lib/types";
import type {
  IntelEvent,
  IntelProject,
  LiveStream,
  ProjectLifecycleStatus,
  StatusHistoryEntry,
} from "@/lib/intel-types";

const SECTOR_TO_CATEGORY: Record<string, string> = {
  "data-centers": "data-center",
  semiconductors: "semiconductor",
  manufacturing: "manufacturing",
};

const DEFAULT_LIVE_STREAMS: Record<string, LiveStream[]> = {
  // Seed empty by default; verified public streams can be added per project via API + Supabase.
};

function toLifecycleFromStage(stage: Opportunity["procurementStage"]): ProjectLifecycleStatus {
  if (stage === "operational") return "operational";
  if (stage === "execution" || stage === "awarded") return "in_progress";
  if (stage === "evaluation") return "planning";
  if (stage === "rfp-open" || stage === "pre-solicitation") return "planning";
  return "planning";
}

function toLifecycleFromDemandStatus(status: EnergyDemandProject["status"]): ProjectLifecycleStatus {
  if (status === "operational") return "operational";
  if (status === "under-construction") return "in_progress";
  if (status === "approved" || status === "planning" || status === "announced") return "planning";
  if (status === "cancelled") return "cancelled";
  return "planning";
}

function mergeLifecycle(
  stageStatus: ProjectLifecycleStatus,
  demandStatuses: ProjectLifecycleStatus[],
): ProjectLifecycleStatus {
  if (demandStatuses.includes("cancelled")) return "cancelled";
  if (demandStatuses.includes("operational") || stageStatus === "operational") return "operational";
  if (demandStatuses.includes("in_progress") || stageStatus === "in_progress") return "in_progress";
  return stageStatus;
}

function findRelatedSites(opportunity: Opportunity): EnergyDemandProject[] {
  const explicit = ENERGY_DEMAND_PROJECTS.filter((site) =>
    site.opportunityIds?.includes(opportunity.id),
  );
  if (explicit.length > 0) return explicit;

  const desiredCategory = SECTOR_TO_CATEGORY[opportunity.sector];
  const sameState = ENERGY_DEMAND_PROJECTS.filter((site) => site.state === opportunity.state);
  const sameCategory = desiredCategory
    ? sameState.filter((site) => site.category === desiredCategory)
    : sameState;

  if (sameCategory.length > 0) return sameCategory.slice(0, 5);
  return sameState.slice(0, 5);
}

function computeForecast(
  lifecycleStatus: ProjectLifecycleStatus,
  opportunity: Opportunity,
): IntelProject["forecast"] {
  const confidenceScore =
    opportunity.confidence === "confirmed" ? 82 : opportunity.confidence === "likely" ? 64 : 44;
  const urgencyPenalty =
    opportunity.urgency === "this-week" ? 0 : opportunity.urgency === "this-month" ? 5 : 12;

  let delayRiskScore = 30 + urgencyPenalty;
  if (opportunity.procurementStage === "pre-solicitation") delayRiskScore += 20;
  if (opportunity.procurementStage === "rfp-open") delayRiskScore += 10;
  if (opportunity.procurementStage === "execution") delayRiskScore -= 8;
  if (opportunity.confidence === "speculative") delayRiskScore += 15;
  delayRiskScore = Math.min(95, Math.max(5, delayRiskScore));

  const status30d = lifecycleStatus;
  const status90d =
    lifecycleStatus === "planning" && delayRiskScore < 50 ? "in_progress" : lifecycleStatus;
  const status180d =
    status90d === "in_progress" && delayRiskScore < 45 ? "operational" : status90d;

  const completionWindow = opportunity.responseDeadline
    ? `${opportunity.responseDeadline} to ${opportunity.keyDate ?? "TBD"}`
    : opportunity.keyDate
      ? `${opportunity.keyDate} to +6 months`
      : "TBD";

  const drivers = [
    `Procurement stage: ${opportunity.procurementStage}`,
    `Urgency: ${opportunity.urgency}`,
    `Confidence: ${opportunity.confidence}`,
  ];

  return {
    status30d,
    status90d,
    status180d,
    completionWindow,
    delayRiskScore,
    confidenceScore,
    drivers,
  };
}

function classifyEventType(sourceTitle: string): IntelEvent["type"] {
  const s = sourceTitle.toLowerCase();
  if (s.includes("permit") || s.includes("nrc") || s.includes("ferc")) return "permit";
  if (s.includes("award") || s.includes("rfp") || s.includes("foa")) return "procurement";
  if (s.includes("grid") || s.includes("interconnection")) return "grid";
  if (s.includes("announcement") || s.includes("investor")) return "press-release";
  return "news";
}

function classifyImpact(opportunity: Opportunity): IntelEvent["impact"] {
  if (opportunity.confidence === "confirmed") return "positive";
  if (opportunity.confidence === "likely") return "neutral";
  return "negative";
}

function toEvents(projectId: string, opportunity: Opportunity): IntelEvent[] {
  return opportunity.sources.map((source, index) => ({
    id: `${projectId}-evt-${index + 1}`,
    projectId,
    timestamp: source.date,
    type: classifyEventType(source.title),
    impact: classifyImpact(opportunity),
    source: source.title,
    title: source.title,
    summary: `${opportunity.entity}: ${opportunity.title}`,
    url: source.url,
    tags: [opportunity.sector, opportunity.genesisPillar, opportunity.state],
  }));
}

export function getIntelProjects(): IntelProject[] {
  return OPPORTUNITIES.map((opportunity) => {
    const relatedSites = findRelatedSites(opportunity);
    const stageStatus = toLifecycleFromStage(opportunity.procurementStage);
    const demandStatuses = relatedSites.map((site) => toLifecycleFromDemandStatus(site.status));
    const lifecycleStatus = mergeLifecycle(stageStatus, demandStatuses);
    const forecast = computeForecast(lifecycleStatus, opportunity);
    const events = toEvents(opportunity.id, opportunity);

    const liveStreams = DEFAULT_LIVE_STREAMS[opportunity.id] ?? [];
    const statusHistory: StatusHistoryEntry[] = [];

    return {
      projectId: opportunity.id,
      opportunityId: opportunity.id,
      title: opportunity.title,
      entity: opportunity.entity,
      state: opportunity.state,
      sector: opportunity.sector,
      opportunityStage: opportunity.procurementStage,
      lifecycleStatus,
      estimatedValue: opportunity.estimatedValue,
      forecast,
      relatedSites: relatedSites.map((site) => ({
        id: site.id,
        name: site.name,
        status: site.status,
        state: site.state,
        gridRegion: site.gridRegion,
        powerMW: site.powerMW,
        coordinates: site.coordinates,
      })),
      evidence: opportunity.sources,
      liveStreams,
      statusHistory,
      lastEventAt: events[0]?.timestamp ?? opportunity.lastUpdated,
      coordinates: relatedSites.find((site) => site.coordinates)?.coordinates,
    };
  });
}

export function getIntelEvents(projectId?: string): IntelEvent[] {
  const allEvents = OPPORTUNITIES.flatMap((opportunity) => toEvents(opportunity.id, opportunity));
  const filtered = projectId ? allEvents.filter((event) => event.projectId === projectId) : allEvents;
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
