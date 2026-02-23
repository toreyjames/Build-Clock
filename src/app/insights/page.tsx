'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Insight {
  id: string;
  date: string;
  title: string;
  category: 'market-gap' | 'deloitte-position' | 'opportunity' | 'risk';
  summary: string;
  analysis: string[];
  implications: string[];
  sources?: { title: string; url: string }[];
  relatedPillars: string[];
}

const INSIGHTS: Insight[] = [
  {
    id: 'stargate-stall',
    date: '2026-02-22',
    title: 'Stargate Project Stalls: $500B AI Infrastructure Promise Unraveling',
    category: 'risk',
    summary: 'The much-hyped Stargate AI infrastructure project - announced with Trump in Jan 2025 as a $500B initiative - has failed to complete a single data center deal. Partner conflicts, funding questions, and execution failures signal this may never materialize at scale.',
    analysis: [
      'Stargate announced Jan 2025: SoftBank, OpenAI, Oracle, MGX - promised $500B AI infrastructure',
      'Aug 2025: SoftBank CEO Son admitted project "behind schedule" to investors',
      'No data center deals completed 6+ months after announcement',
      'Oracle CEO Ellison: "Stargate is not formed yet" - no actual joint venture exists',
      'SoftBank halted acquisition talks with Switch (data center company) Jan 2026',
      'Partner clashes: SoftBank wants control, OpenAI wants speed, Oracle sidelined',
      'Funding structure unclear - SoftBank promised $19B but hasn\'t deployed',
      'WSJ investigation revealed "failed to complete a single data center deal"',
      'Meanwhile: Microsoft, Amazon, Google actually building - $200B+ committed and executing',
    ],
    implications: [
      'Don\'t chase Stargate-related work - vaporware risk is high',
      'Hyperscalers (MSFT, AMZN, GOOG) are the real buildout - focus there',
      'Validates thesis: Execution > Announcements in AI infrastructure',
      'Watch for Stargate partners doing deals separately (SoftBank, Oracle pivoting)',
      'OpenAI may need to find new infrastructure partners - potential opportunity',
      'Trump administration credibility on AI infrastructure somewhat damaged',
      'This is why we track actual permits, PPAs, interconnection requests - not press releases',
      'Risk: If Stargate narrative collapses publicly, could cool AI infrastructure hype broadly',
    ],
    sources: [
      { title: 'Bloomberg: Stargate Behind Schedule', url: 'https://www.bloomberg.com/news/articles/2025-08-05/softbank-ceo-son-says-stargate-ai-project-running-behind-schedule' },
      { title: 'WSJ: Stargate Failed to Complete Single Deal', url: 'https://www.wsj.com/tech/ai/stargate-trump-openai-project-struggles-60cb4c82' },
    ],
    relatedPillars: ['ai-compute', 'power'],
  },
  {
    id: 'post-industrial-grid',
    date: '2026-02-21',
    title: 'The Grid Was Built for a World That No Longer Exists',
    category: 'market-gap',
    summary: 'The US grid was architected for post-industrial America: centralized generation, one-way power flow, predictable demand. Every assumption is now wrong.',
    analysis: [
      'Grid designed 1950s-1980s for large central plants pushing power outward to passive consumers',
      'Assumed: predictable, slowly-growing demand following population/GDP',
      'Assumed: generation located near load centers or connected via planned transmission',
      'Assumed: one-way power flow from generator to consumer',
      'Reality now: distributed generation (rooftop solar) pushing power backward',
      'Reality now: EVs adding massive mobile loads in unpredictable patterns',
      'Reality now: data centers demanding 500MW+ in single locations with 99.9999% uptime',
      'Reality now: renewables generating where sun/wind exist, not where load exists',
      'The architecture itself is the constraint - not lack of generation or investment',
    ],
    implications: [
      'Incremental fixes won\'t work - the architecture needs rethinking',
      'This is why interconnection queues are 5+ years - system can\'t absorb what\'s coming',
      'Grid was designed for predictability; now must handle variability and bidirectionality',
      'AI/software is the only way to make 1970s hardware handle 2030s demands',
      'OT Cyber becomes critical as grid edge multiplies attack surface',
      'Biggest opportunity: companies that can bridge the old architecture to new demands',
    ],
    sources: [
      { title: 'DOE Grid Modernization Initiative', url: 'https://www.energy.gov/gmi/grid-modernization-initiative' },
    ],
    relatedPillars: ['power', 'ai-compute', 'energy-systems'],
  },
  {
    id: 'thirty-x',
    date: '2026-02-21',
    title: '30x in 10 Years: The Math Nobody\'s Ready For',
    category: 'risk',
    summary: 'Deloitte projects AI data center power demand could surge 30x by 2035. No infrastructure sector has ever scaled this fast. The grid math doesn\'t work.',
    analysis: [
      'Current AI data center power: ~4 GW (2025)',
      'Projected AI data center power: ~120 GW by 2035 (Deloitte)',
      'That\'s 30x growth in <10 years - about 40% annual growth rate',
      'For comparison: Total US generation capacity is ~1,300 GW',
      'AI alone would consume ~10% of total US grid capacity by 2035',
      'Current interconnection queue: 5+ years to connect new generation',
      'So generation approved TODAY might not be online until 2031',
      'We\'re already behind on a curve that compounds 40% annually',
      'No infrastructure sector in history has scaled 30x in a decade',
    ],
    implications: [
      'The gap between demand growth and infrastructure buildout will widen, not narrow',
      'Hyperscalers will increasingly go off-grid (behind-the-meter generation)',
      'Expect price spikes and reliability issues in data center corridors',
      'Nuclear restarts and SMRs aren\'t fast enough - permitting is 7+ years',
      'Only AI-driven grid optimization can bridge the gap at the required pace',
      'This is why Microsoft, Amazon, Google are all pursuing nuclear PPAs',
      'OT cyber for grid + data centers becomes critical infrastructure protection',
    ],
    sources: [
      { title: 'Deloitte: AI Data Center Power Demand Could Surge 30x by 2035', url: 'https://www.prnewswire.com/news-releases/deloitte-ai-data-center-power-demand-could-surge-30x-by-2035-amid-power-and-grid-capacity-constraints-302488877.html' },
    ],
    relatedPillars: ['power', 'ai-compute', 'cooling'],
  },
  {
    id: 'ferc-interconnection-opportunity',
    date: '2026-02-21',
    title: 'FERC Interconnection Reform: Where Deloitte Should Be',
    category: 'opportunity',
    summary: 'Trump administration is forcing FERC to accelerate large load interconnection. New rules, state vs federal jurisdiction battles, and 100% participant funding model = massive consulting opportunity.',
    analysis: [
      'DOE Secretary Wright directed FERC to accelerate data center interconnection (Oct 2025)',
      'Final rule expected April 2026 - creates immediate need for guidance',
      'New co-located load + generation requests allowed - novel territory',
      '100% participant funding: data centers pay full grid upgrade costs (not socialized)',
      'State regulators pushing back on federal jurisdiction - legal gray zone',
      'FERC historically hasn\'t regulated load interconnections - new rules being written',
      'PJM ordered to report on reliability + expediting by Jan 2026',
      'Every hyperscaler and utility needs help navigating this transition',
    ],
    implications: [
      'Regulatory advisory: Help clients understand new FERC rules as they develop',
      'Cost modeling: 100% participant funding means data centers need grid upgrade cost analysis',
      'Co-location strategy: Joint generation + load applications are new - first movers need guidance',
      'State vs federal navigation: Dual jurisdiction requires coordinated regulatory strategy',
      'Queue positioning: Help clients optimize interconnection requests under new rules',
      'OT Cyber angle: New interconnection arrangements need security architecture from day one',
      'This is textbook Deloitte GPS + Commercial collaboration opportunity',
    ],
    sources: [
      { title: 'DOE Directs FERC to Accelerate Large Load Interconnection', url: 'https://www.energy.gov/articles/secretary-wright-acts-unleash-american-industry-and-innovation-newly-proposed-rules' },
      { title: 'FERC 2026 Outlook: Data Centers & Transmission', url: 'https://www.utilitydive.com/news/ferc-2026-agenda-outlook-data-centers-transmission/810596/' },
      { title: 'State Regulators Press FERC on Authority', url: 'https://www.eenews.net/articles/regulators-press-ferc-on-state-authority-as-trump-promotes-data-centers/' },
    ],
    relatedPillars: ['power', 'ai-compute'],
  },
  {
    id: 'grid-vs-energy',
    date: '2026-02-21',
    title: 'Grid is the Binding Constraint (Generation Will Follow)',
    category: 'market-gap',
    summary: 'AI data centers will eventually stress generation capacity too - but the grid is the binding constraint today. You can\'t use power you can\'t deliver.',
    analysis: [
      'US has ~1,300 GW generation capacity vs ~750 GW peak demand - surplus exists TODAY',
      'But interconnection queue has 2,600 GW waiting (5x installed base)',
      'Average wait time for new generation to connect: 5+ years',
      '80% of projects in queue eventually withdraw due to delays/costs',
      'New transmission lines take 10+ years to permit across state lines',
      'AI data center demand could surge 30x by 2035 (Deloitte) - generation will become a problem',
      'But even with infinite generation, grid can\'t move it to where it\'s needed',
      'Sequence matters: Grid first, then generation - not the other way around',
    ],
    implications: [
      'Short-term (now-2028): Grid/transmission is the blocker - generation exists',
      'Medium-term (2028-2032): Both grid AND generation become constraints',
      'Long-term (2032+): Generation may become primary if grid is solved',
      'Hyperscalers signing PPAs with nuclear/solar - but plants wait years for grid connection',
      'Dynamic Line Rating could unlock 20-40% more capacity from existing lines',
      'AI for interconnection study automation could cut 5-year waits to months',
      'Smart money is solving grid now, generation later',
    ],
    sources: [
      { title: 'FERC Interconnection Queue Data', url: 'https://www.ferc.gov/' },
      { title: 'DOE National Transmission Needs Study', url: 'https://www.energy.gov/gdo/national-transmission-needs-study' },
    ],
    relatedPillars: ['power', 'ai-compute'],
  },
  {
    id: 'deloitte-grid-gap',
    date: '2026-02-21',
    title: 'Deloitte Grid Practice: Distribution Focus vs Transmission Reality',
    category: 'deloitte-position',
    summary: 'Current Deloitte grid AI work (Utilidata partnership) focuses on distribution/last-mile. But the actual bottleneck is transmission/interconnection - an unaddressed opportunity.',
    analysis: [
      'Deloitte + Utilidata + NVIDIA: AI chips in smart meters at distribution edge',
      'Focus areas: predictive maintenance, load forecasting, DER management',
      'This optimizes the "last mile" - distribution to homes/businesses',
      'But the bottleneck is the "highway" - transmission between regions',
      'And the "on-ramp" - interconnection queue for new generation',
      'Smart meters don\'t help when 2,600 GW can\'t connect to grid',
    ],
    implications: [
      'Differentiation opportunity: move upstream to transmission/interconnection',
      'AI for FERC interconnection studies - automate what takes 3+ years',
      'Transmission-level Dynamic Line Rating (not just distribution)',
      'Regional grid planning AI - optimize where to build new transmission',
      'OT Cyber is prerequisite for any grid AI deployment',
    ],
    sources: [
      { title: 'Deloitte-Utilidata Partnership', url: 'https://www2.deloitte.com/us/en/pages/about-deloitte/articles/press-releases/deloitte-and-utilidata-collaboration-revolutionizes-us-power-grid.html' },
      { title: 'Deloitte 2026 P&U Outlook', url: 'https://www.deloitte.com/us/en/insights/industry/power-and-utilities/power-and-utilities-industry-outlook.html' },
    ],
    relatedPillars: ['power', 'ai-compute', 'energy-systems'],
  },
  {
    id: 'ai-grid-opportunities',
    date: '2026-02-21',
    title: 'AI for Grid: Unaddressed Opportunities',
    category: 'opportunity',
    summary: 'The highest-impact AI applications for grid constraints are not being pursued by major players. These represent greenfield opportunities.',
    analysis: [
      'Dynamic Line Rating on transmission: 20-40% capacity gain, equivalent to $100B in new lines',
      'Interconnection study automation: FERC studies in weeks vs years',
      'Topology optimization: real-time power flow reconfiguration',
      'Permitting AI: NLP for environmental reviews, route optimization',
      'Grid digital twins: 10,000 scenarios vs 10 for transmission planning',
    ],
    implications: [
      'First mover advantage available - no dominant player in transmission AI',
      'Utilities desperate for solutions - willing to pilot',
      'FERC Order 2023 pushing for faster interconnection - regulatory tailwind',
      'OT Cyber required for any deployment - Genesis entry point',
      'Could position as "Transmission AI" practice vs Deloitte\'s "Distribution AI"',
    ],
    sources: [
      { title: 'FERC Order 2023', url: 'https://www.ferc.gov/media/e-1-order-2023' },
    ],
    relatedPillars: ['power', 'ai-compute', 'energy-systems'],
  },
  {
    id: 'regulatory-wave-2026',
    date: '2026-02-21',
    title: 'The 2026 Regulatory Wave: Five Rules Being Written Now',
    category: 'opportunity',
    summary: 'Trump administration is rewriting energy/infrastructure rules at unprecedented pace. Five major regulatory transitions are happening simultaneously - each is a market-making advisory opportunity.',
    analysis: [
      'FERC Large Load Interconnection (April 2026): New rules for data center grid connections, 100% participant funding',
      'NERC CIP-015 INSM (June 2026 expansion): Mandatory internal network monitoring, Volt Typhoon response',
      'NRC Licensing Reform (Feb/Nov 2026): 18-month max licensing, NRC reorganizing around speed',
      'Data Center Permitting EO (ongoing): Federal land access, streamlined NEPA for AI facilities',
      'NERC CIP Virtualization (April 2026): First cloud/virtual OT allowed in bulk electric system',
      'All five are "rules being written now" - first movers shape implementation',
      'Combined advisory TAM: $250M+ across utilities, developers, hyperscalers, agencies',
    ],
    implications: [
      'This is a once-in-a-decade regulatory reset - Trump admin moving fast',
      'Advisory opportunity on BOTH sides: help agencies implement, help industry comply',
      'GPS + Commercial + ER&I collaboration - same playbook serves all clients',
      'OT Cyber is embedded in every one of these - security is the common thread',
      'Build methodology/playbooks NOW - whoever writes them owns the market',
      'Competitors are slow - regulatory advisory isn\'t their core business',
      'Position as "regulatory transition" practice, not just compliance',
    ],
    sources: [
      { title: 'DOE Direction to FERC', url: 'https://www.energy.gov/articles/secretary-wright-acts-unleash-american-industry-and-innovation-newly-proposed-rules' },
      { title: 'NERC CIP-015 Approval', url: 'https://www.federalregister.gov/documents/2025/07/02/2025-12309/critical-infrastructure-protection-reliability-standard-cip-015-1-cyber-security-internal-network' },
      { title: 'NRC Reorganization', url: 'https://www.powermag.com/nrc-launches-major-reorganization-as-licensing-deadlines-and-reform-workload-intensify/' },
    ],
    relatedPillars: ['power', 'ai-compute', 'energy-systems'],
  },
  {
    id: 'residential-affordability',
    date: '2026-02-21',
    title: 'The Other Side: Residential Energy Prices Must Come Down',
    category: 'risk',
    summary: 'All this AI/grid/nuclear buildout is happening while residential energy prices are rising. If regular people see bills spike to power data centers, there will be political backlash that stops everything.',
    analysis: [
      'Residential electricity prices up 20%+ since 2020 in many markets',
      'AI data centers adding massive new load - someone pays for grid upgrades',
      '100% participant funding helps (data centers pay their share) but not enough',
      'Transmission costs socialized across ratepayers in most regions',
      'Public perception: "My bill went up so ChatGPT can run"',
      'Political risk: Backlash could stall permitting, funding, regulatory reform',
      'This is why state regulators are pushing back on FERC jurisdiction',
    ],
    implications: [
      'Can\'t ignore residential affordability while chasing AI infrastructure',
      'Need parallel track: efficiency, demand response, distributed generation',
      'Rooftop solar + storage helps households hedge against grid prices',
      'Smart grid (the Deloitte/Utilidata work) actually helps here - efficiency',
      'Policy framing matters: "AI buildout lowers costs long-term" vs "AI raises your bill"',
      'Opportunity: Help utilities balance load growth with rate affordability',
      'Risk: If we only advise on buildout and ignore affordability, we\'re part of the problem',
    ],
    sources: [
      { title: 'EIA Residential Electricity Prices', url: 'https://www.eia.gov/electricity/monthly/' },
      { title: 'State Regulators Push Back on FERC', url: 'https://www.eenews.net/articles/regulators-press-ferc-on-state-authority-as-trump-promotes-data-centers/' },
    ],
    relatedPillars: ['power', 'energy-systems'],
  },
  {
    id: 'national-priority-stack',
    date: '2026-02-21',
    title: 'National Priority Stack: What Actually Matters',
    category: 'market-gap',
    summary: 'From a national infrastructure standpoint, the priority sequence is clear: Grid first, nuclear second, then supply chain, workforce, and cooling. Partners may chase shiny deals, but this is what the country needs.',
    analysis: [
      '1. GRID/TRANSMISSION - The binding constraint. Can\'t use power you can\'t deliver.',
      '2. SEMICONDUCTORS/MANUFACTURING - The foundation layer. Everything digital depends on chips. CHIPS Act is $52B+.',
      '3. NUCLEAR/BASELOAD - AI needs 24/7 power. Only scalable clean baseload. Depends on grid + components.',
      '4. WATER/COOLING - Hidden constraint. Data centers + nuclear both need cooling. Water stress in TX, AZ, NV.',
      '5. WORKFORCE - Average grid worker is 50+. Skills gap in lineworkers, nuclear engineers, OT cyber.',
      '6. RESIDENTIAL AFFORDABILITY - Can\'t let bills spike while building AI infrastructure. Political risk.',
      'Power is primary. Semiconductors is secondary. Then nuclear, water, workforce, affordability.',
      'This is the sequence that matters nationally - not the sequence that gets partner attention.',
    ],
    implications: [
      'Align practice investments to national priorities, not just deal flow',
      'Grid/transmission advisory should be biggest investment area',
      'Nuclear cyber/licensing is #2 priority',
      'Supply chain security (OT for manufacturing) is underweighted',
      'Workforce development could be a differentiator',
      'Residential affordability work keeps us relevant to utilities and regulators',
      'This framing helps in DC conversations - shows we see the whole picture',
    ],
    sources: [
      { title: 'DOE National Transmission Needs Study', url: 'https://www.energy.gov/gdo/national-transmission-needs-study' },
      { title: 'Deloitte 2026 P&U Outlook', url: 'https://www.deloitte.com/us/en/insights/industry/power-and-utilities/power-and-utilities-industry-outlook.html' },
    ],
    relatedPillars: ['power', 'ai-compute', 'energy-systems', 'manufacturing'],
  },
];

const CATEGORY_CONFIG = {
  'market-gap': { label: 'Market Gap', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'deloitte-position': { label: 'Deloitte Position', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'opportunity': { label: 'Opportunity', color: 'text-green-400', bg: 'bg-green-500/20' },
  'risk': { label: 'Risk', color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function InsightsPage() {
  const [selectedInsight, setSelectedInsight] = useState<Insight>(INSIGHTS[0]); // Post-industrial grid is first

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Genesis Insights</h1>
              <span className="text-xs text-gray-500">Strategic Analysis & Market Intelligence</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/radar" className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">
                Radar
              </Link>
              <Link href="/quantified" className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300">
                Roadmap
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Insight List */}
          <div className="col-span-4">
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="font-semibold text-white">Strategic Insights</h2>
                <p className="text-xs text-gray-500 mt-1">Analysis that informs positioning</p>
              </div>
              <div className="divide-y divide-gray-800">
                {INSIGHTS.map(insight => {
                  const config = CATEGORY_CONFIG[insight.category];
                  return (
                    <button
                      key={insight.id}
                      onClick={() => setSelectedInsight(insight)}
                      className={`w-full p-4 text-left hover:bg-gray-800/50 transition-colors ${
                        selectedInsight.id === insight.id ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-600">{insight.date}</span>
                      </div>
                      <div className="text-sm font-medium text-white">{insight.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{insight.summary}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Insight placeholder */}
            <button className="w-full mt-4 p-4 bg-[#12121a] rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors text-sm">
              + Add New Insight
            </button>
          </div>

          {/* Right: Insight Detail */}
          <div className="col-span-8">
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-sm px-3 py-1 rounded ${CATEGORY_CONFIG[selectedInsight.category].bg} ${CATEGORY_CONFIG[selectedInsight.category].color}`}>
                    {CATEGORY_CONFIG[selectedInsight.category].label}
                  </span>
                  <span className="text-sm text-gray-500">{selectedInsight.date}</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{selectedInsight.title}</h1>
                <p className="text-gray-400 mt-2">{selectedInsight.summary}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Analysis */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">ANALYSIS</h3>
                  <div className="bg-[#0a0a0f] rounded-lg p-4 space-y-2">
                    {selectedInsight.analysis.map((point, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-cyan-400 mt-0.5">-</span>
                        <span className="text-gray-300">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Implications */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">IMPLICATIONS FOR GENESIS</h3>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 space-y-2">
                    {selectedInsight.implications.map((point, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-cyan-400 mt-0.5">-&gt;</span>
                        <span className="text-cyan-100">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Pillars */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">RELATED PILLARS</h3>
                  <div className="flex gap-2">
                    {selectedInsight.relatedPillars.map(pillar => (
                      <span key={pillar} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300">
                        {pillar}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                {selectedInsight.sources && selectedInsight.sources.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">SOURCES</h3>
                    <div className="space-y-2">
                      {selectedInsight.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          <span>-&gt;</span>
                          <span>{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
