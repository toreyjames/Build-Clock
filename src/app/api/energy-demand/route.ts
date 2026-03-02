import { NextResponse } from 'next/server';
import {
  ENERGY_DEMAND_PROJECTS,
  getRegionalDemandSummary,
  getTotalDemand,
} from '@/lib/energy-demand-data';
import { GRID_REGION_INFO } from '@/lib/energy-demand-types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const region = searchParams.get('region');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const summaryOnly = searchParams.get('summary') === 'true';

  // Filter projects
  let projects = ENERGY_DEMAND_PROJECTS.filter((p) => p.status !== 'cancelled');

  if (region) {
    projects = projects.filter((p) => p.gridRegion === region);
  }
  if (category) {
    projects = projects.filter((p) => p.category === category);
  }
  if (status) {
    projects = projects.filter((p) => p.status === status);
  }

  // Calculate summaries
  const totalStats = getTotalDemand();
  const regionalSummary = getRegionalDemandSummary();

  // Build regional stats with names
  const regionStats = Object.entries(regionalSummary).map(([regionId, stats]) => ({
    region: regionId,
    name: GRID_REGION_INFO[regionId as keyof typeof GRID_REGION_INFO]?.name || regionId,
    color: GRID_REGION_INFO[regionId as keyof typeof GRID_REGION_INFO]?.color || '#6b7280',
    ...stats,
  })).sort((a, b) => b.totalDemandMW - a.totalDemandMW);

  if (summaryOnly) {
    return NextResponse.json({
      total: totalStats,
      byRegion: regionStats,
      fetchedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    projects,
    total: totalStats,
    byRegion: regionStats,
    filters: { region, category, status },
    fetchedAt: new Date().toISOString(),
  });
}
