import { NextResponse } from 'next/server';
import {
  STRATEGIC_GAPS,
  DOMAIN_SUMMARIES,
  GAP_OPPORTUNITY_LINKS,
  getOverallCompetitivePosition
} from '@/lib/strategic-gaps';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  let gaps = STRATEGIC_GAPS;

  if (domain && domain !== 'all') {
    gaps = gaps.filter(g => g.domain === domain);
  }

  const position = getOverallCompetitivePosition();

  return NextResponse.json({
    gaps,
    domains: DOMAIN_SUMMARIES,
    links: GAP_OPPORTUNITY_LINKS,
    position,
    lastUpdated: new Date().toISOString()
  });
}
