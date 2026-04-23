'use client'

import type { Insight } from '@/types/dashboard'
import { truncateSummary } from '@/lib/dashboard-filters'

interface SignalCardProps {
  insight: Insight
  onClick: (insight: Insight) => void
}

const decisionBadgeStyles: Record<Insight['decisionLabel'], string> = {
  Build: 'bg-[#FFD700] text-black',
  Invest: 'bg-blue-500 text-white',
  Ignore: 'bg-gray-400 text-white',
}

const sourceCategoryLabels: Record<Insight['sourceCategory'], string> = {
  patent: 'Patent',
  forum: 'Forum',
  news: 'News',
  research: 'Research',
  social: 'Social',
}

export function SignalCard({ insight, onClick }: SignalCardProps) {
  const truncated = truncateSummary(insight.summary, 280)
  const detectedDate = new Date(insight.detectedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article
      aria-label={`${insight.title} - ${insight.decisionLabel}`}
      onClick={() => onClick(insight)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-2">{insight.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{truncated}</p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {sourceCategoryLabels[insight.sourceCategory]}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${decisionBadgeStyles[insight.decisionLabel]}`}
          >
            {insight.decisionLabel}
          </span>
        </div>
        <time dateTime={insight.detectedAt} className="text-xs text-gray-400">
          {detectedDate}
        </time>
      </div>
    </article>
  )
}
