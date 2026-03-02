"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IntelEvent, IntelProject, ProjectLifecycleStatus } from "@/lib/intel-types";

const MAP_WIDTH = 1400;
const MAP_HEIGHT = 800;

const US_BOUNDS = {
  xmin: -13884991,
  xmax: -7455066,
  ymin: 2870341,
  ymax: 6338219,
};

const STATUS_STYLES: Record<ProjectLifecycleStatus, string> = {
  planning: "text-yellow-300 bg-yellow-500/20 border-yellow-500/40",
  in_progress: "text-cyan-300 bg-cyan-500/20 border-cyan-500/40",
  operational: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
  delayed: "text-orange-300 bg-orange-500/20 border-orange-500/40",
  paused: "text-slate-300 bg-slate-500/20 border-slate-500/40",
  cancelled: "text-red-300 bg-red-500/20 border-red-500/40",
};

function latLngToMap(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  const y =
    (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180) * 20037508.34) / 180;

  const nx = (x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
  const ny = 1 - (y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);

  return { x: nx * MAP_WIDTH, y: ny * MAP_HEIGHT };
}

function formatValue(value: number | null): string {
  if (!value) return "TBD";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function statusLabel(status: ProjectLifecycleStatus): string {
  return status.replace("_", " ");
}

export default function IntelPage() {
  const [projects, setProjects] = useState<IntelProject[]>([]);
  const [events, setEvents] = useState<IntelEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [projectRes, eventRes] = await Promise.all([
          fetch("/api/intel/projects"),
          fetch("/api/intel/events?limit=20"),
        ]);
        const projectJson = await projectRes.json();
        const eventJson = await eventRes.json();

        if (!mounted) return;
        setProjects(projectJson.projects ?? []);
        setEvents(eventJson.events ?? []);
        if ((projectJson.projects ?? []).length > 0) {
          setSelectedProjectId(projectJson.projects[0].projectId);
        }
      } catch {
        if (!mounted) return;
        setError("Failed to load intel workspace");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const selectedProject =
    projects.find((project) => project.projectId === selectedProjectId) ?? projects[0] ?? null;

  const markers = useMemo(() => {
    return projects
      .filter((project) => project.coordinates)
      .map((project) => ({
        projectId: project.projectId,
        lifecycleStatus: project.lifecycleStatus,
        point: latLngToMap(project.coordinates!.lat, project.coordinates!.lng),
      }));
  }, [projects]);

  const selectedEvents = useMemo(() => {
    if (!selectedProject) return events.slice(0, 8);
    return events.filter((event) => event.projectId === selectedProject.projectId).slice(0, 8);
  }, [events, selectedProject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071019] text-slate-200 flex items-center justify-center">
        <p>Loading unified intel workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#071019] text-slate-200 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071019] text-slate-100">
      <div className="mx-auto max-w-[1700px] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Intel Workspace</h1>
            <p className="text-sm text-slate-400">
              Map and opportunity tracker are relational through shared project intelligence.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/radar" className="px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800">
              Radar
            </Link>
            <Link href="/grid" className="px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800">
              Grid
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <section className="xl:col-span-8 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Relational Map Context</h2>
              <span className="text-xs text-slate-500">{markers.length} geo-linked projects</span>
            </div>
            <div className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-[#02060a]">
              <div className="aspect-[14/8] relative">
                <img src="/us-map.svg" alt="US map" className="absolute inset-0 w-full h-full object-cover opacity-75" />
                <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full">
                  {markers.map((marker) => {
                    const selected = marker.projectId === selectedProject?.projectId;
                    return (
                      <circle
                        key={marker.projectId}
                        cx={marker.point.x}
                        cy={marker.point.y}
                        r={selected ? 10 : 7}
                        onClick={() => setSelectedProjectId(marker.projectId)}
                        className={`${selected ? "fill-cyan-300" : "fill-emerald-400"} cursor-pointer`}
                        opacity={selected ? 0.95 : 0.8}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
            {selectedProject && (
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`border px-2 py-0.5 text-xs rounded ${STATUS_STYLES[selectedProject.lifecycleStatus]}`}>
                    {statusLabel(selectedProject.lifecycleStatus)}
                  </span>
                  <p className="text-sm font-medium">{selectedProject.title}</p>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Forecast: 30d <strong>{statusLabel(selectedProject.forecast.status30d)}</strong> | 90d{" "}
                  <strong>{statusLabel(selectedProject.forecast.status90d)}</strong> | 180d{" "}
                  <strong>{statusLabel(selectedProject.forecast.status180d)}</strong> | Delay risk{" "}
                  <strong>{selectedProject.forecast.delayRiskScore}</strong>/100
                </p>
              </div>
            )}
          </section>

          <section className="xl:col-span-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <h2 className="mb-3 text-sm font-medium text-slate-300">Opportunity Tracker (Linked)</h2>
            <div className="max-h-[520px] overflow-auto space-y-2 pr-1">
              {projects.map((project) => {
                const active = selectedProject?.projectId === project.projectId;
                return (
                  <button
                    key={project.projectId}
                    type="button"
                    onClick={() => setSelectedProjectId(project.projectId)}
                    className={`w-full text-left rounded-lg border p-2 transition ${
                      active
                        ? "border-cyan-500/60 bg-cyan-500/10"
                        : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/80"
                    }`}
                  >
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-slate-400">{project.entity}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`border px-2 py-0.5 text-xs rounded ${STATUS_STYLES[project.lifecycleStatus]}`}>
                        {statusLabel(project.lifecycleStatus)}
                      </span>
                      <span className="text-xs text-slate-300">{formatValue(project.estimatedValue)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
          <section className="xl:col-span-7 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <h2 className="mb-3 text-sm font-medium text-slate-300">Evidence Tied To Selected Project</h2>
            {!selectedProject ? (
              <p className="text-sm text-slate-500">No project selected.</p>
            ) : (
              <div className="space-y-2">
                {selectedProject.evidence.map((source) => (
                  <a
                    key={`${source.url}-${source.date}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded border border-slate-800 bg-slate-900/40 p-2 hover:bg-slate-900/80"
                  >
                    <p className="text-sm">{source.title}</p>
                    <p className="text-xs text-slate-400">{source.date}</p>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="xl:col-span-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <h2 className="mb-3 text-sm font-medium text-slate-300">Live Intel Feed (Relational)</h2>
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {selectedEvents.map((event) => (
                <a
                  key={event.id}
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded border border-slate-800 bg-slate-900/40 p-2 hover:bg-slate-900/80"
                >
                  <p className="text-sm">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {event.timestamp} | {event.type} | {event.impact}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
