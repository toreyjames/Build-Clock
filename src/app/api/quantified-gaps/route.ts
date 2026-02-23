import { NextResponse } from 'next/server';
import {
  POWER_GAPS,
  SEMICONDUCTOR_GAPS,
  MINERALS_GAPS,
  COMPUTE_GAPS,
  INVESTMENT_REQUIREMENTS,
  TIMELINE_PROJECTIONS,
  LEAPFROG_STRATEGIES,
  POPULATION_NORMALIZATION,
  INDUSTRIAL_CONTEXT,
  INDUSTRIAL_INSIGHT,
  calculateTotalInvestmentGap,
  getGapsWhereUSBehind,
  getGapsWhereUSAhead,
  getCriticalPathItems
} from '@/lib/quantified-gaps';

export async function GET() {
  const investmentSummary = calculateTotalInvestmentGap();
  const usBehind = getGapsWhereUSBehind();
  const usAhead = getGapsWhereUSAhead();
  const criticalPath = getCriticalPathItems();

  return NextResponse.json({
    metrics: {
      power: POWER_GAPS,
      semiconductors: SEMICONDUCTOR_GAPS,
      minerals: MINERALS_GAPS,
      compute: COMPUTE_GAPS
    },
    investments: INVESTMENT_REQUIREMENTS,
    timelines: TIMELINE_PROJECTIONS,
    leapfrogStrategies: LEAPFROG_STRATEGIES,
    population: POPULATION_NORMALIZATION,
    industrial: {
      context: INDUSTRIAL_CONTEXT,
      insight: INDUSTRIAL_INSIGHT
    },
    summary: {
      investmentGap: investmentSummary,
      gapsBehind: usBehind.length,
      gapsAhead: usAhead.length,
      criticalPath
    },
    lastUpdated: new Date().toISOString()
  });
}
