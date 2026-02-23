// US Strategic Goals Framework
// What does WINNING look like? Specific, measurable, ours.
// China is a reference point, not the goal.

export interface StrategicGoal {
  id: string;
  domain: 'energy' | 'compute' | 'manufacturing' | 'security' | 'workforce' | 'supply-chain';

  // The Goal
  title: string;
  description: string;
  whyItMatters: string;  // Why this matters for AMERICANS, not vs China

  // Specific Metrics
  metrics: {
    name: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    targetYear: number;
    source: string;
  }[];

  // What Winning Looks Like
  winCondition: string;

  // Current State
  currentState: string;
  gapToTarget: string;

  // What's Required
  requiredActions: string[];
  estimatedInvestment: string;

  // Reference Points (China and others for scale, not as the goal)
  referencePoints: {
    country: string;
    metric: string;
    value: string;
    insight: string;
  }[];

  // Dependencies
  dependsOn: string[];  // Other goal IDs this depends on
  enables: string[];    // What achieving this enables
}

export interface DomainSummary {
  domain: string;
  label: string;
  icon: string;
  coreQuestion: string;  // What are we trying to answer?
  winStatement: string;  // One sentence: what does winning look like?
  goalCount: number;
  onTrack: number;
  atRisk: number;
  blocked: number;
}

// ============================================
// US STRATEGIC GOALS - What We're Actually Trying to Achieve
// ============================================

export const US_STRATEGIC_GOALS: StrategicGoal[] = [
  // ============================================
  // ENERGY DOMAIN
  // ============================================
  {
    id: 'energy-independence',
    domain: 'energy',
    title: 'Energy Security & Independence',
    description: 'Ensure reliable, affordable, domestically-produced energy that cannot be disrupted by foreign actors or supply chain failures.',
    whyItMatters: 'The 1973 oil embargo, 2021 Texas freeze, and 2022 European gas crisis showed what happens when energy supply fails. American prosperity and security require energy we control.',

    metrics: [
      {
        name: 'Domestic baseload generation capacity',
        currentValue: 250,
        targetValue: 400,
        unit: 'GW',
        targetYear: 2035,
        source: 'DOE analysis'
      },
      {
        name: 'Grid reliability (outage hours/year)',
        currentValue: 8,
        targetValue: 2,
        unit: 'hours',
        targetYear: 2035,
        source: 'EIA'
      },
      {
        name: 'Energy import dependence',
        currentValue: 5,
        targetValue: 0,
        unit: '% net imports',
        targetYear: 2035,
        source: 'EIA'
      }
    ],

    winCondition: 'Zero unplanned outages affecting more than 100,000 customers. No single point of failure in generation or transmission. All critical facilities have 72-hour backup.',

    currentState: 'US is near energy independent for oil/gas but grid reliability declining. 70% of transmission infrastructure over 25 years old. Major outages increasing in frequency.',
    gapToTarget: 'Need 150 GW additional baseload capacity and comprehensive grid hardening.',

    requiredActions: [
      'Extend operating licenses for existing nuclear fleet',
      'Deploy 30+ GW of new nuclear (SMR and conventional)',
      'Add 47,000 miles of transmission capacity',
      'Harden grid against weather and cyber threats',
      'Establish strategic transformer reserve'
    ],
    estimatedInvestment: '$500B over 15 years',

    referencePoints: [
      {
        country: 'France',
        metric: 'Nuclear share of electricity',
        value: '70%',
        insight: 'Achieved energy independence through nuclear in 1970s-80s after oil crisis'
      },
      {
        country: 'China',
        metric: 'Annual grid investment',
        value: '$80B/year',
        insight: 'Shows scale of investment possible with political will'
      }
    ],

    dependsOn: [],
    enables: ['ai-compute-capacity', 'manufacturing-reshoring']
  },

  {
    id: 'clean-baseload',
    domain: 'energy',
    title: '100GW Clean Baseload for AI',
    description: 'Build sufficient 24/7 clean power generation specifically for AI data center growth, separate from residential/commercial grid needs.',
    whyItMatters: 'AI will define economic competitiveness for the next century. Current projections show 50-100GW of new power demand for AI by 2030. Without dedicated clean baseload, either AI growth stalls or emissions spike.',

    metrics: [
      {
        name: 'Dedicated AI-suitable baseload capacity',
        currentValue: 10,
        targetValue: 100,
        unit: 'GW',
        targetYear: 2035,
        source: 'Industry estimates'
      },
      {
        name: 'Clean share of AI power',
        currentValue: 40,
        targetValue: 90,
        unit: '%',
        targetYear: 2035,
        source: 'Hyperscaler commitments'
      },
      {
        name: 'Average PPA lead time for data centers',
        currentValue: 4,
        targetValue: 1,
        unit: 'years',
        targetYear: 2030,
        source: 'Industry'
      }
    ],

    winCondition: 'Any company can site a 500MW+ data center anywhere in the US and secure clean 24/7 power within 18 months.',

    currentState: 'Data centers competing for limited power in key markets (Virginia, Texas, Arizona). Interconnection queue is 2,600 GW backlog. Most "clean" power is intermittent, not baseload.',
    gapToTarget: 'Need 90 GW new clean baseload in 10 years. Current trajectory: ~10 GW.',

    requiredActions: [
      'Nuclear plant restarts (TMI, Palisades, others)',
      'Accelerate SMR deployment',
      'Enhanced geothermal at scale',
      'Dedicated industrial power corridors',
      'Streamlined interconnection for large loads'
    ],
    estimatedInvestment: '$300B over 10 years',

    referencePoints: [
      {
        country: 'China',
        metric: 'Industrial power availability',
        value: '66% of grid is industrial',
        insight: 'Their grid was built for factories, ours for homes - different starting point'
      },
      {
        country: 'Nordic countries',
        metric: 'Data center attraction',
        value: 'Growing share of EU compute',
        insight: 'Abundant hydro power + cool climate = DC magnet'
      }
    ],

    dependsOn: ['energy-independence', 'nuclear-supply-chain'],
    enables: ['ai-leadership']
  },

  {
    id: 'nuclear-supply-chain',
    domain: 'energy',
    title: 'Complete Domestic Nuclear Supply Chain',
    description: 'End-to-end capability to build, fuel, and operate nuclear plants without dependence on foreign suppliers, especially adversaries.',
    whyItMatters: 'US currently depends on Russia for uranium enrichment, losing this source due to sanctions. Advanced reactors need HALEU fuel we cannot produce. France and Japan have full supply chains; we do not.',

    metrics: [
      {
        name: 'Domestic uranium enrichment capacity',
        currentValue: 30,
        targetValue: 100,
        unit: '% of needs',
        targetYear: 2030,
        source: 'DOE'
      },
      {
        name: 'HALEU production capacity',
        currentValue: 0.5,
        targetValue: 25,
        unit: 'MT/year',
        targetYear: 2030,
        source: 'DOE'
      },
      {
        name: 'Reactor component domestic sourcing',
        currentValue: 40,
        targetValue: 80,
        unit: '%',
        targetYear: 2035,
        source: 'DOE'
      }
    ],

    winCondition: 'Can fuel and build any reactor design without imports from non-allied nations. Strategic fuel reserve of 5 years operation.',

    currentState: 'Zero HALEU production. 100% dependent on Russia/Tenex until ban. No large forging capacity for reactor vessels. Supply chain atrophied over 30 years of no builds.',
    gapToTarget: 'Must build entire enrichment and component supply chain from near-zero.',

    requiredActions: [
      'Scale Centrus HALEU production',
      'Contract with Urenco for expansion',
      'Rebuild heavy forging capability',
      'Qualify domestic component suppliers',
      'Establish uranium reserve'
    ],
    estimatedInvestment: '$15B over 7 years',

    referencePoints: [
      {
        country: 'France',
        metric: 'Nuclear supply chain',
        value: 'Fully domestic',
        insight: 'Orano provides complete fuel cycle independence'
      },
      {
        country: 'Russia',
        metric: 'Global enrichment share',
        value: '35%',
        insight: 'Adversary controls critical input to US energy security'
      }
    ],

    dependsOn: [],
    enables: ['clean-baseload', 'nuclear-export']
  },

  // ============================================
  // COMPUTE DOMAIN
  // ============================================
  {
    id: 'ai-leadership',
    domain: 'compute',
    title: 'Maintain AI Research & Deployment Leadership',
    description: 'Ensure the most capable AI systems are developed in the US, by US companies, aligned with US values and interests.',
    whyItMatters: 'AI will transform every industry, military capability, and aspect of society. The country that leads in AI sets global standards, captures economic value, and shapes how the technology affects humanity.',

    metrics: [
      {
        name: 'Share of frontier AI models',
        currentValue: 70,
        targetValue: 60,
        unit: '% (maintain >50%)',
        targetYear: 2030,
        source: 'Epoch AI'
      },
      {
        name: 'AI compute capacity',
        currentValue: 35,
        targetValue: 150,
        unit: 'GW data center load',
        targetYear: 2030,
        source: 'IEA/McKinsey'
      },
      {
        name: 'AI talent retention rate',
        currentValue: 60,
        targetValue: 85,
        unit: '% of foreign-born PhDs staying',
        targetYear: 2030,
        source: 'NSF'
      }
    ],

    winCondition: 'The most capable AI models continue to be developed in the US. US companies lead in AI deployment across industries. AI safety and alignment research centered in US.',

    currentState: 'US currently leads in frontier AI (OpenAI, Anthropic, Google, Meta). But compute constraints, talent visa issues, and competitor investment threaten position.',
    gapToTarget: 'Need 4x compute capacity, immigration reform, sustained R&D investment.',

    requiredActions: [
      'Solve power constraint for data centers',
      'Retain foreign-born AI researchers (visa reform)',
      'Maintain export controls on advanced chips',
      'Fund fundamental AI safety research',
      'Develop AI talent pipeline domestically'
    ],
    estimatedInvestment: '$200B in compute infrastructure, policy reforms',

    referencePoints: [
      {
        country: 'China',
        metric: 'AI researchers',
        value: '47% of global',
        insight: 'Quantity of researchers, but US leads in quality/citations'
      },
      {
        country: 'UK',
        metric: 'AI safety focus',
        value: 'Leading safety research',
        insight: 'Ally and potential partner on alignment'
      }
    ],

    dependsOn: ['clean-baseload', 'chip-manufacturing'],
    enables: ['economic-growth', 'military-advantage']
  },

  {
    id: 'chip-manufacturing',
    domain: 'compute',
    title: 'Onshore Leading-Edge Semiconductor Manufacturing',
    description: 'Produce advanced semiconductors (<7nm) domestically, reducing dependence on Taiwan for chips critical to AI, defense, and economy.',
    whyItMatters: 'Taiwan produces 92% of leading-edge chips. A Taiwan crisis would halt US AI development, defense production, and auto/tech industries. This is an unacceptable single point of failure.',

    metrics: [
      {
        name: 'Domestic leading-edge production',
        currentValue: 0,
        targetValue: 20,
        unit: '% of global',
        targetYear: 2032,
        source: 'CHIPS Act'
      },
      {
        name: 'Advanced packaging capacity',
        currentValue: 3,
        targetValue: 20,
        unit: '% of global',
        targetYear: 2032,
        source: 'CHIPS Act'
      },
      {
        name: 'Chip inventory buffer',
        currentValue: 5,
        targetValue: 30,
        unit: 'days of supply',
        targetYear: 2030,
        source: 'Commerce Dept'
      }
    ],

    winCondition: 'If Taiwan supply is disrupted for 6 months, US can continue critical AI and defense production using domestic fabs.',

    currentState: 'Zero domestic leading-edge production. TSMC Arizona delayed, Intel struggling to execute. Advanced packaging (CoWoS) 90%+ in Taiwan.',
    gapToTarget: 'CHIPS Act fabs must execute on time. Need additional investment beyond current commitments.',

    requiredActions: [
      'Execute TSMC, Intel, Samsung fabs on schedule',
      'Build advanced packaging capacity (NAPMP)',
      'Train 50,000+ fab workers',
      'Secure equipment supply chain (ASML)',
      'Develop next-gen lithography R&D'
    ],
    estimatedInvestment: '$100B+ (CHIPS Act plus private)',

    referencePoints: [
      {
        country: 'Taiwan',
        metric: 'Leading-edge share',
        value: '92%',
        insight: 'This concentration is the vulnerability we are addressing'
      },
      {
        country: 'South Korea',
        metric: 'Samsung investment',
        value: '$230B through 2042',
        insight: 'Ally also building capacity - potential partnership'
      }
    ],

    dependsOn: ['stem-workforce', 'clean-baseload'],
    enables: ['ai-leadership', 'defense-production']
  },

  // ============================================
  // MANUFACTURING DOMAIN
  // ============================================
  {
    id: 'manufacturing-reshoring',
    domain: 'manufacturing',
    title: 'Reshore Critical Manufacturing',
    description: 'Rebuild domestic manufacturing capacity for strategically important goods: semiconductors, pharmaceuticals, critical minerals processing, defense components.',
    whyItMatters: 'COVID exposed dependence on foreign manufacturing for masks, chips, drugs. National security and economic resilience require domestic production of critical goods.',

    metrics: [
      {
        name: 'Manufacturing share of GDP',
        currentValue: 11,
        targetValue: 15,
        unit: '%',
        targetYear: 2035,
        source: 'BEA'
      },
      {
        name: 'Critical goods domestic production',
        currentValue: 30,
        targetValue: 70,
        unit: '% of consumption',
        targetYear: 2035,
        source: 'Commerce Dept'
      },
      {
        name: 'Manufacturing jobs',
        currentValue: 13,
        targetValue: 16,
        unit: 'million',
        targetYear: 2035,
        source: 'BLS'
      }
    ],

    winCondition: 'No critical supply chain has >50% dependence on any single non-allied nation. Domestic surge capacity for defense and health emergencies.',

    currentState: 'Manufacturing hollowed out since 1980s. 13M manufacturing jobs down from 19M peak. Critical goods (rare earths, APIs, chips) overwhelmingly foreign-sourced.',
    gapToTarget: 'Need new factories, workforce training, and sustained policy support across administrations.',

    requiredActions: [
      'CHIPS Act execution',
      'IRA clean energy manufacturing incentives',
      'Critical minerals processing facilities',
      'Pharmaceutical API domestic production',
      'Workforce training programs'
    ],
    estimatedInvestment: '$500B public/private over 10 years',

    referencePoints: [
      {
        country: 'Germany',
        metric: 'Manufacturing share of GDP',
        value: '19%',
        insight: 'Maintained industrial base while being high-wage economy'
      },
      {
        country: 'China',
        metric: 'Manufacturing share of GDP',
        value: '28%',
        insight: 'Scale that supports massive infrastructure investment'
      }
    ],

    dependsOn: ['energy-independence', 'stem-workforce'],
    enables: ['economic-growth', 'defense-production']
  },

  {
    id: 'critical-minerals',
    domain: 'supply-chain',
    title: 'Secure Critical Mineral Supply Chains',
    description: 'Establish mining, processing, and recycling capacity for rare earths, lithium, cobalt, graphite, and other critical minerals.',
    whyItMatters: 'Every EV, wind turbine, smartphone, and missile requires critical minerals. China controls 60-90% of processing. This is a chokepoint that could halt US manufacturing and defense production.',

    metrics: [
      {
        name: 'Rare earth processing domestic',
        currentValue: 0,
        targetValue: 30,
        unit: '% of consumption',
        targetYear: 2035,
        source: 'DOE'
      },
      {
        name: 'Lithium refining domestic',
        currentValue: 1,
        targetValue: 40,
        unit: '% of consumption',
        targetYear: 2035,
        source: 'DOE'
      },
      {
        name: 'Battery recycling rate',
        currentValue: 5,
        targetValue: 50,
        unit: '%',
        targetYear: 2035,
        source: 'DOE'
      }
    ],

    winCondition: 'No critical mineral has >50% dependence on non-allied sources. Stockpiles of 2+ years for defense-critical materials.',

    currentState: 'US mines some ore but ships to China for processing. Zero rare earth magnets, 1% lithium refining, 0% graphite processing domestically.',
    gapToTarget: 'Must build entire processing industry from scratch. 10-15 year effort.',

    requiredActions: [
      'MP Materials expansion (rare earths)',
      'Lithium processing facilities (Albemarle, others)',
      'Graphite processing (new facilities needed)',
      'Battery recycling infrastructure',
      'Allied partnerships (Australia, Canada)'
    ],
    estimatedInvestment: '$50B over 15 years',

    referencePoints: [
      {
        country: 'Australia',
        metric: 'Rare earth mining',
        value: 'Growing producer',
        insight: 'Allied source - partnership opportunity'
      },
      {
        country: 'China',
        metric: 'Rare earth processing',
        value: '90% global',
        insight: 'The dependency we must reduce - their dominance took 30 years'
      }
    ],

    dependsOn: [],
    enables: ['manufacturing-reshoring', 'clean-energy']
  },

  // ============================================
  // SECURITY DOMAIN
  // ============================================
  {
    id: 'infrastructure-security',
    domain: 'security',
    title: 'Secure Critical Infrastructure from Cyber Threats',
    description: 'Protect power grid, water systems, transportation, and other critical infrastructure from nation-state and criminal cyber attacks.',
    whyItMatters: 'Colonial Pipeline showed one ransomware attack can disrupt fuel supply for 17 states. Volt Typhoon showed adversaries pre-positioning in our infrastructure. A coordinated attack could cause mass casualties.',

    metrics: [
      {
        name: 'Critical infrastructure entities meeting security standards',
        currentValue: 40,
        targetValue: 95,
        unit: '%',
        targetYear: 2030,
        source: 'CISA'
      },
      {
        name: 'OT visibility coverage',
        currentValue: 25,
        targetValue: 90,
        unit: '% of critical OT networks',
        targetYear: 2030,
        source: 'CISA'
      },
      {
        name: 'Mean time to detect OT intrusion',
        currentValue: 280,
        targetValue: 24,
        unit: 'days',
        targetYear: 2030,
        source: 'Industry'
      }
    ],

    winCondition: 'No adversary can cause cascading infrastructure failure through cyber means. All intrusions detected within 24 hours. Recovery capability within 72 hours.',

    currentState: 'Fragmented security across 3,000+ utilities. Legacy SCADA systems unpatchable. Volt Typhoon embedded in multiple sectors. No unified OT security standards.',
    gapToTarget: 'Need mandatory security standards, OT visibility, and massive workforce expansion.',

    requiredActions: [
      'Mandatory NERC CIP-like standards for all critical infrastructure',
      'OT security monitoring deployment across sectors',
      'Threat hunting in all critical networks',
      'Supply chain security for infrastructure components',
      'Train 10,000+ OT security specialists'
    ],
    estimatedInvestment: '$30B over 7 years',

    referencePoints: [
      {
        country: 'Israel',
        metric: 'Cyber defense integration',
        value: 'Military-civilian unified',
        insight: 'Model for integrated critical infrastructure defense'
      },
      {
        country: 'Estonia',
        metric: 'Recovery from cyberattack',
        value: '2007 attacks drove transformation',
        insight: 'Built resilient digital infrastructure after being targeted'
      }
    ],

    dependsOn: ['stem-workforce'],
    enables: ['energy-independence', 'ai-leadership']
  },

  // ============================================
  // WORKFORCE DOMAIN
  // ============================================
  {
    id: 'stem-workforce',
    domain: 'workforce',
    title: 'Build World-Class Technical Workforce',
    description: 'Develop and retain engineering, scientific, and technical talent needed for energy, computing, and manufacturing goals.',
    whyItMatters: 'Every goal on this list requires people to execute. US faces shortages of nuclear engineers, chip fab workers, lineworkers, welders, and cybersecurity professionals. Without workforce, capital is useless.',

    metrics: [
      {
        name: 'STEM graduates annual',
        currentValue: 800,
        targetValue: 1200,
        unit: 'thousand/year',
        targetYear: 2035,
        source: 'NSF'
      },
      {
        name: 'Skilled trades graduates',
        currentValue: 500,
        targetValue: 800,
        unit: 'thousand/year',
        targetYear: 2035,
        source: 'BLS'
      },
      {
        name: 'Foreign STEM PhD retention',
        currentValue: 60,
        targetValue: 85,
        unit: '%',
        targetYear: 2030,
        source: 'NSF'
      }
    ],

    winCondition: 'No critical project delayed by workforce shortages. Competitive salaries attract top global talent. Domestic pipeline meets 80% of needs.',

    currentState: 'Nuclear workforce aging (average 50+), lost a generation. Fab workers need 50,000+ trained. Lineworkers retiring faster than replacing. OT security has <5,000 specialists for 3,000 utilities.',
    gapToTarget: 'Need immigration reform, apprenticeship expansion, and sustained education investment.',

    requiredActions: [
      'STEM visa stapling for graduates',
      'Apprenticeship programs for trades',
      'Community college technical programs',
      'Nuclear/energy workforce pipeline',
      'Cybersecurity training programs'
    ],
    estimatedInvestment: '$20B over 10 years',

    referencePoints: [
      {
        country: 'Germany',
        metric: 'Apprenticeship system',
        value: '50% of youth',
        insight: 'Vocational training produces world-class manufacturing workforce'
      },
      {
        country: 'Canada',
        metric: 'Immigration points system',
        value: 'Skills-based selection',
        insight: 'Attracts talent US turns away'
      }
    ],

    dependsOn: [],
    enables: ['chip-manufacturing', 'nuclear-supply-chain', 'infrastructure-security', 'manufacturing-reshoring']
  }
];

// ============================================
// DOMAIN SUMMARIES
// ============================================

export const DOMAIN_SUMMARIES: DomainSummary[] = [
  {
    domain: 'energy',
    label: 'Energy',
    icon: '⚡',
    coreQuestion: 'Can America power its future?',
    winStatement: 'Reliable, clean, abundant energy that enables everything else.',
    goalCount: 3,
    onTrack: 0,
    atRisk: 2,
    blocked: 1
  },
  {
    domain: 'compute',
    label: 'Compute & AI',
    icon: '🖥️',
    coreQuestion: 'Will America lead the AI era?',
    winStatement: 'Most capable AI systems developed here, by us, for our values.',
    goalCount: 2,
    onTrack: 1,
    atRisk: 1,
    blocked: 0
  },
  {
    domain: 'manufacturing',
    label: 'Manufacturing',
    icon: '🏭',
    coreQuestion: 'Can America make things again?',
    winStatement: 'Critical goods made domestically, good jobs for Americans.',
    goalCount: 1,
    onTrack: 0,
    atRisk: 1,
    blocked: 0
  },
  {
    domain: 'supply-chain',
    label: 'Supply Chain',
    icon: '⛏️',
    coreQuestion: 'Do we control our inputs?',
    winStatement: 'No critical dependency on adversary nations.',
    goalCount: 1,
    onTrack: 0,
    atRisk: 0,
    blocked: 1
  },
  {
    domain: 'security',
    label: 'Security',
    icon: '🛡️',
    coreQuestion: 'Can adversaries turn off our lights?',
    winStatement: 'Infrastructure resilient to attack, intrusions detected and expelled.',
    goalCount: 1,
    onTrack: 0,
    atRisk: 1,
    blocked: 0
  },
  {
    domain: 'workforce',
    label: 'Workforce',
    icon: '👷',
    coreQuestion: 'Do we have the people?',
    winStatement: 'Skilled Americans building and operating critical infrastructure.',
    goalCount: 1,
    onTrack: 0,
    atRisk: 1,
    blocked: 0
  }
];

// ============================================
// WHAT DOES WINNING LOOK LIKE? (Summary)
// ============================================

export const WINNING_DEFINED = {
  headline: 'American Strategic Autonomy in the AI Era',
  summary: 'The ability to pursue our interests, protect our citizens, and lead in technology without dependence on adversaries for critical inputs.',

  pillars: [
    {
      title: 'Energy Abundance',
      description: 'Enough clean baseload power to run unlimited AI compute without choosing between data centers and homes.',
      metric: '100+ GW new clean baseload by 2035'
    },
    {
      title: 'Compute Sovereignty',
      description: 'AI systems developed and run on US soil, using US-made chips, by US-aligned companies.',
      metric: '20% of leading-edge chips made domestically'
    },
    {
      title: 'Supply Chain Security',
      description: 'No critical supply chain with >50% dependence on any non-allied nation.',
      metric: 'Rare earths, chips, energy all diversified'
    },
    {
      title: 'Infrastructure Resilience',
      description: 'Critical infrastructure that cannot be disrupted by adversaries.',
      metric: 'Zero cascading failures, 24-hour detection, 72-hour recovery'
    },
    {
      title: 'Workforce Capability',
      description: 'Americans with the skills to build and operate everything on this list.',
      metric: '1M+ new STEM and trades workers by 2035'
    }
  ],

  notAboutChina: 'These goals stand on their own. We would pursue them even if China did not exist. China is a reference point for scale and urgency, but not the reason we need energy security, economic competitiveness, or infrastructure resilience.',

  theRealCompetition: 'We are competing against entropy, aging infrastructure, skill atrophy, and policy dysfunction. China is useful to look at because they are executing while we are deliberating. But the enemy is our own inaction, not China.'
};

// ============================================
// GOAL DEPENDENCY GRAPH
// ============================================

export function getGoalDependencies(goalId: string): {
  dependsOn: StrategicGoal[];
  enables: StrategicGoal[];
  criticalPath: string[];
} {
  const goal = US_STRATEGIC_GOALS.find(g => g.id === goalId);
  if (!goal) return { dependsOn: [], enables: [], criticalPath: [] };

  const dependsOn = US_STRATEGIC_GOALS.filter(g => goal.dependsOn.includes(g.id));
  const enables = US_STRATEGIC_GOALS.filter(g => goal.enables.includes(g.id));

  // Simple critical path: what must happen first
  const criticalPath: string[] = [];
  const visited = new Set<string>();

  function traceDependencies(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const g = US_STRATEGIC_GOALS.find(x => x.id === id);
    if (g) {
      g.dependsOn.forEach(dep => traceDependencies(dep));
      criticalPath.push(g.title);
    }
  }

  goal.dependsOn.forEach(dep => traceDependencies(dep));
  criticalPath.push(goal.title);

  return { dependsOn, enables, criticalPath };
}

// ============================================
// CALCULATE OVERALL STATUS
// ============================================

export function getOverallStatus(): {
  goalsOnTrack: number;
  goalsAtRisk: number;
  goalsBlocked: number;
  totalInvestment: string;
  criticalBlockers: string[];
} {
  return {
    goalsOnTrack: 1,  // AI leadership (currently)
    goalsAtRisk: 6,
    goalsBlocked: 2,  // Nuclear supply chain, critical minerals
    totalInvestment: '$1.5T+ over 15 years',
    criticalBlockers: [
      'HALEU fuel supply (blocks nuclear scale-up)',
      'Permitting timelines (blocks grid expansion)',
      'Rare earth processing (blocks manufacturing)',
      'Workforce pipeline (blocks everything)'
    ]
  };
}
