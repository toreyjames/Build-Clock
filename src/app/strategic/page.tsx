'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface StrategicGap {
  id: string;
  domain: string;
  title: string;
  subtitle: string;
  usCurrentState: string;
  usMetric: string;
  chinaCurrentState: string;
  chinaMetric: string;
  gapDescription: string;
  gapSeverity: 'critical' | 'severe' | 'moderate' | 'competitive';
  timeToClose: string;
  usTargets: {
    target: string;
    source: string;
    deadline: string;
    progress: number;
  }[];
  currentInitiatives: {
    name: string;
    type: string;
    investment: string;
    status: string;
  }[];
  unaddressedNeeds: string[];
  chinaTrend: string;
  chinaProjection: string;
  implications: string;
  sources: { title: string; url: string; date: string }[];
}

interface DomainSummary {
  domain: string;
  label: string;
  icon: string;
  usScore: number;
  chinaScore: number;
  overallGap: string;
  criticalPath: string;
}

interface Position {
  usAverage: number;
  chinaAverage: number;
  gap: number;
  criticalGaps: DomainSummary[];
  competitiveAreas: DomainSummary[];
}

const SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
  severe: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  competitive: 'bg-green-500/20 text-green-400 border-green-500/50'
};

const GAP_STATUS_STYLES = {
  losing: 'text-red-400',
  behind: 'text-orange-400',
  competitive: 'text-yellow-400',
  leading: 'text-green-400'
};

export default function StrategicPage() {
  const [gaps, setGaps] = useState<StrategicGap[]>([]);
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedGap, setSelectedGap] = useState<StrategicGap | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/strategic-gaps?domain=${selectedDomain}`);
        const data = await res.json();
        setGaps(data.gaps);
        setDomains(data.domains);
        setPosition(data.position);
        if (data.gaps.length > 0) {
          setSelectedGap(data.gaps[0]);
        }
      } catch (error) {
        console.error('Error fetching strategic gaps:', error);
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedDomain]);

  const criticalCount = gaps.filter(g => g.gapSeverity === 'critical').length;
  const severeCount = gaps.filter(g => g.gapSeverity === 'severe').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Strategic Gap Analysis</h1>
                <p className="text-sm text-gray-400">US vs China: AI Infrastructure Competition</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/quantified">
                <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  📊 Quantified Analysis
                </Button>
              </Link>
              <Link href="/radar">
                <Button variant="outline" className="border-gray-700">
                  ← Back to Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Overall Position */}
        {position && (
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Competitive Position Overview</h2>
                <p className="text-sm text-gray-400">Aggregate assessment across all AI infrastructure domains</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400">{position.usAverage}</div>
                  <div className="text-sm text-gray-400">US Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-400">{position.chinaAverage}</div>
                  <div className="text-sm text-gray-400">China Score</div>
                </div>
                <div className="text-center px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-3xl font-bold text-red-400">-{position.gap}</div>
                  <div className="text-sm text-red-300">Gap to Close</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-3">CRITICAL GAPS (US LOSING)</h3>
                <div className="space-y-2">
                  {position.criticalGaps.map(d => (
                    <div key={d.domain} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{d.icon}</span>
                        <span className="text-white font-medium">{d.label}</span>
                      </div>
                      <div className="text-sm text-red-300">US {d.usScore} vs China {d.chinaScore}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-400 mb-3">COMPETITIVE ADVANTAGES</h3>
                <div className="space-y-2">
                  {position.competitiveAreas.map(d => (
                    <div key={d.domain} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{d.icon}</span>
                        <span className="text-white font-medium">{d.label}</span>
                      </div>
                      <div className="text-sm text-green-300">US {d.usScore} vs China {d.chinaScore}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Domain Scorecard */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3">DOMAIN SCORECARDS</h2>
          <div className="grid grid-cols-6 gap-3">
            {domains.map(domain => (
              <button
                key={domain.domain}
                onClick={() => setSelectedDomain(selectedDomain === domain.domain ? 'all' : domain.domain)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedDomain === domain.domain
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-[#12121a] border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{domain.icon}</span>
                  <span className="font-medium text-white text-sm">{domain.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">US</span>
                    <span className="text-gray-400">{domain.usScore}</span>
                  </div>
                  <Progress value={domain.usScore} className="h-1.5 bg-gray-800" />
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">China</span>
                    <span className="text-gray-400">{domain.chinaScore}</span>
                  </div>
                  <Progress value={domain.chinaScore} className="h-1.5 bg-gray-800 [&>div]:bg-red-500" />
                </div>
                <div className={`mt-2 text-xs font-medium ${GAP_STATUS_STYLES[domain.overallGap as keyof typeof GAP_STATUS_STYLES]}`}>
                  {domain.overallGap.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-[#12121a] rounded-lg border border-gray-800">
          <span className="text-sm text-gray-400">Gap Analysis:</span>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{criticalCount} Critical</Badge>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{severeCount} Severe</Badge>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">
            {selectedDomain === 'all' ? 'All Domains' : domains.find(d => d.domain === selectedDomain)?.label}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Gaps List */}
          <div className="col-span-4">
            <div className="bg-[#12121a] rounded-xl border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Strategic Gaps ({gaps.length})</h2>
              </div>

              <div className="divide-y divide-gray-800 max-h-[calc(100vh-450px)] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : gaps.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No gaps in this domain</div>
                ) : (
                  gaps.map(gap => (
                    <button
                      key={gap.id}
                      onClick={() => setSelectedGap(gap)}
                      className={`w-full p-4 text-left transition-all hover:bg-gray-800/50 ${
                        selectedGap?.id === gap.id ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={SEVERITY_STYLES[gap.gapSeverity]} variant="outline">
                              {gap.gapSeverity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">{gap.timeToClose}</span>
                          </div>
                          <h3 className="font-medium text-white leading-tight">{gap.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{gap.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="col-span-8">
            {selectedGap ? (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl border-b border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={SEVERITY_STYLES[selectedGap.gapSeverity]} variant="outline">
                          {selectedGap.gapSeverity.toUpperCase()} GAP
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-400">
                          {selectedGap.timeToClose} to close
                        </Badge>
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-1">{selectedGap.title}</h1>
                      <p className="text-gray-400">{selectedGap.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* US vs China Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-400 mb-2">🇺🇸 US CURRENT STATE</h3>
                      <p className="text-sm text-gray-300 mb-3">{selectedGap.usCurrentState}</p>
                      <div className="px-3 py-2 bg-blue-500/20 rounded text-sm text-blue-300 font-mono">
                        {selectedGap.usMetric}
                      </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-red-400 mb-2">🇨🇳 CHINA CURRENT STATE</h3>
                      <p className="text-sm text-gray-300 mb-3">{selectedGap.chinaCurrentState}</p>
                      <div className="px-3 py-2 bg-red-500/20 rounded text-sm text-red-300 font-mono">
                        {selectedGap.chinaMetric}
                      </div>
                    </div>
                  </div>

                  {/* Gap Description */}
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-orange-400 mb-2">THE GAP</h3>
                    <p className="text-gray-200">{selectedGap.gapDescription}</p>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* US Targets */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">US GOVERNMENT TARGETS</h3>
                    <div className="space-y-3">
                      {selectedGap.usTargets.map((target, idx) => (
                        <div key={idx} className="bg-[#0a0a0f] rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">{target.target}</p>
                              <p className="text-xs text-gray-500">{target.source} • Deadline: {target.deadline}</p>
                            </div>
                            <span className="text-sm font-medium text-cyan-400">{target.progress}%</span>
                          </div>
                          <Progress value={target.progress} className="h-2 bg-gray-800" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Current Initiatives */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">CURRENT INITIATIVES</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedGap.currentInitiatives.map((init, idx) => (
                        <div key={idx} className="bg-[#0a0a0f] rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm text-white font-medium">{init.name}</span>
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {init.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-cyan-400 mb-1">{init.investment}</p>
                          <p className="text-xs text-gray-500">{init.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Unaddressed Needs - The real opportunity */}
                  <div>
                    <h3 className="text-sm font-medium text-red-400 mb-3">⚠️ UNADDRESSED NEEDS</h3>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedGap.unaddressedNeeds.map((need, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-200">
                            <span className="text-red-400 mt-1">•</span>
                            {need}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* China Trajectory */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-400">CHINA TRAJECTORY</h3>
                      <Badge variant="outline" className={
                        selectedGap.chinaTrend === 'accelerating' ? 'border-red-500 text-red-400' :
                        selectedGap.chinaTrend === 'steady' ? 'border-yellow-500 text-yellow-400' :
                        'border-green-500 text-green-400'
                      }>
                        {selectedGap.chinaTrend.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">{selectedGap.chinaProjection}</p>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Strategic Implications */}
                  <div>
                    <h3 className="text-sm font-medium text-yellow-400 mb-3">STRATEGIC IMPLICATIONS</h3>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-200">{selectedGap.implications}</p>
                    </div>
                  </div>

                  {/* Sources */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">SOURCES</h3>
                    <div className="space-y-2">
                      {selectedGap.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="text-sm text-cyan-400">{source.title}</span>
                          <span className="text-xs text-gray-500">{source.date}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-12 text-center">
                <p className="text-gray-400">Select a gap to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
