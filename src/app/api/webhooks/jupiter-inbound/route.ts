import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logSyncActivity } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

// Map Salesforce stages to Genesis stages
const STAGE_MAP: Record<string, string> = {
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

/**
 * POST /api/webhooks/jupiter-inbound
 * Called by Power Automate when Jupiter (Salesforce) record changes
 *
 * Expected payload:
 * {
 *   "genesis_id": "palisades-restart",
 *   "salesforce_id": "006xxxxx",
 *   "stage": "Proposal",
 *   "amount": 28000000,
 *   "close_date": "2026-04-01",
 *   "owner_name": "Tom Bradley",
 *   "probability": 50
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      genesis_id,
      salesforce_id,
      stage,
      amount,
      close_date,
      owner_name,
      probability,
    } = body;

    // Validate required fields
    if (!genesis_id || !salesforce_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: genesis_id, salesforce_id',
        },
        { status: 400 }
      );
    }

    // Map Salesforce stage to Genesis status
    const mappedStatus = STAGE_MAP[stage] || null;

    // Log the inbound sync
    await logSyncActivity(
      genesis_id,
      'from_jupiter',
      'success',
      {
        salesforce_id,
        stage,
        mapped_status: mappedStatus,
        amount,
        close_date,
        owner_name,
        probability,
        received_at: new Date().toISOString(),
      },
      salesforce_id
    );

    // Update opportunity tracking in Genesis
    try {
      const { data: existing } = await supabase
        .from('opportunity_tracking')
        .select('*')
        .eq('opportunity_id', genesis_id)
        .single();

      const activityEntry = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'jupiter-update',
        details: `Updated from Jupiter: Stage=${stage}${amount ? `, Amount=${amount}` : ''}`,
      };

      if (existing) {
        const updates: Record<string, unknown> = {
          salesforce_id,
          salesforce_synced_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          activity: [...(existing.activity || []), activityEntry],
        };

        // Only update status if we have a valid mapping and it's different
        if (mappedStatus && existing.status !== mappedStatus) {
          updates.status = mappedStatus;
          activityEntry.details = `Status changed to ${mappedStatus} (from Jupiter stage: ${stage})`;
        }

        // Update pursuit_lead if owner changed
        if (owner_name) {
          updates.pursuit_lead = owner_name;
        }

        // Update win_probability if provided
        if (probability !== undefined) {
          updates.win_probability = probability;
        }

        await supabase
          .from('opportunity_tracking')
          .update(updates)
          .eq('opportunity_id', genesis_id);
      } else {
        // Create new tracking record
        await supabase
          .from('opportunity_tracking')
          .insert({
            opportunity_id: genesis_id,
            status: mappedStatus || 'contacted',
            notes: '',
            salesforce_id,
            salesforce_synced_at: new Date().toISOString(),
            pursuit_lead: owner_name,
            win_probability: probability,
            last_updated: new Date().toISOString(),
            activity: [activityEntry],
          });
      }
    } catch (dbError) {
      console.error('Error updating opportunity_tracking:', dbError);
      // Continue - log was successful
    }

    return NextResponse.json({
      success: true,
      message: 'Jupiter update received and processed',
      data: {
        genesis_id,
        salesforce_id,
        mapped_status: mappedStatus,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error processing jupiter-inbound webhook:', error);
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
 * GET /api/webhooks/jupiter-inbound
 * Returns information about this endpoint for documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhooks/jupiter-inbound',
    method: 'POST',
    description: 'Receive updates from Power Automate when Jupiter (Salesforce) record changes',
    payload_schema: {
      genesis_id: 'string (required) - Genesis opportunity ID',
      salesforce_id: 'string (required) - Salesforce record ID',
      stage: 'string (optional) - Salesforce stage name',
      amount: 'number (optional) - Updated deal amount',
      close_date: 'string (optional) - Updated close date',
      owner_name: 'string (optional) - Opportunity owner name',
      probability: 'number (optional) - Win probability percentage',
    },
    stage_mapping: STAGE_MAP,
    example_payload: {
      genesis_id: 'palisades-restart',
      salesforce_id: '006xxxxxxxxxxxx',
      stage: 'Proposal',
      amount: 28000000,
      close_date: '2026-04-01',
      owner_name: 'Tom Bradley',
      probability: 50,
    },
    response: {
      success: true,
      message: 'Jupiter update received and processed',
      data: {
        genesis_id: 'palisades-restart',
        salesforce_id: '006xxxxxxxxxxxx',
        mapped_status: 'proposal',
        updated_at: '2026-02-22T10:00:00Z',
      },
    },
  });
}
