import { NextResponse } from 'next/server';
import { fetchCommercialOpportunities, getCommercialCollectionModel } from '@/lib/commercial-sources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await fetchCommercialOpportunities(30);

    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      opportunities: result.opportunities,
      newCount: result.newCount,
      sources: result.sources,
      collectionModel: result.collectionModel,
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
        sectorsCovered: result.collectionModel.sectorCoverage.filter((row) => row.executedQueries > 0).length,
        totalSectorQueriesExecuted: result.collectionModel.sectorCoverage.reduce((sum, row) => sum + row.executedQueries, 0),
      },
    });
  } catch (error) {
    console.error('Commercial API error:', error);
    const fallbackModel = getCommercialCollectionModel();
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commercial opportunities',
      opportunities: [],
      newCount: 0,
      sources: [],
      collectionModel: fallbackModel,
    }, { status: 500 });
  }
}
