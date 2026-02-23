import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logSyncActivity } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/jupiter-confirm
 * Called by Power Automate after Jupiter (Salesforce) creation succeeds
 *
 * Expected payload:
 * {
 *   "genesis_id": "palisades-restart",
 *   "salesforce_id": "006xxxxx",
 *   "status": "success" | "error",
 *   "error_message": "optional error details"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { genesis_id, salesforce_id, status, error_message } = body;

    // Validate required fields
    if (!genesis_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: genesis_id',
        },
        { status: 400 }
      );
    }

    if (!status || !['success', 'error'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid status field. Must be "success" or "error"',
        },
        { status: 400 }
      );
    }

    // Log the sync confirmation
    await logSyncActivity(
      genesis_id,
      'to_jupiter',
      status,
      {
        salesforce_id,
        error_message,
        confirmed_at: new Date().toISOString(),
      },
      salesforce_id
    );

    if (status === 'success' && salesforce_id) {
      // Update opportunity tracking with Salesforce ID
      try {
        // First, check if tracking record exists
        const { data: existing } = await supabase
          .from('opportunity_tracking')
          .select('*')
          .eq('opportunity_id', genesis_id)
          .single();

        if (existing) {
          // Update existing record
          await supabase
            .from('opportunity_tracking')
            .update({
              salesforce_id,
              salesforce_synced_at: new Date().toISOString(),
              last_updated: new Date().toISOString(),
            })
            .eq('opportunity_id', genesis_id);
        } else {
          // Create new tracking record with Salesforce data
          await supabase
            .from('opportunity_tracking')
            .insert({
              opportunity_id: genesis_id,
              status: 'on-radar',
              notes: '',
              salesforce_id,
              salesforce_synced_at: new Date().toISOString(),
              last_updated: new Date().toISOString(),
              activity: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  type: 'jupiter-sync',
                  details: `Synced to Jupiter (Salesforce ID: ${salesforce_id})`,
                },
              ],
            });
        }
      } catch (dbError) {
        console.error('Error updating opportunity_tracking:', dbError);
        // Don't fail the webhook - the sync was successful on Salesforce side
      }

      return NextResponse.json({
        success: true,
        message: 'Jupiter sync confirmed successfully',
        data: {
          genesis_id,
          salesforce_id,
          synced_at: new Date().toISOString(),
        },
      });
    } else {
      // Log error but still return success (we received the webhook)
      console.error(`Jupiter sync failed for ${genesis_id}:`, error_message);

      return NextResponse.json({
        success: true,
        message: 'Jupiter sync error logged',
        data: {
          genesis_id,
          status: 'error',
          error_message,
        },
      });
    }
  } catch (error) {
    console.error('Error processing jupiter-confirm webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/jupiter-confirm
 * Returns information about this endpoint for documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/jupiter-confirm',
    method: 'POST',
    description: 'Receive sync confirmation from Power Automate after Jupiter (Salesforce) creation',
    payload_schema: {
      genesis_id: 'string (required) - Genesis opportunity ID',
      salesforce_id: 'string (required for success) - Salesforce record ID',
      status: '"success" | "error" (required)',
      error_message: 'string (optional) - Error details if status is "error"',
    },
    example_payload: {
      genesis_id: 'palisades-restart',
      salesforce_id: '006xxxxxxxxxxxx',
      status: 'success',
    },
    response: {
      success: true,
      message: 'Jupiter sync confirmed successfully',
      data: {
        genesis_id: 'palisades-restart',
        salesforce_id: '006xxxxxxxxxxxx',
        synced_at: '2026-02-22T10:00:00Z',
      },
    },
  });
}
