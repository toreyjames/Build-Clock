import { NextRequest, NextResponse } from 'next/server';

// ============================================
// WEBHOOK API: /api/webhooks
// Subscribe to events, manage integrations
// ============================================

export const dynamic = 'force-dynamic';

interface WebhookSubscription {
  id: string;
  name: string;
  callback_url: string;
  events: string[];
  filters?: {
    sectors?: string[];
    min_value?: number;
    priority?: string[];
  };
  secret?: string;
  status: 'active' | 'paused' | 'failed';
  created_at: string;
  last_triggered?: string;
  failure_count: number;
}

// Event types available for subscription
const AVAILABLE_EVENTS = [
  // Opportunity events
  'opportunity.created',
  'opportunity.updated',
  'opportunity.status_changed',
  'opportunity.deadline_approaching',    // 7 days before deadline
  'opportunity.deadline_imminent',       // 24 hours before deadline
  'opportunity.value_changed',

  // Insight events
  'insight.created',
  'insight.deadline_approaching',

  // Sector events
  'sector.status_changed',
  'sector.milestone_approaching',
  'sector.blocker_added',
  'sector.blocker_resolved',

  // Agent events
  'agent.alert_raised',
  'agent.finding_created',
  'agent.action_completed',

  // System events
  'briefing.generated',
  'action.completed',
  'action.failed',
];

// In-memory webhook storage (would be database in production)
const SUBSCRIPTIONS: WebhookSubscription[] = [
  {
    id: 'webhook_slack_deals',
    name: 'Slack - OT Cyber Deals',
    callback_url: 'https://hooks.slack.com/services/EXAMPLE',
    events: ['opportunity.created', 'opportunity.deadline_approaching'],
    filters: { min_value: 5000000 },
    status: 'active',
    created_at: '2026-02-01T00:00:00Z',
    last_triggered: '2026-02-22T08:00:00Z',
    failure_count: 0,
  },
  {
    id: 'webhook_teams_regulatory',
    name: 'Teams - Regulatory Updates',
    callback_url: 'https://outlook.office.com/webhook/EXAMPLE',
    events: ['insight.created', 'sector.milestone_approaching'],
    filters: { sectors: ['power', 'energy-systems'] },
    status: 'active',
    created_at: '2026-02-01T00:00:00Z',
    failure_count: 0,
  },
  {
    id: 'webhook_crm_sync',
    name: 'Salesforce Sync',
    callback_url: 'https://your-org.salesforce.com/services/apexrest/genesis',
    events: ['opportunity.status_changed', 'opportunity.value_changed'],
    status: 'active',
    created_at: '2026-02-01T00:00:00Z',
    failure_count: 0,
  },
];

// Sample webhook payload structures
const PAYLOAD_EXAMPLES = {
  'opportunity.deadline_approaching': {
    event: 'opportunity.deadline_approaching',
    timestamp: '2026-02-22T10:00:00Z',
    data: {
      opportunity: {
        id: 'palisades-restart',
        title: 'Palisades Nuclear Restart',
        deadline: '2026-02-24',
        days_remaining: 2,
        estimated_value: 25000000,
        sector: 'power',
      },
      action_required: 'Submit capability statement',
      urgency: 'high',
    },
    _links: {
      opportunity: '/api/v1/opportunities?id=palisades-restart',
    },
  },
  'agent.alert_raised': {
    event: 'agent.alert_raised',
    timestamp: '2026-02-22T10:00:00Z',
    data: {
      agent: {
        id: 'agent_power',
        name: 'Power & Grid Agent',
      },
      alert: {
        id: 'alert_001',
        priority: 'high',
        message: 'FERC interconnection rule comment period closes in 14 days',
        action: 'Prepare client advisory',
      },
      affected_opportunities: ['ferc-advisory', 'stargate-phase1'],
    },
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const event = searchParams.get('event');

  let filtered = [...SUBSCRIPTIONS];

  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  if (event) {
    filtered = filtered.filter(s => s.events.includes(event));
  }

  return NextResponse.json({
    success: true,
    data: {
      subscriptions: filtered,
      available_events: AVAILABLE_EVENTS,
    },
    stats: {
      total: SUBSCRIPTIONS.length,
      active: SUBSCRIPTIONS.filter(s => s.status === 'active').length,
      paused: SUBSCRIPTIONS.filter(s => s.status === 'paused').length,
      failed: SUBSCRIPTIONS.filter(s => s.status === 'failed').length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    _links: {
      self: '/api/webhooks',
      create: '/api/webhooks (POST)',
      test: '/api/webhooks/test (POST)',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      callback_url,
      events,
      filters = {},
      secret,
    } = body;

    // Validate required fields
    if (!callback_url) {
      return NextResponse.json({
        success: false,
        error: 'callback_url is required',
      }, { status: 400 });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'events array is required',
        available_events: AVAILABLE_EVENTS,
      }, { status: 400 });
    }

    // Validate events
    const invalidEvents = events.filter(e => !AVAILABLE_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid events: ${invalidEvents.join(', ')}`,
        available_events: AVAILABLE_EVENTS,
      }, { status: 400 });
    }

    const subscription: WebhookSubscription = {
      id: `webhook_${Date.now()}`,
      name: name || 'Unnamed Webhook',
      callback_url,
      events,
      filters,
      secret,
      status: 'active',
      created_at: new Date().toISOString(),
      failure_count: 0,
    };

    // In production, this would persist to database
    SUBSCRIPTIONS.push(subscription);

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Webhook subscription created',
      payload_examples: events.reduce((acc, event) => {
        if (PAYLOAD_EXAMPLES[event as keyof typeof PAYLOAD_EXAMPLES]) {
          acc[event] = PAYLOAD_EXAMPLES[event as keyof typeof PAYLOAD_EXAMPLES];
        }
        return acc;
      }, {} as Record<string, unknown>),
      _links: {
        self: `/api/webhooks/${subscription.id}`,
        test: `/api/webhooks/${subscription.id}/test`,
        delete: `/api/webhooks/${subscription.id} (DELETE)`,
      },
    }, { status: 201 });

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON body',
    }, { status: 400 });
  }
}
