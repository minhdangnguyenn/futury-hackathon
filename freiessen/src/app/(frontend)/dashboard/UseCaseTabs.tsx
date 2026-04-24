'use client'

import type { UseCase } from '@/lib/signals/types'

export function UseCaseTabs({
  useCases,
  activeId,
  onChange,
}: {
  useCases: UseCase[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {useCases.map((u) => (
        <button
          key={u.id}
          onClick={() => onChange(u.id)}
          className={`text-left p-4 rounded-xl border-2 transition-all ${
            activeId === u.id
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <div className="text-2xl mb-1">{u.icon}</div>
          <div className="font-semibold text-sm">{u.label}</div>
          <div
            className={`text-xs mt-0.5 ${activeId === u.id ? 'text-gray-300' : 'text-gray-400'}`}
          >
            {u.description}
          </div>
        </button>
      ))}
    </div>
  )
}
