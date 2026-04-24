'use client'

import type { Signal } from '@/lib/signals/types'
import { getRecommendation } from '@/lib/signals/scoring'
import { ScoreBar } from './ScoreBar'

export function SignalCard({
  signal,
  expanded,
  onToggle,
}: {
  signal: Signal
  expanded: boolean
  onToggle: () => void
}) {
  const rec = getRecommendation(signal)

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${rec.border} shadow-sm transition-all`}
    >
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {(signal.signal_type ?? '').replace(/_/g, ' ')}
            </span>

            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rec.badge}`}>
              {rec.label}
            </span>

            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              {signal.source === 'hackernews' && '🟠 HackerNews'}
              {signal.source === 'reddit' && '🔴 Reddit'}
              {signal.source === 'simulated_news' && '📰 News'}
              {signal.source === 'simulated_patent' && '📋 Patent'}
              {signal.source === 'simulated_forum' && '💬 Forum'}
              {signal.source === 'simulated_release' && '🚀 Release'}
              {signal.source === 'google_trends' && '📈 Google Trends'}
            </span>
          </div>

          <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
            {signal.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 w-10 shrink-0">Score</span>
            <div className="flex-1">
              <ScoreBar value={rec.score} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-8 text-right">{rec.score}</span>
          </div>
        </div>

        <span className="text-gray-400 text-lg shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{signal.summary}</p>

          <div className={`text-sm font-medium px-3 py-2 rounded-lg border mb-3 ${rec.badge}`}>
            💡 {rec.reason}
          </div>

          {signal.entities?.length ? (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Entities</p>
              <div className="flex flex-wrap gap-1">
                {signal.entities.map((e, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                  >
                    {e.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-2 mb-3">
            {(['momentum', 'impact', 'novelty', 'confidence'] as const).map((key) => (
              <div key={key} className="text-center bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-bold text-gray-800">
                  {signal.trend_metrics?.[key] ?? 0}
                </div>
                <div className="text-xs text-gray-400 capitalize">{key}</div>
              </div>
            ))}
          </div>

          {signal.evidence_urls?.length ? (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Evidence</p>
              <div className="flex flex-col gap-1">
                {signal.evidence_urls.map((e, i) => (
                  <a
                    key={i}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-xs underline hover:text-blue-700 truncate"
                  >
                    🔗 {e.label || e.url}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
