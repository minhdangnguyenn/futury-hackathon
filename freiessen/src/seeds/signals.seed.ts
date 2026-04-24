// signals.seed.ts
// Adjusted to support Payload Signals collection with:
// - company (relationship, single) -> competitors
// - competitors (relationship, hasMany) -> competitors
//
// IMPORTANT:
// 1) This file only exports seed DATA. Your seeder function should look up
//    competitor IDs and set `company` + `competitors` when creating/updating signals.
// 2) `companyName` MUST match an existing competitor.name from competitorsSeed.

export const signalsSeed = [
  // ── UC1: Competitor Moves ─────────────────────────────────────────
  {
    companyName: 'Geberit',
    signal_type: 'disruption' as const,
    source: 'simulated_news',
    title: 'Geberit pilots AI-powered hydronic balancing kits for retrofit projects',
    summary:
      'Geberit is piloting an AI-assisted hydronic balancing kit aimed at reducing commissioning time and improving comfort in retrofit projects.',
    entities: [
      { name: 'Geberit', type: 'company' as const },
      { name: 'Hydronic Balancing', type: 'topic' as const },
      { name: 'AI', type: 'technology' as const },
    ],
    evidence_urls: [
      { url: 'https://www.geberit.com/media', label: 'Geberit Newsroom (example)' },
      {
        url: 'https://www.hvacrworld.com/ai-balancing-retrofit',
        label: 'Industry Coverage (example)',
      },
    ],
    trend_metrics: { momentum: 78, novelty: 65, impact: 82, confidence: 74 },
  },
  {
    companyName: 'NIBCO',
    signal_type: 'disruption' as const,
    source: 'simulated_patent',
    title: 'NIBCO files patent for self-balancing radiator valve concept',
    summary:
      'A new patent describes a self-balancing thermostatic radiator valve using micro-sensors and a mesh connectivity concept, targeting retrofits in multi-family buildings.',
    entities: [
      { name: 'NIBCO', type: 'company' as const },
      { name: 'Thermostatic Radiator Valve', type: 'technology' as const },
      { name: 'Europe', type: 'location' as const },
    ],
    evidence_urls: [{ url: 'https://patents.google.com/', label: 'Patent search (example)' }],
    trend_metrics: { momentum: 55, novelty: 88, impact: 70, confidence: 60 },
  },
  {
    companyName: 'Danfoss',
    // Danfoss is NOT in your competitorsSeed list, so don't use it.
    // Replaced with TECE to match your seeded competitors.
    signal_type: 'emerging_tech' as const,
    source: 'simulated_release',
    title: 'TECE introduces digital monitoring features for installation systems',
    summary:
      'TECE announces new digital monitoring features for installation systems intended to help facility managers monitor performance and plan maintenance.',
    entities: [
      { name: 'TECE', type: 'company' as const },
      { name: 'Digital Monitoring', type: 'technology' as const },
      { name: 'Vienna', type: 'location' as const },
    ],
    evidence_urls: [{ url: 'https://www.tece.com', label: 'TECE Website' }],
    trend_metrics: { momentum: 70, novelty: 75, impact: 85, confidence: 80 },
  },

  // ── UC2: Market Problem ───────────────────────────────────────────
  {
    companyName: 'Aliaxis',
    signal_type: 'trend' as const,
    source: 'simulated_forum',
    title: 'Installers report surge in complaints about pipe corrosion in older buildings',
    summary:
      'Installer forums show a spike in discussions about premature pipe corrosion in pre-2000 buildings using mixed metal systems, increasing demand for compatible inhibitor solutions.',
    entities: [
      { name: 'Aliaxis', type: 'company' as const },
      { name: 'Pipe Corrosion', type: 'topic' as const },
      { name: 'Inhibitor Solutions', type: 'technology' as const },
    ],
    evidence_urls: [
      { url: 'https://www.installerforums.co.uk/', label: 'Installer Forum (example)' },
      { url: 'https://www.plumbworld.co.uk/blog', label: 'Plumbworld Blog (example)' },
    ],
    trend_metrics: { momentum: 85, novelty: 40, impact: 90, confidence: 88 },
  },
  {
    companyName: 'SCHELL',
    signal_type: 'regulatory' as const,
    source: 'simulated_news',
    title: 'EU mandates hydraulic balancing in new builds from 2027',
    summary:
      'A draft directive would require hydraulic balancing in new residential and commercial heating installations from 2027, creating demand for compliant components and installer-ready solutions.',
    entities: [
      { name: 'SCHELL', type: 'company' as const },
      { name: 'Hydraulic Balancing', type: 'topic' as const },
      { name: 'EU', type: 'location' as const },
    ],
    evidence_urls: [{ url: 'https://ec.europa.eu/', label: 'EU site (example)' }],
    trend_metrics: { momentum: 92, novelty: 50, impact: 95, confidence: 85 },
  },
  {
    companyName: 'aalberts',
    signal_type: 'weak_signal' as const,
    source: 'simulated_forum',
    title: 'Specifiers increasingly request BIM-ready valve data from manufacturers',
    summary:
      'Specifier communities indicate growing demand for Revit-compatible BIM objects for valves and fittings, pushing manufacturers to offer downloadable BIM libraries.',
    entities: [
      { name: 'aalberts', type: 'company' as const },
      { name: 'BIM', type: 'technology' as const },
      { name: 'Revit', type: 'technology' as const },
    ],
    evidence_urls: [{ url: 'https://www.linkedin.com/', label: 'LinkedIn (example)' }],
    trend_metrics: { momentum: 60, novelty: 55, impact: 65, confidence: 58 },
  },

  // ── UC3: Tech Scouting ────────────────────────────────────────────
  {
    companyName: 'Conex Bänninger',
    signal_type: 'emerging_tech' as const,
    source: 'simulated_patent',
    title: 'Conex Bänninger explores self-healing polymer concepts for piping',
    summary:
      'Research points to thermoplastic polymer composites that can autonomously seal micro-cracks under heat, with potential applications in district heating and industrial piping.',
    entities: [
      { name: 'Conex Bänninger', type: 'company' as const },
      { name: 'Self-healing Polymer', type: 'technology' as const },
      { name: 'District Heating', type: 'topic' as const },
    ],
    evidence_urls: [
      { url: 'https://www.conexbanninger.com', label: 'Company site' },
      { url: 'https://www.nature.com', label: 'Research publisher (example)' },
    ],
    trend_metrics: { momentum: 45, novelty: 95, impact: 88, confidence: 50 },
  },
  {
    companyName: 'TECE',
    signal_type: 'emerging_tech' as const,
    source: 'simulated_release',
    title: 'TECE partners with startup on ultrasonic leak detection pilots',
    summary:
      'A pilot integrates clip-on ultrasonic leak detection into building maintenance workflows, pairing devices with a mobile app to flag anomalies in real time.',
    entities: [
      { name: 'TECE', type: 'company' as const },
      { name: 'Ultrasonic Leak Detection', type: 'technology' as const },
      { name: 'Berlin', type: 'location' as const },
    ],
    evidence_urls: [{ url: 'https://techcrunch.com', label: 'Funding coverage (example)' }],
    trend_metrics: { momentum: 68, novelty: 80, impact: 72, confidence: 65 },
  },
  {
    companyName: 'Aliaxis',
    signal_type: 'trend' as const,
    source: 'simulated_news',
    title: 'Heat pump adoption in Germany drives demand for low-temp hydronic components',
    summary:
      'Rising heat pump adoption increases demand for low-temperature compatible hydronic components, driving product updates and installer guidance across suppliers.',
    entities: [
      { name: 'Aliaxis', type: 'company' as const },
      { name: 'Heat Pump', type: 'technology' as const },
      { name: 'Germany', type: 'location' as const },
      { name: 'Hydronic Components', type: 'topic' as const },
    ],
    evidence_urls: [
      { url: 'https://www.destatis.de', label: 'Destatis (example)' },
      { url: 'https://www.bwp.de', label: 'BWP report (example)' },
    ],
    trend_metrics: { momentum: 90, novelty: 35, impact: 92, confidence: 95 },
  },
] as const
