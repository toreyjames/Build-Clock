import { NextRequest, NextResponse } from 'next/server';
import { OPPORTUNITIES } from '@/lib/opportunities-data';

// ============================================
// PUBLIC API: /api/v1/opportunities
// RESTful endpoint for external integrations
// ============================================

export const dynamic = 'force-dynamic';

interface APIResponse<T> {
  success: boolean;
  data: T;
  meta: {
    total: number;
    filtered: number;
    timestamp: string;
    version: string;
  };
  _links: {
    self: string;
    docs: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Query parameters
  const pillar = searchParams.get('pillar');
  const status = searchParams.get('status');
  const urgency = searchParams.get('urgency');
  const minValue = searchParams.get('min_value');
  const maxValue = searchParams.get('max_value');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  const fields = searchParams.get('fields')?.split(',');

  let filtered = [...OPPORTUNITIES];

  // Apply filters
  if (pillar) {
    filtered = filtered.filter(o => o.genesisPillar === pillar);
  }
  if (status) {
    filtered = filtered.filter(o => o.procurementStage === status);
  }
  if (urgency) {
    filtered = filtered.filter(o => o.urgency === urgency);
  }
  if (minValue) {
    filtered = filtered.filter(o => (o.estimatedValue || 0) >= parseInt(minValue));
  }
  if (maxValue) {
    filtered = filtered.filter(o => (o.estimatedValue || 0) <= parseInt(maxValue));
  }

  const total = OPPORTUNITIES.length;
  const filteredCount = filtered.length;

  // Pagination
  filtered = filtered.slice(offset, offset + limit);

  // Field selection (if specified)
  let result: unknown[] = filtered;
  if (fields && fields.length > 0) {
    result = filtered.map(o => {
      const selected: Record<string, unknown> = { id: o.id };
      fields.forEach(f => {
        if (f in o) {
          selected[f] = o[f as keyof typeof o];
        }
      });
      return selected;
    });
  }

  const response: APIResponse<typeof result> = {
    success: true,
    data: result,
    meta: {
      total,
      filtered: filteredCount,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
    _links: {
      self: '/api/v1/opportunities',
      docs: '/api/v1/docs',
    },
  };

  return NextResponse.json(response, {
    headers: {
      'X-API-Version': '1.0.0',
      'X-Total-Count': total.toString(),
      'X-Filtered-Count': filteredCount.toString(),
    },
  });
}

// POST: Create webhook subscription for opportunity events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate webhook subscription request
    if (body.type === 'webhook_subscription') {
      const { callback_url, events, filters } = body;

      if (!callback_url) {
        return NextResponse.json({
          success: false,
          error: 'callback_url is required',
        }, { status: 400 });
      }

      // In production, this would store in database
      const subscription = {
        id: `webhook_${Date.now()}`,
        callback_url,
        events: events || ['opportunity.created', 'opportunity.updated', 'opportunity.deadline_approaching'],
        filters: filters || {},
        created_at: new Date().toISOString(),
        status: 'active',
      };

      return NextResponse.json({
        success: true,
        data: subscription,
        message: 'Webhook subscription created. You will receive POST requests to your callback URL when events occur.',
      }, { status: 201 });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid request type',
    }, { status: 400 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON body',
    }, { status: 400 });
  }
}
