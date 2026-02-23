import { NextResponse } from 'next/server';
import {
  US_STRATEGIC_GOALS,
  DOMAIN_SUMMARIES,
  WINNING_DEFINED,
  getOverallStatus,
  getGoalDependencies
} from '@/lib/us-strategic-goals';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const goalId = searchParams.get('goalId');

  let goals = US_STRATEGIC_GOALS;

  if (domain && domain !== 'all') {
    goals = goals.filter(g => g.domain === domain);
  }

  // If requesting specific goal with dependencies
  let dependencies = null;
  if (goalId) {
    dependencies = getGoalDependencies(goalId);
  }

  const status = getOverallStatus();

  return NextResponse.json({
    goals,
    domains: DOMAIN_SUMMARIES,
    winning: WINNING_DEFINED,
    status,
    dependencies,
    lastUpdated: new Date().toISOString()
  });
}
