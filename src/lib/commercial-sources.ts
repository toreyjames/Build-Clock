// Commercial Data Sources for OT Opportunities
// Utilities, Enterprise, State/Local - where the partner focuses

interface CommercialOpportunity {
  id: string;
  title: string;
  entity: string;
  entityType: 'utility' | 'enterprise' | 'state-local';
  source: 'news' | 'puc-filing' | 'press-release' | 'trade-pub' | 'sec-filing' | 'contract-award' | 'grant' | 'chips-act';
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  summary: string;
  estimatedValue: number | null;
  location: string;
  state: string;
  otRelevance: 'critical' | 'high' | 'medium' | 'low';
  otKeywords: string[];
  sector: string;
  isNew: boolean;
  // Enrichment details (added by enrichment step)
  specificSite?: string;        // Specific facility/location
  phase?: string;               // Project phase (planning, construction, RFP open, etc.)
  primeContractor?: string;     // Known prime contractor
  rfpTimeline?: string;         // When RFPs expected
  needsResearch?: boolean;      // Flag if too broad to action (default false)
}

interface SectorCoverageRow {
  sector: string;
  configuredQueries: number;
  targetQueries: number;
  executedQueries: number;
  capturedItems: number;
}

interface CommercialCollectionModel {
  strategyVersion: string;
  updatedAt: string;
  sourceLayers: Array<{ name: string; description: string; priority: number }>;
  sectorCoverage: SectorCoverageRow[];
  explainability: {
    rankingModel: string;
    dedupeMethod: string;
    refreshCadence: string;
  };
}

// OT-relevant keywords for scoring
const OT_KEYWORDS = {
  critical: ['SCADA', 'DCS', 'industrial control', 'NERC CIP', 'OT security', 'ICS security', 'control system cyber'],
  high: ['grid modernization', 'substation automation', 'smart grid', 'AMI', 'DERMS', 'EMS upgrade', 'energy management system', 'cybersecurity assessment', 'network segmentation'],
  medium: ['utility cybersecurity', 'infrastructure security', 'grid security', 'digital transformation', 'automation upgrade', 'control center'],
};

const OT_EQUIPMENT_TERMS = [
  'scada', 'dcs', 'ics', 'hmi', 'plc', 'rtu', 'relay', 'protection relay', 'substation automation',
  'distributed control system', 'building management system', 'bms', 'mes', 'ems',
  'control system', 'instrumentation', 'sis', 'safety instrumented system',
];

const BUILD_RESTART_TERMS = [
  'new build', 'new-build', 'new plant', 'greenfield', 'brownfield',
  'breaking ground', 'under construction', 'construction start', 'groundbreaking',
  'restart', 'restarting', 'reactivation', 'recommission', 'return to service',
  'offshore drilling', 'onshore drilling', 'drilling program', 'new rig',
  'refinery expansion', 'refinery restart', 'refinery modernization',
  'nuclear restart', 'reactor restart', 'smr construction',
];

const SECTOR_OT_ANCHORS: Record<string, string[]> = {
  grid: ['SCADA', 'substation automation', 'protective relay', 'EMS'],
  'data-centers': ['BMS', 'EPMS', 'cooling controls', 'generator controls'],
  manufacturing: ['PLC', 'MES', 'HMI', 'ICS'],
  semiconductors: ['MES', 'DCS', 'tool control', 'fab automation'],
  'ev-battery': ['BMS', 'MES', 'PLC', 'formation line controls'],
  defense: ['ICS', 'SCADA', 'control system', 'test range instrumentation'],
  aerospace: ['industrial control system', 'test stand controls', 'manufacturing execution system'],
  metals: ['DCS', 'PLC', 'furnace controls', 'mill controls'],
  minerals: ['process control', 'PLC', 'SCADA', 'ore processing controls'],
  'oil-gas': ['SCADA', 'pipeline control', 'compressor controls', 'DCS'],
  'clean-energy': ['plant control system', 'SCADA', 'carbon capture controls'],
  chemicals: ['DCS', 'SIS', 'process control', 'instrumentation'],
  pharma: ['BMS', 'process control', 'MES', 'cleanroom automation'],
  'food-bev': ['PLC', 'line control', 'SCADA', 'packaging automation'],
  nuclear: ['reactor control', 'plant control system', 'SCADA'],
  water: ['SCADA', 'RTU', 'pump controls', 'treatment controls'],
};

function buildOtFocusedQuery(baseQuery: string, sector: string): string {
  const anchors = SECTOR_OT_ANCHORS[sector] || ['SCADA', 'PLC', 'ICS'];
  return `${baseQuery} (${anchors.join(' OR ')})`;
}

function extractOtEquipmentKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found = OT_EQUIPMENT_TERMS.filter((term) => lower.includes(term));
  return [...new Set(found.map((term) => term.toUpperCase()))];
}

function extractBuildRestartKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const found = BUILD_RESTART_TERMS.filter((term) => lower.includes(term));
  return [...new Set(found.map((term) => term.toUpperCase()))];
}

// Major utilities to track
const MAJOR_UTILITIES = [
  'Duke Energy', 'Southern Company', 'Dominion Energy', 'Exelon', 'NextEra Energy',
  'American Electric Power', 'Xcel Energy', 'Entergy', 'PPL Corporation', 'Evergy',
  'Ameren', 'CenterPoint Energy', 'DTE Energy', 'Eversource', 'WEC Energy',
  'Consolidated Edison', 'Public Service Enterprise', 'Edison International', 'Alliant Energy',
  'PG&E', 'Southern California Edison', 'San Diego Gas & Electric', 'Arizona Public Service',
  'Salt River Project', 'Tennessee Valley Authority', 'Bonneville Power', 'ERCOT',
  'PJM', 'MISO', 'CAISO', 'SPP', 'NYISO', 'ISO-NE',
];

// Enterprise/Data Center companies
const ENTERPRISE_TARGETS = [
  'Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 'Oracle', 'IBM',
  'Equinix', 'Digital Realty', 'CyrusOne', 'QTS', 'CoreSite', 'Vantage',
  'TSMC', 'Intel', 'Samsung', 'GlobalFoundries', 'Micron',
  'Tesla', 'Rivian', 'Ford', 'GM', 'Stellantis',
  'Nucor', 'US Steel', 'Cleveland-Cliffs',
];

// Manufacturing / Industrial companies (reshoring targets)
const MANUFACTURING_TARGETS = [
  // Semiconductors (CHIPS Act)
  'TSMC', 'Intel', 'Samsung', 'GlobalFoundries', 'Micron', 'Texas Instruments', 'Wolfspeed', 'Onsemi',
  // EV/Battery
  'Tesla', 'Rivian', 'Lucid', 'Ford', 'GM', 'Stellantis', 'Toyota', 'Honda', 'Hyundai', 'BMW', 'Mercedes',
  'Panasonic', 'LG Energy', 'SK On', 'CATL', 'Samsung SDI', 'Redwood Materials', 'Li-Cycle',
  // Aerospace/Defense
  'Boeing', 'Lockheed Martin', 'Northrop Grumman', 'Raytheon', 'RTX', 'General Dynamics', 'L3Harris',
  'BAE Systems', 'Textron', 'Huntington Ingalls', 'General Atomics', 'Sierra Nevada',
  // Steel/Metals
  'Nucor', 'US Steel', 'Cleveland-Cliffs', 'Steel Dynamics', 'Commercial Metals', 'Alcoa', 'Century Aluminum',
  // Pharma/Biotech Manufacturing
  'Pfizer', 'Moderna', 'Merck', 'Johnson & Johnson', 'Eli Lilly', 'AbbVie', 'Bristol-Myers',
  'Catalent', 'Thermo Fisher', 'Lonza', 'Fujifilm Diosynth',
  // Industrial/Heavy Equipment
  'Caterpillar', 'John Deere', 'CNH Industrial', 'AGCO', 'Cummins', 'Parker Hannifin',
  // Food & Beverage (large OT environments)
  'Tyson', 'JBS', 'Cargill', 'ADM', 'Bunge', 'PepsiCo', 'Coca-Cola', 'Nestle', 'Kraft Heinz',
  // Chemicals
  'Dow', 'DuPont', 'BASF', 'LyondellBasell', 'Eastman', 'Celanese', 'Huntsman',
  // Paper/Packaging
  'International Paper', 'WestRock', 'Packaging Corp', 'Graphic Packaging',
];

// Commercial-focused news searches
const COMMERCIAL_SEARCHES = [
  // Utility Grid/SCADA
  { query: 'utility SCADA upgrade contract', sector: 'grid', keywords: ['SCADA'] },
  { query: 'electric utility cybersecurity investment', sector: 'grid', keywords: ['cybersecurity'] },
  { query: 'grid modernization project award', sector: 'grid', keywords: ['grid modernization'] },
  { query: 'NERC CIP compliance utility', sector: 'grid', keywords: ['NERC CIP'] },

  // Data Centers
  { query: 'data center construction announcement 2026', sector: 'data-centers', keywords: ['data center'] },
  { query: 'hyperscale data center investment', sector: 'data-centers', keywords: ['hyperscale'] },

  // MANUFACTURING RESHORING
  { query: '"reshoring" manufacturing plant construction USA', sector: 'manufacturing', keywords: ['reshoring', 'manufacturing'] },
  { query: '"onshoring" factory construction United States', sector: 'manufacturing', keywords: ['onshoring', 'factory'] },
  { query: 'manufacturing plant "breaking ground" USA 2026', sector: 'manufacturing', keywords: ['manufacturing', 'construction'] },
  { query: 'new factory announcement United States jobs', sector: 'manufacturing', keywords: ['factory', 'new facility'] },
  { query: '"advanced manufacturing" facility construction', sector: 'manufacturing', keywords: ['advanced manufacturing'] },

  // SEMICONDUCTORS (CHIPS Act)
  { query: 'CHIPS Act semiconductor fab construction', sector: 'semiconductors', keywords: ['CHIPS Act', 'fab'] },
  { query: 'semiconductor fab "under construction" USA', sector: 'semiconductors', keywords: ['fab', 'construction'] },
  { query: 'Intel fab Arizona Ohio expansion', sector: 'semiconductors', keywords: ['Intel', 'fab'] },
  { query: 'TSMC Arizona fab construction', sector: 'semiconductors', keywords: ['TSMC', 'fab'] },
  { query: 'Samsung Taylor Texas fab', sector: 'semiconductors', keywords: ['Samsung', 'fab'] },
  { query: 'GlobalFoundries Micron expansion', sector: 'semiconductors', keywords: ['semiconductor', 'expansion'] },

  // EV / BATTERY
  { query: 'battery gigafactory construction USA 2026', sector: 'ev-battery', keywords: ['gigafactory', 'battery'] },
  { query: 'EV battery plant announcement', sector: 'ev-battery', keywords: ['EV', 'battery plant'] },
  { query: 'electric vehicle manufacturing plant USA', sector: 'ev-battery', keywords: ['EV', 'manufacturing'] },
  { query: 'Panasonic LG SK battery plant', sector: 'ev-battery', keywords: ['battery', 'plant'] },

  // DEFENSE INDUSTRIAL BASE
  { query: 'defense manufacturing expansion munitions', sector: 'defense', keywords: ['defense', 'manufacturing'] },
  { query: 'munitions plant construction USA', sector: 'defense', keywords: ['munitions', 'plant'] },
  { query: 'shipyard expansion modernization Navy', sector: 'defense', keywords: ['shipyard', 'Navy'] },
  { query: 'aerospace manufacturing facility expansion', sector: 'defense', keywords: ['aerospace', 'manufacturing'] },
  { query: 'defense contractor facility construction', sector: 'defense', keywords: ['defense', 'facility'] },
  { query: 'Lockheed Boeing Raytheon plant expansion', sector: 'defense', keywords: ['defense', 'expansion'] },
  { query: 'submarine production expansion', sector: 'defense', keywords: ['submarine', 'production'] },
  { query: 'Army Navy facility modernization', sector: 'defense', keywords: ['military', 'modernization'] },
  { query: 'missile defense radar modernization contract award', sector: 'defense', keywords: ['missile defense', 'radar'] },
  { query: 'counter UAS defense system production expansion', sector: 'defense', keywords: ['counter-UAS', 'defense'] },
  { query: 'integrated air and missile defense command system procurement', sector: 'defense', keywords: ['air defense', 'procurement'] },

  // STEEL / METALS
  { query: 'steel mill construction expansion USA', sector: 'metals', keywords: ['steel', 'mill'] },
  { query: 'aluminum smelter plant USA', sector: 'metals', keywords: ['aluminum', 'smelter'] },
  { query: 'Nucor US Steel expansion', sector: 'metals', keywords: ['steel', 'expansion'] },

  // PHARMA / BIOTECH MANUFACTURING
  { query: 'pharmaceutical manufacturing plant USA', sector: 'pharma', keywords: ['pharma', 'manufacturing'] },
  { query: 'biomanufacturing facility construction', sector: 'pharma', keywords: ['biomanufacturing'] },
  { query: 'drug manufacturing reshoring', sector: 'pharma', keywords: ['pharma', 'reshoring'] },
  { query: 'Pfizer Moderna Eli Lilly plant', sector: 'pharma', keywords: ['pharma', 'plant'] },

  // FOOD & BEVERAGE (large OT environments)
  { query: 'food processing plant construction USA', sector: 'food-bev', keywords: ['food processing', 'plant'] },
  { query: 'meat processing facility expansion', sector: 'food-bev', keywords: ['meat processing'] },
  { query: 'beverage manufacturing plant USA', sector: 'food-bev', keywords: ['beverage', 'manufacturing'] },

  // CHEMICALS
  { query: 'chemical plant construction USA 2026', sector: 'chemicals', keywords: ['chemical', 'plant'] },
  { query: 'petrochemical facility expansion', sector: 'chemicals', keywords: ['petrochemical'] },

  // CRITICAL MINERALS / RARE EARTH
  { query: 'rare earth processing plant USA', sector: 'minerals', keywords: ['rare earth', 'processing'] },
  { query: 'lithium processing facility USA', sector: 'minerals', keywords: ['lithium', 'processing'] },
  { query: 'critical minerals refinery construction', sector: 'minerals', keywords: ['critical minerals'] },
  { query: 'copper smelter modernization USA', sector: 'metals', keywords: ['smelter', 'copper'] },
  { query: 'alumina refining expansion project', sector: 'metals', keywords: ['refining', 'alumina'] },
  { query: 'copper mine expansion project USA', sector: 'minerals', keywords: ['copper', 'mine'] },
  { query: 'lithium mining project construction USA', sector: 'minerals', keywords: ['lithium', 'mining'] },
  { query: 'rare earth mining and processing facility USA', sector: 'minerals', keywords: ['rare earth', 'mining'] },

  // OIL / GAS / COAL
  { query: 'natural gas processing plant expansion USA', sector: 'oil-gas', keywords: ['natural gas', 'processing'] },
  { query: 'LNG terminal expansion project cybersecurity', sector: 'oil-gas', keywords: ['LNG', 'terminal'] },
  { query: 'pipeline compressor station modernization', sector: 'oil-gas', keywords: ['pipeline', 'compressor'] },
  { query: 'refinery turnaround modernization project', sector: 'oil-gas', keywords: ['refinery', 'turnaround'] },
  { query: 'new offshore drilling platform construction USA', sector: 'oil-gas', keywords: ['offshore drilling', 'new build'] },
  { query: 'new onshore drilling program basin development', sector: 'oil-gas', keywords: ['onshore drilling', 'development'] },
  { query: 'new refinery construction or major expansion USA', sector: 'oil-gas', keywords: ['refinery', 'new plant'] },
  { query: 'refinery restart and recommissioning project', sector: 'oil-gas', keywords: ['refinery restart', 'recommissioning'] },
  { query: 'coal plant modernization carbon capture upgrade', sector: 'clean-energy', keywords: ['coal', 'modernization'] },

  // DRONE / UAS / SPACE
  { query: 'drone manufacturing facility expansion USA', sector: 'defense', keywords: ['drone', 'manufacturing'] },
  { query: 'UAS production plant construction', sector: 'defense', keywords: ['UAS', 'production'] },
  { query: 'space launch facility expansion USA', sector: 'aerospace', keywords: ['space', 'launch facility'] },
  { query: 'satellite manufacturing plant expansion', sector: 'aerospace', keywords: ['satellite', 'manufacturing'] },
  { query: 'space systems integration facility new plant', sector: 'aerospace', keywords: ['space systems', 'facility'] },

  // Nuclear (Commercial)
  { query: 'nuclear plant cybersecurity upgrade', sector: 'nuclear', keywords: ['nuclear', 'cyber'] },
  { query: 'SMR small modular reactor project', sector: 'nuclear', keywords: ['SMR', 'modular reactor'] },
  { query: 'nuclear reactor restart project USA', sector: 'nuclear', keywords: ['nuclear restart', 'reactor restart'] },
  { query: 'retired nuclear plant return to service', sector: 'nuclear', keywords: ['return to service', 'nuclear'] },
  { query: 'new nuclear power plant construction USA', sector: 'nuclear', keywords: ['new nuclear', 'construction'] },

  // Water/Wastewater
  { query: 'water utility SCADA modernization', sector: 'water', keywords: ['water', 'SCADA'] },
];

// Sector-level query budget (how deep we search per refresh cycle by sector).
const SECTOR_QUERY_BUDGET: Record<string, number> = {
  defense: 5,
  aerospace: 3,
  'oil-gas': 4,
  minerals: 4,
  metals: 4,
  manufacturing: 4,
  semiconductors: 4,
  'ev-battery': 3,
  chemicals: 3,
  pharma: 3,
  'food-bev': 2,
  grid: 4,
  'data-centers': 3,
  nuclear: 2,
  water: 2,
  'clean-energy': 2,
};

const SOURCE_LAYERS = [
  { name: 'Official Procurement & Regulatory', description: 'RFP portals, PUC dockets, federal funding notices', priority: 1 },
  { name: 'Enterprise Program Signals', description: 'Projects, awards, filings, facility announcements', priority: 2 },
  { name: 'Market Intel', description: 'Trade publications and news trend signals for early detection', priority: 3 },
];

export function getCommercialCollectionModel(): CommercialCollectionModel {
  const configuredBySector: Record<string, number> = {};
  for (const search of COMMERCIAL_SEARCHES) {
    configuredBySector[search.sector] = (configuredBySector[search.sector] || 0) + 1;
  }

  const sectorCoverage = Object.keys(SECTOR_QUERY_BUDGET)
    .map((sector) => ({
      sector,
      configuredQueries: configuredBySector[sector] || 0,
      targetQueries: SECTOR_QUERY_BUDGET[sector] || 0,
      executedQueries: 0,
      capturedItems: 0,
    }))
    .sort((a, b) => b.targetQueries - a.targetQueries);

  return {
    strategyVersion: 'commercial-v2',
    updatedAt: new Date().toISOString(),
    sourceLayers: SOURCE_LAYERS,
    sectorCoverage,
    explainability: {
      rankingModel: 'OT-equipment OR new-build/restart evidence gate -> source-priority -> newness -> recency',
      dedupeMethod: 'normalized title prefix (first 50 chars) across all source layers',
      refreshCadence: '5m UI refresh, 15m scheduler refresh',
    },
  };
}

// State PUC RSS feeds and docket searches (where available)
const STATE_PUC_SOURCES = [
  { state: 'CA', name: 'California PUC', url: 'https://www.cpuc.ca.gov/', searchable: true },
  { state: 'TX', name: 'Texas PUC', url: 'https://www.puc.texas.gov/', searchable: true },
  { state: 'NY', name: 'New York PSC', url: 'https://www.dps.ny.gov/', searchable: true },
  { state: 'IL', name: 'Illinois Commerce Commission', url: 'https://www.icc.illinois.gov/', searchable: true },
  { state: 'PA', name: 'Pennsylvania PUC', url: 'https://www.puc.pa.gov/', searchable: true },
  { state: 'OH', name: 'Ohio PUC', url: 'https://puco.ohio.gov/', searchable: true },
  { state: 'FL', name: 'Florida PSC', url: 'https://www.floridapsc.com/', searchable: true },
  { state: 'GA', name: 'Georgia PSC', url: 'https://psc.ga.gov/', searchable: true },
  { state: 'NC', name: 'North Carolina UC', url: 'https://www.ncuc.gov/', searchable: true },
  { state: 'VA', name: 'Virginia SCC', url: 'https://www.scc.virginia.gov/', searchable: true },
];

// Parse Google News RSS for commercial opportunities
async function fetchCommercialNews(search: { query: string; sector: string; keywords: string[] }): Promise<CommercialOpportunity[]> {
  const focusedQuery = buildOtFocusedQuery(search.query, search.sector);
  const encodedQuery = encodeURIComponent(focusedQuery);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 1800 } // Cache 30 min
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const opportunities: CommercialOpportunity[] = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    for (const itemXml of itemMatches.slice(0, 5)) {
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
      const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'News';

      if (!title || !link) continue;

      // Check for utility/enterprise mentions
      const text = `${title} ${description}`.toLowerCase();
      const equipmentKeywords = extractOtEquipmentKeywords(text);
      const buildKeywords = extractBuildRestartKeywords(text);
      if (equipmentKeywords.length === 0 && buildKeywords.length === 0) continue;
      let entity = 'Unknown';
      let entityType: 'utility' | 'enterprise' | 'state-local' = 'utility';

      // Find mentioned entity
      for (const util of MAJOR_UTILITIES) {
        if (text.includes(util.toLowerCase())) {
          entity = util;
          entityType = 'utility';
          break;
        }
      }
      if (entity === 'Unknown') {
        for (const ent of ENTERPRISE_TARGETS) {
          if (text.includes(ent.toLowerCase())) {
            entity = ent;
            entityType = 'enterprise';
            break;
          }
        }
      }

      // Score OT relevance
      let otRelevance: 'critical' | 'high' | 'medium' | 'low' = 'low';
      const foundKeywords: string[] = [];

      for (const kw of OT_KEYWORDS.critical) {
        if (text.includes(kw.toLowerCase())) {
          otRelevance = 'critical';
          foundKeywords.push(kw);
        }
      }
      if (otRelevance === 'low') {
        for (const kw of OT_KEYWORDS.high) {
          if (text.includes(kw.toLowerCase())) {
            otRelevance = 'high';
            foundKeywords.push(kw);
          }
        }
      }
      if (otRelevance === 'low') {
        for (const kw of OT_KEYWORDS.medium) {
          if (text.includes(kw.toLowerCase())) {
            otRelevance = 'medium';
            foundKeywords.push(kw);
          }
        }
      }

      // OT equipment presence is the primary inclusion condition.
      if (otRelevance === 'low') otRelevance = 'high';

      // Extract value if mentioned
      let estimatedValue: number | null = null;
      const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
      const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
      if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
      else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

      // Extract state if mentioned
      const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
      const state = stateMatch ? stateMatch[1] : 'USA';

      // Check if new (within 7 days)
      const publishedDate = new Date(pubDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isNew = publishedDate > sevenDaysAgo;

      opportunities.push({
        id: `comm-${Buffer.from(link).toString('base64').substring(0, 16)}`,
        title: title.length > 120 ? title.substring(0, 117) + '...' : title,
        entity,
        entityType,
        source: 'news',
        sourceUrl: link,
        sourceName,
        publishedAt: publishedDate.toISOString(),
        summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
        estimatedValue,
        location: state,
        state,
        otRelevance,
        otKeywords: [...new Set([...equipmentKeywords, ...buildKeywords, ...foundKeywords, ...search.keywords])],
        sector: search.sector,
        isNew,
        needsResearch: false,
      });
    }

    return opportunities;
  } catch (error) {
    console.error(`Commercial news error for "${search.query}":`, error);
    return [];
  }
}

// Fetch trade publication feeds
async function fetchTradePubNews(): Promise<CommercialOpportunity[]> {
  const feeds = [
    { name: 'Utility Dive', url: 'https://www.utilitydive.com/feeds/news/', sector: 'grid' },
    { name: 'Power Engineering', url: 'https://www.power-eng.com/feed/', sector: 'power' },
    { name: 'T&D World', url: 'https://www.tdworld.com/rss.xml', sector: 'grid' },
    { name: 'Data Center Dynamics', url: 'https://www.datacenterdynamics.com/feed/', sector: 'data-centers' },
  ];

  const opportunities: CommercialOpportunity[] = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        next: { revalidate: 3600 } // Cache 1 hour
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();
        const equipmentKeywords = extractOtEquipmentKeywords(text);
        const buildKeywords = extractBuildRestartKeywords(text);
        if (equipmentKeywords.length === 0 && buildKeywords.length === 0) continue;

        // Quick OT relevance check
        let otRelevance: 'critical' | 'high' | 'medium' | 'low' = 'low';
        const foundKeywords: string[] = [];

        for (const kw of [...OT_KEYWORDS.critical, ...OT_KEYWORDS.high]) {
          if (text.includes(kw.toLowerCase())) {
            otRelevance = OT_KEYWORDS.critical.some(k => k.toLowerCase() === kw.toLowerCase()) ? 'critical' : 'high';
            foundKeywords.push(kw);
            break;
          }
        }

        if (otRelevance === 'low') otRelevance = 'high';

        const publishedDate = pubDate ? new Date(pubDate) : new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `trade-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity: 'Industry',
          entityType: 'utility',
          source: 'trade-pub',
          sourceUrl: link,
          sourceName: feed.name,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue: null,
          location: 'USA',
          state: 'USA',
          otRelevance,
          otKeywords: [...new Set([...equipmentKeywords, ...buildKeywords, ...foundKeywords])],
          sector: feed.sector,
          isNew: publishedDate > sevenDaysAgo,
          needsResearch: false,
        });
      }
    } catch (error) {
      console.error(`Trade pub error for ${feed.name}:`, error);
    }
  }

  return opportunities;
}

// Fetch actual opportunities from utility RFP/procurement announcements
async function fetchUtilityProcurement(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // Search for actual RFPs, RFIs, and procurement announcements
  const procurementSearches = [
    { query: '"request for proposal" utility cybersecurity 2026', type: 'rfp' },
    { query: '"request for proposal" SCADA upgrade', type: 'rfp' },
    { query: '"RFP" "grid modernization" utility', type: 'rfp' },
    { query: '"request for information" OT security utility', type: 'rfi' },
    { query: '"bid opportunity" electric utility cybersecurity', type: 'rfp' },
    { query: 'utility "seeking proposals" cybersecurity', type: 'rfp' },
    { query: '"contract award" utility SCADA', type: 'award' },
    { query: '"selected" utility "cybersecurity contract"', type: 'award' },
  ];

  for (const search of procurementSearches) {
    const encodedQuery = encodeURIComponent(buildOtFocusedQuery(search.query, 'grid'));
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Procurement';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();
        const equipmentKeywords = extractOtEquipmentKeywords(text);
        const buildKeywords = extractBuildRestartKeywords(text);
        if (equipmentKeywords.length === 0 && buildKeywords.length === 0) continue;

        // Must contain procurement indicators
        const hasProcurement = /\b(rfp|rfi|request for proposal|request for information|bid|procurement|contract award|selected|seeking proposals)\b/i.test(text);
        if (!hasProcurement) continue;

        // Find entity
        let entity = 'Unknown';
        let entityType: 'utility' | 'enterprise' | 'state-local' = 'utility';
        for (const util of MAJOR_UTILITIES) {
          if (text.includes(util.toLowerCase())) {
            entity = util;
            break;
          }
        }

        // Extract value
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

        // Extract state
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        const state = stateMatch ? stateMatch[1] : 'USA';

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `proc-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType,
          source: 'press-release',
          sourceUrl: link,
          sourceName: `${sourceName} (${search.type.toUpperCase()})`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue,
          location: state,
          state,
          otRelevance: 'high', // Actual procurement = high relevance
          otKeywords: [...new Set(['RFP', 'Procurement', ...equipmentKeywords, ...buildKeywords])],
          sector: 'grid',
          isNew: publishedDate > sevenDaysAgo,
        });
      }
    } catch (error) {
      console.error(`Procurement search error:`, error);
    }
  }

  return opportunities;
}

// Fetch PUC/regulatory docket filings
async function fetchPUCFilings(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // Search for PUC orders and dockets related to cybersecurity/grid modernization
  const pucSearches = [
    { query: '"public utility commission" cybersecurity order 2026', state: 'Multi' },
    { query: '"PUC" "grid modernization" docket approval', state: 'Multi' },
    { query: 'CPUC cybersecurity California utility', state: 'California' },
    { query: 'PUCT Texas utility "grid security"', state: 'Texas' },
    { query: 'NYPSC "cybersecurity" utility order', state: 'New York' },
    { query: '"rate case" utility cybersecurity investment', state: 'Multi' },
    { query: '"integrated resource plan" utility security', state: 'Multi' },
  ];

  for (const search of pucSearches) {
    const encodedQuery = encodeURIComponent(buildOtFocusedQuery(search.query, 'grid'));
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Regulatory';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();
        const equipmentKeywords = extractOtEquipmentKeywords(text);
        const buildKeywords = extractBuildRestartKeywords(text);
        if (equipmentKeywords.length === 0 && buildKeywords.length === 0) continue;

        // Must contain regulatory indicators
        const hasRegulatory = /\b(puc|puct|cpuc|psc|commission|docket|order|ruling|rate case|irp|integrated resource plan|filing)\b/i.test(text);
        if (!hasRegulatory) continue;

        // Find entity
        let entity = 'Unknown';
        for (const util of MAJOR_UTILITIES) {
          if (text.includes(util.toLowerCase())) {
            entity = util;
            break;
          }
        }

        // Extract value
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

        // Extract state
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        const state = stateMatch ? stateMatch[1] : search.state;

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `puc-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType: 'utility',
          source: 'puc-filing',
          sourceUrl: link,
          sourceName: `${sourceName} (PUC)`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue,
          location: state,
          state,
          otRelevance: 'high', // Regulatory mandate = high relevance
          otKeywords: [...new Set(['PUC', 'Regulatory', 'Docket', ...equipmentKeywords, ...buildKeywords])],
          sector: 'grid',
          isNew: publishedDate > sevenDaysAgo,
        });
      }
    } catch (error) {
      console.error(`PUC search error:`, error);
    }
  }

  return opportunities;
}

// Fetch industrial facility announcements (actual projects with OT needs)
async function fetchEnterpriseProjects(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  const projectSearches = [
    // Data Centers
    { query: '"data center" "under construction" megawatt 2026', sector: 'data-centers', entityType: 'enterprise' as const },
    { query: '"hyperscale" "new facility" construction', sector: 'data-centers', entityType: 'enterprise' as const },

    // Semiconductors / CHIPS Act
    { query: '"semiconductor fab" construction 2026', sector: 'semiconductors', entityType: 'enterprise' as const },
    { query: 'CHIPS Act fab "breaking ground"', sector: 'semiconductors', entityType: 'enterprise' as const },
    { query: 'Intel TSMC Samsung fab construction', sector: 'semiconductors', entityType: 'enterprise' as const },

    // EV / Battery
    { query: '"gigafactory" construction battery', sector: 'ev-battery', entityType: 'enterprise' as const },
    { query: '"EV plant" construction announcement', sector: 'ev-battery', entityType: 'enterprise' as const },
    { query: 'battery manufacturing plant USA', sector: 'ev-battery', entityType: 'enterprise' as const },

    // Defense Industrial Base
    { query: 'defense manufacturing facility expansion', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'munitions plant construction Army', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'shipyard modernization expansion', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'Lockheed Raytheon Boeing facility', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'missile defense radar modernization contract award', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'counter UAS defense system production expansion', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'integrated air and missile defense command system procurement', sector: 'defense', entityType: 'enterprise' as const },

    // Manufacturing Reshoring
    { query: '"reshoring" factory construction USA', sector: 'manufacturing', entityType: 'enterprise' as const },
    { query: '"manufacturing plant" "breaking ground" USA', sector: 'manufacturing', entityType: 'enterprise' as const },
    { query: '"advanced manufacturing" facility announcement', sector: 'manufacturing', entityType: 'enterprise' as const },

    // Steel / Metals
    { query: 'steel mill expansion construction', sector: 'metals', entityType: 'enterprise' as const },
    { query: 'Nucor "US Steel" plant expansion', sector: 'metals', entityType: 'enterprise' as const },

    // Pharma
    { query: 'pharmaceutical plant construction USA', sector: 'pharma', entityType: 'enterprise' as const },
    { query: 'biomanufacturing facility announcement', sector: 'pharma', entityType: 'enterprise' as const },

    // Food & Beverage
    { query: 'food processing plant construction', sector: 'food-bev', entityType: 'enterprise' as const },

    // Chemicals
    { query: 'chemical plant construction expansion', sector: 'chemicals', entityType: 'enterprise' as const },

    // Oil / Gas / Refining / LNG
    { query: 'natural gas processing plant expansion USA', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'LNG terminal expansion project', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'refinery turnaround modernization project', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'new offshore drilling platform construction USA', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'new onshore drilling program basin development', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'new refinery construction or major expansion USA', sector: 'oil-gas', entityType: 'enterprise' as const },
    { query: 'refinery restart and recommissioning project', sector: 'oil-gas', entityType: 'enterprise' as const },

    // Coal modernization
    { query: 'coal plant modernization upgrade carbon capture', sector: 'clean-energy', entityType: 'enterprise' as const },

    // Nuclear new build / restart
    { query: 'nuclear reactor restart project USA', sector: 'nuclear', entityType: 'enterprise' as const },
    { query: 'retired nuclear plant return to service', sector: 'nuclear', entityType: 'enterprise' as const },
    { query: 'new nuclear power plant construction USA', sector: 'nuclear', entityType: 'enterprise' as const },

    // Mining / Smelting / Refining
    { query: 'critical minerals mine processing facility expansion', sector: 'minerals', entityType: 'enterprise' as const },
    { query: 'copper smelter modernization USA', sector: 'metals', entityType: 'enterprise' as const },
    { query: 'aluminum refining expansion facility', sector: 'metals', entityType: 'enterprise' as const },
    { query: 'copper mine expansion project USA', sector: 'minerals', entityType: 'enterprise' as const },
    { query: 'lithium mining project construction USA', sector: 'minerals', entityType: 'enterprise' as const },
    { query: 'rare earth mining and processing facility USA', sector: 'minerals', entityType: 'enterprise' as const },

    // Drone / UAS / Space industrial base
    { query: 'drone manufacturing facility expansion USA', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'UAS production plant construction', sector: 'defense', entityType: 'enterprise' as const },
    { query: 'space launch facility expansion USA', sector: 'aerospace', entityType: 'enterprise' as const },
    { query: 'satellite manufacturing plant expansion', sector: 'aerospace', entityType: 'enterprise' as const },
  ];

  // Process a broad but bounded search set for sector coverage.
  for (const search of projectSearches) {
    const encodedQuery = encodeURIComponent(buildOtFocusedQuery(search.query, search.sector));
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Industry';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();
        const equipmentKeywords = extractOtEquipmentKeywords(text);
        const buildKeywords = extractBuildRestartKeywords(text);
        if (equipmentKeywords.length === 0 && buildKeywords.length === 0) continue;

        // Must contain project indicators
        const hasProject = /\b(construction|breaking ground|under construction|new facility|announced|building|expansion|plant|factory|fab|gigafactory|mill|refinery)\b/i.test(text);
        if (!hasProject) continue;

        // Find entity from both lists
        let entity = 'Unknown';
        let entityType: 'utility' | 'enterprise' | 'state-local' = search.entityType || 'enterprise';

        // Check manufacturing targets first (more comprehensive)
        for (const ent of MANUFACTURING_TARGETS) {
          if (text.includes(ent.toLowerCase())) {
            entity = ent;
            break;
          }
        }
        // Fallback to enterprise targets
        if (entity === 'Unknown') {
          for (const ent of ENTERPRISE_TARGETS) {
            if (text.includes(ent.toLowerCase())) {
              entity = ent;
              break;
            }
          }
        }

        // Extract value
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

        // Extract MW/capacity as value proxy if no $ amount
        if (!estimatedValue) {
          const mwMatch = text.match(/(\d+)\s*(?:mw|megawatt)/i);
          const gwMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:gw|gigawatt)/i);
          if (gwMatch) estimatedValue = parseFloat(gwMatch[1]) * 500_000_000;
          else if (mwMatch) estimatedValue = parseInt(mwMatch[1]) * 500_000;
        }

        // Extract state
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        const state = stateMatch ? stateMatch[1] : 'USA';

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Determine sector label for display
        const sectorLabels: Record<string, string> = {
          'data-centers': 'Data Center',
          'semiconductors': 'Semiconductor',
          'ev-battery': 'EV/Battery',
          'defense': 'Defense',
          'manufacturing': 'Manufacturing',
          'metals': 'Steel/Metals',
          'pharma': 'Pharma',
          'food-bev': 'Food/Bev',
          'chemicals': 'Chemicals',
        };

        opportunities.push({
          id: `proj-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType,
          source: 'press-release',
          sourceUrl: link,
          sourceName: `${sectorLabels[search.sector] || search.sector} (Project)`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue,
          location: state,
          state,
          otRelevance: entity !== 'Unknown' ? 'high' : 'medium',
          otKeywords: [...new Set(['New Facility', sectorLabels[search.sector] || 'Industrial', ...equipmentKeywords, ...buildKeywords])],
          sector: search.sector,
          isNew: publishedDate > sevenDaysAgo,
        });
      }
    } catch (error) {
      console.error(`Project search error for ${search.sector}:`, error);
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 50));
  }

  return opportunities;
}

// SEC EDGAR - Fetch 8-K filings for material announcements
// 8-Ks contain: facility expansions, major contracts, CapEx announcements, cybersecurity incidents
async function fetchSECFilings(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // SEC EDGAR full-text search API
  // Search for OT/industrial keywords in recent 8-K filings
  const searchTerms = [
    'manufacturing facility',
    'plant construction',
    'capital expenditure',
    'cybersecurity',
    'data center',
    'semiconductor',
    'battery plant',
    'gigafactory',
    'SCADA',
    'industrial control',
    'grid modernization',
  ];

  // Company CIK mappings for our target companies
  const targetCompanies: Record<string, { cik: string; name: string; sector: string }> = {
    // Utilities
    '0000018230': { cik: '0000018230', name: 'Duke Energy', sector: 'grid' },
    '0000092122': { cik: '0000092122', name: 'Southern Company', sector: 'grid' },
    '0000715957': { cik: '0000715957', name: 'Dominion Energy', sector: 'grid' },
    '0001109357': { cik: '0001109357', name: 'Exelon', sector: 'grid' },
    '0000753308': { cik: '0000753308', name: 'NextEra Energy', sector: 'grid' },
    '0000004904': { cik: '0000004904', name: 'American Electric Power', sector: 'grid' },
    '0001634997': { cik: '0001634997', name: 'Constellation Energy', sector: 'nuclear' },
    // Tech / Data Centers
    '0000789019': { cik: '0000789019', name: 'Microsoft', sector: 'data-centers' },
    '0001652044': { cik: '0001652044', name: 'Alphabet/Google', sector: 'data-centers' },
    '0001018724': { cik: '0001018724', name: 'Amazon', sector: 'data-centers' },
    '0001326801': { cik: '0001326801', name: 'Meta', sector: 'data-centers' },
    '0001045810': { cik: '0001045810', name: 'NVIDIA', sector: 'semiconductors' },
    '0000050863': { cik: '0000050863', name: 'Intel', sector: 'semiconductors' },
    // Manufacturing / Industrial
    '0000049196': { cik: '0000049196', name: 'General Electric', sector: 'manufacturing' },
    '0000040545': { cik: '0000040545', name: 'General Motors', sector: 'ev-battery' },
    '0000037996': { cik: '0000037996', name: 'Ford', sector: 'ev-battery' },
    '0001318605': { cik: '0001318605', name: 'Tesla', sector: 'ev-battery' },
    '0000073309': { cik: '0000073309', name: 'Nucor', sector: 'metals' },
    '0001163302': { cik: '0001163302', name: 'US Steel', sector: 'metals' },
    // Defense
    '0000936468': { cik: '0000936468', name: 'Lockheed Martin', sector: 'defense' },
    '0001133421': { cik: '0001133421', name: 'Northrop Grumman', sector: 'defense' },
    '0000006769': { cik: '0000006769', name: 'Boeing', sector: 'defense' },
    '0001047122': { cik: '0001047122', name: 'Raytheon/RTX', sector: 'defense' },
    '0000040533': { cik: '0000040533', name: 'General Dynamics', sector: 'defense' },
    // Pharma
    '0000078003': { cik: '0000078003', name: 'Pfizer', sector: 'pharma' },
    '0001682852': { cik: '0001682852', name: 'Moderna', sector: 'pharma' },
    '0000310158': { cik: '0000310158', name: 'Merck', sector: 'pharma' },
    '0000059478': { cik: '0000059478', name: 'Eli Lilly', sector: 'pharma' },
    // Chemicals
    '0000029915': { cik: '0000029915', name: 'Dow', sector: 'chemicals' },
    '0000030554': { cik: '0000030554', name: 'DuPont', sector: 'chemicals' },
  };

  try {
    // Use SEC EDGAR RSS feed for recent 8-K filings
    // This gets the most recent 8-Ks across all companies
    const rssUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&count=100&output=atom';

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'OTPipelineTracker/1.0 (contact@example.com)', // SEC requires user agent
      },
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      console.error('SEC RSS fetch failed:', response.status);
      return opportunities;
    }

    const xml = await response.text();

    // Parse Atom feed entries
    const entryMatches = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];

    for (const entryXml of entryMatches.slice(0, 50)) {
      const title = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || '';
      const link = entryXml.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
      const updated = entryXml.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] || '';
      const summary = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]?.replace(/<[^>]*>/g, '') || '';

      if (!title || !link) continue;

      // Extract company name and CIK from title
      // Format: "8-K - Company Name (0001234567) (Filer)"
      const companyMatch = title.match(/8-K\s*-\s*(.+?)\s*\(/);
      const cikMatch = title.match(/\((\d{10})\)/);

      if (!companyMatch) continue;

      const companyName = companyMatch[1].trim();
      const cik = cikMatch?.[1] || '';

      // Check if this is one of our target companies
      const targetInfo = targetCompanies[cik];

      // Also check by name for companies we might have missed
      let sector = targetInfo?.sector || 'manufacturing';
      let isTarget = !!targetInfo;

      if (!isTarget) {
        // Check if company name contains any of our targets
        for (const target of MANUFACTURING_TARGETS) {
          if (companyName.toLowerCase().includes(target.toLowerCase())) {
            isTarget = true;
            // Determine sector from name
            if (/energy|utility|power|electric/i.test(companyName)) sector = 'grid';
            else if (/pharma|biotech|therapeutics/i.test(companyName)) sector = 'pharma';
            else if (/semiconductor|chip/i.test(companyName)) sector = 'semiconductors';
            else if (/defense|aerospace/i.test(companyName)) sector = 'defense';
            break;
          }
        }
      }

      // For non-target companies, check if summary contains relevant keywords
      const text = `${title} ${summary}`.toLowerCase();
      const hasRelevantKeyword = searchTerms.some(term => text.includes(term.toLowerCase()));

      if (!isTarget && !hasRelevantKeyword) continue;

      // Extract any dollar amounts
      let estimatedValue: number | null = null;
      const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
      const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
      if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
      else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

      // Determine OT keywords found
      const otKeywords: string[] = [];
      if (text.includes('cybersecurity')) otKeywords.push('Cybersecurity');
      if (text.includes('manufacturing') || text.includes('plant') || text.includes('facility')) otKeywords.push('Facility');
      if (text.includes('capital') || text.includes('investment') || text.includes('expenditure')) otKeywords.push('CapEx');
      if (text.includes('data center')) otKeywords.push('Data Center');
      if (text.includes('semiconductor') || text.includes('fab')) otKeywords.push('Semiconductor');
      if (text.includes('battery') || text.includes('ev ')) otKeywords.push('EV/Battery');
      if (text.includes('grid') || text.includes('utility')) otKeywords.push('Grid');
      if (text.includes('defense') || text.includes('contract')) otKeywords.push('Defense');

      if (otKeywords.length === 0) otKeywords.push('8-K Filing');

      const publishedDate = new Date(updated);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Determine entity type
      let entityType: 'utility' | 'enterprise' | 'state-local' = 'enterprise';
      if (/energy|utility|power|electric/i.test(companyName)) entityType = 'utility';

      opportunities.push({
        id: `sec-${cik || Buffer.from(link).toString('base64').substring(0, 12)}`,
        title: `${companyName}: ${otKeywords[0]} Announcement`,
        entity: companyName,
        entityType,
        source: 'press-release', // Treat as press release for sorting
        sourceUrl: link,
        sourceName: 'SEC 8-K',
        publishedAt: publishedDate.toISOString(),
        summary: summary.length > 300 ? summary.substring(0, 297) + '...' : summary,
        estimatedValue,
        location: 'USA',
        state: 'USA',
        otRelevance: isTarget ? 'high' : 'medium',
        otKeywords,
        sector,
        isNew: publishedDate > sevenDaysAgo,
        needsResearch: false,
      });
    }
  } catch (error) {
    console.error('SEC EDGAR fetch error:', error);
  }

  return opportunities;
}

// Defense.gov Contract Awards - Daily DoD contract announcements
async function fetchDefenseContracts(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  try {
    // Defense.gov publishes contract awards via RSS
    const rssUrl = 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=400&Site=945&max=50';

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'OTPipelineTracker/1.0' },
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      console.error('Defense.gov RSS failed:', response.status);
      return opportunities;
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    // Defense contractors we track
    const defenseContractors = [
      'Lockheed Martin', 'Northrop Grumman', 'Boeing', 'Raytheon', 'RTX',
      'General Dynamics', 'L3Harris', 'BAE Systems', 'Huntington Ingalls',
      'Leidos', 'SAIC', 'Booz Allen', 'General Atomics', 'Textron',
      'Peraton', 'ManTech', 'CACI', 'Parsons', 'KBR',
    ];

    for (const itemXml of itemMatches.slice(0, 30)) {
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';

      if (!title || !link) continue;

      const text = `${title} ${description}`.toLowerCase();

      // Look for OT-relevant contract keywords
      const hasOTRelevance = /cyber|network|control system|industrial|manufacturing|shipyard|facility|modernization|automation|infrastructure|scada|ics/i.test(text);
      if (!hasOTRelevance) continue;

      // Find contractor
      let entity = 'DoD Contract';
      for (const contractor of defenseContractors) {
        if (text.includes(contractor.toLowerCase())) {
          entity = contractor;
          break;
        }
      }

      // Extract value
      let estimatedValue: number | null = null;
      const billionMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*billion/i);
      const millionMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*million/i);
      const rawMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
      if (billionMatch) estimatedValue = parseFloat(billionMatch[1].replace(/,/g, '')) * 1_000_000_000;
      else if (millionMatch) estimatedValue = parseFloat(millionMatch[1].replace(/,/g, '')) * 1_000_000;
      else if (rawMatch && parseFloat(rawMatch[1].replace(/,/g, '')) > 1000000) {
        estimatedValue = parseFloat(rawMatch[1].replace(/,/g, ''));
      }

      // Determine which service/branch
      const otKeywords: string[] = ['Defense Contract'];
      if (/navy|ship|submarine|maritime/i.test(text)) otKeywords.push('Navy');
      if (/army|ground|vehicle/i.test(text)) otKeywords.push('Army');
      if (/air force|aircraft|aviation/i.test(text)) otKeywords.push('Air Force');
      if (/cyber/i.test(text)) otKeywords.push('Cyber');
      if (/missile|munition|weapon/i.test(text)) otKeywords.push('Weapons');

      const publishedDate = new Date(pubDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      opportunities.push({
        id: `dod-${Buffer.from(link).toString('base64').substring(0, 16)}`,
        title: title.length > 120 ? title.substring(0, 117) + '...' : title,
        entity,
        entityType: 'enterprise',
        source: 'contract-award',
        sourceUrl: link,
        sourceName: 'Defense.gov',
        publishedAt: publishedDate.toISOString(),
        summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
        estimatedValue,
        location: 'USA',
        state: 'USA',
        otRelevance: entity !== 'DoD Contract' ? 'high' : 'medium',
        otKeywords,
        sector: 'defense',
        isNew: publishedDate > sevenDaysAgo,
        needsResearch: false,
      });
    }
  } catch (error) {
    console.error('Defense.gov fetch error:', error);
  }

  return opportunities;
}

// USAspending.gov - Federal contract awards (broader than just defense)
async function fetchUSASpending(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  try {
    // USAspending.gov API for recent prime awards
    // Focus on relevant NAICS codes for OT/industrial
    const naicsCodes = [
      '541512', // Computer Systems Design
      '541519', // Other Computer Related Services
      '541330', // Engineering Services
      '237130', // Power Line Construction
      '221112', // Electric Power Distribution
      '237110', // Water and Sewer Construction
      '541990', // Other Professional Services (includes cyber)
      '334111', // Electronic Computer Manufacturing
      '334290', // Other Communications Equipment
      '336411', // Aircraft Manufacturing
      '336611', // Ship Building
    ];

    // Get recent awards over $10M in relevant categories
    const apiUrl = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          time_period: [
            {
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
            }
          ],
          award_type_codes: ['A', 'B', 'C', 'D'], // Contracts
          naics_codes: naicsCodes,
          award_amounts: [
            { lower_bound: 10000000 } // $10M+
          ]
        },
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Description',
          'Start Date',
          'Awarding Agency',
          'NAICS Code',
        ],
        limit: 30,
        page: 1,
        sort: 'Award Amount',
        order: 'desc',
      }),
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error('USAspending API failed:', response.status);
      return opportunities;
    }

    const data = await response.json();

    for (const award of (data.results || [])) {
      const description = award['Description'] || '';
      const text = description.toLowerCase();

      // Filter for OT-relevant keywords
      const hasOTRelevance = /cyber|network|control|scada|industrial|automation|grid|power|infrastructure|manufacturing|facility|system/i.test(text);
      if (!hasOTRelevance) continue;

      const otKeywords: string[] = ['Contract Award'];
      if (/cyber/i.test(text)) otKeywords.push('Cyber');
      if (/network/i.test(text)) otKeywords.push('Network');
      if (/power|grid|energy/i.test(text)) otKeywords.push('Energy');
      if (/manufacturing|industrial/i.test(text)) otKeywords.push('Industrial');

      const publishedDate = new Date(award['Start Date'] || Date.now());
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Determine sector from NAICS
      let sector = 'manufacturing';
      const naics = award['NAICS Code'] || '';
      if (naics.startsWith('221') || naics.startsWith('237')) sector = 'grid';
      else if (naics.startsWith('336')) sector = 'defense';
      else if (naics.startsWith('334')) sector = 'semiconductors';

      opportunities.push({
        id: `usa-${award['Award ID'] || Buffer.from(description).toString('base64').substring(0, 12)}`,
        title: `${award['Awarding Agency'] || 'Federal'}: ${award['Recipient Name'] || 'Contract'}`,
        entity: award['Recipient Name'] || 'Unknown',
        entityType: 'enterprise',
        source: 'contract-award',
        sourceUrl: `https://www.usaspending.gov/award/${award['Award ID']}`,
        sourceName: 'USAspending',
        publishedAt: publishedDate.toISOString(),
        summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
        estimatedValue: award['Award Amount'] || null,
        location: 'USA',
        state: 'USA',
        otRelevance: (award['Award Amount'] || 0) > 50000000 ? 'high' : 'medium',
        otKeywords,
        sector,
        isNew: publishedDate > sevenDaysAgo,
        needsResearch: false,
      });
    }
  } catch (error) {
    console.error('USAspending fetch error:', error);
  }

  return opportunities;
}

// CHIPS Act / Commerce Department semiconductor investments
async function fetchCHIPSProjects(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // Search news for CHIPS Act announcements (Commerce doesn't have a clean API)
  const chipsSearches = [
    '"CHIPS Act" award announcement',
    '"CHIPS and Science Act" semiconductor funding',
    'Commerce Department semiconductor investment',
    'CHIPS Act preliminary terms',
    'semiconductor fab CHIPS funding',
  ];

  for (const query of chipsSearches.slice(0, 3)) {
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'News';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();

        // Must be about CHIPS Act
        if (!text.includes('chips') && !text.includes('semiconductor')) continue;

        // Find company
        let entity = 'CHIPS Act Project';
        const chipsFabs = ['Intel', 'TSMC', 'Samsung', 'Micron', 'GlobalFoundries', 'Texas Instruments', 'Wolfspeed', 'BAE Systems', 'Microchip', 'Polar Semiconductor'];
        for (const fab of chipsFabs) {
          if (text.includes(fab.toLowerCase())) {
            entity = fab;
            break;
          }
        }

        // Extract value
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

        // Extract state
        const stateMatch = text.match(/\b(Arizona|Ohio|Texas|New York|Oregon|Idaho|Vermont|New Mexico|Utah|Colorado)\b/i);
        const state = stateMatch ? stateMatch[1] : 'USA';

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `chips-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType: 'enterprise',
          source: 'chips-act',
          sourceUrl: link,
          sourceName: `${sourceName} (CHIPS)`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue,
          location: state,
          state,
          otRelevance: entity !== 'CHIPS Act Project' ? 'critical' : 'high',
          otKeywords: ['CHIPS Act', 'Semiconductor', 'Fab'],
          sector: 'semiconductors',
          isNew: publishedDate > sevenDaysAgo,
        });
      }
    } catch (error) {
      console.error('CHIPS search error:', error);
    }
  }

  return opportunities;
}

// Grid Interconnection Queue & Data Center Power Demand
// Surfaces opportunities around grid constraints, queue backlogs, and behind-the-meter solutions
async function fetchGridInterconnectionData(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // Key grid/data center power searches
  const gridSearches = [
    // Interconnection Queue Issues
    { query: 'interconnection queue backlog data center', sector: 'grid', keywords: ['Interconnection', 'Queue'] },
    { query: 'PJM interconnection queue data center power', sector: 'grid', keywords: ['PJM', 'Interconnection'] },
    { query: 'ERCOT interconnection queue wait time', sector: 'grid', keywords: ['ERCOT', 'Queue'] },
    { query: 'CAISO grid connection delay', sector: 'grid', keywords: ['CAISO', 'Grid'] },
    { query: '"grid congestion" data center', sector: 'grid', keywords: ['Grid Congestion'] },

    // Behind-the-Meter / Self-Generation
    { query: 'data center "on-site power" generation', sector: 'data-centers', keywords: ['On-Site Power'] },
    { query: 'data center SMR nuclear power', sector: 'data-centers', keywords: ['SMR', 'Nuclear'] },
    { query: 'hyperscale "natural gas" power generation', sector: 'data-centers', keywords: ['Natural Gas', 'Generation'] },
    { query: 'data center "behind the meter" power', sector: 'data-centers', keywords: ['Behind-the-Meter'] },
    { query: 'Microsoft Google Amazon "power purchase agreement"', sector: 'data-centers', keywords: ['PPA'] },

    // Grid Modernization / Capacity
    { query: 'grid capacity expansion data center demand', sector: 'grid', keywords: ['Grid Capacity', 'Expansion'] },
    { query: 'transmission upgrade data center', sector: 'grid', keywords: ['Transmission', 'Upgrade'] },
    { query: 'substation construction data center', sector: 'grid', keywords: ['Substation', 'Construction'] },

    // Utility + Data Center Partnerships
    { query: 'utility "data center" power agreement', sector: 'grid', keywords: ['Utility', 'Data Center'] },
    { query: 'Dominion Duke "data center" power', sector: 'grid', keywords: ['Utility', 'Data Center'] },
  ];

  for (const search of gridSearches.slice(0, 8)) {
    const encodedQuery = encodeURIComponent(search.query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'News';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();

        // Must be about grid/power/data centers
        if (!text.includes('grid') && !text.includes('power') && !text.includes('data center') && !text.includes('interconnection')) continue;

        // Find entity
        let entity = 'Grid/Power Project';
        let entityType: 'utility' | 'enterprise' | 'state-local' = 'utility';

        // Check for utilities
        for (const util of MAJOR_UTILITIES) {
          if (text.includes(util.toLowerCase())) {
            entity = util;
            entityType = 'utility';
            break;
          }
        }

        // Check for tech companies
        if (entity === 'Grid/Power Project') {
          for (const ent of ENTERPRISE_TARGETS) {
            if (text.includes(ent.toLowerCase())) {
              entity = ent;
              entityType = 'enterprise';
              break;
            }
          }
        }

        // Extract value (often in MW or GW for power)
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        const gwMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:gw|gigawatt)/i);
        const mwMatch = text.match(/(\d+)\s*(?:mw|megawatt)/i);

        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;
        else if (gwMatch) estimatedValue = parseFloat(gwMatch[1]) * 500_000_000; // ~$500M per GW proxy
        else if (mwMatch) estimatedValue = parseInt(mwMatch[1]) * 500_000; // ~$500K per MW proxy

        // Determine OT keywords
        const otKeywords: string[] = [...search.keywords];
        if (/interconnection|queue/i.test(text)) otKeywords.push('Interconnection');
        if (/substation/i.test(text)) otKeywords.push('Substation');
        if (/transmission/i.test(text)) otKeywords.push('Transmission');
        if (/scada|control/i.test(text)) otKeywords.push('SCADA');
        if (/nuclear|smr/i.test(text)) otKeywords.push('Nuclear');
        if (/behind.the.meter|on.site/i.test(text)) otKeywords.push('BTM');

        // Extract state/region
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        const state = stateMatch ? stateMatch[1] : 'USA';

        // Extract capacity/MW if mentioned
        const capacityMatch = text.match(/(\d+)\s*(?:mw|megawatt)/i);
        const capacity = capacityMatch ? `${capacityMatch[1]} MW` : '';

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // High relevance if about queue/interconnection issues (OT opportunity)
        const hasQueueIssue = /queue|backlog|wait|delay|congestion|constraint/i.test(text);
        const hasBTM = /behind.the.meter|on.site|self.generat/i.test(text);
        const otRelevance = (hasQueueIssue || hasBTM) ? 'high' : 'medium';

        opportunities.push({
          id: `grid-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType,
          source: 'press-release',
          sourceUrl: link,
          sourceName: `${sourceName} (Grid/Power)`,
          publishedAt: publishedDate.toISOString(),
          summary: `${capacity ? `[${capacity}] ` : ''}${description.length > 250 ? description.substring(0, 247) + '...' : description}`,
          estimatedValue,
          location: state,
          state,
          otRelevance,
          otKeywords: [...new Set(otKeywords)],
          sector: search.sector,
          isNew: publishedDate > sevenDaysAgo,
          needsResearch: false,
        });
      }
    } catch (error) {
      console.error('Grid interconnection search error:', error);
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 50));
  }

  return opportunities;
}

// EIA API - Energy Information Administration data
// Grid demand, capacity, forecasts
async function fetchEIAGridData(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  // EIA doesn't require an API key for basic access
  // Focus on series that indicate capacity additions and demand growth

  try {
    // Search for EIA-related news about grid capacity and data center demand
    const eiaSearches = [
      '"EIA" data center electricity demand forecast',
      '"Energy Information Administration" grid capacity',
      'electricity demand growth data centers',
      'peak demand record utility',
    ];

    for (const query of eiaSearches.slice(0, 2)) {
      const encodedQuery = encodeURIComponent(query);
      const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

      const response = await fetch(rssUrl, { next: { revalidate: 3600 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 2)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'EIA';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();

        // Extract any percentage growth or GW figures
        const growthMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:percent|%)\s*(?:growth|increase)/i);
        const gwMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:gw|gigawatt)/i);

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `eia-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity: 'EIA / Grid Analysis',
          entityType: 'utility',
          source: 'news',
          sourceUrl: link,
          sourceName: `${sourceName} (EIA)`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue: gwMatch ? parseFloat(gwMatch[1]) * 500_000_000 : null,
          location: 'USA',
          state: 'USA',
          otRelevance: 'medium',
          otKeywords: ['EIA', 'Grid Demand', 'Capacity'],
          sector: 'grid',
          isNew: publishedDate > sevenDaysAgo,
          needsResearch: false,
        });
      }
    }
  } catch (error) {
    console.error('EIA data fetch error:', error);
  }

  return opportunities;
}

// DOE Funding Announcements (Grid modernization, clean energy, etc.)
async function fetchDOEFunding(): Promise<CommercialOpportunity[]> {
  const opportunities: CommercialOpportunity[] = [];

  const doeSearches = [
    '"Department of Energy" grid modernization grant',
    'DOE funding announcement infrastructure',
    '"Bipartisan Infrastructure Law" energy grant',
    'DOE loan guarantee clean energy',
    '"Office of Electricity" grid funding',
    'DOE cybersecurity energy sector',
  ];

  for (const query of doeSearches.slice(0, 3)) {
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

    try {
      const response = await fetch(rssUrl, { next: { revalidate: 1800 } });
      if (!response.ok) continue;

      const xml = await response.text();
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const itemXml of itemMatches.slice(0, 3)) {
        const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
        const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
        const sourceName = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'News';

        if (!title || !link) continue;

        const text = `${title} ${description}`.toLowerCase();

        // Must be about DOE/energy funding
        if (!text.includes('doe') && !text.includes('energy') && !text.includes('grid')) continue;

        // Find recipient if mentioned
        let entity = 'DOE Grant';
        for (const util of MAJOR_UTILITIES) {
          if (text.includes(util.toLowerCase())) {
            entity = util;
            break;
          }
        }

        // Extract value
        let estimatedValue: number | null = null;
        const billionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*billion/i);
        const millionMatch = text.match(/\$(\d+(?:\.\d+)?)\s*million/i);
        if (billionMatch) estimatedValue = parseFloat(billionMatch[1]) * 1_000_000_000;
        else if (millionMatch) estimatedValue = parseFloat(millionMatch[1]) * 1_000_000;

        const otKeywords: string[] = ['DOE Funding'];
        if (/grid/i.test(text)) otKeywords.push('Grid');
        if (/cyber/i.test(text)) otKeywords.push('Cyber');
        if (/nuclear/i.test(text)) otKeywords.push('Nuclear');
        if (/clean energy|renewable/i.test(text)) otKeywords.push('Clean Energy');

        // Extract state
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        const state = stateMatch ? stateMatch[1] : 'USA';

        const publishedDate = new Date(pubDate);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        opportunities.push({
          id: `doe-${Buffer.from(link).toString('base64').substring(0, 16)}`,
          title: title.length > 120 ? title.substring(0, 117) + '...' : title,
          entity,
          entityType: 'utility',
          source: 'grant',
          sourceUrl: link,
          sourceName: `${sourceName} (DOE)`,
          publishedAt: publishedDate.toISOString(),
          summary: description.length > 300 ? description.substring(0, 297) + '...' : description,
          estimatedValue,
          location: state,
          state,
          otRelevance: entity !== 'DOE Grant' ? 'high' : 'medium',
          otKeywords,
          sector: 'grid',
          isNew: publishedDate > sevenDaysAgo,
        });
      }
    } catch (error) {
      console.error('DOE search error:', error);
    }
  }

  return opportunities;
}

// Enrich broad opportunities with specific details
// Searches for site-specific info, phases, contractors, timelines
async function enrichOpportunityDetails(opp: CommercialOpportunity): Promise<CommercialOpportunity> {
  // Skip if already has specific details or is small enough to be specific
  if (opp.specificSite || (opp.estimatedValue && opp.estimatedValue < 50_000_000)) {
    return { ...opp, needsResearch: false };
  }

  // Check if this looks like a broad/national announcement
  const isBroad = (
    (opp.estimatedValue && opp.estimatedValue >= 500_000_000) || // $500M+
    /national|nationwide|program|initiative|announces|billion/i.test(opp.title) ||
    opp.state === 'USA' || opp.location === 'USA'
  );

  if (!isBroad) {
    return { ...opp, needsResearch: false };
  }

  // Search for more specific details about this opportunity
  const searchQuery = `"${opp.entity}" ${opp.sector} site location facility RFP contract`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return { ...opp, needsResearch: true };
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    let specificSite: string | undefined;
    let phase: string | undefined;
    let primeContractor: string | undefined;
    let rfpTimeline: string | undefined;
    let foundDetails = false;

    // Known prime contractors to look for
    const primeContractors = [
      'Jacobs', 'AECOM', 'Fluor', 'Bechtel', 'Black & Veatch', 'Burns & McDonnell',
      'Leidos', 'SAIC', 'Booz Allen', 'Accenture', 'Deloitte', 'IBM', 'Cisco',
      'Honeywell', 'Siemens', 'GE', 'Schneider Electric', 'ABB', 'Rockwell',
      'Parsons', 'KBR', 'HDR', 'Stantec', 'WSP', 'Tetra Tech',
    ];

    // Specific facility keywords
    const facilityKeywords = [
      'fab', 'plant', 'facility', 'site', 'campus', 'center', 'station',
      'factory', 'mill', 'refinery', 'terminal', 'hub', 'complex',
    ];

    // Phase keywords
    const phaseKeywords: Record<string, string> = {
      'rfp': 'RFP Open',
      'request for proposal': 'RFP Open',
      'solicitation': 'Solicitation',
      'under construction': 'Construction',
      'breaking ground': 'Construction Starting',
      'groundbreaking': 'Construction Starting',
      'planning': 'Planning Phase',
      'announced': 'Announced',
      'preliminary': 'Preliminary',
      'final design': 'Final Design',
      'bid': 'Bidding',
      'awarded': 'Awarded',
      'selected': 'Contractor Selected',
    };

    for (const itemXml of itemMatches.slice(0, 5)) {
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
      const text = `${title} ${description}`.toLowerCase();

      // Skip if not about this entity
      if (!text.includes(opp.entity.toLowerCase())) continue;

      // Look for specific site/facility
      if (!specificSite) {
        // Look for "Entity + Facility + Location" patterns
        for (const fac of facilityKeywords) {
          const facRegex = new RegExp(`(\\w+\\s+)?${fac}\\s+(?:in\\s+)?(\\w+(?:\\s+\\w+)?)`, 'i');
          const match = text.match(facRegex);
          if (match) {
            specificSite = match[0].trim();
            foundDetails = true;
            break;
          }
        }

        // Also look for state + city patterns
        const stateMatch = text.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        if (stateMatch && !specificSite) {
          specificSite = stateMatch[1];
          foundDetails = true;
        }
      }

      // Look for phase
      if (!phase) {
        for (const [keyword, phaseLabel] of Object.entries(phaseKeywords)) {
          if (text.includes(keyword)) {
            phase = phaseLabel;
            foundDetails = true;
            break;
          }
        }
      }

      // Look for prime contractor
      if (!primeContractor) {
        for (const prime of primeContractors) {
          if (text.includes(prime.toLowerCase())) {
            // Check if it's in context of contract/selected/awarded
            if (/select|award|contract|partner|chosen|engage/i.test(text)) {
              primeContractor = prime;
              foundDetails = true;
              break;
            }
          }
        }
      }

      // Look for RFP timeline
      if (!rfpTimeline) {
        const timelineMatch = text.match(/rfp\s+(?:expected|due|releases?|opens?)\s+(?:in\s+)?(\w+\s+\d{4}|q[1-4]\s+\d{4}|\d{4})/i);
        if (timelineMatch) {
          rfpTimeline = timelineMatch[1];
          foundDetails = true;
        }
      }
    }

    return {
      ...opp,
      specificSite,
      phase,
      primeContractor,
      rfpTimeline,
      needsResearch: !foundDetails, // Flag if we couldn't find any details
    };
  } catch (error) {
    console.error('Enrichment error:', error);
    return { ...opp, needsResearch: true };
  }
}

// Batch enrich opportunities (limit concurrent requests)
async function enrichOpportunities(opps: CommercialOpportunity[]): Promise<CommercialOpportunity[]> {
  // Only enrich high-value or broad opportunities
  const toEnrich = opps.filter(o =>
    (o.estimatedValue && o.estimatedValue >= 100_000_000) ||
    o.state === 'USA' ||
    /national|program|initiative|billion/i.test(o.title)
  );

  const noEnrichNeeded = opps.filter(o => !toEnrich.includes(o)).map(o => ({ ...o, needsResearch: false }));

  // Enrich in batches of 3 to avoid rate limits
  const enriched: CommercialOpportunity[] = [];
  for (let i = 0; i < toEnrich.length; i += 3) {
    const batch = toEnrich.slice(i, i + 3);
    const results = await Promise.all(batch.map(o => enrichOpportunityDetails(o)));
    enriched.push(...results);
    if (i + 3 < toEnrich.length) {
      await new Promise(r => setTimeout(r, 200)); // Small delay between batches
    }
  }

  return [...enriched, ...noEnrichNeeded];
}

// Main function to fetch all commercial opportunities
export async function fetchCommercialOpportunities(limit: number = 30): Promise<{
  opportunities: CommercialOpportunity[];
  newCount: number;
  sources: { name: string; count: number; status: string }[];
  collectionModel: CommercialCollectionModel;
}> {
  const allOpportunities: CommercialOpportunity[] = [];
  const seenTitles = new Set<string>();
  const sourceStats: { name: string; count: number; status: string }[] = [];

  // 1. Fetch ACTUAL procurement/RFP announcements (highest priority)
  const procurementOpps = await fetchUtilityProcurement();
  let procCount = 0;
  for (const opp of procurementOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      procCount++;
    }
  }
  sourceStats.push({ name: 'Utility RFPs', count: procCount, status: procCount > 0 ? 'ok' : 'empty' });

  // 2. Fetch PUC/regulatory filings (regulatory mandates = opportunities)
  const pucOpps = await fetchPUCFilings();
  let pucCount = 0;
  for (const opp of pucOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      pucCount++;
    }
  }
  sourceStats.push({ name: 'PUC Filings', count: pucCount, status: pucCount > 0 ? 'ok' : 'empty' });

  // 3. Fetch enterprise facility projects (new builds = security needs)
  const projectOpps = await fetchEnterpriseProjects();
  let projCount = 0;
  for (const opp of projectOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      projCount++;
    }
  }
  sourceStats.push({ name: 'Enterprise Projects', count: projCount, status: projCount > 0 ? 'ok' : 'empty' });

  // 4. Fetch SEC 8-K filings (CapEx, facility announcements, cyber disclosures)
  const secOpps = await fetchSECFilings();
  let secCount = 0;
  for (const opp of secOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      secCount++;
    }
  }
  sourceStats.push({ name: 'SEC 8-K Filings', count: secCount, status: secCount > 0 ? 'ok' : 'empty' });

  // 5. Fetch Defense.gov contract awards
  const defenseOpps = await fetchDefenseContracts();
  let defenseCount = 0;
  for (const opp of defenseOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      defenseCount++;
    }
  }
  sourceStats.push({ name: 'Defense.gov', count: defenseCount, status: defenseCount > 0 ? 'ok' : 'empty' });

  // 6. Fetch USAspending.gov contract awards
  const usaSpendingOpps = await fetchUSASpending();
  let usaCount = 0;
  for (const opp of usaSpendingOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      usaCount++;
    }
  }
  sourceStats.push({ name: 'USAspending', count: usaCount, status: usaCount > 0 ? 'ok' : 'empty' });

  // 7. Fetch CHIPS Act semiconductor investments
  const chipsOpps = await fetchCHIPSProjects();
  let chipsCount = 0;
  for (const opp of chipsOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      chipsCount++;
    }
  }
  sourceStats.push({ name: 'CHIPS Act', count: chipsCount, status: chipsCount > 0 ? 'ok' : 'empty' });

  // 8. Fetch DOE funding announcements
  const doeOpps = await fetchDOEFunding();
  let doeCount = 0;
  for (const opp of doeOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      doeCount++;
    }
  }
  sourceStats.push({ name: 'DOE Funding', count: doeCount, status: doeCount > 0 ? 'ok' : 'empty' });

  // 9. Fetch Grid Interconnection / Data Center Power data
  const gridOpps = await fetchGridInterconnectionData();
  let gridCount = 0;
  for (const opp of gridOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      gridCount++;
    }
  }
  sourceStats.push({ name: 'Grid/Interconnection', count: gridCount, status: gridCount > 0 ? 'ok' : 'empty' });

  // 10. Fetch EIA Grid Demand data
  const eiaOpps = await fetchEIAGridData();
  let eiaCount = 0;
  for (const opp of eiaOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      eiaCount++;
    }
  }
  sourceStats.push({ name: 'EIA Grid Data', count: eiaCount, status: eiaCount > 0 ? 'ok' : 'empty' });

  // 11. Fetch from commercial news searches (lower priority - intel/context)
  // Execute multiple searches per sector to maximize coverage while staying deterministic.
  const groupedSearches = COMMERCIAL_SEARCHES.reduce<Record<string, Array<(typeof COMMERCIAL_SEARCHES)[number]>>>((acc, search) => {
    if (!acc[search.sector]) acc[search.sector] = [];
    acc[search.sector].push(search);
    return acc;
  }, {});

  const sectorCoverageMap: Record<string, SectorCoverageRow> = {};
  for (const [sector, targetQueries] of Object.entries(SECTOR_QUERY_BUDGET)) {
    sectorCoverageMap[sector] = {
      sector,
      configuredQueries: groupedSearches[sector]?.length || 0,
      targetQueries,
      executedQueries: 0,
      capturedItems: 0,
    };
  }

  const selectedSearches = Object.entries(SECTOR_QUERY_BUDGET).flatMap(([sector, queryBudget]) => {
    const bucket = groupedSearches[sector] || [];
    const picked = bucket.slice(0, queryBudget);
    sectorCoverageMap[sector].executedQueries = picked.length;
    return picked;
  });

  let newsCount = 0;
  const results = await Promise.all(selectedSearches.map((search) => fetchCommercialNews(search)));
  results.forEach((opps, idx) => {
    const sector = selectedSearches[idx]?.sector;
    if (sectorCoverageMap[sector]) {
      sectorCoverageMap[sector].capturedItems += opps.length;
    }
  });

  for (const opps of results) {
    for (const opp of opps) {
      const titleKey = opp.title.toLowerCase().substring(0, 50);
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        allOpportunities.push(opp);
        newsCount++;
      }
    }
  }
  sourceStats.push({ name: 'Market Intel', count: newsCount, status: 'ok' });

  // 12. Fetch from trade publications
  const tradePubOpps = await fetchTradePubNews();
  let tradeCount = 0;
  for (const opp of tradePubOpps) {
    const titleKey = opp.title.toLowerCase().substring(0, 50);
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allOpportunities.push(opp);
      tradeCount++;
    }
  }
  sourceStats.push({ name: 'Trade Publications', count: tradeCount, status: tradeCount > 0 ? 'ok' : 'empty' });

  // Sort: prioritize actual opportunities (RFP, PUC, Project, Contract Awards) over news
  allOpportunities.sort((a, b) => {
    // Source priority: procurement > contracts > puc > project > news
    const sourceOrder: Record<string, number> = {
      'press-release': 0, // RFPs, projects, grid/interconnection
      'contract-award': 1, // Defense, USAspending
      'puc-filing': 2,
      'chips-act': 3,
      'grant': 4,
      'sec-filing': 5,
      'trade-pub': 6,
      'news': 7
    };
    const sourceA = sourceOrder[a.source] ?? 7;
    const sourceB = sourceOrder[b.source] ?? 7;
    if (sourceA !== sourceB) return sourceA - sourceB;

    // Then new items first
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;

    // Then by relevance
    const relOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (relOrder[a.otRelevance] !== relOrder[b.otRelevance]) {
      return relOrder[a.otRelevance] - relOrder[b.otRelevance];
    }

    // Then by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const newCount = allOpportunities.filter(o => o.isNew).length;

  // Enrich broad opportunities with specific details
  const sliced = allOpportunities.slice(0, limit);
  const enrichedOpportunities = await enrichOpportunities(sliced);
  const collectionModel = getCommercialCollectionModel();
  collectionModel.sectorCoverage = Object.values(sectorCoverageMap).sort((a, b) => b.capturedItems - a.capturedItems);

  return {
    opportunities: enrichedOpportunities,
    newCount,
    sources: sourceStats,
    collectionModel,
  };
}

// Export types and constants for use elsewhere
export type { CommercialOpportunity };
export { MAJOR_UTILITIES, ENTERPRISE_TARGETS, OT_KEYWORDS, STATE_PUC_SOURCES };
