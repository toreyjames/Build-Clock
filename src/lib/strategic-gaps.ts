// US-China AI Infrastructure Competition Gap Analysis
// The strategic foundation: What gaps must the US close to win?

export interface StrategicGap {
  id: string;
  domain: 'compute' | 'power' | 'grid' | 'semiconductors' | 'minerals' | 'talent' | 'policy';
  title: string;
  subtitle: string;

  // Current State
  usCurrentState: string;
  usMetric: string;
  chinaCurrentState: string;
  chinaMetric: string;

  // The Gap
  gapDescription: string;
  gapSeverity: 'critical' | 'severe' | 'moderate' | 'competitive';
  timeToClose: string; // "3-5 years", "5-10 years", "10+ years"

  // US Targets (from DOE, CHIPS Act, IRA, etc.)
  usTargets: {
    target: string;
    source: string;
    deadline: string;
    progress: number; // 0-100
  }[];

  // What's being done
  currentInitiatives: {
    name: string;
    type: 'federal' | 'state' | 'private' | 'public-private';
    investment: string;
    status: string;
  }[];

  // What's NOT being done / additional needs
  unaddressedNeeds: string[];

  // China's trajectory
  chinaTrend: 'accelerating' | 'steady' | 'slowing';
  chinaProjection: string;

  // Strategic implications
  implications: string;

  // Sources
  sources: { title: string; url: string; date: string }[];
}

export interface DomainSummary {
  domain: string;
  label: string;
  icon: string;
  usScore: number; // 0-100 competitive position
  chinaScore: number;
  overallGap: 'losing' | 'behind' | 'competitive' | 'leading';
  criticalPath: string; // What must happen to close the gap
}

// Comprehensive Gap Analysis Data
export const STRATEGIC_GAPS: StrategicGap[] = [
  // ============================================
  // POWER GENERATION - Nuclear
  // ============================================
  {
    id: 'nuclear-capacity',
    domain: 'power',
    title: 'Nuclear Generation Capacity',
    subtitle: 'New reactor construction and fleet expansion',

    usCurrentState: '93 operating reactors providing ~18% of electricity. Average reactor age 42 years. Only 2 new reactors (Vogtle 3&4) completed in 30+ years. 13 reactors shut down since 2013.',
    usMetric: '95 GW operating capacity, <2 GW under construction',

    chinaCurrentState: '56 operating reactors with 27 more under construction. Building reactors in 5-6 years vs US 10-15 years. State-owned enterprises execute at scale with streamlined approvals.',
    chinaMetric: '57 GW operating, 27 GW under construction, 150+ GW planned by 2035',

    gapDescription: 'China is adding 8-10 GW of nuclear capacity annually while US struggles to maintain existing fleet. China will surpass US nuclear capacity by 2030. Their Hualong One design is being exported globally while US has no exportable design.',
    gapSeverity: 'critical',
    timeToClose: '10+ years',

    usTargets: [
      {
        target: 'Deploy 200 GW of new nuclear by 2050',
        source: 'DOE Liftoff Report on Advanced Nuclear',
        deadline: '2050',
        progress: 2
      },
      {
        target: 'Triple nuclear capacity to reach net-zero',
        source: 'COP28 Declaration (US signatory)',
        deadline: '2050',
        progress: 5
      },
      {
        target: 'Deploy first SMRs by 2030',
        source: 'DOE Advanced Reactor Demonstration Program',
        deadline: '2030',
        progress: 35
      }
    ],

    currentInitiatives: [
      {
        name: 'Vogtle Units 3 & 4',
        type: 'private',
        investment: '$35B (over budget)',
        status: 'Unit 3 operational 2023, Unit 4 operational 2024'
      },
      {
        name: 'NuScale UAMPS Project',
        type: 'public-private',
        investment: '$4B DOE support',
        status: 'Cancelled Jan 2024 due to cost escalation'
      },
      {
        name: 'TerraPower Natrium (Wyoming)',
        type: 'public-private',
        investment: '$2B (50% DOE)',
        status: 'Construction started, targeting 2030'
      },
      {
        name: 'X-energy Xe-100 (Texas)',
        type: 'public-private',
        investment: '$1.2B DOE ARDP',
        status: 'Development, targeting 2030'
      },
      {
        name: 'Palisades Restart',
        type: 'public-private',
        investment: '$1.5B DOE loan',
        status: 'Targeting restart 2025'
      },
      {
        name: 'Three Mile Island Restart',
        type: 'private',
        investment: '$1.6B Constellation',
        status: 'Microsoft PPA, targeting 2028'
      }
    ],

    unaddressedNeeds: [
      'No standardized reactor design for rapid deployment (China uses cookie-cutter Hualong One)',
      'NRC licensing takes 5-7 years vs China\'s 2-3 years',
      'No nuclear construction workforce pipeline - lost expertise over 30 years',
      'No fuel supply chain independence (still rely on Russian HALEU enrichment)',
      'No export financing mechanism to compete with China\'s Belt & Road nuclear deals',
      'No solution for spent fuel storage blocking new plant siting',
      'Utility risk aversion - need federal backstop for first-of-a-kind cost overruns'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'China will have largest nuclear fleet by 2030 (~100 GW), largest by far by 2035 (~150 GW). Exporting Hualong One to Pakistan, Argentina, Saudi Arabia, others.',

    implications: 'Without massive nuclear buildout, US cannot power AI data centers with clean baseload. China will control the global nuclear industry and export market. AI compute advantage follows power advantage.',

    sources: [
      { title: 'DOE Pathways to Commercial Liftoff: Advanced Nuclear', url: 'https://liftoff.energy.gov/nuclear/', date: '2024-05' },
      { title: 'World Nuclear Association - China Profile', url: 'https://world-nuclear.org/information-library/country-profiles/countries-a-f/china-nuclear-power', date: '2024-09' },
      { title: 'COP28 Declaration to Triple Nuclear Energy', url: 'https://www.energy.gov/articles/cop28-countries-launch-declaration-triple-nuclear-energy-capacity-2050', date: '2023-12' }
    ]
  },

  {
    id: 'nuclear-fuel-supply',
    domain: 'power',
    title: 'Nuclear Fuel Supply Chain (HALEU)',
    subtitle: 'High-Assay Low-Enriched Uranium for advanced reactors',

    usCurrentState: 'Zero domestic HALEU production. 100% of current HALEU comes from Russia via Tenex. Only enrichment facility (Urenco) produces LEU, not HALEU. Centrus demonstrating small-scale HALEU production.',
    usMetric: '0 kg/year domestic HALEU production',

    chinaCurrentState: 'Full fuel cycle capability. Domestic enrichment serving entire fleet. Building centrifuge capacity to achieve fuel independence and export.',
    chinaMetric: 'Self-sufficient, expanding to export',

    gapDescription: 'Advanced reactors (TerraPower, X-energy, Kairos) require HALEU fuel that US cannot produce. Congress banned Russian uranium imports (2024) but domestic production won\'t scale until 2027-2028. Without HALEU, advanced reactor deployment stalls.',
    gapSeverity: 'critical',
    timeToClose: '3-5 years',

    usTargets: [
      {
        target: '25 MT HALEU/year domestic production',
        source: 'DOE HALEU Availability Program',
        deadline: '2030',
        progress: 5
      },
      {
        target: 'End dependence on Russian nuclear fuel',
        source: 'Prohibiting Russian Uranium Imports Act',
        deadline: '2028',
        progress: 10
      }
    ],

    currentInitiatives: [
      {
        name: 'Centrus Piketon HALEU Demo',
        type: 'public-private',
        investment: '$150M DOE',
        status: 'Producing <1 MT/year, proving technology'
      },
      {
        name: 'DOE HALEU Consortium',
        type: 'federal',
        investment: '$2.7B (IRA)',
        status: 'Contracting with enrichers, production 2027+'
      },
      {
        name: 'Urenco LEU to HALEU expansion',
        type: 'private',
        investment: 'TBD',
        status: 'Evaluating New Mexico facility expansion'
      }
    ],

    unaddressedNeeds: [
      'Bridge supply for 2024-2027 gap - no HALEU available',
      'Deconversion capacity (UF6 to metal/oxide) nearly nonexistent',
      'Transportation containers for HALEU not licensed',
      'Workforce for enrichment operations',
      'Long-term offtake agreements needed to justify private investment'
    ],

    chinaTrend: 'steady',
    chinaProjection: 'Fully self-sufficient and expanding. Will offer fuel services to Hualong One export customers, creating lock-in.',

    implications: 'Every advanced reactor project depends on solving HALEU. Current gap means 3-4 year delay on SMR deployment even if everything else works.',

    sources: [
      { title: 'DOE HALEU Availability Program', url: 'https://www.energy.gov/ne/haleu-availability-program', date: '2024-06' },
      { title: 'Centrus HALEU Production Announcement', url: 'https://www.centrusenergy.com/news/', date: '2023-11' }
    ]
  },

  // ============================================
  // POWER GENERATION - Fusion
  // ============================================
  {
    id: 'fusion-development',
    domain: 'power',
    title: 'Fusion Energy Development',
    subtitle: 'Race to first commercial fusion power',

    usCurrentState: 'NIF achieved ignition (Dec 2022). Strong private sector: Commonwealth Fusion (SPARC), Helion (Microsoft PPA), TAE Technologies. $6B+ private investment. But no coordinated national program.',
    usMetric: '~25 fusion companies, $6B+ private investment, no commercial plant',

    chinaCurrentState: 'EAST tokamak set confinement records. HL-2M tokamak operational. Building CFETR (China Fusion Engineering Test Reactor) targeting 2035. Integrated into state 5-year plans with guaranteed funding.',
    chinaMetric: 'CFETR targeting 1 GW by 2035, state-funded program',

    gapDescription: 'US leads in private fusion innovation but China has coordinated state program with certain funding. Private US companies must raise capital round-by-round while China guarantees decades of support. Race to first commercial plant is genuinely competitive.',
    gapSeverity: 'competitive',
    timeToClose: '5-10 years',

    usTargets: [
      {
        target: 'Demonstrate pilot-scale fusion by 2035',
        source: 'White House Bold Decadal Vision for Fusion',
        deadline: '2035',
        progress: 20
      },
      {
        target: 'Commercial fusion power on grid by 2040',
        source: 'DOE Fusion Energy Strategy',
        deadline: '2040',
        progress: 10
      }
    ],

    currentInitiatives: [
      {
        name: 'Commonwealth Fusion SPARC',
        type: 'private',
        investment: '$2B+ raised',
        status: 'Building SPARC in MA, targeting 2026 first plasma'
      },
      {
        name: 'Helion Polaris',
        type: 'private',
        investment: '$577M (incl. Microsoft PPA)',
        status: 'Building in WA, targeting 2028 commercial'
      },
      {
        name: 'TAE Technologies',
        type: 'private',
        investment: '$1.2B raised',
        status: 'Building Copernicus, targeting 2030s'
      },
      {
        name: 'DOE Milestone-Based Fusion Program',
        type: 'federal',
        investment: '$46M initial',
        status: 'Supporting private companies, small scale'
      },
      {
        name: 'ITER (international)',
        type: 'public-private',
        investment: '$22B+ (US ~9%)',
        status: 'Delayed to 2035+, over budget'
      }
    ],

    unaddressedNeeds: [
      'No domestic supply chain for fusion-specific components (superconducting magnets, tritium)',
      'Regulatory framework for fusion licensing not finalized',
      'Tritium supply insufficient for commercial scale (need lithium blanket breeding)',
      'Grid integration planning for pulsed vs steady-state fusion',
      'Federal fusion budget ($700M/year) dwarfed by private investment - coordination lacking',
      'Workforce training for fusion plant operations'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'CFETR targeting 1 GW demo by 2035, commercial deployment by 2050. Full state backing with no funding uncertainty.',

    implications: 'First nation to commercial fusion gains massive energy advantage. US private innovation is promising but fragile - one major company failure could set back the field. China\'s state program provides certainty.',

    sources: [
      { title: 'White House Bold Decadal Vision for Commercial Fusion', url: 'https://www.whitehouse.gov/ostp/news-updates/2022/03/15/fact-sheet-developing-a-bold-decadal-vision-for-commercial-fusion-energy/', date: '2022-03' },
      { title: 'Commonwealth Fusion Systems SPARC', url: 'https://cfs.energy/', date: '2024' }
    ]
  },

  // ============================================
  // GRID INFRASTRUCTURE
  // ============================================
  {
    id: 'grid-transmission',
    domain: 'grid',
    title: 'High-Voltage Transmission Capacity',
    subtitle: 'Moving power from generation to demand centers',

    usCurrentState: '70% of transmission lines over 25 years old. Fragmented into 3 interconnections with limited transfer capacity. Average 10-year permitting timeline for new lines. Only ~1% of needed transmission being built annually.',
    usMetric: '240,000 miles of high-voltage lines, adding <1,000 miles/year',

    chinaCurrentState: 'World\'s largest UHV (Ultra High Voltage) network. 40,000+ km of UHV lines moving power from west to east. Can build 1,000 km UHV line in 2 years. State Grid executes nationally.',
    chinaMetric: '40,000+ km UHV, adding 5,000+ km/year, unified national grid',

    gapDescription: 'China can move power anywhere in the country via UHV. US grid is balkanized - ERCOT isolated, eastern/western interconnections barely linked. New transmission takes 10+ years to permit. Without transmission, new nuclear/renewables can\'t reach AI data centers.',
    gapSeverity: 'severe',
    timeToClose: '10+ years',

    usTargets: [
      {
        target: 'Add 47,000 miles of new transmission by 2035',
        source: 'DOE National Transmission Needs Study',
        deadline: '2035',
        progress: 5
      },
      {
        target: '100% clean electricity by 2035',
        source: 'Biden Administration Goal',
        deadline: '2035',
        progress: 40
      },
      {
        target: 'Designate National Interest Electric Transmission Corridors',
        source: 'DOE NIETC Authority',
        deadline: '2025',
        progress: 30
      }
    ],

    currentInitiatives: [
      {
        name: 'DOE Grid Resilience & Innovation Partnerships (GRIP)',
        type: 'federal',
        investment: '$10.5B (BIL)',
        status: 'Round 2 awards ongoing'
      },
      {
        name: 'Grain Belt Express',
        type: 'private',
        investment: '$7B',
        status: '800 miles, delayed by permitting, targeting 2028'
      },
      {
        name: 'SunZia Transmission',
        type: 'private',
        investment: '$11B',
        status: '550 miles, under construction, 2025 completion'
      },
      {
        name: 'FERC Transmission Planning Rule (Order 1920)',
        type: 'federal',
        investment: 'Regulatory',
        status: 'Finalized 2024 - requires 20-year planning'
      },
      {
        name: 'DOE Transmission Facilitation Program',
        type: 'federal',
        investment: '$2.5B',
        status: 'Capacity contracts for new lines'
      }
    ],

    unaddressedNeeds: [
      'Federal permitting authority limited - states can block interstate lines',
      'No eminent domain authority for transmission across state lines',
      'Cost allocation disputes between states delay projects',
      'Interconnection queue backlog: 2,600 GW waiting, average 5-year wait',
      'Transformer shortage (40-week lead times) constrains buildout',
      'Workforce shortage: lineworkers aging out, not enough apprentices',
      'HVDC technology deployed in China not being built in US'
    ],

    chinaTrend: 'steady',
    chinaProjection: 'Continuing UHV expansion to integrate western renewables with eastern industry. Planning transnational grid to connect with Central Asia.',

    implications: 'Without transmission, new generation is stranded. AI data centers need reliable power NOW - grid constraints force them to build where power exists, not where optimal. US is building generation but can\'t move the electrons.',

    sources: [
      { title: 'DOE National Transmission Needs Study', url: 'https://www.energy.gov/gdo/national-transmission-needs-study', date: '2023-10' },
      { title: 'FERC Order 1920 Transmission Planning', url: 'https://www.ferc.gov/news-events/news/ferc-issues-transmission-planning-rule', date: '2024-05' }
    ]
  },

  {
    id: 'grid-security',
    domain: 'grid',
    title: 'Grid Cybersecurity & Resilience',
    subtitle: 'Protecting critical infrastructure from attack',

    usCurrentState: 'NERC CIP standards mandatory but enforcement varies. OT/IT convergence creating new attack surface. Colonial Pipeline, SolarWinds showed vulnerabilities. Most utilities lack real-time OT visibility.',
    usMetric: '~3,000 utilities, varying security maturity, increasing attacks',

    chinaCurrentState: 'State Grid cyber capabilities unknown but presumed integrated with state security apparatus. Offensive capabilities demonstrated (Volt Typhoon). Grid designed with security architecture from inception.',
    chinaMetric: 'Unified security architecture, offensive/defensive integration',

    gapDescription: 'US grid is a patchwork of 3,000+ utilities with varying security. China has prepositioning malware in US critical infrastructure (Volt Typhoon). US lacks unified OT security standards and real-time visibility.',
    gapSeverity: 'critical',
    timeToClose: '3-5 years',

    usTargets: [
      {
        target: 'Implement 100-day ICS cybersecurity sprint',
        source: 'DOE/CISA',
        deadline: 'Ongoing',
        progress: 60
      },
      {
        target: 'Deploy OT visibility across critical infrastructure',
        source: 'National Cybersecurity Strategy',
        deadline: '2028',
        progress: 25
      }
    ],

    currentInitiatives: [
      {
        name: 'DOE CESER Grid Security Programs',
        type: 'federal',
        investment: '$250M/year',
        status: 'Ongoing - CyTRICS, CRISP, etc.'
      },
      {
        name: 'NERC CIP Standards Updates',
        type: 'federal',
        investment: 'Regulatory',
        status: 'CIP-003-8 supply chain, CIP-013 ongoing'
      },
      {
        name: 'INL Idaho Cyber Test Range',
        type: 'federal',
        investment: '$100M+',
        status: 'Operational - testing grid equipment'
      }
    ],

    unaddressedNeeds: [
      'No mandatory OT security standards for distribution utilities',
      'Legacy SCADA systems can\'t be patched - need replacement',
      'Supply chain compromise risk (Chinese components in transformers)',
      'Workforce: <1,000 ICS security specialists for 3,000 utilities',
      'Information sharing between utilities remains inadequate',
      'No federal authority to mandate security upgrades'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Continued prepositioning in US infrastructure. Building domestic supply chain to eliminate foreign dependencies in their grid.',

    implications: 'Grid attack could cripple AI data centers and broader economy. OT security is the defensive gap that must be closed. This is where Deloitte OT Cyber directly addresses national security.',

    sources: [
      { title: 'CISA Volt Typhoon Advisory', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a', date: '2024-02' },
      { title: 'DOE 100-Day Plan for Electric Sector', url: 'https://www.energy.gov/ceser/100-day-plan', date: '2021' }
    ]
  },

  // ============================================
  // AI COMPUTE INFRASTRUCTURE
  // ============================================
  {
    id: 'datacenter-capacity',
    domain: 'compute',
    title: 'AI Data Center Capacity',
    subtitle: 'Physical infrastructure for AI training and inference',

    usCurrentState: 'US hosts ~50% of global hyperscale capacity. Major buildout underway: Stargate ($100B+), Microsoft, Google, Amazon all expanding. But power constraints limiting growth in key markets.',
    usMetric: '~35 GW data center load, growing 15-20%/year',

    chinaCurrentState: 'Rapidly expanding despite chip restrictions. National "East-Data-West-Compute" program building DC capacity in western provinces with cheaper power. State subsidies for AI infrastructure.',
    chinaMetric: '~20 GW data center load, accelerating growth',

    gapDescription: 'US currently leads but China closing fast. US constrained by power availability - projects delayed in Virginia, Arizona. China building where power is cheap (west) and moving data to compute. Export controls forcing China to build more efficient infrastructure.',
    gapSeverity: 'competitive',
    timeToClose: '5-10 years',

    usTargets: [
      {
        target: 'Support 500 GW AI compute by 2035',
        source: 'Industry projections (no federal target)',
        deadline: '2035',
        progress: 7
      },
      {
        target: 'Stargate Project deployment',
        source: 'OpenAI/Microsoft/SoftBank/Oracle',
        deadline: '2029',
        progress: 5
      }
    ],

    currentInitiatives: [
      {
        name: 'Stargate Project',
        type: 'private',
        investment: '$100B+ committed',
        status: 'Announced Jan 2025, Texas initial site'
      },
      {
        name: 'Microsoft Data Center Expansion',
        type: 'private',
        investment: '$50B+ FY25',
        status: 'Global buildout, nuclear PPAs'
      },
      {
        name: 'Google AI Infrastructure',
        type: 'private',
        investment: '$50B+ planned',
        status: 'Building, geothermal/nuclear partnerships'
      },
      {
        name: 'Amazon/AWS Expansion',
        type: 'private',
        investment: '$150B through 2030',
        status: 'Nuclear investments, global buildout'
      }
    ],

    unaddressedNeeds: [
      'Power availability - data centers competing with grid needs',
      'Permitting delays for new facilities',
      'Water constraints for cooling in key markets',
      'Interconnection queue delays',
      'No federal strategy coordinating AI compute with power buildout',
      'Workforce for construction and operations',
      'Supply chain for electrical equipment (transformers)'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Despite chip restrictions, building massive inference infrastructure with Huawei Ascend chips. Achieving more with less through efficiency.',

    implications: 'AI capability follows compute capacity. Whoever can build and power more data centers trains more capable models. Power is the binding constraint - solving nuclear/grid solves compute.',

    sources: [
      { title: 'Stargate Project Announcement', url: 'https://openai.com/index/announcing-the-stargate-project/', date: '2025-01' },
      { title: 'IEA Electricity 2024 - Data Centres', url: 'https://www.iea.org/reports/electricity-2024/data-centres', date: '2024-01' }
    ]
  },

  // ============================================
  // SEMICONDUCTORS
  // ============================================
  {
    id: 'leading-edge-fabs',
    domain: 'semiconductors',
    title: 'Leading-Edge Chip Manufacturing',
    subtitle: 'Sub-5nm fabrication for AI chips',

    usCurrentState: 'Zero leading-edge fabs operational. TSMC Arizona building 4nm fab (delayed to 2025), 3nm fab planned. Intel building in Ohio/Arizona but execution struggling. Samsung Taylor, TX fab delayed.',
    usMetric: '0% of <5nm global production (Taiwan: 90%+)',

    chinaCurrentState: 'SMIC producing 7nm despite sanctions. Massive investment in mature nodes (28nm+). Huawei Mate 60 Pro demonstrated indigenous 7nm capability. Racing to 5nm.',
    chinaMetric: '~7nm indigenous capability, 30%+ global mature node capacity',

    gapDescription: 'US manufactures 0% of leading-edge chips. Taiwan makes 90%+. China has demonstrated 7nm and is pushing to 5nm despite sanctions. CHIPS Act rebuilding but fabs won\'t be operational until 2025-2027. Still dependent on ASML (Netherlands) for EUV.',
    gapSeverity: 'critical',
    timeToClose: '5-10 years',

    usTargets: [
      {
        target: 'Produce 20% of leading-edge chips by 2030',
        source: 'CHIPS Act Goals',
        deadline: '2030',
        progress: 10
      },
      {
        target: '2+ leading-edge fabs operational by 2030',
        source: 'CHIPS Act Implementation',
        deadline: '2030',
        progress: 25
      }
    ],

    currentInitiatives: [
      {
        name: 'TSMC Arizona Fab 21',
        type: 'public-private',
        investment: '$65B total ($6.6B CHIPS)',
        status: 'Fab 1 delayed to 2025, Fab 2 3nm planned'
      },
      {
        name: 'Intel Ohio Fabs',
        type: 'public-private',
        investment: '$28B initial ($8.5B CHIPS)',
        status: 'Construction ongoing, 2027+ production'
      },
      {
        name: 'Samsung Taylor TX',
        type: 'public-private',
        investment: '$17B ($6.4B CHIPS)',
        status: 'Delayed, 2026 target'
      },
      {
        name: 'Intel Arizona Expansion',
        type: 'public-private',
        investment: '$20B',
        status: 'Fab 52/62, in progress'
      },
      {
        name: 'Micron Idaho/NY',
        type: 'public-private',
        investment: '$100B over 20 years ($6.1B CHIPS)',
        status: 'Memory fabs, construction started'
      }
    ],

    unaddressedNeeds: [
      'No domestic EUV capability - dependent on ASML',
      'Workforce gap: need 50,000+ fab workers, training infrastructure lacking',
      'Advanced packaging (chiplet/CoWoS) capacity critical - US behind',
      'Chemical/gas supply chain still Asia-dependent',
      'R&D pipeline: need next-gen lithography (High-NA EUV)',
      'Intel execution risk - company struggling, fabs delayed'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Massive investment in mature nodes to dominate automotive, industrial chips. Will achieve 5nm indigenous capability within 3-5 years despite sanctions. Building alternative lithography approaches.',

    implications: 'AI chips are the ammunition of AI competition. Taiwan vulnerability is existential risk. Must have domestic leading-edge capacity for national security.',

    sources: [
      { title: 'CHIPS for America Implementation', url: 'https://www.chips.gov/', date: '2024' },
      { title: 'TSMC Arizona Announcement', url: 'https://pr.tsmc.com/', date: '2024-04' }
    ]
  },

  {
    id: 'packaging-advanced',
    domain: 'semiconductors',
    title: 'Advanced Chip Packaging',
    subtitle: 'CoWoS, chiplets, and 3D stacking for AI chips',

    usCurrentState: 'Virtually no advanced packaging capacity. TSMC CoWoS in Taiwan constrains NVIDIA H100/H200 production. Intel, AMD developing alternatives but scaling slowly.',
    usMetric: '<5% global advanced packaging, mostly in Taiwan',

    chinaCurrentState: 'Investing heavily in domestic packaging. OSAT companies expanding. Can\'t access leading-edge chips so optimizing packaging of available chips.',
    chinaMetric: 'Growing domestic OSAT, still behind Taiwan',

    gapDescription: 'Advanced packaging is the new bottleneck. Every AI accelerator needs CoWoS or equivalent. TSMC owns 90%+ of capacity in Taiwan. US building zero advanced packaging domestically. This is the hidden constraint on AI scaling.',
    gapSeverity: 'severe',
    timeToClose: '3-5 years',

    usTargets: [
      {
        target: 'Domestic advanced packaging capability',
        source: 'CHIPS Act R&D priorities',
        deadline: '2030',
        progress: 10
      }
    ],

    currentInitiatives: [
      {
        name: 'CHIPS NAPMP (Packaging Program)',
        type: 'federal',
        investment: '$3B',
        status: 'Funding announced, building facilities'
      },
      {
        name: 'Intel Advanced Packaging',
        type: 'private',
        investment: 'Part of $100B plan',
        status: 'Foveros, EMIB tech development'
      },
      {
        name: 'TSMC Arizona Packaging',
        type: 'private',
        investment: 'Considering',
        status: 'Not yet committed'
      }
    ],

    unaddressedNeeds: [
      'No CoWoS capacity outside Taiwan',
      'Equipment supply chain concentrated in Asia',
      'Workforce for precision packaging operations',
      'R&D for next-gen packaging (glass substrates, photonics)',
      'Testing and validation infrastructure'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Building domestic packaging capacity aggressively as chips are node-limited. May lead in some packaging technologies.',

    implications: 'Can\'t build AI chips without packaging. Taiwan is single point of failure. Must build domestic advanced packaging parallel to fabs.',

    sources: [
      { title: 'CHIPS NAPMP Announcement', url: 'https://www.chips.gov/napmp', date: '2024-02' }
    ]
  },

  // ============================================
  // CRITICAL MINERALS & SUPPLY CHAIN
  // ============================================
  {
    id: 'rare-earth-processing',
    domain: 'minerals',
    title: 'Rare Earth Processing Capacity',
    subtitle: 'Refining rare earths for magnets, batteries, electronics',

    usCurrentState: 'One rare earth mine (MP Materials, Mountain Pass). Zero domestic processing - ore shipped to China for refining. One magnet factory (MP) under construction. 80%+ rare earth imports from China.',
    usMetric: 'Mining: 15% global, Processing: <5%, Magnets: <1%',

    chinaCurrentState: 'Dominates entire supply chain. 60% of mining, 90% of processing, 90% of magnet production. Can restrict exports at will (did in 2010 vs Japan).',
    chinaMetric: '60% mining, 90% processing, 90% magnets',

    gapDescription: 'China controls rare earth processing globally. US mines ore but ships to China. Every EV motor, wind turbine, military system needs rare earth magnets. Single point of failure for entire energy transition and defense industrial base.',
    gapSeverity: 'critical',
    timeToClose: '10+ years',

    usTargets: [
      {
        target: 'Domestic processing of critical minerals',
        source: 'DOE Critical Minerals Strategy',
        deadline: '2030',
        progress: 15
      },
      {
        target: 'Reduce import dependence for critical minerals',
        source: 'Executive Order 14017',
        deadline: 'Ongoing',
        progress: 20
      }
    ],

    currentInitiatives: [
      {
        name: 'MP Materials Mountain Pass',
        type: 'private',
        investment: '$700M+ expansion',
        status: 'Mining operational, processing expansion underway'
      },
      {
        name: 'MP Materials Magnets Facility (TX)',
        type: 'public-private',
        investment: '$700M (DOE loan)',
        status: 'Under construction, 2025 target'
      },
      {
        name: 'DOE Critical Minerals Processing',
        type: 'federal',
        investment: '$3B (BIL)',
        status: 'Grants for processing facilities'
      },
      {
        name: 'Lynas (Australia) Texas Processing',
        type: 'public-private',
        investment: '$258M DOE',
        status: 'Rare earth separation facility, operational 2025'
      }
    ],

    unaddressedNeeds: [
      'Heavy rare earth separation (dysprosium, terbium) - zero US capacity',
      'Full magnet supply chain - still years away',
      'Recycling infrastructure for rare earth recovery',
      'Environmental permitting for processing (toxic chemicals involved)',
      'Workforce for specialty chemical operations',
      'Alternative chemistries to reduce rare earth dependence'
    ],

    chinaTrend: 'steady',
    chinaProjection: 'Maintaining dominance, acquiring mines globally. Will retain processing control as strategic leverage.',

    implications: 'Energy transition depends on rare earths. If China restricts supply, EV production, wind deployment, defense production all halt. Must build full domestic supply chain.',

    sources: [
      { title: 'DOE Critical Minerals Assessment', url: 'https://www.energy.gov/eere/critical-minerals', date: '2024' },
      { title: 'MP Materials Investor Presentations', url: 'https://mpmaterials.com/', date: '2024' }
    ]
  },

  {
    id: 'battery-supply-chain',
    domain: 'minerals',
    title: 'Battery Manufacturing Supply Chain',
    subtitle: 'Lithium-ion cells and EV batteries',

    usCurrentState: 'Rapid buildout: 13+ gigafactories announced. But material inputs (lithium, graphite, cathode, anode) still largely imported. CATL, LG, SK partnerships bringing technology but also dependency.',
    usMetric: '~100 GWh/year capacity, targeting 1,000+ GWh by 2030',

    chinaCurrentState: 'CATL and BYD dominate globally. 75%+ of global cell production. Control lithium processing, graphite (99%), cathode/anode materials. Full vertical integration.',
    chinaMetric: '75%+ global cell production, dominant material processing',

    gapDescription: 'US building cell factories but China controls inputs. Graphite is 99% China-dependent. Cathode/anode materials largely imported. IRA incentives driving buildout but supply chain vulnerability remains.',
    gapSeverity: 'severe',
    timeToClose: '5-10 years',

    usTargets: [
      {
        target: 'Domestic battery supply chain for 50% of EVs',
        source: 'IRA Requirements',
        deadline: '2030',
        progress: 20
      },
      {
        target: '1,000+ GWh annual battery capacity',
        source: 'Industry targets',
        deadline: '2030',
        progress: 10
      }
    ],

    currentInitiatives: [
      {
        name: 'Panasonic Kansas Gigafactory',
        type: 'private',
        investment: '$4B',
        status: 'Operational 2025'
      },
      {
        name: 'LG/Honda Ohio Battery Plant',
        type: 'private',
        investment: '$4.4B',
        status: 'Under construction, 2025'
      },
      {
        name: 'Ford BlueOval Battery Parks',
        type: 'private',
        investment: '$11B (TN, KY)',
        status: 'Under construction, scaled back'
      },
      {
        name: 'Tesla Nevada/Texas Expansion',
        type: 'private',
        investment: '$10B+',
        status: 'Ongoing expansion'
      },
      {
        name: 'DOE Loan Programs Office Battery',
        type: 'federal',
        investment: '$10B+',
        status: 'Multiple loans issued'
      }
    ],

    unaddressedNeeds: [
      'Graphite supply - 99% China, zero US processing at scale',
      'Lithium refining - most still processed in China',
      'Manganese supply chain',
      'Cobalt alternatives (reducing dependence)',
      'Solid-state battery commercialization',
      'Battery recycling infrastructure',
      'Sodium-ion battery development for grid storage'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Maintaining dominance through cost advantage and vertical integration. Exporting battery technology globally.',

    implications: 'EV transition depends on batteries. Grid storage for renewables depends on batteries. China controls the battery supply chain - vulnerability extends beyond auto to entire energy system.',

    sources: [
      { title: 'DOE Battery Supply Chain Report', url: 'https://www.energy.gov/eere/vehicles/batteries', date: '2024' }
    ]
  },

  // ============================================
  // TALENT & WORKFORCE
  // ============================================
  {
    id: 'stem-workforce',
    domain: 'talent',
    title: 'STEM and AI Workforce',
    subtitle: 'Engineers, scientists, and AI researchers',

    usCurrentState: 'Strong AI research base but 65% of AI PhDs are foreign-born, many return home. Semiconductor workforce aging, insufficient new graduates. Immigration system limits retention.',
    usMetric: '~25% of AI researchers globally, but declining share',

    chinaCurrentState: 'Massive STEM graduation pipeline - 5x US engineering graduates. State programs to recruit overseas talent. Aggressive AI researcher training.',
    chinaMetric: '~50% of AI researchers globally by 2025 projections',

    gapDescription: 'US trains world-class AI researchers but immigration system forces many to leave. China graduating far more STEM workers. Semiconductor workforce (average age 50) retiring without replacements. Critical shortage across nuclear, grid, AI fields.',
    gapSeverity: 'severe',
    timeToClose: '10+ years',

    usTargets: [
      {
        target: 'Train 50,000 semiconductor workers by 2030',
        source: 'CHIPS Workforce Goals',
        deadline: '2030',
        progress: 15
      },
      {
        target: 'Double AI research capacity',
        source: 'National AI Initiative',
        deadline: '2030',
        progress: 30
      }
    ],

    currentInitiatives: [
      {
        name: 'CHIPS Workforce Development',
        type: 'federal',
        investment: '$500M',
        status: 'Programs launching'
      },
      {
        name: 'NSF AI Institutes',
        type: 'federal',
        investment: '$220M',
        status: '25 institutes operational'
      },
      {
        name: 'DOE Nuclear Workforce Programs',
        type: 'federal',
        investment: '$150M',
        status: 'University partnerships'
      }
    ],

    unaddressedNeeds: [
      'Immigration reform to retain STEM graduates',
      'Skilled trades training for construction/operations',
      'Nuclear operator training capacity',
      'OT/ICS security specialist pipeline (<1,000 nationally)',
      'K-12 STEM education investment',
      'Salaries competitive with tech industry'
    ],

    chinaTrend: 'accelerating',
    chinaProjection: 'Will have majority of global AI researchers by 2030 if current trends continue. Domestic talent retention plus diaspora recruitment.',

    implications: 'Technology competition is talent competition. US innovation advantage depends on attracting and retaining global talent. Immigration policy is technology policy.',

    sources: [
      { title: 'MacroPolo AI Talent Tracker', url: 'https://macropolo.org/digital-projects/the-global-ai-talent-tracker/', date: '2024' }
    ]
  }
];

// Domain Summaries
export const DOMAIN_SUMMARIES: DomainSummary[] = [
  {
    domain: 'power',
    label: 'Power Generation',
    icon: '⚡',
    usScore: 35,
    chinaScore: 75,
    overallGap: 'losing',
    criticalPath: 'Restart existing nuclear + deploy SMRs + streamline permitting'
  },
  {
    domain: 'grid',
    label: 'Grid Infrastructure',
    icon: '🔌',
    usScore: 40,
    chinaScore: 80,
    overallGap: 'losing',
    criticalPath: 'Federal transmission authority + accelerated permitting + HVDC deployment'
  },
  {
    domain: 'compute',
    label: 'AI Compute',
    icon: '🖥️',
    usScore: 70,
    chinaScore: 50,
    overallGap: 'leading',
    criticalPath: 'Solve power constraint + maintain chip advantage + accelerate buildout'
  },
  {
    domain: 'semiconductors',
    label: 'Semiconductors',
    icon: '🔬',
    usScore: 45,
    chinaScore: 55,
    overallGap: 'behind',
    criticalPath: 'Execute CHIPS fabs on time + advanced packaging + workforce'
  },
  {
    domain: 'minerals',
    label: 'Critical Minerals',
    icon: '⛏️',
    usScore: 15,
    chinaScore: 85,
    overallGap: 'losing',
    criticalPath: 'Domestic processing capacity + ally partnerships + recycling'
  },
  {
    domain: 'talent',
    label: 'Workforce',
    icon: '👷',
    usScore: 55,
    chinaScore: 65,
    overallGap: 'behind',
    criticalPath: 'Immigration reform + STEM pipeline + skilled trades training'
  }
];

// Calculate overall competition status
export function getOverallCompetitivePosition() {
  const totalUS = DOMAIN_SUMMARIES.reduce((sum, d) => sum + d.usScore, 0);
  const totalChina = DOMAIN_SUMMARIES.reduce((sum, d) => sum + d.chinaScore, 0);

  return {
    usAverage: Math.round(totalUS / DOMAIN_SUMMARIES.length),
    chinaAverage: Math.round(totalChina / DOMAIN_SUMMARIES.length),
    gap: Math.round((totalChina - totalUS) / DOMAIN_SUMMARIES.length),
    criticalGaps: DOMAIN_SUMMARIES.filter(d => d.overallGap === 'losing'),
    competitiveAreas: DOMAIN_SUMMARIES.filter(d => d.overallGap === 'leading' || d.overallGap === 'competitive')
  };
}

// Link gaps to opportunities
export interface GapOpportunityLink {
  gapId: string;
  opportunityIds: string[];
  addressedPercent: number; // How much of the gap do current opportunities address?
}

export const GAP_OPPORTUNITY_LINKS: GapOpportunityLink[] = [
  {
    gapId: 'nuclear-capacity',
    opportunityIds: ['nuscale-smr', 'tmi-restart', 'vogtle-expansion', 'terrapower-natrium'],
    addressedPercent: 15
  },
  {
    gapId: 'nuclear-fuel-supply',
    opportunityIds: ['centrus-haleu'],
    addressedPercent: 10
  },
  {
    gapId: 'grid-transmission',
    opportunityIds: ['doe-grip-r2', 'sunzia', 'grain-belt'],
    addressedPercent: 20
  },
  {
    gapId: 'grid-security',
    opportunityIds: ['nerc-cip-utilities', 'doe-ceser'],
    addressedPercent: 25
  },
  {
    gapId: 'datacenter-capacity',
    opportunityIds: ['stargate', 'microsoft-dc', 'aws-dc', 'google-dc'],
    addressedPercent: 40
  },
  {
    gapId: 'leading-edge-fabs',
    opportunityIds: ['tsmc-arizona', 'intel-ohio', 'samsung-taylor'],
    addressedPercent: 25
  },
  {
    gapId: 'battery-supply-chain',
    opportunityIds: ['panasonic-kansas', 'ford-blueoval', 'lg-honda-ohio'],
    addressedPercent: 30
  },
  {
    gapId: 'rare-earth-processing',
    opportunityIds: ['mp-materials-magnets', 'lynas-texas'],
    addressedPercent: 15
  }
];
