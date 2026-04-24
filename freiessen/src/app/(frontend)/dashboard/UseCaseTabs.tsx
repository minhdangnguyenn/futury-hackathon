'use client'

import type { UseCase } from '@/lib/signals/constants'

export function UseCaseTabs({
  useCases,
  activeId,
  onChange,
}: {
  useCases: UseCase[]
  activeId: string
  onChange: (id: string) => void
}) {
  if (!useCases?.length) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6">
      <div className="flex flex-wrap gap-2">
        {useCases.map((uc) => {
          const active = uc.id === activeId

          return (
            <button
              key={uc.id}
              type="button"
              onClick={() => onChange(uc.id)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                // ✅ prevent default dark focus + use blue ring
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                active
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="mr-1">{(uc as any).icon ?? '📌'}</span>
              {uc.label}
            </button>
          )
        })}
      </div>

      {/* optional description block */}
      {(() => {
        const activeUC = useCases.find((u) => u.id === activeId)
        if (!activeUC?.description) return null
        return <p className="mt-3 text-xs text-gray-500">{activeUC.description}</p>
      })()}
    </div>
  )
}
