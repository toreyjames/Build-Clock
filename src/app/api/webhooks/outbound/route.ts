import { NextResponse } from 'next/server';
import {
  getWebhookSubscriptions,
  createWebhookSubscription,
  deleteWebhookSubscription,
  fireWebhook,
  WebhookEventType,
  WEBHOOK_EVENT_SCHEMAS,
} from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

/**
 * GET /api/webhooks/outbound
 * List all webhook subscriptions and available events
 */
export async function GET() {
  try {
    const subscriptions = await getWebhookSubscriptions();

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        available_events: Object.entries(WEBHOOK_EVENT_SCHEMAS).map(([event, schema]) => ({
          event,
          description: schema.description,
          payload_schema: schema.payload,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching webhook subscriptions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webhook subscriptions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks/outbound
 * Create a new webhook subscription or fire a test webhook
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // If action is 'test', fire a test webhook
    if (body.action === 'test') {
      const { event, callback_url } = body;

      if (!event || !callback_url) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing event or callback_url for test',
          },
          { status: 400 }
        );
      }

      // Fire a test webhook
      const testPayload = {
        test: true,
        message: 'This is a test webhook from Genesis',
        event_type: event,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(callback_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Genesis-Event': event,
            'X-Genesis-Test': 'true',
          },
          body: JSON.stringify(testPayload),
        });

        return NextResponse.json({
          success: response.ok,
          data: {
            status_code: response.status,
            message: response.ok
              ? 'Test webhook delivered successfully'
              : 'Test webhook delivery failed',
          },
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to deliver test webhook',
          details: String(error),
        });
      }
    }

    // Otherwise, create a subscription
    const { event, callback_url, filters, enabled = true } = body;

    if (!event || !callback_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: event, callback_url',
        },
        { status: 400 }
      );
    }

    // Validate event type
    const validEvents = Object.keys(WEBHOOK_EVENT_SCHEMAS);
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event type. Valid events: ${validEvents.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const subscription = await createWebhookSubscription({
      event: event as WebhookEventType,
      callback_url,
      filters,
      enabled,
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create webhook subscription. Make sure the webhook_subscriptions table exists.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription,
      message: 'Webhook subscription created successfully',
    });
  } catch (error) {
    console.error('Error creating webhook subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create webhook subscription',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/webhooks/outbound
 * Delete a webhook subscription
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing subscription id',
        },
        { status: 400 }
      );
    }

    const deleted = await deleteWebhookSubscription(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete webhook subscription',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook subscription deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting webhook subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete webhook subscription',
      },
      { status: 500 }
    );
  }
}
