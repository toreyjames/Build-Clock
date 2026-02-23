'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const COUNTRY_FLAGS: Record<string, string> = {
  'China': '🇨🇳',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Russia': '🇷🇺',
  'Taiwan': '🇹🇼',
  'South Korea': '🇰🇷',
  'Israel': '🇮🇱',
  'Estonia': '🇪🇪',
  'UK': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Nordic countries': '🇸🇪',
  'Japan': '🇯🇵',
  'India': '🇮🇳',
  'Singapore': '🇸🇬',
};

interface Metric {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetYear: number;
  source: string;
}

interface ReferencePoint {
  country: string;
  metric: string;
  value: string;
  insight: string;
}

interface StrategicGoal {
  id: string;
  domain: string;
  title: string;
  description: string;
  whyItMatters: string;
  metrics: Metric[];
  winCondition: string;
  currentState: string;
  gapToTarget: string;
  requiredActions: string[];
  estimatedInvestment: string;
  referencePoints: ReferencePoint[];
  dependsOn: string[];
  enables: string[];
}

interface DomainSummary {
  domain: string;
  label: string;
  icon: string;
  coreQuestion: string;
  winStatement: string;
  goalCount: number;
  onTrack: number;
  atRisk: number;
  blocked: number;
}

interface WinningDefined {
  headline: string;
  summary: string;
  pillars: { title: string; description: string; metric: string }[];
  notAboutChina: string;
  theRealCompetition: string;
}

interface Status {
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsBlocked: number;
  totalInvestment: string;
  criticalBlockers: string[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [winning, setWinning] = useState<WinningDefined | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/goals?domain=${selectedDomain}`);
        const data = await res.json();
        setGoals(data.goals);
        setDomains(data.domains);
        setWinning(data.winning);
        setStatus(data.status);
        if (data.goals.length > 0) {
          setSelectedGoal(data.goals[0]);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedDomain]);

  if (loading || !winning || !status) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading strategic goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">US Strategic Goals</h1>
                <p className="text-sm text-gray-400">What winning looks like. Our goals, our reasons.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/quantified">
                <Button variant="outline" className="border-gray-700">Quantified Gaps</Button>
              </Link>
              <Link href="/radar">
                <Button variant="outline" className="border-gray-700">Opportunities</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* What is Winning */}
        <div className="mb-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-2">{winning.headline}</h2>
          <p className="text-lg text-gray-300 mb-6">{winning.summary}</p>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {winning.pillars.map((pillar, idx) => (
              <div key={idx} className="bg-[#0a0a0f] rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white mb-2">{pillar.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{pillar.description}</p>
                <div className="text-sm text-cyan-400 font-medium">{pillar.metric}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-400 mb-2">This is NOT about China</h4>
              <p className="text-sm text-gray-300">{winning.notAboutChina}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">The Real Competition</h4>
              <p className="text-sm text-gray-300">{winning.theRealCompetition}</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-green-400">{status.goalsOnTrack}</div>
            <div className="text-sm text-green-300">On Track</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-yellow-400">{status.goalsAtRisk}</div>
            <div className="text-sm text-yellow-300">At Risk</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
            <div className="text-4xl font-bold text-red-400">{status.goalsBlocked}</div>
            <div className="text-sm text-red-300">Blocked</div>
          </div>
          <div className="col-span-2 bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
            <div className="text-2xl font-bold text-purple-400 mb-2">{status.totalInvestment}</div>
            <div className="text-sm text-purple-300">Total Investment Required</div>
            <div className="mt-3 text-xs text-gray-400">
              <strong>Critical Blockers:</strong> {status.criticalBlockers.slice(0, 2).join(' • ')}
            </div>
          </div>
        </div>

        {/* Domain Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          <Button
            variant={selectedDomain === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDomain('all')}
            className={selectedDomain === 'all' ? '' : 'border-gray-700'}
          >
            All Domains
          </Button>
          {domains.map(domain => (
            <Button
              key={domain.domain}
              variant={selectedDomain === domain.domain ? 'default' : 'outline'}
              onClick={() => setSelectedDomain(domain.domain)}
              className={selectedDomain === domain.domain ? '' : 'border-gray-700'}
            >
              {domain.icon} {domain.label}
              <Badge className="ml-2 bg-gray-700">{domain.goalCount}</Badge>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Goals List */}
          <div className="col-span-4">
            <div className="bg-[#12121a] rounded-xl border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-semibold text-white">Strategic Goals ({goals.length})</h2>
              </div>

              <div className="divide-y divide-gray-800 max-h-[calc(100vh-500px)] overflow-y-auto">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal)}
                    className={`w-full p-4 text-left transition-all hover:bg-gray-800/50 ${
                      selectedGoal?.id === goal.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {domains.find(d => d.domain === goal.domain)?.icon}
                      </span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {goal.domain}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-white">{goal.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{goal.winCondition}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Detail */}
          <div className="col-span-8">
            {selectedGoal ? (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 max-h-[calc(100vh-350px)] overflow-y-auto">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-b border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{domains.find(d => d.domain === selectedGoal.domain)?.icon}</span>
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      {selectedGoal.domain.toUpperCase()}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedGoal.title}</h1>
                  <p className="text-gray-300">{selectedGoal.description}</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Why It Matters */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">WHY THIS MATTERS FOR AMERICANS</h3>
                    <p className="text-gray-200">{selectedGoal.whyItMatters}</p>
                  </div>

                  {/* Win Condition */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-400 mb-2">✓ WHAT WINNING LOOKS LIKE</h3>
                    <p className="text-green-200 text-lg">{selectedGoal.winCondition}</p>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Metrics */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-4">PROGRESS METRICS</h3>
                    <div className="space-y-4">
                      {selectedGoal.metrics.map((metric, idx) => {
                        const pct = (metric.currentValue / metric.targetValue) * 100;
                        return (
                          <div key={idx} className="bg-[#0a0a0f] rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-sm text-white font-medium">{metric.name}</div>
                                <div className="text-xs text-gray-500">Target: {metric.targetYear} • Source: {metric.source}</div>
                              </div>
                              <div className="text-right">
                                <span className="text-cyan-400 font-bold">{metric.currentValue}</span>
                                <span className="text-gray-500"> / {metric.targetValue}</span>
                                <span className="text-gray-400 text-sm ml-1">{metric.unit}</span>
                              </div>
                            </div>
                            <Progress value={Math.min(pct, 100)} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1 text-right">{pct.toFixed(0)}% of target</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Current State & Gap */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-yellow-400 mb-2">CURRENT STATE</h3>
                      <p className="text-sm text-gray-300">{selectedGoal.currentState}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-orange-400 mb-2">GAP TO TARGET</h3>
                      <p className="text-sm text-gray-300">{selectedGoal.gapToTarget}</p>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Required Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-400">REQUIRED ACTIONS</h3>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {selectedGoal.estimatedInvestment}
                      </Badge>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedGoal.requiredActions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-200">
                            <span className="text-cyan-400 mt-1">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  {/* Reference Points */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">REFERENCE POINTS (for scale, not as goals)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedGoal.referencePoints.map((ref, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{COUNTRY_FLAGS[ref.country] || '🌍'}</span>
                            <span className="text-sm font-medium text-white">{ref.country}</span>
                          </div>
                          <div className="text-sm text-gray-400">{ref.metric}: <span className="text-cyan-400">{ref.value}</span></div>
                          <div className="text-xs text-gray-500 mt-1">{ref.insight}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dependencies */}
                  {(selectedGoal.dependsOn.length > 0 || selectedGoal.enables.length > 0) && (
                    <>
                      <Separator className="bg-gray-800" />
                      <div className="grid grid-cols-2 gap-4">
                        {selectedGoal.dependsOn.length > 0 && (
                          <div>
                            <h4 className="text-xs text-gray-500 mb-2">DEPENDS ON</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedGoal.dependsOn.map(dep => (
                                <Badge key={dep} variant="outline" className="border-orange-500/50 text-orange-400">
                                  {dep.replace(/-/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedGoal.enables.length > 0 && (
                          <div>
                            <h4 className="text-xs text-gray-500 mb-2">ENABLES</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedGoal.enables.map(en => (
                                <Badge key={en} variant="outline" className="border-green-500/50 text-green-400">
                                  {en.replace(/-/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#12121a] rounded-xl border border-gray-800 p-12 text-center">
                <p className="text-gray-400">Select a goal to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
