export function ScoreBar({ value }: { value: number }) {
  const color = value >= 75 ? '#22c55e' : value >= 55 ? '#eab308' : '#ef4444'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}
