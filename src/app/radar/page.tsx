'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Opportunity,
  Signal,
  Sector,
  OTRelevance,
  ProcurementStage,
  SECTOR_LABELS,
  STAGE_LABELS
} from '@/lib/types';

function formatCurrency(value: number | null): string {
  if (!value) return 'TBD';
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const OT_RELEVANCE_COLORS: Record<OTRelevance, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
};

const STAGE_COLORS: Record<ProcurementStage, string> = {
  announced: 'bg-blue-500/20 text-blue-400',
  planning: 'bg-purple-500/20 text-purple-400',
  'rfp-open': 'bg-green-500/20 text-green-400',
  awarded: 'bg-cyan-500/20 text-cyan-400',
  construction: 'bg-orange-500/20 text-orange-400',
  operational: 'bg-gray-500/20 text-gray-400'
};

const SECTOR_COLORS: Record<Sector, string> = {
  'data-centers': 'bg-indigo-500/20 text-indigo-400',
  'nuclear': 'bg-yellow-500/20 text-yellow-400',
  'grid': 'bg-cyan-500/20 text-cyan-400',
  'semiconductors': 'bg-purple-500/20 text-purple-400',
  'critical-minerals': 'bg-orange-500/20 text-orange-400',
  'water': 'bg-blue-500/20 text-blue-400',
  'ev-battery': 'bg-green-500/20 text-green-400',
  'clean-energy': 'bg-emerald-500/20 text-emerald-400',
  'manufacturing': 'bg-gray-500/20 text-gray-400'
};

export default function RadarPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    totalValue: number;
    highOTRelevance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Filters
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>('all');
  const [otFilter, setOtFilter] = useState<OTRelevance | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<ProcurementStage | 'all'>('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [oppRes, sigRes] = await Promise.all([
          fetch('/api/opportunities'),
          fetch('/api/signals')
        ]);
        const oppData = await oppRes.json();
        const sigData = await sigRes.json();

        setOpportunities(oppData.opportunities);
        setStats(oppData.stats);
        setSignals(sigData.signals);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    if (sectorFilter !== 'all' && opp.sector !== sectorFilter) return false;
    if (otFilter !== 'all' && opp.otRelevance !== otFilter) return false;
    if (stageFilter !== 'all' && opp.procurementStage !== stageFilter) return false;
    return true;
  });

  const filteredValue = filteredOpportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OT Cyber Radar</h1>
                <p className="text-sm text-gray-400">Genesis Program & Critical Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-400">Live</span>
              </div>
              <span className="text-gray-500 text-sm">
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#12121a] border-gray-800">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-white">{filteredOpportunities.length}</div>
                <div className="text-sm text-gray-400">Opportunities</div>
              </CardContent>
            </Card>
            <Card className="bg-[#12121a] border-gray-800">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-cyan-400">{formatCurrency(filteredValue)}</div>
                <div className="text-sm text-gray-400">Pipeline Value</div>
              </CardContent>
            </Card>
            <Card className="bg-[#12121a] border-gray-800">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-red-400">
                  {filteredOpportunities.filter(o => o.otRelevance === 'high').length}
                </div>
                <div className="text-sm text-gray-400">High OT Relevance</div>
              </CardContent>
            </Card>
            <Card className="bg-[#12121a] border-gray-800">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-400">
                  {filteredOpportunities.filter(o => o.procurementStage === 'rfp-open').length}
                </div>
                <div className="text-sm text-gray-400">RFPs Open</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sector:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={sectorFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSectorFilter('all')}
                className="h-7 text-xs"
              >
                All
              </Button>
              {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={sectorFilter === key ? 'default' : 'outline'}
                  onClick={() => setSectorFilter(key as Sector)}
                  className="h-7 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">OT Relevance:</span>
            <div className="flex gap-1">
              {['all', 'high', 'medium', 'low'].map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant={otFilter === level ? 'default' : 'outline'}
                  onClick={() => setOtFilter(level as OTRelevance | 'all')}
                  className="h-7 text-xs"
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-400">Stage:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={stageFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStageFilter('all')}
                className="h-7 text-xs"
              >
                All
              </Button>
              {Object.entries(STAGE_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={stageFilter === key ? 'default' : 'outline'}
                  onClick={() => setStageFilter(key as ProcurementStage)}
                  className="h-7 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Opportunities List */}
          <div className="col-span-2">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="mb-4 bg-[#12121a]">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-3">
                {loading ? (
                  <div className="text-center py-10 text-gray-400">Loading opportunities...</div>
                ) : (
                  filteredOpportunities.map(opp => (
                    <Card
                      key={opp.id}
                      className={`bg-[#12121a] border-gray-800 cursor-pointer transition-all hover:border-gray-600 ${
                        selectedOpp?.id === opp.id ? 'border-cyan-500' : ''
                      }`}
                      onClick={() => setSelectedOpp(opp)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{opp.title}</h3>
                            <p className="text-sm text-gray-400">{opp.entity}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">
                              {formatCurrency(opp.estimatedValue)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {opp.location}, {opp.state}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge className={OT_RELEVANCE_COLORS[opp.otRelevance]}>
                            OT: {opp.otRelevance.toUpperCase()}
                          </Badge>
                          <Badge className={SECTOR_COLORS[opp.sector]}>
                            {SECTOR_LABELS[opp.sector]}
                          </Badge>
                          <Badge className={STAGE_COLORS[opp.procurementStage]}>
                            {STAGE_LABELS[opp.procurementStage]}
                          </Badge>
                          {opp.policyAlignment.slice(0, 2).map(policy => (
                            <Badge key={policy} variant="outline" className="border-gray-600 text-gray-400">
                              {policy}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="timeline">
                <div className="space-y-4">
                  {['This Week', 'This Month', 'This Quarter'].map(period => (
                    <div key={period}>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">{period}</h3>
                      <div className="space-y-2">
                        {filteredOpportunities
                          .filter(opp => opp.responseDeadline)
                          .slice(0, 3)
                          .map(opp => (
                            <Card key={opp.id} className="bg-[#12121a] border-gray-800">
                              <CardContent className="py-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-white">{opp.title}</p>
                                    <p className="text-sm text-gray-400">
                                      Deadline: {opp.responseDeadline ? formatDate(opp.responseDeadline) : 'TBD'}
                                    </p>
                                  </div>
                                  <Badge className={OT_RELEVANCE_COLORS[opp.otRelevance]}>
                                    {opp.otRelevance.toUpperCase()}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Opportunity Detail */}
            {selectedOpp && (
              <Card className="bg-[#12121a] border-cyan-500/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">{selectedOpp.title}</CardTitle>
                  <CardDescription>{selectedOpp.entity}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-300">{selectedOpp.description}</p>

                  <Separator className="bg-gray-800" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Value</p>
                      <p className="font-semibold text-cyan-400">
                        {formatCurrency(selectedOpp.estimatedValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Location</p>
                      <p className="font-semibold text-white">
                        {selectedOpp.location}, {selectedOpp.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stage</p>
                      <p className="font-semibold text-white">
                        {STAGE_LABELS[selectedOpp.procurementStage]}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Posted</p>
                      <p className="font-semibold text-white">
                        {formatDate(selectedOpp.postedDate)}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  <div>
                    <p className="text-gray-400 text-sm mb-2">OT Cyber Relevance</p>
                    <Badge className={`${OT_RELEVANCE_COLORS[selectedOpp.otRelevance]} mb-2`}>
                      {selectedOpp.otRelevance.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-300">{selectedOpp.otRelevanceReason}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Policy Alignment</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedOpp.policyAlignment.map(policy => (
                        <Badge key={policy} variant="outline" className="border-gray-600 text-gray-300">
                          {policy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => window.open(selectedOpp.sourceUrl, '_blank')}
                  >
                    View Source
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Signals Feed */}
            <Card className="bg-[#12121a] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {signals.slice(0, 5).map(signal => (
                  <div
                    key={signal.id}
                    className="p-3 bg-[#0a0a0f] rounded-lg border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-white">{signal.title}</p>
                      <Badge
                        variant="outline"
                        className={
                          signal.signalType === 'funding'
                            ? 'border-green-500 text-green-400'
                            : signal.signalType === 'policy'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-gray-500 text-gray-400'
                        }
                      >
                        {signal.signalType}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{signal.source} • {formatDate(signal.publishedAt)}</p>
                    <p className="text-xs text-gray-300 line-clamp-2">{signal.summary}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
