import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  SectorAgent,
  SectorAlert,
  SectorMemory,
  initializeSectorAgent,
  runSectorAgent,
  getAllSectorIds,
} from '@/lib/agents/sector-agents';
import { OPPORTUNITIES } from '@/lib/opportunities-data';
import { GenesisPillar } from '@/lib/types';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - List all sector agents and their status
export async function GET() {
  try {
    // Try to get agents from Supabase
    const { data: dbAgents, error } = await supabase
      .from('sector_agents')
      .select('*')
      .order('last_run', { ascending: false });

    if (error || !dbAgents || dbAgents.length === 0) {
      // Return pre-populated agents with curated intelligence
      const defaultAgents: SectorAgent[] = getAllSectorIds().map(pillarId => {
        return initializeSectorAgent(pillarId);
      });

      return NextResponse.json({
        agents: defaultAgents,
        source: 'default',
      });
    }

    // Transform DB records to SectorAgent format
    const agents: SectorAgent[] = dbAgents.map(row => ({
      id: row.id as GenesisPillar,
      name: row.name,
      icon: row.icon,
      status: row.status,
      lastRun: row.last_run,
      memory: row.memory || {},
      findings: row.findings || [],
      alerts: row.alerts || [],
    }));

    return NextResponse.json({
      agents,
      source: 'supabase',
    });
  } catch (error) {
    console.error('Error fetching sector agents:', error);

    // Fallback to pre-populated agents
    const defaultAgents: SectorAgent[] = getAllSectorIds().map(pillarId => {
      return initializeSectorAgent(pillarId);
    });

    return NextResponse.json({
      agents: defaultAgents,
      source: 'fallback',
    });
  }
}

// POST - Run a sector agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sectorId } = body;

    if (action === 'run-sector-agent' && sectorId) {
      // Validate sector ID
      if (!getAllSectorIds().includes(sectorId)) {
        return NextResponse.json({ error: 'Invalid sector ID' }, { status: 400 });
      }

      // Get or initialize agent state
      let currentAgent: SectorAgent = initializeSectorAgent(sectorId);

      // Try to get from Supabase
      try {
        const { data: dbAgent } = await supabase
          .from('sector_agents')
          .select('*')
          .eq('id', sectorId)
          .single();

        if (dbAgent) {
          currentAgent = {
            id: dbAgent.id,
            name: dbAgent.name,
            icon: dbAgent.icon,
            status: dbAgent.status,
            lastRun: dbAgent.last_run,
            memory: dbAgent.memory || currentAgent.memory,
            findings: dbAgent.findings || currentAgent.findings,
            alerts: dbAgent.alerts || currentAgent.alerts,
          };
        }
      } catch (e) {
        // Continue with default agent
      }

      // Run the sector agent
      const result = await runSectorAgent(sectorId, OPPORTUNITIES, currentAgent);

      // Update agent state
      const updatedAgent: SectorAgent = {
        ...currentAgent,
        status: 'idle',
        lastRun: new Date().toISOString(),
        findings: [...(currentAgent.findings || []).slice(-15), ...result.findings], // Keep last 15 + new
        alerts: [
          ...(currentAgent.alerts || []).filter(a => a.status === 'active').slice(-5),
          ...result.alerts,
        ],
        memory: {
          ...currentAgent.memory,
          ...result.memoryUpdates,
          marketTrends: [
            ...(currentAgent.memory?.marketTrends || []).slice(-5),
            ...(result.memoryUpdates.marketTrends || []),
          ].slice(-8),
          regulatoryUpdates: [
            ...(currentAgent.memory?.regulatoryUpdates || []).slice(-5),
            ...(result.memoryUpdates.regulatoryUpdates || []),
          ].slice(-6),
          recentNews: [
            ...(currentAgent.memory?.recentNews || []).slice(-5),
            ...(result.memoryUpdates.recentNews || []),
          ].slice(-8),
          risks: [
            ...(currentAgent.memory?.risks || []).slice(-3),
            ...(result.memoryUpdates.risks || []),
          ].slice(-5),
          lastUpdated: new Date().toISOString(),
        },
      };

      // Try to save to Supabase
      try {
        await supabase.from('sector_agents').upsert({
          id: updatedAgent.id,
          name: updatedAgent.name,
          icon: updatedAgent.icon,
          status: updatedAgent.status,
          last_run: updatedAgent.lastRun,
          memory: updatedAgent.memory,
          findings: updatedAgent.findings,
          alerts: updatedAgent.alerts,
        });
      } catch (e) {
        console.log('Could not save to Supabase (table may not exist)');
      }

      return NextResponse.json({
        success: true,
        agent: updatedAgent,
        newFindings: result.findings.length,
        newAlerts: result.alerts.length,
      });
    }

    if (action === 'run-all-sectors') {
      // Run all sector agents in parallel
      const results = await Promise.all(
        getAllSectorIds().map(async (sectorId) => {
          try {
            const currentAgent = initializeSectorAgent(sectorId);
            const result = await runSectorAgent(sectorId, OPPORTUNITIES, currentAgent);
            return {
              sectorId,
              success: true,
              findings: result.findings.length,
              alerts: result.alerts.length,
              agent: {
                ...currentAgent,
                lastRun: new Date().toISOString(),
                findings: [...currentAgent.findings, ...result.findings],
                alerts: [...currentAgent.alerts.filter(a => a.status === 'active'), ...result.alerts],
              }
            };
          } catch (error) {
            // Return default agent even on error
            const defaultAgent = initializeSectorAgent(sectorId);
            return {
              sectorId,
              success: true,
              findings: defaultAgent.findings.length,
              alerts: defaultAgent.alerts.length,
              agent: defaultAgent
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        results,
        agents: results.map(r => r.agent),
      });
    }

    if (action === 'acknowledge-alert') {
      const { alertId, sectorId } = body;

      // Update alert status in Supabase
      try {
        const { data: agent } = await supabase
          .from('sector_agents')
          .select('alerts')
          .eq('id', sectorId)
          .single();

        if (agent) {
          const alerts = (agent.alerts || []).map((a: SectorAlert) =>
            a.id === alertId ? { ...a, status: 'acknowledged' } : a
          );

          await supabase
            .from('sector_agents')
            .update({ alerts })
            .eq('id', sectorId);
        }
      } catch (e) {
        // Continue silently
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Agent action error:', error);
    return NextResponse.json({ error: 'Failed to execute agent action' }, { status: 500 });
  }
}
