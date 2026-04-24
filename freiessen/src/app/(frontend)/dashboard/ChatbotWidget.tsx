'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type ChatMessage = {
  id: string
  from: 'user' | 'bot'
  text: string
  createdAt: number
}

type ChatContext = Record<string, unknown>

type ChatbotWidgetProps = {
  context?: ChatContext
  apiUrl?: string
  storageKey?: string
  title?: string
  subtitle?: string
}

const DEFAULT_STORAGE_KEY = 'dashboard.chat.messages.v1'

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  from: 'bot',
  text: 'Hi there! Ask me anything about the dashboard, signals, or competitors.',
  createdAt: Date.now(),
}

function generateBotReply(question: string): string {
  const normalized = question.trim().toLowerCase()
  if (!normalized) return 'Please type a question and I will try to help.'

  if (normalized.includes('signal')) {
    return 'I can help you understand the signal list, trends, and relevance scores. Try asking about top signals or freshness.'
  }
  if (normalized.includes('competitor')) {
    return 'Competitor charts show relative signal coverage. You can click a competitor to review their signal performance.'
  }
  if (normalized.includes('detect') || normalized.includes('detection')) {
    return 'Use the detection panel to scan all signals or search by keyword. If you want more recent data, run detection again.'
  }
  if (normalized.includes('help') || normalized.includes('how')) {
    return 'Try asking about the dashboard metrics, use cases, or how to filter and expand signal details.'
  }

  return 'That is a great question! I am a simple starter bot, but you can expand me later to call an AI service or connect to product help.'
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function safeParseMessages(raw: string | null): ChatMessage[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    const ok = parsed.every((m) => {
      return (
        m &&
        typeof m === 'object' &&
        typeof (m as any).id === 'string' &&
        ((m as any).from === 'user' || (m as any).from === 'bot') &&
        typeof (m as any).text === 'string' &&
        typeof (m as any).createdAt === 'number'
      )
    })

    return ok ? (parsed as ChatMessage[]) : null
  } catch {
    return null
  }
}

async function postChat(options: {
  apiUrl: string
  message: string
  context?: ChatContext
  conversation: ChatMessage[]
}) {
  const res = await fetch(options.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: options.message,
      context: options.context ?? {},
      conversation: options.conversation,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Chat API failed: ${res.status} ${res.statusText} ${text}`)
  }

  // Expecting: { reply: string }
  const data = (await res.json()) as { reply?: string }
  return data.reply ?? ''
}

export function ChatbotWidget({
  context,
  apiUrl = '/api/chat',
  storageKey = DEFAULT_STORAGE_KEY,
  title = 'Dashboard Assistant',
  subtitle = 'Ask a question about signals, competitors, or actions',
}: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const placeholder = useMemo(() => 'Ask about signals, competitors, or dashboard actions...', [])

  const toggleOpen = () => setOpen((current) => !current)

  // Load from localStorage once
  useEffect(() => {
    const loaded = safeParseMessages(localStorage.getItem(storageKey))
    if (loaded && loaded.length > 0) setMessages(loaded)
  }, [storageKey])

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      // ignore quota / blocked storage
    }
  }, [messages, storageKey])

  // Auto-scroll when open
  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, open, sending, error])

  // Focus input when opening
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  const handleClear = () => {
    const next = [welcomeMessage]
    setMessages(next)
    setInput('')
    setSending(false)
    setError(null)

    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore
    }

    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleSend = async () => {
    if (sending) return

    const trimmed = input.trim()
    if (!trimmed) return

    setError(null)

    const userMessage: ChatMessage = {
      id: makeId('user'),
      from: 'user',
      text: trimmed,
      createdAt: Date.now(),
    }

    // Compute the conversation snapshot that will be sent to the API
    const conversationSnapshot = [...messages, userMessage]

    setMessages(conversationSnapshot)
    setInput('')
    setSending(true)

    try {
      let replyText = ''

      // If API exists later, this will work; for now it will likely 404 → fallback
      try {
        replyText = await postChat({
          apiUrl,
          message: trimmed,
          context,
          conversation: conversationSnapshot,
        })
      } catch {
        // Fallback to local reply if API isn't ready yet
        await new Promise((r) => setTimeout(r, 250))
        replyText = generateBotReply(trimmed)
      }

      const botMessage: ChatMessage = {
        id: makeId('bot'),
        from: 'bot',
        text: replyText || 'Sorry — I did not get a reply. Try again.',
        createdAt: Date.now(),
      }

      setMessages((current) => [...current, botMessage])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSending(false)
    }
  }

  const hasContext = !!context && Object.keys(context).length > 0

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
          role="dialog"
          aria-label={title}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
              {hasContext && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Context attached (selected filters/tabs)
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={toggleOpen}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.from === 'user'
                    ? 'ml-auto bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">{message.text}</p>
              </div>
            ))}

            {sending && (
              <div className="max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-slate-700">
                <p className="text-sm leading-6">Typing…</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
                <p className="text-xs">{error}</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                aria-label="Chat input"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Send
              </button>
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Stored in LocalStorage key: <code className="font-mono">{storageKey}</code>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? 'Close chat' : 'Chat with assistant'}
      </button>
    </div>
  )
}
