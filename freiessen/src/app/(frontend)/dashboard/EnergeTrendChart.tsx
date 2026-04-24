'use client'

import React, { useMemo, useRef, useState } from 'react'

type Point = { date: string; price: number }

function toDateLabel(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export function EnergyTrendChart({ title, points }: { title: string; points: Point[] }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const W = 600
  const H = 180
  const pad = 18

  const computed = useMemo(() => {
    if (!points || points.length < 2) {
      return {
        path: '',
        minY: 0,
        maxY: 0,
        scaleX: (i: number) => i,
        scaleY: (y: number) => y,
      }
    }

    const ys = points.map((p) => p.price)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const range = Math.max(1e-9, maxY - minY)

    const scaleX = (i: number) => pad + (i / Math.max(1, points.length - 1)) * (W - pad * 2)

    const scaleY = (y: number) => pad + (1 - (y - minY) / range) * (H - pad * 2)

    const path = points
      .map((p, i) => {
        const x = scaleX(i)
        const y = scaleY(p.price)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')

    return { path, minY, maxY, scaleX, scaleY }
  }, [points])

  const last = points[points.length - 1]

  const onMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!svgRef.current || !points || points.length < 2) return

    const rect = svgRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left

    // Convert mouse x into nearest index
    const t = (mx / rect.width) * W
    const usable = W - pad * 2
    const rawIndex = ((t - pad) / usable) * (points.length - 1)
    const idx = clamp(Math.round(rawIndex), 0, points.length - 1)

    const x = computed.scaleX(idx)
    const y = computed.scaleY(points[idx].price)

    setHoverIndex(idx)
    setTooltip({ x, y })
  }

  const onLeave = () => {
    setHoverIndex(null)
    setTooltip(null)
  }

  const activePoint = hoverIndex === null ? null : (points[hoverIndex] ?? null)

  const dot =
    hoverIndex === null
      ? null
      : {
          x: computed.scaleX(hoverIndex),
          y: computed.scaleY(points[hoverIndex].price),
        }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-600">
          Latest: <span className="font-semibold">{last?.price ?? '—'}</span>
        </p>
      </div>

      {!points || points.length < 2 ? (
        <p className="text-sm text-slate-600">Not enough data to draw a trend.</p>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {/* line */}
            <path
              d={computed.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-900"
            />

            {/* hover vertical guide */}
            {dot && (
              <line
                x1={dot.x}
                y1={pad}
                x2={dot.x}
                y2={H - pad}
                stroke="rgba(239, 68, 68, 0.35)" // red-500-ish
                strokeWidth="2"
              />
            )}

            {/* red pointer dot */}
            {dot && (
              <>
                <circle cx={dot.x} cy={dot.y} r={6} fill="rgba(239,68,68,0.25)" />
                <circle cx={dot.x} cy={dot.y} r={3.5} fill="rgb(239,68,68)" />
              </>
            )}
          </svg>

          {/* tooltip */}
          {tooltip && activePoint && (
            <div
              className="pointer-events-none absolute rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-md"
              style={{
                left: `${(tooltip.x / W) * 100}%`,
                top: `${(tooltip.y / H) * 100}%`,
                transform: 'translate(12px, -110%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div className="font-semibold text-slate-900">{activePoint.price}</div>
              <div className="text-slate-500">{toDateLabel(activePoint.date)}</div>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{toDateLabel(points[0].date)}</span>
            <span>
              Range: {computed.minY.toFixed(2)} → {computed.maxY.toFixed(2)}
            </span>
            <span>{toDateLabel(points[points.length - 1].date)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
