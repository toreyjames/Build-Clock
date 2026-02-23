import { NextResponse } from 'next/server';
import { fetchSAMOpportunities } from '@/lib/sam-gov';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30');

  const apiKey = process.env.SAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      opportunities: [],
      error: 'SAM.gov API key not configured',
      message: 'Add SAM_API_KEY to environment variables'
    });
  }

  try {
    const opportunities = await fetchSAMOpportunities(apiKey, limit);

    return NextResponse.json({
      opportunities,
      count: opportunities.length,
      source: 'sam.gov',
      lastFetched: new Date().toISOString()
    });
  } catch (error) {
    console.error('SAM API error:', error);
    return NextResponse.json({
      opportunities: [],
      error: 'Failed to fetch from SAM.gov',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
