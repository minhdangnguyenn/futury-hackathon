interface TrendingTopicsListProps {
  trends: Array<{ topic: string; totalCount: number }> // top 5, pre-sorted by volume (from getTopTrends)
}

export function TrendingTopicsList({ trends }: TrendingTopicsListProps) {
  if (trends.length === 0) {
    return <p className="text-sm text-gray-500">No trending topics available</p>
  }

  return (
    <ol className="space-y-2">
      {trends.map((item, index) => (
        <li key={item.topic} className="flex items-center gap-3">
          <span className="w-5 text-sm font-bold text-gray-400">{index + 1}</span>
          <span className="flex-1 text-sm font-medium text-gray-800">{item.topic}</span>
          <span className="text-sm text-gray-500">{item.totalCount}</span>
        </li>
      ))}
    </ol>
  )
}
