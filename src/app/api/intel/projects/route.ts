import { NextRequest, NextResponse } from "next/server";
import { getIntelProjects } from "@/lib/intel-data";
import { loadLiveStreams, loadStatusHistory } from "@/lib/intel-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const state = params.get("state");
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : null;

  let projects = getIntelProjects();
  const [statusHistory, liveStreams] = await Promise.all([loadStatusHistory(), loadLiveStreams()]);

  const statusByProject = new Map<string, typeof statusHistory>();
  for (const entry of statusHistory) {
    const existing = statusByProject.get(entry.projectId) ?? [];
    existing.push(entry);
    statusByProject.set(entry.projectId, existing);
  }

  const streamsByProject = new Map<string, typeof liveStreams>();
  for (const stream of liveStreams) {
    const existing = streamsByProject.get(stream.projectId) ?? [];
    existing.push(stream);
    streamsByProject.set(stream.projectId, existing);
  }

  projects = projects.map((project) => {
    const history = (statusByProject.get(project.projectId) ?? []).sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    );
    const latest = history[0];
    return {
      ...project,
      lifecycleStatus: latest?.toStatus ?? project.lifecycleStatus,
      statusHistory: history.length > 0 ? history : project.statusHistory,
      liveStreams: (streamsByProject.get(project.projectId) ?? project.liveStreams).sort(
        (a, b) => Number(b.verified) - Number(a.verified),
      ),
    };
  });
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
    storage: {
      persistedStatusHistory: statusHistory.length,
      persistedLiveStreams: liveStreams.length,
    },
    generatedAt: new Date().toISOString(),
  });
}
