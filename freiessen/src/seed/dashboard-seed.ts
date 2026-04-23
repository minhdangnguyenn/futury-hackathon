import type { Signal, Insight, Trend } from "../types/dashboard";

type SeedSignal = Omit<Signal, "id">;
type SeedInsight = Omit<Insight, "id">;
type SeedTrend = Omit<Trend, "id">;

/** Returns an ISO-8601 date string for N days before today. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0] + "T00:00:00.000Z";
}

// ─── SIGNALS (30 records) ────────────────────────────────────────────────────

export const seedSignals: SeedSignal[] = [
  // ── competitor_move (10) ──────────────────────────────────────────────────
  {
    title: "Watts Water Technologies launches smart pressure-balancing valve line",
    content:
      "Watts announced a new series of electronically controlled pressure-balancing valves targeting commercial plumbing installations. The product integrates with BACnet/IP building automation systems and undercuts Viega Pressfit pricing by ~12%.",
    sourceUrl: "https://www.wattswater.com/press/smart-pbv-launch",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(1),
    personas: ["josef", "steffen"],
    useCase: "competitor_move",
  },
  {
    title: "Geberit files patent for self-sealing push-fit connector",
    content:
      "A newly published EP patent from Geberit describes a push-fit connector with an integrated self-sealing membrane that eliminates the need for a separate O-ring. If commercialised, this could challenge Viega Pressfit installation speed advantage.",
    sourceUrl: "https://patents.ep.org/EP4123456",
    sourceCategory: "patent",
    topic: "Competitor Activity",
    detectedAt: daysAgo(3),
    personas: ["david", "volkmar"],
    useCase: "competitor_move",
  },
  {
    title: "Uponor expands Kevo smart valve distribution to DACH region",
    content:
      "Uponor confirmed distribution agreements with three major German wholesalers for its Kevo IoT valve range. The product targets the same smart building segment as Viega upcoming connected valve portfolio.",
    sourceUrl: "https://www.uponor.com/news/kevo-dach-expansion",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(5),
    personas: ["steffen", "nick"],
    useCase: "competitor_move",
  },
  {
    title: "Rehau introduces recycled-content press fittings for sustainability certification",
    content:
      "Rehau new EcoPress line uses 40% post-consumer recycled brass and ships with EPD documentation. Several large German contractors have already specified it for DGNB-certified projects, a segment Viega currently dominates.",
    sourceUrl: "https://www.rehau.com/de/ecopress",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(7),
    personas: ["volkmar", "josef"],
    useCase: "competitor_move",
  },
  {
    title: "Forum discussion: installers comparing Viega vs Flamco expansion fittings",
    content:
      "A thread on SHK-Forum.de with 340 replies compares Viega Pressfit and Flamco expansion fittings for underfloor heating manifolds. Recurring complaints about Viega tool rental costs are driving some contractors toward Flamco.",
    sourceUrl: "https://www.shk-forum.de/threads/viega-vs-flamco-2024",
    sourceCategory: "forum",
    topic: "Competitor Activity",
    detectedAt: daysAgo(10),
    personas: ["steffen", "david"],
    useCase: "competitor_move",
  },
  {
    title: "Aalberts Industries acquires smart valve startup FlowSense GmbH",
    content:
      "Aalberts Industries completed the acquisition of FlowSense GmbH, a Munich-based startup specialising in AI-driven flow anomaly detection for building water systems. The deal signals Aalberts intent to compete in predictive maintenance.",
    sourceUrl: "https://www.aalberts.com/news/flowsense-acquisition",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(12),
    personas: ["nick", "david"],
    useCase: "competitor_move",
  },
  {
    title: "Giacomini launches modular manifold system for heat pumps",
    content:
      "Italian manufacturer Giacomini unveiled a modular manifold system optimised for heat pump integration, featuring pre-assembled hydraulic separators and buffer tank connections. The system targets the growing heat pump retrofit market in Germany.",
    sourceUrl: "https://www.giacomini.com/news/heat-pump-manifold",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(15),
    personas: ["josef", "volkmar"],
    useCase: "competitor_move",
  },
  {
    title: "Danfoss expands AB-QM valve range with wireless actuator option",
    content:
      "Danfoss added a wireless Zigbee actuator to its AB-QM pressure-independent control valve range. The actuator is compatible with major BMS platforms and targets commercial HVAC applications where Viega hydronic solutions compete.",
    sourceUrl: "https://www.danfoss.com/news/ab-qm-wireless",
    sourceCategory: "news",
    topic: "Competitor Activity",
    detectedAt: daysAgo(18),
    personas: ["steffen", "nick"],
    useCase: "competitor_move",
  },
  {
    title: "Patent: Honeywell smart leak detection integrated into press fittings",
    content:
      "Honeywell filed a US patent for embedding micro-sensors directly into press fittings to detect micro-leaks before they become failures. The technology could disrupt the aftermarket leak detection segment where Viega has no current offering.",
    sourceUrl: "https://patents.google.com/patent/US20240123456",
    sourceCategory: "patent",
    topic: "Competitor Activity",
    detectedAt: daysAgo(22),
    personas: ["david", "nick"],
    useCase: "competitor_move",
  },
  {
    title: "Installer survey: 28% considering switching press fitting brand in 2025",
    content:
      "A survey of 1,200 German SHK installers found 28% are actively evaluating alternative press fitting brands for 2025 projects, citing tool compatibility and pricing as primary drivers. Viega is the incumbent for 61% of respondents.",
    sourceUrl: "https://www.shk-journal.de/umfrage-2024",
    sourceCategory: "research",
    topic: "Competitor Activity",
    detectedAt: daysAgo(25),
    personas: ["josef", "steffen", "david"],
    useCase: "competitor_move",
  },
  // ── market_problem (10) ───────────────────────────────────────────────────
  {
    title: "German building code update mandates legionella monitoring in commercial buildings",
    content:
      "The updated DVGW W 551 guideline now requires continuous digital legionella risk monitoring in commercial buildings with more than 20 outlets. This creates compliance-driven demand for smart water quality sensors integrated with plumbing systems.",
    sourceUrl: "https://www.dvgw.de/medien/dvgw/regelwerk/w551-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(2),
    personas: ["volkmar", "josef"],
    useCase: "market_problem",
  },
  {
    title: "Forum: contractors struggling with heat pump hydraulic balancing",
    content:
      "Multiple threads on Haustechnikdialog.de describe persistent problems with hydraulic balancing in heat pump installations. Installers report that existing manifold solutions lack the precision needed for low-temperature systems, leading to comfort complaints.",
    sourceUrl: "https://www.haustechnikdialog.de/forum/waermepumpe-hydraulik",
    sourceCategory: "forum",
    topic: "Smart Valves",
    detectedAt: daysAgo(4),
    personas: ["steffen", "david"],
    useCase: "market_problem",
  },
  {
    title: "Research: 34% of commercial buildings have undetected micro-leaks",
    content:
      "A study by Fraunhofer IBP found that 34% of audited commercial buildings had undetected micro-leaks in their plumbing systems, resulting in average annual water losses of 8,000 litres per building. Early detection technology could prevent significant damage.",
    sourceUrl: "https://www.ibp.fraunhofer.de/micro-leak-study-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(6),
    personas: ["nick", "volkmar"],
    useCase: "market_problem",
  },
  {
    title: "Social media: architects demanding BIM-compatible plumbing components",
    content:
      "LinkedIn discussions among German architects show growing frustration with plumbing manufacturers who do not provide IFC-compliant BIM objects. Several large practices are now making BIM data availability a procurement criterion.",
    sourceUrl: "https://www.linkedin.com/posts/bim-plumbing-2024",
    sourceCategory: "social",
    topic: "Smart Valves",
    detectedAt: daysAgo(9),
    personas: ["david", "steffen"],
    useCase: "market_problem",
  },
  {
    title: "Water utility report: aging infrastructure driving demand for smart monitoring",
    content:
      "A report from BDEW highlights that 40% of German municipal water networks are over 40 years old. Utilities are increasingly requiring smart monitoring capabilities from component suppliers to support predictive maintenance programmes.",
    sourceUrl: "https://www.bdew.de/wasser/infrastruktur-bericht-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(11),
    personas: ["volkmar", "nick"],
    useCase: "market_problem",
  },
  {
    title: "Forum: installers report difficulty sourcing Viega Pressfit 108mm fittings",
    content:
      "Multiple posts on SHK-Forum.de report 6-8 week lead times for Viega Pressfit 108mm fittings, causing project delays. Installers are asking for alternatives, with some switching to Geberit Mapress for large-diameter applications.",
    sourceUrl: "https://www.shk-forum.de/threads/pressfit-108-lieferzeit",
    sourceCategory: "forum",
    topic: "Competitor Activity",
    detectedAt: daysAgo(14),
    personas: ["steffen", "josef"],
    useCase: "market_problem",
  },
  {
    title: "EU taxonomy: green building certification now requires water efficiency data",
    content:
      "Updated EU taxonomy guidelines for sustainable finance now require buildings to demonstrate water efficiency metrics for green certification. This is driving demand for metering and monitoring solutions integrated into plumbing infrastructure.",
    sourceUrl: "https://ec.europa.eu/taxonomy/water-efficiency-2024",
    sourceCategory: "news",
    topic: "Sustainability Regulations",
    detectedAt: daysAgo(16),
    personas: ["volkmar", "david"],
    useCase: "market_problem",
  },
  {
    title: "Hospital procurement: infection control driving demand for antimicrobial fittings",
    content:
      "A procurement survey of 50 German hospital facility managers found that antimicrobial surface treatments on plumbing fittings are now a standard specification requirement. Current Viega catalogue does not include antimicrobial variants.",
    sourceUrl: "https://www.krankenhaus-it.de/beschaffung-armaturen-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(20),
    personas: ["josef", "nick"],
    useCase: "market_problem",
  },
  {
    title: "Social: building managers frustrated by manual valve maintenance schedules",
    content:
      "Twitter/X and LinkedIn posts from facility managers describe the burden of manual valve inspection schedules in large commercial buildings. Several express interest in automated condition monitoring to replace periodic manual checks.",
    sourceUrl: "https://twitter.com/search?q=valve+maintenance+building",
    sourceCategory: "social",
    topic: "Smart Valves",
    detectedAt: daysAgo(23),
    personas: ["steffen", "volkmar"],
    useCase: "market_problem",
  },
  {
    title: "German government announces 2B EUR funding for building water efficiency",
    content:
      "The German Federal Ministry for Housing announced a 2 billion EUR funding programme for water efficiency retrofits in existing buildings. The programme prioritises smart metering and leak detection technologies, creating a significant market opportunity.",
    sourceUrl: "https://www.bmwsb.de/foerderprogramm-wassereffizienz-2024",
    sourceCategory: "news",
    topic: "Sustainability Regulations",
    detectedAt: daysAgo(27),
    personas: ["volkmar", "david", "nick"],
    useCase: "market_problem",
  },
  // ── technology_scouting (10) ──────────────────────────────────────────────
  {
    title: "MIT research: self-healing polymer coatings for pipe corrosion prevention",
    content:
      "MIT researchers published results on a self-healing polymer coating that autonomously repairs micro-cracks in metal pipes when exposed to moisture. The coating extends pipe service life by an estimated 15 years and could be applied to press fittings.",
    sourceUrl: "https://news.mit.edu/self-healing-pipe-coating-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(2),
    personas: ["david", "nick"],
    useCase: "technology_scouting",
  },
  {
    title: "Startup Flowbird raises 8M EUR for AI-powered water network digital twin",
    content:
      "Berlin-based Flowbird closed an 8M EUR Series A to develop an AI-powered digital twin platform for building water networks. The platform ingests sensor data from existing meters and valves to predict failures and optimise water quality.",
    sourceUrl: "https://www.flowbird.io/press/series-a",
    sourceCategory: "news",
    topic: "Smart Valves",
    detectedAt: daysAgo(5),
    personas: ["nick", "steffen"],
    useCase: "technology_scouting",
  },
  {
    title: "Patent: acoustic leak detection using pipe wall vibration analysis",
    content:
      "A patent from TU Munich describes a method for detecting leaks by analysing vibration patterns in pipe walls using MEMS accelerometers. The approach requires no pipe penetration and can be retrofitted to existing installations.",
    sourceUrl: "https://patents.google.com/patent/DE102024012345",
    sourceCategory: "patent",
    topic: "Smart Valves",
    detectedAt: daysAgo(8),
    personas: ["david", "volkmar"],
    useCase: "technology_scouting",
  },
  {
    title: "Industry report: NB-IoT connectivity enabling low-power valve monitoring",
    content:
      "A Messe Frankfurt industry report highlights NB-IoT as the preferred connectivity standard for battery-powered valve monitoring in buildings. The technology enables 10-year battery life for sensors, making wireless monitoring economically viable.",
    sourceUrl: "https://www.messefrankfurt.com/iot-valve-report-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(11),
    personas: ["nick", "david"],
    useCase: "technology_scouting",
  },
  {
    title: "Fraunhofer IPA: robotic press fitting installation reduces labour cost by 35%",
    content:
      "Fraunhofer IPA demonstrated a robotic arm system capable of autonomously pressing Viega-compatible fittings in confined spaces. Field trials showed a 35% reduction in installation labour cost and near-zero defect rate.",
    sourceUrl: "https://www.ipa.fraunhofer.de/robotik-pressverbindung-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(14),
    personas: ["steffen", "josef"],
    useCase: "technology_scouting",
  },
  {
    title: "Startup Aquasense launches ultrasonic flow sensor for DN15-DN50 pipes",
    content:
      "Aquasense launched a clamp-on ultrasonic flow sensor for small-diameter pipes (DN15-DN50) with +/-0.5% accuracy. The sensor communicates via Modbus RTU and is priced at 180 EUR, making it viable for individual apartment metering.",
    sourceUrl: "https://www.aquasense.de/produkte/ultraschall-sensor",
    sourceCategory: "news",
    topic: "Smart Valves",
    detectedAt: daysAgo(17),
    personas: ["volkmar", "nick"],
    useCase: "technology_scouting",
  },
  {
    title: "Research: graphene-enhanced EPDM seals show 3x longer service life",
    content:
      "A materials science study from KIT Karlsruhe found that adding graphene nanoplatelets to EPDM rubber compounds increases seal service life by 3x under thermal cycling conditions typical of heating systems. The material is compatible with existing press fitting geometries.",
    sourceUrl: "https://www.kit.edu/graphene-epdm-seals-2024",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(20),
    personas: ["david", "steffen"],
    useCase: "technology_scouting",
  },
  {
    title: "Siemens Desigo CC adds plumbing system module for building digital twins",
    content:
      "Siemens announced a new plumbing system module for its Desigo CC building management platform, enabling integration of water quality sensors, flow meters, and valve actuators into a unified building digital twin.",
    sourceUrl: "https://www.siemens.com/desigo-cc-plumbing-module",
    sourceCategory: "news",
    topic: "Smart Valves",
    detectedAt: daysAgo(22),
    personas: ["nick", "volkmar"],
    useCase: "technology_scouting",
  },
  {
    title: "Patent: shape-memory alloy actuator for thermostatic valve control",
    content:
      "A patent filed by a Swiss research institute describes a thermostatic valve actuator using shape-memory alloy (SMA) wires instead of traditional wax elements. The SMA actuator offers faster response, higher precision, and 50% smaller form factor.",
    sourceUrl: "https://patents.ep.org/EP4234567",
    sourceCategory: "patent",
    topic: "Smart Valves",
    detectedAt: daysAgo(26),
    personas: ["david", "josef"],
    useCase: "technology_scouting",
  },
  {
    title: "Startup Hydra Analytics: ML-based water quality prediction from flow data",
    content:
      "Hydra Analytics published a white paper demonstrating that machine learning models trained on flow rate and pressure data can predict water quality degradation (including legionella risk) with 87% accuracy, without requiring dedicated water quality sensors.",
    sourceUrl: "https://www.hydra-analytics.io/whitepaper-wq-prediction",
    sourceCategory: "research",
    topic: "Smart Valves",
    detectedAt: daysAgo(29),
    personas: ["nick", "david", "volkmar"],
    useCase: "technology_scouting",
  },
];

// ─── INSIGHTS (15 records: 5 Build, 5 Invest, 5 Ignore) ─────────────────────

export const seedInsights: SeedInsight[] = [
  // ── Build (5) ──────────────────────────────────────────────────────────────
  {
    title: "Build integrated legionella monitoring into Pressfit smart valve range",
    summary:
      "New DVGW W 551 mandate requires continuous digital legionella monitoring in commercial buildings. Viega can embed water temperature and flow sensors into existing Pressfit fittings to deliver a compliance-ready solution ahead of competitors.",
    decisionLabel: "Build",
    reasoning:
      "Regulatory tailwind creates guaranteed demand. Viega already has the fitting geometry and installer relationships. Embedding sensors avoids the need for a separate product category and strengthens the Pressfit ecosystem lock-in. Time-to-market advantage is 12-18 months before competitors can respond.",
    sourceCategory: "research",
    sourceUrls: [
      { url: "https://www.dvgw.de/medien/dvgw/regelwerk/w551-2024" },
      { url: "https://www.ibp.fraunhofer.de/micro-leak-study-2024" },
    ],
    personas: ["volkmar", "josef", "nick"],
    useCase: "market_problem",
    detectedAt: daysAgo(3),
  },
  {
    title: "Build BIM object library with IFC 4.3 compliance for full Viega catalogue",
    summary:
      "Architects and BIM coordinators are making IFC-compliant BIM data a procurement criterion. Building a comprehensive, freely downloadable BIM object library for the Viega catalogue removes a key barrier in the specification process.",
    decisionLabel: "Build",
    reasoning:
      "Low development cost relative to impact. BIM objects are a one-time investment that influences every project specification. Competitors like Geberit already offer this; Viega risks losing specification-stage influence without it. Can be delivered in 3 months.",
    sourceCategory: "social",
    sourceUrls: [{ url: "https://www.linkedin.com/posts/bim-plumbing-2024" }],
    personas: ["david", "steffen"],
    useCase: "market_problem",
    detectedAt: daysAgo(6),
  },
  {
    title: "Build heat pump hydraulic balancing wizard for Viega installer app",
    summary:
      "Installers consistently struggle with hydraulic balancing in heat pump systems. A guided balancing wizard in the Viega installer app, using manifold flow data, would reduce callbacks and differentiate Viega as a system partner rather than a component supplier.",
    decisionLabel: "Build",
    reasoning:
      "Heat pump installations are growing 40% YoY in Germany. Installers who struggle with balancing generate warranty claims and negative word-of-mouth. A software tool costs under 200K EUR to build and creates a sticky digital touchpoint that competitors cannot easily replicate.",
    sourceCategory: "forum",
    sourceUrls: [
      { url: "https://www.haustechnikdialog.de/forum/waermepumpe-hydraulik" },
    ],
    personas: ["steffen", "david", "josef"],
    useCase: "market_problem",
    detectedAt: daysAgo(9),
  },
  {
    title: "Build NB-IoT connected valve actuator for commercial building retrofit market",
    summary:
      "NB-IoT enables 10-year battery life for wireless valve actuators, making smart valve retrofits economically viable in existing buildings. Viega should develop a clamp-on NB-IoT actuator compatible with its existing valve range to capture the retrofit segment.",
    decisionLabel: "Build",
    reasoning:
      "The retrofit market is 5x larger than new construction for smart building components. NB-IoT infrastructure is now available in 95% of German buildings. A clamp-on design avoids the need for pipe replacement and can be installed by existing Viega-trained installers.",
    sourceCategory: "research",
    sourceUrls: [
      { url: "https://www.messefrankfurt.com/iot-valve-report-2024" },
      { url: "https://www.aquasense.de/produkte/ultraschall-sensor" },
    ],
    personas: ["nick", "volkmar"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(13),
  },
  {
    title: "Build graphene-EPDM seal variant for high-cycle heating system applications",
    summary:
      "KIT research shows graphene-enhanced EPDM seals last 3x longer under thermal cycling. Viega should develop a premium seal variant for high-cycle applications (district heating, industrial) to reduce maintenance costs and justify a price premium.",
    decisionLabel: "Build",
    reasoning:
      "Material is compatible with existing press fitting geometry - no tooling changes required. Premium segment customers (district heating operators, industrial facilities) have high willingness to pay for reduced maintenance. First-mover advantage in a niche with high switching costs.",
    sourceCategory: "research",
    sourceUrls: [{ url: "https://www.kit.edu/graphene-epdm-seals-2024" }],
    personas: ["david", "steffen"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(17),
  },
  // ── Invest (5) ─────────────────────────────────────────────────────────────
  {
    title: "Invest in partnership with Flowbird for building water digital twin integration",
    summary:
      "Flowbird AI digital twin platform for building water networks is gaining traction. A strategic partnership or minority investment would give Viega early access to the platform and position Viega components as the preferred hardware layer.",
    decisionLabel: "Invest",
    reasoning:
      "Flowbird has 8M EUR Series A and strong traction with facility managers. Building a competing platform would take 2-3 years and 15M+ EUR. A partnership costs under 2M EUR and delivers immediate market access. Risk: Flowbird may be acquired by a competitor.",
    sourceCategory: "news",
    sourceUrls: [{ url: "https://www.flowbird.io/press/series-a" }],
    personas: ["nick", "david"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(4),
  },
  {
    title: "Invest in acoustic leak detection R&D based on TU Munich pipe vibration patent",
    summary:
      "TU Munich acoustic leak detection method using MEMS accelerometers requires no pipe penetration and can be retrofitted. Viega should fund a joint development project to integrate this technology into a Viega-branded leak detection product.",
    decisionLabel: "Invest",
    reasoning:
      "The patent is not yet commercialised. A joint development agreement with TU Munich would give Viega exclusive licensing rights for the building sector. Investment of 500K-1M EUR over 18 months could yield a product with 50M+ EUR addressable market.",
    sourceCategory: "patent",
    sourceUrls: [{ url: "https://patents.google.com/patent/DE102024012345" }],
    personas: ["david", "volkmar"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(7),
  },
  {
    title: "Invest in antimicrobial surface treatment capability for hospital segment",
    summary:
      "Hospital procurement now standardly requires antimicrobial fittings. Viega should invest in developing an antimicrobial surface treatment for its Pressfit range to capture the high-margin healthcare segment before competitors fill the gap.",
    decisionLabel: "Invest",
    reasoning:
      "Healthcare is a high-margin, specification-driven segment with long product lifecycles. Antimicrobial treatment is a 200-400K EUR R&D investment with potential to unlock a 30M+ EUR annual revenue segment. Regulatory approval pathway is well-established.",
    sourceCategory: "research",
    sourceUrls: [
      { url: "https://www.krankenhaus-it.de/beschaffung-armaturen-2024" },
    ],
    personas: ["josef", "nick"],
    useCase: "market_problem",
    detectedAt: daysAgo(11),
  },
  {
    title: "Invest in Siemens Desigo CC integration for Viega smart valve range",
    summary:
      "Siemens Desigo CC new plumbing module creates an integration opportunity for Viega smart valves. Investing in a certified Desigo CC integration would make Viega the default choice for building managers using Siemens BMS.",
    decisionLabel: "Invest",
    reasoning:
      "Desigo CC is installed in 35% of large German commercial buildings. A certified integration requires 150K-300K EUR in development and testing but creates a strong specification pull. Siemens has expressed interest in co-marketing with hardware partners.",
    sourceCategory: "news",
    sourceUrls: [{ url: "https://www.siemens.com/desigo-cc-plumbing-module" }],
    personas: ["nick", "steffen"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(15),
  },
  {
    title: "Invest in EU taxonomy water efficiency data reporting capability",
    summary:
      "EU taxonomy now requires water efficiency data for green building certification. Viega should invest in developing a data reporting module that aggregates flow and consumption data from Viega components to support customer ESG reporting.",
    decisionLabel: "Invest",
    reasoning:
      "ESG reporting is becoming a procurement requirement for large real estate portfolios. A Viega data reporting module creates recurring SaaS revenue and deepens customer relationships. Investment of 400K EUR could generate 2M+ EUR ARR within 3 years.",
    sourceCategory: "news",
    sourceUrls: [
      { url: "https://ec.europa.eu/taxonomy/water-efficiency-2024" },
      { url: "https://www.bmwsb.de/foerderprogramm-wassereffizienz-2024" },
    ],
    personas: ["volkmar", "david"],
    useCase: "market_problem",
    detectedAt: daysAgo(19),
  },
  // ── Ignore (5) ─────────────────────────────────────────────────────────────
  {
    title: "Ignore: Watts smart pressure-balancing valve - niche commercial segment",
    summary:
      "Watts new smart pressure-balancing valve targets large commercial BACnet installations. This segment represents less than 5% of Viega addressable market and requires BMS integration expertise outside Viega core competency.",
    decisionLabel: "Ignore",
    reasoning:
      "The BACnet commercial segment requires deep BMS integration expertise and long sales cycles through system integrators. Viega strength is in the installer channel for residential and light commercial. Entering this segment would dilute focus without proportionate revenue upside.",
    sourceCategory: "news",
    sourceUrls: [{ url: "https://www.wattswater.com/press/smart-pbv-launch" }],
    personas: ["josef", "steffen"],
    useCase: "competitor_move",
    detectedAt: daysAgo(2),
  },
  {
    title: "Ignore: Robotic press fitting installation - not a Viega product opportunity",
    summary:
      "Fraunhofer IPA robotic press fitting system reduces installation labour cost by 35%. However, this is a tool/robotics product for large contractors, not a plumbing component opportunity. Viega should monitor but not invest.",
    decisionLabel: "Ignore",
    reasoning:
      "Robotic installation tools are a different business model (capital equipment, service contracts) from Viega component business. The addressable market is small (large contractors only) and the technology is 3-5 years from commercial readiness. Not a strategic fit.",
    sourceCategory: "research",
    sourceUrls: [
      { url: "https://www.ipa.fraunhofer.de/robotik-pressverbindung-2024" },
    ],
    personas: ["steffen", "josef"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(12),
  },
  {
    title: "Ignore: Shape-memory alloy thermostatic actuator - cost-prohibitive for target market",
    summary:
      "SMA-based thermostatic actuators offer superior precision but at 3-4x the cost of wax elements. Viega core market (residential and light commercial) is highly price-sensitive. The technology is not viable for mainstream products.",
    decisionLabel: "Ignore",
    reasoning:
      "SMA actuators cost 45-60 EUR per unit vs 12-15 EUR for wax elements. In a market where total valve cost is 25-80 EUR, this is not commercially viable. The precision advantage is only relevant in high-end HVAC applications where Viega does not compete.",
    sourceCategory: "patent",
    sourceUrls: [{ url: "https://patents.ep.org/EP4234567" }],
    personas: ["david", "volkmar"],
    useCase: "technology_scouting",
    detectedAt: daysAgo(16),
  },
  {
    title: "Ignore: Geberit self-sealing push-fit patent - defensive monitoring only",
    summary:
      "Geberit self-sealing push-fit patent is in early stage and faces significant manufacturing challenges. The technology would not reach market for 4-6 years. Viega should monitor but take no immediate action.",
    decisionLabel: "Ignore",
    reasoning:
      "Patent analysis shows the self-sealing membrane requires exotic polymer processing not available at scale. Manufacturing cost would be 2-3x current O-ring solutions. Geberit has not announced any commercialisation timeline. Viega Pressfit advantage is safe for the medium term.",
    sourceCategory: "patent",
    sourceUrls: [{ url: "https://patents.ep.org/EP4123456" }],
    personas: ["david", "volkmar"],
    useCase: "competitor_move",
    detectedAt: daysAgo(21),
  },
  {
    title: "Ignore: Aalberts/FlowSense acquisition - enterprise segment outside Viega scope",
    summary:
      "Aalberts acquisition of FlowSense targets enterprise-scale AI predictive maintenance for large industrial water systems. This segment requires dedicated data science teams and long-term service contracts outside Viega current go-to-market model.",
    decisionLabel: "Ignore",
    reasoning:
      "FlowSense targets facilities with 500+ outlets and dedicated facility management teams. Viega installer channel and product portfolio are optimised for projects up to 200 outlets. Competing in the enterprise AI segment would require a fundamentally different business model.",
    sourceCategory: "news",
    sourceUrls: [{ url: "https://www.aalberts.com/news/flowsense-acquisition" }],
    personas: ["nick", "david"],
    useCase: "competitor_move",
    detectedAt: daysAgo(24),
  },
];

// ─── TRENDS (90 records: 30 days × 3 topics) ────────────────────────────────

// Realistic signal volume patterns per topic (values 1-50)
const smartValvesCounts: number[] = [
  12, 15, 11, 18, 22, 19, 14, 17, 25, 28, 21, 16, 13, 20, 24, 27, 23, 18, 15,
  19, 22, 26, 30, 28, 24, 20, 17, 21, 25, 29,
];
const competitorCounts: number[] = [
  8, 10, 7, 12, 15, 18, 14, 11, 9, 16, 20, 17, 13, 10, 14, 19, 22, 18, 15, 12,
  16, 21, 25, 23, 19, 15, 11, 14, 18, 22,
];
const sustainabilityCounts: number[] = [
  5, 7, 9, 11, 8, 13, 16, 14, 10, 12, 15, 18, 20, 17, 13, 11, 14, 17, 21, 24,
  22, 19, 16, 13, 17, 20, 23, 26, 24, 28,
];

export const seedTrends: SeedTrend[] = [
  ...Array.from({ length: 30 }, (_, i): SeedTrend => ({
    topic: "Smart Valves",
    date: daysAgo(29 - i),
    count: smartValvesCounts[i] as number,
    useCase: "technology_scouting",
  })),
  ...Array.from({ length: 30 }, (_, i): SeedTrend => ({
    topic: "Competitor Activity",
    date: daysAgo(29 - i),
    count: competitorCounts[i] as number,
    useCase: "competitor_move",
  })),
  ...Array.from({ length: 30 }, (_, i): SeedTrend => ({
    topic: "Sustainability Regulations",
    date: daysAgo(29 - i),
    count: sustainabilityCounts[i] as number,
    useCase: "market_problem",
  })),
];
