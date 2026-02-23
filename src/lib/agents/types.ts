// Agent System Types
// Each opportunity gets a dedicated agent that monitors, analyzes, and reports

export interface AgentState {
  id: string;
  opportunityId: string;
  name: string;
  status: 'idle' | 'working' | 'waiting' | 'error';
  lastRun: string | null;
  nextScheduledRun: string | null;

  // What the agent knows
  memory: AgentMemory;

  // What the agent has found
  findings: AgentFinding[];

  // Actions the agent recommends
  recommendations: AgentRecommendation[];

  // Messages to/from other agents
  messages: AgentMessage[];
}

export interface AgentMemory {
  // Core context about the opportunity
  opportunityContext: string;

  // Technical understanding
  technicalNotes: string[];
  otSystems: string[];
  securityRequirements: string[];

  // PM understanding
  keyDates: { date: string; description: string; source: string }[];
  stakeholders: { name: string; role: string; company: string; lastContact?: string }[];
  competitors: string[];

  // What we've learned over time
  insights: { date: string; insight: string; source: string }[];

  // Last known state
  lastKnownStatus: string;
  lastUpdated: string;
}

export interface AgentFinding {
  id: string;
  timestamp: string;
  type: 'news' | 'filing' | 'rfp-update' | 'deadline' | 'competitor' | 'technical' | 'contact';
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  relevance: 'critical' | 'high' | 'medium' | 'low';
  actionRequired: boolean;
  relatedOpportunities?: string[]; // Other opportunities this affects
}

export interface AgentRecommendation {
  id: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  deadline?: string;
  owner?: string;
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  from: string; // Agent ID
  to: string; // Agent ID or 'coordinator' or 'all'
  type: 'info' | 'question' | 'alert' | 'handoff';
  subject: string;
  content: string;
  requiresResponse: boolean;
  responded: boolean;
}

// Coordinator state - oversees all agents
export interface CoordinatorState {
  lastRun: string;
  activeAgents: number;

  // Cross-cutting priorities
  weeklyPriorities: {
    opportunityId: string;
    reason: string;
    urgency: 'critical' | 'high' | 'medium';
  }[];

  // Conflicts or synergies between opportunities
  crossCuttingInsights: {
    opportunityIds: string[];
    insight: string;
    recommendation: string;
  }[];

  // Escalations from agents
  escalations: {
    agentId: string;
    issue: string;
    timestamp: string;
    resolved: boolean;
  }[];
}

// Agent capabilities - what each agent can do
export type AgentCapability =
  | 'search-news'
  | 'search-sec'
  | 'search-sam'
  | 'analyze-technical'
  | 'track-deadlines'
  | 'identify-stakeholders'
  | 'competitive-analysis'
  | 'generate-report';

// Agent task - what we ask an agent to do
export interface AgentTask {
  id: string;
  agentId: string;
  type: 'monitor' | 'research' | 'analyze' | 'report' | 'coordinate';
  description: string;
  capabilities: AgentCapability[];
  deadline?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
}
