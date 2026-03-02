"use client";

import { useEffect, useMemo, useState, type MouseEvent, type WheelEvent } from "react";
import Link from "next/link";
import type { EnergyDemandProject } from "@/lib/energy-demand-types";
import { DEMAND_CATEGORY_LABELS, PROJECT_STATUS_LABELS, GRID_REGION_INFO } from "@/lib/energy-demand-types";
import { FUEL_TYPE_INFO } from "@/lib/grid-supply-types";

// Map constants
const MAP_W = 1400;
const MAP_H = 800;

// Continental US bounds in Web Mercator (EPSG:3857)
const US_BOUNDS = {
  xmin: -13884991,
  xmax: -7455066,
  ymin: 2870341,
  ymax: 6338219,
};

// Convert lat/lng to map coordinates
function latLngToMap(lat: number, lng: number): { x: number; y: number } {
  // Convert to Web Mercator
  const x = lng * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;

  // Normalize to map bounds
  const nx = (x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
  const ny = 1 - (y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);

  return { x: nx * MAP_W, y: ny * MAP_H };
}

// Format numbers
function formatMW(mw: number): string {
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${mw} MW`;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

// Category colors for map markers
const CATEGORY_COLORS: Record<string, string> = {
  "data-center": "#06b6d4",    // cyan
  "semiconductor": "#a855f7",   // purple
  "ev-battery": "#22c55e",      // green
  "manufacturing": "#f97316",   // orange
  "hydrogen": "#3b82f6",        // blue
  "other": "#6b7280",           // gray
};

interface RegionSummary {
  region: string;
  name: string;
  color: string;
  projectCount: number;
  totalDemandMW: number;
  byCategory: Record<string, { count: number; mw: number }>;
}

interface RegionSupply {
  region: string;
  name: string;
  color: string;
  existingCapacityGW: number;
  peakDemandGW: number;
  reserveMarginPct: number;
  queueTotalGW: number;
  queueCompletionRatePct: number;
  expectedAdditionsGW: number;
  retirementsGW: number;
  netChangeBy2030GW: number;
  capacityByFuel: Record<string, number>;
}

interface SupplyTotal {
  totalCapacityGW: number;
  totalPeakDemandGW: number;
  totalQueueGW: number;
  avgCompletionRatePct: number;
  expectedAdditionsGW: number;
  totalRetirementsGW: number;
  netChangeBy2030GW: number;
  byFuel: Record<string, number>;
}

interface GridInfra {
  lines: Array<{ d: string; properties: Record<string, unknown> }>;
  substations: Array<{ x: number; y: number; properties: Record<string, unknown> }>;
  plants: Array<{ x: number; y: number; properties: Record<string, unknown> }>;
}

export default function GridDemandPage() {
  const [demandProjects, setDemandProjects] = useState<EnergyDemandProject[]>([]);
  const [regionSummary, setRegionSummary] = useState<RegionSummary[]>([]);
  const [totalStats, setTotalStats] = useState({ projects: 0, demandMW: 0, investmentUSD: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supply-side state
  const [supplyByRegion, setSupplyByRegion] = useState<RegionSupply[]>([]);
  const [supplyTotal, setSupplyTotal] = useState<SupplyTotal | null>(null);
  const [supplyLoading, setSupplyLoading] = useState(true);

  // Grid infrastructure
  const [gridInfra, setGridInfra] = useState<GridInfra>({ lines: [], substations: [], plants: [] });
  const [gridLoading, setGridLoading] = useState(true);

  // Map state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // UI state
  const [showGrid, setShowGrid] = useState(true);
  const [showDemand, setShowDemand] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<EnergyDemandProject | null>(null);

  // Load demand data
  useEffect(() => {
    async function loadDemand() {
      try {
        const res = await fetch("/api/energy-demand");
        const data = await res.json();
        setDemandProjects(data.projects || []);
        setRegionSummary(data.byRegion || []);
        setTotalStats(data.total || { projects: 0, demandMW: 0, investmentUSD: 0 });
      } catch (err) {
        console.error("Failed to load demand data:", err);
        setError("Could not load energy demand data");
      } finally {
        setLoading(false);
      }
    }
    loadDemand();
  }, []);

  // Load supply data
  useEffect(() => {
    async function loadSupply() {
      try {
        const res = await fetch("/api/grid-supply?summary=true");
        const data = await res.json();
        setSupplyByRegion(data.byRegion || []);
        setSupplyTotal(data.total || null);
      } catch (err) {
        console.error("Failed to load supply data:", err);
      } finally {
        setSupplyLoading(false);
      }
    }
    loadSupply();
  }, []);

  // Load grid infrastructure
  useEffect(() => {
    async function loadGrid() {
      try {
        const res = await fetch("/api/grid-infra");
        const data = await res.json();

        // Process lines
        const lines = (data.lines || []).flatMap((feature: any, idx: number) => {
          const geometry = feature.geometry;
          if (!geometry?.coordinates) return [];

          const coordLists = geometry.type === "LineString"
            ? [geometry.coordinates]
            : geometry.type === "MultiLineString"
              ? geometry.coordinates
              : [];

          return coordLists.map((coords: number[][], lineIdx: number) => {
            const stride = coords.length > 600 ? 3 : coords.length > 300 ? 2 : 1;
            const d = coords
              .filter((_: any, i: number) => i % stride === 0 || i === coords.length - 1)
              .map((coord: number[], i: number) => {
                const x = coord[0];
                const y = coord[1];
                const nx = (x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
                const ny = 1 - (y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);
                return `${i === 0 ? "M" : "L"} ${(nx * MAP_W).toFixed(1)} ${(ny * MAP_H).toFixed(1)}`;
              })
              .join(" ");
            return { d, properties: feature.properties || {} };
          });
        });

        // Process substations
        const substations = (data.substations || [])
          .filter((f: any) => f.geometry?.type === "Point" && f.geometry?.coordinates)
          .map((f: any) => {
            const [x, y] = f.geometry.coordinates;
            const nx = (x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
            const ny = 1 - (y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);
            return { x: nx * MAP_W, y: ny * MAP_H, properties: f.properties || {} };
          });

        // Process plants
        const plants = (data.plants || [])
          .filter((f: any) => f.geometry?.type === "Point" && f.geometry?.coordinates)
          .map((f: any) => {
            const [x, y] = f.geometry.coordinates;
            const nx = (x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
            const ny = 1 - (y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);
            return { x: nx * MAP_W, y: ny * MAP_H, properties: f.properties || {} };
          });

        setGridInfra({ lines, substations, plants });
      } catch (err) {
        console.error("Failed to load grid infra:", err);
      } finally {
        setGridLoading(false);
      }
    }
    loadGrid();
  }, []);

  // Project markers on map
  const projectMarkers = useMemo(() => {
    return demandProjects
      .filter((p) => p.coordinates && (!categoryFilter || p.category === categoryFilter))
      .map((p) => {
        const pos = latLngToMap(p.coordinates!.lat, p.coordinates!.lng);
        // Scale marker by power demand
        const size = Math.max(4, Math.min(20, Math.sqrt(p.powerMW) / 3));
        return { ...p, mapX: pos.x, mapY: pos.y, size };
      });
  }, [demandProjects, categoryFilter]);

  // Map interaction handlers
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((prev) => Math.min(5, Math.max(0.5, prev + delta)));
  };

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading grid demand data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Grid Capacity Intelligence</h1>
            <p className="text-xs text-gray-500">
              Mapping energy demand from AI data centers, fabs, and manufacturing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/radar"
              className="text-xs px-3 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Opportunity Tracker
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Summary Stats - Demand Side */}
        <section className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4">
            <div className="text-xs text-cyan-400 uppercase tracking-wide">New Demand</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{formatMW(totalStats.demandMW)}</div>
            <div className="text-xs text-gray-500">{totalStats.projects} announced projects</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-[#12121a] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Existing Capacity</div>
            <div className="text-2xl font-bold text-white mt-1">{supplyTotal ? `${supplyTotal.totalCapacityGW} GW` : "—"}</div>
            <div className="text-xs text-gray-500">US grid total</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-[#12121a] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">In Queue</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{supplyTotal ? `${supplyTotal.totalQueueGW} GW` : "—"}</div>
            <div className="text-xs text-gray-500">{supplyTotal ? `${supplyTotal.avgCompletionRatePct}% completion rate` : ""}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-[#12121a] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Retiring by 2030</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{supplyTotal ? `${supplyTotal.totalRetirementsGW} GW` : "—"}</div>
            <div className="text-xs text-gray-500">Coal + gas + nuclear</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-[#12121a] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Net Supply Change</div>
            <div className={`text-2xl font-bold mt-1 ${supplyTotal && supplyTotal.netChangeBy2030GW > 0 ? "text-green-400" : "text-red-400"}`}>
              {supplyTotal ? `${supplyTotal.netChangeBy2030GW > 0 ? "+" : ""}${supplyTotal.netChangeBy2030GW} GW` : "—"}
            </div>
            <div className="text-xs text-gray-500">Additions - retirements</div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="text-xs text-amber-400 uppercase tracking-wide">The Gap</div>
            {supplyTotal ? (
              <>
                <div className={`text-2xl font-bold mt-1 ${
                  totalStats.demandMW / 1000 > supplyTotal.expectedAdditionsGW ? "text-red-400" : "text-green-400"
                }`}>
                  {(totalStats.demandMW / 1000 - supplyTotal.expectedAdditionsGW).toFixed(1)} GW
                </div>
                <div className="text-xs text-amber-400/70">Demand exceeds new supply</div>
              </>
            ) : (
              <div className="text-lg font-bold text-amber-200 mt-1">Calculating...</div>
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="rounded-lg border border-gray-800 bg-[#111118] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Energy Demand Map</h2>
            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`text-xs px-2 py-1 rounded ${!categoryFilter ? "bg-cyan-500/30 text-cyan-200" : "text-gray-400 hover:bg-gray-700/50"}`}
                >
                  All
                </button>
                {Object.entries(DEMAND_CATEGORY_LABELS).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(categoryFilter === key ? null : key)}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${categoryFilter === key ? "bg-cyan-500/30 text-cyan-200" : "text-gray-400 hover:bg-gray-700/50"}`}
                  >
                    <span>{icon}</span>
                    <span className="hidden md:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-gray-700" />

              <button
                onClick={resetView}
                className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700/30"
              >
                Reset
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(5, z + 0.3))}
                className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700/30"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.3))}
                className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700/30"
              >
                −
              </button>
            </div>
          </div>

          <div className="p-3">
            <div
              className="w-full h-[600px] bg-gradient-to-b from-[#07101c] to-[#050b14] rounded border border-gray-800 overflow-hidden relative cursor-grab active:cursor-grabbing"
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Controls overlay */}
              <div className="absolute left-3 top-3 z-20 rounded border border-gray-700/80 bg-[#0d1522]/95 p-2 text-[11px] space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-cyan-300">Grid Infrastructure</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDemand}
                    onChange={(e) => setShowDemand(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-orange-300">Demand Projects</span>
                </label>
              </div>

              {/* Legend */}
              <div className="absolute right-3 top-3 z-20 rounded border border-gray-700/80 bg-[#0d1522]/95 p-2 text-[10px] space-y-1">
                <div className="text-gray-400 font-medium mb-1">Project Type</div>
                {Object.entries(DEMAND_CATEGORY_LABELS).map(([key, { label, color }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[key] }}
                    />
                    <span className="text-gray-300">{label}</span>
                  </div>
                ))}
              </div>

              {/* Loading overlay */}
              {gridLoading && (
                <div className="absolute inset-0 z-30 bg-[#02060c]/70 flex items-center justify-center">
                  <div className="text-sm text-cyan-200">Loading grid infrastructure...</div>
                </div>
              )}

              {/* Map content */}
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              >
                <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-full">
                  {/* Background */}
                  <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#08101c" />

                  {/* Transmission lines */}
                  {showGrid && gridInfra.lines.map((line, idx) => (
                    <path
                      key={idx}
                      d={line.d}
                      fill="none"
                      stroke="#1e4a6e"
                      strokeOpacity={0.4}
                      strokeWidth={0.7}
                      style={{ vectorEffect: "non-scaling-stroke" }}
                    />
                  ))}

                  {/* Substations */}
                  {showGrid && gridInfra.substations.map((s, idx) => (
                    <circle
                      key={idx}
                      cx={s.x}
                      cy={s.y}
                      r={1.2}
                      fill="#f97316"
                      fillOpacity={0.5}
                    />
                  ))}

                  {/* Power plants */}
                  {showGrid && gridInfra.plants.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={1.5}
                      fill="#a855f7"
                      fillOpacity={0.4}
                    />
                  ))}

                  {/* Demand project markers */}
                  {showDemand && projectMarkers.map((p) => (
                    <g key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer">
                      {/* Glow effect */}
                      <circle
                        cx={p.mapX}
                        cy={p.mapY}
                        r={p.size * 1.5}
                        fill={CATEGORY_COLORS[p.category]}
                        fillOpacity={0.2}
                      />
                      {/* Main marker */}
                      <circle
                        cx={p.mapX}
                        cy={p.mapY}
                        r={p.size}
                        fill={CATEGORY_COLORS[p.category]}
                        fillOpacity={0.9}
                        stroke="#fff"
                        strokeWidth={selectedProject?.id === p.id ? 2 : 0.5}
                        strokeOpacity={0.8}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Selected project info */}
              {selectedProject && (
                <div className="absolute bottom-3 left-3 right-3 z-20 rounded-lg border border-cyan-600/50 bg-[#0b1a2b]/95 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{DEMAND_CATEGORY_LABELS[selectedProject.category]?.icon}</span>
                        <h3 className="font-semibold text-white">{selectedProject.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded border ${PROJECT_STATUS_LABELS[selectedProject.status]?.color}`}>
                          {PROJECT_STATUS_LABELS[selectedProject.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {selectedProject.company} • {selectedProject.location}, {selectedProject.state}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Power Demand</div>
                      <div className="text-lg font-semibold text-cyan-400">{formatMW(selectedProject.powerMW)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Grid Region</div>
                      <div className="text-lg font-semibold text-white">{selectedProject.gridRegion}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Target Online</div>
                      <div className="text-lg font-semibold text-white">{selectedProject.targetOnline}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Investment</div>
                      <div className="text-lg font-semibold text-green-400">
                        {selectedProject.investmentUSD ? formatCurrency(selectedProject.investmentUSD) : "—"}
                      </div>
                    </div>
                  </div>
                  {selectedProject.notes && (
                    <p className="text-xs text-gray-400 mt-3">{selectedProject.notes}</p>
                  )}
                </div>
              )}
            </div>

            {/* Map stats */}
            <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
              <div className="rounded border border-gray-700 px-3 py-2 text-gray-300">
                Demand Projects: <span className="text-orange-400 font-semibold">{projectMarkers.length}</span>
              </div>
              <div className="rounded border border-gray-700 px-3 py-2 text-gray-300">
                Transmission Lines: <span className="text-cyan-400 font-semibold">{gridInfra.lines.length}</span>
              </div>
              <div className="rounded border border-gray-700 px-3 py-2 text-gray-300">
                Substations: <span className="text-orange-400 font-semibold">{gridInfra.substations.length}</span>
              </div>
              <div className="rounded border border-gray-700 px-3 py-2 text-gray-300">
                Zoom: <span className="text-white font-semibold">{zoom.toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </section>

        {/* Supply vs Demand by Region */}
        <section className="rounded-lg border border-gray-800 bg-[#111118]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Supply vs. Demand by Region</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-400">New Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-400">Expected Additions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-400">Retirements</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-3 py-2">Region</th>
                    <th className="text-right px-3 py-2">Existing</th>
                    <th className="text-right px-3 py-2">Peak Load</th>
                    <th className="text-right px-3 py-2">Reserve</th>
                    <th className="text-right px-3 py-2 text-cyan-400">New Demand</th>
                    <th className="text-right px-3 py-2 text-blue-400">Queue</th>
                    <th className="text-right px-3 py-2 text-green-400">Expected</th>
                    <th className="text-right px-3 py-2 text-red-400">Retiring</th>
                    <th className="text-right px-3 py-2 text-amber-400">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {supplyByRegion.map((supply) => {
                    const demand = regionSummary.find(r => r.region === supply.region);
                    const newDemandGW = (demand?.totalDemandMW || 0) / 1000;
                    const gap = newDemandGW - supply.expectedAdditionsGW + supply.retirementsGW;
                    const hasGap = gap > 0;

                    return (
                      <tr key={supply.region} className="hover:bg-gray-800/30">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: supply.color }} />
                            <span className="font-medium text-white">{supply.region}</span>
                          </div>
                          <div className="text-xs text-gray-500">{supply.name}</div>
                        </td>
                        <td className="text-right px-3 py-3 text-white">{supply.existingCapacityGW} GW</td>
                        <td className="text-right px-3 py-3 text-gray-400">{supply.peakDemandGW} GW</td>
                        <td className="text-right px-3 py-3">
                          <span className={supply.reserveMarginPct < 15 ? "text-red-400" : supply.reserveMarginPct < 20 ? "text-yellow-400" : "text-green-400"}>
                            {supply.reserveMarginPct}%
                          </span>
                        </td>
                        <td className="text-right px-3 py-3">
                          <span className="text-cyan-400 font-medium">{newDemandGW.toFixed(1)} GW</span>
                          {demand && <div className="text-xs text-gray-500">{demand.projectCount} projects</div>}
                        </td>
                        <td className="text-right px-3 py-3">
                          <span className="text-blue-400">{supply.queueTotalGW} GW</span>
                          <div className="text-xs text-gray-500">{supply.queueCompletionRatePct}% rate</div>
                        </td>
                        <td className="text-right px-3 py-3 text-green-400">{supply.expectedAdditionsGW} GW</td>
                        <td className="text-right px-3 py-3 text-red-400">-{supply.retirementsGW} GW</td>
                        <td className="text-right px-3 py-3">
                          <span className={`font-bold ${hasGap ? "text-red-400" : "text-green-400"}`}>
                            {hasGap ? "+" : ""}{gap.toFixed(1)} GW
                          </span>
                          {hasGap && (
                            <div className="text-xs text-red-400/70">shortfall</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Regional Details + Category Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demand by Region */}
          <div className="lg:col-span-2 rounded-lg border border-gray-800 bg-[#111118]">
            <div className="px-4 py-3 border-b border-gray-800">
              <h2 className="font-semibold text-white">Demand Concentration</h2>
            </div>
            <div className="p-4 space-y-3">
              {regionSummary.map((region) => {
                const pct = totalStats.demandMW > 0
                  ? (region.totalDemandMW / totalStats.demandMW) * 100
                  : 0;
                const supply = supplyByRegion.find(s => s.region === region.region);
                const gap = supply ? (region.totalDemandMW / 1000) - supply.expectedAdditionsGW + supply.retirementsGW : 0;

                return (
                  <div key={region.region} className="p-3 rounded border border-gray-700/50 hover:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: region.color }}
                        />
                        <span className="font-medium text-white">{region.region}</span>
                        <span className="text-xs text-gray-500">{region.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-lg font-semibold text-cyan-400">{formatMW(region.totalDemandMW)}</span>
                          <span className="text-xs text-gray-500 ml-1">demand</span>
                        </div>
                        {gap > 0 && (
                          <div className="text-right">
                            <span className="text-sm font-semibold text-red-400">+{gap.toFixed(1)} GW</span>
                            <span className="text-xs text-red-400/70 ml-1">gap</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: region.color }}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {Object.entries(region.byCategory).map(([cat, stats]) => (
                        <span
                          key={cat}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${CATEGORY_COLORS[cat]}20`, color: CATEGORY_COLORS[cat] }}
                        >
                          {DEMAND_CATEGORY_LABELS[cat as keyof typeof DEMAND_CATEGORY_LABELS]?.icon} {stats.count}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supply Mix + Summary */}
          <div className="space-y-6">
            {/* Fuel Mix */}
            <div className="rounded-lg border border-gray-800 bg-[#111118]">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold text-white">Current Capacity by Fuel</h2>
              </div>
              <div className="p-4 space-y-2">
                {supplyTotal && Object.entries(supplyTotal.byFuel)
                  .filter(([, gw]) => gw > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([fuel, gw]) => {
                    const fuelInfo = FUEL_TYPE_INFO[fuel as keyof typeof FUEL_TYPE_INFO];
                    const pct = (gw / supplyTotal.totalCapacityGW) * 100;
                    return (
                      <div key={fuel} className="flex items-center gap-3">
                        <span className="text-lg w-6">{fuelInfo?.icon || "⚡"}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-300">{fuelInfo?.label || fuel}</span>
                            <span className="text-white font-medium">{gw} GW ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: fuelInfo?.color || "#6b7280" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Demand by Category */}
            <div className="rounded-lg border border-gray-800 bg-[#111118]">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold text-white">Demand by Category</h2>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(
                  demandProjects.reduce((acc, p) => {
                    if (!acc[p.category]) acc[p.category] = { count: 0, mw: 0 };
                    acc[p.category].count += 1;
                    acc[p.category].mw += p.powerMW;
                    return acc;
                  }, {} as Record<string, { count: number; mw: number }>)
                )
                  .sort((a, b) => b[1].mw - a[1].mw)
                  .map(([cat, stats]) => (
                    <div key={cat} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{DEMAND_CATEGORY_LABELS[cat as keyof typeof DEMAND_CATEGORY_LABELS]?.icon}</span>
                        <span className="text-sm text-gray-200">{DEMAND_CATEGORY_LABELS[cat as keyof typeof DEMAND_CATEGORY_LABELS]?.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{formatMW(stats.mw)}</div>
                        <div className="text-xs text-gray-500">{stats.count} projects</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project List */}
        <section className="rounded-lg border border-gray-800 bg-[#111118]">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">All Announced Projects</h2>
            <span className="text-xs text-gray-500">{demandProjects.length} projects</span>
          </div>
          <div className="divide-y divide-gray-800">
            {demandProjects.map((project) => (
              <div
                key={project.id}
                className="px-4 py-3 hover:bg-gray-800/30 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{DEMAND_CATEGORY_LABELS[project.category]?.icon}</span>
                    <div>
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <p className="text-sm text-gray-400">
                        {project.company} • {project.location}, {project.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-cyan-400">{formatMW(project.powerMW)}</div>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-xs text-gray-500">{project.gridRegion}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PROJECT_STATUS_LABELS[project.status]?.color}`}>
                        {PROJECT_STATUS_LABELS[project.status]?.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
