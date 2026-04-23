'use client'

import { UseCaseKey } from '@/types/dashboard'

interface UseCaseSelectorProps {
  activeUseCase: UseCaseKey | null
  onSelect: (useCase: UseCaseKey | null) => void
}

const USE_CASES: { key: UseCaseKey; label: string }[] = [
  { key: 'competitor_move', label: 'React To Competitor Move' },
  { key: 'market_problem', label: 'Analyze Market Problem' },
  { key: 'technology_scouting', label: 'Scout New Technology' },
]

export function UseCaseSelector({ activeUseCase, onSelect }: UseCaseSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {USE_CASES.map(({ key, label }) => {
        const isActive = activeUseCase === key
        return (
          <button
            key={key}
            onClick={() => onSelect(isActive ? null : key)}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-[#FFD700] bg-yellow-50 text-gray-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        )
      })}
      {activeUseCase !== null && (
        <button
          onClick={() => onSelect(null)}
          className="rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400"
        >
          Clear
        </button>
      )}
    </div>
  )
}
