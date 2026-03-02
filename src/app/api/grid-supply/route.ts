import { NextResponse } from 'next/server';
import {
  REGIONAL_CAPACITY,
  QUEUE_SUMMARY,
  RETIREMENT_SUMMARY,
  QUEUE_PROJECTS,
  PLANNED_RETIREMENTS,
  getRegionalSupplySummary,
  getTotalSupply,
} from '@/lib/grid-supply-data';
import { GRID_REGION_INFO } from '@/lib/grid-supply-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const region = searchParams.get('region');
  const summaryOnly = searchParams.get('summary') === 'true';

  // Build regional summaries
  const regionalSummary = getRegionalSupplySummary().map(summary => ({
    ...summary,
    name: GRID_REGION_INFO[summary.region]?.name || summary.region,
    color: GRID_REGION_INFO[summary.region]?.color || '#6b7280',
  }));

  // Filter by region if specified
  let filteredSummary = regionalSummary;
  if (region) {
    filteredSummary = regionalSummary.filter(s => s.region === region);
  }

  const totalStats = getTotalSupply();

  if (summaryOnly) {
    return NextResponse.json({
      total: totalStats,
      byRegion: filteredSummary,
      fetchedAt: new Date().toISOString(),
    });
  }

  // Include detailed projects
  let queueProjects = QUEUE_PROJECTS;
  let retirements = PLANNED_RETIREMENTS;

  if (region) {
    queueProjects = queueProjects.filter(p => p.gridRegion === region);
    retirements = retirements.filter(r => r.gridRegion === region);
  }

  return NextResponse.json({
    total: totalStats,
    byRegion: filteredSummary,
    queueProjects,
    retirements,
    queueSummary: QUEUE_SUMMARY,
    retirementSummary: RETIREMENT_SUMMARY,
    fetchedAt: new Date().toISOString(),
  });
}
