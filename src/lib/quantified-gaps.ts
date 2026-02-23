// Quantified US-China AI Infrastructure Gap Analysis
// Hard numbers, investment requirements, normalized metrics
// IMPORTANT: Distinguishes industrial vs residential - AI requires industrial

export interface LoadBreakdown {
  industrial: number;  // % or absolute
  residential: number;
  commercial: number;
  dataCenter: number;  // Subset of industrial, but critical to call out
  notes: string;
}

export interface QuantifiedMetric {
  name: string;
  usValue: number;
  usUnit: string;
  chinaValue: number;
  chinaUnit: string;
  gapValue: number;
  gapUnit: string;
  gapDirection: 'us-behind' | 'us-ahead' | 'parity';
  normalizedComparison?: {
    metric: string;
    usNormalized: number;
    chinaNormalized: number;
    unit: string;
    notes: string;
  };
  source: string;
  sourceDate: string;
}

export interface InvestmentRequirement {
  category: string;
  currentUSInvestment: number; // Annual $
  requiredUSInvestment: number; // Annual $ to close gap
  totalGapCost: number; // Total $ to reach parity
  timelineYears: number;
  chinaInvestment: number; // Annual $ China is spending
  fundingSources: string[];
  notes: string;
}

export interface TimelineProjection {
  metric: string;
  currentUSValue: number;
  currentChinaValue: number;
  usGrowthRate: number; // % annual
  chinaGrowthRate: number; // % annual
  crossoverYear: number | null; // When China surpasses US (null if already passed or won't)
  usTargetValue: number;
  usTargetYear: number;
  yearsToTarget: number;
  atCurrentRateYear: number; // When US reaches target at current rate
  acceleratedRateNeeded: number; // Growth rate needed to hit target
}

export interface LeapfrogStrategy {
  id: string;
  name: string;
  description: string;
  potentialImpact: string;
  timelineYears: string;
  investmentRequired: string;
  keyPlayers: string[];
  feasibility: 'proven' | 'demonstrated' | 'theoretical' | 'speculative';
  gapsAddressed: string[];
  risks: string[];
}

// ============================================
// QUANTIFIED GAP DATA
// ============================================

export const POWER_GAPS: QuantifiedMetric[] = [
  {
    name: 'AI Data Center Power Demand (2030)',
    usValue: 35,
    usUnit: 'GW current',
    chinaValue: 20,
    chinaUnit: 'GW current',
    gapValue: 15,
    gapUnit: 'GW ahead',
    gapDirection: 'us-ahead',
    normalizedComparison: {
      metric: 'DC Power per $1T GDP',
      usNormalized: 1.3,
      chinaNormalized: 1.1,
      unit: 'GW/$T GDP',
      notes: 'US currently more compute-intensive per unit economy'
    },
    source: 'IEA Electricity 2024, McKinsey',
    sourceDate: '2024-01'
  },
  {
    name: 'Projected AI Power Need (2030)',
    usValue: 90,
    usUnit: 'GW needed',
    chinaValue: 60,
    chinaUnit: 'GW needed',
    gapValue: 55,
    gapUnit: 'GW to add (US)',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Required build rate',
      usNormalized: 9.2,
      chinaNormalized: 6.7,
      unit: 'GW/year',
      notes: 'US must add more annually despite smaller current base'
    },
    source: 'Goldman Sachs AI Power Analysis',
    sourceDate: '2024-04'
  },
  {
    name: 'Nuclear Capacity',
    usValue: 95,
    usUnit: 'GW operating',
    chinaValue: 57,
    chinaUnit: 'GW operating',
    gapValue: 38,
    gapUnit: 'GW ahead',
    gapDirection: 'us-ahead',
    normalizedComparison: {
      metric: 'Nuclear GW per 100M population',
      usNormalized: 28.5,
      chinaNormalized: 4.0,
      unit: 'GW/100M people',
      notes: 'Per capita, US has 7x nuclear density - but China building fast'
    },
    source: 'World Nuclear Association',
    sourceDate: '2024-09'
  },
  {
    name: 'Nuclear Under Construction',
    usValue: 0,
    usUnit: 'GW',
    chinaValue: 27,
    chinaUnit: 'GW',
    gapValue: 27,
    gapUnit: 'GW behind',
    gapDirection: 'us-behind',
    source: 'World Nuclear Association',
    sourceDate: '2024-09'
  },
  {
    name: 'Annual Nuclear Addition Rate',
    usValue: 0,
    usUnit: 'GW/year (avg last 10yr)',
    chinaValue: 8,
    chinaUnit: 'GW/year',
    gapValue: 8,
    gapUnit: 'GW/year behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Nuclear addition per $1T GDP',
      usNormalized: 0,
      chinaNormalized: 0.44,
      unit: 'GW/year per $T GDP',
      notes: 'China adding 0.44 GW nuclear per $T GDP annually, US adding zero'
    },
    source: 'IAEA PRIS Database',
    sourceDate: '2024-12'
  },
  {
    name: 'Reactor Construction Time',
    usValue: 12,
    usUnit: 'years (Vogtle avg)',
    chinaValue: 5.5,
    chinaUnit: 'years (Hualong avg)',
    gapValue: 6.5,
    gapUnit: 'years slower',
    gapDirection: 'us-behind',
    source: 'World Nuclear Industry Status Report',
    sourceDate: '2024'
  },
  {
    name: 'Grid Transmission Capacity',
    usValue: 240000,
    usUnit: 'miles HV lines',
    chinaValue: 930000,
    chinaUnit: 'miles HV lines',
    gapValue: 690000,
    gapUnit: 'miles behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'HV miles per 1000 sq miles land',
      usNormalized: 65,
      chinaNormalized: 252,
      unit: 'miles/1000 sq mi',
      notes: 'China has 4x transmission density per land area'
    },
    source: 'DOE, State Grid Corporation of China',
    sourceDate: '2024'
  },
  {
    name: 'Annual Transmission Build Rate',
    usValue: 1000,
    usUnit: 'miles/year',
    chinaValue: 25000,
    chinaUnit: 'miles/year',
    gapValue: 24000,
    gapUnit: 'miles/year behind',
    gapDirection: 'us-behind',
    source: 'DOE National Transmission Needs Study',
    sourceDate: '2023-10'
  },
  {
    name: 'UHV Transmission',
    usValue: 0,
    usUnit: 'miles UHV',
    chinaValue: 25000,
    chinaUnit: 'miles UHV',
    gapValue: 25000,
    gapUnit: 'miles behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'UHV enables',
      usNormalized: 0,
      chinaNormalized: 100,
      unit: 'GW long-distance transfer',
      notes: 'China can move 100GW+ across country, US cannot'
    },
    source: 'State Grid Corporation of China',
    sourceDate: '2024'
  }
];

export const SEMICONDUCTOR_GAPS: QuantifiedMetric[] = [
  {
    name: 'Leading-Edge Chip Production (<7nm)',
    usValue: 0,
    usUnit: '% of global',
    chinaValue: 0,
    chinaUnit: '% of global',
    gapValue: 0,
    gapUnit: 'parity (both zero)',
    gapDirection: 'parity',
    normalizedComparison: {
      metric: 'Taiwan produces',
      usNormalized: 0,
      chinaNormalized: 0,
      unit: '% (Taiwan: 92%)',
      notes: 'Neither US nor China produces leading edge - Taiwan dominance is the real issue'
    },
    source: 'Semiconductor Industry Association',
    sourceDate: '2024'
  },
  {
    name: 'Mature Node Capacity (28nm+)',
    usValue: 10,
    usUnit: '% of global',
    chinaValue: 31,
    chinaUnit: '% of global',
    gapValue: 21,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'CSIS Semiconductor Analysis',
    sourceDate: '2024-06'
  },
  {
    name: 'Wafer Fab Capacity',
    usValue: 1100,
    usUnit: 'K wspm (12" equiv)',
    chinaValue: 2400,
    chinaUnit: 'K wspm',
    gapValue: 1300,
    gapUnit: 'K wspm behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Fab capacity per $1T GDP',
      usNormalized: 41,
      chinaNormalized: 133,
      unit: 'K wspm/$T GDP',
      notes: 'China has 3x more fab capacity relative to economy size'
    },
    source: 'SEMI World Fab Forecast',
    sourceDate: '2024-Q3'
  },
  {
    name: 'Advanced Packaging (CoWoS equiv)',
    usValue: 5,
    usUnit: '% of global',
    chinaValue: 8,
    chinaUnit: '% of global (Taiwan: 85%)',
    gapValue: 3,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'TrendForce',
    sourceDate: '2024'
  },
  {
    name: 'CHIPS Act Fabs Under Construction',
    usValue: 5,
    usUnit: 'major fabs',
    chinaValue: 44,
    chinaUnit: 'fabs under construction',
    gapValue: 39,
    gapUnit: 'fabs behind',
    gapDirection: 'us-behind',
    source: 'SEMI, Commerce Dept',
    sourceDate: '2024'
  }
];

export const MINERALS_GAPS: QuantifiedMetric[] = [
  {
    name: 'Rare Earth Mining',
    usValue: 14,
    usUnit: '% of global',
    chinaValue: 60,
    chinaUnit: '% of global',
    gapValue: 46,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'USGS Mineral Commodity Summaries',
    sourceDate: '2024'
  },
  {
    name: 'Rare Earth Processing',
    usValue: 0,
    usUnit: '% of global',
    chinaValue: 90,
    chinaUnit: '% of global',
    gapValue: 90,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Processing independence',
      usNormalized: 0,
      chinaNormalized: 100,
      unit: '% self-sufficient',
      notes: 'US mines ore, ships to China for processing, buys back products'
    },
    source: 'DOE Critical Minerals Assessment',
    sourceDate: '2024'
  },
  {
    name: 'Graphite Processing',
    usValue: 0,
    usUnit: '% of global',
    chinaValue: 90,
    chinaUnit: '% of global',
    gapValue: 90,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'IEA Critical Minerals Report',
    sourceDate: '2024'
  },
  {
    name: 'Lithium Refining',
    usValue: 1,
    usUnit: '% of global',
    chinaValue: 65,
    chinaUnit: '% of global',
    gapValue: 64,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'BloombergNEF',
    sourceDate: '2024'
  },
  {
    name: 'Battery Cell Production',
    usValue: 10,
    usUnit: '% of global',
    chinaValue: 77,
    chinaUnit: '% of global',
    gapValue: 67,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Battery GWh per $1T GDP',
      usNormalized: 3.7,
      chinaNormalized: 50,
      unit: 'GWh/$T GDP',
      notes: 'China has 13x battery production relative to economy'
    },
    source: 'BloombergNEF',
    sourceDate: '2024'
  }
];

export const COMPUTE_GAPS: QuantifiedMetric[] = [
  {
    name: 'Hyperscale Data Centers',
    usValue: 5400,
    usUnit: 'facilities',
    chinaValue: 450,
    chinaUnit: 'facilities',
    gapValue: 4950,
    gapUnit: 'ahead',
    gapDirection: 'us-ahead',
    normalizedComparison: {
      metric: 'DCs per 100M population',
      usNormalized: 1620,
      chinaNormalized: 32,
      unit: 'DCs/100M',
      notes: 'US has 50x more data centers per capita'
    },
    source: 'Synergy Research, Statista',
    sourceDate: '2024'
  },
  {
    name: 'AI Training Compute',
    usValue: 70,
    usUnit: '% of global AI compute',
    chinaValue: 15,
    chinaUnit: '% of global',
    gapValue: 55,
    gapUnit: '% ahead',
    gapDirection: 'us-ahead',
    normalizedComparison: {
      metric: 'AI compute per $1T GDP',
      usNormalized: 2.6,
      chinaNormalized: 0.83,
      unit: '% global/$T GDP',
      notes: 'US has 3x AI compute intensity relative to economy'
    },
    source: 'Epoch AI',
    sourceDate: '2024'
  },
  {
    name: 'H100/A100 Equivalent GPUs',
    usValue: 600000,
    usUnit: 'estimated GPUs',
    chinaValue: 50000,
    chinaUnit: 'estimated (sanctions limited)',
    gapValue: 550000,
    gapUnit: 'ahead',
    gapDirection: 'us-ahead',
    source: 'SemiAnalysis estimates',
    sourceDate: '2024'
  },
  {
    name: 'AI Research Papers',
    usValue: 18,
    usUnit: '% of global',
    chinaValue: 40,
    chinaUnit: '% of global',
    gapValue: 22,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    normalizedComparison: {
      metric: 'Papers per 1M researchers',
      usNormalized: 12000,
      chinaNormalized: 8500,
      unit: 'papers/M researchers',
      notes: 'US more productive per researcher but China has more researchers'
    },
    source: 'Stanford AI Index',
    sourceDate: '2024'
  },
  {
    name: 'AI Researchers',
    usValue: 28,
    usUnit: '% of global top researchers',
    chinaValue: 47,
    chinaUnit: '% of global',
    gapValue: 19,
    gapUnit: '% behind',
    gapDirection: 'us-behind',
    source: 'MacroPolo Global AI Talent Tracker',
    sourceDate: '2024'
  }
];

// ============================================
// INDUSTRIAL VS RESIDENTIAL BREAKDOWN
// Critical context: AI is INDUSTRIAL load
// ============================================

export interface IndustrialContext {
  country: 'us' | 'china';
  category: string;
  totalCapacity: number;
  unit: string;
  breakdown: {
    industrial: number;
    residential: number;
    commercial: number;
    dataCenter: number;
    other: number;
  };
  industrialForAI: number; // How much industrial capacity is available/suitable for AI
  notes: string;
  implication: string;
}

export const INDUSTRIAL_CONTEXT: IndustrialContext[] = [
  // US Electricity
  {
    country: 'us',
    category: 'Electricity Consumption',
    totalCapacity: 4000,
    unit: 'TWh/year',
    breakdown: {
      industrial: 25,    // 25% industrial
      residential: 38,   // 38% residential
      commercial: 35,    // 35% commercial
      dataCenter: 2.5,   // ~2.5% (and growing fast)
      other: 0
    },
    industrialForAI: 100,
    notes: 'US grid is consumer-heavy. Only 25% industrial vs 38% residential.',
    implication: 'New AI load competes with existing residential/commercial. Grid designed for distributed residential, not concentrated industrial.'
  },
  // China Electricity
  {
    country: 'china',
    category: 'Electricity Consumption',
    totalCapacity: 9200,
    unit: 'TWh/year',
    breakdown: {
      industrial: 66,    // 66% industrial - MASSIVE difference
      residential: 14,   // Only 14% residential
      commercial: 12,    // 12% commercial
      dataCenter: 2,     // ~2%
      other: 6
    },
    industrialForAI: 500,
    notes: 'China grid is 66% INDUSTRIAL. Built for factories, not homes.',
    implication: 'Grid infrastructure designed for concentrated industrial loads. Adding AI data centers is incremental, not transformative.'
  },
  // US Power Generation
  {
    country: 'us',
    category: 'Power Generation Capacity',
    totalCapacity: 1200,
    unit: 'GW installed',
    breakdown: {
      industrial: 30,    // Baseload serving industry
      residential: 35,   // Peaking for A/C, heating
      commercial: 25,    // Office buildings, retail
      dataCenter: 4,     // ~35 GW for DCs
      other: 6
    },
    industrialForAI: 50,
    notes: 'Much US capacity is peaking plants for residential A/C. Not suitable for 24/7 AI load.',
    implication: 'Need BASELOAD power for AI, but US has been adding intermittent renewables + peakers. Mismatch.'
  },
  // China Power Generation
  {
    country: 'china',
    category: 'Power Generation Capacity',
    totalCapacity: 2900,
    unit: 'GW installed',
    breakdown: {
      industrial: 60,    // Coal + nuclear serving factories
      residential: 15,
      commercial: 10,
      dataCenter: 3,
      other: 12
    },
    industrialForAI: 300,
    notes: 'China has massive baseload coal fleet serving industry 24/7.',
    implication: 'Even dirty coal provides reliable baseload. China can redirect existing industrial power to AI.'
  },
  // US Grid Transmission
  {
    country: 'us',
    category: 'Transmission Capacity',
    totalCapacity: 240000,
    unit: 'miles HV lines',
    breakdown: {
      industrial: 30,    // Serving industrial corridors
      residential: 40,   // Distribution to suburbs
      commercial: 25,
      dataCenter: 3,
      other: 2
    },
    industrialForAI: 15,
    notes: 'US transmission built for distributed residential. Industrial corridors limited.',
    implication: 'Can\'t easily move power to new AI data center locations. Need new transmission.'
  },
  // China Grid Transmission
  {
    country: 'china',
    category: 'Transmission Capacity',
    totalCapacity: 930000,
    unit: 'miles HV lines (incl UHV)',
    breakdown: {
      industrial: 70,    // Built for factories
      residential: 15,
      commercial: 10,
      dataCenter: 3,
      other: 2
    },
    industrialForAI: 100,
    notes: 'China UHV grid specifically built to move power from west to eastern factories.',
    implication: 'Can move 100GW+ across country. "East Data West Compute" policy uses this.'
  },
  // US Natural Gas (key for peaking)
  {
    country: 'us',
    category: 'Natural Gas Consumption',
    totalCapacity: 32,
    unit: 'Tcf/year',
    breakdown: {
      industrial: 33,    // Industrial process heat + power
      residential: 16,   // Home heating
      commercial: 13,    // Commercial heating
      dataCenter: 1,     // Backup generators, some direct
      other: 37          // Power generation (electricity)
    },
    industrialForAI: 8,
    notes: 'Much gas goes to residential heating and power gen. Industrial share limited.',
    implication: 'Gas peakers support grid but not suitable for 24/7 AI baseload.'
  },
  // China Coal (their baseload)
  {
    country: 'china',
    category: 'Coal Consumption (Power)',
    totalCapacity: 4500,
    unit: 'Mt/year (power sector)',
    breakdown: {
      industrial: 75,    // Industrial power
      residential: 8,    // Very little residential
      commercial: 7,
      dataCenter: 2,
      other: 8
    },
    industrialForAI: 200,
    notes: 'Coal is 60% of China electricity. Almost all serves industrial loads.',
    implication: 'Dirty but reliable. China has the baseload capacity, just needs to redirect it.'
  }
];

// Key insight summary
export const INDUSTRIAL_INSIGHT = {
  headline: 'China grid is 66% industrial vs US 25% - fundamentally different infrastructure',
  usChallenge: 'US grid designed for distributed residential consumption (A/C, heating). Adding concentrated industrial AI load requires new infrastructure.',
  chinaAdvantage: 'China grid built for factories. Adding AI is incremental - just another industrial load on existing industrial infrastructure.',
  dataCenterNature: 'AI data centers are HEAVY INDUSTRIAL: 24/7 baseload, massive concentrated demand (100MW-1GW per campus), requires transmission to site.',
  usResidentialTrap: 'US has added mostly solar/wind + gas peakers for residential. This doesn\'t help AI which needs nuclear/gas baseload.',
  implication: 'US needs INDUSTRIAL infrastructure buildout, not just more capacity. Different type of grid.'
};

// ============================================
// INVESTMENT REQUIREMENTS
// ============================================

export const INVESTMENT_REQUIREMENTS: InvestmentRequirement[] = [
  {
    category: 'Nuclear Power (to match China trajectory)',
    currentUSInvestment: 2,
    requiredUSInvestment: 25,
    totalGapCost: 400,
    timelineYears: 20,
    chinaInvestment: 30,
    fundingSources: ['DOE Loan Programs', 'IRA Tax Credits', 'Private'],
    notes: 'China spending ~$30B/year on nuclear. US needs $25B/year for 20 years to add 100 GW.'
  },
  {
    category: 'Grid Transmission (47,000 miles by 2035)',
    currentUSInvestment: 10,
    requiredUSInvestment: 40,
    totalGapCost: 400,
    timelineYears: 10,
    chinaInvestment: 80,
    fundingSources: ['BIL GRIP', 'DOE Loans', 'Utility Rate Base', 'Private'],
    notes: 'At $8M/mile, 47,000 miles = $376B. Current build rate would take 47 years.'
  },
  {
    category: 'Semiconductor Fabs (leading edge)',
    currentUSInvestment: 15,
    requiredUSInvestment: 30,
    totalGapCost: 200,
    timelineYears: 7,
    chinaInvestment: 50,
    fundingSources: ['CHIPS Act $52B', 'Private matching'],
    notes: 'CHIPS Act is $52B over 5 years. China\'s Big Fund III is $47B. Need sustained investment.'
  },
  {
    category: 'Critical Minerals Processing',
    currentUSInvestment: 1,
    requiredUSInvestment: 10,
    totalGapCost: 50,
    timelineYears: 10,
    chinaInvestment: 15,
    fundingSources: ['DOE Critical Minerals', 'DPA Title III', 'Private'],
    notes: 'Building full rare earth supply chain from scratch. 10-year minimum timeline.'
  },
  {
    category: 'AI Compute Infrastructure',
    currentUSInvestment: 150,
    requiredUSInvestment: 200,
    totalGapCost: 500,
    timelineYears: 5,
    chinaInvestment: 60,
    fundingSources: ['Private (hyperscalers)', 'Stargate JV'],
    notes: 'US actually leading here due to hyperscaler investment. Stargate alone is $100B.'
  },
  {
    category: 'Fusion Energy Development',
    currentUSInvestment: 0.7,
    requiredUSInvestment: 5,
    totalGapCost: 50,
    timelineYears: 15,
    chinaInvestment: 2,
    fundingSources: ['DOE FES', 'Private fusion companies'],
    notes: 'US private sector raising billions but federal program underfunded vs China state program.'
  },
  {
    category: 'TOTAL GAP CLOSURE',
    currentUSInvestment: 179,
    requiredUSInvestment: 310,
    totalGapCost: 1600,
    timelineYears: 20,
    chinaInvestment: 237,
    fundingSources: ['All of the above'],
    notes: 'US needs ~$130B/year additional investment across all categories to close gaps by 2045'
  }
];

// ============================================
// TIMELINE PROJECTIONS
// ============================================

export const TIMELINE_PROJECTIONS: TimelineProjection[] = [
  {
    metric: 'Nuclear Capacity (GW)',
    currentUSValue: 95,
    currentChinaValue: 57,
    usGrowthRate: 0,
    chinaGrowthRate: 14,
    crossoverYear: 2028,
    usTargetValue: 200,
    usTargetYear: 2050,
    yearsToTarget: 26,
    atCurrentRateYear: 9999, // Never at 0% growth
    acceleratedRateNeeded: 3 // 3% annual growth needed
  },
  {
    metric: 'Grid Transmission (miles)',
    currentUSValue: 240000,
    currentChinaValue: 930000,
    usGrowthRate: 0.4,
    chinaGrowthRate: 2.7,
    crossoverYear: null, // Already behind, gap widening
    usTargetValue: 287000,
    usTargetYear: 2035,
    yearsToTarget: 11,
    atCurrentRateYear: 2071,
    acceleratedRateNeeded: 1.6
  },
  {
    metric: 'Leading-Edge Fab Capacity (% global)',
    currentUSValue: 0,
    currentChinaValue: 0,
    usGrowthRate: 100, // From 0 to something
    chinaGrowthRate: 50,
    crossoverYear: null,
    usTargetValue: 20,
    usTargetYear: 2030,
    yearsToTarget: 6,
    atCurrentRateYear: 2028, // TSMC Arizona coming online
    acceleratedRateNeeded: 0 // On track if CHIPS fabs deliver
  },
  {
    metric: 'Battery Cell Capacity (GWh)',
    currentUSValue: 100,
    currentChinaValue: 900,
    usGrowthRate: 35,
    chinaGrowthRate: 25,
    crossoverYear: null, // Won't catch up
    usTargetValue: 500,
    usTargetYear: 2030,
    yearsToTarget: 6,
    atCurrentRateYear: 2028,
    acceleratedRateNeeded: 35 // Current rate sufficient for target
  },
  {
    metric: 'AI Compute (% global)',
    currentUSValue: 70,
    currentChinaValue: 15,
    usGrowthRate: 8,
    chinaGrowthRate: 12,
    crossoverYear: 2042, // If trends continue
    usTargetValue: 60,
    usTargetYear: 2030,
    yearsToTarget: 6,
    atCurrentRateYear: 2025, // Already exceeding
    acceleratedRateNeeded: 0
  }
];

// ============================================
// LEAPFROG STRATEGIES
// ============================================

export const LEAPFROG_STRATEGIES: LeapfrogStrategy[] = [
  {
    id: 'space-compute',
    name: 'Space-Based Data Centers',
    description: 'Deploy AI compute infrastructure in orbit using Starlink-style satellite constellations. Bypass terrestrial grid constraints entirely. Elon Musk has proposed this as achievable within 3-5 years leveraging SpaceX launch costs.',
    potentialImpact: 'Could add 10-50 GW equivalent compute capacity without ANY grid infrastructure. Solar power in space is 24/7 with no weather. Cooling is free (radiators to space). No permitting, no NIMBYism.',
    timelineYears: '3-7 years',
    investmentRequired: '$50-200B (comparable to Stargate but bypasses grid problem)',
    keyPlayers: ['SpaceX/Starlink', 'NVIDIA (space-rated GPUs)', 'Lumen Orbit', 'Microsoft Azure Space'],
    feasibility: 'demonstrated',
    gapsAddressed: ['grid-transmission', 'datacenter-capacity', 'grid-security'],
    risks: [
      'Space debris/Kessler syndrome',
      'Latency for training (fine for inference)',
      'Radiation hardening requirements',
      'Launch costs still high (~$1500/kg)',
      'Power/mass ratio challenges'
    ]
  },
  {
    id: 'fusion-sprint',
    name: 'Fusion Energy Manhattan Project',
    description: 'Accelerate fusion to commercial deployment by 2035 with $50B+ federal commitment. Multiple private companies (Commonwealth, Helion, TAE) are claiming 2028-2035 timelines with current funding.',
    potentialImpact: 'Unlimited clean baseload power. One fusion plant could power multiple large AI data centers. Eliminates entire nuclear waste and safety debate.',
    timelineYears: '8-15 years',
    investmentRequired: '$50-100B federal commitment (10x current)',
    keyPlayers: ['Commonwealth Fusion (SPARC)', 'Helion (Microsoft PPA)', 'TAE Technologies', 'DOE FES'],
    feasibility: 'demonstrated',
    gapsAddressed: ['nuclear-capacity', 'nuclear-fuel-supply', 'grid-transmission'],
    risks: [
      'Physics challenges remain (Q>10 sustained)',
      'Tritium breeding not demonstrated at scale',
      'First wall materials problem',
      'Could be 2040s, not 2030s'
    ]
  },
  {
    id: 'smr-blitz',
    name: 'SMR Factory Deployment',
    description: 'Build factory to produce standardized SMRs at rate of 10-20/year. Copy China\'s cookie-cutter approach with single certified design. NRC pre-approves sites, not individual reactors.',
    potentialImpact: 'Could add 5-10 GW/year nuclear capacity (matching China rate). Factory production cuts costs 50%+ vs bespoke construction.',
    timelineYears: '5-10 years',
    investmentRequired: '$20-30B for factory + regulatory reform',
    keyPlayers: ['TerraPower', 'X-energy', 'NuScale', 'Rolls-Royce SMR', 'BWXT'],
    feasibility: 'demonstrated',
    gapsAddressed: ['nuclear-capacity', 'datacenter-capacity'],
    risks: [
      'NRC licensing not designed for factory model',
      'First-of-a-kind still not proven (NuScale cancelled)',
      'HALEU fuel supply bottleneck',
      'State permitting still required'
    ]
  },
  {
    id: 'superconducting-grid',
    name: 'Superconducting Transmission',
    description: 'Deploy high-temperature superconducting cables for zero-loss power transmission. Single HTS cable can carry power of 100 conventional cables in 1/10 the footprint.',
    potentialImpact: 'Bypass right-of-way constraints. Underground deployment avoids permitting battles. 10x capacity in existing corridors.',
    timelineYears: '5-10 years for deployments',
    investmentRequired: '$5-10B R&D + demonstration projects',
    keyPlayers: ['AMSC', 'SuperPower', 'Nexans', 'DOE ARPA-E'],
    feasibility: 'demonstrated',
    gapsAddressed: ['grid-transmission'],
    risks: [
      'Cooling infrastructure required',
      'Cost still 5-10x conventional',
      'Long-distance not yet proven',
      'Cryogen supply chain'
    ]
  },
  {
    id: 'geothermal-anywhere',
    name: 'Enhanced Geothermal Systems (EGS)',
    description: 'Use drilling technology from fracking to access geothermal heat anywhere, not just volcanic regions. Fervo and others demonstrating at scale.',
    potentialImpact: 'Baseload clean power available in every state. No intermittency. Could add 100+ GW capacity. Google data center deal with Fervo proves model.',
    timelineYears: '3-7 years',
    investmentRequired: '$10-20B to scale',
    keyPlayers: ['Fervo Energy', 'Sage Geosystems', 'Quaise', 'Google'],
    feasibility: 'demonstrated',
    gapsAddressed: ['nuclear-capacity', 'datacenter-capacity', 'grid-transmission'],
    risks: [
      'Induced seismicity concerns',
      'Drilling costs still high',
      'Resource characterization uncertainty',
      'Permitting for fracking-adjacent tech'
    ]
  },
  {
    id: 'neuromorphic-efficiency',
    name: 'Neuromorphic/Analog AI Chips',
    description: 'Develop AI accelerators that are 100-1000x more energy efficient than GPUs. Analog compute, neuromorphic architectures. Could deliver same AI capability with 1% of power.',
    potentialImpact: 'Eliminates power constraint entirely. Current AI power demand based on inefficient GPU architecture. Hardware/software co-design could change equation.',
    timelineYears: '5-10 years',
    investmentRequired: '$10-20B R&D investment',
    keyPlayers: ['Intel (Loihi)', 'IBM (analog AI)', 'Rain AI', 'Groq', 'Cerebras'],
    feasibility: 'demonstrated',
    gapsAddressed: ['datacenter-capacity', 'grid-transmission'],
    risks: [
      'Software ecosystem lock-in to GPUs',
      'CUDA moat difficult to overcome',
      'Precision/accuracy tradeoffs',
      'Manufacturing complexity'
    ]
  }
];

// ============================================
// AGGREGATE CALCULATIONS
// ============================================

export function calculateTotalInvestmentGap(): {
  annualGap: number;
  totalGap: number;
  categoryBreakdown: { category: string; amount: number }[];
} {
  const relevant = INVESTMENT_REQUIREMENTS.filter(r => r.category !== 'TOTAL GAP CLOSURE');
  const annualGap = relevant.reduce((sum, r) => sum + (r.requiredUSInvestment - r.currentUSInvestment), 0);
  const totalGap = relevant.reduce((sum, r) => sum + r.totalGapCost, 0);

  return {
    annualGap,
    totalGap,
    categoryBreakdown: relevant.map(r => ({
      category: r.category,
      amount: r.totalGapCost
    })).sort((a, b) => b.amount - a.amount)
  };
}

export function getGapsWhereUSBehind(): QuantifiedMetric[] {
  return [
    ...POWER_GAPS,
    ...SEMICONDUCTOR_GAPS,
    ...MINERALS_GAPS,
    ...COMPUTE_GAPS
  ].filter(g => g.gapDirection === 'us-behind');
}

export function getGapsWhereUSAhead(): QuantifiedMetric[] {
  return [
    ...POWER_GAPS,
    ...SEMICONDUCTOR_GAPS,
    ...MINERALS_GAPS,
    ...COMPUTE_GAPS
  ].filter(g => g.gapDirection === 'us-ahead');
}

export function getCriticalPathItems(): string[] {
  return [
    'Nuclear: Build 5+ GW/year (currently 0) - requires NRC reform + HALEU supply',
    'Grid: Increase transmission build rate 5x (1,000 → 5,000 miles/year)',
    'Fabs: Execute CHIPS projects on schedule (TSMC, Intel, Samsung by 2027)',
    'Minerals: Build rare earth processing capacity (currently 0%)',
    'Maintain compute lead while solving power constraint'
  ];
}

// What China gets for population that we don't account for
export const POPULATION_NORMALIZATION = {
  usPopulation: 335_000_000,
  chinaPopulation: 1_425_000_000,
  ratio: 4.25, // China has 4.25x US population
  notes: 'Raw numbers favor China due to scale. Per-capita and per-GDP metrics more meaningful for AI competition since AI capability is about frontier performance, not total economy size.'
};
