import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const { default: payload } = await import('payload')
const { default: config } = await import('../payload.config.js')

const signals = [
  // ── UC1: Competitor Move ──────────────────────────────────────────
  {
    signal_type: 'market_shift' as const,
    source: 'simulated_news',
    title: 'Grundfos launches AI-powered pump diagnostics platform',
    summary:
      'Grundfos has released an AI diagnostic layer on top of their iSolutions platform, enabling real-time fault prediction for building HVAC systems. Early adopters report 30% reduction in unplanned downtime.',
    entities: [
      { name: 'Grundfos', type: 'company' as const },
      { name: 'iSolutions', type: 'technology' as const },
      { name: 'HVAC', type: 'topic' as const },
    ],
    evidence_urls: [
      { url: 'https://www.grundfos.com/news/ai-diagnostics', label: 'Grundfos Press Release' },
      { url: 'https://www.hvacrworld.com/grundfos-ai', label: 'HVAC R World Coverage' },
    ],
    trend_metrics: {
      momentum: 78,
      novelty: 65,
      impact: 82,
      confidence: 74,
    },
  },
  {
    signal_type: 'disruption' as const,
    source: 'simulated_patent',
    title: 'Watts Water files patent for self-balancing radiator valve',
    summary:
      'A new patent by Watts Water Technologies describes a self-balancing thermostatic radiator valve using micro-sensors and Bluetooth mesh. Targets retrofit market in European multi-family buildings.',
    entities: [
      { name: 'Watts Water Technologies', type: 'company' as const },
      { name: 'Thermostatic Radiator Valve', type: 'technology' as const },
      { name: 'Europe', type: 'location' as const },
    ],
    evidence_urls: [
      { url: 'https://patents.google.com/patent/US20260001234', label: 'Google Patent' },
    ],
    trend_metrics: {
      momentum: 55,
      novelty: 88,
      impact: 70,
      confidence: 60,
    },
  },
  {
    signal_type: 'emerging_tech' as const,
    source: 'simulated_release',
    title: 'Danfoss integrates digital twin into district heating controllers',
    summary:
      'Danfoss announces that their Leanheat platform now ships with a digital twin module, allowing facility managers to simulate load changes before deployment. Pilot cities include Copenhagen and Vienna.',
    entities: [
      { name: 'Danfoss', type: 'company' as const },
      { name: 'Leanheat', type: 'technology' as const },
      { name: 'Copenhagen', type: 'location' as const },
      { name: 'Vienna', type: 'location' as const },
    ],
    evidence_urls: [
      { url: 'https://www.danfoss.com/leanheat-twin', label: 'Danfoss Leanheat Announcement' },
    ],
    trend_metrics: {
      momentum: 70,
      novelty: 75,
      impact: 85,
      confidence: 80,
    },
  },

  // ── UC2: Market Problem ───────────────────────────────────────────
  {
    signal_type: 'trend' as const,
    source: 'simulated_forum',
    title: 'Installers report surge in complaints about pipe corrosion in older buildings',
    summary:
      'Forum threads on installer communities show a 3× spike in discussions about premature pipe corrosion in pre-2000 buildings using mixed metal systems. Users ask for compatible inhibitor solutions.',
    entities: [
      { name: 'Pipe Corrosion', type: 'topic' as const },
      { name: 'Inhibitor Solutions', type: 'technology' as const },
    ],
    evidence_urls: [
      {
        url: 'https://www.installerforums.co.uk/thread/corrosion-2026',
        label: 'Installer Forum Thread',
      },
      { url: 'https://www.plumbworld.co.uk/blog/corrosion-tips', label: 'Plumbworld Blog' },
    ],
    trend_metrics: {
      momentum: 85,
      novelty: 40,
      impact: 90,
      confidence: 88,
    },
  },
  {
    signal_type: 'regulatory' as const,
    source: 'simulated_news',
    title: 'EU mandates hydraulic balancing in new builds from 2027',
    summary:
      'The European Commission is finalizing a directive requiring hydraulic balancing in all new residential and commercial heating installations from January 2027. Industry bodies estimate 40% of current installers are unprepared.',
    entities: [
      { name: 'European Commission', type: 'company' as const },
      { name: 'Hydraulic Balancing', type: 'topic' as const },
      { name: 'EU', type: 'location' as const },
    ],
    evidence_urls: [
      { url: 'https://ec.europa.eu/energy/heating-directive-2027', label: 'EU Directive Draft' },
    ],
    trend_metrics: {
      momentum: 92,
      novelty: 50,
      impact: 95,
      confidence: 85,
    },
  },
  {
    signal_type: 'weak_signal' as const,
    source: 'simulated_forum',
    title: 'Specifiers requesting BIM-ready valve data from manufacturers',
    summary:
      'Multiple LinkedIn posts and specifier forums indicate growing demand for Revit-compatible BIM objects for valves and fittings. Competitors like Oventrop already offer downloadable BIM libraries.',
    entities: [
      { name: 'BIM', type: 'technology' as const },
      { name: 'Revit', type: 'technology' as const },
      { name: 'Oventrop', type: 'company' as const },
    ],
    evidence_urls: [
      { url: 'https://www.linkedin.com/posts/specifier-bim-demand', label: 'LinkedIn Discussion' },
      { url: 'https://www.oventrop.com/bim-library', label: 'Oventrop BIM Library' },
    ],
    trend_metrics: {
      momentum: 60,
      novelty: 55,
      impact: 65,
      confidence: 58,
    },
  },

  // ── UC3: Tech Scouting ────────────────────────────────────────────
  {
    signal_type: 'emerging_tech' as const,
    source: 'simulated_patent',
    title: 'MIT publishes research on self-healing polymer pipes',
    summary:
      'MIT researchers have published findings on a thermoplastic polymer composite that autonomously seals micro-cracks when exposed to heat. Potential applications in district heating and industrial piping systems.',
    entities: [
      { name: 'MIT', type: 'company' as const },
      { name: 'Self-healing Polymer', type: 'technology' as const },
      { name: 'District Heating', type: 'topic' as const },
    ],
    evidence_urls: [
      { url: 'https://news.mit.edu/2026/self-healing-pipes', label: 'MIT News' },
      {
        url: 'https://www.nature.com/articles/s41563-026-01234-5',
        label: 'Nature Materials Paper',
      },
    ],
    trend_metrics: {
      momentum: 45,
      novelty: 95,
      impact: 88,
      confidence: 50,
    },
  },
  {
    signal_type: 'emerging_tech' as const,
    source: 'simulated_release',
    title: 'Startup PipeSense raises €12M for ultrasonic leak detection wearable',
    summary:
      'PipeSense, a Berlin-based startup, closed a Series A round to scale their clip-on ultrasonic leak detector for building maintenance teams. The device pairs with a mobile app and flags anomalies in real time.',
    entities: [
      { name: 'PipeSense', type: 'company' as const },
      { name: 'Ultrasonic Leak Detection', type: 'technology' as const },
      { name: 'Berlin', type: 'location' as const },
    ],
    evidence_urls: [
      {
        url: 'https://techcrunch.com/2026/04/pipesense-series-a',
        label: 'TechCrunch Funding Round',
      },
    ],
    trend_metrics: {
      momentum: 68,
      novelty: 80,
      impact: 72,
      confidence: 65,
    },
  },
  {
    signal_type: 'trend' as const,
    source: 'simulated_news',
    title: 'Heat pump adoption in Germany reaches 35% of new installations',
    summary:
      'German federal statistics show heat pump share of new heating installations hit 35% in Q1 2026, up from 22% in 2024. This is driving demand for low-temperature compatible hydronic components.',
    entities: [
      { name: 'Heat Pump', type: 'technology' as const },
      { name: 'Germany', type: 'location' as const },
      { name: 'Hydronic Components', type: 'topic' as const },
    ],
    evidence_urls: [
      { url: 'https://www.destatis.de/heating-2026-q1', label: 'Destatis Statistics' },
      { url: 'https://www.bwp.de/heat-pump-report-2026', label: 'BWP Heat Pump Report' },
    ],
    trend_metrics: {
      momentum: 90,
      novelty: 35,
      impact: 92,
      confidence: 95,
    },
  },
]

async function seed() {
  await payload.init({
    config,
  })

  console.log('🌱 Seeding signals...')

  for (const signal of signals) {
    const result = await payload.create({
      collection: 'signals',
      data: signal,
    })
    console.log(`✅ Created: ${result.title}`)
  }

  console.log('🎉 Done seeding signals!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
