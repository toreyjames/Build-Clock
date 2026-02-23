import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Activity log entry
interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'status-change' | 'note-added' | 'note-updated' | 'created';
  details: string;
  previousValue?: string;
  newValue?: string;
}

// Tracking data per opportunity
interface OppTracking {
  status: string;
  notes: string;
  lastUpdated: string;
  activity: ActivityEntry[];
}

// GET - Load all tracking data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('opportunity_tracking')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      // Return empty if table doesn't exist
      return NextResponse.json({ tracking: {}, source: 'empty' });
    }

    // Convert array to Record<oppId, OppTracking>
    const tracking: Record<string, OppTracking> = {};
    (data || []).forEach((row: {
      opportunity_id: string;
      status: string;
      notes: string;
      last_updated: string;
      activity: ActivityEntry[];
    }) => {
      tracking[row.opportunity_id] = {
        status: row.status,
        notes: row.notes || '',
        lastUpdated: row.last_updated,
        activity: row.activity || [],
      };
    });

    return NextResponse.json({ tracking, source: 'supabase' });
  } catch (error) {
    console.error('Error loading tracking:', error);
    return NextResponse.json({ tracking: {}, source: 'error' });
  }
}

// POST - Save tracking data for an opportunity
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId, tracking } = body as {
      opportunityId: string;
      tracking: OppTracking;
    };

    if (!opportunityId || !tracking) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const { error } = await supabase
      .from('opportunity_tracking')
      .upsert({
        opportunity_id: opportunityId,
        status: tracking.status,
        notes: tracking.notes,
        last_updated: tracking.lastUpdated,
        activity: tracking.activity,
      }, {
        onConflict: 'opportunity_id',
      });

    if (error) {
      console.error('Supabase save error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving tracking:', error);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
