// Genesis Webhook System
// Fires outbound webhooks to Power Automate and other integration platforms

import { supabase } from './supabase';
import { Opportunity, GenesisPillar, OTSystem, RegulatoryDriver } from './types';

// ============================================
// WEBHOOK EVENT TYPES
// ============================================

export type WebhookEventType =
  | 'opportunity.push_to_jupiter'
  | 'opportunity.deadline_approaching'
  | 'opportunity.status_changed'
  | 'opportunity.value_changed'
  | 'briefing.generated'
  | 'agent.alert_raised'
  | 'sector.blocker_resolved';

// ============================================
// WEBHOOK PAYLOADS
// ============================================

export interface PushToJupiterPayload {
  opportunity: {
    id: string;
    title: string;
    entity: string;
    amount: number | null;
    close_date: string | null;
    stage: string;
    description: string;
    pursuit_lead: string;
    win_probability: number;
    genesis_url: string;
    genesis_pillar: GenesisPillar;
    ot_systems: OTSystem[];
    regulatory_drivers: RegulatoryDriver[];
  };
}

export interface DeadlineApproachingPayload {
  opportunity_id: string;
  title: string;
  deadline: string;
  days_remaining: number;
  amount: number | null;
  urgency: 'critical' | 'high' | 'medium';
  genesis_url: string;
}

export interface StatusChangedPayload {
  opportunity_id: string;
  title: string;
  previous_status: string;
  new_status: string;
  changed_by?: string;
  genesis_url: string;
}

export interface BriefingGeneratedPayload {
  briefing_id: string;
  title: string;
  type: 'partner_weekly' | 'sector_update' | 'opportunity_brief';
  summary: string;
  genesis_url: string;
}

export interface WebhookEvent<T = unknown> {
  event: WebhookEventType;
  timestamp: string;
  data: T;
}

// ============================================
// WEBHOOK SUBSCRIPTION
// ============================================

export interface WebhookSubscription {
  id: string;
  event: WebhookEventType;
  callback_url: string;
  enabled: boolean;
  filters?: {
    min_value?: number;
    sectors?: GenesisPillar[];
  };
  created_at: string;
}

// ============================================
// SYNC LOG
// ============================================

export interface SyncLogEntry {
  id: string;
  opportunity_id: string;
  direction: 'to_jupiter' | 'from_jupiter';
  salesforce_id?: string;
  status: 'success' | 'error' | 'pending';
  details: Record<string, unknown>;
  created_at: string;
}

// ============================================
// JUPITER SYNC DATA
// ============================================

export interface JupiterSyncData {
  salesforce_id: string | null;
  salesforce_synced_at: string | null;
  pursuit_lead: string | null;
  win_probability: number | null;
}

// ============================================
// WEBHOOK FUNCTIONS
// ============================================

/**
 * Fire a webhook event to all subscribed endpoints
 */
export async function fireWebhook<T>(
  eventType: WebhookEventType,
  payload: T
): Promise<{ success: boolean; results: Array<{ url: string; status: number | 'error' }> }> {
  const event: WebhookEvent<T> = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  // Get all active subscriptions for this event type
  const subscriptions = await getWebhookSubscriptions(eventType);

  const results: Array<{ url: string; status: number | 'error' }> = [];

  // Fire webhooks in parallel
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const response = await fetch(sub.callback_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Genesis-Event': eventType,
            'X-Genesis-Timestamp': event.timestamp,
          },
          body: JSON.stringify(event),
        });

        results.push({ url: sub.callback_url, status: response.status });

        // Log the webhook delivery
        await logWebhookDelivery(sub.id, eventType, response.status);
      } catch (error) {
        console.error(`Webhook delivery failed to ${sub.callback_url}:`, error);
        results.push({ url: sub.callback_url, status: 'error' });
        await logWebhookDelivery(sub.id, eventType, 0, String(error));
      }
    })
  );

  return {
    success: results.every(r => r.status === 200),
    results,
  };
}

/**
 * Get webhook subscriptions for an event type
 */
export async function getWebhookSubscriptions(
  eventType?: WebhookEventType
): Promise<WebhookSubscription[]> {
  try {
    let query = supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('enabled', true);

    if (eventType) {
      query = query.eq('event', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching webhook subscriptions:', error);
      return [];
    }

    return data || [];
  } catch {
    // Table might not exist yet - return empty array
    return [];
  }
}

/**
 * Create a new webhook subscription
 */
export async function createWebhookSubscription(
  subscription: Omit<WebhookSubscription, 'id' | 'created_at'>
): Promise<WebhookSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .insert({
        ...subscription,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook subscription:', error);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Delete a webhook subscription
 */
export async function deleteWebhookSubscription(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhook_subscriptions')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Log webhook delivery attempt
 */
async function logWebhookDelivery(
  subscriptionId: string,
  eventType: WebhookEventType,
  statusCode: number,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('webhook_delivery_log').insert({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      event_type: eventType,
      status_code: statusCode,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silent fail for logging
  }
}

// ============================================
// JUPITER SYNC FUNCTIONS
// ============================================

/**
 * Push an opportunity to Jupiter (Salesforce) via webhook
 */
export async function pushToJupiter(
  opportunity: Opportunity,
  pursuitLead: string,
  winProbability: number
): Promise<{ success: boolean; error?: string }> {
  const genesisUrl = `https://usbuildclock.vercel.app/radar?id=${opportunity.id}`;

  const payload: PushToJupiterPayload = {
    opportunity: {
      id: opportunity.id,
      title: opportunity.title,
      entity: opportunity.entity,
      amount: opportunity.estimatedValue,
      close_date: opportunity.responseDeadline,
      stage: 'Qualification',
      description: `${opportunity.deloitteAngle}\n\nOT Scope: ${opportunity.otScope}`,
      pursuit_lead: pursuitLead,
      win_probability: winProbability,
      genesis_url: genesisUrl,
      genesis_pillar: opportunity.genesisPillar,
      ot_systems: opportunity.otSystems,
      regulatory_drivers: opportunity.regulatoryDrivers,
    },
  };

  // Log the sync attempt
  await logSyncActivity(opportunity.id, 'to_jupiter', 'pending', { payload });

  // Fire the webhook
  const result = await fireWebhook('opportunity.push_to_jupiter', payload);

  // Update sync log with result
  await logSyncActivity(
    opportunity.id,
    'to_jupiter',
    result.success ? 'success' : 'error',
    { results: result.results }
  );

  return {
    success: result.success,
    error: result.success ? undefined : 'Failed to deliver webhook',
  };
}

/**
 * Fire deadline approaching webhook
 */
export async function fireDeadlineWebhook(
  opportunityId: string,
  title: string,
  deadline: string,
  daysRemaining: number,
  amount: number | null
): Promise<void> {
  const payload: DeadlineApproachingPayload = {
    opportunity_id: opportunityId,
    title,
    deadline,
    days_remaining: daysRemaining,
    amount,
    urgency: daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'high' : 'medium',
    genesis_url: `https://usbuildclock.vercel.app/radar?id=${opportunityId}`,
  };

  await fireWebhook('opportunity.deadline_approaching', payload);
}

/**
 * Fire status changed webhook
 */
export async function fireStatusChangedWebhook(
  opportunityId: string,
  title: string,
  previousStatus: string,
  newStatus: string,
  changedBy?: string
): Promise<void> {
  const payload: StatusChangedPayload = {
    opportunity_id: opportunityId,
    title,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: changedBy,
    genesis_url: `https://usbuildclock.vercel.app/radar?id=${opportunityId}`,
  };

  await fireWebhook('opportunity.status_changed', payload);
}

/**
 * Log sync activity to database
 */
export async function logSyncActivity(
  opportunityId: string,
  direction: 'to_jupiter' | 'from_jupiter',
  status: 'success' | 'error' | 'pending',
  details: Record<string, unknown>,
  salesforceId?: string
): Promise<void> {
  try {
    await supabase.from('sync_log').insert({
      id: crypto.randomUUID(),
      opportunity_id: opportunityId,
      direction,
      salesforce_id: salesforceId,
      status,
      details,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silent fail for logging
  }
}

/**
 * Get sync history for an opportunity
 */
export async function getSyncHistory(opportunityId: string): Promise<SyncLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('sync_log')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Update opportunity with Jupiter sync data
 */
export async function updateJupiterSyncData(
  opportunityId: string,
  salesforceId: string
): Promise<boolean> {
  try {
    // For now, we'll store this in opportunity_tracking table
    // In production, this would update the main opportunities table
    const { error } = await supabase
      .from('opportunity_tracking')
      .upsert({
        opportunity_id: opportunityId,
        salesforce_id: salesforceId,
        salesforce_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'opportunity_id',
      });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Check for duplicate opportunities in Jupiter
 * This would typically call a backend API that queries Salesforce
 * For now, returns mock data
 */
export async function checkJupiterDuplicates(
  entity: string,
  title: string
): Promise<Array<{ id: string; name: string; link: string }>> {
  // In production, this would call an API that queries Salesforce
  // For demo purposes, return empty array (no duplicates)
  return [];
}

// ============================================
// WEBHOOK EVENT SCHEMA EXPORTS
// For documentation and type checking
// ============================================

export const WEBHOOK_EVENT_SCHEMAS = {
  'opportunity.push_to_jupiter': {
    description: 'Fired when user clicks "Push to Jupiter" to create opportunity in Salesforce',
    payload: {
      opportunity: {
        id: 'string - Genesis opportunity ID',
        title: 'string - Opportunity name',
        entity: 'string - Account name',
        amount: 'number | null - Estimated value',
        close_date: 'string | null - Response deadline',
        stage: 'string - Salesforce stage',
        description: 'string - Deloitte angle + OT scope',
        pursuit_lead: 'string - Person pushing to Jupiter',
        win_probability: 'number - 10/25/50/75/90',
        genesis_url: 'string - Link back to Genesis',
        genesis_pillar: 'string - Power, AI Compute, etc.',
        ot_systems: 'array - SCADA, DCS, etc.',
        regulatory_drivers: 'array - NERC CIP, NRC, etc.',
      },
    },
  },
  'opportunity.deadline_approaching': {
    description: 'Fired 7 days and 1 day before deadline',
    payload: {
      opportunity_id: 'string',
      title: 'string',
      deadline: 'string - ISO date',
      days_remaining: 'number',
      amount: 'number | null',
      urgency: 'critical | high | medium',
      genesis_url: 'string',
    },
  },
  'opportunity.status_changed': {
    description: 'Fired when opportunity status changes in Genesis',
    payload: {
      opportunity_id: 'string',
      title: 'string',
      previous_status: 'string',
      new_status: 'string',
      changed_by: 'string | undefined',
      genesis_url: 'string',
    },
  },
  'briefing.generated': {
    description: 'Fired when weekly briefing is created',
    payload: {
      briefing_id: 'string',
      title: 'string',
      type: 'partner_weekly | sector_update | opportunity_brief',
      summary: 'string',
      genesis_url: 'string',
    },
  },
};
