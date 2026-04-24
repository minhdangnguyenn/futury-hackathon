'use client'

import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '@/app/(frontend)/hooks/useDebouncedValue'

type DetectSignalsPanelProps = {
  keyword: string
  setKeyword: React.Dispatch<React.SetStateAction<string>>
}

export function DetectSignalsPanel({ keyword, setKeyword }: DetectSignalsPanelProps) {
  const debouncedKeyword = useDebouncedValue(keyword, 200)

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const q = debouncedKeyword.trim()

    if (!q) {
      setSuggestions([])
      setOpen(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setIsLoadingSuggestions(true)
        const res = await fetch(`/api/keyword-suggestions?query=${encodeURIComponent(q)}`)
        const data = await res.json()
        if (cancelled) return

        const next = Array.isArray(data?.suggestions) ? (data.suggestions as string[]) : []
        setSuggestions(next)
        setOpen(true)
      } catch {
        if (!cancelled) {
          setSuggestions([])
          setOpen(false)
        }
      } finally {
        if (!cancelled) setIsLoadingSuggestions(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [debouncedKeyword])

  const onPick = (s: string) => {
    setKeyword(s)
    setOpen(false)
  }

  const showPanel =
    open && (isLoadingSuggestions || suggestions.length > 0 || debouncedKeyword.trim().length > 0)

  return (
    <div ref={containerRef} style={{ position: 'relative', maxWidth: 520 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Keyword</label>

      <input
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          if (keyword.trim()) setOpen(true)
        }}
        placeholder="Type: heat pump, pipe corrosion, lead-free solder..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 10,
          outline: 'none',
        }}
      />

      {showPanel && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            boxShadow: '0 10px 25px rgba(0,0,0,0.10)',
            zIndex: 9999,
            padding: 10,
            overflow: 'hidden',
          }}
        >
          {isLoadingSuggestions && (
            <div style={{ padding: '6px 2px', fontSize: 13, color: '#666' }}>Loading…</div>
          )}

          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPick(s)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 999,
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1.1,
                    maxWidth: '100%',
                  }}
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!isLoadingSuggestions && suggestions.length === 0 && (
            <div style={{ padding: '6px 2px', fontSize: 13, color: '#666' }}>No suggestions</div>
          )}
        </div>
      )}
    </div>
  )
}
