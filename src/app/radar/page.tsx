'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';
import {
  Opportunity,
  GenesisPillar,
  GENESIS_PILLAR_INFO,
  OT_SYSTEM_LABELS,
  REGULATORY_LABELS,
  DELOITTE_SERVICE_LABELS,
  STAGE_LABELS,
  DeloitteIndustry,
  DELOITTE_INDUSTRY_INFO,
  SECTOR_TO_DELOITTE,
  getDeloitteIndustry,
} from '@/lib/types';

// ============================================
// OT PIPELINE TRACKER
// Scan • Qualify • Track • Close
// ============================================

// Status workflow
type OppStatus = 'on-radar' | 'contacted' | 'meeting' | 'proposal' | 'closed';

const STATUS_CONFIG: Record<OppStatus, { label: string; color: string; bg: string }> = {
  'on-radar': { label: 'On Radar', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  'contacted': { label: 'Contacted', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'meeting': { label: 'Meeting', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'proposal': { label: 'Proposal', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  'closed': { label: 'Closed', color: 'text-green-400', bg: 'bg-green-500/20' },
};

const STAGES: OppStatus[] = ['on-radar', 'contacted', 'meeting', 'proposal', 'closed'];

// Activity log entry
interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'status-change' | 'note-added' | 'note-updated' | 'created' | 'jupiter-push';
  details: string;
  previousValue?: string;
  newValue?: string;
}

// Tracked data per opportunity
interface OppTracking {
  status: OppStatus;
  notes: string;
  lastUpdated: string;
  activity: ActivityEntry[];
  salesforce_id?: string;
  pursuit_lead?: string;
  win_probability?: number;
}

// Jupiter Modal data
interface JupiterModalData {
  isOpen: boolean;
  opportunity: Opportunity | null;
  title: string;
  entity: string;
  amount: number | null;
  closeDate: string | null;
  description: string;
  pursuitLead: string;
  winProbability: number;
}

// News item from API
interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  genesisPillar: string;
  relevance: string;
}

interface CommercialSignalItem {
  id: string;
  title: string;
  entity: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  relevance: 'high' | 'medium' | 'low';
  note: string;
}

interface OpportunityNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet: string;
}

interface SourceHealthItem {
  status: string;
  count: number;
  fallback: boolean;
  error: string | null;
}

interface LiveEvent {
  at: string;
  message: string;
  level: 'ok' | 'warn' | 'info';
}

interface RefreshHealthStatus {
  scheduler?: {
    cadenceMinutes?: number;
    healthy?: boolean;
    ageMinutes?: number | null;
  };
  latestRun?: {
    status?: string;
    finishedAt?: string | null;
    durationMs?: number | null;
    error?: string | null;
  } | null;
}

interface InvestmentComponent {
  id: string;
  company: string;
  component: string;
  amount: number | null;
  stage: string;
}

interface SpeedToGridSignal {
  id: 'interconnection' | 'permitting' | 'long-lead' | 'commissioning';
  label: string;
  description: string;
  count: number;
  opportunities: string[];
}

// Commercial discovery from scanning
interface CommercialDiscovery {
  id: string;
  title: string;
  entity: string;
  entityType: 'utility' | 'enterprise' | 'state-local';
  source: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  summary: string;
  estimatedValue: number | null;
  state: string;
  otRelevance: 'critical' | 'high' | 'medium' | 'low';
  otKeywords: string[];
  sector: string;
  isNew: boolean;
  // Enrichment details
  specificSite?: string;
  phase?: string;
  primeContractor?: string;
  rfpTimeline?: string;
  needsResearch?: boolean;
}

// Market type (for commercial filter)
type MarketType = 'all' | 'commercial' | 'federal';
const MARKET_MAP: Record<string, MarketType> = {
  'federal': 'federal',
  'state-local': 'federal',
  'utility': 'commercial',
  'enterprise': 'commercial',
};

// Client size indicator
function getClientSize(entity: string, value: number | null): { label: string; color: string } {
  // Fortune 500 / Major entities
  const fortune500 = ['Microsoft', 'Oracle', 'OpenAI', 'SoftBank', 'Google', 'Amazon', 'Meta', 'NVIDIA', 'Intel', 'AMD', 'TSMC', 'Samsung', 'Apple', 'Constellation', 'Duke Energy', 'Southern Company', 'Dominion', 'Exelon', 'NextEra'];
  if (fortune500.some(f => entity.toLowerCase().includes(f.toLowerCase()))) {
    return { label: 'Fortune 500', color: 'bg-amber-500/20 text-amber-400' };
  }
  if (value && value >= 1_000_000_000) {
    return { label: 'Enterprise', color: 'bg-blue-500/20 text-blue-400' };
  }
  if (value && value >= 100_000_000) {
    return { label: 'Large', color: 'bg-cyan-500/20 text-cyan-400' };
  }
  return { label: 'Mid-Market', color: 'bg-gray-500/20 text-gray-400' };
}

// OT Equipment filter (binary)
type OTFilter = 'all' | 'ot-equipment' | 'no-ot-equipment';

// Industry filter (Deloitte sectors)
type IndustryFilter = 'all' | DeloitteIndustry;

// Timeframe filter
type TimeframeFilter = 'rolling-year' | 'all-time';

const WIN_PROBABILITY_OPTIONS = [
  { value: 10, label: '10% - Long Shot' },
  { value: 25, label: '25% - Possible' },
  { value: 50, label: '50% - Competitive' },
  { value: 75, label: '75% - Strong Position' },
  { value: 90, label: '90% - Near Certain' },
];

const MAP_W = 1400;
const MAP_H = 800;

type LatLngBounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };
type MapRect = { x: number; y: number; w: number; h: number };

const US_BOUNDS = {
  xmin: -13884991,
  xmax: -7455066,
  ymin: 2870341,
  ymax: 6338219,
};

const AK_LATLNG_BOUNDS: LatLngBounds = { minLat: 51.2, maxLat: 71.5, minLng: -171.5, maxLng: -129.5 };
const HI_LATLNG_BOUNDS: LatLngBounds = { minLat: 18.5, maxLat: 22.5, minLng: -160.8, maxLng: -154.5 };

// Tuned to align with us-map.svg inset layout.
const AK_RECT: MapRect = { x: 24, y: 586, w: 282, h: 186 };
const HI_RECT: MapRect = { x: 324, y: 704, w: 170, h: 82 };

function latLngToMercator(lat: number, lng: number): { x: number; y: number } {
  return {
    x: (lng * 20037508.34) / 180,
    y: (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180) * 20037508.34) / 180,
  };
}

const STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.7794, lng: -86.8287 }, AK: { lat: 64.0685, lng: -152.2782 }, AZ: { lat: 34.2744, lng: -111.6602 },
  AR: { lat: 34.8938, lng: -92.4426 }, CA: { lat: 36.7783, lng: -119.4179 }, CO: { lat: 39.5501, lng: -105.7821 },
  CT: { lat: 41.6032, lng: -73.0877 }, DE: { lat: 38.9108, lng: -75.5277 }, FL: { lat: 27.6648, lng: -81.5158 },
  GA: { lat: 32.1656, lng: -82.9001 }, HI: { lat: 19.8968, lng: -155.5828 }, ID: { lat: 44.0682, lng: -114.742 },
  IL: { lat: 40.6331, lng: -89.3985 }, IN: { lat: 39.8494, lng: -86.2583 }, IA: { lat: 41.878, lng: -93.0977 },
  KS: { lat: 39.0119, lng: -98.4842 }, KY: { lat: 37.8393, lng: -84.27 }, LA: { lat: 30.9843, lng: -91.9623 },
  ME: { lat: 45.2538, lng: -69.4455 }, MD: { lat: 39.0458, lng: -76.6413 }, MA: { lat: 42.4072, lng: -71.3824 },
  MI: { lat: 44.3148, lng: -85.6024 }, MN: { lat: 46.7296, lng: -94.6859 }, MS: { lat: 32.3547, lng: -89.3985 },
  MO: { lat: 37.9643, lng: -91.8318 }, MT: { lat: 46.8797, lng: -110.3626 }, NE: { lat: 41.4925, lng: -99.9018 },
  NV: { lat: 38.8026, lng: -116.4194 }, NH: { lat: 43.1939, lng: -71.5724 }, NJ: { lat: 40.0583, lng: -74.4057 },
  NM: { lat: 34.5199, lng: -105.8701 }, NY: { lat: 43.2994, lng: -74.2179 }, NC: { lat: 35.7596, lng: -79.0193 },
  ND: { lat: 47.5515, lng: -101.002 }, OH: { lat: 40.4173, lng: -82.9071 }, OK: { lat: 35.0078, lng: -97.0929 },
  OR: { lat: 43.8041, lng: -120.5542 }, PA: { lat: 41.2033, lng: -77.1945 }, RI: { lat: 41.5801, lng: -71.4774 },
  SC: { lat: 33.8361, lng: -81.1637 }, SD: { lat: 43.9695, lng: -99.9018 }, TN: { lat: 35.5175, lng: -86.5804 },
  TX: { lat: 31.9686, lng: -99.9018 }, UT: { lat: 39.321, lng: -111.0937 }, VT: { lat: 44.5588, lng: -72.5778 },
  VA: { lat: 37.4316, lng: -78.6569 }, WA: { lat: 47.7511, lng: -120.7401 }, WV: { lat: 38.5976, lng: -80.4549 },
  WI: { lat: 43.7844, lng: -88.7879 }, WY: { lat: 43.0759, lng: -107.2903 }, DC: { lat: 38.9072, lng: -77.0369 },
};

function latLngToMap(lat: number, lng: number): { x: number; y: number } {
  const projectInset = (bounds: LatLngBounds, rect: MapRect): { x: number; y: number } => {
    const nx = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng);
    const ny = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat);
    return {
      x: rect.x + nx * rect.w,
      y: rect.y + ny * rect.h,
    };
  };

  if (lat >= HI_LATLNG_BOUNDS.minLat && lat <= HI_LATLNG_BOUNDS.maxLat && lng >= HI_LATLNG_BOUNDS.minLng && lng <= HI_LATLNG_BOUNDS.maxLng) {
    return projectInset(HI_LATLNG_BOUNDS, HI_RECT);
  }
  if (lat >= AK_LATLNG_BOUNDS.minLat && lat <= AK_LATLNG_BOUNDS.maxLat && lng >= AK_LATLNG_BOUNDS.minLng && lng <= AK_LATLNG_BOUNDS.maxLng) {
    return projectInset(AK_LATLNG_BOUNDS, AK_RECT);
  }

  const m = latLngToMercator(lat, lng);
  const nx = (m.x - US_BOUNDS.xmin) / (US_BOUNDS.xmax - US_BOUNDS.xmin);
  const ny = 1 - (m.y - US_BOUNDS.ymin) / (US_BOUNDS.ymax - US_BOUNDS.ymin);
  return { x: nx * MAP_W, y: ny * MAP_H };
}

function statusColor(status: OppStatus): string {
  if (status === 'closed') return '#22c55e';
  if (status === 'proposal') return '#a855f7';
  if (status === 'meeting') return '#3b82f6';
  if (status === 'contacted') return '#eab308';
  return '#9ca3af';
}

function hasOtEquipment(opportunity: Opportunity): boolean {
  if ((opportunity.otSystems || []).length > 0) return true;
  const scope = (opportunity.otScope || '').toLowerCase();
  return /\b(scada|dcs|ics|hmi|plc|bms|mes|ems|substation|control system|rtu|safety system)\b/i.test(scope);
}

function otEquipmentLabel(opportunity: Opportunity): string {
  return hasOtEquipment(opportunity) ? 'OT Equipment' : 'No OT Equipment Confirmed';
}

function otEquipmentClass(opportunity: Opportunity): string {
  return hasOtEquipment(opportunity)
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-slate-500/20 text-slate-300';
}

function getInvestmentComponents(opportunity: Opportunity): InvestmentComponent[] {
  const components: InvestmentComponent[] = [];
  const stageLabel = STAGE_LABELS[opportunity.procurementStage];

  components.push({
    id: `${opportunity.id}-sponsor`,
    company: opportunity.entity,
    component: 'Primary program envelope',
    amount: opportunity.estimatedValue || null,
    stage: stageLabel,
  });

  opportunity.likelyPrimes.forEach((prime, idx) => {
    components.push({
      id: `${opportunity.id}-prime-${idx}`,
      company: prime,
      component: 'Prime execution scope (validate package and timeline)',
      amount: null,
      stage: stageLabel,
    });
  });

  opportunity.partnerOpportunities.forEach((partner, idx) => {
    components.push({
      id: `${opportunity.id}-partner-${idx}`,
      company: partner,
      component: 'Partner/ally pursuit lane',
      amount: null,
      stage: stageLabel,
    });
  });

  return components.slice(0, 10);
}

function formatCurrency(value: number | null): string {
  if (!value) return 'TBD';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getOpportunityMilestoneDays(opportunity: Opportunity): number | null {
  const milestone = opportunity.responseDeadline || opportunity.keyDate;
  return getDaysUntil(milestone);
}

function getOpportunityText(opportunity: Opportunity): string {
  return [
    opportunity.title,
    opportunity.subtitle,
    opportunity.otScope,
    opportunity.notes,
    opportunity.keyDateDescription,
    opportunity.fundingSource,
    opportunity.procurementStage,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getOpportunityAnchorDate(opportunity: Opportunity): Date | null {
  const candidates = [opportunity.responseDeadline, opportunity.keyDate, opportunity.postedDate, opportunity.lastUpdated]
    .map((value) => (value ? new Date(value) : null))
    .filter((value): value is Date => value !== null && !Number.isNaN(value.getTime()));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.getTime() - a.getTime());
  return candidates[0];
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function freshnessBadge(dateStr: string | null | undefined): { label: string; className: string } {
  if (!dateStr) return { label: 'unknown', className: 'bg-gray-500/20 text-gray-300' };
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 1) return { label: 'fresh', className: 'bg-emerald-500/20 text-emerald-300' };
  if (days <= 7) return { label: 'recent', className: 'bg-cyan-500/20 text-cyan-300' };
  if (days <= 30) return { label: 'aging', className: 'bg-amber-500/20 text-amber-300' };
  return { label: 'stale', className: 'bg-rose-500/20 text-rose-300' };
}

function confidenceBadge(confidence: string | null | undefined): { label: string; className: string } {
  const normalized = (confidence || '').toLowerCase();
  if (normalized.includes('confirmed')) return { label: 'confirmed', className: 'bg-emerald-500/20 text-emerald-300' };
  if (normalized.includes('likely')) return { label: 'likely', className: 'bg-cyan-500/20 text-cyan-300' };
  if (normalized.includes('speculative')) return { label: 'speculative', className: 'bg-amber-500/20 text-amber-300' };
  return { label: 'unknown', className: 'bg-gray-500/20 text-gray-300' };
}

// Generate Executive Brief PDF
function generateExecutiveBriefPDF(opportunity: Opportunity, tracking?: OppTracking) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper to add text with word wrap
  const addText = (text: string, x: number, yPos: number, options?: { fontSize?: number; fontStyle?: string; maxWidth?: number; color?: [number, number, number] }) => {
    const fontSize = options?.fontSize || 10;
    const fontStyle = options?.fontStyle || 'normal';
    const maxWidth = options?.maxWidth || contentWidth;
    const color = options?.color || [0, 0, 0];

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, yPos);
    return lines.length * (fontSize * 0.4);
  };

  // Header
  doc.setFillColor(15, 23, 42); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OT OPPORTUNITY BRIEF', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, margin, 28);

  const clientSize = getClientSize(opportunity.entity, opportunity.estimatedValue);
  doc.text(`${clientSize.label} | ${MARKET_MAP[opportunity.entityType] === 'commercial' ? 'Commercial' : 'Federal'}`, margin, 35);

  y = 50;

  // Opportunity Title
  y += addText(opportunity.title, margin, y, { fontSize: 16, fontStyle: 'bold', color: [30, 64, 175] });
  y += 5;

  // Entity & Value
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(opportunity.entity, margin + 25, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Value:', pageWidth / 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(opportunity.estimatedValue), pageWidth / 2 + 25, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${opportunity.location}, ${opportunity.state}`, margin + 30, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Stage:', pageWidth / 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(STAGE_LABELS[opportunity.procurementStage], pageWidth / 2 + 25, y);
  y += 8;

  if (opportunity.responseDeadline) {
    doc.setFont('helvetica', 'bold');
    doc.text('Deadline:', margin, y);
    doc.setFont('helvetica', 'normal');
    const daysUntil = getDaysUntil(opportunity.responseDeadline);
    doc.text(`${formatDate(opportunity.responseDeadline)}${daysUntil !== null ? ` (${daysUntil} days)` : ''}`, margin + 32, y);
  }

  if (tracking?.status) {
    doc.setFont('helvetica', 'bold');
    doc.text('Pipeline:', pageWidth / 2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(STATUS_CONFIG[tracking.status].label, pageWidth / 2 + 28, y);
  }
  y += 12;

  // WHY OT Section
  doc.setFillColor(6, 182, 212); // Cyan
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`WHY OT? - ${hasOtEquipment(opportunity) ? 'OT EQUIPMENT PRESENT' : 'OT EQUIPMENT NOT CONFIRMED'}`, margin + 4, y + 5.5);
  y += 14;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // OT Systems
  if (opportunity.otSystems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('OT Systems:', margin, y);
    doc.setFont('helvetica', 'normal');
    const systems = opportunity.otSystems.map(s => OT_SYSTEM_LABELS[s]).join(', ');
    y += addText(systems, margin + 35, y, { maxWidth: contentWidth - 35 });
    y += 4;
  }

  // Regulatory Drivers
  if (opportunity.regulatoryDrivers.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Regulations:', margin, y);
    doc.setFont('helvetica', 'normal');
    const regs = opportunity.regulatoryDrivers.map(r => REGULATORY_LABELS[r]).join(', ');
    y += addText(regs, margin + 35, y, { maxWidth: contentWidth - 35 });
    y += 4;
  }

  // OT Scope
  doc.setFont('helvetica', 'bold');
  doc.text('Scope:', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  y += addText(opportunity.otScope, margin, y, { maxWidth: contentWidth });
  y += 8;

  // DELOITTE ANGLE Section
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DELOITTE POSITIONING', margin + 4, y + 5.5);
  y += 14;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y += addText(opportunity.deloitteAngle, margin, y, { maxWidth: contentWidth });
  y += 6;

  // Services
  doc.setFont('helvetica', 'bold');
  doc.text('Services:', margin, y);
  doc.setFont('helvetica', 'normal');
  const services = opportunity.deloitteServices.map(s => DELOITTE_SERVICE_LABELS[s]).join(', ');
  y += addText(services, margin + 30, y, { maxWidth: contentWidth - 30 });
  y += 8;

  // Competition & Ecosystem (if space)
  if (y < 220) {
    doc.setFillColor(245, 158, 11); // Amber
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPETITIVE LANDSCAPE', margin + 4, y + 5.5);
    y += 14;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    if (opportunity.likelyPrimes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Likely Primes:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(opportunity.likelyPrimes.join(', '), margin + 40, y);
      y += 6;
    }

    if (opportunity.competitors.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Competitors:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(opportunity.competitors.join(', '), margin + 40, y);
      y += 6;
    }

    if (opportunity.partnerOpportunities.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Partners:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(opportunity.partnerOpportunities.join(', '), margin + 40, y);
      y += 6;
    }
  }

  // Notes (if any)
  if (tracking?.notes && y < 250) {
    y += 6;
    doc.setFillColor(100, 116, 139); // Slate
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', margin + 4, y + 5.5);
    y += 14;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    y += addText(tracking.notes, margin, y, { maxWidth: contentWidth });
  }

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('OT Pipeline Tracker | Confidential', margin, 288);
  doc.text(`ID: ${opportunity.id}`, pageWidth - margin - 40, 288);

  // Save the PDF
  const filename = `OT-Brief-${opportunity.entity.replace(/[^a-zA-Z0-9]/g, '-')}-${opportunity.id}.pdf`;
  doc.save(filename);
}

function OTPipelineTrackerContent() {
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [tracking, setTracking] = useState<Record<string, OppTracking>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earningsSignals, setEarningsSignals] = useState<CommercialSignalItem[]>([]);
  const [utilityIrSignals, setUtilityIrSignals] = useState<CommercialSignalItem[]>([]);
  const [stateProcSignals, setStateProcSignals] = useState<CommercialSignalItem[]>([]);
  const [discoveries, setDiscoveries] = useState<CommercialDiscovery[]>([]);
  const [discoveriesLoading, setDiscoveriesLoading] = useState(false);
  const [newDiscoveryCount, setNewDiscoveryCount] = useState(0);
  const [editingNotes, setEditingNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Filters
  const [marketFilter, setMarketFilter] = useState<MarketType>('commercial');
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>('all');
  const [otFilter, setOtFilter] = useState<OTFilter>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('rolling-year');
  const showOpportunities = true;

  // Cloud sync
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());

  // Jupiter Modal
  const [jupiterModal, setJupiterModal] = useState<JupiterModalData>({
    isOpen: false,
    opportunity: null,
    title: '',
    entity: '',
    amount: null,
    closeDate: null,
    description: '',
    pursuitLead: '',
    winProbability: 50,
  });
  const [jupiterPushing, setJupiterPushing] = useState(false);
  const [jupiterError, setJupiterError] = useState<string | null>(null);
  const [addedDiscoveries, setAddedDiscoveries] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);
  const [refreshHealth, setRefreshHealth] = useState<RefreshHealthStatus | null>(null);
  const [showFallbackData, setShowFallbackData] = useState(false);
  const [sourceHealth, setSourceHealth] = useState<Record<string, SourceHealthItem>>({});
  const [opportunitySourceMeta, setOpportunitySourceMeta] = useState<{
    curated: string;
    live: string;
    curatedCount: number;
    liveCount: number;
    liveError: string | null;
    rawLiveCount: number;
    droppedAsDuplicates: number;
  } | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const isFetchingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Convert discovery to opportunity and add to pipeline
  const addDiscoveryToPipeline = (disc: CommercialDiscovery) => {
    // Map sector to genesis pillar
    const sectorToPillar: Record<string, GenesisPillar> = {
      'grid': 'power',
      'power': 'power',
      'nuclear': 'power',
      'data-centers': 'ai-compute',
      'semiconductors': 'semiconductors',
      'manufacturing': 'manufacturing',
      'ev-battery': 'supply-chain',
      'water': 'energy-systems',
    };

    const newOpp: Opportunity = {
      id: `disc-${disc.id}`,
      title: disc.title,
      subtitle: disc.summary.substring(0, 100),
      genesisPillar: sectorToPillar[disc.sector] || 'power',
      genesisConnection: `Discovered via ${disc.sourceName} - ${disc.otKeywords.join(', ')}`,
      entity: disc.entity !== 'Unknown' ? disc.entity : 'TBD',
      entityType: disc.entityType,
      sector: disc.sector as any,
      location: disc.state,
      state: disc.state,
      estimatedValue: disc.estimatedValue,
      contractType: 'unknown',
      fundingSource: disc.entityType === 'utility' ? 'Rate base / Private' : 'Private',
      procurementStage: 'pre-solicitation',
      urgency: 'this-quarter',
      keyDate: null,
      keyDateDescription: null,
      postedDate: disc.publishedAt,
      responseDeadline: null,
      otRelevance: disc.otRelevance,
      otSystems: disc.otKeywords.includes('SCADA') ? ['scada'] : disc.otKeywords.includes('DCS') ? ['dcs'] : [],
      otScope: disc.summary,
      regulatoryDrivers: disc.otKeywords.includes('NERC CIP') ? ['nerc-cip'] : [],
      complianceRequirements: disc.otKeywords.join(', '),
      deloitteServices: ['ot-assessment'],
      deloitteAngle: 'Opportunity identified through commercial scanning - requires qualification',
      existingRelationship: 'unknown',
      likelyPrimes: [],
      competitors: [],
      partnerOpportunities: [],
      sources: [{ title: disc.sourceName, url: disc.sourceUrl, date: disc.publishedAt.split('T')[0] }],
      lastUpdated: new Date().toISOString(),
      confidence: 'speculative',
      notes: `Auto-qualified from discovery. Source: ${disc.sourceName}`,
      source: 'sam.gov' as any, // Will show as discovered
    };

    // Add to opportunities list
    setOpportunities(prev => [newOpp, ...prev]);

    // Add initial tracking
    const now = new Date().toISOString();
    setTracking(prev => ({
      ...prev,
      [newOpp.id]: {
        status: 'on-radar',
        notes: `Discovered ${getRelativeTime(disc.publishedAt)} via ${disc.sourceName}\n\nOT Keywords: ${disc.otKeywords.join(', ')}`,
        lastUpdated: now,
        activity: [{
          id: `act-${Date.now()}`,
          timestamp: now,
          type: 'created',
          details: 'Added from New Discoveries',
        }],
      },
    }));

    // Mark as added
    setAddedDiscoveries(prev => new Set(prev).add(disc.id));

    // Select the new opportunity
    setSelectedOpp(newOpp);

    // Save to cloud
    setPendingSaves(prev => new Set(prev).add(newOpp.id));
  };

  // Open Jupiter Modal
  const openJupiterModal = (opp: Opportunity) => {
    setJupiterModal({
      isOpen: true,
      opportunity: opp,
      title: opp.title,
      entity: opp.entity,
      amount: opp.estimatedValue,
      closeDate: opp.responseDeadline,
      description: `${opp.deloitteAngle}\n\nOT Scope: ${opp.otScope}`,
      pursuitLead: tracking[opp.id]?.pursuit_lead || '',
      winProbability: tracking[opp.id]?.win_probability || 50,
    });
    setJupiterError(null);
  };

  // Close Jupiter Modal
  const closeJupiterModal = () => {
    setJupiterModal(prev => ({ ...prev, isOpen: false }));
    setJupiterError(null);
  };

  // Push to Jupiter
  const handlePushToJupiter = async () => {
    if (!jupiterModal.opportunity || !jupiterModal.pursuitLead) {
      setJupiterError('Pursuit Lead is required');
      return;
    }

    setJupiterPushing(true);
    setJupiterError(null);

    try {
      const response = await fetch('/api/webhooks/push-to-jupiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: jupiterModal.opportunity.id,
          title: jupiterModal.title,
          entity: jupiterModal.entity,
          amount: jupiterModal.amount,
          close_date: jupiterModal.closeDate,
          description: jupiterModal.description,
          pursuit_lead: jupiterModal.pursuitLead,
          win_probability: jupiterModal.winProbability,
          genesis_pillar: jupiterModal.opportunity.genesisPillar,
          ot_systems: jupiterModal.opportunity.otSystems,
          regulatory_drivers: jupiterModal.opportunity.regulatoryDrivers,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const oppId = jupiterModal.opportunity.id;
        const now = new Date().toISOString();

        setTracking(prev => ({
          ...prev,
          [oppId]: {
            ...prev[oppId],
            status: prev[oppId]?.status === 'on-radar' ? 'contacted' : prev[oppId]?.status || 'contacted',
            pursuit_lead: jupiterModal.pursuitLead,
            win_probability: jupiterModal.winProbability,
            lastUpdated: now,
            activity: [
              ...(prev[oppId]?.activity || []),
              {
                id: `act-${Date.now()}`,
                timestamp: now,
                type: 'jupiter-push' as const,
                details: `Pushed to Jupiter by ${jupiterModal.pursuitLead}`,
              },
            ],
          },
        }));

        setPendingSaves(prev => new Set(prev).add(oppId));
        closeJupiterModal();
      } else {
        setJupiterError(result.error || 'Failed to push to Jupiter');
      }
    } catch (error) {
      console.error('Error pushing to Jupiter:', error);
      setJupiterError('Network error. Please try again.');
    } finally {
      setJupiterPushing(false);
    }
  };

  // Load tracking data
  useEffect(() => {
    async function loadTracking() {
      try {
        const res = await fetch('/api/tracking');
        const data = await res.json();
        if (data.source === 'supabase' || data.source === 'empty') {
          if (Object.keys(data.tracking || {}).length > 0) {
            setTracking(data.tracking);
          }
        }
      } catch (error) {
        console.error('Failed to load tracking:', error);
        const saved = localStorage.getItem('genesis-tracking');
        if (saved) {
          try {
            setTracking(JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing saved tracking:', e);
          }
        }
      }
    }
    loadTracking();
  }, []);

  // Save tracking data
  useEffect(() => {
    if (Object.keys(tracking).length > 0) {
      localStorage.setItem('genesis-tracking', JSON.stringify(tracking));

      if (pendingSaves.size > 0) {
        setSyncStatus('syncing');
        const saveToCloud = async () => {
          const toSave = Array.from(pendingSaves);
          setPendingSaves(new Set());

          let hasError = false;
          for (const oppId of toSave) {
            if (tracking[oppId]) {
              try {
                const res = await fetch('/api/tracking', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ opportunityId: oppId, tracking: tracking[oppId] }),
                });
                if (!res.ok) hasError = true;
              } catch {
                hasError = true;
              }
            }
          }
          setSyncStatus(hasError ? 'error' : 'synced');
          if (!hasError) setTimeout(() => setSyncStatus('idle'), 2000);
        };

        const timeout = setTimeout(saveToCloud, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [tracking, pendingSaves]);

  // Load notes when selecting an opportunity
  useEffect(() => {
    if (selectedOpp) {
      setEditingNotes(tracking[selectedOpp.id]?.notes || '');
    }
  }, [selectedOpp?.id, tracking]);

  const updateStatus = (oppId: string, newStatus: OppStatus) => {
    const now = new Date().toISOString();
    setTracking(prev => {
      const current = prev[oppId];
      const previousStatus = current?.status || 'on-radar';
      if (previousStatus === newStatus) return prev;

      return {
        ...prev,
        [oppId]: {
          ...current,
          status: newStatus,
          notes: current?.notes || '',
          lastUpdated: now,
          activity: [
            ...(current?.activity || []),
            {
              id: `act-${Date.now()}`,
              timestamp: now,
              type: 'status-change',
              details: `Status changed from ${STATUS_CONFIG[previousStatus].label} to ${STATUS_CONFIG[newStatus].label}`,
              previousValue: previousStatus,
              newValue: newStatus,
            },
          ],
        },
      };
    });
    setPendingSaves(prev => new Set(prev).add(oppId));
  };

  const saveNotes = (oppId: string, notes: string) => {
    const now = new Date().toISOString();
    const current = tracking[oppId];
    if ((current?.notes || '') === notes) return;

    setTracking(prev => ({
      ...prev,
      [oppId]: {
        ...prev[oppId],
        status: prev[oppId]?.status || 'on-radar',
        notes,
        lastUpdated: now,
        activity: [
          ...(prev[oppId]?.activity || []),
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            type: current?.notes ? 'note-updated' : 'note-added',
            details: current?.notes ? 'Note updated' : 'Note added',
          },
        ],
      },
    }));
    setPendingSaves(prev => new Set(prev).add(oppId));
  };

  const fetchPipelineData = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isInitialLoad = !hasLoadedRef.current;

    if (isInitialLoad && !silent) setLoading(true);
    if (!isInitialLoad) setIsRefreshing(true);
    setDiscoveriesLoading(true);

    try {
      const [oppRes, newsRes] = await Promise.all([
        fetch('/api/opportunities'),
        fetch('/api/live-feed'),
      ]);

      const oppData = await oppRes.json();
      const liveCount = Number(oppData.stats?.live || 0);
      const curatedCount = Number(oppData.stats?.curated || 0);
      const liveDiag = oppData.liveDiagnostics || {};
      setOpportunities(oppData.opportunities || []);
      setOpportunitySourceMeta({
        curated: String(oppData.dataSources?.curated || 'unknown'),
        live: String(oppData.dataSources?.live || 'unknown'),
        curatedCount,
        liveCount,
        liveError: liveDiag.error ? String(liveDiag.error) : null,
        rawLiveCount: Number(liveDiag.rawLiveCount || 0),
        droppedAsDuplicates: Number(liveDiag.droppedAsDuplicates || 0),
      });

      if (isInitialLoad && oppData.opportunities?.length > 0) {
        setSelectedOpp(oppData.opportunities[0]);
      }

      const newsData = await newsRes.json();
      if (newsData.sources?.news?.data) {
        setNews(newsData.sources.news.data.slice(0, 6));
      }
      if (newsData.sources?.earnings?.data) {
        setEarningsSignals((newsData.sources.earnings.data as CommercialSignalItem[]).slice(0, 6));
      }
      if (newsData.sources?.utilityIr?.data) {
        setUtilityIrSignals((newsData.sources.utilityIr.data as CommercialSignalItem[]).slice(0, 6));
      }
      if (newsData.sources?.stateProc?.data) {
        setStateProcSignals((newsData.sources.stateProc.data as CommercialSignalItem[]).slice(0, 6));
      }
      if (newsData.sources && typeof newsData.sources === 'object') {
        const health: Record<string, SourceHealthItem> = {};
        Object.entries(newsData.sources as Record<string, Record<string, unknown>>).forEach(([key, value]) => {
          health[key] = {
            status: String(value.status || 'unknown'),
            count: Number(value.count || 0),
            fallback: Boolean(value.fallback || false),
            error: value.error ? String(value.error) : null,
          };
        });
        setSourceHealth(health);
        const fallbackCount = Object.values(health).filter((item) => item.fallback).length;
        let event: LiveEvent;
        if (liveDiag.source === 'none') {
          event = {
            at: new Date().toISOString(),
            level: 'warn',
            message: `Refresh complete: live feed disabled (${String(liveDiag.error || 'missing SAM API key')})`,
          };
        } else if (liveDiag.source === 'error') {
          event = {
            at: new Date().toISOString(),
            level: 'warn',
            message: `Refresh complete: SAM live feed error (${String(liveDiag.error || 'unknown')})`,
          };
        } else if (Number(liveDiag.rawLiveCount || 0) > 0 && liveCount === 0) {
          event = {
            at: new Date().toISOString(),
            level: 'info',
            message: `Refresh complete: ${liveDiag.rawLiveCount} SAM records fetched, 0 added after dedupe/filter`,
          };
        } else if (fallbackCount > 0) {
          event = {
            at: new Date().toISOString(),
            level: 'warn',
            message: `Refresh complete: ${fallbackCount} fallback feeds active`,
          };
        } else {
          event = {
            at: new Date().toISOString(),
            level: 'ok',
            message: 'Refresh complete: all feeds healthy',
          };
        }
        setLiveEvents((prev) => [event, ...prev].slice(0, 8));
      }

      const discRes = await fetch('/api/commercial');
      const discData = await discRes.json();
      if (discData.opportunities) {
        const allDiscoveries = discData.opportunities as CommercialDiscovery[];

        const realOpportunities = allDiscoveries.filter(d =>
          d.source !== 'news' && d.source !== 'trade-pub'
        );

        const sectorToPillar: Record<string, GenesisPillar> = {
          'grid': 'power',
          'power': 'power',
          'nuclear': 'power',
          'data-centers': 'ai-compute',
          'semiconductors': 'semiconductors',
          'manufacturing': 'manufacturing',
          'ev-battery': 'supply-chain',
          'defense': 'defense',
          'pharma': 'healthcare',
          'chemicals': 'manufacturing',
          'metals': 'supply-chain',
          'food-bev': 'manufacturing',
        };

        const newOpps: Opportunity[] = realOpportunities.map(disc => ({
          id: `disc-${disc.id}`,
          title: disc.title,
          subtitle: disc.summary.substring(0, 100),
          genesisPillar: sectorToPillar[disc.sector] || 'manufacturing',
          genesisConnection: `Source: ${disc.sourceName}`,
          entity: disc.entity !== 'Unknown' ? disc.entity : 'TBD',
          entityType: disc.entityType,
          sector: disc.sector as any,
          location: disc.specificSite || disc.state,
          state: disc.state,
          estimatedValue: disc.estimatedValue,
          contractType: 'unknown',
          fundingSource: disc.source === 'contract-award' ? 'Federal' :
                        disc.source === 'chips-act' ? 'CHIPS Act' :
                        disc.source === 'grant' ? 'DOE/Federal Grant' :
                        disc.entityType === 'utility' ? 'Rate base' : 'Private',
          procurementStage: disc.phase === 'RFP Open' ? 'rfp-open' :
                           disc.phase === 'Awarded' || disc.phase === 'Contractor Selected' ? 'awarded' :
                           disc.phase === 'Construction' || disc.phase === 'Construction Starting' ? 'execution' :
                           disc.source === 'contract-award' ? 'awarded' : 'pre-solicitation',
          urgency: disc.needsResearch ? 'watching' : 'this-quarter',
          keyDate: disc.rfpTimeline ? disc.rfpTimeline : null,
          keyDateDescription: disc.rfpTimeline ? 'RFP Expected' : null,
          postedDate: disc.publishedAt,
          responseDeadline: null,
          otRelevance: disc.needsResearch ? 'medium' : disc.otRelevance,
          otSystems: [],
          otScope: disc.summary,
          regulatoryDrivers: [],
          complianceRequirements: disc.otKeywords.join(', '),
          deloitteServices: ['ot-assessment'],
          deloitteAngle: disc.needsResearch
            ? '⚠️ NEEDS RESEARCH - Too broad to action. Find specific site, phase, and prime contractor.'
            : disc.primeContractor
              ? `Prime: ${disc.primeContractor} - explore subcontracting or direct pursuit`
              : `Discovered via ${disc.sourceName} - verify and pursue`,
          existingRelationship: 'unknown',
          likelyPrimes: disc.primeContractor ? [disc.primeContractor] : [],
          competitors: [],
          partnerOpportunities: disc.primeContractor ? [disc.primeContractor] : [],
          sources: [{ title: disc.sourceName, url: disc.sourceUrl, date: disc.publishedAt.split('T')[0] }],
          lastUpdated: new Date().toISOString(),
          confidence: disc.needsResearch ? 'speculative' : disc.specificSite ? 'likely' : 'speculative',
          notes: disc.needsResearch
            ? '🔍 NEEDS RESEARCH: This is a broad national/program-level announcement. To make actionable, identify:\n• Specific site/facility\n• Project phase & timeline\n• Prime contractor(s)\n• Cyber/OT work packages'
            : [
                disc.specificSite ? `📍 Site: ${disc.specificSite}` : '',
                disc.phase ? `📅 Phase: ${disc.phase}` : '',
                disc.primeContractor ? `🏢 Prime: ${disc.primeContractor}` : '',
                disc.rfpTimeline ? `⏰ RFP: ${disc.rfpTimeline}` : '',
              ].filter(Boolean).join('\n') || '',
          source: 'sam.gov' as any,
        }));

        setOpportunities(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const uniqueNew = newOpps.filter(o => !existingIds.has(o.id));
          return [...prev, ...uniqueNew];
        });

        const now = new Date().toISOString();
        setTracking(prev => {
          const newTracking = { ...prev };
          for (const disc of realOpportunities) {
            const oppId = `disc-${disc.id}`;
            if (!newTracking[oppId]) {
              const noteLines = [
                `Source: ${disc.sourceName}`,
                disc.specificSite ? `Site: ${disc.specificSite}` : null,
                disc.phase ? `Phase: ${disc.phase}` : null,
                disc.primeContractor ? `Prime: ${disc.primeContractor}` : null,
                disc.rfpTimeline ? `RFP Timeline: ${disc.rfpTimeline}` : null,
                `Keywords: ${disc.otKeywords.join(', ')}`,
                disc.needsResearch ? '\n⚠️ NEEDS RESEARCH - Too broad. Find specific details.' : null,
              ].filter(Boolean).join('\n');

              newTracking[oppId] = {
                status: 'on-radar',
                notes: noteLines,
                lastUpdated: now,
                activity: [{
                  id: `act-${Date.now()}-${disc.id}`,
                  timestamp: now,
                  type: 'created',
                  details: disc.needsResearch
                    ? `Added from ${disc.sourceName} - NEEDS RESEARCH`
                    : `Added from ${disc.sourceName}`,
                }],
              };
            }
          }
          return newTracking;
        });

        setDiscoveries(allDiscoveries.filter(d => d.source === 'news' || d.source === 'trade-pub'));
        setNewDiscoveryCount(discData.newCount || 0);
      }
      setLastRefreshAt(new Date().toISOString());
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDiscoveriesLoading(false);
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch opportunities and news (initial + auto refresh)
  useEffect(() => {
    void fetchPipelineData(false);
    const intervalId = setInterval(() => {
      void fetchPipelineData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchPipelineData]);

  useEffect(() => {
    let active = true;

    const loadRefreshHealth = async () => {
      try {
        const res = await fetch('/api/refresh/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setRefreshHealth(data as RefreshHealthStatus);
        }
      } catch {
        // Best-effort health status; ignore transient network errors.
      }
    };

    void loadRefreshHealth();
    const intervalId = setInterval(() => {
      void loadRefreshHealth();
    }, 60 * 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  // Allow deep-linking from other pages, e.g. /radar?id=opp-id
  useEffect(() => {
    if (opportunities.length === 0) return;

    const targetId = searchParams.get('id');
    if (targetId) {
      const targetOpp = opportunities.find((opp) => opp.id === targetId);
      if (targetOpp && selectedOpp?.id !== targetOpp.id) {
        setSelectedOpp(targetOpp);
      }
      return;
    }

    if (!selectedOpp) {
      setSelectedOpp(opportunities[0]);
    }
  }, [opportunities, searchParams, selectedOpp]);

  // Filter opportunities
  const filteredOpps = opportunities.filter(opp => {
    // Timeframe filter
    if (timeframeFilter === 'rolling-year') {
      const anchorDate = getOpportunityAnchorDate(opp);
      if (!anchorDate) return false;
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const delta = anchorDate.getTime() - now;
      if (delta < -oneYearMs || delta > oneYearMs) return false;
    }

    // Market filter
    if (marketFilter !== 'all' && MARKET_MAP[opp.entityType] !== marketFilter) return false;

    // Industry filter (Deloitte sectors)
    if (industryFilter !== 'all') {
      const oppIndustry = getDeloitteIndustry(opp.sector || opp.genesisPillar);
      if (oppIndustry !== industryFilter) return false;
    }

    // OT filter
    if (otFilter === 'ot-equipment' && !hasOtEquipment(opp)) return false;
    if (otFilter === 'no-ot-equipment' && hasOtEquipment(opp)) return false;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return opp.title.toLowerCase().includes(query) ||
             opp.entity.toLowerCase().includes(query) ||
             opp.otScope.toLowerCase().includes(query);
    }

    return true;
  });

  const sectorInvestmentBreakdown = useMemo(() => {
    const totals: Partial<Record<DeloitteIndustry, { value: number; count: number }>> = {};

    filteredOpps.forEach((opp) => {
      const industry = getDeloitteIndustry(opp.sector || opp.genesisPillar);
      const current = totals[industry] || { value: 0, count: 0 };
      totals[industry] = {
        value: current.value + (opp.estimatedValue || 0),
        count: current.count + 1,
      };
    });

    const rows = (Object.keys(DELOITTE_INDUSTRY_INFO) as DeloitteIndustry[])
      .map((industry) => ({
        industry,
        label: DELOITTE_INDUSTRY_INFO[industry].label,
        value: totals[industry]?.value || 0,
        count: totals[industry]?.count || 0,
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.value - a.value);

    const maxValue = rows.reduce((max, row) => Math.max(max, row.value), 0);
    return { rows, maxValue };
  }, [filteredOpps]);

  const mapMarkers = useMemo(() => {
    const markerSlotsByState: Record<string, number> = {};

    return filteredOpps
      .map((opp, idx) => {
        const stateFromField = opp.state?.toUpperCase();
        const stateFromLocation = opp.location?.match(/\b([A-Z]{2})\b/)?.[1];
        const stateCode = stateFromField || stateFromLocation || null;

        let statePoint = STATE_CENTROIDS[opp.state?.toUpperCase()];
        if (!statePoint && opp.location) {
          const match = opp.location.match(/\b([A-Z]{2})\b/);
          if (match) statePoint = STATE_CENTROIDS[match[1]];
        }
        if (!statePoint) {
          const defaults = [STATE_CENTROIDS.TX, STATE_CENTROIDS.PA, STATE_CENTROIDS.TN, STATE_CENTROIDS.AZ];
          statePoint = defaults[idx % defaults.length];
        }
        if (!statePoint) return null;
        const point = latLngToMap(statePoint.lat, statePoint.lng);
        const stateBucket = stateCode || `fallback-${idx % 4}`;
        const slot = markerSlotsByState[stateBucket] ?? 0;
        markerSlotsByState[stateBucket] = slot + 1;

        // Spread overlapping markers in the same state into concentric rings.
        const ring = Math.floor(slot / 8);
        const angle = (slot % 8) * (Math.PI / 4);
        const spread = ring === 0 ? 0 : ring * 10 + 8;
        const jitterX = Math.cos(angle) * spread;
        const jitterY = Math.sin(angle) * spread;

        const jitteredPoint = {
          x: Math.min(MAP_W - 8, Math.max(8, point.x + jitterX)),
          y: Math.min(MAP_H - 8, Math.max(8, point.y + jitterY)),
        };
        const oppStatus = tracking[opp.id]?.status || 'on-radar';
        return {
          id: opp.id,
          title: opp.title,
          entity: opp.entity,
          stateCode,
          point: jitteredPoint,
          color: statusColor(oppStatus),
          selected: selectedOpp?.id === opp.id,
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
  }, [filteredOpps, tracking, selectedOpp?.id]);

  const hoveredMarker = useMemo(
    () => mapMarkers.find((marker) => marker.id === hoveredMarkerId) || null,
    [mapMarkers, hoveredMarkerId],
  );

  // Group by status for kanban
  const oppsByStage: Record<OppStatus, Opportunity[]> = {
    'on-radar': [],
    'contacted': [],
    'meeting': [],
    'proposal': [],
    'closed': [],
  };
  filteredOpps.forEach(opp => {
    const status = tracking[opp.id]?.status || 'on-radar';
    oppsByStage[status].push(opp);
  });

  // Pipeline metrics (decision-first, less distortion from mega-project outliers)
  const totalPipeline = filteredOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
  const valuedOpps = filteredOpps.filter((opp) => (opp.estimatedValue || 0) > 0);
  const valuedPipeline = valuedOpps.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
  const valuedCoveragePct = filteredOpps.length > 0 ? (valuedOpps.length / filteredOpps.length) * 100 : 0;
  const sortedValues = [...valuedOpps].map((opp) => opp.estimatedValue || 0).sort((a, b) => a - b);
  const medianProjectValue =
    sortedValues.length === 0
      ? null
      : sortedValues.length % 2 === 1
        ? sortedValues[Math.floor(sortedValues.length / 2)]
        : (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2;
  const top3Value = [...valuedOpps]
    .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
    .slice(0, 3)
    .reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
  const top3ConcentrationPct = valuedPipeline > 0 ? (top3Value / valuedPipeline) * 100 : 0;
  const actionablePursuits = filteredOpps.filter((opp) => {
    const isPriorityUrgency = opp.urgency === 'this-week' || opp.urgency === 'this-month' || opp.urgency === 'this-quarter';
    const isHighOT = hasOtEquipment(opp);
    const isNonSpeculative = opp.confidence !== 'speculative';
    return isPriorityUrgency && isHighOT && isNonSpeculative;
  });
  const actionDates30 = filteredOpps.filter((opp) => {
    const days = getOpportunityMilestoneDays(opp);
    return days !== null && days >= 0 && days <= 30;
  });
  const topActionQueue = [...filteredOpps]
    .map((opp) => {
      const value = opp.estimatedValue || 0;
      const winProbability = tracking[opp.id]?.win_probability ?? 35;
      const deadline = getOpportunityMilestoneDays(opp);
      const urgencyScore =
        opp.urgency === 'this-week' ? 30 : opp.urgency === 'this-month' ? 24 : opp.urgency === 'this-quarter' ? 16 : 8;
      const relevanceScore = hasOtEquipment(opp) ? 24 : 8;
      const deadlineScore = deadline !== null && deadline <= 30 ? 24 : deadline !== null && deadline <= 90 ? 14 : 6;
      const confidenceScore = opp.confidence === 'confirmed' ? 14 : opp.confidence === 'likely' ? 8 : 3;
      const score = Math.log10(value + 1) * 12 + urgencyScore + relevanceScore + deadlineScore + confidenceScore + winProbability * 0.4;
      return {
        opp,
        score,
        winProbability,
        deadline,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const speedToGridSignals = useMemo<SpeedToGridSignal[]>(() => {
    const buckets: Record<SpeedToGridSignal['id'], { label: string; description: string; patterns: RegExp[] }> = {
      interconnection: {
        label: 'Interconnection',
        description: 'Queue/POI/substation tie-in signals',
        patterns: [/\binterconnection\b/i, /\bqueue\b/i, /\bpoi\b/i, /\bsubstation\b/i, /\btransmission upgrade\b/i],
      },
      permitting: {
        label: 'Permitting',
        description: 'Permit/NTP/regulatory milestone signals',
        patterns: [/\bpermit\b/i, /\bpermitting\b/i, /\bdocket\b/i, /\brulemaking\b/i, /\bnotice to proceed\b/i, /\bntp\b/i],
      },
      'long-lead': {
        label: 'Long-Lead Equipment',
        description: 'Transformer/switchgear/protection lead-time signals',
        patterns: [/\btransformer\b/i, /\bswitchgear\b/i, /\bbreaker\b/i, /\brelay\b/i, /\blead time\b/i, /\blong lead\b/i],
      },
      commissioning: {
        label: 'Commissioning',
        description: 'Energization/testing/COD window signals',
        patterns: [/\bcommissioning\b/i, /\benergization\b/i, /\btesting\b/i, /\bcod\b/i, /\bcommercial operation\b/i, /\bin-service\b/i],
      },
    };

    const signals = Object.entries(buckets).map(([id, config]) => {
      const matches = filteredOpps.filter((opp) => {
        const text = getOpportunityText(opp);
        return config.patterns.some((pattern) => pattern.test(text));
      });
      return {
        id: id as SpeedToGridSignal['id'],
        label: config.label,
        description: config.description,
        count: matches.length,
        opportunities: matches.slice(0, 3).map((opp) => opp.title),
      };
    });

    return signals;
  }, [filteredOpps]);
  const opportunityIdSet = new Set(opportunities.map((opp) => opp.id));
  const jupiterSyncedInView = filteredOpps.filter((opp) => Boolean(tracking[opp.id]?.salesforce_id)).length;
  const jupiterOnlyRecords = Object.entries(tracking)
    .filter(([oppId, track]) => Boolean(track.salesforce_id) && !opportunityIdSet.has(oppId));
  const fallbackSources = Object.entries(sourceHealth).filter(([, value]) => value.fallback);
  const hasSourceRisk = fallbackSources.length >= 2 || (opportunitySourceMeta?.liveCount || 0) === 0;
  const displayNews = !showFallbackData && sourceHealth.news?.fallback ? [] : news;
  const displayEarningsSignals = !showFallbackData && sourceHealth.earnings?.fallback ? [] : earningsSignals;
  const displayUtilityIrSignals = !showFallbackData && sourceHealth.utilityIr?.fallback ? [] : utilityIrSignals;
  const displayStateProcSignals = !showFallbackData && sourceHealth.stateProc?.fallback ? [] : stateProcSignals;
  const schedulerHealthy = Boolean(refreshHealth?.scheduler?.healthy);
  const schedulerAge = refreshHealth?.scheduler?.ageMinutes;
  const schedulerLastRun = refreshHealth?.latestRun?.finishedAt || null;
  const schedulerStatusLabel = refreshHealth?.latestRun?.status || 'unknown';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-white">OT Pipeline Tracker</h1>
                <p className="text-xs text-gray-500">Scan • Qualify • Track • Close</p>
              </div>

              {/* Sync Status */}
              <div className="flex items-center gap-1.5 text-xs">
                {syncStatus === 'syncing' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-blue-400">Syncing...</span>
                  </>
                )}
                {syncStatus === 'synced' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-green-400">Saved</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="text-red-400">Offline</span>
                  </>
                )}
                {syncStatus === 'idle' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-gray-500">☁️</span>
                  </>
                )}
              </div>
            </div>

	            <div className="flex items-center gap-3">
	              <div className="text-right">
	                <button
	                  onClick={() => void fetchPipelineData(true)}
	                  className="rounded-md border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
	                  disabled={isRefreshing || loading}
	                >
	                  {isRefreshing ? 'Refreshing...' : 'Refresh now'}
	                </button>
	                <div className="mt-1 text-[10px] text-gray-500">
	                  Auto-refresh every 5m{lastRefreshAt ? ` • Last ${new Date(lastRefreshAt).toLocaleTimeString()}` : ''}
	                </div>
                  <div className={`mt-1 text-[10px] ${schedulerHealthy ? 'text-emerald-300' : 'text-amber-300'}`}>
                    Scheduler {schedulerHealthy ? 'healthy' : 'degraded'} •
                    {schedulerAge !== null && schedulerAge !== undefined ? ` ${schedulerAge}m ago` : ' no recent run'}
                    {schedulerLastRun ? ` • ${new Date(schedulerLastRun).toLocaleTimeString()}` : ''}
                    {schedulerStatusLabel ? ` • ${schedulerStatusLabel}` : ''}
                  </div>
	              </div>
	              <div className="text-right">
	                <div className="text-lg font-bold text-cyan-400">{formatCurrency(totalPipeline)}</div>
	                <div className="text-[10px] text-gray-500">total project value • {filteredOpps.length} opportunities</div>
	              </div>
	            </div>
          </div>
        </div>
      </header>

	      {/* Filters */}
	      <div className="border-b border-gray-800 bg-[#0d0d14]/50">
	        <div className="max-w-[1800px] mx-auto px-6 py-2">
          <div className="flex items-center gap-4">
            {/* Market Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Market:</span>
              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                {(['all', 'commercial', 'federal'] as MarketType[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMarketFilter(m)}
                    className={`px-2 py-1 rounded capitalize ${
                      marketFilter === m
                        ? m === 'commercial' ? 'bg-green-500 text-white' : m === 'federal' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m === 'all' ? 'All' : m === 'commercial' ? 'Commercial' : 'Federal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Filter (Deloitte) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Industry:</span>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value as IndustryFilter)}
                className="bg-[#12121a] border border-gray-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Industries</option>
                <optgroup label="Energy, Resources & Industrials">
                  <option value="eri-power">⚡ Power & Utilities</option>
                  <option value="eri-oil-gas">🛢️ Oil, Gas & Chemicals</option>
                  <option value="eri-industrial">🏭 Industrial Products</option>
                  <option value="eri-mining">⛏️ Mining & Metals</option>
                </optgroup>
                <optgroup label="Government & Public Services">
                  <option value="gps-defense">🛡️ Defense & Security</option>
                  <option value="gps-civil">🏛️ Civil Government</option>
                </optgroup>
                <optgroup label="Technology, Media & Telecom">
                  <option value="tmt-tech">💻 Technology</option>
                </optgroup>
                <optgroup label="Life Sciences & Health Care">
                  <option value="lshc-pharma">💊 Life Sciences</option>
                </optgroup>
                <optgroup label="Consumer">
                  <option value="consumer-auto">🚗 Automotive</option>
                  <option value="consumer-products">📦 Consumer Products</option>
                </optgroup>
              </select>
            </div>

            {/* OT Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">OT:</span>
              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                {(['all', 'ot-equipment', 'no-ot-equipment'] as OTFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setOtFilter(f)}
                    className={`px-2 py-1 rounded capitalize ${
                      otFilter === f
                        ? f === 'ot-equipment' ? 'bg-emerald-500 text-white' : f === 'no-ot-equipment' ? 'bg-slate-500 text-white' : 'bg-gray-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'ot-equipment' ? 'OT Equipment' : 'No OT Equipment'}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Frame:</span>
              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                {(['rolling-year', 'all-time'] as TimeframeFilter[]).map((frame) => (
                  <button
                    key={frame}
                    onClick={() => setTimeframeFilter(frame)}
                    className={`px-2 py-1 ${
                      timeframeFilter === frame
                        ? 'rounded bg-cyan-600 text-white'
                        : 'rounded text-gray-400 hover:text-white'
                    }`}
                  >
                    {frame === 'rolling-year' ? '1Y' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12121a] border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
	          </div>
	        </div>
	      </div>

      </div>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-4">
        <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-cyan-200/80">Actionable Pursuits</p>
            <p className="mt-1 text-xl font-semibold text-cyan-100">{actionablePursuits.length}</p>
            <p className="text-[11px] text-cyan-200/70">OT equipment present + near-term urgency + non-speculative</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">30-Day Action Dates</p>
            <p className="mt-1 text-xl font-semibold text-emerald-100">{actionDates30.length}</p>
            <p className="text-[11px] text-emerald-200/70">Opportunities with key date or response deadline within 30 days</p>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-indigo-200/80">Median Project Size</p>
            <p className="mt-1 text-xl font-semibold text-indigo-100">{formatCurrency(medianProjectValue)}</p>
            <p className="text-[11px] text-indigo-200/70">Less sensitive to mega-project outliers</p>
          </div>
          <div className="rounded-xl border border-slate-500/40 bg-slate-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-300/80">Value Coverage</p>
            <p className="mt-1 text-xl font-semibold text-slate-100">{valuedCoveragePct.toFixed(0)}%</p>
            <p className="text-[11px] text-slate-300/70">{valuedOpps.length}/{filteredOpps.length} opportunities have non-zero project value</p>
          </div>
        </section>
        <section className="mb-4 rounded-xl border border-gray-800 bg-[#12121a] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Speed-to-Grid Indicators</h3>
            <span className="text-[11px] text-gray-500">track friction and timeline risk</span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            {speedToGridSignals.map((signal) => (
              <div key={signal.id} className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-2">
                <p className="text-[11px] uppercase tracking-wide text-cyan-300">{signal.label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{signal.count}</p>
                <p className="text-[11px] text-gray-500">{signal.description}</p>
                {signal.opportunities.length > 0 && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-gray-400">
                    {signal.opportunities.join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="mb-4 rounded-xl border border-gray-800 bg-[#12121a] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Jupiter Coverage</h3>
            <span className="text-[11px] text-gray-500">inside vs outside tracker</span>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Synced In Current View</p>
              <p className="text-lg font-semibold text-emerald-100">{jupiterSyncedInView}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
              <p className="text-[11px] uppercase tracking-wide text-amber-200/80">Jupiter-Only Records</p>
              <p className="text-lg font-semibold text-amber-100">{jupiterOnlyRecords.length}</p>
            </div>
            <div className="rounded-lg border border-slate-500/40 bg-slate-500/10 p-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-300/80">Coverage Gap</p>
              <p className="text-lg font-semibold text-slate-100">
                {jupiterOnlyRecords.length === 0 ? 'None' : 'Needs Inbound Sync'}
              </p>
            </div>
          </div>
          {jupiterOnlyRecords.length > 0 && (
            <div className="mt-2 rounded-lg border border-gray-800 bg-[#0a0a0f] p-2 text-xs text-gray-400">
              Missing from tracker feed: {jupiterOnlyRecords.slice(0, 5).map(([id]) => id).join(', ')}
              {jupiterOnlyRecords.length > 5 ? ` +${jupiterOnlyRecords.length - 5} more` : ''}
            </div>
          )}
        </section>
        <p className="mb-4 text-xs text-gray-400">
          Value metrics shown are total project/program amounts. OT-specific value is intentionally not estimated until opportunity scope is validated.
        </p>
        <p className="mb-4 text-xs text-gray-500">
          Context ({timeframeFilter === 'rolling-year' ? 'rolling 1-year window' : 'all-time window'}): total valued project pipeline {formatCurrency(valuedPipeline)} across {valuedOpps.length} items; top-3 concentration {top3ConcentrationPct.toFixed(0)}%.
        </p>
        <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-xl border border-gray-800 bg-[#12121a] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Investment by Deloitte Sector</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500">click to filter</span>
                {industryFilter !== 'all' && (
                  <button
                    onClick={() => setIndustryFilter('all')}
                    className="rounded border border-gray-700 px-2 py-0.5 text-[10px] text-gray-300 hover:border-cyan-500/40 hover:text-cyan-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {sectorInvestmentBreakdown.rows.map((row) => {
                const widthPct = sectorInvestmentBreakdown.maxValue > 0 ? (row.value / sectorInvestmentBreakdown.maxValue) * 100 : 0;
                const isActive = industryFilter === row.industry;
                return (
                  <button
                    key={row.industry}
                    onClick={() => setIndustryFilter(row.industry)}
                    className={`w-full space-y-1 rounded-lg border p-2 text-left transition-colors ${
                      isActive
                        ? 'border-cyan-400/70 bg-cyan-500/10'
                        : 'border-gray-800 bg-[#0a0a0f] hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isActive ? 'text-cyan-100' : 'text-gray-200'}>{row.label}</span>
                      <span className="text-cyan-300">{formatCurrency(row.value)}</span>
                    </div>
                    <div className="h-2 rounded bg-gray-800">
                      <div className="h-2 rounded bg-cyan-500/80" style={{ width: `${Math.max(2, widthPct)}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500">{row.count} opportunities</div>
                  </button>
                );
              })}
              {sectorInvestmentBreakdown.rows.length === 0 && (
                <p className="text-xs text-gray-500">No sector investment data for current filters.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#12121a] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Top Action Queue</h3>
              <span className="text-[11px] text-gray-500">ranked by value, urgency, OT relevance, timing</span>
            </div>
            <div className="space-y-2">
              {topActionQueue.map((item, index) => (
                <button
                  key={item.opp.id}
                  onClick={() => setSelectedOpp(item.opp)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0a0a0f] px-3 py-2 text-left hover:border-cyan-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-cyan-300">#{index + 1} {item.opp.entity}</p>
                      <p className="text-sm text-white">{item.opp.title}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-emerald-300">{formatCurrency(item.opp.estimatedValue)}</p>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className={`rounded px-1 ${otEquipmentClass(item.opp)}`}>
                      {hasOtEquipment(item.opp) ? 'OT Equipment' : 'No OT Equipment'}
                    </span>
                    <span>{STAGE_LABELS[item.opp.procurementStage]}</span>
                    <span>•</span>
                    <span>{item.deadline === null ? 'No dated milestone' : `${item.deadline}d to milestone`}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          {/* Pipeline View */}
          <div className="col-span-8 flex flex-col">
            <div className="order-1 mb-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-2 text-xs text-cyan-100/90">
              Flow: Action Queue -&gt; Pipeline Board -&gt; Evidence -&gt; Geographic Context.
            </div>

            <div className="order-4 mb-4 bg-[#12121a] rounded-xl border border-gray-800 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Opportunity Map</h3>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="text-xs text-gray-500">{mapMarkers.length} opportunities mapped from the current list</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-gray-800 bg-[#090b10]">
                <div className="aspect-[14/8] relative">
                  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full">
                    <image
                      href="/us-map.svg"
                      x={0}
                      y={0}
                      width={MAP_W}
                      height={MAP_H}
                      preserveAspectRatio="none"
                      opacity={0.55}
                    />
                  </svg>
                  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full opacity-25">
                    {Array.from({ length: 13 }).map((_, i) => (
                      <line key={`v-${i}`} x1={(i * MAP_W) / 12} y1={0} x2={(i * MAP_W) / 12} y2={MAP_H} stroke="#1f2937" strokeWidth="1" />
                    ))}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <line key={`h-${i}`} x1={0} y1={(i * MAP_H) / 8} x2={MAP_W} y2={(i * MAP_H) / 8} stroke="#1f2937" strokeWidth="1" />
                    ))}
                  </svg>
                  <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full">
                    {showOpportunities && mapMarkers.map(marker => (
                      <g
                        key={marker.id}
                        onClick={() => setSelectedOpp(opportunities.find(o => o.id === marker.id) || null)}
                        onMouseEnter={() => setHoveredMarkerId(marker.id)}
                        onMouseLeave={() => setHoveredMarkerId(null)}
                        className="cursor-pointer"
                      >
                        <title>{`${marker.entity}${marker.stateCode ? ` (${marker.stateCode})` : ''}`}</title>
                        <circle
                          cx={marker.point.x}
                          cy={marker.point.y}
                          r={marker.selected ? 10 : 7}
                          fill={marker.color}
                          opacity={marker.selected ? 0.95 : 0.62}
                          stroke={marker.selected ? '#ffffff' : 'none'}
                          strokeWidth={marker.selected ? 2 : 0}
                        />
                      </g>
                    ))}
                    {hoveredMarker && (
                      <g pointerEvents="none">
                        <rect
                          x={Math.min(MAP_W - 260, Math.max(10, hoveredMarker.point.x + 10))}
                          y={Math.max(10, hoveredMarker.point.y - 50)}
                          width={250}
                          height={40}
                          rx={6}
                          fill="#030712ee"
                          stroke="#334155"
                          strokeWidth={1}
                        />
                        <text
                          x={Math.min(MAP_W - 250, Math.max(18, hoveredMarker.point.x + 18))}
                          y={Math.max(26, hoveredMarker.point.y - 32)}
                          fill="#e2e8f0"
                          fontSize={11}
                          fontWeight={700}
                        >
                          {hoveredMarker.entity}
                        </text>
                        <text
                          x={Math.min(MAP_W - 250, Math.max(18, hoveredMarker.point.x + 18))}
                          y={Math.max(40, hoveredMarker.point.y - 18)}
                          fill="#94a3b8"
                          fontSize={10}
                        >
                          {hoveredMarker.title.length > 36 ? `${hoveredMarker.title.slice(0, 36)}...` : hoveredMarker.title}
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span>On radar</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Contacted</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>Meeting</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span>Proposal</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>Closed</span>
              </div>
            </div>

            <div className="order-2">
              <KanbanView
                oppsByStage={oppsByStage}
                tracking={tracking}
                selectedOpp={selectedOpp}
                setSelectedOpp={setSelectedOpp}
              />
            </div>

            {/* Latest News */}
            <div className="order-3 mt-4">
              <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📰</span>
                    <h3 className="font-bold text-white">Metric-Linked Evidence</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {displayNews.slice(0, 3).map((item) => {
                      const fresh = freshnessBadge(item.publishedAt);
                      const newsFallback = sourceHealth.news?.fallback ?? false;
                      return (
                      <a
                        key={item.id}
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-[#12121a] rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1 text-xs">
                          <span className="text-cyan-400">{item.source}</span>
                          <span className="text-gray-600">{getRelativeTime(item.publishedAt)}</span>
                        </div>
                        <div className="mb-1 flex items-center gap-1 text-[10px]">
                          <span className={`rounded px-1 ${fresh.className}`}>{fresh.label}</span>
                          <span className={`rounded px-1 ${newsFallback ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {newsFallback ? 'fallback' : 'live'}
                          </span>
                        </div>
                        <div className="text-sm text-white line-clamp-2">{item.title}</div>
                      </a>
                    )})}
                    {displayNews.length === 0 && (
                      <div className="col-span-3 text-center py-8 text-gray-500 text-sm">
                        {sourceHealth.news?.fallback && !showFallbackData
                          ? 'News source is in fallback mode. Toggle "Fallback data ON" to view sample feed items.'
                          : 'No recent news'}
                      </div>
                    )}
                  </div>
              </div>
            </div>

          </div>

          {/* Detail Panel */}
          <div className="col-span-4">
            {selectedOpp ? (
              <DetailPanel
                opportunity={selectedOpp}
                tracking={tracking[selectedOpp.id]}
                updateStatus={updateStatus}
                editingNotes={editingNotes}
                setEditingNotes={setEditingNotes}
                saveNotes={saveNotes}
                openJupiterModal={openJupiterModal}
              />
            ) : (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-8 text-center">
                <p className="text-gray-500">Select an opportunity</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <section className="max-w-[1800px] mx-auto px-6 pb-2">
        <div className="rounded-xl border border-gray-800 bg-[#0b111b] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Source Diagnostics</span>
              <button
                onClick={() => setShowFallbackData((current) => !current)}
                className={`rounded border px-2 py-1 ${
                  showFallbackData
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                    : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                }`}
              >
                {showFallbackData ? 'Fallback data ON' : 'Fallback data OFF'}
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {Object.entries(sourceHealth).map(([name, item]) => (
              <span
                key={name}
                className={`rounded border px-2 py-1 ${
                  item.fallback
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : item.status === 'ok'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300'
                }`}
              >
                {name.toUpperCase()}: {item.fallback ? 'fallback' : item.status} ({item.count})
              </span>
            ))}
          </div>

          {hasSourceRisk ? (
            <p className="mt-2 text-xs text-amber-300">
              Warning: some feeds are in fallback mode. Pipeline may be partially stale until source/API access is restored.
            </p>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0d0d14] mt-6">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-400">OT Pipeline Tracker</span>
              <span>|</span>
              <span>Confidential</span>
            </div>
            <div className="flex items-center gap-4">
              {selectedOpp && (
                <>
                  <span>ID: {selectedOpp.id}</span>
                  <span>|</span>
                </>
              )}
              <span>{filteredOpps.length} opportunities</span>
              <span>|</span>
              <span>{formatCurrency(totalPipeline)} total project value</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Jupiter Push Modal */}
      {jupiterModal.isOpen && jupiterModal.opportunity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">☁️</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">Push to Jupiter</h2>
                    <p className="text-sm text-gray-400">Create opportunity in Salesforce</p>
                  </div>
                </div>
                <button onClick={closeJupiterModal} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {jupiterError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {jupiterError}
                </div>
              )}

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h3 className="text-xs text-gray-500 font-medium">OPPORTUNITY</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <input
                      type="text"
                      value={jupiterModal.title}
                      onChange={(e) => setJupiterModal(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Account</label>
                    <input
                      type="text"
                      value={jupiterModal.entity}
                      onChange={(e) => setJupiterModal(prev => ({ ...prev, entity: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Amount</label>
                    <input
                      type="text"
                      value={jupiterModal.amount ? `$${jupiterModal.amount.toLocaleString()}` : 'TBD'}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setJupiterModal(prev => ({ ...prev, amount: val ? parseInt(val) : null }));
                      }}
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Close Date</label>
                    <input
                      type="date"
                      value={jupiterModal.closeDate || ''}
                      onChange={(e) => setJupiterModal(prev => ({ ...prev, closeDate: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 space-y-3">
                <h3 className="text-xs text-orange-400 font-medium">PURSUIT DETAILS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Pursuit Lead <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={jupiterModal.pursuitLead}
                      onChange={(e) => setJupiterModal(prev => ({ ...prev, pursuitLead: e.target.value }))}
                      placeholder="Your name"
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Win Probability</label>
                    <select
                      value={jupiterModal.winProbability}
                      onChange={(e) => setJupiterModal(prev => ({ ...prev, winProbability: parseInt(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none"
                    >
                      {WIN_PROBABILITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea
                  value={jupiterModal.description}
                  onChange={(e) => setJupiterModal(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 bg-[#0a0a0f] border border-gray-700 rounded-lg text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
              <p className="text-gray-500 text-xs">Fires webhook to create Jupiter record</p>
              <div className="flex gap-3">
                <button
                  onClick={closeJupiterModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
                  disabled={jupiterPushing}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePushToJupiter}
                  disabled={jupiterPushing || !jupiterModal.pursuitLead}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-lg text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {jupiterPushing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Pushing...
                    </>
                  ) : (
                    <>
                      <span>☁️</span>
                      Push to Jupiter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban View Component
function KanbanView({
  oppsByStage,
  tracking,
  selectedOpp,
  setSelectedOpp,
}: {
  oppsByStage: Record<OppStatus, Opportunity[]>;
  tracking: Record<string, OppTracking>;
  selectedOpp: Opportunity | null;
  setSelectedOpp: (opp: Opportunity) => void;
}) {
  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="font-semibold text-white">Pipeline Board</h2>
      </div>

      <div className="grid grid-cols-5 divide-x divide-gray-800 min-h-[400px]">
        {STAGES.map(stage => {
          const config = STATUS_CONFIG[stage];
          const opps = oppsByStage[stage];
          const stageValue = opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

          return (
            <div key={stage} className="flex flex-col">
              {/* Stage Header */}
              <div className={`px-3 py-2 border-b border-gray-800 ${config.bg}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                  <span className={`text-xs ${config.color}`}>{opps.length}</span>
                </div>
                <div className="text-xs text-gray-500">{formatCurrency(stageValue)}</div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[350px]">
                {opps.length === 0 ? (
                  <div className="text-center text-gray-600 text-xs py-4">Empty</div>
                ) : (
	                  opps.map(opp => {
	                    const daysUntil = getDaysUntil(opp.keyDate);
	                    const isSelected = selectedOpp?.id === opp.id;
	                    const clientSize = getClientSize(opp.entity, opp.estimatedValue);
                      const freshness = freshnessBadge(opp.postedDate || opp.lastUpdated || null);
                      const confidence = confidenceBadge(opp.confidence || null);

	                    return (
                      <button
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className={`w-full p-2 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500'
                            : 'bg-[#0a0a0f] border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs">{GENESIS_PILLAR_INFO[opp.genesisPillar].icon}</span>
                          <span className={`text-[10px] px-1 rounded ${
                            MARKET_MAP[opp.entityType] === 'commercial'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {MARKET_MAP[opp.entityType] === 'commercial' ? 'C' : 'F'}
                          </span>
                          {daysUntil !== null && daysUntil <= 14 && daysUntil >= 0 && (
                            <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-400 ml-auto">
                              {daysUntil}d
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white font-medium line-clamp-2">{opp.title}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-500 truncate max-w-[80px]">{opp.entity}</span>
                          <span className="text-xs font-bold text-cyan-400">{formatCurrency(opp.estimatedValue)}</span>
                        </div>
	                        <div className="mt-1">
	                          <span className={`text-[9px] px-1 rounded ${clientSize.color}`}>{clientSize.label}</span>
	                        </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`text-[9px] px-1 rounded ${freshness.className}`}>{freshness.label}</span>
                            <span className={`text-[9px] px-1 rounded ${confidence.className}`}>{confidence.label}</span>
                          </div>
	                      </button>
	                    );
	                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Table View Component
function TableView({
  opportunities,
  tracking,
  selectedOpp,
  setSelectedOpp,
  updateStatus,
}: {
  opportunities: Opportunity[];
  tracking: Record<string, OppTracking>;
  selectedOpp: Opportunity | null;
  setSelectedOpp: (opp: Opportunity) => void;
  updateStatus: (oppId: string, status: OppStatus) => void;
}) {
  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Opportunity</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Entity</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Value</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">OT Equipment</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Stage</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {opportunities.map(opp => {
              const status = tracking[opp.id]?.status || 'on-radar';
              const statusConfig = STATUS_CONFIG[status];
              const isSelected = selectedOpp?.id === opp.id;

              return (
                <tr
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{GENESIS_PILLAR_INFO[opp.genesisPillar].icon}</span>
                      <div>
                        <div className="text-white font-medium">{opp.title}</div>
                        <div className="text-xs text-gray-500">{opp.sector}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{opp.entity}</div>
                    <div className="text-xs text-gray-500">{opp.location}, {opp.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-cyan-400 font-bold">{formatCurrency(opp.estimatedValue)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${otEquipmentClass(opp)}`}>
                      {otEquipmentLabel(opp)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {STAGE_LABELS[opp.procurementStage]}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatus(opp.id, e.target.value as OppStatus);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded text-xs border-0 focus:outline-none cursor-pointer ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Detail Panel Component
function DetailPanel({
  opportunity,
  tracking,
  updateStatus,
  editingNotes,
  setEditingNotes,
  saveNotes,
  openJupiterModal,
}: {
  opportunity: Opportunity;
  tracking: OppTracking | undefined;
  updateStatus: (oppId: string, status: OppStatus) => void;
  editingNotes: string;
  setEditingNotes: (notes: string) => void;
  saveNotes: (oppId: string, notes: string) => void;
  openJupiterModal: (opp: Opportunity) => void;
}) {
  const status = tracking?.status || 'on-radar';
  const statusConfig = STATUS_CONFIG[status];
  const clientSize = getClientSize(opportunity.entity, opportunity.estimatedValue);
  const [oppNews, setOppNews] = useState<OpportunityNewsItem[]>([]);
  const [oppNewsLoading, setOppNewsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadOpportunityNews() {
      setOppNewsLoading(true);
      try {
        const params = new URLSearchParams({
          title: opportunity.title,
          entity: opportunity.entity,
          limit: '5',
        });
        const response = await fetch(`/api/opportunity-news?${params.toString()}`, { cache: 'no-store' });
        const payload = await response.json();
        if (cancelled) return;
        const items = Array.isArray(payload.items) ? (payload.items as OpportunityNewsItem[]) : [];
        setOppNews(items);
      } catch {
        if (cancelled) return;
        setOppNews([]);
      } finally {
        if (!cancelled) setOppNewsLoading(false);
      }
    }

    void loadOpportunityNews();
    return () => {
      cancelled = true;
    };
  }, [opportunity.entity, opportunity.id, opportunity.title]);

  const officialLinks = useMemo(() => {
    const links = opportunity.sources || [];
    const scored = links.map((source) => {
      const url = (source.url || '').toLowerCase();
      const title = (source.title || '').toLowerCase();
      const isOfficialDomain = url.includes('.gov') || url.includes('sam.gov') || url.includes('usaspending.gov');
      const isRfpSignal = url.includes('sam.gov/opp') || title.includes('solicitation') || title.includes('rfp') || title.includes('notice');
      return {
        ...source,
        isOfficialDomain,
        isRfpSignal,
        score: (isOfficialDomain ? 2 : 0) + (isRfpSignal ? 2 : 0),
      };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [opportunity.sources]);

  const investmentComponents = useMemo(
    () => getInvestmentComponents(opportunity),
    [opportunity],
  );

  const addPursuitLane = (component: InvestmentComponent) => {
    const laneNote = [
      `Pursuit lane: ${component.company}`,
      `Component: ${component.component}`,
      `Stage: ${component.stage}`,
      'Next step: identify budget owner, package boundary, and procurement timing.',
    ].join('\n');
    const nextNotes = (editingNotes?.trim() ? `${editingNotes}\n\n` : '') + laneNote;
    setEditingNotes(nextNotes);
    saveNotes(opportunity.id, nextNotes);
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{GENESIS_PILLAR_INFO[opportunity.genesisPillar].icon}</span>
          <Badge className={clientSize.color + ' text-xs'}>{clientSize.label}</Badge>
          <Badge className={`text-xs ${
            MARKET_MAP[opportunity.entityType] === 'commercial'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {MARKET_MAP[opportunity.entityType] === 'commercial' ? 'Commercial' : 'Federal'}
          </Badge>
        </div>
        <h2 className="text-lg font-bold text-white">{opportunity.title}</h2>
        <p className="text-sm text-gray-400 mt-1">{opportunity.entity}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-cyan-400">{formatCurrency(opportunity.estimatedValue)}</span>
          {opportunity.responseDeadline && (
            <span className="text-xs text-gray-500">Deadline: {formatDate(opportunity.responseDeadline)}</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
        {/* WHY OT? Section */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-cyan-400">WHY OT?</h3>
            <Badge className={`text-xs ${otEquipmentClass(opportunity)}`}>
              {otEquipmentLabel(opportunity)}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            {opportunity.otSystems.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Systems: </span>
                <span className="text-cyan-300">{opportunity.otSystems.map(s => OT_SYSTEM_LABELS[s]).join(', ')}</span>
              </div>
            )}
            {opportunity.regulatoryDrivers.length > 0 && (
              <div>
                <span className="text-xs text-gray-500">Regulations: </span>
                <span className="text-yellow-300">{opportunity.regulatoryDrivers.map(r => REGULATORY_LABELS[r]).join(', ')}</span>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-500">Scope: </span>
              <span className="text-gray-300">{opportunity.otScope}</span>
            </div>
          </div>

          {/* OT Equipment Signal */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Equipment Signal</span>
              <span className={hasOtEquipment(opportunity) ? 'text-emerald-300' : 'text-slate-300'}>
                {hasOtEquipment(opportunity) ? 'Present' : 'Not Confirmed'}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${hasOtEquipment(opportunity) ? 'bg-emerald-500 w-full' : 'bg-slate-500 w-2/5'}`}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">STATUS</div>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => {
              const config = STATUS_CONFIG[s];
              const isActive = status === s;
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(opportunity.id, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isActive
                      ? `${config.bg} ${config.color} border-current`
                      : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:text-white'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Push to Jupiter */}
        {(['contacted', 'meeting', 'proposal'].includes(status)) && !tracking?.salesforce_id && (
          <button
            onClick={() => openJupiterModal(opportunity)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 transition-all flex items-center justify-center gap-2"
          >
            <span>☁️</span>
            Push to Jupiter
          </button>
        )}

        {tracking?.salesforce_id && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <span className="text-green-400 text-sm">✓ Synced to Jupiter</span>
          </div>
        )}

        {/* Program / Investment Breakdown */}
        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span>🏗️</span>
            <h3 className="text-sm font-medium text-white">Investment Breakdown (Refined View)</h3>
          </div>
          <p className="mb-2 text-xs text-gray-500">
            Break large programs into company-level pursuit lanes with specific components.
          </p>
          <div className="space-y-2">
            {investmentComponents.map((component) => (
              <div key={component.id} className="rounded-lg border border-gray-800 bg-gray-800/40 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm text-cyan-200">{component.company}</div>
                    <div className="text-xs text-gray-300">{component.component}</div>
                    <div className="text-[11px] text-gray-500">
                      {component.stage}{component.amount ? ` • ${formatCurrency(component.amount)}` : ' • value TBD'}
                    </div>
                  </div>
                  <button
                    onClick={() => addPursuitLane(component)}
                    className="rounded border border-cyan-500/40 px-2 py-1 text-[11px] text-cyan-300 hover:bg-cyan-500/10"
                  >
                    Pursue lane
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download PDF */}
        <button
          onClick={() => generateExecutiveBriefPDF(opportunity, tracking)}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
        >
          <span>📄</span>
          Download Executive Brief
        </button>

        {/* Sources */}
        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span>📎</span>
            <h3 className="text-sm font-medium text-white">Sources</h3>
          </div>

          {opportunity.sources && opportunity.sources.length > 0 ? (
            <div className="space-y-2">
              {opportunity.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors group text-sm"
                >
                  <div>
                    <div className="text-white group-hover:text-cyan-300">{source.title}</div>
                    <div className="text-xs text-gray-500">{source.date}</div>
                  </div>
                  <span className="text-gray-500 group-hover:text-cyan-400">→</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sources linked</div>
          )}

          {/* Quick Links */}
          <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(opportunity.entity + ' ' + opportunity.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700"
            >
              🔍 Search
            </a>
            {opportunity.entityType === 'federal' && (
              <a
                href={`https://sam.gov/search/?keywords=${encodeURIComponent(opportunity.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700"
              >
                📋 SAM.gov
              </a>
            )}
          </div>
        </div>

        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span>🧭</span>
            <h3 className="text-sm font-medium text-white">Official / RFP Links</h3>
          </div>
          {officialLinks.length === 0 ? (
            <p className="text-sm text-gray-500">No official links tagged for this opportunity yet.</p>
          ) : (
            <div className="space-y-2">
              {officialLinks.map((link, idx) => (
                <a
                  key={`${link.url}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-800 bg-gray-800/40 p-2 hover:border-cyan-500/40"
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    {link.isOfficialDomain ? <span className="rounded bg-emerald-500/20 px-1 text-emerald-300">Official</span> : null}
                    {link.isRfpSignal ? <span className="rounded bg-cyan-500/20 px-1 text-cyan-300">RFP/Notice</span> : null}
                    <span className="text-gray-500">{link.date}</span>
                  </div>
                  <div className="text-sm text-gray-100">{link.title}</div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span>📰</span>
            <h3 className="text-sm font-medium text-white">Recent Coverage</h3>
          </div>
          {oppNewsLoading ? (
            <p className="text-sm text-gray-500">Loading related news…</p>
          ) : oppNews.length === 0 ? (
            <p className="text-sm text-gray-500">No recent matching articles found for this opportunity.</p>
          ) : (
            <div className="space-y-2">
              {oppNews.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-gray-800 bg-gray-800/40 p-2 hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-300">{item.source}</span>
                    <span className="text-gray-500">{getRelativeTime(item.publishedAt)}</span>
                  </div>
                  <div className="text-sm text-gray-100 line-clamp-2">{item.title}</div>
                  <div className="text-xs text-gray-400 line-clamp-2">{item.snippet}</div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-[#0a0a0f] rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-2">NOTES</div>
          <textarea
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            onBlur={() => saveNotes(opportunity.id, editingNotes)}
            placeholder="Add notes..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-500"
            rows={3}
          />
        </div>

        {/* Deloitte Services */}
        <div>
          <div className="text-xs text-gray-500 mb-2">DELOITTE SERVICES</div>
          <div className="flex flex-wrap gap-1">
            {opportunity.deloitteServices.map(svc => (
              <Badge key={svc} variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                {DELOITTE_SERVICE_LABELS[svc]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        {tracking?.activity && tracking.activity.length > 0 && (
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2">RECENT ACTIVITY</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[...tracking.activity].reverse().slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-start gap-2 text-xs">
                  <span className={`${
                    entry.type === 'status-change' ? 'text-purple-400' :
                    entry.type === 'jupiter-push' ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {entry.type === 'status-change' ? '→' : entry.type === 'jupiter-push' ? '☁️' : '+'}
                  </span>
                  <div>
                    <span className="text-gray-300">{entry.details}</span>
                    <span className="text-gray-600 ml-2">{getRelativeTime(entry.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export with Suspense boundary for useSearchParams
export default function OTPipelineTracker() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading pipeline...</p>
        </div>
      </div>
    }>
      <OTPipelineTrackerContent />
    </Suspense>
  );
}
