export type ProjectLifecycleStatus =
  | "planning"
  | "in_progress"
  | "operational"
  | "delayed"
  | "paused"
  | "cancelled";

export type IntelSignalType =
  | "press-release"
  | "news"
  | "permit"
  | "procurement"
  | "grid"
  | "video";

export interface RelatedSite {
  id: string;
  name: string;
  status: string;
  state: string;
  gridRegion: string;
  powerMW: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ForecastSlice {
  status30d: ProjectLifecycleStatus;
  status90d: ProjectLifecycleStatus;
  status180d: ProjectLifecycleStatus;
  completionWindow: string;
  delayRiskScore: number;
  confidenceScore: number;
  drivers: string[];
}

export interface IntelEvent {
  id: string;
  projectId: string;
  timestamp: string;
  type: IntelSignalType;
  impact: "positive" | "neutral" | "negative";
  source: string;
  title: string;
  summary: string;
  url: string;
  tags: string[];
}

export interface LiveStream {
  id: string;
  projectId: string;
  title: string;
  provider: string;
  streamUrl: string;
  verified: boolean;
  coverageScope: string;
  lastVerifiedAt: string | null;
}

export interface StatusHistoryEntry {
  id: string;
  projectId: string;
  fromStatus: ProjectLifecycleStatus | null;
  toStatus: ProjectLifecycleStatus;
  reason: string;
  evidenceUrl?: string | null;
  changedAt: string;
}

export interface IntelProject {
  projectId: string;
  opportunityId: string;
  title: string;
  entity: string;
  state: string;
  sector: string;
  opportunityStage: string;
  lifecycleStatus: ProjectLifecycleStatus;
  estimatedValue: number | null;
  forecast: ForecastSlice;
  relatedSites: RelatedSite[];
  evidence: {
    title: string;
    url: string;
    date: string;
  }[];
  liveStreams: LiveStream[];
  statusHistory: StatusHistoryEntry[];
  lastEventAt: string | null;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
