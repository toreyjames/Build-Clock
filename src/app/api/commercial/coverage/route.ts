import { NextResponse } from 'next/server';
import { fetchCommercialOpportunities, getCommercialCollectionModel } from '@/lib/commercial-sources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await fetchCommercialOpportunities(20);
    return NextResponse.json({
      success: true,
      fetchedAt: new Date().toISOString(),
      collectionModel: result.collectionModel,
      sources: result.sources,
      sampleSize: result.opportunities.length,
      sampleNewCount: result.newCount,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load coverage model',
      collectionModel: getCommercialCollectionModel(),
      sources: [],
      sampleSize: 0,
      sampleNewCount: 0,
    }, { status: 500 });
  }
}
