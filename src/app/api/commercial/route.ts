import { NextResponse } from 'next/server';
import { fetchCommercialOpportunities } from '@/lib/commercial-sources';

export const revalidate = 1800; // Cache for 30 minutes

export async function GET() {
  try {
    const result = await fetchCommercialOpportunities(30);

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      opportunities: result.opportunities,
      newCount: result.newCount,
      sources: result.sources,
      summary: {
        total: result.opportunities.length,
        newThisWeek: result.newCount,
        byRelevance: {
          critical: result.opportunities.filter(o => o.otRelevance === 'critical').length,
          high: result.opportunities.filter(o => o.otRelevance === 'high').length,
          medium: result.opportunities.filter(o => o.otRelevance === 'medium').length,
        },
        byType: {
          utility: result.opportunities.filter(o => o.entityType === 'utility').length,
          enterprise: result.opportunities.filter(o => o.entityType === 'enterprise').length,
        },
      },
    });
  } catch (error) {
    console.error('Commercial API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commercial opportunities',
      opportunities: [],
      newCount: 0,
      sources: [],
    }, { status: 500 });
  }
}
