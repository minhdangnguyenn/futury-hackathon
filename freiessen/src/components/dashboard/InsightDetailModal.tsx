'use client'

import { useEffect } from 'react'
import type { Insight } from '@/types/dashboard'

interface InsightDetailModalProps {
  insight: Insight | null
  onClose: () => void
}

const decisionBadgeStyles: Record<Insight['decisionLabel'], string> = {
  Build: 'bg-[#FFD700] text-black',
  Invest: 'bg-blue-500 text-white',
  Ignore: 'bg-gray-400 text-white',
}

export function InsightDetailModal({ insight, onClose }: InsightDetailModalProps) {
  useEffect(() => {
    if (!insight) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [insight, onClose])

  if (!insight) return null

  const bodyText =
    insight.fullText
      ? typeof insight.fullText === 'string'
        ? insight.fullText
        : JSON.stringify(insight.fullText)
      : insight.summary

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal panel */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">{insight.title}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${decisionBadgeStyles[insight.decisionLabel]}`}
            >
              {insight.decisionLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-4">
          {/* Full text / summary */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{bodyText}</p>

          {/* Reasoning */}
          {insight.reasoning && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Reasoning</h3>
              <p className="text-sm text-gray-600">{insight.reasoning}</p>
            </div>
          )}

          {/* Source URLs */}
          {insight.sourceUrls && insight.sourceUrls.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Sources</h3>
              <ul className="space-y-1">
                {insight.sourceUrls.map(({ url }, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
