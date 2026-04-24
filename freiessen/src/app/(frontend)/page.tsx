import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Quick stats from signals collection
  const { totalDocs: totalSignals } = await payload.find({
    collection: 'signals',
    limit: 0,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */} 
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <img
            src="https://www.viega.de/etc.clientlibs/viega-frontend/clientlibs/main/resources/icons/logo_w_border.svg"
            alt="Viega Logo"
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Viega Market Signal Intelligence
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
            Automatically detect competitor moves, market problems, and emerging technologies — so
            Viega can act before the market shifts.
          </p>

          {user ? (
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg font-semibold text-white text-sm transition-all"
                style={{ backgroundColor: '#E2001A' }}
              >
                Go to Dashboard →
              </Link>
              <span className="px-6 py-3 rounded-lg text-gray-500 text-sm border border-gray-200 bg-white">
                Welcome back, {user.email}
              </span>
            </div>
          ) : (
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg font-semibold text-white text-sm transition-all"
                style={{ backgroundColor: '#E2001A' }}
              >
                View Dashboard →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">{totalSignals}</div>
            <div className="text-sm text-gray-500 mt-1">Signals Tracked</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-500 mt-1">Use Cases Covered</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <div className="text-3xl font-bold" style={{ color: '#E2001A' }}>
              Live
            </div>
            <div className="text-sm text-gray-500 mt-1">Signal Detection</div>
          </div>
        </div>

        {/* 3 Use cases */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">What we detect</h2>
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: '⚔️',
              title: 'Competitor Moves',
              description:
                'Track product launches, patents, and strategic moves from competitors like Grundfos, Danfoss and Watts Water.',
            },
            {
              icon: '📉',
              title: 'Market Problems',
              description:
                'Surface unmet needs, installer pain points, and regulatory changes before they become urgent.',
            },
            {
              icon: '🔬',
              title: 'Tech Scouting',
              description:
                'Identify emerging technologies — from self-healing polymers to AI diagnostics — and assess their impact on Viega.',
            },
          ].map((uc) => (
            <div key={uc.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-3xl mb-3">{uc.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{uc.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">How it works</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-12">
          {[
            {
              step: '01',
              title: 'Signals are detected automatically',
              description: 'From news, patents, forums and product releases — updated daily.',
            },
            {
              step: '02',
              title: 'Each signal is scored',
              description:
                'Momentum, Impact, Novelty and Confidence are scored 0–100 for every signal.',
            },
            {
              step: '03',
              title: 'Recommendations are generated',
              description:
                'Signals are classified as Build, Invest or Ignore based on their score.',
            },
            {
              step: '04',
              title: 'Your team takes action',
              description:
                'The dashboard shows what matters most — with evidence links and summaries.',
            },
          ].map((step) => (
            <div key={step.step} className="flex items-start gap-4 px-5 py-4">
              <span className="text-sm font-bold shrink-0 mt-0.5" style={{ color: '#E2001A' }}>
                {step.step}
              </span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{step.title}</div>
                <div className="text-gray-500 text-sm">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-xl p-8 text-center text-white"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          <h2 className="text-xl font-bold mb-2">Ready to explore the signals?</h2>
          <p className="text-gray-400 text-sm mb-5">
            See what's happening in your market right now.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#E2001A' }}
          >
            Open Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
