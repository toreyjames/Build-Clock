-- Seed data for Genesis Radar
-- Run this after schema.sql

INSERT INTO opportunities (id, title, subtitle, genesis_pillar, genesis_connection, entity, entity_type, sector, location, state, estimated_value, contract_type, funding_source, procurement_stage, urgency, key_date, key_date_description, posted_date, response_deadline, ot_relevance, ot_systems, ot_scope, regulatory_drivers, compliance_requirements, deloitte_services, deloitte_angle, existing_relationship, likely_primes, competitors, partner_opportunities, sources, confidence, notes)
VALUES

-- STARGATE
('stargate-phase1', 'Stargate AI Infrastructure - Phase 1', '$100B joint venture for AI compute infrastructure, starting in Texas', 'ai-compute', 'The centerpiece of Genesis. Stargate is the single largest AI infrastructure investment ever announced. Phase 1 in Abilene will require massive OT security for power distribution, cooling, and physical security integration.', 'Stargate LLC (OpenAI, SoftBank, Oracle, MGX)', 'enterprise', 'data-centers', 'Abilene', 'TX', 100000000000, 'direct', 'Private (SoftBank $100B commitment)', 'execution', 'this-month', '2025-03-15', 'Phase 1 site preparation complete, security vendor selection begins', '2025-01-21', NULL, 'critical', ARRAY['scada', 'bms', 'ems', 'hmi'], 'Critical OT security requirements:
- Campus-wide SCADA for 1.2GW power distribution
- Building Management Systems across multiple facilities
- Energy Management System integration with ERCOT grid
- Physical security/access control integration with cyber
- Cooling system controls (likely liquid cooling for AI chips)
- Generator and UPS control systems
- Fire suppression system integration', ARRAY['executive-order'], 'Executive Order 14110 AI security requirements. Texas PUC reliability standards. Custom security framework likely given national security implications.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation', 'soc-integration'], 'Deloitte has relationships across all JV partners. Can position as neutral integrator for security architecture spanning Oracle cloud, SoftBank infrastructure, and OpenAI requirements. National security clearance capability is differentiator.', 'some', ARRAY['Oracle', 'Fluor', 'Jacobs'], ARRAY['Accenture Federal', 'Booz Allen', 'Dragos'], ARRAY['Claroty', 'Nozomi Networks', 'Fortinet'], '[{"title": "Stargate Announcement - OpenAI", "url": "https://openai.com/index/announcing-the-stargate-project/", "date": "2025-01-21"}, {"title": "White House Briefing", "url": "https://www.whitehouse.gov/", "date": "2025-01-21"}]'::jsonb, 'confirmed', 'Highest priority target. Get in front of Oracle and SoftBank infrastructure teams immediately. This will set the template for all subsequent AI infrastructure security.'),

-- MICROSOFT
('microsoft-stargate-dc', 'Microsoft AI Data Center Expansion', '$80B AI infrastructure buildout through 2025, multiple sites', 'ai-compute', 'Microsoft is building parallel AI infrastructure to support Azure AI and Copilot. Massive global buildout with significant US footprint. Interconnects with their nuclear power strategy.', 'Microsoft', 'enterprise', 'data-centers', 'Multiple (WI, GA, IN, WY)', 'US', 80000000000, 'direct', 'Private', 'execution', 'this-quarter', '2025-04-01', 'Wisconsin campus Phase 2 security RFP expected', '2024-11-15', NULL, 'critical', ARRAY['bms', 'ems', 'scada', 'hmi'], 'OT security across multiple greenfield sites:
- Building automation (Honeywell/JCI systems likely)
- Power distribution and UPS controls
- Liquid cooling systems for GPU clusters
- Integration with renewable energy sources
- Campus security systems', ARRAY['executive-order'], 'Azure compliance framework. SOC 2 Type II. ISO 27001. Executive Order 14110.', ARRAY['ot-assessment', 'ics-architecture', 'soc-integration', 'vendor-risk'], 'Existing Microsoft relationship through commercial work. Can leverage Azure practice connections. Position OT security as extension of existing cyber relationship.', 'strong', ARRAY['Microsoft internal', 'JLL', 'CBRE'], ARRAY['Accenture', 'PwC', 'EY'], ARRAY['Claroty', 'Microsoft security partners'], '[{"title": "Microsoft FY25 Capex Guidance", "url": "https://microsoft.com/investor", "date": "2024-10-30"}]'::jsonb, 'confirmed', 'Leverage existing Microsoft relationship. Coordinate with commercial Microsoft team. Data center security is a growth area for them.'),

-- THREE MILE ISLAND
('constellation-tmi', 'Three Mile Island Unit 1 Restart', 'Microsoft-backed nuclear restart for AI data center power', 'power', 'Direct link to AI compute. Microsoft signed 20-year PPA specifically to power data centers. First major nuclear restart driven by AI power demand. Sets precedent for additional restarts.', 'Constellation Energy', 'utility', 'nuclear', 'Middletown', 'PA', 1600000000, 'direct', 'Private (Microsoft PPA)', 'pre-solicitation', 'this-quarter', '2025-06-01', 'NRC license amendment application expected', '2024-09-20', NULL, 'critical', ARRAY['dcs', 'scada', 'sis', 'hmi', 'historian'], 'Nuclear-grade OT security requirements:
- Distributed Control System (DCS) for reactor operations
- Safety Instrumented Systems (SIS) - safety critical
- Balance of plant SCADA systems
- Cybersecurity Assessment per 10 CFR 73.54
- Security plan update for NRC
- Physical-cyber security integration
- Digital I&C modernization likely needed', ARRAY['nrc-cyber'], '10 CFR 73.54 Cyber Security Rule. NRC Regulatory Guide 5.71. NEI 08-09 template. Safety/security interface requirements.', ARRAY['nuclear-cyber', 'ot-assessment', 'ics-architecture', 'incident-response'], 'Deloitte nuclear cyber team is one of few with NRC regulatory experience. Can support license amendment application cybersecurity sections. Previous Constellation work is leverage point.', 'some', ARRAY['Constellation internal', 'Sargent & Lundy', 'Enercon'], ARRAY['INL', 'Sandia (for assessments)', 'Nuclear consultancies'], ARRAY['Dragos', 'Claroty', 'Nuclear engineering firms'], '[{"title": "Microsoft-Constellation PPA Announcement", "url": "https://news.microsoft.com/", "date": "2024-09-20"}, {"title": "Constellation Investor Call", "url": "https://investors.constellationenergy.com/", "date": "2024-09-20"}]'::jsonb, 'confirmed', 'High-profile project. NRC will scrutinize cybersecurity closely given public attention on TMI. Position Deloitte as the safe choice for regulatory compliance.'),

-- NUSCALE
('nuscale-cfpp', 'NuScale VOYGR SMR - Carbon Free Power Project', 'First US small modular reactor, Idaho National Laboratory', 'power', 'SMRs are the future of AI power. NuScale is first to market with NRC design certification. Success here enables rapid deployment for data center power nationwide.', 'NuScale Power / UAMPS', 'utility', 'nuclear', 'Idaho Falls', 'ID', 5300000000, 'subcontract', 'DOE ARDP, IRA tax credits, UAMPS utilities', 'execution', 'this-month', '2025-03-01', 'Cybersecurity program plan due to NRC', '2024-01-15', NULL, 'critical', ARRAY['dcs', 'sis', 'hmi', 'historian', 'ems'], 'First-of-a-kind SMR requires comprehensive cyber program:
- Module Protection System (MPS) - safety critical digital I&C
- NuScale Automation Platform (NAP)
- Main Control Room digital systems
- Remote monitoring capabilities (unique to SMR)
- Multi-module coordination controls
- Grid integration controls
- Emergency response systems', ARRAY['nrc-cyber', 'nerc-cip'], '10 CFR 73.54 full compliance. First SMR cyber program will set template for all future SMRs. NERC CIP for grid connection. DOE ARDP security requirements.', ARRAY['nuclear-cyber', 'ics-architecture', 'ot-assessment', 'tabletop-exercises'], 'First SMR = first template. Whoever does the cyber program here will have the playbook for every future SMR (dozens planned). Long-term strategic value beyond this single project.', 'none', ARRAY['Fluor', 'NuScale internal'], ARRAY['INL cyber team', 'Sandia', 'Nuclear consultancies'], ARRAY['Idaho National Laboratory', 'Dragos'], '[{"title": "NuScale CFPP Update", "url": "https://www.nuscalepower.com/", "date": "2025-01-15"}, {"title": "DOE ARDP Award", "url": "https://www.energy.gov/", "date": "2024-10-01"}]'::jsonb, 'confirmed', 'Strategic importance exceeds contract value. This is about owning the SMR cyber market. Must pursue aggressively.'),

-- DOE GRIP
('doe-grip-round3', 'DOE GRIP Round 3 - Grid Resilience', '$2.2B for transmission and grid-enhancing technologies', 'power', 'Grid must expand and harden to support AI data center load. GRIP funds transmission upgrades that enable new data center connections. Every project requires NERC CIP.', 'Department of Energy - Grid Deployment Office', 'federal', 'grid', 'Multiple', 'US', 2200000000, 'subcontract', 'Bipartisan Infrastructure Law', 'rfp-open', 'this-week', '2025-02-28', 'Concept paper deadline', '2025-01-08', '2025-04-15', 'critical', ARRAY['scada', 'ems', 'hmi', 'historian'], 'All GRIP-funded projects must meet cybersecurity requirements:
- NERC CIP compliance for all bulk electric system assets
- Substation automation security
- Energy Management System (EMS) integration
- Grid-enhancing technology (GETs) cyber requirements
- SCADA system security assessments
- Vendor security requirements', ARRAY['nerc-cip'], 'NERC CIP v7 minimum. DOE cybersecurity requirements for funded projects. Supply chain risk management (CIP-013).', ARRAY['nerc-cip-compliance', 'ot-assessment', 'vendor-risk', 'ics-architecture'], 'Utilities receiving GRIP funds need NERC CIP help. Position as compliance partner for awardees. Work with transmission developers who are winning awards.', 'some', ARRAY['Various utilities and transmission developers'], ARRAY['1898 & Co', 'Black & Veatch', 'Burns & McDonnell', 'Utility internal'], ARRAY['Transmission developers', 'Grid technology vendors'], '[{"title": "GRIP Round 3 FOA", "url": "https://www.energy.gov/gdo/grid-resilience-and-innovation-partnerships-grip-program", "date": "2025-01-08"}]'::jsonb, 'confirmed', 'Concept papers due end of February. Identify utilities likely to apply and offer NERC CIP support as part of their application.'),

-- ERCOT
('ercot-grid-security', 'ERCOT Grid Security Enhancement Program', 'Texas grid hardening post-Winter Storm, AI load growth', 'power', 'Texas is ground zero for AI data center growth (Stargate, Meta, AWS, Google). ERCOT must harden grid to support massive new load while preventing Winter Storm Uri repeat.', 'ERCOT / Texas PUC', 'state-local', 'grid', 'Texas-wide', 'TX', 500000000, 'direct', 'Texas ratepayers, federal grants', 'pre-solicitation', 'this-quarter', '2025-05-01', 'PUC security rulemaking expected', '2024-12-01', NULL, 'critical', ARRAY['ems', 'scada', 'hmi', 'historian'], 'ERCOT-wide security improvements:
- Energy Management System (EMS) security hardening
- Market systems cybersecurity
- Generator interconnection security requirements
- Substation security standards
- Weather-related resilience (freeze protection controls)
- Data center interconnection security standards', ARRAY['nerc-cip', 'executive-order'], 'NERC CIP plus Texas-specific requirements. PUC weatherization rules with cyber components. New data center interconnection standards.', ARRAY['ot-assessment', 'ics-architecture', 'nerc-cip-compliance', 'incident-response'], 'Texas nexus with Stargate creates opportunity. Position as advisor who understands both grid operations and data center requirements. PUC relationship is key.', 'none', ARRAY['ERCOT internal', 'Grid consultants'], ARRAY['1898 & Co', 'Black & Veatch', 'West Monroe'], ARRAY['Texas utilities', 'Data center developers'], '[{"title": "Texas PUC Grid Reliability Docket", "url": "https://www.puc.texas.gov/", "date": "2024-12-01"}]'::jsonb, 'likely', 'Watch PUC dockets closely. Data center-grid interconnection is emerging issue. Position as bridge between utility and tech worlds.'),

-- TSMC
('tsmc-arizona-p2', 'TSMC Arizona Fab 2 & 3', '$65B investment, 2nm and 3nm production', 'semiconductors', 'TSMC fabs produce the advanced chips that power AI. Without domestic fab capacity, Genesis depends on Taiwan. This is existential for US AI ambitions.', 'TSMC Arizona', 'enterprise', 'semiconductors', 'Phoenix', 'AZ', 65000000000, 'direct', 'CHIPS Act ($6.6B), private', 'execution', 'this-month', '2025-03-01', 'Fab 2 equipment installation security requirements finalized', '2024-04-08', NULL, 'critical', ARRAY['dcs', 'mes', 'scada', 'hmi', 'sis'], 'Semiconductor fab OT security is uniquely complex:
- Manufacturing Execution System (MES) - recipe management, wafer tracking
- Process control systems for lithography, etching, deposition
- Cleanroom environmental controls (HVAC, particle monitoring)
- Chemical delivery systems (toxic gases, acids)
- Ultra-pure water systems
- Fab-wide SCADA integration
- Safety Instrumented Systems for hazardous processes
- Intellectual property protection (process recipes are crown jewels)', ARRAY['cmmc', 'cfats', 'executive-order'], 'CHIPS Act security requirements (CHIPS R&D). CFATS for chemical handling. Likely classified work = CMMC requirements. IP protection mandates.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'], 'Fab security is deeply specialized. Position Deloitte as the firm that understands both semiconductor manufacturing AND security. Few competitors have both.', 'none', ARRAY['TSMC internal', 'Bechtel (construction)', 'M+W Group'], ARRAY['Semiconductor consultancies', 'Applied Materials ecosystem'], ARRAY['Dragos', 'Claroty', 'Fab equipment vendors'], '[{"title": "CHIPS Act Award - TSMC", "url": "https://www.commerce.gov/", "date": "2024-04-08"}, {"title": "TSMC Arizona Update", "url": "https://pr.tsmc.com/", "date": "2025-01-15"}]'::jsonb, 'confirmed', 'TSMC culture is insular. Need warm introduction. Explore CHIPS Program Office as entry point - they care about security of funded projects.'),

-- INTEL OHIO
('intel-ohio', 'Intel Ohio Fab Complex', '$28B for two leading-edge fabs, largest private investment in Ohio history', 'semiconductors', 'Intel fabs for advanced packaging and logic chips. Critical for AI chip production independence. CHIPS Act flagship project.', 'Intel Corporation', 'enterprise', 'semiconductors', 'New Albany', 'OH', 28000000000, 'direct', 'CHIPS Act ($8.5B), private', 'execution', 'this-quarter', '2025-06-01', 'Phase 1 fab security systems RFP', '2024-03-20', NULL, 'critical', ARRAY['dcs', 'mes', 'scada', 'hmi', 'sis', 'bms'], 'Two fabs plus advanced packaging facility:
- Manufacturing Execution Systems integration
- Process control for EUV lithography
- Cleanroom and subfab controls
- Chemical and gas delivery systems
- Ultra-pure water treatment
- Waste treatment facilities
- Campus-wide building management
- Security Operations Center integration', ARRAY['cmmc', 'cfats', 'executive-order'], 'CHIPS Act security requirements. Defense production = CMMC likely. CFATS for chemical facilities. Ohio environmental permits.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation', 'soc-integration', 'vendor-risk'], 'Deloitte has existing Intel relationship through commercial cyber. Leverage to position for OT work. Intel is more accessible than TSMC.', 'strong', ARRAY['Intel internal', 'Construction JV'], ARRAY['Accenture', 'Intel internal security'], ARRAY['Claroty', 'Honeywell', 'Intel ecosystem'], '[{"title": "CHIPS Act Award - Intel", "url": "https://www.commerce.gov/", "date": "2024-03-20"}, {"title": "Intel Ohio Update", "url": "https://www.intel.com/ohio", "date": "2025-01-10"}]'::jsonb, 'confirmed', 'Use existing Intel relationship. Construction delays create opportunity - they need to catch up and may accelerate procurement.'),

-- SAMSUNG
('samsung-taylor', 'Samsung Taylor Fab', '$17B advanced logic fab, CHIPS Act funding', 'semiconductors', 'Samsung foundry for US customers. Reduces Taiwan dependency for AI chip production. Part of CHIPS Act strategy.', 'Samsung Electronics', 'enterprise', 'semiconductors', 'Taylor', 'TX', 17000000000, 'direct', 'CHIPS Act ($6.4B), private', 'execution', 'this-quarter', '2025-04-15', 'Security vendor evaluations ongoing', '2024-04-15', NULL, 'critical', ARRAY['dcs', 'mes', 'scada', 'hmi'], 'Leading-edge logic fab:
- Samsung proprietary MES
- Process control systems
- Cleanroom environmental controls
- Chemical/gas delivery
- Water treatment
- Fab-wide integration', ARRAY['cmmc', 'cfats'], 'CHIPS Act security. CFATS likely. Korean security standards may also apply.', ARRAY['ot-assessment', 'ics-architecture', 'vendor-risk'], 'Samsung US entity more accessible than Korean HQ. Focus on US compliance requirements as entry point.', 'none', ARRAY['Samsung internal', 'Construction contractors'], ARRAY['Korean consultancies', 'Big 4'], ARRAY['US security vendors'], '[{"title": "CHIPS Act Award - Samsung", "url": "https://www.commerce.gov/", "date": "2024-04-15"}]'::jsonb, 'confirmed', 'Korean company culture - relationships matter. Find Korean-American team members or partners.'),

-- MICRON
('micron-idaho', 'Micron Idaho Memory Fab', '$15B DRAM expansion, first new US memory fab in 20 years', 'semiconductors', 'Memory is critical for AI - models require massive DRAM. US has zero domestic memory production. This is strategic independence.', 'Micron Technology', 'enterprise', 'semiconductors', 'Boise', 'ID', 15000000000, 'direct', 'CHIPS Act ($6.1B), private', 'execution', 'this-quarter', '2025-05-01', 'Cleanroom construction phase - OT systems procurement', '2024-04-25', NULL, 'critical', ARRAY['dcs', 'mes', 'scada', 'hmi'], 'DRAM fabrication facility:
- Memory-specific process control
- High-volume manufacturing systems
- Cleanroom controls
- Chemical systems
- Existing Boise infrastructure integration', ARRAY['cmmc', 'cfats'], 'CHIPS Act security. CFATS. Memory is defense-critical = CMMC likely.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation'], 'Micron HQ in Boise. Local presence and relationship building important. Idaho is underserved market.', 'none', ARRAY['Micron internal'], ARRAY['Local Idaho firms', 'Big 4'], ARRAY['Boise tech community'], '[{"title": "CHIPS Act Award - Micron", "url": "https://www.commerce.gov/", "date": "2024-04-25"}]'::jsonb, 'confirmed', 'Micron is more scrappy/accessible than Intel or TSMC. Direct outreach to CISO may work.'),

-- LIQUID COOLING
('dc-water-cooling', 'Data Center Liquid Cooling Infrastructure', 'Industry-wide shift to liquid cooling for AI chips', 'cooling', 'AI chips (H100, B200) generate too much heat for air cooling. Every new AI data center needs liquid cooling. This creates OT systems that didnt exist before.', 'Multiple (all hyperscalers)', 'enterprise', 'water', 'Multiple', 'US', 10000000000, 'direct', 'Private', 'execution', 'this-quarter', NULL, NULL, '2024-01-01', NULL, 'high', ARRAY['scada', 'bms', 'plc'], 'New OT systems for liquid cooling:
- Coolant distribution units (CDUs)
- Rear-door heat exchangers
- Immersion cooling tanks
- Water treatment for cooling loops
- Chiller plant controls
- Integration with facility BMS
- Leak detection systems', ARRAY[]::text[], 'Varies by facility and customer requirements. Generally follows data center security standards.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation'], 'Emerging area - few have expertise. Position as firm that understands both traditional BMS security AND new liquid cooling OT.', 'some', ARRAY['Vertiv', 'Schneider', 'Cooling vendors'], ARRAY['Equipment vendors bundling security'], ARRAY['Vertiv', 'Schneider Electric', 'Cooling startups'], '[{"title": "Liquid Cooling Market Analysis", "url": "https://www.datacenterknowledge.com/", "date": "2025-01-01"}]'::jsonb, 'confirmed', 'Horizontal opportunity across all AI data centers. Develop cooling OT security methodology that can be reused.'),

-- MP MATERIALS
('mp-materials', 'MP Materials Rare Earth Processing', 'Only US rare earth mine, expanding processing capabilities', 'supply-chain', 'Rare earths are essential for electronics, EVs, defense. China controls 90% of processing. MP Materials is US attempt at independence.', 'MP Materials', 'enterprise', 'critical-minerals', 'Mountain Pass, CA / Fort Worth, TX', 'CA', 700000000, 'direct', 'DOD contracts, DOE loans, private', 'execution', 'this-quarter', '2025-04-01', 'Fort Worth magnet facility ramping - security assessment needed', '2024-08-01', NULL, 'high', ARRAY['dcs', 'scada', 'plc', 'hmi'], 'Mining and chemical processing:
- Mining operations control systems
- Ore processing controls
- Chemical separation processes (solvent extraction)
- Magnet manufacturing (Fort Worth)
- Environmental monitoring
- Water treatment', ARRAY['cmmc'], 'DOD contracts = CMMC. Environmental permits. Mining safety regulations.', ARRAY['ot-assessment', 'ics-architecture', 'vendor-risk'], 'Defense supply chain angle is compelling. Position security as enabler of DOD contracts.', 'none', ARRAY['MP Materials internal'], ARRAY['Mining consultancies'], ARRAY['Mining technology vendors'], '[{"title": "MP Materials DOD Contract", "url": "https://mpmaterials.com/", "date": "2024-08-01"}]'::jsonb, 'confirmed', 'Only US rare earth source. Strategic importance to DOD. Security is national security.'),

-- REDWOOD
('redwood-materials', 'Redwood Materials Battery Recycling', '$3.5B battery recycling and materials facility', 'supply-chain', 'Battery materials recycling closes the loop on EV supply chain. Reduces dependence on Chinese battery materials. Founded by former Tesla CTO.', 'Redwood Materials', 'enterprise', 'critical-minerals', 'McCarran', 'NV', 3500000000, 'direct', 'DOE loan ($2B), IRA tax credits, private', 'execution', 'this-quarter', '2025-05-01', 'Phase 2 expansion - security systems procurement', '2024-10-15', NULL, 'high', ARRAY['dcs', 'scada', 'plc', 'mes'], 'Battery recycling and refining:
- Battery disassembly automation
- Hydrometallurgical processing (chemical)
- Pyrometallurgical processing (thermal)
- Material refining controls
- Environmental systems
- Hazardous material handling', ARRAY['cfats'], 'CFATS for chemical processes. EPA environmental. OSHA process safety.', ARRAY['ot-assessment', 'ics-architecture'], 'Fast-growing company, likely needs to professionalize security. Startup culture may be receptive to external expertise.', 'none', ARRAY['Redwood internal'], ARRAY['Startup-friendly consultancies'], ARRAY['Battery industry ecosystem'], '[{"title": "DOE Loan to Redwood Materials", "url": "https://www.energy.gov/lpo/", "date": "2024-10-15"}]'::jsonb, 'confirmed', 'JB Straubel (founder) is high-profile in tech. May respond to thought leadership on battery supply chain security.'),

-- HYDROGEN HUBS
('doe-hydrogen-hubs', 'Regional Clean Hydrogen Hubs', '$7B for seven regional hydrogen production hubs', 'power', 'Hydrogen is future fuel for heavy industry and potentially data centers. DOE investing heavily. Each hub has significant OT.', 'Department of Energy - OCED', 'federal', 'clean-energy', 'Seven regions nationwide', 'US', 7000000000, 'subcontract', 'Bipartisan Infrastructure Law', 'awarded', 'this-month', '2025-03-15', 'Hub cybersecurity plans due to DOE', '2025-01-12', NULL, 'critical', ARRAY['dcs', 'scada', 'sis', 'plc'], 'Hydrogen production facilities:
- Electrolysis control systems
- Steam methane reforming controls (for blue hydrogen)
- Carbon capture integration
- Compression and storage systems
- Pipeline distribution controls
- Safety Instrumented Systems (hydrogen is explosive)
- Environmental monitoring', ARRAY['tsa-pipeline', 'cfats'], 'DOE cybersecurity requirements. TSA pipeline directives for hydrogen transport. CFATS for chemical facilities.', ARRAY['ot-assessment', 'ics-architecture', 'incident-response', 'tabletop-exercises'], 'DOE relationship is key. Seven hubs = seven opportunities. Position as national hydrogen security expert.', 'some', ARRAY['Hub lead organizations (varies by region)'], ARRAY['National labs', 'Oil & gas consultancies'], ARRAY['Hydrogen technology vendors', 'Regional partners'], '[{"title": "H2Hubs Selection", "url": "https://www.energy.gov/oced/regional-clean-hydrogen-hubs", "date": "2023-10-13"}]'::jsonb, 'confirmed', 'Seven hubs across the country. Each needs cybersecurity. Work the DOE relationship to get intro to hub leads.'),

-- PANASONIC
('panasonic-kansas', 'Panasonic EV Battery Gigafactory', '$4B battery cell manufacturing in Kansas', 'supply-chain', 'EV batteries are critical for clean energy transition. Panasonic supplies Tesla and others. Domestic production reduces supply chain risk.', 'Panasonic Energy', 'enterprise', 'ev-battery', 'De Soto', 'KS', 4000000000, 'direct', 'IRA tax credits, private', 'execution', 'this-quarter', '2025-06-01', 'Production ramp - operational security phase', '2024-07-01', NULL, 'critical', ARRAY['mes', 'dcs', 'scada', 'plc', 'sis'], 'Battery cell manufacturing:
- Electrode manufacturing controls
- Cell assembly automation
- Formation cycling systems
- Quality control integration
- Dry room environmental controls
- Safety systems (lithium fire risk)
- MES for production tracking', ARRAY['cfats'], 'CFATS for chemical storage. OSHA process safety. Customer (Tesla, etc.) security requirements.', ARRAY['ot-assessment', 'ics-architecture', 'network-segmentation', 'vendor-risk'], 'Japanese company may be open to Big 4 relationship. Battery manufacturing is hot sector.', 'none', ARRAY['Panasonic internal'], ARRAY['Japanese consultancies', 'Manufacturing specialists'], ARRAY['Battery equipment vendors'], '[{"title": "Panasonic Kansas Announcement", "url": "https://na.panasonic.com/", "date": "2024-07-01"}]'::jsonb, 'confirmed', 'Similar opportunity at Panasonic Nevada expansion. Bundle together for efficiency.'),

-- LG
('lg-arizona', 'LG Energy Solution Arizona', '$5.5B cylindrical battery manufacturing', 'supply-chain', 'LG batteries power multiple EV brands. Arizona location near semiconductor cluster creates manufacturing hub.', 'LG Energy Solution', 'enterprise', 'ev-battery', 'Queen Creek', 'AZ', 5500000000, 'direct', 'IRA tax credits, private', 'execution', 'this-quarter', '2025-04-01', 'Construction phase - security infrastructure', '2024-10-20', NULL, 'critical', ARRAY['mes', 'dcs', 'scada', 'sis'], 'Similar to other battery fabs:
- High-volume cell manufacturing
- Electrode and assembly automation
- Formation and testing
- Safety systems
- Environmental controls', ARRAY['cfats'], 'CFATS. Customer security requirements.', ARRAY['ot-assessment', 'ics-architecture'], 'Korean company - similar approach to Samsung. Arizona presence important.', 'none', ARRAY['LG internal'], ARRAY['Korean consultancies'], ARRAY['Arizona tech community'], '[{"title": "LG Arizona Announcement", "url": "https://www.lgensol.com/", "date": "2024-10-20"}]'::jsonb, 'confirmed', 'Arizona is becoming battery hub. Consider Arizona-wide strategy covering LG, Lucid, others.');
