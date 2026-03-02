import { NextRequest, NextResponse } from "next/server";
import { getIntelProjects } from "@/lib/intel-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const state = params.get("state");
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : null;

  let projects = getIntelProjects();
  if (status) {
    projects = projects.filter((project) => project.lifecycleStatus === status);
  }
  if (state) {
    projects = projects.filter((project) => project.state === state.toUpperCase());
  }
  if (limit) {
    projects = projects.slice(0, limit);
  }

  const stats = {
    total: projects.length,
    planning: projects.filter((project) => project.lifecycleStatus === "planning").length,
    in_progress: projects.filter((project) => project.lifecycleStatus === "in_progress").length,
    operational: projects.filter((project) => project.lifecycleStatus === "operational").length,
    delayed: projects.filter((project) => project.lifecycleStatus === "delayed").length,
    paused: projects.filter((project) => project.lifecycleStatus === "paused").length,
    cancelled: projects.filter((project) => project.lifecycleStatus === "cancelled").length,
  };

  return NextResponse.json({
    projects,
    stats,
    generatedAt: new Date().toISOString(),
  });
}
