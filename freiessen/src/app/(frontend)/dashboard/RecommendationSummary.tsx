'use client'

export function RecommendationSummary({
  buildCount,
  investCount,
  ignoreCount,
  activeFilter,
  onToggle,
}: {
  buildCount: number
  investCount: number
  ignoreCount: number
  activeFilter: string
  onToggle: (id: 'build' | 'invest' | 'ignore') => void
}) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <button
        onClick={() => onToggle('build')}
        className={`p-4 rounded-xl border-2 text-left transition-all ${
          activeFilter === 'build'
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 bg-white hover:border-green-300'
        }`}
      >
        <div className="text-2xl font-bold text-green-600">{buildCount}</div>
        <div className="text-sm font-medium text-gray-700">🟢 Build</div>
        <div className="text-xs text-gray-400">High priority signals</div>
      </button>

      <button
        onClick={() => onToggle('invest')}
        className={`p-4 rounded-xl border-2 text-left transition-all ${
          activeFilter === 'invest'
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-200 bg-white hover:border-yellow-300'
        }`}
      >
        <div className="text-2xl font-bold text-yellow-600">{investCount}</div>
        <div className="text-sm font-medium text-gray-700">🟡 Invest</div>
        <div className="text-xs text-gray-400">Worth monitoring</div>
      </button>

      <button
        onClick={() => onToggle('ignore')}
        className={`p-4 rounded-xl border-2 text-left transition-all ${
          activeFilter === 'ignore'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 bg-white hover:border-red-300'
        }`}
      >
        <div className="text-2xl font-bold text-red-500">{ignoreCount}</div>
        <div className="text-sm font-medium text-gray-700">🔴 Ignore</div>
        <div className="text-xs text-gray-400">Low priority signals</div>
      </button>
    </div>
  )
}
