import { Opportunity } from './types';

// Comprehensive opportunity database with real detail
// Organized by Genesis pillar - everything connects to the AI buildout

export const OPPORTUNITIES: Opportunity[] = [
  // ============================================
  // AI COMPUTE PILLAR - Data Centers
  // ============================================
  {
    id: 'stargate-phase1',
    title: 'Stargate AI Infrastructure - Phase 1',
    subtitle: '$100B joint venture for AI compute infrastructure, starting in Texas',

    genesisPillar: 'ai-compute',
    genesisConnection: 'The centerpiece of Genesis. Stargate is the single largest AI infrastructure investment ever announced. Phase 1 in Abilene will require massive OT security for power distribution, cooling, and physical security integration.',

    entity: 'Stargate LLC (OpenAI, SoftBank, Oracle, MGX)',
    entityType: 'enterprise',
    sector: 'data-centers',
    location: 'Abilene',
    state: 'TX',

    estimatedValue: 100_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private (SoftBank $100B commitment)',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-15',
    keyDateDescription: 'Phase 1 site preparation complete, security vendor selection begins',
    postedDate: '2025-01-21',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'bms', 'ems', 'hmi'],
    otScope: `Critical OT security requirements:
- Campus-wide SCADA for 1.2GW power distribution
- Building Management Systems across multiple facilities
- Energy Management System integration with ERCOT grid
- Physical security/access control integration with cyber
- Cooling system controls (likely liquid cooling for AI chips)
- Generator and UPS control systems
- Fire suppression system integration`,
    regulatoryDrivers: ['executive-order'],
    complianceRequirements: 'Executive Order 14110 AI security requirements. Texas PUC reliability standards. Custom security framework likely given national security implications.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'soc-integration'],
    deloitteAngle: 'Deloitte has relationships across all JV partners. Can position as neutral integrator for security architecture spanning Oracle cloud, SoftBank infrastructure, and OpenAI requirements. National security clearance capability is differentiator.',
    existingRelationship: 'some',

    likelyPrimes: ['Oracle', 'Fluor', 'Jacobs'],
    competitors: ['Accenture Federal', 'Booz Allen', 'Dragos'],
    partnerOpportunities: ['Claroty', 'Nozomi Networks', 'Fortinet'],

    sources: [
      { title: 'Stargate Announcement - OpenAI', url: 'https://openai.com/index/announcing-the-stargate-project/', date: '2025-01-21' },
      { title: 'White House Briefing', url: 'https://www.whitehouse.gov/', date: '2025-01-21' }
    ],

    gapsAddressed: ['datacenter-capacity', 'grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Highest priority target. Get in front of Oracle and SoftBank infrastructure teams immediately. This will set the template for all subsequent AI infrastructure security.'
  },

  {
    id: 'microsoft-stargate-dc',
    title: 'Microsoft AI Data Center Expansion',
    subtitle: '$80B AI infrastructure buildout through 2025, multiple sites',

    genesisPillar: 'ai-compute',
    genesisConnection: 'Microsoft is building parallel AI infrastructure to support Azure AI and Copilot. Massive global buildout with significant US footprint. Interconnects with their nuclear power strategy.',

    entity: 'Microsoft',
    entityType: 'enterprise',
    sector: 'data-centers',
    location: 'Multiple (WI, GA, IN, WY)',
    state: 'US',

    estimatedValue: 80_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Wisconsin campus Phase 2 security RFP expected',
    postedDate: '2024-11-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['bms', 'ems', 'scada', 'hmi'],
    otScope: `OT security across multiple greenfield sites:
- Building automation (Honeywell/JCI systems likely)
- Power distribution and UPS controls
- Liquid cooling systems for GPU clusters
- Integration with renewable energy sources
- Campus security systems`,
    regulatoryDrivers: ['executive-order'],
    complianceRequirements: 'Azure compliance framework. SOC 2 Type II. ISO 27001. Executive Order 14110.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'soc-integration', 'vendor-risk'],
    deloitteAngle: 'Existing Microsoft relationship through commercial work. Can leverage Azure practice connections. Position OT security as extension of existing cyber relationship.',
    existingRelationship: 'strong',

    likelyPrimes: ['Microsoft internal', 'JLL', 'CBRE'],
    competitors: ['Accenture', 'PwC', 'EY'],
    partnerOpportunities: ['Claroty', 'Microsoft security partners'],

    sources: [
      { title: 'Microsoft FY25 Capex Guidance', url: 'https://microsoft.com/investor', date: '2024-10-30' }
    ],

    gapsAddressed: ['datacenter-capacity', 'grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Leverage existing Microsoft relationship. Coordinate with commercial Microsoft team. Data center security is a growth area for them.'
  },

  // ============================================
  // POWER PILLAR - Nuclear & Grid
  // ============================================
  {
    id: 'constellation-tmi',
    title: 'Three Mile Island Unit 1 Restart',
    subtitle: 'Microsoft-backed nuclear restart for AI data center power',

    genesisPillar: 'power',
    genesisConnection: 'Direct link to AI compute. Microsoft signed 20-year PPA specifically to power data centers. First major nuclear restart driven by AI power demand. Sets precedent for additional restarts.',

    entity: 'Constellation Energy',
    entityType: 'utility',
    sector: 'nuclear',
    location: 'Middletown',
    state: 'PA',

    estimatedValue: 1_600_000_000,
    contractType: 'direct',
    fundingSource: 'Private (Microsoft PPA)',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'NRC license amendment application expected',
    postedDate: '2024-09-20',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'sis', 'hmi', 'historian'],
    otScope: `Nuclear-grade OT security requirements:
- Distributed Control System (DCS) for reactor operations
- Safety Instrumented Systems (SIS) - safety critical
- Balance of plant SCADA systems
- Cybersecurity Assessment per 10 CFR 73.54
- Security plan update for NRC
- Physical-cyber security integration
- Digital I&C modernization likely needed`,
    regulatoryDrivers: ['nrc-cyber'],
    complianceRequirements: '10 CFR 73.54 Cyber Security Rule. NRC Regulatory Guide 5.71. NEI 08-09 template. Safety/security interface requirements.',

    deloitteServices: ['nuclear-cyber', 'ot-assessment', 'ics-architecture', 'incident-response'],
    deloitteAngle: 'Deloitte nuclear cyber team is one of few with NRC regulatory experience. Can support license amendment application cybersecurity sections. Previous Constellation work is leverage point.',
    existingRelationship: 'some',

    likelyPrimes: ['Constellation internal', 'Sargent & Lundy', 'Enercon'],
    competitors: ['INL', 'Sandia (for assessments)', 'Nuclear consultancies'],
    partnerOpportunities: ['Dragos', 'Claroty', 'Nuclear engineering firms'],

    sources: [
      { title: 'Microsoft-Constellation PPA Announcement', url: 'https://news.microsoft.com/', date: '2024-09-20' },
      { title: 'Constellation Investor Call', url: 'https://investors.constellationenergy.com/', date: '2024-09-20' }
    ],

    gapsAddressed: ['nuclear-capacity', 'datacenter-capacity'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'High-profile project. NRC will scrutinize cybersecurity closely given public attention on TMI. Position Deloitte as the safe choice for regulatory compliance.'
  },

  {
    id: 'nuscale-cfpp',
    title: 'NuScale VOYGR SMR - Carbon Free Power Project',
    subtitle: 'First US small modular reactor, Idaho National Laboratory',

    genesisPillar: 'power',
    genesisConnection: 'SMRs are the future of AI power. NuScale is first to market with NRC design certification. Success here enables rapid deployment for data center power nationwide.',

    entity: 'NuScale Power / UAMPS',
    entityType: 'utility',
    sector: 'nuclear',
    location: 'Idaho Falls',
    state: 'ID',

    estimatedValue: 5_300_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOE ARDP, IRA tax credits, UAMPS utilities',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'Cybersecurity program plan due to NRC',
    postedDate: '2024-01-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'sis', 'hmi', 'historian', 'ems'],
    otScope: `First-of-a-kind SMR requires comprehensive cyber program:
- Module Protection System (MPS) - safety critical digital I&C
- NuScale Automation Platform (NAP)
- Main Control Room digital systems
- Remote monitoring capabilities (unique to SMR)
- Multi-module coordination controls
- Grid integration controls
- Emergency response systems`,
    regulatoryDrivers: ['nrc-cyber', 'nerc-cip'],
    complianceRequirements: '10 CFR 73.54 full compliance. First SMR cyber program will set template for all future SMRs. NERC CIP for grid connection. DOE ARDP security requirements.',

    deloitteServices: ['nuclear-cyber', 'ics-architecture', 'ot-assessment', 'tabletop-exercises'],
    deloitteAngle: 'First SMR = first template. Whoever does the cyber program here will have the playbook for every future SMR (dozens planned). Long-term strategic value beyond this single project.',
    existingRelationship: 'none',

    likelyPrimes: ['Fluor', 'NuScale internal'],
    competitors: ['INL cyber team', 'Sandia', 'Nuclear consultancies'],
    partnerOpportunities: ['Idaho National Laboratory', 'Dragos'],

    sources: [
      { title: 'NuScale CFPP Update', url: 'https://www.nuscalepower.com/', date: '2025-01-15' },
      { title: 'DOE ARDP Award', url: 'https://www.energy.gov/', date: '2024-10-01' }
    ],

    gapsAddressed: ['nuclear-capacity', 'nuclear-fuel-supply'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Strategic importance exceeds contract value. This is about owning the SMR cyber market. Must pursue aggressively.'
  },

  {
    id: 'doe-grip-round3',
    title: 'DOE GRIP Round 3 - Grid Resilience',
    subtitle: '$2.2B for transmission and grid-enhancing technologies',

    genesisPillar: 'power',
    genesisConnection: 'Grid must expand and harden to support AI data center load. GRIP funds transmission upgrades that enable new data center connections. Every project requires NERC CIP.',

    entity: 'Department of Energy - Grid Deployment Office',
    entityType: 'federal',
    sector: 'grid',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 2_200_000_000,
    contractType: 'subcontract',
    fundingSource: 'Bipartisan Infrastructure Law',

    procurementStage: 'rfp-open',
    urgency: 'this-week',
    keyDate: '2026-02-28',
    keyDateDescription: 'Concept paper deadline',
    postedDate: '2025-01-08',
    responseDeadline: '2026-04-15',

    otRelevance: 'critical',
    otSystems: ['scada', 'ems', 'hmi', 'historian'],
    otScope: `All GRIP-funded projects must meet cybersecurity requirements:
- NERC CIP compliance for all bulk electric system assets
- Substation automation security
- Energy Management System (EMS) integration
- Grid-enhancing technology (GETs) cyber requirements
- SCADA system security assessments
- Vendor security requirements`,
    regulatoryDrivers: ['nerc-cip'],
    complianceRequirements: 'NERC CIP v7 minimum. DOE cybersecurity requirements for funded projects. Supply chain risk management (CIP-013).',

    deloitteServices: ['nerc-cip-compliance', 'ot-assessment', 'vendor-risk', 'ics-architecture'],
    deloitteAngle: 'Utilities receiving GRIP funds need NERC CIP help. Position as compliance partner for awardees. Work with transmission developers who are winning awards.',
    existingRelationship: 'some',

    likelyPrimes: ['Various utilities and transmission developers'],
    competitors: ['1898 & Co', 'Black & Veatch', 'Burns & McDonnell', 'Utility internal'],
    partnerOpportunities: ['Transmission developers', 'Grid technology vendors'],

    sources: [
      { title: 'GRIP Round 3 FOA', url: 'https://www.energy.gov/gdo/grid-resilience-and-innovation-partnerships-grip-program', date: '2025-01-08' }
    ],

    gapsAddressed: ['grid-transmission', 'grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Concept papers due end of February. Identify utilities likely to apply and offer NERC CIP support as part of their application.'
  },

  {
    id: 'ferc-interconnection-reform',
    title: 'FERC Large Load Interconnection Advisory',
    subtitle: 'Regulatory advisory for new DOE/FERC interconnection rules targeting data centers',

    genesisPillar: 'power',
    genesisConnection: 'The grid bottleneck is the binding constraint on AI growth. DOE is forcing FERC to accelerate large load interconnection - new rules mean new advisory opportunity on both utility and data center sides.',

    entity: 'FERC / DOE / PJM / Utilities / Hyperscalers',
    entityType: 'federal',
    sector: 'grid',
    location: 'National',
    state: 'US',

    estimatedValue: 50_000_000,
    contractType: 'direct',
    fundingSource: 'Client fees (utilities + data centers)',

    procurementStage: 'pre-solicitation',
    urgency: 'this-week',
    keyDate: '2026-04-30',
    keyDateDescription: 'FERC final rule deadline per DOE direction',
    postedDate: '2025-10-23',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['scada', 'ems', 'hmi'],
    otScope: `New interconnection arrangements require security architecture:
- Co-located generation + load configurations (new territory)
- Behind-the-meter generation integration
- Grid upgrade cost modeling and allocation
- State vs federal jurisdiction navigation
- Interconnection queue optimization
- Reliability impact analysis`,
    regulatoryDrivers: ['nerc-cip'],
    complianceRequirements: 'FERC Order 2023 interconnection reforms. New large load rules (>20MW) expected April 2026. 100% participant funding model for grid upgrades. State PUC coordination required.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'nerc-cip-compliance', 'network-segmentation'],
    deloitteAngle: 'Rules being written NOW. First movers who help shape implementation will own the market. GPS advises FERC/DOE, Commercial advises hyperscalers - same guidance, both sides. Classic Deloitte play.',
    existingRelationship: 'some',

    likelyPrimes: ['Self-perform advisory'],
    competitors: ['Brattle Group', 'ICF', 'ScottMadden', 'Law firms'],
    partnerOpportunities: ['Energy law firms', 'Grid consultancies'],

    sources: [
      { title: 'DOE Direction to FERC on Large Load Interconnection', url: 'https://www.energy.gov/articles/secretary-wright-acts-unleash-american-industry-and-innovation-newly-proposed-rules', date: '2025-10-23' },
      { title: 'FERC PJM Co-Location Order', url: 'https://www.ferc.gov/news-events/news/ferc-directs-nations-largest-grid-operator-create-new-rules-embrace-innovation-and', date: '2025-02-20' },
      { title: 'State Regulators Press FERC', url: 'https://www.eenews.net/articles/regulators-press-ferc-on-state-authority-as-trump-promotes-data-centers/', date: '2025-11-15' }
    ],

    gapsAddressed: ['grid-transmission', 'grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'HIGH PRIORITY: Rules being written now. Position with both FERC/DOE (GPS) and hyperscalers (Commercial) simultaneously. This is a market-making moment - whoever helps write the playbook owns the market for the next decade.'
  },

  {
    id: 'nerc-cip-015-insm',
    title: 'NERC CIP-015 Internal Network Security Monitoring',
    subtitle: 'New mandatory INSM requirements for utilities - first major CIP expansion since Volt Typhoon',

    genesisPillar: 'power',
    genesisConnection: 'Direct response to Volt Typhoon threat. Every utility with high/medium impact BES systems must implement internal network monitoring. Massive OT cyber opportunity.',

    entity: 'NERC / FERC / All BES Utilities',
    entityType: 'federal',
    sector: 'grid',
    location: 'National',
    state: 'US',

    estimatedValue: 75_000_000,
    contractType: 'direct',
    fundingSource: 'Utility compliance budgets',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-26',
    keyDateDescription: 'FERC deadline for NERC to expand CIP-015 to EACMS/PACS',
    postedDate: '2025-06-26',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'ems', 'hmi', 'historian'],
    otScope: `New internal network security monitoring requirements:
- Network traffic analysis for high/medium impact BES Cyber Systems
- Anomaly detection and alerting capabilities
- Integration with existing SOC/SIEM infrastructure
- EACMS and PACS monitoring (expansion by June 2026)
- Baseline traffic analysis and threat detection
- Compliance evidence and audit trail`,
    regulatoryDrivers: ['nerc-cip'],
    complianceRequirements: 'CIP-015-1 approved June 2025. Implementation: Oct 2028 for medium impact w/ ERC, Oct 2030 for control centers. FERC directed expansion to EACMS/PACS by June 2026.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'soc-integration', 'network-segmentation'],
    deloitteAngle: 'This is the biggest NERC CIP expansion in years - direct response to Volt Typhoon. Every utility needs help. First movers who build the implementation playbook will dominate. OT SOC integration is the key differentiator.',
    existingRelationship: 'some',

    likelyPrimes: ['Self-perform'],
    competitors: ['Dragos', '1898 & Co', 'Claroty', 'Industrial Defender'],
    partnerOpportunities: ['Claroty', 'Nozomi Networks', 'Dragos'],

    sources: [
      { title: 'FERC Order 907 - CIP-015-1 Approval', url: 'https://www.federalregister.gov/documents/2025/07/02/2025-12309/critical-infrastructure-protection-reliability-standard-cip-015-1-cyber-security-internal-network', date: '2025-06-26' },
      { title: 'NERC CIP 2026 Updates', url: 'https://www.certrec.com/blog/most-significant-nerc-cip-updates-for-2026/', date: '2025-12-01' }
    ],

    gapsAddressed: ['grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Volt Typhoon response. Every utility with high/medium BES systems needs this. Build the implementation methodology NOW - compliance deadlines are 2028/2030 but planning starts immediately.'
  },

  {
    id: 'nrc-licensing-reform',
    title: 'NRC Licensing Reform Advisory (EO 14300)',
    subtitle: '18-month licensing timelines, NRC reorganization - nuclear renaissance acceleration',

    genesisPillar: 'power',
    genesisConnection: 'Nuclear is critical for AI data center baseload. EO 14300 slashes licensing from 5-7 years to 18 months. SMR developers and data center buyers need guidance on the new process.',

    entity: 'NRC / SMR Developers / Data Center Operators',
    entityType: 'federal',
    sector: 'nuclear',
    location: 'National',
    state: 'US',

    estimatedValue: 40_000_000,
    contractType: 'direct',
    fundingSource: 'Client fees (developers + buyers)',

    procurementStage: 'pre-solicitation',
    urgency: 'this-month',
    keyDate: '2026-02-23',
    keyDateDescription: 'NRC short-term EO 14300 implementation deadline',
    postedDate: '2025-05-23',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['dcs', 'sis', 'hmi'],
    otScope: `New licensing process creates cyber requirements shift:
- Accelerated cybersecurity program development
- 10 CFR Part 53 framework for advanced reactors
- Cyber requirements for SMR designs
- NRC cyber review process optimization
- Digital I&C security for new reactor types`,
    regulatoryDrivers: ['nrc-cyber'],
    complianceRequirements: 'EO 14300 mandates 18-month max licensing. NRC short-term actions by Feb 2026, medium-term by Nov 2026. 10 CFR Part 53 finalization by end of 2027.',

    deloitteServices: ['nuclear-cyber', 'ics-architecture', 'ot-assessment', 'tabletop-exercises'],
    deloitteAngle: 'NRC is reorganizing around speed. Developers who can navigate the new process fastest win. Deloitte can advise both sides - help NRC implement reforms (GPS) and help developers/buyers navigate them (Commercial/ER&I).',
    existingRelationship: 'some',

    likelyPrimes: ['Self-perform advisory'],
    competitors: ['Nuclear consultancies', 'Law firms', 'NEI'],
    partnerOpportunities: ['Nuclear law firms', 'Reactor vendors'],

    sources: [
      { title: 'NRC Reorganization Announcement', url: 'https://www.powermag.com/nrc-launches-major-reorganization-as-licensing-deadlines-and-reform-workload-intensify/', date: '2026-01-08' },
      { title: 'NRC Rule Changes for EO', url: 'https://www.ans.org/news/2025-12-11/article-7613/nrc-proposes-rule-changes-in-response-to-eo/', date: '2025-12-11' }
    ],

    gapsAddressed: ['nuclear-capacity'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Nuclear renaissance is happening. NRC reorganized around speed. 22 GW of SMR projects in development. Whoever owns the new licensing playbook owns the market.'
  },

  {
    id: 'datacenter-permitting-eo',
    title: 'Federal Data Center Permitting Program',
    subtitle: 'EO streamlining federal land and permitting for AI data centers',

    genesisPillar: 'ai-compute',
    genesisConnection: 'Direct federal support for AI infrastructure buildout. Federal land access, streamlined NEPA, coordinated permitting. Hyperscalers need help navigating new federal pathways.',

    entity: 'DOE / DOI / GSA / Hyperscalers',
    entityType: 'federal',
    sector: 'data-centers',
    location: 'National',
    state: 'US',

    estimatedValue: 60_000_000,
    contractType: 'direct',
    fundingSource: 'Client fees + federal support',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'First federal land designations expected',
    postedDate: '2025-07-23',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['bms', 'scada', 'ems'],
    otScope: `Federal pathway creates new requirements:
- NEPA compliance under new streamlined process
- Federal facility security requirements
- Critical infrastructure designation implications
- Multi-agency coordination (DOE, DOI, GSA)
- National security review for AI facilities`,
    regulatoryDrivers: ['executive-order'],
    complianceRequirements: 'July 2025 EO on data center permitting. Streamlined NEPA, federal land access, coordinated agency review. National security requirements for AI projects.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'soc-integration'],
    deloitteAngle: 'Hyperscalers want speed. Federal pathway is faster but unfamiliar. Deloitte can guide through multi-agency process while ensuring security architecture meets federal requirements from day one.',
    existingRelationship: 'strong',

    likelyPrimes: ['Self-perform'],
    competitors: ['Accenture Federal', 'McKinsey', 'BCG'],
    partnerOpportunities: ['Federal real estate firms', 'Environmental consultancies'],

    sources: [
      { title: 'Trump Data Center EO', url: 'https://www.gtlaw.com/en/insights/2025/7/trump-administration-seeks-to-streamline-federal-permitting-for-data-centers-with-new-executive-order-and-action-plan', date: '2025-07-23' },
      { title: 'White & Case Analysis', url: 'https://www.whitecase.com/insight-alert/trump-administration-issues-executive-order-streamline-data-center-development', date: '2025-07-25' }
    ],

    gapsAddressed: ['datacenter-capacity'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Federal fast-track for AI data centers. Hyperscalers will use this. Position as the guide through the new federal process.'
  },

  {
    id: 'nerc-cip-virtualization',
    title: 'NERC CIP Virtualization/Cloud Standards',
    subtitle: 'First-ever cloud and virtualization rules for bulk electric system OT',

    genesisPillar: 'power',
    genesisConnection: 'Utilities modernizing to cloud/virtual infrastructure need compliant security architecture. First time NERC CIP addresses virtualization - new territory for everyone.',

    entity: 'NERC / FERC / Cloud-adopting Utilities',
    entityType: 'federal',
    sector: 'grid',
    location: 'National',
    state: 'US',

    estimatedValue: 45_000_000,
    contractType: 'direct',
    fundingSource: 'Utility modernization budgets',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'CIP-003-9 effective date (expanded governance for low-impact)',
    postedDate: '2025-09-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'ems', 'hmi', 'historian'],
    otScope: `New virtualization/cloud compliance requirements:
- 11 modified CIP standards for virtualization
- Cloud-based OT security architecture
- Virtual machine segmentation and monitoring
- Hypervisor security requirements
- Cloud vendor risk management
- Hybrid on-prem/cloud compliance`,
    regulatoryDrivers: ['nerc-cip'],
    complianceRequirements: 'FERC proposed approving 11 modified CIP standards for virtualization. CIP-003-9 effective April 2026. First cloud-based OT allowed in BES.',

    deloitteServices: ['ics-architecture', 'ot-assessment', 'vendor-risk', 'network-segmentation'],
    deloitteAngle: 'Utilities want cloud benefits but fear compliance risk. Deloitte can design compliant cloud/hybrid architectures. First mover advantage - no established playbook exists for NERC CIP in cloud.',
    existingRelationship: 'some',

    likelyPrimes: ['Self-perform'],
    competitors: ['Cloud providers (AWS/Azure/GCP)', '1898 & Co', 'Accenture'],
    partnerOpportunities: ['AWS', 'Microsoft Azure', 'Google Cloud'],

    sources: [
      { title: 'NERC CIP 2026 Virtualization Updates', url: 'https://www.certrec.com/blog/most-significant-nerc-cip-updates-for-2026/', date: '2025-12-01' },
      { title: 'CIP Standards Evolution', url: 'https://www.industrialdefender.com/blog/what-is-nerc-cip', date: '2025-10-15' }
    ],

    gapsAddressed: ['grid-security'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Cloud for OT is happening. Utilities need help doing it compliantly. Build the NERC CIP cloud architecture methodology before competitors.'
  },

  {
    id: 'ercot-grid-security',
    title: 'ERCOT Grid Security Enhancement Program',
    subtitle: 'Texas grid hardening post-Winter Storm, AI load growth',

    genesisPillar: 'power',
    genesisConnection: 'Texas is ground zero for AI data center growth (Stargate, Meta, AWS, Google). ERCOT must harden grid to support massive new load while preventing Winter Storm Uri repeat.',

    entity: 'ERCOT / Texas PUC',
    entityType: 'state-local',
    sector: 'grid',
    location: 'Texas-wide',
    state: 'TX',

    estimatedValue: 500_000_000,
    contractType: 'direct',
    fundingSource: 'Texas ratepayers, federal grants',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-05-01',
    keyDateDescription: 'PUC security rulemaking expected',
    postedDate: '2024-12-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['ems', 'scada', 'hmi', 'historian'],
    otScope: `ERCOT-wide security improvements:
- Energy Management System (EMS) security hardening
- Market systems cybersecurity
- Generator interconnection security requirements
- Substation security standards
- Weather-related resilience (freeze protection controls)
- Data center interconnection security standards`,
    regulatoryDrivers: ['nerc-cip', 'executive-order'],
    complianceRequirements: 'NERC CIP plus Texas-specific requirements. PUC weatherization rules with cyber components. New data center interconnection standards.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'nerc-cip-compliance', 'incident-response'],
    deloitteAngle: 'Texas nexus with Stargate creates opportunity. Position as advisor who understands both grid operations and data center requirements. PUC relationship is key.',
    existingRelationship: 'none',

    likelyPrimes: ['ERCOT internal', 'Grid consultants'],
    competitors: ['1898 & Co', 'Black & Veatch', 'West Monroe'],
    partnerOpportunities: ['Texas utilities', 'Data center developers'],

    sources: [
      { title: 'Texas PUC Grid Reliability Docket', url: 'https://www.puc.texas.gov/', date: '2024-12-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'likely',
    notes: 'Watch PUC dockets closely. Data center-grid interconnection is emerging issue. Position as bridge between utility and tech worlds.'
  },

  // ============================================
  // SEMICONDUCTORS PILLAR - Fabs
  // ============================================
  {
    id: 'tsmc-arizona-p2',
    title: 'TSMC Arizona Fab 2 & 3',
    subtitle: '$65B investment, 2nm and 3nm production',

    genesisPillar: 'semiconductors',
    genesisConnection: 'TSMC fabs produce the advanced chips that power AI. Without domestic fab capacity, Genesis depends on Taiwan. This is existential for US AI ambitions.',

    entity: 'TSMC Arizona',
    entityType: 'enterprise',
    sector: 'semiconductors',
    location: 'Phoenix',
    state: 'AZ',

    estimatedValue: 65_000_000_000,
    contractType: 'direct',
    fundingSource: 'CHIPS Act ($6.6B), private',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'Fab 2 equipment installation security requirements finalized',
    postedDate: '2024-04-08',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'mes', 'scada', 'hmi', 'sis'],
    otScope: `Semiconductor fab OT security is uniquely complex:
- Manufacturing Execution System (MES) - recipe management, wafer tracking
- Process control systems for lithography, etching, deposition
- Cleanroom environmental controls (HVAC, particle monitoring)
- Chemical delivery systems (toxic gases, acids)
- Ultra-pure water systems
- Fab-wide SCADA integration
- Safety Instrumented Systems for hazardous processes
- Intellectual property protection (process recipes are crown jewels)`,
    regulatoryDrivers: ['cmmc', 'cfats', 'executive-order'],
    complianceRequirements: 'CHIPS Act security requirements (CHIPS R&D). CFATS for chemical handling. Likely classified work = CMMC requirements. IP protection mandates.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'Fab security is deeply specialized. Position Deloitte as the firm that understands both semiconductor manufacturing AND security. Few competitors have both.',
    existingRelationship: 'none',

    likelyPrimes: ['TSMC internal', 'Bechtel (construction)', 'M+W Group'],
    competitors: ['Semiconductor consultancies', 'Applied Materials ecosystem'],
    partnerOpportunities: ['Dragos', 'Claroty', 'Fab equipment vendors'],

    sources: [
      { title: 'CHIPS Act Award - TSMC', url: 'https://www.commerce.gov/', date: '2024-04-08' },
      { title: 'TSMC Arizona Update', url: 'https://pr.tsmc.com/', date: '2025-01-15' }
    ],

    gapsAddressed: ['leading-edge-fabs', 'packaging-advanced'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'TSMC culture is insular. Need warm introduction. Explore CHIPS Program Office as entry point - they care about security of funded projects.'
  },

  {
    id: 'intel-ohio',
    title: 'Intel Ohio Fab Complex',
    subtitle: '$28B for two leading-edge fabs, largest private investment in Ohio history',

    genesisPillar: 'semiconductors',
    genesisConnection: 'Intel fabs for advanced packaging and logic chips. Critical for AI chip production independence. CHIPS Act flagship project.',

    entity: 'Intel Corporation',
    entityType: 'enterprise',
    sector: 'semiconductors',
    location: 'New Albany',
    state: 'OH',

    estimatedValue: 28_000_000_000,
    contractType: 'direct',
    fundingSource: 'CHIPS Act ($8.5B), private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'Phase 1 fab security systems RFP',
    postedDate: '2024-03-20',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'mes', 'scada', 'hmi', 'sis', 'bms'],
    otScope: `Two fabs plus advanced packaging facility:
- Manufacturing Execution Systems integration
- Process control for EUV lithography
- Cleanroom and subfab controls
- Chemical and gas delivery systems
- Ultra-pure water treatment
- Waste treatment facilities
- Campus-wide building management
- Security Operations Center integration`,
    regulatoryDrivers: ['cmmc', 'cfats', 'executive-order'],
    complianceRequirements: 'CHIPS Act security requirements. Defense production = CMMC likely. CFATS for chemical facilities. Ohio environmental permits.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'soc-integration', 'vendor-risk'],
    deloitteAngle: 'Deloitte has existing Intel relationship through commercial cyber. Leverage to position for OT work. Intel is more accessible than TSMC.',
    existingRelationship: 'strong',

    likelyPrimes: ['Intel internal', 'Construction JV'],
    competitors: ['Accenture', 'Intel internal security'],
    partnerOpportunities: ['Claroty', 'Honeywell', 'Intel ecosystem'],

    sources: [
      { title: 'CHIPS Act Award - Intel', url: 'https://www.commerce.gov/', date: '2024-03-20' },
      { title: 'Intel Ohio Update', url: 'https://www.intel.com/ohio', date: '2025-01-10' }
    ],

    gapsAddressed: ['leading-edge-fabs', 'packaging-advanced', 'stem-workforce'],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Use existing Intel relationship. Construction delays create opportunity - they need to catch up and may accelerate procurement.'
  },

  {
    id: 'samsung-taylor',
    title: 'Samsung Taylor Fab',
    subtitle: '$17B advanced logic fab, CHIPS Act funding',

    genesisPillar: 'semiconductors',
    genesisConnection: 'Samsung foundry for US customers. Reduces Taiwan dependency for AI chip production. Part of CHIPS Act strategy.',

    entity: 'Samsung Electronics',
    entityType: 'enterprise',
    sector: 'semiconductors',
    location: 'Taylor',
    state: 'TX',

    estimatedValue: 17_000_000_000,
    contractType: 'direct',
    fundingSource: 'CHIPS Act ($6.4B), private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-15',
    keyDateDescription: 'Security vendor evaluations ongoing',
    postedDate: '2024-04-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'mes', 'scada', 'hmi'],
    otScope: `Leading-edge logic fab:
- Samsung proprietary MES
- Process control systems
- Cleanroom environmental controls
- Chemical/gas delivery
- Water treatment
- Fab-wide integration`,
    regulatoryDrivers: ['cmmc', 'cfats'],
    complianceRequirements: 'CHIPS Act security. CFATS likely. Korean security standards may also apply.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk'],
    deloitteAngle: 'Samsung US entity more accessible than Korean HQ. Focus on US compliance requirements as entry point.',
    existingRelationship: 'none',

    likelyPrimes: ['Samsung internal', 'Construction contractors'],
    competitors: ['Korean consultancies', 'Big 4'],
    partnerOpportunities: ['US security vendors'],

    sources: [
      { title: 'CHIPS Act Award - Samsung', url: 'https://www.commerce.gov/', date: '2024-04-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Korean company culture - relationships matter. Find Korean-American team members or partners.'
  },

  {
    id: 'micron-idaho',
    title: 'Micron Idaho Memory Fab',
    subtitle: '$15B DRAM expansion, first new US memory fab in 20 years',

    genesisPillar: 'semiconductors',
    genesisConnection: 'Memory is critical for AI - models require massive DRAM. US has zero domestic memory production. This is strategic independence.',

    entity: 'Micron Technology',
    entityType: 'enterprise',
    sector: 'semiconductors',
    location: 'Boise',
    state: 'ID',

    estimatedValue: 15_000_000_000,
    contractType: 'direct',
    fundingSource: 'CHIPS Act ($6.1B), private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-05-01',
    keyDateDescription: 'Cleanroom construction phase - OT systems procurement',
    postedDate: '2024-04-25',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'mes', 'scada', 'hmi'],
    otScope: `DRAM fabrication facility:
- Memory-specific process control
- High-volume manufacturing systems
- Cleanroom controls
- Chemical systems
- Existing Boise infrastructure integration`,
    regulatoryDrivers: ['cmmc', 'cfats'],
    complianceRequirements: 'CHIPS Act security. CFATS. Memory is defense-critical = CMMC likely.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation'],
    deloitteAngle: 'Micron HQ in Boise. Local presence and relationship building important. Idaho is underserved market.',
    existingRelationship: 'none',

    likelyPrimes: ['Micron internal'],
    competitors: ['Local Idaho firms', 'Big 4'],
    partnerOpportunities: ['Boise tech community'],

    sources: [
      { title: 'CHIPS Act Award - Micron', url: 'https://www.commerce.gov/', date: '2024-04-25' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Micron is more scrappy/accessible than Intel or TSMC. Direct outreach to CISO may work.'
  },

  // ============================================
  // COOLING PILLAR - Water & Thermal
  // ============================================
  {
    id: 'dc-water-cooling',
    title: 'Data Center Liquid Cooling Infrastructure',
    subtitle: 'Industry-wide shift to liquid cooling for AI chips',

    genesisPillar: 'cooling',
    genesisConnection: 'AI chips (H100, B200) generate too much heat for air cooling. Every new AI data center needs liquid cooling. This creates OT systems that didnt exist before.',

    entity: 'Multiple (all hyperscalers)',
    entityType: 'enterprise',
    sector: 'water',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 10_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: null,
    keyDateDescription: null,
    postedDate: '2024-01-01',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['scada', 'bms', 'plc'],
    otScope: `New OT systems for liquid cooling:
- Coolant distribution units (CDUs)
- Rear-door heat exchangers
- Immersion cooling tanks
- Water treatment for cooling loops
- Chiller plant controls
- Integration with facility BMS
- Leak detection systems`,
    regulatoryDrivers: [],
    complianceRequirements: 'Varies by facility and customer requirements. Generally follows data center security standards.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation'],
    deloitteAngle: 'Emerging area - few have expertise. Position as firm that understands both traditional BMS security AND new liquid cooling OT.',
    existingRelationship: 'some',

    likelyPrimes: ['Vertiv', 'Schneider', 'Cooling vendors'],
    competitors: ['Equipment vendors bundling security'],
    partnerOpportunities: ['Vertiv', 'Schneider Electric', 'Cooling startups'],

    sources: [
      { title: 'Liquid Cooling Market Analysis', url: 'https://www.datacenterknowledge.com/', date: '2025-01-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Horizontal opportunity across all AI data centers. Develop cooling OT security methodology that can be reused.'
  },

  // ============================================
  // SUPPLY CHAIN PILLAR - Critical Minerals
  // ============================================
  {
    id: 'mp-materials',
    title: 'MP Materials Rare Earth Processing',
    subtitle: 'Only US rare earth mine, expanding processing capabilities',

    genesisPillar: 'supply-chain',
    genesisConnection: 'Rare earths are essential for electronics, EVs, defense. China controls 90% of processing. MP Materials is US attempt at independence.',

    entity: 'MP Materials',
    entityType: 'enterprise',
    sector: 'critical-minerals',
    location: 'Mountain Pass, CA / Fort Worth, TX',
    state: 'CA',

    estimatedValue: 700_000_000,
    contractType: 'direct',
    fundingSource: 'DOD contracts, DOE loans, private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Fort Worth magnet facility ramping - security assessment needed',
    postedDate: '2024-08-01',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['dcs', 'scada', 'plc', 'hmi'],
    otScope: `Mining and chemical processing:
- Mining operations control systems
- Ore processing controls
- Chemical separation processes (solvent extraction)
- Magnet manufacturing (Fort Worth)
- Environmental monitoring
- Water treatment`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'DOD contracts = CMMC. Environmental permits. Mining safety regulations.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk'],
    deloitteAngle: 'Defense supply chain angle is compelling. Position security as enabler of DOD contracts.',
    existingRelationship: 'none',

    likelyPrimes: ['MP Materials internal'],
    competitors: ['Mining consultancies'],
    partnerOpportunities: ['Mining technology vendors'],

    sources: [
      { title: 'MP Materials DOD Contract', url: 'https://mpmaterials.com/', date: '2024-08-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Only US rare earth source. Strategic importance to DOD. Security is national security.'
  },

  {
    id: 'redwood-materials',
    title: 'Redwood Materials Battery Recycling',
    subtitle: '$3.5B battery recycling and materials facility',

    genesisPillar: 'supply-chain',
    genesisConnection: 'Battery materials recycling closes the loop on EV supply chain. Reduces dependence on Chinese battery materials. Founded by former Tesla CTO.',

    entity: 'Redwood Materials',
    entityType: 'enterprise',
    sector: 'critical-minerals',
    location: 'McCarran',
    state: 'NV',

    estimatedValue: 3_500_000_000,
    contractType: 'direct',
    fundingSource: 'DOE loan ($2B), IRA tax credits, private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-05-01',
    keyDateDescription: 'Phase 2 expansion - security systems procurement',
    postedDate: '2024-10-15',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['dcs', 'scada', 'plc', 'mes'],
    otScope: `Battery recycling and refining:
- Battery disassembly automation
- Hydrometallurgical processing (chemical)
- Pyrometallurgical processing (thermal)
- Material refining controls
- Environmental systems
- Hazardous material handling`,
    regulatoryDrivers: ['cfats'],
    complianceRequirements: 'CFATS for chemical processes. EPA environmental. OSHA process safety.',

    deloitteServices: ['ot-assessment', 'ics-architecture'],
    deloitteAngle: 'Fast-growing company, likely needs to professionalize security. Startup culture may be receptive to external expertise.',
    existingRelationship: 'none',

    likelyPrimes: ['Redwood internal'],
    competitors: ['Startup-friendly consultancies'],
    partnerOpportunities: ['Battery industry ecosystem'],

    sources: [
      { title: 'DOE Loan to Redwood Materials', url: 'https://www.energy.gov/lpo/', date: '2024-10-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'JB Straubel (founder) is high-profile in tech. May respond to thought leadership on battery supply chain security.'
  },

  // ============================================
  // ADDITIONAL HIGH-VALUE OPPORTUNITIES
  // ============================================
  {
    id: 'doe-hydrogen-hubs',
    title: 'Regional Clean Hydrogen Hubs',
    subtitle: '$7B for seven regional hydrogen production hubs',

    genesisPillar: 'power',
    genesisConnection: 'Hydrogen is future fuel for heavy industry and potentially data centers. DOE investing heavily. Each hub has significant OT.',

    entity: 'Department of Energy - OCED',
    entityType: 'federal',
    sector: 'clean-energy',
    location: 'Seven regions nationwide',
    state: 'US',

    estimatedValue: 7_000_000_000,
    contractType: 'subcontract',
    fundingSource: 'Bipartisan Infrastructure Law',

    procurementStage: 'awarded',
    urgency: 'this-month',
    keyDate: '2026-03-15',
    keyDateDescription: 'Hub cybersecurity plans due to DOE',
    postedDate: '2025-01-12',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'sis', 'plc'],
    otScope: `Hydrogen production facilities:
- Electrolysis control systems
- Steam methane reforming controls (for blue hydrogen)
- Carbon capture integration
- Compression and storage systems
- Pipeline distribution controls
- Safety Instrumented Systems (hydrogen is explosive)
- Environmental monitoring`,
    regulatoryDrivers: ['tsa-pipeline', 'cfats'],
    complianceRequirements: 'DOE cybersecurity requirements. TSA pipeline directives for hydrogen transport. CFATS for chemical facilities.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'incident-response', 'tabletop-exercises'],
    deloitteAngle: 'DOE relationship is key. Seven hubs = seven opportunities. Position as national hydrogen security expert.',
    existingRelationship: 'some',

    likelyPrimes: ['Hub lead organizations (varies by region)'],
    competitors: ['National labs', 'Oil & gas consultancies'],
    partnerOpportunities: ['Hydrogen technology vendors', 'Regional partners'],

    sources: [
      { title: 'H2Hubs Selection', url: 'https://www.energy.gov/oced/regional-clean-hydrogen-hubs', date: '2023-10-13' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Seven hubs across the country. Each needs cybersecurity. Work the DOE relationship to get intro to hub leads.'
  },

  {
    id: 'panasonic-kansas',
    title: 'Panasonic EV Battery Gigafactory',
    subtitle: '$4B battery cell manufacturing in Kansas',

    genesisPillar: 'supply-chain',
    genesisConnection: 'EV batteries are critical for clean energy transition. Panasonic supplies Tesla and others. Domestic production reduces supply chain risk.',

    entity: 'Panasonic Energy',
    entityType: 'enterprise',
    sector: 'ev-battery',
    location: 'De Soto',
    state: 'KS',

    estimatedValue: 4_000_000_000,
    contractType: 'direct',
    fundingSource: 'IRA tax credits, private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'Production ramp - operational security phase',
    postedDate: '2024-07-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'dcs', 'scada', 'plc', 'sis'],
    otScope: `Battery cell manufacturing:
- Electrode manufacturing controls
- Cell assembly automation
- Formation cycling systems
- Quality control integration
- Dry room environmental controls
- Safety systems (lithium fire risk)
- MES for production tracking`,
    regulatoryDrivers: ['cfats'],
    complianceRequirements: 'CFATS for chemical storage. OSHA process safety. Customer (Tesla, etc.) security requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'Japanese company may be open to Big 4 relationship. Battery manufacturing is hot sector.',
    existingRelationship: 'none',

    likelyPrimes: ['Panasonic internal'],
    competitors: ['Japanese consultancies', 'Manufacturing specialists'],
    partnerOpportunities: ['Battery equipment vendors'],

    sources: [
      { title: 'Panasonic Kansas Announcement', url: 'https://na.panasonic.com/', date: '2024-07-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Similar opportunity at Panasonic Nevada expansion. Bundle together for efficiency.'
  },

  {
    id: 'lg-arizona',
    title: 'LG Energy Solution Arizona',
    subtitle: '$5.5B cylindrical battery manufacturing',

    genesisPillar: 'supply-chain',
    genesisConnection: 'LG batteries power multiple EV brands. Arizona location near semiconductor cluster creates manufacturing hub.',

    entity: 'LG Energy Solution',
    entityType: 'enterprise',
    sector: 'ev-battery',
    location: 'Queen Creek',
    state: 'AZ',

    estimatedValue: 5_500_000_000,
    contractType: 'direct',
    fundingSource: 'IRA tax credits, private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Construction phase - security infrastructure',
    postedDate: '2024-10-20',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'dcs', 'scada', 'sis'],
    otScope: `Similar to other battery fabs:
- High-volume cell manufacturing
- Electrode and assembly automation
- Formation and testing
- Safety systems
- Environmental controls`,
    regulatoryDrivers: ['cfats'],
    complianceRequirements: 'CFATS. Customer security requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture'],
    deloitteAngle: 'Korean company - similar approach to Samsung. Arizona presence important.',
    existingRelationship: 'none',

    likelyPrimes: ['LG internal'],
    competitors: ['Korean consultancies'],
    partnerOpportunities: ['Arizona tech community'],

    sources: [
      { title: 'LG Arizona Announcement', url: 'https://www.lgensol.com/', date: '2024-10-20' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Arizona is becoming battery hub. Consider Arizona-wide strategy covering LG, Lucid, others.'
  },

  // ============================================
  // DEFENSE & SECURITY - AI for National Security
  // ============================================
  {
    id: 'palantir-titan',
    title: 'Palantir TITAN Ground Station',
    subtitle: 'AI-enabled targeting and sensor fusion for Army',

    genesisPillar: 'defense',
    genesisConnection: 'Genesis Mission: Apply AI to defense. TITAN is battlefield AI - fusing sensors, targeting, autonomous systems. The "why" behind building AI compute.',

    entity: 'US Army / Palantir',
    entityType: 'federal',
    sector: 'defense',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 10_000_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOD',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'Cybersecurity assessment for operational deployment',
    postedDate: '2025-01-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'hmi', 'dcs'],
    otScope: `AI battlefield systems require new security paradigm:
- Edge AI compute protection
- Sensor network security (radar, EO/IR, signals)
- Autonomous targeting system integrity
- Communications security (tactical networks)
- Software supply chain for AI models
- Red team/adversarial AI defense`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'CMMC Level 2+. Army Cyber Command requirements. Classified system handling.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'incident-response', 'vendor-risk'],
    deloitteAngle: 'Deloitte has DOD cyber credentials. Position as bridge between Palantir tech and Army requirements. AI security is emerging specialty.',
    existingRelationship: 'some',

    likelyPrimes: ['Palantir', 'Anduril'],
    competitors: ['Booz Allen', 'SAIC', 'Leidos'],
    partnerOpportunities: ['Palantir', 'Army primes'],

    sources: [
      { title: 'Palantir TITAN Delivery', url: 'https://www.palantir.com/', date: '2025-01-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Defense AI is exploding. TITAN is just the start. Position for the broader portfolio.'
  },

  {
    id: 'anduril-counter-drone',
    title: 'Anduril Counter-UAS Systems',
    subtitle: 'AI-powered drone defense for military installations',

    genesisPillar: 'defense',
    genesisConnection: 'AI applied to air defense. Autonomous detection and defeat of drone threats. Critical as drone warfare escalates.',

    entity: 'US Navy / Anduril',
    entityType: 'federal',
    sector: 'defense',
    location: 'Multiple bases',
    state: 'US',

    estimatedValue: 642_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOD',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-15',
    keyDateDescription: 'Initial operational capability - security certification',
    postedDate: '2024-11-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'hmi', 'plc'],
    otScope: `Autonomous defense systems:
- Lattice AI mesh network security
- Sensor tower protection
- Effector systems (kinetic/electronic)
- Command and control integration
- Edge computing security
- Real-time threat response integrity`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'CMMC Level 2. Navy Cyber requirements. Weapons system certification.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'tabletop-exercises'],
    deloitteAngle: 'Anduril is growing fast, needs security partners who understand both defense and tech startup culture.',
    existingRelationship: 'none',

    likelyPrimes: ['Anduril'],
    competitors: ['Defense tech boutiques'],
    partnerOpportunities: ['Anduril', 'Defense primes'],

    sources: [
      { title: 'Anduril Navy Contract', url: 'https://www.anduril.com/', date: '2024-11-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Anduril is reshaping defense procurement. Get in early. They value speed over bureaucracy.'
  },

  {
    id: 'darpa-saber',
    title: 'DARPA SABER Program',
    subtitle: 'Securing AI for Battlefield Effective Robustness',

    genesisPillar: 'defense',
    genesisConnection: 'Genesis Mission: Ensure AI is robust against adversaries. SABER is the R&D foundation for trustworthy military AI.',

    entity: 'DARPA',
    entityType: 'federal',
    sector: 'defense',
    location: 'Arlington',
    state: 'VA',

    estimatedValue: 310_000_000,
    contractType: 'prime',
    fundingSource: 'DARPA',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-05-01',
    keyDateDescription: 'BAA expected for Phase 2',
    postedDate: '2025-01-20',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['hmi', 'dcs'],
    otScope: `AI security research and red-teaming:
- Adversarial AI attack simulation
- Model robustness testing
- Autonomous system integrity
- AI supply chain security
- Operational AI red-teaming ecosystem
- Test and evaluation frameworks`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'CMMC. Security clearances. DARPA contractual requirements.',

    deloitteServices: ['ot-assessment', 'incident-response', 'tabletop-exercises'],
    deloitteAngle: 'DARPA research opportunity. Position Deloitte AI and cyber practices together. This is thought leadership territory.',
    existingRelationship: 'some',

    likelyPrimes: ['Research institutions', 'AI companies'],
    competitors: ['MITRE', 'FFRDCs', 'AI labs'],
    partnerOpportunities: ['Universities', 'AI startups'],

    sources: [
      { title: 'DARPA SABER Announcement', url: 'https://www.darpa.mil/news/2025/saber-warfighter-ai', date: '2025-01-20' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Research contract, but sets direction for operational programs. Worth pursuing for influence.'
  },

  // ============================================
  // HEALTHCARE & BIOTECH - AI for Drug Discovery
  // ============================================
  {
    id: 'nih-bridge2ai',
    title: 'NIH Bridge2AI Program',
    subtitle: 'AI-ready datasets for biomedical research',

    genesisPillar: 'healthcare',
    genesisConnection: 'Genesis Mission: AI accelerates drug discovery. Bridge2AI creates the data foundation. Security is critical for health data.',

    entity: 'National Institutes of Health',
    entityType: 'federal',
    sector: 'healthcare',
    location: 'Bethesda',
    state: 'MD',

    estimatedValue: 130_000_000,
    contractType: 'subcontract',
    fundingSource: 'NIH',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Data security assessment for new modules',
    postedDate: '2024-06-01',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['historian', 'hmi'],
    otScope: `Health data AI infrastructure:
- Research data platform security
- Multi-site data integration
- HIPAA compliance for AI training data
- Cloud/on-prem hybrid security
- Data provenance and integrity
- AI model security and governance`,
    regulatoryDrivers: ['fedramp'],
    complianceRequirements: 'HIPAA. FedRAMP for cloud. NIH data security requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk'],
    deloitteAngle: 'Deloitte health and cyber together. Position as firm that understands both biomedical research and security.',
    existingRelationship: 'some',

    likelyPrimes: ['Research institutions'],
    competitors: ['Health IT consultancies'],
    partnerOpportunities: ['Academic medical centers'],

    sources: [
      { title: 'Bridge2AI Program', url: 'https://commonfund.nih.gov/bridge2ai', date: '2024-06-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'NIH is investing heavily in AI. Multiple programs beyond Bridge2AI. Build relationship.'
  },

  {
    id: 'pfizer-ai-labs',
    title: 'Pfizer AI Drug Discovery Platform',
    subtitle: 'AI-powered pharmaceutical research and development',

    genesisPillar: 'healthcare',
    genesisConnection: 'Genesis Mission: AI cuts drug development time from 10 years to 2-3. Pfizer is leading pharma AI adoption.',

    entity: 'Pfizer',
    entityType: 'enterprise',
    sector: 'pharma-biotech',
    location: 'Cambridge',
    state: 'MA',

    estimatedValue: 500_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-05-15',
    keyDateDescription: 'Lab automation security RFP expected',
    postedDate: '2025-01-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'mes', 'scada', 'plc'],
    otScope: `Pharmaceutical AI and automation:
- Autonomous lab equipment (liquid handlers, assay systems)
- AI model training infrastructure
- Drug compound data security (IP critical)
- Manufacturing integration
- Regulatory submission systems (FDA)
- GxP compliance for AI`,
    regulatoryDrivers: ['executive-order'],
    complianceRequirements: 'FDA 21 CFR Part 11. GxP for AI validation. IP protection paramount.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'Deloitte has pharma relationships. Position OT security for lab automation as extension of cyber practice.',
    existingRelationship: 'strong',

    likelyPrimes: ['Pfizer internal'],
    competitors: ['Life sciences consultancies', 'Big 4'],
    partnerOpportunities: ['Lab automation vendors'],

    sources: [
      { title: 'Pfizer AI Announcement', url: 'https://www.pfizer.com/', date: '2025-01-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'likely',
    notes: 'Pharma is going all-in on AI. Security for autonomous labs is emerging need.'
  },

  // ============================================
  // ENERGY SYSTEMS - AI for Grid & Nuclear
  // ============================================
  {
    id: 'doe-ai-grid',
    title: 'DOE AI for Grid Modernization',
    subtitle: 'AI-powered grid optimization and resilience',

    genesisPillar: 'energy-systems',
    genesisConnection: 'Genesis Mission: AI optimizes the grid that powers AI. Circular dependency - smarter grid enables more compute.',

    entity: 'Department of Energy - Grid Deployment Office',
    entityType: 'federal',
    sector: 'grid',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 250_000_000,
    contractType: 'prime',
    fundingSource: 'Bipartisan Infrastructure Law',

    procurementStage: 'pre-solicitation',
    urgency: 'this-month',
    keyDate: '2026-03-15',
    keyDateDescription: 'FOA for AI grid applications expected',
    postedDate: '2025-01-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['ems', 'scada', 'hmi', 'historian'],
    otScope: `AI integration with grid operations:
- AI-powered load forecasting
- Predictive maintenance for substations
- Autonomous grid switching
- Renewable integration optimization
- Security for AI decision systems
- NERC CIP for AI-enabled assets`,
    regulatoryDrivers: ['nerc-cip', 'executive-order'],
    complianceRequirements: 'NERC CIP v7+. AI-specific security requirements emerging. DOE cyber requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'nerc-cip-compliance', 'soc-integration'],
    deloitteAngle: 'Unique position at intersection of grid operations, AI, and security. Few competitors have all three.',
    existingRelationship: 'some',

    likelyPrimes: ['National labs', 'Grid technology vendors'],
    competitors: ['1898 & Co', 'Utility consultancies'],
    partnerOpportunities: ['Grid AI startups', 'Utilities'],

    sources: [
      { title: 'DOE Grid AI Initiative', url: 'https://www.energy.gov/gdo/', date: '2025-01-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'likely',
    notes: 'DOE is prioritizing AI for grid. Watch for FOAs. Position as security partner.'
  },

  {
    id: 'inl-autonomous-nuclear',
    title: 'INL AI for Nuclear Operations',
    subtitle: 'Autonomous nuclear reactor monitoring and optimization',

    genesisPillar: 'energy-systems',
    genesisConnection: 'Genesis Mission: AI makes nuclear safer and cheaper to operate. Autonomous monitoring enables SMR deployment at scale.',

    entity: 'Idaho National Laboratory / AWS',
    entityType: 'federal',
    sector: 'nuclear',
    location: 'Idaho Falls',
    state: 'ID',

    estimatedValue: 100_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOE',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Phase 2 security assessment',
    postedDate: '2024-12-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'sis', 'hmi', 'historian'],
    otScope: `AI for nuclear safety and operations:
- Digital twin security for reactors
- AI-powered anomaly detection
- Autonomous monitoring systems
- NRC compliance for AI in safety systems
- Cloud integration security (AWS)
- Model integrity and adversarial robustness`,
    regulatoryDrivers: ['nrc-cyber', 'fedramp'],
    complianceRequirements: '10 CFR 73.54. NRC guidance on AI in nuclear. FedRAMP for cloud.',

    deloitteServices: ['nuclear-cyber', 'ot-assessment', 'ics-architecture'],
    deloitteAngle: 'Nuclear + AI + Security = rare combination. Deloitte nuclear cyber team can lead.',
    existingRelationship: 'none',

    likelyPrimes: ['INL', 'AWS'],
    competitors: ['National lab internal', 'Nuclear consultancies'],
    partnerOpportunities: ['INL', 'AWS', 'Nuclear vendors'],

    sources: [
      { title: 'INL-AWS Collaboration', url: 'https://inl.gov/', date: '2024-12-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'AI in nuclear is highly regulated but inevitable. Early positioning matters.'
  },

  // ============================================
  // MANUFACTURING - AI for Reshoring
  // ============================================
  {
    id: 'nist-ai-manufacturing',
    title: 'NIST AI Manufacturing Institute',
    subtitle: 'AI centers for resilient manufacturing',

    genesisPillar: 'manufacturing',
    genesisConnection: 'Genesis Mission: AI enables reshoring by making US manufacturing competitive despite higher labor costs.',

    entity: 'NIST',
    entityType: 'federal',
    sector: 'manufacturing',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 70_000_000,
    contractType: 'prime',
    fundingSource: 'NIST',

    procurementStage: 'awarded',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'Cybersecurity framework development begins',
    postedDate: '2025-01-10',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'scada', 'plc', 'dcs'],
    otScope: `AI in manufacturing security:
- Smart factory cyber-physical security
- Industrial robot protection
- AI/ML model integrity in production
- Supply chain security for AI components
- OT network segmentation for AI
- Standards development participation`,
    regulatoryDrivers: ['executive-order', 'cmmc'],
    complianceRequirements: 'NIST frameworks. Manufacturing sector standards. CMMC for defense supply chain.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'NIST shapes standards. Participation here influences entire manufacturing sector security direction.',
    existingRelationship: 'some',

    likelyPrimes: ['Manufacturing institutes', 'Universities'],
    competitors: ['Manufacturing consultancies'],
    partnerOpportunities: ['Manufacturing USA institutes'],

    sources: [
      { title: 'NIST AI Manufacturing Centers', url: 'https://www.nist.gov/', date: '2025-01-10' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Standards body work. Influence > direct revenue. Strategic investment.'
  },

  {
    id: 'tesla-gigafactory-ai',
    title: 'Tesla Gigafactory AI Automation',
    subtitle: 'AI-powered manufacturing at Giga Texas expansion',

    genesisPillar: 'manufacturing',
    genesisConnection: 'Genesis Mission: AI robots build the future. Tesla is the template for AI-first manufacturing.',

    entity: 'Tesla',
    entityType: 'enterprise',
    sector: 'manufacturing',
    location: 'Austin',
    state: 'TX',

    estimatedValue: 1_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-05-01',
    keyDateDescription: 'Optimus robot deployment - security requirements',
    postedDate: '2025-01-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'scada', 'plc', 'dcs', 'sis'],
    otScope: `AI-first manufacturing security:
- Optimus humanoid robot security
- AI vision systems protection
- Real-time production AI integrity
- Autonomous material handling
- Gigapress control systems
- Battery production automation
- End-to-end supply chain visibility`,
    regulatoryDrivers: [],
    complianceRequirements: 'Customer requirements. OSHA for robot safety. Proprietary Tesla standards.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'incident-response'],
    deloitteAngle: 'Tesla is notoriously insular, but scale of AI deployment may require outside expertise. Worth pursuing.',
    existingRelationship: 'none',

    likelyPrimes: ['Tesla internal'],
    competitors: ['Tesla prefers internal'],
    partnerOpportunities: ['Limited'],

    sources: [
      { title: 'Tesla AI Day', url: 'https://www.tesla.com/', date: '2025-01-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'speculative',
    notes: 'Long shot but huge upside. Tesla defines manufacturing future. Find a way in.'
  },

  // ============================================
  // SCIENTIFIC RESEARCH - Autonomous Labs
  // ============================================
  {
    id: 'doe-genesis-labs',
    title: 'DOE Genesis Mission - Autonomous Labs',
    subtitle: 'AI-driven scientific discovery across national labs',

    genesisPillar: 'research',
    genesisConnection: 'The Genesis Mission itself. AI doubles scientific productivity. 17 national labs, 40,000 scientists.',

    entity: 'Department of Energy',
    entityType: 'federal',
    sector: 'research-labs',
    location: 'National Labs (17)',
    state: 'US',

    estimatedValue: 500_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOE',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'American Science and Security Platform security requirements',
    postedDate: '2025-01-24',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'historian', 'hmi'],
    otScope: `Autonomous research infrastructure:
- AI experiment control systems
- Robot-controlled lab security
- Supercomputer integration (Frontier, Aurora)
- Data pipeline security
- Multi-lab collaboration platforms
- AI model governance and integrity
- Sensitive research protection`,
    regulatoryDrivers: ['fedramp', 'executive-order'],
    complianceRequirements: 'DOE cybersecurity requirements. FedRAMP for cloud. Classification handling. Export control.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'soc-integration', 'incident-response'],
    deloitteAngle: 'The heart of Genesis. Position Deloitte as the security partner for scientific AI. National importance.',
    existingRelationship: 'some',

    likelyPrimes: ['National labs', 'Tech companies'],
    competitors: ['FFRDCs', 'National lab contractors'],
    partnerOpportunities: ['National labs', 'Research universities'],

    sources: [
      { title: 'Genesis Mission EO', url: 'https://www.whitehouse.gov/', date: '2025-01-24' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Flagship Genesis program. Highest strategic priority. All roads lead here.'
  },

  {
    id: 'ornl-autonomous-science',
    title: 'ORNL Autonomous Science Initiative',
    subtitle: 'AI-controlled experiments at Oak Ridge',

    genesisPillar: 'research',
    genesisConnection: 'Genesis Mission: Autonomous labs multiply researcher productivity. ORNL leads with INTERSECT and Frontier supercomputer.',

    entity: 'Oak Ridge National Laboratory',
    entityType: 'federal',
    sector: 'research-labs',
    location: 'Oak Ridge',
    state: 'TN',

    estimatedValue: 150_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOE',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-15',
    keyDateDescription: 'INTERSECT security integration milestone',
    postedDate: '2024-10-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'plc', 'historian'],
    otScope: `Autonomous research systems:
- INTERSECT platform security
- Spallation Neutron Source controls
- Robot-controlled experiment cells
- Frontier supercomputer integration
- Real-time data streaming security
- AI-driven instrument control`,
    regulatoryDrivers: ['fedramp', 'executive-order'],
    complianceRequirements: 'DOE cybersecurity. Sensitive research handling. Multi-party collaboration security.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'soc-integration'],
    deloitteAngle: 'ORNL is at the forefront. Help them succeed and become the model for other labs.',
    existingRelationship: 'none',

    likelyPrimes: ['ORNL', 'UT-Battelle'],
    competitors: ['Lab contractors'],
    partnerOpportunities: ['ORNL', 'AI research teams'],

    sources: [
      { title: 'ORNL Autonomous Labs Vision', url: 'https://www.ornl.gov/', date: '2024-10-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'ORNL is accessible. Build relationship through thought leadership on autonomous lab security.'
  },

  // ============================================
  // TRUMP ADMIN PRIORITIES - Energy Dominance
  // ============================================
  {
    id: 'lng-export-expansion',
    title: 'LNG Export Terminal Expansion',
    subtitle: 'Lifting LNG export pause, $100B+ in new terminal projects',

    genesisPillar: 'power',
    genesisConnection: 'Energy dominance = US leverage. LNG terminals are critical infrastructure powering allies and funding domestic energy buildout.',

    entity: 'Multiple (Venture Global, Sempra, Cheniere)',
    entityType: 'enterprise',
    sector: 'grid',
    location: 'Gulf Coast (TX, LA)',
    state: 'TX',

    estimatedValue: 100_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-15',
    keyDateDescription: 'DOE export permit approvals accelerating under new admin',
    postedDate: '2025-01-20',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'sis', 'ems', 'plc'],
    otScope: `LNG facility OT security is extensive:
- Liquefaction train control systems (DCS)
- Cryogenic systems and safety (SIS critical)
- Marine terminal automation
- Pipeline interconnection SCADA
- Compressor station controls
- Tank farm monitoring
- Ship loading automation
- Emergency shutdown systems`,
    regulatoryDrivers: ['tsa-pipeline', 'cfats', 'mtsa'],
    complianceRequirements: 'TSA Pipeline Security Directives. CFATS for chemical facilities. MTSA for marine terminals. FERC reliability standards.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'incident-response'],
    deloitteAngle: 'LNG is booming under new admin. Every terminal needs security. Position as the firm that understands both energy ops and cyber.',
    existingRelationship: 'some',

    likelyPrimes: ['Bechtel', 'KBR', 'McDermott'],
    competitors: ['1898 & Co', 'Oil & gas consultancies'],
    partnerOpportunities: ['Claroty', 'Dragos', 'Fortinet'],

    sources: [
      { title: 'Trump Lifts LNG Export Pause', url: 'https://www.energy.gov/', date: '2025-01-20' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Massive opportunity. 5+ major terminals in permitting. Each is multi-billion with significant OT.'
  },

  {
    id: 'keystone-xl-revival',
    title: 'Keystone XL Pipeline Revival',
    subtitle: 'Executive order reviving cross-border pipeline permit',

    genesisPillar: 'power',
    genesisConnection: 'Energy security and Western Hemisphere integration. Pipeline infrastructure connects North American energy grid.',

    entity: 'TC Energy',
    entityType: 'enterprise',
    sector: 'grid',
    location: 'Alberta to Gulf Coast',
    state: 'US',

    estimatedValue: 9_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'TC Energy investment decision expected',
    postedDate: '2025-01-20',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'plc', 'hmi', 'ems'],
    otScope: `Cross-border pipeline SCADA:
- 1,200+ mile SCADA network
- Multiple pump stations
- Valve automation
- Leak detection systems
- Cross-border security coordination
- Remote monitoring infrastructure`,
    regulatoryDrivers: ['tsa-pipeline'],
    complianceRequirements: 'TSA Pipeline Security Directives (mandatory). Cross-border coordination with Canadian authorities.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'incident-response'],
    deloitteAngle: 'TSA directives make pipeline security mandatory. Position as compliance partner with cross-border experience.',
    existingRelationship: 'none',

    likelyPrimes: ['TC Energy internal'],
    competitors: ['Canadian consultancies', 'Pipeline specialists'],
    partnerOpportunities: ['Canadian partners'],

    sources: [
      { title: 'Trump EO on Keystone XL', url: 'https://www.whitehouse.gov/', date: '2025-01-20' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'likely',
    notes: 'Watch TC Energy decision. If they proceed, security will be major focus given political attention.'
  },

  {
    id: 'coal-plant-modernization',
    title: 'DOE Coal Plant Modernization Program',
    subtitle: '$625M for coal technology and carbon capture',

    genesisPillar: 'power',
    genesisConnection: 'Baseload power for grid reliability. Coal with CCUS supports AI data center growth in regions lacking other options.',

    entity: 'Department of Energy',
    entityType: 'federal',
    sector: 'clean-energy',
    location: 'Multiple (WV, WY, PA)',
    state: 'US',

    estimatedValue: 625_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOE / IRA',

    procurementStage: 'rfp-open',
    urgency: 'this-month',
    keyDate: '2026-02-28',
    keyDateDescription: 'Grant applications due for coal CCUS projects',
    postedDate: '2025-01-15',
    responseDeadline: '2026-02-28',

    otRelevance: 'high',
    otSystems: ['dcs', 'scada', 'sis', 'historian'],
    otScope: `Coal plant + CCUS integration:
- Plant DCS modernization
- Carbon capture process controls
- CO2 compression and transport
- Injection well monitoring
- Environmental monitoring systems
- Integration with existing plant controls`,
    regulatoryDrivers: ['nerc-cip'],
    complianceRequirements: 'NERC CIP for bulk electric system. EPA CCUS monitoring. Underground injection control.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'nerc-cip-compliance'],
    deloitteAngle: 'Coal states are important politically. Position as firm helping modernize rather than shut down facilities.',
    existingRelationship: 'none',

    likelyPrimes: ['Coal utilities', 'Engineering firms'],
    competitors: ['Regional consultancies'],
    partnerOpportunities: ['CCUS technology vendors'],

    sources: [
      { title: 'DOE Coal Technology Programs', url: 'https://www.energy.gov/fecm/', date: '2025-01-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Admin priority. CCUS adds new OT systems on top of existing plant controls. Good opportunity.'
  },

  // ============================================
  // DEFENSE INDUSTRIAL BASE
  // ============================================
  {
    id: 'dod-manufacturing-expansion',
    title: 'DOD Manufacturing Capacity Expansion',
    subtitle: 'Defense industrial base investment over stock buybacks',

    genesisPillar: 'defense',
    genesisConnection: 'Defense primes building new factories for munitions, ships, aircraft. Manufacturing capacity = deterrence capability.',

    entity: 'Department of Defense',
    entityType: 'federal',
    sector: 'defense',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 50_000_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOD',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'FY26 industrial base investments announced',
    postedDate: '2025-02-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'scada', 'plc', 'dcs', 'sis'],
    otScope: `Defense manufacturing OT:
- Munitions production lines
- Missile assembly automation
- Shipyard industrial control systems
- Aircraft manufacturing execution
- Quality control integration
- Classified production environments
- Supply chain tracking systems`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'CMMC Level 2-3. NIST 800-171. ITAR for export controlled. Classified system handling.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'Admin pushing primes to invest in capacity. New factories = greenfield OT security. Get to primes early.',
    existingRelationship: 'strong',

    likelyPrimes: ['Lockheed Martin', 'RTX', 'Northrop Grumman', 'General Dynamics'],
    competitors: ['Booz Allen', 'SAIC', 'Leidos'],
    partnerOpportunities: ['Defense primes'],

    sources: [
      { title: 'Defense Manufacturing Policy', url: 'https://www.defense.gov/', date: '2025-02-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Policy shift from buybacks to factories. Every prime will build new facilities. Massive OT opportunity.'
  },

  {
    id: 'shipbuilding-maritime-action',
    title: 'Maritime Action Plan - Shipyard Expansion',
    subtitle: '$350B Korea partnership + domestic shipyard investment',

    genesisPillar: 'defense',
    genesisConnection: 'Naval dominance requires shipbuilding capacity. US down to 2 major yards. Korea partnership accelerates rebuild.',

    entity: 'US Navy / Korean Shipbuilders',
    entityType: 'federal',
    sector: 'defense',
    location: 'Multiple (VA, MS, ME, WI)',
    state: 'US',

    estimatedValue: 350_000_000_000,
    contractType: 'subcontract',
    fundingSource: 'DOD / Private',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-15',
    keyDateDescription: 'Korea MOU implementation begins',
    postedDate: '2025-02-15',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['scada', 'mes', 'plc', 'dcs', 'sis'],
    otScope: `Shipyard industrial systems:
- Heavy lift crane controls
- Welding automation systems
- Dry dock operations
- Ship propulsion testing
- Combat system integration
- Nuclear propulsion facilities (carriers, subs)
- Material handling automation`,
    regulatoryDrivers: ['cmmc', 'nrc-cyber'],
    complianceRequirements: 'CMMC Level 2-3. NRC requirements for nuclear shipbuilding. Navy cyber requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'nuclear-cyber', 'network-segmentation'],
    deloitteAngle: 'Shipyards are critical infrastructure with major OT needs. Few firms understand both maritime and cyber.',
    existingRelationship: 'some',

    likelyPrimes: ['HII', 'General Dynamics NASSCO', 'Fincantieri'],
    competitors: ['Naval consultancies', 'Maritime specialists'],
    partnerOpportunities: ['Korean shipbuilders (Hyundai, Samsung Heavy)', 'Maritime tech'],

    sources: [
      { title: 'Maritime Action Plan', url: 'https://www.navy.mil/', date: '2025-02-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Major initiative. Korea bringing modern shipbuilding tech. OT security critical for technology transfer.'
  },

  // ============================================
  // CRITICAL MINERALS - Project Vault
  // ============================================
  {
    id: 'project-vault-minerals',
    title: 'Project Vault - Critical Minerals Strategy',
    subtitle: '$12B+ for domestic critical minerals production',

    genesisPillar: 'supply-chain',
    genesisConnection: 'Genesis depends on materials. No rare earths = no AI chips. Project Vault aims to break China dependency.',

    entity: 'Department of Interior / Commerce',
    entityType: 'federal',
    sector: 'critical-minerals',
    location: 'Multiple (AK, NV, AZ, WY)',
    state: 'US',

    estimatedValue: 12_000_000_000,
    contractType: 'subcontract',
    fundingSource: 'Federal / Private',

    procurementStage: 'execution',
    urgency: 'this-month',
    keyDate: '2026-03-01',
    keyDateDescription: 'Priority project permits accelerated',
    postedDate: '2025-01-25',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['dcs', 'scada', 'plc', 'mes', 'historian'],
    otScope: `Mining and processing OT:
- Underground mining automation
- Ore processing control systems
- Chemical separation (rare earths)
- Tailings management
- Environmental monitoring (continuous)
- Water treatment systems
- Material tracking and assay`,
    regulatoryDrivers: ['cmmc', 'cfats'],
    complianceRequirements: 'DOD supply chain = CMMC. CFATS for chemical processing. EPA environmental. State mining regulations.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk', 'network-segmentation'],
    deloitteAngle: 'Mining OT is underserved market. Position as firm bridging gap between mining operations and modern security.',
    existingRelationship: 'none',

    likelyPrimes: ['Mining companies', 'Engineering firms'],
    competitors: ['Mining consultancies', 'Regional firms'],
    partnerOpportunities: ['Mining tech vendors', 'Processing technology'],

    sources: [
      { title: 'Project Vault Announcement', url: 'https://www.doi.gov/', date: '2025-01-25' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Strategic priority. Every new mine needs OT security. Limited competition in mining cyber space.'
  },

  {
    id: 'pax-silica-alliance',
    title: 'Pax Silica - Semiconductor Supply Chain Alliance',
    subtitle: 'US-led chip alliance with Japan, Korea, Taiwan, Europe',

    genesisPillar: 'semiconductors',
    genesisConnection: 'Genesis needs secure chip supply. Pax Silica coordinates allied semiconductor production and supply chain security.',

    entity: 'Department of Commerce / State',
    entityType: 'federal',
    sector: 'semiconductors',
    location: 'Multiple (allied nations)',
    state: 'US',

    estimatedValue: 500_000_000,
    contractType: 'prime',
    fundingSource: 'State Department / CHIPS',

    procurementStage: 'pre-solicitation',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'Alliance framework implementation begins',
    postedDate: '2025-01-30',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['mes', 'dcs', 'scada'],
    otScope: `Alliance security coordination:
- Cross-border fab security standards
- Supply chain visibility systems
- Threat intelligence sharing
- Joint incident response frameworks
- Technology transfer security
- Export control compliance systems`,
    regulatoryDrivers: ['cmmc', 'executive-order'],
    complianceRequirements: 'International coordination. Export control (EAR, ITAR). CHIPS Act security. Allied nation frameworks.',

    deloitteServices: ['ot-assessment', 'vendor-risk', 'ics-architecture'],
    deloitteAngle: 'Global presence is differentiator. Deloitte can operate across US, Japan, Korea, Europe. Few competitors can.',
    existingRelationship: 'some',

    likelyPrimes: ['Commerce Department', 'Semiconductor companies'],
    competitors: ['Global consultancies'],
    partnerOpportunities: ['Allied nation Deloitte firms', 'SEMI industry association'],

    sources: [
      { title: 'Pax Silica Framework', url: 'https://www.commerce.gov/', date: '2025-01-30' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'likely',
    notes: 'Policy coordination opportunity. Shapes standards for allied semiconductor security. Strategic importance.'
  },

  // ============================================
  // FOREIGN FACTORY INVESTMENTS
  // ============================================
  {
    id: 'japan-investment-pledge',
    title: 'Japan $550B US Investment Program',
    subtitle: 'Japanese companies committing to US manufacturing',

    genesisPillar: 'manufacturing',
    genesisConnection: 'Reshoring advanced manufacturing. Japanese factories bring automation expertise and create supply chain resilience.',

    entity: 'Multiple Japanese companies',
    entityType: 'enterprise',
    sector: 'manufacturing',
    location: 'Multiple',
    state: 'US',

    estimatedValue: 550_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private (Japanese corporate)',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-06-01',
    keyDateDescription: 'Multiple factory groundbreakings expected',
    postedDate: '2025-02-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'scada', 'plc', 'dcs'],
    otScope: `Japanese manufacturing systems:
- Toyota Production System automation
- Precision manufacturing controls
- Quality management systems
- Supply chain integration
- Japanese OT vendor systems (Mitsubishi, Fanuc)
- US compliance overlay needed`,
    regulatoryDrivers: [],
    complianceRequirements: 'US facility compliance. Industry-specific requirements. Japanese parent company standards.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk', 'network-segmentation'],
    deloitteAngle: 'Japanese companies need US partners who understand both cultures. Deloitte Japan relationship is leverage.',
    existingRelationship: 'some',

    likelyPrimes: ['Japanese companies internal'],
    competitors: ['Japanese consultancies', 'Local US firms'],
    partnerOpportunities: ['Deloitte Japan', 'Japanese OT vendors'],

    sources: [
      { title: 'Japan Investment Pledge', url: 'https://www.commerce.gov/', date: '2025-02-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Massive investment wave. Coordinate with Deloitte Japan to pursue jointly.'
  },

  {
    id: 'korea-investment-pledge',
    title: 'Korea $900B US Investment Program',
    subtitle: 'Samsung, Hyundai, LG, SK expanding US presence',

    genesisPillar: 'manufacturing',
    genesisConnection: 'Korean tech giants building US capacity. Semiconductors, batteries, EVs - all critical for Genesis supply chain.',

    entity: 'Samsung, Hyundai, LG, SK Group',
    entityType: 'enterprise',
    sector: 'manufacturing',
    location: 'Multiple (TX, GA, TN, AZ)',
    state: 'US',

    estimatedValue: 900_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private (Korean corporate)',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: '2026-04-01',
    keyDateDescription: 'Samsung Taylor expansion, Hyundai Georgia battery plant',
    postedDate: '2025-02-01',
    responseDeadline: null,

    otRelevance: 'critical',
    otSystems: ['mes', 'dcs', 'scada', 'plc', 'sis'],
    otScope: `Korean conglomerate manufacturing:
- Semiconductor fab systems
- Battery gigafactory controls
- EV assembly automation
- Display manufacturing
- Chemical processing
- Highly automated facilities`,
    regulatoryDrivers: ['cfats', 'cmmc'],
    complianceRequirements: 'CFATS for battery/chemical. CMMC for defense supply. US compliance integration.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'],
    deloitteAngle: 'Korean companies expanding rapidly. Need US security partners. Deloitte Korea relationship is asset.',
    existingRelationship: 'none',

    likelyPrimes: ['Korean conglomerate internal teams'],
    competitors: ['Korean consultancies', 'Big 4'],
    partnerOpportunities: ['Deloitte Korea', 'Korean tech partners'],

    sources: [
      { title: 'Korea Investment Announcements', url: 'https://www.commerce.gov/', date: '2025-02-01' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Korea is second largest investor. Chaebols bring massive scale. Pursue through Deloitte Korea.'
  },

  {
    id: 'mexico-nearshoring-hub',
    title: 'Mexico Nearshoring Manufacturing Hub',
    subtitle: 'Western Hemisphere supply chain integration',

    genesisPillar: 'supply-chain',
    genesisConnection: 'Nearshoring = supply chain resilience. Mexico factories feed US manufacturing. Security needed for cross-border OT.',

    entity: 'Multiple (US and MX companies)',
    entityType: 'enterprise',
    sector: 'manufacturing',
    location: 'Northern Mexico border states',
    state: 'US',

    estimatedValue: 100_000_000_000,
    contractType: 'direct',
    fundingSource: 'Private',

    procurementStage: 'execution',
    urgency: 'this-quarter',
    keyDate: null,
    keyDateDescription: null,
    postedDate: '2025-01-15',
    responseDeadline: null,

    otRelevance: 'high',
    otSystems: ['mes', 'scada', 'plc'],
    otScope: `Cross-border manufacturing:
- Auto parts production
- Electronics assembly
- Aerospace components
- Medical devices
- Cross-border data flows
- US-Mexico OT integration
- Supply chain visibility`,
    regulatoryDrivers: ['cmmc'],
    complianceRequirements: 'USMCA compliance. CMMC for defense supply. Cross-border data requirements.',

    deloitteServices: ['ot-assessment', 'ics-architecture', 'vendor-risk'],
    deloitteAngle: 'Western Hemisphere priority. Deloitte Mexico partnership. Few firms operate effectively cross-border.',
    existingRelationship: 'some',

    likelyPrimes: ['Auto OEMs', 'Aerospace primes', 'Electronics companies'],
    competitors: ['Mexican consultancies', 'Regional firms'],
    partnerOpportunities: ['Deloitte Mexico', 'Industrial automation vendors'],

    sources: [
      { title: 'Nearshoring Trends', url: 'https://www.commerce.gov/', date: '2025-01-15' }
    ],

    lastUpdated: new Date().toISOString(),
    confidence: 'confirmed',
    notes: 'Western Hemisphere is admin priority. Mexico is key. Build cross-border capability.'
  }
];

// Helper to get opportunities by pillar
export function getOpportunitiesByPillar(pillar: string): Opportunity[] {
  return OPPORTUNITIES.filter(o => o.genesisPillar === pillar);
}

// Helper to get opportunities by urgency
export function getOpportunitiesByUrgency(urgency: string): Opportunity[] {
  return OPPORTUNITIES.filter(o => o.urgency === urgency);
}

// Helper to get total pipeline value
export function getTotalPipelineValue(): number {
  return OPPORTUNITIES.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);
}
