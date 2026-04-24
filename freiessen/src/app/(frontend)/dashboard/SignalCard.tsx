'use client'

import type { Signal } from '@/lib/signals/types'
import type { SignalMetrics } from '@/lib/signals/scoring'

function MetricBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value || 0))
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
      <div className="h-2 bg-yellow-400" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
    </div>
  )
}

export function SignalCard({
  signal,
  expanded,
  onToggle,
  metrics,
}: {
  signal: Signal
  expanded: boolean
  onToggle: () => void
  metrics?: SignalMetrics
}) {
  const sourceLabel =
    signal.source === 'hackernews'
      ? '🟠 HackerNews'
      : signal.source === 'reddit'
        ? '🔴 Reddit'
        : signal.source === 'simulated_news'
          ? '📰 News'
          : signal.source === 'simulated_patent'
            ? '📋 Patent'
            : signal.source === 'simulated_forum'
              ? '💬 Forum'
              : signal.source === 'simulated_release'
                ? '🚀 Release'
                : signal.source === 'google_trends'
                  ? '📈 Google Trends'
                  : signal.source

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-all">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
        onClick={onToggle}
        type="button"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {(signal.signal_type ?? '').replace(/_/g, ' ')}
            </span>

            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {sourceLabel}
            </span>
          </div>

          <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
            {signal.title}
          </h3>

          {/* metrics preview */}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400">Freshness</span>
                <span className="text-[11px] font-semibold text-gray-600">
                  {metrics?.freshness ?? 0}
                </span>
              </div>
              <MetricBar value={metrics?.freshness ?? 0} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400">Evidence</span>
                <span className="text-[11px] font-semibold text-gray-600">
                  {metrics?.evidenceQuality ?? 0}
                </span>
              </div>
              <MetricBar value={metrics?.evidenceQuality ?? 0} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400">Relevance</span>
                <span className="text-[11px] font-semibold text-gray-600">
                  {metrics?.relevance ?? 0}
                </span>
              </div>
              <MetricBar value={metrics?.relevance ?? 0} />
            </div>
          </div>
        </div>

        <span className="text-gray-400 text-lg shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{signal.summary}</p>

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

          {/* metrics details */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="text-sm font-bold text-gray-800">{metrics?.freshness ?? 0}</div>
              <div className="text-xs text-gray-400">Freshness</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="text-sm font-bold text-gray-800">{metrics?.evidenceQuality ?? 0}</div>
              <div className="text-xs text-gray-400">Evidence</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="text-sm font-bold text-gray-800">{metrics?.relevance ?? 0}</div>
              <div className="text-xs text-gray-400">Relevance</div>
            </div>
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

          {signal.token && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={`/dashboard/signal/t/${signal.token}`}
                className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
              >
                View full detail →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
