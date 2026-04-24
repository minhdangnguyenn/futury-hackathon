'use client'

import { DetectSignalsPanel } from './DetectSignalPanel'

export function AutomatedDetectionPanel({
  detecting,
  lastDetected,
  detectedCount,
  keyword,
  setKeyword,
  runDetection,
}: {
  detecting: boolean
  lastDetected: string | null
  detectedCount: number | null
  keyword: string
  setKeyword: React.Dispatch<React.SetStateAction<string>>
  runDetection: (mode: 'all' | 'keyword') => Promise<unknown>
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">🤖 Automated Signal Detection</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Sources: HackerNews · Reddit r/HVAC · Reddit r/plumbing
          </p>
          {lastDetected && (
            <p className="text-xs text-green-600 mt-1">
              ✅ {detectedCount} new signals detected at {lastDetected}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => runDetection('all')}
            disabled={detecting}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: detecting ? '#999' : '#E2001A' }}
          >
            {detecting ? '⏳ Detecting...' : '🔍 Detect All'}
          </button>

          <button
            onClick={() => runDetection('keyword')}
            disabled={detecting}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50"
          >
            Detect keyword
          </button>
        </div>
      </div>

      <div className="mt-4">
        <DetectSignalsPanel keyword={keyword} setKeyword={setKeyword} />
      </div>
    </div>
  )
}
