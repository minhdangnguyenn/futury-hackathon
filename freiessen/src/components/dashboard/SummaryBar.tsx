import type { Insight } from '@/types/dashboard'

interface SummaryBarProps {
  insights: Insight[]
}

export function SummaryBar({ insights }: SummaryBarProps) {
  const build = insights.filter((i) => i.decisionLabel === 'Build').length
  const invest = insights.filter((i) => i.decisionLabel === 'Invest').length
  const ignore = insights.filter((i) => i.decisionLabel === 'Ignore').length

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-600">Summary:</span>
      <div className="flex items-center gap-2">
        <span className="rounded px-2 py-0.5 text-sm font-semibold bg-[#FFD700] text-black">
          Build {build}
        </span>
        <span className="rounded px-2 py-0.5 text-sm font-semibold bg-blue-500 text-white">
          Invest {invest}
        </span>
        <span className="rounded px-2 py-0.5 text-sm font-semibold bg-gray-400 text-white">
          Ignore {ignore}
        </span>
      </div>
    </div>
  )
}
