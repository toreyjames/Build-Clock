// Agent Runner - Executes agent tasks using Claude API
// Each agent is a specialized Claude instance with context about its opportunity

import Anthropic from '@anthropic-ai/sdk';
import { AgentState, AgentFinding, AgentRecommendation, AgentMemory } from './types';
import { Opportunity } from '../types';

const anthropic = new Anthropic();

// System prompt for opportunity agents
function getAgentSystemPrompt(opportunity: Opportunity, memory: AgentMemory): string {
  return `You are an AI agent assigned to monitor and analyze a specific business opportunity for Deloitte's OT Cyber practice.

YOUR OPPORTUNITY:
- Title: ${opportunity.title}
- Entity: ${opportunity.entity}
- Value: $${opportunity.estimatedValue?.toLocaleString() || 'TBD'}
- Sector: ${opportunity.sector}
- Genesis Pillar: ${opportunity.genesisPillar}
- Current Stage: ${opportunity.procurementStage}
- Key Date: ${opportunity.keyDate || 'TBD'} - ${opportunity.keyDateDescription || ''}

OT SYSTEMS INVOLVED:
${opportunity.otSystems.join(', ')}

REGULATORY DRIVERS:
${opportunity.regulatoryDrivers.join(', ')}

YOUR MEMORY (what you've learned so far):
${memory.insights.slice(-5).map(i => `- ${i.date}: ${i.insight}`).join('\n') || 'No prior insights yet.'}

KEY STAKEHOLDERS YOU KNOW:
${memory.stakeholders.map(s => `- ${s.name} (${s.role} at ${s.company})`).join('\n') || 'None identified yet.'}

YOUR ROLE:
1. Monitor news, SEC filings, and federal procurement updates related to this opportunity
2. Track technical requirements and OT/ICS security needs
3. Identify key stakeholders and decision-makers
4. Watch competitor activity
5. Flag important deadlines and milestones
6. Recommend actions for the Deloitte team

When you find something important, structure your response as:
- FINDING: What you discovered
- SOURCE: Where you found it
- RELEVANCE: Why it matters (critical/high/medium/low)
- ACTION: What should be done

You should think like a business development professional who deeply understands both the technical OT/ICS security domain and the procurement/sales process.`;
}

// Run an agent's monitoring task
export async function runAgentMonitor(
  opportunity: Opportunity,
  currentState: AgentState
): Promise<{
  findings: AgentFinding[];
  recommendations: AgentRecommendation[];
  updatedMemory: Partial<AgentMemory>;
}> {
  const systemPrompt = getAgentSystemPrompt(opportunity, currentState.memory);

  const userPrompt = `Run your monitoring check for today (${new Date().toISOString().split('T')[0]}).

Search for:
1. Recent news about ${opportunity.entity} related to ${opportunity.title}
2. Any SEC filings if ${opportunity.entity} is public
3. Updates on SAM.gov if this is a federal opportunity
4. Competitor movements (${opportunity.competitors.slice(0, 3).join(', ')})
5. Technical developments in ${opportunity.otSystems.slice(0, 3).join(', ')} security

Based on what you find, provide:
1. Key findings (if any)
2. Updated timeline/deadline information
3. Recommended actions for this week
4. Any questions you need answered

Format your response as JSON:
{
  "findings": [
    {
      "type": "news|filing|rfp-update|deadline|competitor|technical|contact",
      "title": "Brief title",
      "summary": "What you found",
      "source": "Where you found it",
      "sourceUrl": "URL if available",
      "relevance": "critical|high|medium|low",
      "actionRequired": true/false
    }
  ],
  "recommendations": [
    {
      "priority": "urgent|high|medium|low",
      "action": "What to do",
      "rationale": "Why",
      "deadline": "YYYY-MM-DD if applicable"
    }
  ],
  "memoryUpdates": {
    "insights": ["New insight 1", "New insight 2"],
    "keyDates": [{"date": "YYYY-MM-DD", "description": "...", "source": "..."}],
    "stakeholders": [{"name": "...", "role": "...", "company": "..."}]
  },
  "questionsForCoordinator": ["Question 1", "Question 2"]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Transform findings
    const findings: AgentFinding[] = (result.findings || []).map((f: Record<string, unknown>, idx: number) => ({
      id: `finding-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString(),
      type: f.type as AgentFinding['type'],
      title: f.title as string,
      summary: f.summary as string,
      source: f.source as string,
      sourceUrl: (f.sourceUrl as string) || '',
      relevance: f.relevance as AgentFinding['relevance'],
      actionRequired: f.actionRequired as boolean,
    }));

    // Transform recommendations
    const recommendations: AgentRecommendation[] = (result.recommendations || []).map(
      (r: Record<string, unknown>, idx: number) => ({
        id: `rec-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
        priority: r.priority as AgentRecommendation['priority'],
        action: r.action as string,
        rationale: r.rationale as string,
        deadline: r.deadline as string | undefined,
        status: 'pending' as const,
      })
    );

    // Memory updates
    const memoryUpdates = result.memoryUpdates || {};
    const updatedMemory: Partial<AgentMemory> = {
      insights: [
        ...(memoryUpdates.insights || []).map((insight: string) => ({
          date: new Date().toISOString().split('T')[0],
          insight,
          source: 'agent-monitor',
        })),
      ],
      keyDates: memoryUpdates.keyDates || [],
      stakeholders: memoryUpdates.stakeholders || [],
      lastUpdated: new Date().toISOString(),
    };

    return { findings, recommendations, updatedMemory };
  } catch (error) {
    console.error('Agent monitor error:', error);
    return {
      findings: [],
      recommendations: [],
      updatedMemory: { lastUpdated: new Date().toISOString() },
    };
  }
}

// Coordinator agent - synthesizes across all opportunity agents
export async function runCoordinator(
  agentStates: AgentState[],
  opportunities: Opportunity[]
): Promise<{
  weeklyPriorities: { opportunityId: string; reason: string; urgency: string }[];
  crossCuttingInsights: { opportunityIds: string[]; insight: string; recommendation: string }[];
  agentInstructions: { agentId: string; instruction: string }[];
}> {
  const systemPrompt = `You are the Coordinator Agent for Deloitte's OT Cyber Genesis opportunity tracking system.

You oversee ${agentStates.length} opportunity agents, each monitoring a specific business opportunity.

YOUR ROLE:
1. Synthesize findings from all agents
2. Identify cross-cutting themes and synergies
3. Prioritize actions for the week
4. Coordinate between agents when opportunities are related
5. Escalate critical issues

Think strategically about the entire portfolio, not just individual opportunities.`;

  const agentSummaries = agentStates.map((agent) => {
    const opp = opportunities.find((o) => o.id === agent.opportunityId);
    return `
AGENT: ${agent.name} (${agent.opportunityId})
Opportunity: ${opp?.title || 'Unknown'}
Value: $${opp?.estimatedValue?.toLocaleString() || 'TBD'}
Status: ${agent.status}
Recent Findings: ${agent.findings.slice(-3).map((f) => f.title).join('; ') || 'None'}
Recommendations: ${agent.recommendations.filter((r) => r.status === 'pending').length} pending
`;
  }).join('\n---\n');

  const userPrompt = `Review all agent statuses and provide weekly coordination:

${agentSummaries}

Provide your analysis as JSON:
{
  "weeklyPriorities": [
    {"opportunityId": "...", "reason": "Why this is priority", "urgency": "critical|high|medium"}
  ],
  "crossCuttingInsights": [
    {"opportunityIds": ["id1", "id2"], "insight": "What connects them", "recommendation": "What to do"}
  ],
  "agentInstructions": [
    {"agentId": "...", "instruction": "Specific task for this agent"}
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Coordinator error:', error);
    return {
      weeklyPriorities: [],
      crossCuttingInsights: [],
      agentInstructions: [],
    };
  }
}
