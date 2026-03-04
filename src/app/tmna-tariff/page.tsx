'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ScenarioKey = 'current' | 'escalated' | 'targeted_relief';

type CountryCode = 'US' | 'MX' | 'CA' | 'JP' | 'KR' | 'VN' | 'CN';

interface CountryProfile {
  code: CountryCode;
  name: string;
  costIndex: number;
  logisticsPerUnit: number;
  leadDays: number;
  risk: number;
  carbonIndex: number;
}

interface TariffScenario {
  id: ScenarioKey;
  label: string;
  detail: string;
  rates: Record<CountryCode, number>;
}

interface ProgramFamily {
  id: string;
  label: string;
  annualUnits: number;
  baseCost: number;
  currentMix: Record<CountryCode, number>;
}

interface MixResult {
  country: CountryCode;
  share: number;
  currentShare: number;
  landedCost: number;
  score: number;
}

interface PolicySignal {
  date: string;
  title: string;
  risk: 'medium' | 'high' | 'critical';
  implication: string;
}

interface MaterialDependency {
  material: string;
  primaryUse: string;
  highRiskSources: CountryCode[];
  riskLevel: 'elevated' | 'high' | 'critical';
  mitigation: string;
}

interface LogisticsLane {
  lane: string;
  mode: 'truck' | 'ocean' | 'rail' | 'mixed';
  leadDays: number;
  variability: number;
  chokepoint: string;
}

interface SupplierWatchItem {
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  focus: string;
  signal: string;
  exposure: string;
}

interface TariffFeedEntry {
  id: string;
  countryCode: CountryCode;
  hsPrefix: string;
  tariffRate: number;
  authority: string;
  effectiveDate: string;
  sourceLabel?: string;
}

interface TreasuryOverlay {
  customsCollectionsLatest: number | null;
  sampleCount: number;
  sourceUrl: string;
  fetchedAt: string;
}

interface SupplierProfile {
  id: string;
  name: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  countryCode: CountryCode;
  hsPrefix: string;
  category: string;
  annualSpend: number;
  criticality: 'medium' | 'high' | 'critical';
}

type IndustryKey = 'automotive' | 'semiconductors' | 'utilities' | 'pharma';

interface IndustryProfile {
  key: IndustryKey;
  label: string;
  accountLabel: string;
  programs: ProgramFamily[];
  suppliers: SupplierProfile[];
}

interface ScenarioPreset {
  id: 'conservative' | 'balanced' | 'aggressive';
  label: string;
  config: {
    scenarioId: ScenarioKey;
    riskWeight: number;
    maxShift: number;
    minNorthAmericaShare: number;
    hedgeCoverage: number;
    useTreasuryFeed: boolean;
  };
}

interface IndustryBenchmark {
  headline: string;
  detail: string;
}

const COUNTRY_PROFILES: CountryProfile[] = [
  { code: 'US', name: 'United States', costIndex: 1.14, logisticsPerUnit: 8, leadDays: 8, risk: 0.09, carbonIndex: 0.45 },
  { code: 'MX', name: 'Mexico', costIndex: 0.92, logisticsPerUnit: 10, leadDays: 11, risk: 0.14, carbonIndex: 0.55 },
  { code: 'CA', name: 'Canada', costIndex: 1.01, logisticsPerUnit: 12, leadDays: 10, risk: 0.08, carbonIndex: 0.5 },
  { code: 'JP', name: 'Japan', costIndex: 1.06, logisticsPerUnit: 19, leadDays: 24, risk: 0.11, carbonIndex: 0.62 },
  { code: 'KR', name: 'South Korea', costIndex: 0.97, logisticsPerUnit: 18, leadDays: 22, risk: 0.12, carbonIndex: 0.67 },
  { code: 'VN', name: 'Vietnam', costIndex: 0.84, logisticsPerUnit: 21, leadDays: 28, risk: 0.22, carbonIndex: 0.78 },
  { code: 'CN', name: 'China', costIndex: 0.8, logisticsPerUnit: 23, leadDays: 30, risk: 0.27, carbonIndex: 0.86 },
];

const SCENARIOS: TariffScenario[] = [
  {
    id: 'current',
    label: 'Current Actions',
    detail: 'Current tariff posture with selective duties and exemptions.',
    rates: { US: 0, MX: 0.03, CA: 0.02, JP: 0.05, KR: 0.06, VN: 0.12, CN: 0.27 },
  },
  {
    id: 'escalated',
    label: 'Escalation Shock',
    detail: 'Broad duty expansion and faster enforcement.',
    rates: { US: 0, MX: 0.06, CA: 0.03, JP: 0.08, KR: 0.1, VN: 0.19, CN: 0.4 },
  },
  {
    id: 'targeted_relief',
    label: 'Targeted Relief',
    detail: 'Preferred nearshore treatment for USMCA-linked inputs.',
    rates: { US: 0, MX: 0.01, CA: 0.01, JP: 0.05, KR: 0.05, VN: 0.1, CN: 0.22 },
  },
];

const AUTOMOTIVE_PROGRAMS: ProgramFamily[] = [
  {
    id: 'battery',
    label: 'EV Battery Pack Components',
    annualUnits: 240000,
    baseCost: 6800,
    currentMix: { US: 0.08, MX: 0.16, CA: 0.05, JP: 0.19, KR: 0.2, VN: 0.07, CN: 0.25 },
  },
  {
    id: 'powertrain',
    label: 'Powertrain & Drivetrain Modules',
    annualUnits: 520000,
    baseCost: 3600,
    currentMix: { US: 0.14, MX: 0.21, CA: 0.08, JP: 0.2, KR: 0.1, VN: 0.06, CN: 0.21 },
  },
  {
    id: 'electronics',
    label: 'Control Units & Electronics',
    annualUnits: 730000,
    baseCost: 1750,
    currentMix: { US: 0.1, MX: 0.14, CA: 0.05, JP: 0.19, KR: 0.18, VN: 0.12, CN: 0.22 },
  },
  {
    id: 'interior',
    label: 'Interior & Seating Systems',
    annualUnits: 980000,
    baseCost: 930,
    currentMix: { US: 0.18, MX: 0.26, CA: 0.07, JP: 0.08, KR: 0.08, VN: 0.11, CN: 0.22 },
  },
  {
    id: 'body',
    label: 'Body Panels & Stamped Structures',
    annualUnits: 910000,
    baseCost: 640,
    currentMix: { US: 0.22, MX: 0.31, CA: 0.1, JP: 0.08, KR: 0.07, VN: 0.06, CN: 0.16 },
  },
];

const NORTH_AMERICA: CountryCode[] = ['US', 'MX', 'CA'];
const COUNTRY_BY_CODE = Object.fromEntries(COUNTRY_PROFILES.map((country) => [country.code, country])) as Record<
  CountryCode,
  CountryProfile
>;

const POLICY_SIGNALS: PolicySignal[] = [
  {
    date: 'Q2 2026',
    title: 'Duty Classification Enforcement Wave',
    risk: 'high',
    implication: 'Increased customs scrutiny on mixed-origin automotive subassemblies and transfer-pricing records.',
  },
  {
    date: 'Q3 2026',
    title: 'Section 301 Scope Review Window',
    risk: 'critical',
    implication: 'Potential expansion to additional electronics and battery-adjacent categories with short implementation lead.',
  },
  {
    date: 'Q4 2026',
    title: 'USMCA Rules-of-Origin Audit Cycle',
    risk: 'high',
    implication: 'Higher probability of retroactive duty assessments for weak regional value-content documentation.',
  },
  {
    date: 'Q1 2027',
    title: 'Port Throughput and Ocean Contract Reset',
    risk: 'medium',
    implication: 'Contract rebasing may widen spread between stable and volatile East/West coast flows.',
  },
];

const MATERIAL_DEPENDENCIES: MaterialDependency[] = [
  {
    material: 'Battery Cathode Inputs',
    primaryUse: 'EV battery modules',
    highRiskSources: ['CN', 'KR'],
    riskLevel: 'critical',
    mitigation: 'Dual-source processing in MX/US and negotiate indexed pass-through clauses.',
  },
  {
    material: 'Power Semiconductor Packages',
    primaryUse: 'Inverters and control units',
    highRiskSources: ['JP', 'KR', 'CN'],
    riskLevel: 'high',
    mitigation: 'Pre-approve alternates with common pinout and harmonize qualification data packs.',
  },
  {
    material: 'Stamped Steel Subcomponents',
    primaryUse: 'Body and chassis structures',
    highRiskSources: ['CN', 'VN'],
    riskLevel: 'elevated',
    mitigation: 'Rebalance to MX/US mills and lock quarterly capacity options.',
  },
  {
    material: 'Wire Harness and Connectors',
    primaryUse: 'Interior and electronics',
    highRiskSources: ['VN', 'CN'],
    riskLevel: 'high',
    mitigation: 'Build alternate BOM path with Mexico regional suppliers and phased PPAP.',
  },
];

const LOGISTICS_LANES: LogisticsLane[] = [
  { lane: 'CN to US West Coast to MX Final Assembly', mode: 'mixed', leadDays: 34, variability: 0.29, chokepoint: 'Port dwell and drayage availability' },
  { lane: 'JP to US Gulf to NA Plants', mode: 'ocean', leadDays: 28, variability: 0.18, chokepoint: 'Vessel blank sailings and feeder delays' },
  { lane: 'MX to TX and KY Plants', mode: 'truck', leadDays: 5, variability: 0.08, chokepoint: 'Border crossing cycle time' },
  { lane: 'CA to Midwest Plant Network', mode: 'rail', leadDays: 7, variability: 0.09, chokepoint: 'Rail congestion during seasonal peak' },
];

const SUPPLIER_WATCHLIST: SupplierWatchItem[] = [
  {
    tier: 'Tier 1',
    focus: 'Major module integrators',
    signal: 'Pass-through contract language lagging on tariff reset terms.',
    exposure: 'Margin compression and delayed recovery.',
  },
  {
    tier: 'Tier 2',
    focus: 'Semiconductor packaging + board assembly',
    signal: 'Long qualification queue for alternate footprint components.',
    exposure: 'Line-stop risk in control electronics.',
  },
  {
    tier: 'Tier 3',
    focus: 'Raw and intermediate material processors',
    signal: 'Single-country dependency and low inventory transparency.',
    exposure: 'Sudden unit-cost spikes and quality escape probability.',
  },
];

const AUTOMOTIVE_SUPPLIERS: SupplierProfile[] = [
  { id: 'sup-01', name: 'Aisin North America Components', tier: 'Tier 1', countryCode: 'MX', hsPrefix: '8708', category: 'Powertrain assemblies', annualSpend: 430000000, criticality: 'critical' },
  { id: 'sup-02', name: 'Denso Thermal Systems', tier: 'Tier 1', countryCode: 'JP', hsPrefix: '8415', category: 'Thermal management', annualSpend: 290000000, criticality: 'high' },
  { id: 'sup-03', name: 'Panasonic Energy Modules', tier: 'Tier 1', countryCode: 'US', hsPrefix: '8507', category: 'Battery modules', annualSpend: 510000000, criticality: 'critical' },
  { id: 'sup-04', name: 'LG Mobility Electronics', tier: 'Tier 1', countryCode: 'KR', hsPrefix: '8537', category: 'Control electronics', annualSpend: 265000000, criticality: 'high' },
  { id: 'sup-05', name: 'Yazaki Harness Network', tier: 'Tier 2', countryCode: 'VN', hsPrefix: '8544', category: 'Wire harnesses', annualSpend: 185000000, criticality: 'high' },
  { id: 'sup-06', name: 'SAIC Precision Castings', tier: 'Tier 2', countryCode: 'CN', hsPrefix: '7326', category: 'Stamped/cast metal', annualSpend: 220000000, criticality: 'medium' },
  { id: 'sup-07', name: 'Magna Seating Systems', tier: 'Tier 1', countryCode: 'CA', hsPrefix: '9401', category: 'Interior/seating', annualSpend: 175000000, criticality: 'medium' },
  { id: 'sup-08', name: 'Aptiv Borderline Modules', tier: 'Tier 2', countryCode: 'MX', hsPrefix: '8536', category: 'Connectivity modules', annualSpend: 160000000, criticality: 'high' },
];

const SEMICONDUCTOR_PROGRAMS: ProgramFamily[] = [
  { id: 'fab-equip', label: 'Fab Equipment Control Modules', annualUnits: 160000, baseCost: 7400, currentMix: { US: 0.16, MX: 0.08, CA: 0.06, JP: 0.19, KR: 0.18, VN: 0.08, CN: 0.25 } },
  { id: 'process-chem', label: 'Process Chemical Delivery Systems', annualUnits: 280000, baseCost: 2900, currentMix: { US: 0.13, MX: 0.09, CA: 0.07, JP: 0.18, KR: 0.17, VN: 0.1, CN: 0.26 } },
  { id: 'cleanroom', label: 'Cleanroom Sensors & Controllers', annualUnits: 520000, baseCost: 1200, currentMix: { US: 0.14, MX: 0.1, CA: 0.05, JP: 0.2, KR: 0.19, VN: 0.12, CN: 0.2 } },
];

const SEMICONDUCTOR_SUPPLIERS: SupplierProfile[] = [
  { id: 'semi-01', name: 'Tokyo Electron Controls', tier: 'Tier 1', countryCode: 'JP', hsPrefix: '9032', category: 'Process controls', annualSpend: 320000000, criticality: 'critical' },
  { id: 'semi-02', name: 'Applied Systems Integration', tier: 'Tier 1', countryCode: 'US', hsPrefix: '8479', category: 'Fab subsystems', annualSpend: 280000000, criticality: 'high' },
  { id: 'semi-03', name: 'ASE Package Network', tier: 'Tier 2', countryCode: 'VN', hsPrefix: '8542', category: 'Package/test', annualSpend: 190000000, criticality: 'high' },
  { id: 'semi-04', name: 'Shanghai Wafer Services', tier: 'Tier 2', countryCode: 'CN', hsPrefix: '3818', category: 'Wafer materials', annualSpend: 210000000, criticality: 'medium' },
];

const UTILITIES_PROGRAMS: ProgramFamily[] = [
  { id: 'substation', label: 'Substation Automation Hardware', annualUnits: 120000, baseCost: 5400, currentMix: { US: 0.2, MX: 0.13, CA: 0.07, JP: 0.14, KR: 0.13, VN: 0.09, CN: 0.24 } },
  { id: 'grid-comms', label: 'Grid Comms & Relay Equipment', annualUnits: 340000, baseCost: 1900, currentMix: { US: 0.18, MX: 0.16, CA: 0.08, JP: 0.16, KR: 0.14, VN: 0.1, CN: 0.18 } },
  { id: 'metering', label: 'Advanced Metering Components', annualUnits: 880000, baseCost: 620, currentMix: { US: 0.15, MX: 0.18, CA: 0.08, JP: 0.11, KR: 0.1, VN: 0.14, CN: 0.24 } },
];

const UTILITIES_SUPPLIERS: SupplierProfile[] = [
  { id: 'util-01', name: 'Schneider Grid Devices', tier: 'Tier 1', countryCode: 'MX', hsPrefix: '8537', category: 'Substation controllers', annualSpend: 260000000, criticality: 'high' },
  { id: 'util-02', name: 'Hitachi Relay Systems', tier: 'Tier 1', countryCode: 'JP', hsPrefix: '8536', category: 'Protection relays', annualSpend: 180000000, criticality: 'critical' },
  { id: 'util-03', name: 'Itron Metering Components', tier: 'Tier 2', countryCode: 'US', hsPrefix: '9028', category: 'Metering', annualSpend: 160000000, criticality: 'medium' },
  { id: 'util-04', name: 'Delta Comms Modules', tier: 'Tier 2', countryCode: 'CN', hsPrefix: '8517', category: 'Grid comms', annualSpend: 140000000, criticality: 'medium' },
];

const PHARMA_PROGRAMS: ProgramFamily[] = [
  { id: 'cold-chain', label: 'Cold-Chain Packaging Systems', annualUnits: 410000, baseCost: 980, currentMix: { US: 0.19, MX: 0.14, CA: 0.09, JP: 0.13, KR: 0.11, VN: 0.11, CN: 0.23 } },
  { id: 'bioprocess', label: 'Bioprocess Single-Use Components', annualUnits: 260000, baseCost: 2500, currentMix: { US: 0.2, MX: 0.12, CA: 0.08, JP: 0.17, KR: 0.14, VN: 0.09, CN: 0.2 } },
  { id: 'quality', label: 'Quality Lab Automation Electronics', annualUnits: 540000, baseCost: 740, currentMix: { US: 0.16, MX: 0.12, CA: 0.08, JP: 0.18, KR: 0.16, VN: 0.11, CN: 0.19 } },
];

const PHARMA_SUPPLIERS: SupplierProfile[] = [
  { id: 'pha-01', name: 'Thermo Process Components', tier: 'Tier 1', countryCode: 'US', hsPrefix: '9027', category: 'Lab automation', annualSpend: 210000000, criticality: 'high' },
  { id: 'pha-02', name: 'Sartorius Bioprocess Parts', tier: 'Tier 1', countryCode: 'CA', hsPrefix: '8419', category: 'Bioprocess components', annualSpend: 180000000, criticality: 'critical' },
  { id: 'pha-03', name: 'Nipro Sterile Assemblies', tier: 'Tier 2', countryCode: 'VN', hsPrefix: '3926', category: 'Single-use assemblies', annualSpend: 130000000, criticality: 'high' },
  { id: 'pha-04', name: 'Shenzhen Cold Pack Supply', tier: 'Tier 2', countryCode: 'CN', hsPrefix: '3923', category: 'Cold-chain packaging', annualSpend: 150000000, criticality: 'medium' },
];

const INDUSTRY_PROFILES: Record<IndustryKey, IndustryProfile> = {
  automotive: {
    key: 'automotive',
    label: 'Automotive',
    accountLabel: 'Toyota Motor North America (TMNA)',
    programs: AUTOMOTIVE_PROGRAMS,
    suppliers: AUTOMOTIVE_SUPPLIERS,
  },
  semiconductors: {
    key: 'semiconductors',
    label: 'Semiconductors',
    accountLabel: 'Sample Semiconductor Account',
    programs: SEMICONDUCTOR_PROGRAMS,
    suppliers: SEMICONDUCTOR_SUPPLIERS,
  },
  utilities: {
    key: 'utilities',
    label: 'Utilities',
    accountLabel: 'Sample Utility Account',
    programs: UTILITIES_PROGRAMS,
    suppliers: UTILITIES_SUPPLIERS,
  },
  pharma: {
    key: 'pharma',
    label: 'Pharma',
    accountLabel: 'Sample Pharma Account',
    programs: PHARMA_PROGRAMS,
    suppliers: PHARMA_SUPPLIERS,
  },
};

const INDUSTRY_BENCHMARKS: Record<IndustryKey, IndustryBenchmark> = {
  automotive: {
    headline: '~$9.5B',
    detail: 'Toyota discussed a global tariff benchmark around US$9.5B on Aug 7, 2025 (public context only).',
  },
  semiconductors: {
    headline: 'Client-specific',
    detail: 'No single public benchmark used in this demo. Calibrate with supplier spend and HTS exposure by node.',
  },
  utilities: {
    headline: 'Client-specific',
    detail: 'Use utility equipment import mix and long-lead grid hardware exposure to build benchmark context.',
  },
  pharma: {
    headline: 'Client-specific',
    detail: 'Use API/intermediate import exposure and cold-chain component mix for a pharma tariff benchmark.',
  },
};

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'conservative',
    label: 'Conservative',
    config: { scenarioId: 'current', riskWeight: 1.1, maxShift: 14, minNorthAmericaShare: 66, hedgeCoverage: 20, useTreasuryFeed: true },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    config: { scenarioId: 'escalated', riskWeight: 0.85, maxShift: 26, minNorthAmericaShare: 62, hedgeCoverage: 12, useTreasuryFeed: true },
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    config: { scenarioId: 'targeted_relief', riskWeight: 0.6, maxShift: 38, minNorthAmericaShare: 55, hedgeCoverage: 6, useTreasuryFeed: true },
  },
];

const INDUSTRY_DEFAULT_PRESET: Record<IndustryKey, ScenarioPreset['id']> = {
  automotive: 'balanced',
  semiconductors: 'conservative',
  utilities: 'conservative',
  pharma: 'balanced',
};

const DATA_READINESS_ITEMS = [
  'Supplier master with legal entity, plant, and country of origin',
  '12-month supplier spend by SKU/part family',
  'HS/HTS code mapping at supplier-part level',
  'Incoterms and tariff pass-through clauses for top contracts',
  'Lane-level lead time, variability, and expedited freight history',
  'Dual-source qualification status (PPAP), alternates, and ramp capacity',
];

const toCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const toPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

function normalize(mix: Record<CountryCode, number>) {
  const total = Object.values(mix).reduce((sum, v) => sum + v, 0) || 1;
  (Object.keys(mix) as CountryCode[]).forEach((country) => {
    mix[country] = Math.max(0, mix[country] / total);
  });
}

function clampCountryCap(mix: Record<CountryCode, number>, cap = 0.64) {
  const overflow = (Object.keys(mix) as CountryCode[]).reduce((sum, country) => {
    if (mix[country] <= cap) return sum;
    const extra = mix[country] - cap;
    mix[country] = cap;
    return sum + extra;
  }, 0);

  if (overflow <= 0) return;

  const eligible = (Object.keys(mix) as CountryCode[]).filter((country) => mix[country] < cap);
  const room = eligible.reduce((sum, country) => sum + (cap - mix[country]), 0);
  if (room <= 0) return;

  eligible.forEach((country) => {
    const shareOfRoom = (cap - mix[country]) / room;
    mix[country] += overflow * shareOfRoom;
  });
}

export default function TariffNavigatorPage() {
  const [industryKey, setIndustryKey] = useState<IndustryKey>('automotive');
  const [scenarioId, setScenarioId] = useState<ScenarioKey>('escalated');
  const [riskWeight, setRiskWeight] = useState(0.85);
  const [maxShift, setMaxShift] = useState(26);
  const [minNorthAmericaShare, setMinNorthAmericaShare] = useState(62);
  const [hedgeCoverage, setHedgeCoverage] = useState(12);
  const [selectedPresetId, setSelectedPresetId] = useState<ScenarioPreset['id']>('balanced');
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [useTreasuryFeed, setUseTreasuryFeed] = useState(true);
  const [tariffFeed, setTariffFeed] = useState<TariffFeedEntry[]>([]);
  const [feedMeta, setFeedMeta] = useState<{
    sourceUrl: string;
    ustrSourceUrl: string | null;
    fetchedAt: string;
    fallbackUsed: boolean;
    treasuryOverlay: TreasuryOverlay | null;
  } | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const industryProfile = INDUSTRY_PROFILES[industryKey];
  const industryBenchmark = INDUSTRY_BENCHMARKS[industryKey];
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0];

  useEffect(() => {
    let cancelled = false;

    async function loadTariffFeed() {
      try {
        const response = await fetch('/api/tmna-tariffs', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Tariff feed request failed: ${response.status}`);
        const payload = await response.json();
        if (cancelled) return;

        const entries = Array.isArray(payload.entries) ? (payload.entries as TariffFeedEntry[]) : [];
        setTariffFeed(entries);
        setFeedMeta({
          sourceUrl: String(payload.sourceUrl || ''),
          ustrSourceUrl: payload.ustrSourceUrl ? String(payload.ustrSourceUrl) : null,
          fetchedAt: String(payload.fetchedAt || ''),
          fallbackUsed: Boolean(payload.fallbackUsed),
          treasuryOverlay: payload.treasuryOverlay ? (payload.treasuryOverlay as TreasuryOverlay) : null,
        });
        setFeedError(null);
      } catch (error) {
        if (cancelled) return;
        setFeedError(error instanceof Error ? error.message : 'Failed to load tariff feed');
      }
    }

    void loadTariffFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  const feedRatesByCountry = useMemo(() => {
    const grouped: Record<CountryCode, { weightedRate: number; totalWeight: number }> = {
      US: { weightedRate: 0, totalWeight: 0 },
      MX: { weightedRate: 0, totalWeight: 0 },
      CA: { weightedRate: 0, totalWeight: 0 },
      JP: { weightedRate: 0, totalWeight: 0 },
      KR: { weightedRate: 0, totalWeight: 0 },
      VN: { weightedRate: 0, totalWeight: 0 },
      CN: { weightedRate: 0, totalWeight: 0 },
    };

    tariffFeed.forEach((entry) => {
      const weight = entry.hsPrefix.length >= 4 ? 1.2 : 1;
      grouped[entry.countryCode].weightedRate += entry.tariffRate * weight;
      grouped[entry.countryCode].totalWeight += weight;
    });

    const out: Record<CountryCode, number> = { US: 0, MX: 0, CA: 0, JP: 0, KR: 0, VN: 0, CN: 0 };
    (Object.keys(grouped) as CountryCode[]).forEach((country) => {
      if (grouped[country].totalWeight > 0) {
        out[country] = grouped[country].weightedRate / grouped[country].totalWeight;
      }
    });
    return out;
  }, [tariffFeed]);

  const effectiveTariffRates = useMemo(() => {
    const hasFeed = tariffFeed.length > 0;
    if (!useTreasuryFeed || !hasFeed) return scenario.rates;
    const merged: Record<CountryCode, number> = { ...scenario.rates };
    (Object.keys(merged) as CountryCode[]).forEach((country) => {
      if (feedRatesByCountry[country] > 0 || country === 'US') merged[country] = feedRatesByCountry[country];
    });
    return merged;
  }, [feedRatesByCountry, scenario.rates, tariffFeed.length, useTreasuryFeed]);

  const model = useMemo(() => {
    const programResults = industryProfile.programs.map((program) => {
      const options = COUNTRY_PROFILES.map((country): MixResult => {
        const tariff = effectiveTariffRates[country.code] * (1 - hedgeCoverage / 100);
        const landedCost = program.baseCost * country.costIndex * (1 + tariff) + country.logisticsPerUnit;
        const score =
          landedCost +
          riskWeight * (country.risk * program.baseCost * 0.55 + country.leadDays * 1.2 + country.carbonIndex * 18);

        return {
          country: country.code,
          share: 0,
          currentShare: program.currentMix[country.code],
          landedCost,
          score,
        };
      });

      const sumScores = options.reduce((sum, option) => sum + 1 / option.score, 0);
      const target: Record<CountryCode, number> = {
        US: 0,
        MX: 0,
        CA: 0,
        JP: 0,
        KR: 0,
        VN: 0,
        CN: 0,
      };

      options.forEach((option) => {
        const baseTarget = (1 / option.score) / sumScores;
        const naBoost = NORTH_AMERICA.includes(option.country) ? 1 + minNorthAmericaShare / 180 : 1;
        target[option.country] = baseTarget * naBoost;
      });
      normalize(target);
      clampCountryCap(target);
      normalize(target);

      const alpha = Math.min(1, maxShift / 60);
      const recommendedMix: Record<CountryCode, number> = {
        US: 0,
        MX: 0,
        CA: 0,
        JP: 0,
        KR: 0,
        VN: 0,
        CN: 0,
      };

      (Object.keys(recommendedMix) as CountryCode[]).forEach((country) => {
        recommendedMix[country] = program.currentMix[country] + (target[country] - program.currentMix[country]) * alpha;
      });
      clampCountryCap(recommendedMix);
      normalize(recommendedMix);

      const currentCost = options.reduce(
        (sum, option) => sum + option.currentShare * option.landedCost * program.annualUnits,
        0
      );
      const recommendedCost = options.reduce(
        (sum, option) => sum + recommendedMix[option.country] * option.landedCost * program.annualUnits,
        0
      );

      const weightedRisk = options.reduce((sum, option) => sum + recommendedMix[option.country] * COUNTRY_BY_CODE[option.country].risk, 0);

      return {
        program,
        options,
        recommendedMix,
        currentCost,
        recommendedCost,
        savings: currentCost - recommendedCost,
        weightedRisk,
      };
    });

    const totalCurrent = programResults.reduce((sum, item) => sum + item.currentCost, 0);
    const totalRecommended = programResults.reduce((sum, item) => sum + item.recommendedCost, 0);

    const exposureByCountry: Record<CountryCode, number> = {
      US: 0,
      MX: 0,
      CA: 0,
      JP: 0,
      KR: 0,
      VN: 0,
      CN: 0,
    };

    let northAmericaSpend = 0;
    let totalSpend = 0;

    programResults.forEach((item) => {
      item.options.forEach((option) => {
        const spend = item.recommendedMix[option.country] * option.landedCost * item.program.annualUnits;
        exposureByCountry[option.country] += spend;
        totalSpend += spend;
        if (NORTH_AMERICA.includes(option.country)) northAmericaSpend += spend;
      });
    });

    const actions = programResults
      .map((item) => {
        const biggestCut = (Object.keys(item.program.currentMix) as CountryCode[])
          .map((country) => ({
            country,
            delta: item.recommendedMix[country] - item.program.currentMix[country],
          }))
          .sort((a, b) => a.delta - b.delta)[0];

        const biggestAdd = (Object.keys(item.program.currentMix) as CountryCode[])
          .map((country) => ({
            country,
            delta: item.recommendedMix[country] - item.program.currentMix[country],
          }))
          .sort((a, b) => b.delta - a.delta)[0];

        return {
          label: item.program.label,
          savings: item.savings,
          statement: `Shift ${Math.abs(biggestCut.delta * 100).toFixed(1)}% of ${item.program.label} from ${
            biggestCut.country
          } to ${biggestAdd.country} to cut tariff exposure and lead-time risk.`,
        };
      })
      .sort((a, b) => b.savings - a.savings);

    const weightedRisk = programResults.reduce((sum, item) => sum + item.weightedRisk, 0) / programResults.length;
    const weightedLeadTime =
      programResults.reduce(
        (sum, item) =>
          sum +
          item.options.reduce((sub, option) => sub + item.recommendedMix[option.country] * COUNTRY_BY_CODE[option.country].leadDays, 0),
        0
      ) / programResults.length;

    const averageTariffRate =
      programResults.reduce(
        (sum, item) =>
          sum +
          item.options.reduce((sub, option) => sub + item.recommendedMix[option.country] * effectiveTariffRates[option.country], 0),
        0
      ) / programResults.length;

    const highTariffSpend = (Object.keys(exposureByCountry) as CountryCode[]).reduce((sum, code) => {
      if (effectiveTariffRates[code] < 0.15) return sum;
      return sum + exposureByCountry[code];
    }, 0);

    const chinaShare = exposureByCountry.CN / (totalSpend || 1);

    return {
      programResults,
      totalCurrent,
      totalRecommended,
      totalSavings: totalCurrent - totalRecommended,
      marginLiftBps: ((totalCurrent - totalRecommended) / totalCurrent) * 10000,
      northAmericaShare: northAmericaSpend / (totalSpend || 1),
      weightedRisk,
      weightedLeadTime,
      averageTariffRate,
      highTariffShare: highTariffSpend / (totalSpend || 1),
      chinaShare,
      exposureByCountry,
      actions,
    };
  }, [effectiveTariffRates, hedgeCoverage, industryProfile.programs, maxShift, minNorthAmericaShare, riskWeight]);

  const executionPlaybook = useMemo(() => {
    const lineSpeedMessage =
      model.weightedLeadTime > 20
        ? 'Activate premium freight guardrails on high-variance lanes for 8-12 weeks.'
        : 'Maintain standard freight profile and focus on customs-document acceleration.';
    const concentrationMessage =
      model.chinaShare > 0.18
        ? 'Launch supplier migration sprint for the top 25 China-heavy SKUs.'
        : 'Hold China exposure at current level and focus on supplier term optimization.';

    return [
      {
        horizon: '0-30 Days',
        items: [
          'Freeze tariff-sensitive BOM families and trigger rapid HS code revalidation.',
          `Reprice top contracts with indexed duty clauses; hedge coverage now ${hedgeCoverage}%.`,
          lineSpeedMessage,
        ],
      },
      {
        horizon: '31-60 Days',
        items: [
          'Award bridge volumes to MX/US alternates for battery and electronics families.',
          concentrationMessage,
          'Stand up weekly CFO/COO tariff war-room with customs, procurement, and plant operations.',
        ],
      },
      {
        horizon: '61-90 Days',
        items: [
          `Lock structural nearshore posture at >= ${minNorthAmericaShare}% regional spend share.`,
          'Finalize PPAP and quality signoffs for dual-source critical components.',
          'Embed scenario model into monthly S&OP and supplier business reviews.',
        ],
      },
    ];
  }, [hedgeCoverage, minNorthAmericaShare, model.chinaShare, model.weightedLeadTime]);

  const supplierTariffMapping = useMemo(() => {
    const matched = industryProfile.suppliers.map((supplier) => {
      const matchingEntries = tariffFeed.filter(
        (entry) => entry.countryCode === supplier.countryCode && supplier.hsPrefix.startsWith(entry.hsPrefix.slice(0, 2))
      );
      const sourceRate =
        matchingEntries.length > 0
          ? matchingEntries.reduce((sum, entry) => sum + entry.tariffRate, 0) / matchingEntries.length
          : effectiveTariffRates[supplier.countryCode];
      const adjustedRate = sourceRate * (1 - hedgeCoverage / 100);
      const annualDuty = supplier.annualSpend * adjustedRate;
      return {
        ...supplier,
        mappedRate: sourceRate,
        adjustedRate,
        annualDuty,
        hasMatch: matchingEntries.length > 0,
      };
    });

    const totalDuty = matched.reduce((sum, item) => sum + item.annualDuty, 0);
    const coverage = matched.filter((item) => item.hasMatch).length / matched.length;
    return { rows: matched, totalDuty, coverage };
  }, [effectiveTariffRates, hedgeCoverage, industryProfile.suppliers, tariffFeed]);

  const modelConfidence = useMemo(() => {
    const coverageScore = supplierTariffMapping.coverage * 45;
    const feedScore = useTreasuryFeed && !feedMeta?.fallbackUsed ? 25 : 10;
    const realismPenalty = 20; // synthetic supplier/spend assumptions remain
    const score = Math.max(0, Math.min(100, coverageScore + feedScore - realismPenalty));
    return score;
  }, [feedMeta?.fallbackUsed, supplierTariffMapping.coverage, useTreasuryFeed]);

  const talkTrack = useMemo(
    () => [
      `This demo models ${industryProfile.accountLabel} tariff posture under ${scenario.label.toLowerCase()} with official-source tariff overlays enabled ${useTreasuryFeed ? 'ON' : 'OFF'}.`,
      `Current configuration indicates ${toCurrency(model.totalSavings)} savings opportunity with ${toPercent(model.northAmericaShare)} North America content and ${toPercent(model.chinaShare)} China dependency.`,
      `Primary execution move is to prioritize ${model.actions[0]?.label || 'top exposed programs'} and start a 30-day contract + HS code remediation sprint.`,
      'This is demo mode; once account supplier spend and HS mappings are loaded, these recommendations become decision-grade.',
    ],
    [industryProfile.accountLabel, model.actions, model.chinaShare, model.northAmericaShare, model.totalSavings, scenario.label, useTreasuryFeed]
  );

  const riskBadgeClass = (risk: 'medium' | 'high' | 'critical' | 'elevated') => {
    if (risk === 'critical') return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
    if (risk === 'high') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    return 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30';
  };

  const applyPreset = (presetId: ScenarioPreset['id']) => {
    const preset = SCENARIO_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setScenarioId(preset.config.scenarioId);
    setRiskWeight(preset.config.riskWeight);
    setMaxShift(preset.config.maxShift);
    setMinNorthAmericaShare(preset.config.minNorthAmericaShare);
    setHedgeCoverage(preset.config.hedgeCoverage);
    setUseTreasuryFeed(preset.config.useTreasuryFeed);
  };

  useEffect(() => {
    applyPreset(INDUSTRY_DEFAULT_PRESET[industryKey]);
  }, [industryKey]);

  const exportOnePageSummary = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const lineGap = 18;
    let y = 44;

    const write = (text: string, size = 10, color: [number, number, number] = [15, 23, 42], bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, 44, y);
      y += lineGap;
    };

    write('Tariff Navigator Demo Brief', 17, [3, 7, 18], true);
    write(`Generated: ${new Date().toLocaleString()}`, 9, [71, 85, 105]);
    write(`Industry: ${industryProfile.label} | Account: ${industryProfile.accountLabel}`, 9, [71, 85, 105]);
    write('Demo mode: Synthetic account assumptions + official tariff source overlays (USITC/USTR/Treasury).', 9, [71, 85, 105]);
    y += 6;
    write(`Scenario: ${scenario.label} | Preset: ${selectedPresetId.toUpperCase()} | Feed: ${useTreasuryFeed ? 'ON' : 'OFF'}`, 10, [3, 7, 18], true);
    y += 8;
    write(`Modeled annual spend: ${toCurrency(model.totalRecommended)}`);
    write(`Modeled savings opportunity: ${toCurrency(model.totalSavings)} (${(model.marginLiftBps / 100).toFixed(2)}% margin lift)`);
    write(`North America share: ${toPercent(model.northAmericaShare)} | China share: ${toPercent(model.chinaShare)}`);
    write(`Average tariff rate: ${toPercent(model.averageTariffRate)} | Lead time: ${model.weightedLeadTime.toFixed(1)} days`);
    write(`Supplier feed coverage: ${toPercent(supplierTariffMapping.coverage)} | Modeled duty burden: ${toCurrency(supplierTariffMapping.totalDuty)}`);
    y += 8;
    write('Top actions:', 11, [3, 7, 18], true);
    model.actions.slice(0, 3).forEach((action, i) => {
      write(`${i + 1}. ${action.statement}`, 9, [30, 41, 59]);
    });
    y += 8;
    write('Benchmark context:', 11, [3, 7, 18], true);
    write(industryBenchmark.detail, 9, [30, 41, 59]);
    write('All account outputs here are scenario-based and should not be interpreted as reported company actuals.', 9, [30, 41, 59]);
    y += 8;
    write('Source references:', 11, [3, 7, 18], true);
    write('- USITC HTS: https://hts.usitc.gov/', 8, [71, 85, 105]);
    write('- USTR Section 301: https://ustr.gov/issue-areas/enforcement/section-301-investigations/search', 8, [71, 85, 105]);
    write('- Treasury Fiscal Data: https://fiscaldata.treasury.gov/', 8, [71, 85, 105]);

    doc.save(`tariff-navigator-brief-${industryProfile.key}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="min-h-screen bg-[#05090f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-cyan-300/80">{industryProfile.accountLabel}</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Tariff Navigator</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Executive demo model for rapid sourcing decisions under tariff volatility. Uses synthetic account data with
              industry-specific assumptions.
            </p>
          </div>
          <Link
            href="/radar"
            className="rounded-md border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Back to Radar
          </Link>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-cyan-500/30 bg-cyan-500/10">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-cyan-500/25 text-cyan-100">Demo Mode</Badge>
                  <Badge className="bg-amber-500/20 text-amber-200">Synthetic Account Inputs</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-200">Official Tariff Sources</Badge>
                </div>
                <p className="text-sm text-slate-200">
                  Partner-safe prototype: real USITC/USTR/Treasury context with placeholder account supplier economics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssumptions((current) => !current)}
                  className="rounded-md border border-white/20 px-3 py-2 text-sm text-slate-100 hover:bg-white/10"
                >
                  {showAssumptions ? 'Hide Assumptions' : 'Show Assumptions'}
                </button>
                <button
                  type="button"
                  onClick={exportOnePageSummary}
                  className="rounded-md bg-cyan-500/25 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/35"
                >
                  Export One-Page PDF
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader className="pb-2">
              <CardDescription>Model confidence (demo)</CardDescription>
              <CardTitle className="text-2xl">{modelConfidence.toFixed(0)}/100</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={modelConfidence} />
              <p className="text-xs text-slate-400">Score reflects feed coverage + official sources, with penalty for synthetic account data.</p>
            </CardContent>
          </Card>
        </div>

        {showAssumptions ? (
          <Card className="mb-6 border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Assumptions and Guardrails</CardTitle>
              <CardDescription>Use this framing in the demo to avoid over-claiming precision.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                Supplier list, spend values, and program mix are synthetic placeholders for demonstration only.
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                USITC/USTR/Treasury references are real-source context inputs and can be productionized as data improves.
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                Recommendations are best interpreted as directional shifts (relative deltas), not audited dollar commitments.
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300">
                Decision-grade deployment requires client files listed in Data Readiness Checklist below.
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-cyan-500/40 bg-cyan-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-cyan-100/80">Annual Tariff-Adjusted Spend</CardDescription>
              <CardTitle className="text-2xl text-cyan-100">{toCurrency(model.totalRecommended)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-cyan-100/80">
              Baseline was {toCurrency(model.totalCurrent)} under current sourcing mix.
            </CardContent>
          </Card>
          <Card className="border-emerald-500/40 bg-emerald-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-100/80">Modeled Savings Opportunity</CardDescription>
              <CardTitle className="text-2xl text-emerald-100">{toCurrency(model.totalSavings)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-emerald-100/80">
              Equivalent to {(model.marginLiftBps / 100).toFixed(2)}% margin improvement.
            </CardContent>
          </Card>
          <Card className="border-blue-500/40 bg-blue-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100/80">North America Content</CardDescription>
              <CardTitle className="text-2xl text-blue-100">{toPercent(model.northAmericaShare)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={model.northAmericaShare * 100} />
              <p className="text-xs text-blue-100/80">Target floor: {minNorthAmericaShare}%</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/40 bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-100/80">Weighted Supply Risk</CardDescription>
              <CardTitle className="text-2xl text-amber-100">{(model.weightedRisk * 100).toFixed(1)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-100/80">
              Risk index combines lead-time, volatility, and compliance friction.
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card className="border-fuchsia-500/40 bg-fuchsia-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-fuchsia-100/80">Weighted Tariff Rate</CardDescription>
              <CardTitle className="text-2xl text-fuchsia-100">{toPercent(model.averageTariffRate)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-fuchsia-100/80">Blended duty effect across recommended sourcing mix.</CardContent>
          </Card>
          <Card className="border-rose-500/40 bg-rose-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-rose-100/80">High-Tariff Spend Exposure</CardDescription>
              <CardTitle className="text-2xl text-rose-100">{toPercent(model.highTariffShare)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-rose-100/80">Share of spend sitting in lanes with 15%+ tariff rates.</CardContent>
          </Card>
          <Card className="border-violet-500/40 bg-violet-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-violet-100/80">China Dependency Share</CardDescription>
              <CardTitle className="text-2xl text-violet-100">{toPercent(model.chinaShare)}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-violet-100/80">Recommended direct exposure to China-origin supply.</CardContent>
          </Card>
          <Card className="border-indigo-500/40 bg-indigo-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-indigo-100/80">Average Lead Time</CardDescription>
              <CardTitle className="text-2xl text-indigo-100">{model.weightedLeadTime.toFixed(1)} days</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-indigo-100/80">Weighted by spend and program sourcing profile.</CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Scenario Controls</CardTitle>
              <CardDescription>Tune profile, policy, and risk assumptions live during the partner demo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Industry Profile</label>
                <select
                  className="w-full rounded-md border border-white/20 bg-slate-950/70 px-3 py-2 text-sm"
                  value={industryKey}
                  onChange={(event) => setIndustryKey(event.target.value as IndustryKey)}
                >
                  {(Object.keys(INDUSTRY_PROFILES) as IndustryKey[]).map((key) => (
                    <option key={key} value={key}>
                      {INDUSTRY_PROFILES[key].label} | {INDUSTRY_PROFILES[key].accountLabel}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">Switches supplier/program assumptions and benchmark context for the selected vertical.</p>
              </div>

              <div className="space-y-2 rounded-md border border-white/10 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-100">Official Tariff Feed Mapping (USITC + USTR)</p>
                  <button
                    type="button"
                    onClick={() => setUseTreasuryFeed((current) => !current)}
                    className={`rounded px-2 py-1 text-xs ${useTreasuryFeed ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-700/60 text-slate-300'}`}
                  >
                    {useTreasuryFeed ? 'ON' : 'OFF'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {feedMeta
                    ? `Source: ${feedMeta.fallbackUsed ? 'Fallback tariff table' : 'USITC HTS tariff lines'}`
                    : 'Loading tariff feed metadata...'}
                </p>
                {feedMeta?.sourceUrl ? <p className="truncate text-xs text-slate-500">{feedMeta.sourceUrl}</p> : null}
                {feedMeta?.ustrSourceUrl ? <p className="truncate text-xs text-slate-500">USTR: {feedMeta.ustrSourceUrl}</p> : null}
                {feedMeta?.fetchedAt ? <p className="text-xs text-slate-500">Fetched {new Date(feedMeta.fetchedAt).toLocaleString()}</p> : null}
                {feedError ? <p className="text-xs text-rose-300">Feed error: {feedError}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Tariff Scenario</label>
                <select
                  className="w-full rounded-md border border-white/20 bg-slate-950/70 px-3 py-2 text-sm"
                  value={scenarioId}
                  onChange={(event) => setScenarioId(event.target.value as ScenarioKey)}
                >
                  {SCENARIOS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">{scenario.detail}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Scenario Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {SCENARIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`rounded-md border px-2 py-2 text-xs ${
                        selectedPresetId === preset.id
                          ? 'border-cyan-400/70 bg-cyan-500/20 text-cyan-100'
                          : 'border-white/15 bg-slate-950/60 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-slate-200">Max Quarterly Resourcing Shift</label>
                  <span className="text-cyan-300">{maxShift}%</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={45}
                  value={maxShift}
                  onChange={(event) => setMaxShift(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-slate-200">Risk Weighting</label>
                  <span className="text-cyan-300">{riskWeight.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={1.6}
                  step={0.05}
                  value={riskWeight}
                  onChange={(event) => setRiskWeight(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-slate-200">North America Target Floor</label>
                  <span className="text-cyan-300">{minNorthAmericaShare}%</span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={80}
                  value={minNorthAmericaShare}
                  onChange={(event) => setMinNorthAmericaShare(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-slate-200">Duty Hedging Coverage</label>
                  <span className="text-cyan-300">{hedgeCoverage}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  value={hedgeCoverage}
                  onChange={(event) => setHedgeCoverage(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>Highest-value shifts by part family under selected scenario.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {model.actions.map((action) => (
                <div key={action.label} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{action.label}</p>
                    <Badge className="bg-emerald-500/15 text-emerald-300">{toCurrency(action.savings)}</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{action.statement}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1.45fr]">
          <Card className="border-white/10 bg-slate-900/60 lg:col-span-2">
            <CardHeader>
              <CardTitle>Partner Talk Track</CardTitle>
              <CardDescription>Suggested narrative sequence for a 3-5 minute Deloitte partner walkthrough.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {talkTrack.map((line, index) => (
                <div key={line} className="rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-200">
                  <p className="mb-1 text-xs uppercase tracking-wide text-cyan-300">Step {index + 1}</p>
                  <p>{line}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Data Readiness Checklist</CardTitle>
              <CardDescription>Inputs required to graduate from demo-mode to decision-grade client modeling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DATA_READINESS_ITEMS.map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-slate-950/60 p-2 text-sm text-slate-300">
                  [ ] {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Global Benchmark Context</CardTitle>
              <CardDescription>Keep public benchmarks separate from account-level scenario outputs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Public benchmark context</p>
                <p className="mt-1 text-2xl font-semibold text-slate-100">{industryBenchmark.headline}</p>
                <p className="mt-1 text-xs text-slate-400">{industryBenchmark.detail}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Modeled annual duty burden</p>
                <p className="mt-1 text-2xl font-semibold text-rose-200">{toCurrency(supplierTariffMapping.totalDuty)}</p>
                <p className="mt-1 text-xs text-slate-400">Scenario-driven estimate; not a reported company financial figure.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1.45fr]">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Program Economics</CardTitle>
              <CardDescription>Current mix vs optimized mix with tariff + risk adjustments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="pb-2">Program</th>
                      <th className="pb-2">Current Spend</th>
                      <th className="pb-2">Recommended Spend</th>
                      <th className="pb-2">Savings</th>
                      <th className="pb-2">Top Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.programResults.map((item) => {
                      const deltas = (Object.keys(item.program.currentMix) as CountryCode[]).map((country) => ({
                        country,
                        delta: item.recommendedMix[country] - item.program.currentMix[country],
                      }));
                      const increase = [...deltas].sort((a, b) => b.delta - a.delta)[0];
                      const decrease = [...deltas].sort((a, b) => a.delta - b.delta)[0];
                      return (
                        <tr key={item.program.id} className="border-t border-white/10 text-slate-200">
                          <td className="py-3 pr-4">{item.program.label}</td>
                          <td className="py-3 pr-4">{toCurrency(item.currentCost)}</td>
                          <td className="py-3 pr-4">{toCurrency(item.recommendedCost)}</td>
                          <td className="py-3 pr-4 text-emerald-300">{toCurrency(item.savings)}</td>
                          <td className="py-3 text-xs text-slate-300">
                            {decrease.country} to {increase.country} ({Math.abs(decrease.delta * 100).toFixed(1)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Country Exposure Heatmap</CardTitle>
              <CardDescription>Recommended spend allocation by sourcing country.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {COUNTRY_PROFILES.map((country) => {
                const spend = model.exposureByCountry[country.code];
                const pct = spend / model.totalRecommended;
                return (
                  <div key={country.code} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-slate-100">
                        {country.code} <span className="text-slate-400">{country.name}</span>
                      </p>
                      <p className="text-slate-300">
                        {toPercent(pct)} | Tariff {(effectiveTariffRates[country.code] * 100).toFixed(0)}%
                      </p>
                    </div>
                    <Progress value={pct * 100} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1.75fr]">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Feed-to-Supplier Coverage</CardTitle>
              <CardDescription>How much supplier spend is mapped to USITC/USTR tariff records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Mapped supplier coverage</p>
                <p className="mt-1 text-2xl font-semibold text-cyan-100">{toPercent(supplierTariffMapping.coverage)}</p>
                <Progress value={supplierTariffMapping.coverage * 100} />
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Modeled annual duty burden</p>
                <p className="mt-1 text-2xl font-semibold text-rose-200">{toCurrency(supplierTariffMapping.totalDuty)}</p>
                <p className="mt-1 text-xs text-slate-400">Calculated from mapped feed rates and hedge coverage assumptions.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Treasury Customs Collections Context</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {feedMeta?.treasuryOverlay?.customsCollectionsLatest
                    ? toCurrency(feedMeta.treasuryOverlay.customsCollectionsLatest)
                    : 'Unavailable'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {feedMeta?.treasuryOverlay
                    ? `From Treasury Fiscal Data (${feedMeta.treasuryOverlay.sampleCount} customs-tagged rows scanned).`
                    : 'Treasury overlay not loaded.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Supplier Tariff Mapping</CardTitle>
              <CardDescription>Mapped rates by supplier country + HS prefix against active USITC/USTR sources.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="pb-2">Supplier</th>
                      <th className="pb-2">Country</th>
                      <th className="pb-2">HS</th>
                      <th className="pb-2">Mapped Rate</th>
                      <th className="pb-2">Annual Duty</th>
                      <th className="pb-2">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierTariffMapping.rows.map((row) => (
                      <tr key={row.id} className="border-t border-white/10 text-slate-200">
                        <td className="py-3 pr-4">
                          <p>{row.name}</p>
                          <p className="text-xs text-slate-400">{row.tier} | {row.category}</p>
                        </td>
                        <td className="py-3 pr-4">{row.countryCode}</td>
                        <td className="py-3 pr-4">{row.hsPrefix}</td>
                        <td className="py-3 pr-4">{toPercent(row.mappedRate)}</td>
                        <td className="py-3 pr-4 text-rose-200">{toCurrency(row.annualDuty)}</td>
                        <td className="py-3">
                          <Badge className={row.hasMatch ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}>
                            {row.hasMatch ? 'Feed matched' : 'Scenario fallback'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Policy and Trade Signal Tracker</CardTitle>
              <CardDescription>Forward-looking events that could move landed costs or compliance risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {POLICY_SIGNALS.map((signal) => (
                <div key={signal.title} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{signal.title}</p>
                    <Badge className={riskBadgeClass(signal.risk)}>{signal.risk.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{signal.date}</p>
                  <p className="mt-1 text-sm text-slate-300">{signal.implication}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Critical Material Dependencies</CardTitle>
              <CardDescription>Where tariff + concentration risk amplifies production volatility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {MATERIAL_DEPENDENCIES.map((item) => (
                <div key={item.material} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{item.material}</p>
                    <Badge className={riskBadgeClass(item.riskLevel)}>{item.riskLevel.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{item.primaryUse}</p>
                  <p className="mt-1 text-xs text-slate-300">Primary high-risk sources: {item.highRiskSources.join(', ')}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Supplier Network Stress Points</CardTitle>
              <CardDescription>Tier-level weak spots to surface in procurement governance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUPPLIER_WATCHLIST.map((item) => (
                <div key={item.tier} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-sm font-medium text-slate-100">{item.tier}: {item.focus}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.signal}</p>
                  <p className="mt-1 text-xs text-slate-400">Business exposure: {item.exposure}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1.95fr]">
          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>Logistics Corridor Intelligence</CardTitle>
              <CardDescription>Lane-level fragility and transit variability in current footprint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {LOGISTICS_LANES.map((lane) => (
                <div key={lane.lane} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">{lane.lane}</p>
                    <Badge className="bg-cyan-500/15 text-cyan-300">{lane.mode.toUpperCase()}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Transit {lane.leadDays}d | Variability {(lane.variability * 100).toFixed(0)}%
                  </p>
                  <p className="mt-1 text-sm text-slate-300">Constraint: {lane.chokepoint}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardHeader>
              <CardTitle>30 / 60 / 90 Day Playbook</CardTitle>
              <CardDescription>Execution sequence to translate model output into procurement actions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {executionPlaybook.map((block) => (
                <div key={block.horizon} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="mb-2 text-sm font-semibold text-cyan-200">{block.horizon}</p>
                  <div className="space-y-2">
                    {block.items.map((item) => (
                      <p key={item} className="text-sm text-slate-300">
                        - {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
