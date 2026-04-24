'use client'

import React, { useMemo } from 'react'

type Point = { date: string; price: number }

function toDateLabel(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function EnergyTrendChart({ title, points }: { title: string; points: Point[] }) {
  const { path, min, max } = useMemo(() => {
    const xs = points.map((_, i) => i)
    const ys = points.map((p) => p.price)

    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const range = Math.max(1e-9, maxY - minY)

    const W = 600
    const H = 160
    const pad = 16

    const scaleX = (i: number) => pad + (i / Math.max(1, points.length - 1)) * (W - pad * 2)

    const scaleY = (y: number) => pad + (1 - (y - minY) / range) * (H - pad * 2)

    const d = points
      .map((p, i) => {
        const x = scaleX(xs[i])
        const y = scaleY(p.price)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')

    return { path: d, min: minY, max: maxY }
  }, [points])

  const last = points[points.length - 1]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-600">
          Latest: <span className="font-semibold">{last?.price ?? '—'}</span>
        </p>
      </div>

      {points.length < 2 ? (
        <p className="text-sm text-slate-600">Not enough data to draw a trend.</p>
      ) : (
        <>
          <svg viewBox="0 0 600 160" className="w-full">
            <path
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-900"
            />
          </svg>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{toDateLabel(points[0].date)}</span>
            <span>
              Range: {min.toFixed(2)} → {max.toFixed(2)}
            </span>
            <span>{toDateLabel(points[points.length - 1].date)}</span>
          </div>
        </>
      )}
    </div>
  )
}
