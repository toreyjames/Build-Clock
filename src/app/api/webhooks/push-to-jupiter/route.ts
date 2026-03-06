import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  fireWebhook,
  logSyncActivity,
  checkJupiterDuplicates,
  PushToJupiterPayload,
} from '@/lib/webhooks';
import { GenesisPillar, OTSystem, RegulatoryDriver, ProcurementStage, Urgency } from '@/lib/types';
import { buildJupiterLanguage, defaultProbabilityFromConfidence, deriveSalesforceStage } from '@/lib/jupiter-language';

export const dynamic = 'force-dynamic';

interface PushToJupiterRequest {
  opportunity_id: string;
  title: string;
  entity: string;
  amount: number | null;
  close_date: string | null;
  description: string;
  pursuit_lead: string;
  win_probability: number;
  genesis_pillar: GenesisPillar;
  ot_systems: OTSystem[];
  regulatory_drivers: RegulatoryDriver[];
  procurement_stage?: ProcurementStage;
  urgency?: Urgency;
  sector?: string;
  confidence?: 'confirmed' | 'likely' | 'speculative';
}

/**
 * POST /api/webhooks/push-to-jupiter
 * Called by Genesis UI to push an opportunity to Jupiter (Salesforce)
 */
export async function POST(request: Request) {
  try {
    const body: PushToJupiterRequest = await request.json();

    // Validate required fields
    const requiredFields = ['opportunity_id', 'title', 'entity', 'pursuit_lead', 'win_probability'];
    const missingFields = requiredFields.filter((field) => !body[field as keyof PushToJupiterRequest]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const computedDefault = defaultProbabilityFromConfidence(body.confidence);
    const effectiveWinProbability = body.win_probability ?? computedDefault ?? 50;

    // Validate win_probability
    const validProbabilities = [10, 25, 50, 75, 90];
    if (!validProbabilities.includes(effectiveWinProbability)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid win_probability. Must be one of: ${validProbabilities.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const genesisUrl = `https://usbuildclock.vercel.app/radar?id=${body.opportunity_id}`;
    const salesforceStage = deriveSalesforceStage({
      procurementStage: body.procurement_stage || null,
      genesisStatus: null,
    });

    // Build the webhook payload
    const payload: PushToJupiterPayload = {
      opportunity: {
        id: body.opportunity_id,
        title: body.title,
        entity: body.entity,
        amount: body.amount,
        close_date: body.close_date,
        stage: salesforceStage,
        description: body.description || '',
        pursuit_lead: body.pursuit_lead,
        win_probability: effectiveWinProbability,
        genesis_url: genesisUrl,
        genesis_pillar: body.genesis_pillar,
        ot_systems: body.ot_systems || [],
        regulatory_drivers: body.regulatory_drivers || [],
        crm_language: buildJupiterLanguage({
          opportunity_id: body.opportunity_id,
          title: body.title,
          entity: body.entity,
          amount: body.amount,
          close_date: body.close_date,
          win_probability: effectiveWinProbability,
          stage_name: salesforceStage,
          genesis_pillar: body.genesis_pillar,
          sector: body.sector || null,
          urgency: body.urgency || null,
          confidence: body.confidence || null,
        }),
      },
    };

    // Log the sync attempt
    await logSyncActivity(body.opportunity_id, 'to_jupiter', 'pending', {
      payload,
      initiated_at: new Date().toISOString(),
      pursuit_lead: body.pursuit_lead,
      salesforce_stage: salesforceStage,
    });

    // Update opportunity_tracking with pursuit lead and win probability
    try {
      const { data: existing } = await supabase
        .from('opportunity_tracking')
        .select('*')
        .eq('opportunity_id', body.opportunity_id)
        .single();

      const activityEntry = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'jupiter-push',
        details: `Pushed to Jupiter by ${body.pursuit_lead} (${body.win_probability}% probability)`,
      };

      if (existing) {
        await supabase
          .from('opportunity_tracking')
          .update({
            pursuit_lead: body.pursuit_lead,
            win_probability: effectiveWinProbability,
            jupiter_push_pending: true,
            last_updated: new Date().toISOString(),
            activity: [...(existing.activity || []), activityEntry],
          })
          .eq('opportunity_id', body.opportunity_id);
      } else {
        await supabase
          .from('opportunity_tracking')
          .insert({
            opportunity_id: body.opportunity_id,
            status: 'contacted', // Move to contacted when pushing to Jupiter
            notes: '',
            pursuit_lead: body.pursuit_lead,
            win_probability: effectiveWinProbability,
            jupiter_push_pending: true,
            last_updated: new Date().toISOString(),
            activity: [activityEntry],
          });
      }
    } catch (dbError) {
      console.error('Error updating opportunity_tracking:', dbError);
      // Continue with webhook fire even if tracking update fails
    }

    // Fire the webhook to all subscribers
    const result = await fireWebhook('opportunity.push_to_jupiter', payload);

    // Log the result
    await logSyncActivity(
      body.opportunity_id,
      'to_jupiter',
      result.success ? 'success' : 'error',
      {
        webhook_results: result.results,
        completed_at: new Date().toISOString(),
      }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Opportunity pushed to Jupiter successfully',
        data: {
          opportunity_id: body.opportunity_id,
          webhooks_fired: result.results.length,
          pursuit_lead: body.pursuit_lead,
          win_probability: effectiveWinProbability,
        },
      });
    } else if (result.results.length === 0) {
      // No webhooks configured - still successful from Genesis side
      return NextResponse.json({
        success: true,
        message: 'Push to Jupiter recorded. Configure Power Automate webhook to complete integration.',
        data: {
          opportunity_id: body.opportunity_id,
          webhooks_configured: false,
          note: 'Create a webhook subscription at /api/webhooks/outbound to receive push events',
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Some webhook deliveries failed',
          data: {
            results: result.results,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error pushing to Jupiter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to push to Jupiter',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/push-to-jupiter?entity=X&title=Y
 * Check for potential duplicates in Jupiter before pushing
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const title = searchParams.get('title');

    if (!entity || !title) {
      return NextResponse.json({
        duplicates: [],
        message: 'Provide entity and title to check for duplicates',
      });
    }

    const duplicates = await checkJupiterDuplicates(entity, title);

    return NextResponse.json({
      success: true,
      data: {
        has_potential_duplicates: duplicates.length > 0,
        duplicates,
      },
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check duplicates',
      },
      { status: 500 }
    );
  }
}
