'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Opportunity,
  GenesisPillar,
  GENESIS_PILLAR_INFO,
  PILLAR_LAYER,
  PillarLayer,
  URGENCY_LABELS,
  OT_SYSTEM_LABELS,
  REGULATORY_LABELS,
  DELOITTE_SERVICE_LABELS,
  STAGE_LABELS,
} from '@/lib/types';

// Extended opportunity with action fields
interface ActionableOpportunity extends Opportunity {
  nextAction?: string;
  actionDeadline?: string;
  contactName?: string;
  contactTitle?: string;
  contactCompany?: string;
  deloitteOwner?: string;
  talkingPoints?: string[];
}

// Sector Agent types (from backend)
interface SectorAgent {
  id: GenesisPillar;
  name: string;
  icon: string;
  status: 'idle' | 'working' | 'error';
  lastRun: string | null;
  memory: {
    marketTrends?: string[];
    regulatoryUpdates?: string[];
    recentNews?: { date: string; headline: string; source: string }[];
    risks?: { description: string; severity: string }[];
    keyPlayers?: { name: string; role: string; relevance: string }[];
  };
  findings: SectorFinding[];
  alerts: SectorAlert[];
}

interface SectorFinding {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  summary: string;
  source: string;
  relevance: string;
  affectedOpportunities: string[];
  actionRequired: boolean;
}

interface SectorAlert {
  id: string;
  timestamp: string;
  priority: string;
  message: string;
  opportunityId?: string;
  action: string;
  status: string;
}

// Unified action item for the action lists
interface ActionItem {
  id: string;
  type: 'opportunity' | 'agent-alert' | 'agent-finding';
  title: string;
  subtitle: string;
  deadline?: string;
  daysUntil: number | null;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  sectorId?: GenesisPillar;
  opportunityId?: string;
  action?: string;
  source?: string;
}

// Status workflow
type OppStatus = 'on-radar' | 'contacted' | 'meeting' | 'proposal' | 'closed';

const STATUS_CONFIG: Record<OppStatus, { label: string; color: string; bg: string }> = {
  'on-radar': { label: 'On Radar', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  'contacted': { label: 'Contacted', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'meeting': { label: 'Meeting', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'proposal': { label: 'Proposal', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  'closed': { label: 'Closed', color: 'text-green-400', bg: 'bg-green-500/20' },
};

// Sector strategic context - blockers, incentives, policy gaps
const SECTOR_CONTEXT: Record<GenesisPillar, {
  status: 'accelerating' | 'on-track' | 'blocked';
  keyBlocker: string;
  keyIncentive: string;
  policyGap: string;
  moonshotNeeded: boolean;
}> = {
  'power': { status: 'blocked', keyBlocker: 'NRC licensing backlog; transmission permitting', keyIncentive: 'IRA 45U PTC ($15/MWh); DOE OCED loans', policyGap: 'Federal transmission siting authority', moonshotNeeded: true },
  'ai-compute': { status: 'on-track', keyBlocker: 'Grid connection delays avg 4+ years', keyIncentive: 'IRA clean energy credits; state incentives', policyGap: 'Fast-track permitting for AI infrastructure', moonshotNeeded: false },
  'semiconductors': { status: 'blocked', keyBlocker: 'TSMC AZ delayed; workforce shortage', keyIncentive: 'CHIPS $39B grants; 25% ITC', policyGap: 'CHIPS 2.0 for sustained funding; H-1B reform', moonshotNeeded: true },
  'cooling': { status: 'accelerating', keyBlocker: 'None - GB200 mandate forcing adoption', keyIncentive: 'DOE Better Buildings; utility rebates', policyGap: 'Mandatory PUE reporting for large DCs', moonshotNeeded: false },
  'supply-chain': { status: 'blocked', keyBlocker: 'Processing permits 7+ years; single supplier risk', keyIncentive: 'DPA Title III; IRA 45X production credit', policyGap: 'NEPA reform for critical minerals', moonshotNeeded: true },
  'defense': { status: 'blocked', keyBlocker: 'CMMC assessor shortage; SMB cost burden', keyIncentive: 'NDAA AI provisions; DIU OTAs', policyGap: 'Tiered compliance for small DIB', moonshotNeeded: true },
  'healthcare': { status: 'accelerating', keyBlocker: 'None - FDA guidance clarity improving', keyIncentive: 'FDA breakthrough therapy; BARDA funding', policyGap: 'None - regulatory modernizing', moonshotNeeded: false },
  'energy-systems': { status: 'blocked', keyBlocker: 'LDES not cost-competitive; utility integration lag', keyIncentive: 'IRA 45X storage ITC; DOE LDES demos', policyGap: 'LDES-specific production credit', moonshotNeeded: true },
  'manufacturing': { status: 'accelerating', keyBlocker: 'None - labor costs driving automation', keyIncentive: 'NIST MEP; ARM Institute funding', policyGap: 'SMB IIoT security standards', moonshotNeeded: false },
  'research': { status: 'accelerating', keyBlocker: 'None - foundation models enabling automation', keyIncentive: 'DOE ASCR; NSF AI Institutes', policyGap: 'AI researcher visa priority', moonshotNeeded: false },
};

// Activity log entry
interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'status-change' | 'note-added' | 'note-updated' | 'created';
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

function getDayLabel(days: number | null): string {
  if (days === null) return '';
  if (days < 0) return 'OVERDUE';
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';
  if (days <= 7) return `${days} days`;
  return `${Math.ceil(days / 7)} weeks`;
}

// Curated action data - this would come from a database in production
const ACTION_DATA: Record<string, Partial<ActionableOpportunity>> = {
  'stargate-phase1': {
    nextAction: 'Schedule intro call with Oracle infrastructure security lead',
    actionDeadline: '2026-02-21',
    contactName: 'Marcus Chen',
    contactTitle: 'VP Infrastructure Security',
    contactCompany: 'Oracle',
    deloitteOwner: 'Sarah Mitchell (Oracle Alliance Lead)',
    talkingPoints: [
      'Deloitte designed security architecture for 3 of top 5 hyperscalers',
      'NERC CIP experience critical for ERCOT grid integration',
      'Can mobilize 50+ OT specialists within 30 days',
    ],
  },
  'palisades-restart': {
    nextAction: 'Submit Holtec capability statement for cyber security RFP',
    actionDeadline: '2026-02-24',
    contactName: 'Jennifer Walsh',
    contactTitle: 'Director of Nuclear Security',
    contactCompany: 'Holtec International',
    deloitteOwner: 'Tom Bradley (Nuclear Practice)',
    talkingPoints: [
      'NRC 10 CFR 73.54 compliance experience at 12 plants',
      'Only firm with both OT and nuclear regulatory expertise',
      'Can start assessment within 2 weeks of award',
    ],
  },
  'tmi-restart': {
    nextAction: 'Follow up on Constellation RFI response',
    actionDeadline: '2026-02-25',
    contactName: 'Robert Kim',
    contactTitle: 'Plant Security Manager',
    contactCompany: 'Constellation Energy',
    deloitteOwner: 'Tom Bradley (Nuclear Practice)',
    talkingPoints: [
      'Previous TMI work in 2018 gives us site familiarity',
      'Microsoft PPA adds urgency - they need security cleared fast',
      'Offer expedited timeline vs competitors',
    ],
  },
  'tsmc-arizona': {
    nextAction: 'Request meeting with TSMC security team at Phoenix site',
    actionDeadline: '2026-02-28',
    contactName: 'David Liu',
    contactTitle: 'Head of Fab Security, Americas',
    contactCompany: 'TSMC',
    deloitteOwner: 'Michelle Park (Semiconductor Practice)',
    talkingPoints: [
      'Cleared personnel for CHIPS Act compliance',
      'Experience with SEMI E187 cybersecurity standard',
      'Can support Taiwan-US security policy alignment',
    ],
  },
};

// Practice mapping
type Practice = 'all' | 'commercial' | 'gps';
const PRACTICE_MAP: Record<string, Practice> = {
  'federal': 'gps',
  'state-local': 'gps',
  'utility': 'commercial',
  'enterprise': 'commercial',
};

type LayerFilter = 'all' | 'infrastructure' | 'application';
type ViewMode = 'dashboard' | 'timeline' | 'live';

// Live feed types
interface LiveFeedSource {
  name: string;
  description: string;
  icon: string;
  count: number;
  status: string;
  error?: string;
  data: unknown[];
}

interface LiveFeedData {
  fetchedAt: string;
  sources: {
    sam: LiveFeedSource;
    awards: LiveFeedSource;
    grants: LiveFeedSource;
    doe: LiveFeedSource;
    news: LiveFeedSource;
    sec: LiveFeedSource;
  };
  summary: {
    totalItems: number;
    sourcesActive: number;
  };
}

// Format date for timeline
function formatMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Get month key for grouping
function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function RadarPage() {
  const [opportunities, setOpportunities] = useState<ActionableOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<ActionableOpportunity | null>(null);
  const [practiceFilter, setPracticeFilter] = useState<Practice>('all');
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [tracking, setTracking] = useState<Record<string, OppTracking>>({});
  const [liveFeed, setLiveFeed] = useState<LiveFeedData | null>(null);
  const [liveFeedLoading, setLiveFeedLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [agents, setAgents] = useState<Record<GenesisPillar, SectorAgent>>({} as Record<GenesisPillar, SectorAgent>);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [showSetup, setShowSetup] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState<boolean | null>(null);

  // Load tracking data from Supabase (with localStorage fallback)
  useEffect(() => {
    async function loadTracking() {
      try {
        const res = await fetch('/api/tracking');
        const data = await res.json();

        // Check if cloud is working
        if (data.source === 'supabase') {
          setCloudEnabled(true);
          if (Object.keys(data.tracking).length > 0) {
            setTracking(data.tracking);
            localStorage.setItem('genesis-tracking', JSON.stringify(data.tracking));
          }
        } else if (data.source === 'empty') {
          // Table exists but empty - cloud is enabled
          setCloudEnabled(true);
          const saved = localStorage.getItem('genesis-tracking');
          if (saved) {
            try {
              setTracking(JSON.parse(saved));
            } catch (e) {
              console.error('Error loading tracking data:', e);
            }
          }
        } else {
          // Cloud not set up
          setCloudEnabled(false);
          const saved = localStorage.getItem('genesis-tracking');
          if (saved) {
            try {
              setTracking(JSON.parse(saved));
            } catch (e) {
              console.error('Error loading tracking data:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load from cloud, using localStorage:', error);
        setCloudEnabled(false);
        const saved = localStorage.getItem('genesis-tracking');
        if (saved) {
          try {
            setTracking(JSON.parse(saved));
          } catch (e) {
            console.error('Error loading tracking data:', e);
          }
        }
      }
    }
    loadTracking();

    // Load last selected opportunity ID
    const lastSelected = localStorage.getItem('genesis-last-selected');
    if (lastSelected) {
      localStorage.setItem('genesis-pending-selection', lastSelected);
    }
  }, []);

  // Track which opportunities need to be saved to cloud
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());

  // Save tracking data to localStorage and Supabase
  useEffect(() => {
    if (Object.keys(tracking).length > 0) {
      // Always save to localStorage immediately
      localStorage.setItem('genesis-tracking', JSON.stringify(tracking));

      // Debounced save to Supabase for pending items
      if (pendingSaves.size > 0) {
        setSyncStatus('syncing');
        const saveToCloud = async () => {
          const toSave = Array.from(pendingSaves);
          setPendingSaves(new Set()); // Clear pending

          let hasError = false;
          for (const oppId of toSave) {
            if (tracking[oppId]) {
              try {
                const res = await fetch('/api/tracking', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    opportunityId: oppId,
                    tracking: tracking[oppId],
                  }),
                });
                if (!res.ok) hasError = true;
              } catch (error) {
                console.error('Failed to save to cloud:', error);
                hasError = true;
              }
            }
          }
          setSyncStatus(hasError ? 'error' : 'synced');
          // Reset to idle after showing synced status
          if (!hasError) {
            setTimeout(() => setSyncStatus('idle'), 2000);
          }
        };

        const timeout = setTimeout(saveToCloud, 1000); // Debounce 1 second
        return () => clearTimeout(timeout);
      }
    }
  }, [tracking, pendingSaves]);

  // Load notes when selecting an opportunity and save selection
  useEffect(() => {
    if (selectedOpp) {
      setEditingNotes(tracking[selectedOpp.id]?.notes || '');
      // Save last selected opportunity
      localStorage.setItem('genesis-last-selected', selectedOpp.id);
    }
  }, [selectedOpp?.id, tracking]);

  const updateStatus = (oppId: string, newStatus: OppStatus) => {
    const now = new Date().toISOString();
    setTracking(prev => {
      const current = prev[oppId];
      const previousStatus = current?.status || 'on-radar';

      // Don't log if status hasn't changed
      if (previousStatus === newStatus) return prev;

      const newActivity: ActivityEntry = {
        id: `act-${Date.now()}`,
        timestamp: now,
        type: 'status-change',
        details: `Status changed from ${STATUS_CONFIG[previousStatus].label} to ${STATUS_CONFIG[newStatus].label}`,
        previousValue: previousStatus,
        newValue: newStatus,
      };

      return {
        ...prev,
        [oppId]: {
          ...current,
          status: newStatus,
          notes: current?.notes || '',
          lastUpdated: now,
          activity: [...(current?.activity || []), newActivity],
        },
      };
    });
    // Mark for cloud save
    setPendingSaves(prev => new Set(prev).add(oppId));
  };

  const saveNotes = (oppId: string, notes: string) => {
    const now = new Date().toISOString();
    const current = tracking[oppId];
    const previousNotes = current?.notes || '';

    // Don't save if notes haven't changed
    if (previousNotes === notes) return;

    const isNew = !previousNotes && notes;
    const newActivity: ActivityEntry = {
      id: `act-${Date.now()}`,
      timestamp: now,
      type: isNew ? 'note-added' : 'note-updated',
      details: isNew ? 'Note added' : 'Note updated',
      previousValue: previousNotes || undefined,
      newValue: notes,
    };

    setTracking(prev => ({
      ...prev,
      [oppId]: {
        ...prev[oppId],
        status: prev[oppId]?.status || 'on-radar',
        notes,
        lastUpdated: now,
        activity: [...(prev[oppId]?.activity || []), newActivity],
      },
    }));
    // Mark for cloud save
    setPendingSaves(prev => new Set(prev).add(oppId));
  };

  // Build action items from agents and opportunities
  const buildActionItems = useCallback((
    opps: ActionableOpportunity[],
    agentData: Record<GenesisPillar, SectorAgent>
  ): ActionItem[] => {
    const items: ActionItem[] = [];
    const now = new Date();

    // Add opportunity-based actions (from static ACTION_DATA)
    opps.forEach(opp => {
      if (opp.nextAction && opp.actionDeadline) {
        const deadline = new Date(opp.actionDeadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        items.push({
          id: `opp-${opp.id}`,
          type: 'opportunity',
          title: opp.nextAction,
          subtitle: opp.title,
          deadline: opp.actionDeadline,
          daysUntil,
          priority: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'high' : 'medium',
          sectorId: opp.genesisPillar,
          opportunityId: opp.id,
        });
      }
    });

    // Add agent alerts as action items
    Object.values(agentData).forEach(agent => {
      (agent.alerts || []).filter(a => a.status === 'active').forEach(alert => {
        // Parse relative dates from alert messages (e.g., "closes Feb 28", "in 6 weeks")
        let daysUntil: number | null = null;
        let deadline: string | undefined;

        // Try to extract dates from alert message
        const febMatch = alert.message.match(/Feb\s+(\d+)/i);
        const marMatch = alert.message.match(/Mar\s+(\d+)/i);
        const weeksMatch = alert.message.match(/(\d+)\s+weeks?/i);
        const daysMatch = alert.message.match(/(\d+)\s+days?/i);

        if (febMatch) {
          const day = parseInt(febMatch[1]);
          deadline = `2026-02-${day.toString().padStart(2, '0')}`;
          daysUntil = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if (marMatch) {
          const day = parseInt(marMatch[1]);
          deadline = `2026-03-${day.toString().padStart(2, '0')}`;
          daysUntil = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if (weeksMatch) {
          daysUntil = parseInt(weeksMatch[1]) * 7;
          const futureDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
          deadline = futureDate.toISOString().split('T')[0];
        } else if (daysMatch) {
          daysUntil = parseInt(daysMatch[1]);
          const futureDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
          deadline = futureDate.toISOString().split('T')[0];
        } else {
          // Default to 14 days for alerts without clear dates
          daysUntil = 14;
        }

        items.push({
          id: alert.id,
          type: 'agent-alert',
          title: alert.message,
          subtitle: `${agent.name} Agent`,
          deadline,
          daysUntil,
          priority: alert.priority as ActionItem['priority'],
          sectorId: agent.id,
          opportunityId: alert.opportunityId,
          action: alert.action,
          source: 'agent',
        });
      });

      // Add critical/high findings that require action
      (agent.findings || [])
        .filter(f => f.actionRequired && (f.relevance === 'critical' || f.relevance === 'high'))
        .slice(0, 3) // Limit per agent
        .forEach(finding => {
          items.push({
            id: finding.id,
            type: 'agent-finding',
            title: finding.title,
            subtitle: `${agent.name} • ${finding.type}`,
            daysUntil: 7, // Findings are generally this-week priority
            priority: finding.relevance === 'critical' ? 'urgent' : 'high',
            sectorId: agent.id,
            source: finding.source,
          });
        });
    });

    // Sort by daysUntil, then priority
    items.sort((a, b) => {
      if (a.daysUntil === null && b.daysUntil === null) return 0;
      if (a.daysUntil === null) return 1;
      if (b.daysUntil === null) return -1;
      return a.daysUntil - b.daysUntil;
    });

    return items;
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch opportunities and agents in parallel
        const [oppRes, agentRes] = await Promise.all([
          fetch('/api/opportunities'),
          fetch('/api/agents'),
        ]);

        const oppData = await oppRes.json();
        const agentData = await agentRes.json();

        // Enrich opportunities with action data
        const enriched = (oppData.opportunities || []).map((opp: Opportunity) => ({
          ...opp,
          ...ACTION_DATA[opp.id] || {},
        }));

        setOpportunities(enriched);
        if (enriched.length > 0) {
          // Restore last selected or default to first
          const pendingSelection = localStorage.getItem('genesis-pending-selection');
          const lastSelected = pendingSelection || localStorage.getItem('genesis-last-selected');
          const restored = lastSelected ? enriched.find((o: ActionableOpportunity) => o.id === lastSelected) : null;
          setSelectedOpp(restored || enriched[0]);
          localStorage.removeItem('genesis-pending-selection');
        }

        // Store agents
        const agentMap: Record<GenesisPillar, SectorAgent> = {} as Record<GenesisPillar, SectorAgent>;
        (agentData.agents || []).forEach((agent: SectorAgent) => {
          agentMap[agent.id] = agent;
        });
        setAgents(agentMap);

        // Build unified action items
        const items = buildActionItems(enriched, agentMap);
        setActionItems(items);

      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    }
    fetchData();
  }, [buildActionItems]);

  // Fetch live feed when switching to live view
  useEffect(() => {
    if (viewMode === 'live' && !liveFeed) {
      setLiveFeedLoading(true);
      fetch('/api/live-feed')
        .then(res => res.json())
        .then(data => {
          setLiveFeed(data);
          setLiveFeedLoading(false);
        })
        .catch(err => {
          console.error('Live feed error:', err);
          setLiveFeedLoading(false);
        });
    }
  }, [viewMode, liveFeed]);

  // Filter by practice and layer
  const filteredOpps = opportunities.filter(o => {
    // Practice filter
    if (practiceFilter !== 'all' && PRACTICE_MAP[o.entityType] !== practiceFilter) {
      return false;
    }
    // Layer filter
    if (layerFilter !== 'all') {
      const pillarLayer = PILLAR_LAYER[o.genesisPillar];
      if (pillarLayer !== layerFilter) return false;
    }
    return true;
  });

  // Sort by action deadline (soonest first), then by urgency
  const sortedOpps = [...filteredOpps].sort((a, b) => {
    if (a.actionDeadline && b.actionDeadline) {
      return new Date(a.actionDeadline).getTime() - new Date(b.actionDeadline).getTime();
    }
    if (a.actionDeadline) return -1;
    if (b.actionDeadline) return 1;
    return 0;
  });

  // Filter action items by timeframe
  const thisWeekActions = actionItems.filter(item =>
    item.daysUntil !== null && item.daysUntil >= 0 && item.daysUntil <= 7
  );

  const thisMonthActions = actionItems.filter(item =>
    item.daysUntil !== null && item.daysUntil > 7 && item.daysUntil <= 30
  );

  const totalPipeline = filteredOpps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  // Count by practice for badges
  const gpsCount = opportunities.filter(o => PRACTICE_MAP[o.entityType] === 'gps').length;
  const commercialCount = opportunities.filter(o => PRACTICE_MAP[o.entityType] === 'commercial').length;

  // Count by layer
  const infraCount = opportunities.filter(o => PILLAR_LAYER[o.genesisPillar] === 'infrastructure').length;
  const appCount = opportunities.filter(o => PILLAR_LAYER[o.genesisPillar] === 'application').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Genesis Radar</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{Object.values(SECTOR_CONTEXT).filter(s => s.status === 'accelerating').length}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>{Object.values(SECTOR_CONTEXT).filter(s => s.status === 'blocked').length}</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{Object.values(SECTOR_CONTEXT).filter(s => s.moonshotNeeded).length}</span>
              </div>
              {/* Sync Status */}
              <div className="flex items-center gap-1.5 text-xs">
                {cloudEnabled === false ? (
                  <button
                    onClick={() => setShowSetup(true)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    Setup Cloud Sync
                  </button>
                ) : (
                  <>
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
                    {syncStatus === 'idle' && cloudEnabled && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span className="text-gray-500">Cloud</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View + Filter combined */}
              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-2 py-1 rounded ${viewMode === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-2 py-1 rounded ${viewMode === 'timeline' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('live')}
                  className={`px-2 py-1 rounded ${viewMode === 'live' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Live
                </button>
              </div>

              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                <button
                  onClick={() => setLayerFilter('all')}
                  className={`px-2 py-1 rounded ${layerFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setLayerFilter('infrastructure')}
                  className={`px-2 py-1 rounded ${layerFilter === 'infrastructure' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Infra
                </button>
                <button
                  onClick={() => setLayerFilter('application')}
                  className={`px-2 py-1 rounded ${layerFilter === 'application' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Apps
                </button>
              </div>

              <div className="flex items-center bg-[#12121a] rounded-lg border border-gray-800 p-0.5 text-xs">
                <button
                  onClick={() => setPracticeFilter('all')}
                  className={`px-2 py-1 rounded ${practiceFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setPracticeFilter('commercial')}
                  className={`px-2 py-1 rounded ${practiceFilter === 'commercial' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  COM
                </button>
                <button
                  onClick={() => setPracticeFilter('gps')}
                  className={`px-2 py-1 rounded ${practiceFilter === 'gps' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  GPS
                </button>
              </div>

              <div className="text-right pl-2">
                <div className="text-lg font-bold text-cyan-400">{formatCurrency(totalPipeline)}</div>
              </div>

              <Link href="/insights" className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-xs text-purple-300 border border-purple-500/30">
                Insights
              </Link>
              <Link href="/quantified" className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">
                Roadmap
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Cloud Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Setup Cloud Sync</h2>
                <button
                  onClick={() => setShowSetup(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  x
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Enable cloud sync to access your tracking data from any device.
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">Step 1: Open Supabase</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Go to your Supabase project dashboard and open the SQL Editor.
                </p>
                <a
                  href="https://supabase.com/dashboard/project/ujkbbvgrtkhyizmneiyt/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm transition-colors"
                >
                  Open SQL Editor
                  <span>-&gt;</span>
                </a>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Step 2: Run this SQL</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Copy and paste this into the SQL Editor, then click &quot;Run&quot;.
                </p>
                <div className="relative">
                  <pre className="bg-black rounded-lg p-4 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE IF NOT EXISTS opportunity_tracking (
  opportunity_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'on-radar',
  notes TEXT DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE opportunity_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON opportunity_tracking
  FOR ALL USING (true) WITH CHECK (true);`}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS opportunity_tracking (
  opportunity_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'on-radar',
  notes TEXT DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE opportunity_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON opportunity_tracking
  FOR ALL USING (true) WITH CHECK (true);`);
                    }}
                    className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Step 3: Refresh</h3>
                <p className="text-gray-400 text-sm mb-3">
                  After running the SQL, click below to check if it worked.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/tracking');
                      const data = await res.json();
                      if (data.source === 'supabase' || data.source === 'empty') {
                        setCloudEnabled(true);
                        setShowSetup(false);
                        // Migrate localStorage data to cloud
                        const saved = localStorage.getItem('genesis-tracking');
                        if (saved) {
                          const localData = JSON.parse(saved);
                          for (const [oppId, trackingData] of Object.entries(localData)) {
                            await fetch('/api/tracking', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ opportunityId: oppId, tracking: trackingData }),
                            });
                          }
                        }
                        setSyncStatus('synced');
                        setTimeout(() => setSyncStatus('idle'), 2000);
                      } else {
                        alert('Table not found. Make sure you ran the SQL and clicked "Run".');
                      }
                    } catch (e) {
                      alert('Error checking connection. Try again.');
                    }
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm transition-colors"
                >
                  Check Connection
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50">
              <p className="text-gray-500 text-xs">
                Your existing data will be migrated to the cloud automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {viewMode === 'live' ? (
          /* LIVE FEED VIEW */
          <LiveFeedView
            liveFeed={liveFeed}
            loading={liveFeedLoading}
            onRefresh={() => {
              setLiveFeed(null);
              setLiveFeedLoading(true);
              fetch('/api/live-feed')
                .then(res => res.json())
                .then(data => {
                  setLiveFeed(data);
                  setLiveFeedLoading(false);
                });
            }}
          />
        ) : viewMode === 'timeline' ? (
          /* TIMELINE VIEW */
          <TimelineView
            opportunities={filteredOpps}
            selectedOpp={selectedOpp}
            setSelectedOpp={setSelectedOpp}
            tracking={tracking}
          />
        ) : viewMode === 'dashboard' ? (
          /* DASHBOARD VIEW - Lead Lifecycle */
          <DashboardView
            opportunities={filteredOpps}
            tracking={tracking}
            updateStatus={updateStatus}
            selectedOpp={selectedOpp}
            setSelectedOpp={setSelectedOpp}
            agents={agents}
            actionItems={actionItems}
          />
        ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Action Lists */}
          <div className="col-span-4 space-y-4">
            {/* THIS WEEK */}
            <div className="bg-[#12121a] rounded-lg border border-gray-800">
              <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-white">This Week</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">{thisWeekActions.length}</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {thisWeekActions.length === 0 ? (
                  <div className="p-3 text-center text-gray-600 text-xs">No actions</div>
                ) : (
                  thisWeekActions.map(item => {
                    const linkedOpp = item.opportunityId ? opportunities.find(o => o.id === item.opportunityId) : null;
                    const isUrgent = item.priority === 'urgent';

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (linkedOpp) {
                            setSelectedOpp(linkedOpp);
                          } else if (item.sectorId) {
                            const sectorOpp = opportunities.find(o => o.genesisPillar === item.sectorId);
                            if (sectorOpp) setSelectedOpp(sectorOpp);
                          }
                        }}
                        className={`w-full px-3 py-2 text-left border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 transition-colors ${
                          linkedOpp && selectedOpp?.id === linkedOpp.id ? 'bg-cyan-500/10' : ''
                        } ${isUrgent ? 'border-l-2 border-l-red-500' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-medium ${isUrgent ? 'text-red-400' : 'text-orange-400'}`}>
                            {getDayLabel(item.daysUntil)}
                          </span>
                          <span className="text-[10px] text-gray-600">{item.deadline ? formatDate(item.deadline) : ''}</span>
                        </div>
                        <div className="text-sm text-gray-200 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* THIS MONTH */}
            <div className="bg-[#12121a] rounded-lg border border-gray-800">
              <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-white">This Month</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{thisMonthActions.length}</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {thisMonthActions.length === 0 ? (
                  <div className="p-3 text-center text-gray-600 text-xs">No actions</div>
                ) : (
                  thisMonthActions.map(item => {
                    const linkedOpp = item.opportunityId ? opportunities.find(o => o.id === item.opportunityId) : null;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (linkedOpp) {
                            setSelectedOpp(linkedOpp);
                          } else if (item.sectorId) {
                            const sectorOpp = opportunities.find(o => o.genesisPillar === item.sectorId);
                            if (sectorOpp) setSelectedOpp(sectorOpp);
                          }
                        }}
                        className={`w-full px-3 py-2 text-left border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 transition-colors ${
                          linkedOpp && selectedOpp?.id === linkedOpp.id ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-blue-400">{getDayLabel(item.daysUntil)}</span>
                          <span className="text-[10px] text-gray-600">{item.deadline ? formatDate(item.deadline) : ''}</span>
                        </div>
                        <div className="text-sm text-gray-200 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ALL OPPORTUNITIES */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white">All Opportunities</h2>
                  <span className="text-xs text-gray-500">{opportunities.length}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-800 max-h-[calc(100vh-600px)] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : (
                  sortedOpps.map(opp => {
                    const oppStatus = tracking[opp.id]?.status || 'on-radar';
                    const statusConfig = STATUS_CONFIG[oppStatus];
                    return (
                      <button
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className={`w-full p-3 text-left hover:bg-gray-800/50 transition-colors ${
                          selectedOpp?.id === opp.id ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{GENESIS_PILLAR_INFO[opp.genesisPillar].icon}</span>
                            <span className="text-sm text-white font-medium">{opp.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              PRACTICE_MAP[opp.entityType] === 'commercial'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {PRACTICE_MAP[opp.entityType] === 'commercial' ? 'COM' : 'GPS'}
                            </span>
                            {oppStatus !== 'on-radar' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-cyan-400">{formatCurrency(opp.estimatedValue)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500 ml-6">{opp.entity}</span>
                          {tracking[opp.id]?.notes && (
                            <span className="text-xs text-gray-600">📝</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Detail Panel */}
          <div className="col-span-8">
            {selectedOpp ? (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{GENESIS_PILLAR_INFO[selectedOpp.genesisPillar].icon}</span>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          {GENESIS_PILLAR_INFO[selectedOpp.genesisPillar].label}
                        </Badge>
                        <Badge className={`text-xs ${
                          PRACTICE_MAP[selectedOpp.entityType] === 'commercial'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {PRACTICE_MAP[selectedOpp.entityType] === 'commercial' ? 'Commercial' : 'GPS'}
                        </Badge>
                        <Badge className={`text-xs ${
                          selectedOpp.urgency === 'this-week' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          selectedOpp.urgency === 'this-month' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>{URGENCY_LABELS[selectedOpp.urgency].label}</Badge>
                      </div>
                      <h1 className="text-xl font-bold text-white">{selectedOpp.title}</h1>
                      <p className="text-sm text-gray-400 mt-1">{selectedOpp.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{formatCurrency(selectedOpp.estimatedValue)}</div>
                      <div className="text-sm text-gray-400">{selectedOpp.location}, {selectedOpp.state}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* ACTION BOX - Most Important */}
                  {selectedOpp.nextAction && (
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-bold text-white">NEXT ACTION</h3>
                        {selectedOpp.actionDeadline && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-auto">
                            Due: {formatDate(selectedOpp.actionDeadline)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg text-cyan-100 font-medium mb-4">{selectedOpp.nextAction}</div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">WHO TO CONTACT</div>
                          <div className="text-white font-medium">{selectedOpp.contactName || 'TBD'}</div>
                          <div className="text-sm text-gray-400">{selectedOpp.contactTitle || ''}</div>
                          <div className="text-sm text-cyan-400">{selectedOpp.contactCompany || ''}</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">DELOITTE OWNER</div>
                          <div className="text-white font-medium">{selectedOpp.deloitteOwner || 'TBD'}</div>
                          <div className="text-sm text-gray-400">Can make intro</div>
                        </div>
                      </div>

                      {selectedOpp.talkingPoints && selectedOpp.talkingPoints.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-gray-500 mb-2">TALKING POINTS</div>
                          <ul className="space-y-1">
                            {selectedOpp.talkingPoints.map((point, i) => (
                              <li key={i} className="text-sm text-gray-300 flex gap-2">
                                <span className="text-cyan-400">•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTOR CONTEXT - Strategic view */}
                  {(() => {
                    const ctx = SECTOR_CONTEXT[selectedOpp.genesisPillar];
                    if (!ctx) return null;

                    const statusConfig = {
                      'accelerating': { label: 'ACCELERATING', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
                      'on-track': { label: 'ON TRACK', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
                      'blocked': { label: 'BLOCKED', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
                    }[ctx.status];

                    return (
                      <div className={`rounded-xl p-4 border ${statusConfig.bg}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-white">SECTOR CONTEXT</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {ctx.moonshotNeeded && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              MOONSHOT NEEDED
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          {ctx.status !== 'accelerating' && (
                            <div>
                              <span className="text-xs text-gray-500">KEY BLOCKER:</span>
                              <div className="text-yellow-300">{ctx.keyBlocker}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-500">INCENTIVES:</span>
                            <div className="text-green-300">{ctx.keyIncentive}</div>
                          </div>
                          {ctx.policyGap && !ctx.policyGap.startsWith('None') && (
                            <div>
                              <span className="text-xs text-gray-500">POLICY GAP:</span>
                              <div className="text-red-300">{ctx.policyGap}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* SECTOR INTEL - From Agent */}
                  {(() => {
                    const sectorAgent = agents[selectedOpp.genesisPillar];
                    if (!sectorAgent) return null;

                    return (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-bold text-white">SECTOR INTEL</h3>
                          <span className="text-xs text-purple-400">{sectorAgent.name}</span>
                          {sectorAgent.lastRun && (
                            <span className="text-[10px] text-gray-500 ml-auto">
                              Updated: {formatDate(sectorAgent.lastRun)}
                            </span>
                          )}
                        </div>

                        {/* Active Alerts for this sector */}
                        {sectorAgent.alerts?.filter(a => a.status === 'active').length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-red-400 font-medium mb-2">ACTIVE ALERTS</div>
                            <div className="space-y-2">
                              {sectorAgent.alerts
                                .filter(a => a.status === 'active')
                                .slice(0, 2)
                                .map(alert => (
                                  <div key={alert.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                    <div className="text-sm text-red-200">{alert.message}</div>
                                    <div className="text-xs text-red-400 mt-1">{alert.action}</div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Findings */}
                        {sectorAgent.findings?.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-purple-400 font-medium mb-2">RECENT FINDINGS</div>
                            <div className="space-y-2">
                              {sectorAgent.findings
                                .slice(0, 2)
                                .map(finding => (
                                  <div key={finding.id} className="bg-purple-500/10 rounded-lg p-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        finding.relevance === 'critical' ? 'bg-red-500/30 text-red-300' :
                                        finding.relevance === 'high' ? 'bg-orange-500/30 text-orange-300' :
                                        'bg-gray-500/30 text-gray-300'
                                      }`}>{finding.relevance}</span>
                                      <span className="text-[10px] text-gray-500">{finding.type}</span>
                                    </div>
                                    <div className="text-sm text-purple-100">{finding.title}</div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* STATUS & NOTES */}
                  <div className="bg-[#0a0a0f] rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-400">STATUS</h3>
                      {tracking[selectedOpp.id]?.lastUpdated && (
                        <span className="text-xs text-gray-600">
                          Updated: {new Date(tracking[selectedOpp.id].lastUpdated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-4">
                      {(Object.keys(STATUS_CONFIG) as OppStatus[]).map(status => {
                        const config = STATUS_CONFIG[status];
                        const isActive = (tracking[selectedOpp.id]?.status || 'on-radar') === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(selectedOpp.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                              isActive
                                ? `${config.bg} ${config.color} border-current`
                                : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
                            }`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-2">NOTES</div>
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        onBlur={() => saveNotes(selectedOpp.id, editingNotes)}
                        placeholder="Add notes about this opportunity..."
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
                        rows={3}
                      />
                      <div className="text-xs text-gray-600 mt-1">Notes auto-save when you click away</div>
                    </div>
                  </div>

                  {/* ACTIVITY LOG */}
                  {tracking[selectedOpp.id]?.activity && tracking[selectedOpp.id].activity.length > 0 && (
                    <div className="bg-[#0a0a0f] rounded-xl border border-gray-800 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-400">ACTIVITY LOG</h3>
                        <span className="text-xs text-gray-600">{tracking[selectedOpp.id].activity.length} updates</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...tracking[selectedOpp.id].activity].reverse().map(entry => (
                          <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              entry.type === 'status-change' ? 'bg-purple-500/20 text-purple-400' :
                              entry.type === 'note-added' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {entry.type === 'status-change' ? '→' : entry.type === 'note-added' ? '+' : '~'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-200">{entry.details}</div>
                              <div className="text-xs text-gray-600">
                                {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Info Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#0a0a0f] rounded-lg p-3">
                      <div className="text-xs text-gray-500">Entity</div>
                      <div className="text-sm font-medium text-white">{selectedOpp.entity}</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-3">
                      <div className="text-xs text-gray-500">Stage</div>
                      <div className="text-sm font-medium text-white">{STAGE_LABELS[selectedOpp.procurementStage]}</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-3">
                      <div className="text-xs text-gray-500">Key Date</div>
                      <div className="text-sm font-medium text-white">{formatDate(selectedOpp.keyDate)}</div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-3">
                      <div className="text-xs text-gray-500">Funding</div>
                      <div className="text-sm font-medium text-white">{selectedOpp.fundingSource}</div>
                    </div>
                  </div>

                  {/* OT Scope - Collapsed */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-400">OT CYBER SCOPE</h3>
                      <Badge className={`text-xs ${
                        selectedOpp.otRelevance === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>{selectedOpp.otRelevance.toUpperCase()}</Badge>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-3 text-sm text-gray-300">
                      {selectedOpp.otScope}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOpp.otSystems.map(sys => (
                        <Badge key={sys} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">{OT_SYSTEM_LABELS[sys]}</Badge>
                      ))}
                      {selectedOpp.regulatoryDrivers.map(reg => (
                        <Badge key={reg} variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">{REGULATORY_LABELS[reg]}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Competition - Compact */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">LIKELY PRIMES</div>
                      {selectedOpp.likelyPrimes.map(p => <div key={p} className="text-gray-300">{p}</div>)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">COMPETITORS</div>
                      {selectedOpp.competitors.map(c => <div key={c} className="text-gray-300">{c}</div>)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">PARTNERS</div>
                      {selectedOpp.partnerOpportunities.map(p => <div key={p} className="text-gray-300">{p}</div>)}
                    </div>
                  </div>

                  {/* Deloitte Services */}
                  <div>
                    <div className="text-xs text-gray-500 mb-2">DELOITTE SERVICES</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpp.deloitteServices.map(svc => (
                        <Badge key={svc} variant="outline" className="border-blue-500/50 text-blue-400 text-xs">{DELOITTE_SERVICE_LABELS[svc]}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* SOURCES */}
                  <div className="bg-[#0a0a0f] rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🔗</span>
                      <h3 className="text-sm font-medium text-white">SOURCES & LINKS</h3>
                    </div>

                    {selectedOpp.sources && selectedOpp.sources.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOpp.sources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-cyan-400 group-hover:text-cyan-300">🌐</span>
                              <div>
                                <div className="text-sm text-white group-hover:text-cyan-300 transition-colors">{source.title}</div>
                                <div className="text-xs text-gray-500">{source.date}</div>
                              </div>
                            </div>
                            <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">→</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No sources linked</div>
                    )}

                    {/* Quick Links */}
                    <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(selectedOpp.entity + ' ' + selectedOpp.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        🔍 Search
                      </a>
                      {selectedOpp.entityType === 'federal' && (
                        <a
                          href={`https://sam.gov/search/?keywords=${encodeURIComponent(selectedOpp.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                          📋 SAM.gov
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Intel Notes - from opportunity data */}
                  {selectedOpp.notes && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="text-xs font-medium text-yellow-400 mb-1">INTEL NOTE</div>
                      <div className="text-sm text-yellow-200">{selectedOpp.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-12 text-center">
                <p className="text-gray-400">Select an opportunity</p>
              </div>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

// Dashboard View Component - Lead Lifecycle
function DashboardView({
  opportunities,
  tracking,
  updateStatus,
  selectedOpp,
  setSelectedOpp,
  agents,
  actionItems,
}: {
  opportunities: ActionableOpportunity[];
  tracking: Record<string, OppTracking>;
  updateStatus: (oppId: string, status: OppStatus) => void;
  selectedOpp: ActionableOpportunity | null;
  setSelectedOpp: (opp: ActionableOpportunity) => void;
  agents: Record<GenesisPillar, SectorAgent>;
  actionItems: ActionItem[];
}) {
  // Group opportunities by status
  const stages: OppStatus[] = ['on-radar', 'contacted', 'meeting', 'proposal', 'closed'];
  const oppsByStage: Record<OppStatus, ActionableOpportunity[]> = {
    'on-radar': [],
    'contacted': [],
    'meeting': [],
    'proposal': [],
    'closed': [],
  };

  opportunities.forEach(opp => {
    const status = tracking[opp.id]?.status || 'on-radar';
    oppsByStage[status].push(opp);
  });

  // Calculate metrics
  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
  const activeValue = opportunities
    .filter(o => {
      const s = tracking[o.id]?.status || 'on-radar';
      return s !== 'closed';
    })
    .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  const closedValue = oppsByStage['closed'].reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
  const proposalValue = oppsByStage['proposal'].reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
  const meetingValue = oppsByStage['meeting'].reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  // Find stalled opportunities (no update in 7+ days)
  const now = new Date();
  const stalledOpps = opportunities.filter(opp => {
    const lastUpdated = tracking[opp.id]?.lastUpdated;
    if (!lastUpdated) return false;
    const daysSince = Math.floor((now.getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7 && tracking[opp.id]?.status !== 'closed';
  });

  // This week's actions
  const thisWeekActions = actionItems.filter(item =>
    item.daysUntil !== null && item.daysUntil >= 0 && item.daysUntil <= 7
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Pipeline Summary Row */}
      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage, idx) => {
          const config = STATUS_CONFIG[stage];
          const opps = oppsByStage[stage];
          const value = opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage} className="relative">
              <div className={`bg-[#12121a] rounded-lg border ${stage === 'closed' ? 'border-green-500/30' : 'border-gray-800'} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  <span className={`text-lg font-bold ${config.color}`}>{opps.length}</span>
                </div>
                <div className="text-xl font-bold text-white">{formatCurrency(value)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stage === 'closed' ? 'Won' : 'In stage'}
                </div>
              </div>
              {/* Arrow connector */}
              {!isLast && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-gray-600">
                  →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#12121a] rounded-lg border border-gray-800 p-4">
          <div className="text-xs text-gray-500 mb-1">Total Pipeline</div>
          <div className="text-2xl font-bold text-cyan-400">{formatCurrency(totalPipeline)}</div>
          <div className="text-xs text-gray-600">{opportunities.length} opportunities</div>
        </div>
        <div className="bg-[#12121a] rounded-lg border border-gray-800 p-4">
          <div className="text-xs text-gray-500 mb-1">Active Pipeline</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(activeValue)}</div>
          <div className="text-xs text-gray-600">{opportunities.length - oppsByStage['closed'].length} active</div>
        </div>
        <div className="bg-[#12121a] rounded-lg border border-gray-800 p-4">
          <div className="text-xs text-gray-500 mb-1">In Proposal</div>
          <div className="text-2xl font-bold text-purple-400">{formatCurrency(proposalValue)}</div>
          <div className="text-xs text-gray-600">{oppsByStage['proposal'].length} pending decision</div>
        </div>
        <div className="bg-[#12121a] rounded-lg border border-gray-800 p-4">
          <div className="text-xs text-gray-500 mb-1">Closed Won</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(closedValue)}</div>
          <div className="text-xs text-gray-600">{oppsByStage['closed'].length} wins</div>
        </div>
      </div>

      {/* Main Content: Kanban + Actions */}
      <div className="grid grid-cols-12 gap-6">
        {/* Kanban Board */}
        <div className="col-span-9">
          <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Pipeline Board</h2>
              <span className="text-xs text-gray-500">Drag coming soon</span>
            </div>

            <div className="grid grid-cols-5 divide-x divide-gray-800 min-h-[400px]">
              {stages.map(stage => {
                const config = STATUS_CONFIG[stage];
                const opps = oppsByStage[stage];

                return (
                  <div key={stage} className="flex flex-col">
                    {/* Stage Header */}
                    <div className={`px-3 py-2 border-b border-gray-800 ${config.bg}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        <span className={`text-xs ${config.color}`}>{opps.length}</span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[350px]">
                      {opps.length === 0 ? (
                        <div className="text-center text-gray-600 text-xs py-4">Empty</div>
                      ) : (
                        opps.map(opp => {
                          const daysUntil = getDaysUntil(opp.keyDate);
                          const isSelected = selectedOpp?.id === opp.id;

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
                                  PRACTICE_MAP[opp.entityType] === 'commercial'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {PRACTICE_MAP[opp.entityType] === 'commercial' ? 'C' : 'G'}
                                </span>
                                {daysUntil !== null && daysUntil <= 7 && daysUntil >= 0 && (
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
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-4">
          {/* This Week Actions */}
          <div className="bg-[#12121a] rounded-lg border border-gray-800">
            <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-white">This Week</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">{thisWeekActions.length}</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {thisWeekActions.length === 0 ? (
                <div className="p-3 text-center text-gray-600 text-xs">No actions</div>
              ) : (
                thisWeekActions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const opp = opportunities.find(o => o.id === item.opportunityId);
                      if (opp) setSelectedOpp(opp);
                    }}
                    className="w-full px-3 py-2 text-left border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50"
                  >
                    <div className="text-xs text-orange-400 mb-0.5">{getDayLabel(item.daysUntil)}</div>
                    <div className="text-xs text-gray-200 line-clamp-1">{item.title}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Stalled Opportunities */}
          <div className="bg-[#12121a] rounded-lg border border-yellow-500/30">
            <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between bg-yellow-500/10">
              <span className="text-sm font-medium text-yellow-400">Needs Attention</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">{stalledOpps.length}</span>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {stalledOpps.length === 0 ? (
                <div className="p-3 text-center text-gray-600 text-xs">All active</div>
              ) : (
                stalledOpps.map(opp => {
                  const daysSince = Math.floor((now.getTime() - new Date(tracking[opp.id]?.lastUpdated || '').getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <button
                      key={opp.id}
                      onClick={() => setSelectedOpp(opp)}
                      className="w-full px-3 py-2 text-left border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-yellow-400">{daysSince}d stalled</span>
                        <span className="text-[10px] text-gray-500">{STATUS_CONFIG[tracking[opp.id]?.status || 'on-radar'].label}</span>
                      </div>
                      <div className="text-xs text-gray-200 line-clamp-1">{opp.title}</div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#12121a] rounded-lg border border-gray-800 p-3">
            <div className="text-xs text-gray-500 mb-2">Conversion</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Radar → Contact</span>
                <span className="text-white font-medium">
                  {oppsByStage['on-radar'].length > 0
                    ? Math.round(((opportunities.length - oppsByStage['on-radar'].length) / opportunities.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Contact → Meeting</span>
                <span className="text-white font-medium">
                  {oppsByStage['contacted'].length + oppsByStage['meeting'].length + oppsByStage['proposal'].length + oppsByStage['closed'].length > 0
                    ? Math.round(((oppsByStage['meeting'].length + oppsByStage['proposal'].length + oppsByStage['closed'].length) /
                        (oppsByStage['contacted'].length + oppsByStage['meeting'].length + oppsByStage['proposal'].length + oppsByStage['closed'].length)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Meeting → Proposal</span>
                <span className="text-white font-medium">
                  {oppsByStage['meeting'].length + oppsByStage['proposal'].length + oppsByStage['closed'].length > 0
                    ? Math.round(((oppsByStage['proposal'].length + oppsByStage['closed'].length) /
                        (oppsByStage['meeting'].length + oppsByStage['proposal'].length + oppsByStage['closed'].length)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-green-400 font-medium">
                  {oppsByStage['proposal'].length + oppsByStage['closed'].length > 0
                    ? Math.round((oppsByStage['closed'].length / (oppsByStage['proposal'].length + oppsByStage['closed'].length)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Opportunity Quick View */}
      {selectedOpp && (
        <div className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{GENESIS_PILLAR_INFO[selectedOpp.genesisPillar].icon}</span>
              <div>
                <h3 className="font-bold text-white">{selectedOpp.title}</h3>
                <p className="text-sm text-gray-400">{selectedOpp.entity} • {formatCurrency(selectedOpp.estimatedValue)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {stages.map(stage => {
                const config = STATUS_CONFIG[stage];
                const isActive = (tracking[selectedOpp.id]?.status || 'on-radar') === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => updateStatus(selectedOpp.id, stage)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      isActive
                        ? `${config.bg} ${config.color} border border-current`
                        : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Action + Notes */}
            <div className="space-y-3">
              {selectedOpp.nextAction && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-xs text-cyan-400 mb-1">NEXT ACTION</div>
                  <div className="text-sm text-white">{selectedOpp.nextAction}</div>
                  {selectedOpp.actionDeadline && (
                    <div className="text-xs text-gray-400 mt-1">Due: {formatDate(selectedOpp.actionDeadline)}</div>
                  )}
                </div>
              )}
              {tracking[selectedOpp.id]?.notes && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">NOTES</div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">{tracking[selectedOpp.id].notes}</div>
                </div>
              )}
            </div>

            {/* Right: Activity Log */}
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-2">RECENT ACTIVITY</div>
              {tracking[selectedOpp.id]?.activity && tracking[selectedOpp.id].activity.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {[...tracking[selectedOpp.id].activity].reverse().slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex items-start gap-2 text-xs">
                      <span className={`${
                        entry.type === 'status-change' ? 'text-purple-400' :
                        entry.type === 'note-added' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {entry.type === 'status-change' ? '→' : entry.type === 'note-added' ? '+' : '~'}
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-300">{entry.details}</span>
                        <span className="text-gray-600 ml-2">
                          {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-600">No activity yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Timeline View Component
function TimelineView({
  opportunities,
  selectedOpp,
  setSelectedOpp,
  tracking,
}: {
  opportunities: ActionableOpportunity[];
  selectedOpp: ActionableOpportunity | null;
  setSelectedOpp: (opp: ActionableOpportunity) => void;
  tracking: Record<string, OppTracking>;
}) {
  // Group opportunities by month based on keyDate
  const oppsWithDates = opportunities.filter(o => o.keyDate);
  const oppsByMonth: Record<string, ActionableOpportunity[]> = {};

  oppsWithDates.forEach(opp => {
    const monthKey = getMonthKey(opp.keyDate!);
    if (!oppsByMonth[monthKey]) {
      oppsByMonth[monthKey] = [];
    }
    oppsByMonth[monthKey].push(opp);
  });

  // Sort months
  const sortedMonths = Object.keys(oppsByMonth).sort();

  // Get current month for highlighting
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Timeline */}
      <div className="col-span-5 space-y-4">
        <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <span>📅</span> Timeline by Key Dates
            </h2>
            <p className="text-xs text-gray-500 mt-1">Opportunities sorted by milestone dates</p>
          </div>

          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {sortedMonths.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No opportunities with key dates</div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>

                {sortedMonths.map((monthKey, idx) => {
                  const monthOpps = oppsByMonth[monthKey];
                  const isCurrentMonth = monthKey === currentMonthKey;
                  const isPast = monthKey < currentMonthKey;

                  return (
                    <div key={monthKey} className="relative mb-6">
                      {/* Month marker */}
                      <div className={`flex items-center gap-3 mb-3 ${isCurrentMonth ? 'text-cyan-400' : isPast ? 'text-gray-500' : 'text-white'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                          isCurrentMonth ? 'bg-cyan-500 text-white' : isPast ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-white border border-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="font-bold text-lg">{formatMonthYear(monthKey + '-01')}</span>
                        {isCurrentMonth && <span className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded-full">NOW</span>}
                      </div>

                      {/* Month's opportunities */}
                      <div className="ml-11 space-y-2">
                        {monthOpps.sort((a, b) => new Date(a.keyDate!).getTime() - new Date(b.keyDate!).getTime()).map(opp => {
                          const oppStatus = tracking[opp.id]?.status || 'on-radar';
                          const statusConfig = STATUS_CONFIG[oppStatus];
                          const daysUntil = getDaysUntil(opp.keyDate);

                          return (
                            <button
                              key={opp.id}
                              onClick={() => setSelectedOpp(opp)}
                              className={`w-full p-3 rounded-lg text-left transition-all border ${
                                selectedOpp?.id === opp.id
                                  ? 'bg-cyan-500/20 border-cyan-500'
                                  : 'bg-[#0a0a0f] border-gray-800 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{GENESIS_PILLAR_INFO[opp.genesisPillar].icon}</span>
                                  <span className="text-xs text-gray-500">{formatDate(opp.keyDate)}</span>
                                  {daysUntil !== null && daysUntil <= 14 && daysUntil >= 0 && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                      {daysUntil === 0 ? 'TODAY' : `${daysUntil}d`}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-cyan-400">{formatCurrency(opp.estimatedValue)}</span>
                              </div>
                              <div className="text-sm text-white font-medium">{opp.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{opp.keyDateDescription || opp.subtitle}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-[10px] text-gray-600">{STAGE_LABELS[opp.procurementStage]}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="col-span-7">
        {selectedOpp ? (
          <TimelineDetailPanel opp={selectedOpp} tracking={tracking} />
        ) : (
          <div className="bg-[#12121a] rounded-xl border border-gray-800 p-12 text-center">
            <p className="text-gray-400">Select an opportunity from the timeline</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Timeline Detail Panel with Sources
function TimelineDetailPanel({
  opp,
  tracking,
}: {
  opp: ActionableOpportunity;
  tracking: Record<string, OppTracking>;
}) {
  const oppStatus = tracking[opp.id]?.status || 'on-radar';
  const statusConfig = STATUS_CONFIG[oppStatus];

  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{GENESIS_PILLAR_INFO[opp.genesisPillar].icon}</span>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {GENESIS_PILLAR_INFO[opp.genesisPillar].label}
              </Badge>
              <Badge className={`text-xs ${statusConfig.bg} ${statusConfig.color} border-current`}>
                {statusConfig.label}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-white">{opp.title}</h1>
            <p className="text-sm text-gray-400 mt-1">{opp.subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{formatCurrency(opp.estimatedValue)}</div>
            <div className="text-sm text-gray-400">{opp.location}, {opp.state}</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[calc(100vh-280px)] overflow-y-auto">
        {/* Key Date Highlight */}
        {opp.keyDate && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-cyan-400 font-medium mb-1">KEY DATE</div>
                <div className="text-lg text-white font-bold">{formatDate(opp.keyDate)}</div>
                <div className="text-sm text-gray-400 mt-1">{opp.keyDateDescription}</div>
              </div>
              {getDaysUntil(opp.keyDate) !== null && (
                <div className={`text-right ${getDaysUntil(opp.keyDate)! <= 7 ? 'text-red-400' : 'text-cyan-400'}`}>
                  <div className="text-2xl font-bold">{getDayLabel(getDaysUntil(opp.keyDate))}</div>
                  <div className="text-xs">remaining</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Info Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <div className="text-xs text-gray-500">Entity</div>
            <div className="text-sm font-medium text-white">{opp.entity}</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <div className="text-xs text-gray-500">Stage</div>
            <div className="text-sm font-medium text-white">{STAGE_LABELS[opp.procurementStage]}</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <div className="text-xs text-gray-500">Response Deadline</div>
            <div className="text-sm font-medium text-white">{opp.responseDeadline ? formatDate(opp.responseDeadline) : 'TBD'}</div>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <div className="text-xs text-gray-500">Funding</div>
            <div className="text-sm font-medium text-white">{opp.fundingSource}</div>
          </div>
        </div>

        {/* Genesis Connection */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs font-medium text-purple-400 mb-1">GENESIS CONNECTION</div>
          <div className="text-sm text-purple-200">{opp.genesisConnection}</div>
        </div>

        {/* OT Scope */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-gray-400">OT CYBER SCOPE</h3>
            <Badge className={`text-xs ${
              opp.otRelevance === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-orange-500/20 text-orange-400 border-orange-500/30'
            }`}>{opp.otRelevance.toUpperCase()}</Badge>
          </div>
          <div className="bg-[#0a0a0f] rounded-lg p-3 text-sm text-gray-300 whitespace-pre-line">
            {opp.otScope}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {opp.otSystems.map(sys => (
              <Badge key={sys} variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">{OT_SYSTEM_LABELS[sys]}</Badge>
            ))}
            {opp.regulatoryDrivers.map(reg => (
              <Badge key={reg} variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">{REGULATORY_LABELS[reg]}</Badge>
            ))}
          </div>
        </div>

        {/* SOURCES - New Section */}
        <div className="bg-[#0a0a0f] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔗</span>
            <h3 className="text-sm font-medium text-white">SOURCES & LINKS</h3>
          </div>

          {opp.sources && opp.sources.length > 0 ? (
            <div className="space-y-2">
              {opp.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 group-hover:text-cyan-300">🌐</span>
                    <div>
                      <div className="text-sm text-white group-hover:text-cyan-300 transition-colors">{source.title}</div>
                      <div className="text-xs text-gray-500">{source.date}</div>
                    </div>
                  </div>
                  <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">→</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sources linked yet</div>
          )}

          {/* Quick Links based on entity */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-2">QUICK LINKS</div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(opp.entity + ' ' + opp.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                🔍 Search News
              </a>
              {opp.entityType === 'federal' && (
                <a
                  href={`https://sam.gov/search/?keywords=${encodeURIComponent(opp.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  📋 SAM.gov
                </a>
              )}
              {opp.fundingSource.includes('CHIPS') && (
                <a
                  href="https://www.commerce.gov/chips"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  🏛️ CHIPS Office
                </a>
              )}
              {opp.fundingSource.includes('DOE') && (
                <a
                  href="https://www.energy.gov/funding-financing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  ⚡ DOE Funding
                </a>
              )}
              {opp.fundingSource.includes('BIL') && (
                <a
                  href="https://www.whitehouse.gov/invest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  🏗️ Invest.gov
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Competition */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">LIKELY PRIMES</div>
            {opp.likelyPrimes.map(p => <div key={p} className="text-gray-300">{p}</div>)}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">COMPETITORS</div>
            {opp.competitors.map(c => <div key={c} className="text-gray-300">{c}</div>)}
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">PARTNERS</div>
            {opp.partnerOpportunities.map(p => <div key={p} className="text-gray-300">{p}</div>)}
          </div>
        </div>

        {/* Intel Notes */}
        {opp.notes && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-xs font-medium text-yellow-400 mb-1">INTEL NOTE</div>
            <div className="text-sm text-yellow-200">{opp.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Live Feed Card Component
function LiveFeedCard({
  source,
  color,
  renderItem,
}: {
  source: LiveFeedSource;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'cyan' | 'orange';
  renderItem: (item: Record<string, unknown>) => React.ReactNode;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  };

  const badgeColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
      <div className={`px-3 py-2 bg-gradient-to-r ${colorClasses[color]} border-b border-gray-800`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{source.icon}</span>
            <h3 className="font-bold text-white text-sm">{source.name}</h3>
          </div>
          <Badge className={`${badgeColors[color]} text-xs`}>
            {source.count}
          </Badge>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">{source.description}</p>
      </div>

      <div className="divide-y divide-gray-800 max-h-[300px] overflow-y-auto">
        {source.status === 'error' ? (
          <div className="p-3 text-center text-red-400 text-sm">
            <p>Failed to fetch</p>
            {source.error && <p className="text-xs text-gray-500 mt-1">{source.error}</p>}
          </div>
        ) : source.data.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">No data</div>
        ) : (
          source.data.slice(0, 8).map((item) => renderItem(item as Record<string, unknown>))
        )}
      </div>
    </div>
  );
}

// Live Feed View Component
function LiveFeedView({
  liveFeed,
  loading,
  onRefresh,
}: {
  liveFeed: LiveFeedData | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Fetching live data from federal APIs...</p>
          <p className="text-xs text-gray-600 mt-2">SAM.gov • USASpending.gov</p>
        </div>
      </div>
    );
  }

  if (!liveFeed) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Unable to load live feed</p>
        <button onClick={onRefresh} className="mt-4 px-4 py-2 bg-cyan-500 rounded-lg text-white">
          Retry
        </button>
      </div>
    );
  }

  const lastUpdated = new Date(liveFeed.fetchedAt);
  const minutesAgo = Math.round((Date.now() - lastUpdated.getTime()) / 60000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-white">Live Data Feed</h2>
          </div>
          <span className="text-sm text-gray-500">
            {liveFeed.summary.sourcesActive}/6 sources • {liveFeed.summary.totalItems} items • Updated {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center gap-2"
        >
          🔄 Refresh
        </button>
      </div>

      {/* 3x2 Grid of Sources */}
      <div className="grid grid-cols-3 gap-4">
        {/* SAM.gov */}
        <LiveFeedCard
          source={liveFeed.sources.sam}
          color="blue"
          renderItem={(item: Record<string, unknown>) => {
            const opp = item as { id: string; title: string; entity: string; key_date: string | null; ot_relevance: string; sources?: Array<{ url: string }> };
            const daysUntil = opp.key_date ? getDaysUntil(opp.key_date) : null;
            return (
              <a key={opp.id} href={opp.sources?.[0]?.url || '#'} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] ${opp.ot_relevance === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>{opp.ot_relevance}</Badge>
                  {daysUntil !== null && daysUntil <= 14 && daysUntil >= 0 && <Badge className="bg-red-500/20 text-red-400 text-[10px]">{daysUntil}d</Badge>}
                </div>
                <div className="text-sm text-white truncate">{opp.title}</div>
                <div className="text-xs text-gray-500 truncate">{opp.entity}</div>
              </a>
            );
          }}
        />

        {/* USASpending */}
        <LiveFeedCard
          source={liveFeed.sources.awards}
          color="green"
          renderItem={(item: Record<string, unknown>) => {
            const award = item as { id: string; title: string; recipient: string; amount: number; url: string };
            return (
              <a key={award.id} href={award.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-green-400">{formatCurrency(award.amount)}</span>
                </div>
                <div className="text-sm text-white truncate">{award.title}</div>
                <div className="text-xs text-green-400 truncate">{award.recipient}</div>
              </a>
            );
          }}
        />

        {/* Grants.gov */}
        <LiveFeedCard
          source={liveFeed.sources.grants}
          color="purple"
          renderItem={(item: Record<string, unknown>) => {
            const grant = item as { id: string; title: string; agency: string; closeDate: string; daysUntilClose: number | null; url: string; amount?: { max: number } };
            return (
              <a key={grant.id} href={grant.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {grant.daysUntilClose !== null && grant.daysUntilClose <= 30 && grant.daysUntilClose >= 0 && (
                    <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">{grant.daysUntilClose}d left</Badge>
                  )}
                  {grant.amount?.max && <span className="text-xs text-purple-400">{formatCurrency(grant.amount.max)}</span>}
                </div>
                <div className="text-sm text-white truncate">{grant.title}</div>
                <div className="text-xs text-gray-500 truncate">{grant.agency}</div>
              </a>
            );
          }}
        />

        {/* Energy.gov */}
        <LiveFeedCard
          source={liveFeed.sources.doe}
          color="yellow"
          renderItem={(item: Record<string, unknown>) => {
            const doc = item as { id: string; title: string; office: string; type: string; url: string; date: string };
            return (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-[10px] ${doc.type === 'funding' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>{doc.type}</Badge>
                  <span className="text-xs text-gray-500">{formatDate(doc.date)}</span>
                </div>
                <div className="text-sm text-white truncate">{doc.title}</div>
                <div className="text-xs text-yellow-400 truncate">{doc.office}</div>
              </a>
            );
          }}
        />

        {/* News Feed */}
        <LiveFeedCard
          source={liveFeed.sources.news}
          color="cyan"
          renderItem={(item: Record<string, unknown>) => {
            const news = item as { id: string; title: string; source: string; url: string; date: string; pillar: string };
            return (
              <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-cyan-400">{news.source}</span>
                  <span className="text-xs text-gray-600">{formatDate(news.date)}</span>
                </div>
                <div className="text-sm text-white truncate">{news.title}</div>
              </a>
            );
          }}
        />

        {/* SEC Filings */}
        <LiveFeedCard
          source={liveFeed.sources.sec}
          color="orange"
          renderItem={(item: Record<string, unknown>) => {
            const filing = item as { id: string; company: string; ticker: string; form: string; filedDate: string; url: string };
            return (
              <a key={filing.id} href={filing.url} target="_blank" rel="noopener noreferrer" className="block p-3 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">{filing.form}</Badge>
                  <span className="text-xs text-gray-500">{formatDate(filing.filedDate)}</span>
                </div>
                <div className="text-sm text-white">{filing.company}</div>
                <div className="text-xs text-orange-400">{filing.ticker}</div>
              </a>
            );
          }}
        />
      </div>

      {/* Data Sources Legend */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-500">●</span>
            <span className="text-gray-400">Auto-refreshes every 30 min</span>
          </div>
          {Object.entries(liveFeed.sources).map(([key, source]) => (
            <div key={key} className="flex items-center gap-1">
              <span>{source.icon}</span>
              <span className={source.status === 'ok' ? 'text-gray-400' : 'text-red-400'}>
                {source.name}
              </span>
              {source.status === 'error' && <span className="text-red-400 text-xs">✗</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
