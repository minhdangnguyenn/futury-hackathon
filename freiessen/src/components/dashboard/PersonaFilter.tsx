'use client'

import { PersonaKey } from '@/types/dashboard'

interface PersonaFilterProps {
  activePersona: PersonaKey | null
  onSelect: (persona: PersonaKey | null) => void
}

const PERSONAS: { key: PersonaKey; name: string; description: string }[] = [
  {
    key: 'josef',
    name: 'Josef',
    description: 'Loyal Traditionalist — values proven solutions and long-term reliability.',
  },
  {
    key: 'steffen',
    name: 'Steffen',
    description: 'Demanding Doer — focused on efficiency, speed, and practical results.',
  },
  {
    key: 'david',
    name: 'David',
    description: 'Digital Innovator — embraces technology and data-driven decision making.',
  },
  {
    key: 'volkmar',
    name: 'Volkmar',
    description: 'Cautious Follower — risk-averse, prefers established market standards.',
  },
  {
    key: 'nick',
    name: 'Nick',
    description: 'Sustainable Companion — prioritises environmental impact and future-proofing.',
  },
]

export function PersonaFilter({ activePersona, onSelect }: PersonaFilterProps) {
  const activeEntry = PERSONAS.find((p) => p.key === activePersona)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((persona) => {
          const isActive = activePersona === persona.key
          return (
            <button
              key={persona.key}
              aria-label={persona.name}
              aria-pressed={isActive}
              onClick={() => onSelect(isActive ? null : persona.key)}
              className={
                isActive
                  ? 'rounded border px-4 py-2 text-sm font-medium bg-[#FFD700] text-black border-[#FFD700]'
                  : 'rounded border px-4 py-2 text-sm font-medium bg-white text-gray-800 border-gray-300 hover:border-gray-500'
              }
            >
              {persona.name}
            </button>
          )
        })}
      </div>
      {activeEntry && (
        <p className="mt-2 text-sm text-gray-600">{activeEntry.description}</p>
      )}
    </div>
  )
}
