# Sector Dependencies and Prerequisites
## The Hidden Infrastructure Required for the Build Economy

---

## The Core Insight

You can't build the end product without the prerequisites. The Build Clock tracks **$800B+ in announced investments**, but many of these depend on **unsexy, foundational infrastructure** that doesn't get headlines.

**Example:** You want rare earth magnets for EVs → but you need rare earth **refining** first. The U.S. has rare earth **mining** (Mountain Pass, CA), but **refining** is dominated by China.

**The opportunity:** Understanding these dependencies reveals:
1. **Where the real bottlenecks are** (not the flashy end products)
2. **What needs to be built first** (prerequisites)
3. **Where OT security fits** (every step of the chain needs OT)
4. **What Deloitte should focus on** (enable the prerequisites)

---

## Sector Deep-Dives

### 1. Rare Earths: Mining → Refining → Magnets

#### The Value Chain

```
MINING                    SEPARATION              REFINING              METAL/ALLOY          MAGNET MFG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extract ore from         Separate rare earths    Process to high-     Convert to metals/   Manufacture
ground (Mountain Pass,   from each other         purity oxides        alloys (NdFeB, etc.)  permanent magnets
CA; other deposits)      (solvent extraction)    (99.9%+ purity)      (neodymium,          (for motors, EVs,
                                                                    dysprosium, etc.)     wind turbines)
```

#### Current State

| Stage | U.S. Capacity | Global Leader | Gap |
|-------|---------------|---------------|-----|
| **Mining** | Mountain Pass (MP Materials) - 15% of global production | China: 60% | Moderate gap |
| **Separation** | Limited (MP Materials expanding) | China: 90%+ | **Critical gap** |
| **Refining** | Almost none | China: 95%+ | **Critical gap** |
| **Metal/Alloy** | Almost none | China: 90%+ | **Critical gap** |
| **Magnet Manufacturing** | Almost none | China: 90%+ | **Critical gap** |

#### The Prerequisite Problem

**You can't build EV motors without rare earth magnets.**
- EVs need permanent magnets (NdFeB) for motors
- Wind turbines need permanent magnets for generators
- Defense systems need rare earth magnets

**But the U.S. has almost no magnet manufacturing capacity.**
- Even if we mine rare earths, we ship them to China for processing
- China controls the entire chain from separation → magnets
- **This is a national security risk**

#### What Needs to Be Built

**Priority 1: Separation and Refining**
- MP Materials is expanding separation capacity (Mountain Pass, CA)
- Lynas (Australia) building separation in Texas
- **But refining to metal/alloy is still missing**

**Priority 2: Metal/Alloy Production**
- Convert refined oxides to neodymium, dysprosium, etc.
- Requires specialized metallurgical processes
- **Almost no U.S. capacity**

**Priority 3: Magnet Manufacturing**
- Convert metals/alloys to permanent magnets
- Requires precision manufacturing, sintering, coating
- **Almost no U.S. capacity**

#### OT Security Requirements

**Every stage needs OT:**
- **Mining:** Process control, safety systems, environmental monitoring
- **Separation/Refining:** Chemical process control (DCS), batch control, quality systems
- **Metal/Alloy:** Furnace control, metallurgical processes, quality testing
- **Magnet Manufacturing:** Precision manufacturing control, sintering furnaces, coating systems

**OT Security gaps:**
- Chemical processing facilities (separation/refining) are high-consequence (environmental, safety)
- Process control systems are often legacy (hard to secure)
- Limited OT security expertise in rare earths sector

#### Deloitte Opportunity

**"Rare Earth Supply Chain Security"**
- OT security for separation/refining facilities
- Process control modernization (secure legacy systems)
- Supply chain risk assessment (where are the bottlenecks?)
- Regulatory compliance (environmental, safety)

**Target clients:**
- MP Materials (mining → separation expansion)
- Lynas (separation facility in Texas)
- Future refining/magnet manufacturing facilities

---

### 2. Semiconductors: Materials → Equipment → Fabs

#### The Value Chain

```
MATERIALS                EQUIPMENT                FAB CONSTRUCTION      FAB OPERATIONS        PACKAGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Silicon wafers,         Lithography tools        Build cleanroom,      Wafer processing,    Package chips,
chemicals, gases,        (ASML, Nikon),          install tools,        testing, yield        test, ship
photoresist,            etch, deposition,        commission OT          optimization
specialty chemicals     metrology equipment      systems
```

#### Current State

| Stage | U.S. Capacity | Global Leader | Gap |
|-------|---------------|---------------|-----|
| **Materials** | Some (silicon wafers, chemicals) | Japan, Taiwan, China | Moderate gap |
| **Equipment** | Applied Materials (U.S.), but ASML (Netherlands) dominates lithography | Netherlands (ASML), Japan | **Critical gap in lithography** |
| **Fab Construction** | Strong (Turner, Jacobs, etc.) | U.S., Taiwan, South Korea | No gap |
| **Fab Operations** | Intel, GlobalFoundries, but TSMC (Taiwan) leads | Taiwan (TSMC), South Korea (Samsung) | **Critical gap in leading-edge** |
| **Packaging** | Limited advanced packaging | Taiwan, China | **Critical gap** |

#### The Prerequisite Problem

**You can't build a fab without:**
1. **Lithography equipment** (ASML EUV tools) - 2-3 year lead times, mostly from Netherlands
2. **Specialty chemicals** (photoresist, etchants) - mostly from Japan
3. **Silicon wafers** - mostly from Taiwan, Japan
4. **Process gases** (nitrogen, argon, specialty gases) - need on-site generation
5. **Ultra-pure water** - need water treatment facilities

**The CHIPS Act funds fabs, but:**
- Equipment lead times are the bottleneck (not construction)
- Materials supply chain is fragile (Japan, Taiwan dependencies)
- **You can't operate a fab without the equipment and materials**

#### What Needs to Be Built

**Priority 1: Equipment Manufacturing**
- ASML is building U.S. facility, but still years away
- Applied Materials expanding, but lithography is the gap
- **Equipment is the bottleneck, not fabs**

**Priority 2: Materials Supply Chain**
- Specialty chemicals (photoresist, etc.) - need domestic capacity
- Process gases - need on-site generation at fabs
- Silicon wafers - some U.S. capacity, but advanced nodes need Taiwan/Japan

**Priority 3: Advanced Packaging**
- Chiplet packaging, 3D stacking - mostly in Taiwan
- **Packaging is becoming the bottleneck** (not fab capacity)

#### OT Security Requirements

**Every stage needs OT:**
- **Materials:** Chemical process control, quality systems, environmental monitoring
- **Equipment:** Tool control systems, calibration, maintenance
- **Fab Operations:** MES, SCADA, cleanroom controls, quality systems, yield optimization
- **Packaging:** Precision manufacturing control, testing systems

**OT Security gaps:**
- Fabs are high-value targets (IP theft, supply chain disruption)
- Legacy equipment (hard to secure, can't patch)
- Vendor remote access (equipment suppliers need access)
- Process IP protection (recipes, yield data)

#### Deloitte Opportunity

**"Semiconductor Supply Chain Security"**
- OT security for fabs (greenfield and legacy)
- Equipment security (vendor access management)
- Process IP protection
- Supply chain risk assessment

**Target clients:**
- Intel, TSMC, Samsung, Micron (fab operators)
- Applied Materials, ASML (equipment suppliers)
- Future materials/chemicals facilities

---

### 3. Batteries: Mining → Processing → Cell Manufacturing

#### The Value Chain

```
MINING                    PROCESSING              MATERIALS              CELL MFG              PACK ASSEMBLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lithium, cobalt,        Convert to battery-     Cathode materials      Assemble cells        Package cells
nickel, graphite        grade chemicals         (NMC, LFP), anode       (winding, stacking,   into packs,
                        (lithium carbonate,     materials (graphite),  electrolyte fill,     test, ship
                        nickel sulfate, etc.)   separators, electrolyte sealing)
```

#### Current State

| Stage | U.S. Capacity | Global Leader | Gap |
|-------|---------------|---------------|-----|
| **Mining** | Some lithium (Nevada), but cobalt/nickel limited | Australia (lithium), DRC (cobalt), Indonesia (nickel) | Moderate gap |
| **Processing** | Almost none | China: 80%+ | **Critical gap** |
| **Materials** | Limited (some cathode, almost no anode) | China: 70%+ | **Critical gap** |
| **Cell Manufacturing** | Growing (Ford/SK, Toyota, LG, etc.) | China: 70%+ | **Moderate gap (improving)** |
| **Pack Assembly** | Growing (Tesla, Ford, etc.) | China: 60%+ | Moderate gap |

#### The Prerequisite Problem

**You can't build battery cells without:**
1. **Lithium processing** - Convert lithium ore to battery-grade lithium carbonate/hydroxide
2. **Nickel processing** - Convert nickel ore to battery-grade nickel sulfate
3. **Cathode materials** - Process chemicals into NMC, LFP cathodes
4. **Anode materials** - Process graphite into battery-grade anodes
5. **Electrolyte** - Specialty chemicals for battery electrolyte

**The IRA funds cell manufacturing, but:**
- Processing capacity is the bottleneck (not cell manufacturing)
- China controls processing (80%+ of global capacity)
- **You can't make cells without processed materials**

#### What Needs to Be Built

**Priority 1: Lithium Processing**
- Albemarle expanding in U.S., but still limited
- Need more processing capacity to support cell manufacturing
- **Processing is the bottleneck**

**Priority 2: Cathode/Anode Materials**
- Some cathode capacity (BASF, Umicore expanding)
- Almost no anode capacity (graphite processing)
- **Materials are the bottleneck**

**Priority 3: Critical Minerals Processing**
- Cobalt, nickel, manganese processing
- Almost no U.S. capacity
- **Dependency on China/other countries**

#### OT Security Requirements

**Every stage needs OT:**
- **Mining:** Process control, safety systems, environmental monitoring
- **Processing:** Chemical process control (DCS), batch control, quality systems, environmental
- **Materials:** Precision chemical processes, quality testing, environmental
- **Cell Manufacturing:** MES, quality systems, process control, safety (thermal runaway prevention)
- **Pack Assembly:** Manufacturing control, testing systems

**OT Security gaps:**
- Chemical processing (high-consequence: environmental, safety)
- Battery manufacturing (thermal runaway risk, quality critical)
- Process IP protection (formulations, recipes)

#### Deloitte Opportunity

**"Battery Supply Chain Security"**
- OT security for processing facilities (lithium, nickel, etc.)
- OT security for cell manufacturing (greenfield and existing)
- Process IP protection
- Supply chain risk assessment

**Target clients:**
- Albemarle, Livent (lithium processing)
- Ford/SK, Toyota, LG (cell manufacturing)
- Future cathode/anode materials facilities

---

### 4. Nuclear: Fuel → Components → Reactors

#### The Value Chain

```
FUEL CYCLE               COMPONENTS               REACTOR CONSTRUCTION  REACTOR OPERATIONS    DECOMMISSIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Uranium mining,          Reactor vessels,         Build containment,    I&C systems,          Decontamination,
enrichment, fuel         steam generators,        install systems,      safety systems,       waste management
fabrication (HALEU       pumps, valves,           commission            operations
for SMRs)                instrumentation                                  monitoring
```

#### Current State

| Stage | U.S. Capacity | Global Leader | Gap |
|-------|---------------|---------------|-----|
| **Fuel Cycle** | Limited (mining, some enrichment), **no HALEU production** | Russia (enrichment), France (fuel fabrication) | **Critical gap in HALEU** |
| **Components** | Limited (reactor vessels, pumps, valves) | South Korea, Japan, France | **Critical gap** |
| **Reactor Construction** | Limited (Westinghouse, but supply chain atrophied) | South Korea, China, Russia | **Critical gap** |
| **Reactor Operations** | Strong (existing fleet) | U.S., France, South Korea | No gap |
| **Decommissioning** | Limited | U.S., France | Moderate gap |

#### The Prerequisite Problem

**You can't build SMRs without:**
1. **HALEU fuel** (High-Assay Low-Enriched Uranium) - 5-20% enriched (vs. 3-5% for traditional reactors)
   - **No commercial HALEU production in U.S.**
   - TerraPower, X-energy, NuScale all need HALEU
   - DOE is funding HALEU production, but it's years away

2. **Nuclear-qualified components**
   - Reactor vessels, steam generators, pumps, valves
   - Must meet ASME N-stamp requirements
   - **Supply chain atrophied** (last new reactor was 1970s)

3. **Construction capability**
   - EPCs with nuclear experience
   - Qualified welders, inspectors
   - **Limited capacity**

**The nuclear restart/SMR push depends on:**
- HALEU availability (bottleneck)
- Component supply chain (bottleneck)
- Construction capacity (moderate bottleneck)

#### What Needs to Be Built

**Priority 1: HALEU Production**
- Centrus Energy building HALEU facility (Piketon, OH)
- DOE funding multiple HALEU projects
- **HALEU is the gating function for SMRs**

**Priority 2: Component Manufacturing**
- Reactor vessels (only a few foundries can make them)
- Steam generators, pumps, valves
- **Supply chain needs rebuilding**

**Priority 3: Construction Capacity**
- EPCs with nuclear experience (Fluor, Bechtel, etc.)
- Qualified workforce (welders, inspectors)
- **Limited capacity for multiple projects**

#### OT Security Requirements

**Every stage needs OT:**
- **Fuel Cycle:** Process control, safety systems, security (nuclear materials)
- **Components:** Manufacturing control, quality systems, N-stamp compliance
- **Reactor Operations:** I&C systems, safety-instrumented systems, cybersecurity (NRC requirements)
- **Decommissioning:** Process control, waste management, security

**OT Security gaps:**
- Nuclear facilities are highest-consequence (safety, national security)
- NRC cybersecurity requirements (10 CFR 73.54)
- Legacy systems (hard to secure, can't patch)
- Supply chain security (components, vendors)

#### Deloitte Opportunity

**"Nuclear Supply Chain Security"**
- OT security for fuel cycle facilities
- Component supply chain security
- Reactor OT security (I&C, safety systems)
- NRC compliance (cybersecurity requirements)

**Target clients:**
- Centrus Energy (HALEU production)
- TerraPower, X-energy, NuScale (SMR developers)
- Constellation, Southern Company (reactor operators)
- Component manufacturers (reactor vessels, etc.)

---

### 5. Grid Infrastructure: Generation → Transmission → Distribution

#### The Value Chain

```
GENERATION                TRANSMISSION             SUBSTATIONS           DISTRIBUTION          END USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Power plants             High-voltage lines       Step-down             Local lines,          Homes,
(nuclear, gas,           (765kV, 500kV, etc.)    transformers,         transformers,         businesses,
renewables)                                      protection systems    smart meters          EVs, data centers
```

#### Current State

| Stage | U.S. Capacity | Global Leader | Gap |
|-------|---------------|---------------|-----|
| **Generation** | Strong (nuclear, gas, renewables) | U.S., China | No gap |
| **Transmission** | Limited (aging infrastructure, bottlenecks) | China (HVDC), Europe | **Critical gap** |
| **Substations** | Aging (many need modernization) | U.S., Europe | Moderate gap |
| **Distribution** | Aging (smart grid limited) | U.S., Europe | Moderate gap |
| **End Use** | Growing (EVs, data centers driving demand) | U.S., China | Demand growing faster than supply |

#### The Prerequisite Problem

**You can't power new factories/data centers without:**
1. **Transmission capacity** - Need to move power from generation to load centers
   - **Transmission is the bottleneck** (not generation)
   - Interconnect timelines: 3-5 years
   - Transmission lines: 5-10 year permitting

2. **Transformers** - Large power transformers (LPTs) needed for substations
   - **2-3 year lead times** (mostly imported)
   - Single point of failure
   - **Transformers are the bottleneck**

3. **Substation capacity** - Need to step down transmission voltage
   - Many substations at capacity
   - Need new substations for new loads

**The AI data center buildout (Microsoft Stargate, etc.) requires:**
- 100MW+ per data center
- Grid capacity that doesn't exist
- **Transmission and transformers are the bottleneck**

#### What Needs to Be Built

**Priority 1: Transmission Lines**
- SunZia (NM → AZ): 550 miles, $11B (in progress)
- Other transmission projects needed
- **Transmission is the bottleneck**

**Priority 2: Transformer Manufacturing**
- Only a few foundries can make large power transformers
- Mostly imported (China, Europe)
- **Need domestic capacity**

**Priority 3: Substation Modernization**
- Many substations need upgrades
- Smart grid capabilities
- **Modernization needed**

#### OT Security Requirements

**Every stage needs OT:**
- **Generation:** SCADA, I&C systems, safety systems
- **Transmission:** EMS (Energy Management Systems), protection systems
- **Substations:** Substation automation, protection relays, monitoring
- **Distribution:** Smart grid, AMI (Advanced Metering Infrastructure), distribution management

**OT Security gaps:**
- Grid is critical infrastructure (NERC CIP requirements)
- Legacy systems (hard to secure)
- Supply chain security (transformers, equipment)
- Cyber-physical risk (grid attacks can cause blackouts)

#### Deloitte Opportunity

**"Grid Infrastructure Security"**
- OT security for generation facilities
- Transmission/substation security (NERC CIP compliance)
- Smart grid security
- Supply chain security (transformers, equipment)

**Target clients:**
- Grid operators (PJM, ERCOT, CAISO, etc.)
- Utilities (transmission, distribution)
- Generation companies (nuclear, renewables)
- Transformer manufacturers

---

## The Meta-Pattern

### Every Sector Has Prerequisites

| Sector | End Product | Prerequisites | Bottleneck |
|--------|-------------|---------------|------------|
| **Rare Earths** | Magnets | Mining → Separation → Refining → Metal/Alloy | **Refining** |
| **Semiconductors** | Chips | Materials → Equipment → Fabs | **Equipment** (lithography) |
| **Batteries** | Cells | Mining → Processing → Materials | **Processing** |
| **Nuclear** | Power | Fuel (HALEU) → Components → Reactors | **HALEU** |
| **Grid** | Power Delivery | Generation → Transmission → Substations | **Transmission** |

### The OT Security Connection

**Every prerequisite needs OT:**
- Mining/processing facilities need process control
- Manufacturing facilities need production control
- Infrastructure needs monitoring and control

**But OT security is often overlooked in prerequisites:**
- Focus is on end products (fabs, batteries, reactors)
- Prerequisites are "unsexy" (refining, processing, transformers)
- **But prerequisites are where the bottlenecks are**

### Deloitte's Opportunity

**"Enable the Prerequisites"**
- OT security for processing/refining facilities
- OT security for component manufacturing
- OT security for infrastructure (transmission, substations)
- Supply chain security (identify bottlenecks, secure them)

**The play:**
1. Understand the full value chain (not just end products)
2. Identify prerequisites and bottlenecks
3. Offer OT security for prerequisites (where others aren't looking)
4. Create competitive differentiation (we understand the whole system)

---

## Sector-Specific Deep-Dives Needed

For each sector, we should create a deep-dive that includes:
1. **Value chain map** (mining → processing → manufacturing → end product)
2. **Current state** (U.S. capacity vs. global leaders)
3. **Prerequisites and bottlenecks** (what needs to be built first)
4. **OT security requirements** (what OT systems are needed at each stage)
5. **Deloitte opportunity** (where we can play)

**Sectors to deep-dive:**
- Rare Earths (mining → refining → magnets)
- Semiconductors (materials → equipment → fabs)
- Batteries (mining → processing → cells)
- Nuclear (fuel → components → reactors)
- Grid (generation → transmission → distribution)
- Critical Minerals (lithium, cobalt, nickel, graphite)
- Chemicals (petrochemicals, specialty chemicals)
- Water (treatment, distribution, infrastructure)

---

## Next Steps

1. **Create sector deep-dives** for each of the above sectors
2. **Map OT security requirements** at each stage of the value chain
3. **Identify Deloitte opportunities** in prerequisites (not just end products)
4. **Build eminence** around understanding the whole system

**The insight:** The build economy isn't just about building end products. It's about building the **prerequisites** that enable end products. And every prerequisite needs OT security.





