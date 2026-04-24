'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type ChatMessage = {
  id: string
  from: 'user' | 'bot'
  text: string
  createdAt: number
}

type ChatContext = Record<string, unknown>

const STORAGE_KEY = 'dashboard.chat.messages.v1'

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  from: 'bot',
  text: 'Hi there! Ask me anything about the dashboard, signals, or competitors.',
  createdAt: Date.now(),
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

function fallbackReply(question: string): string {
  const normalized = question.trim().toLowerCase()
  if (!normalized) return 'Please type a question and I will try to help.'

  if (normalized.includes('signal')) {
    return 'I can help you understand the signal list, trends, and relevance scores. Try asking about top signals or freshness.'
  }
  if (normalized.includes('competitor')) {
    return 'Competitor charts show relative signal coverage. You can click a competitor to review their signal performance.'
  }
  if (normalized.includes('detect') || normalized.includes('detection')) {
    return 'Use the detection panel to scan all signals or search by keyword.'
  }

  return 'I could not reach the chat API, so I replied locally. Once your API is configured, I will answer using it.'
}

async function postChat(options: {
  apiUrl: string
  apiKey?: string
  message: string
  context?: ChatContext
  conversation: ChatMessage[]
}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // IMPORTANT:
  // Putting an API key in NEXT_PUBLIC_* means it will be exposed in the browser.
  // Only do this for keys that are meant to be public, or use a server route (/api/chat) instead.
  if (options.apiKey) headers['Authorization'] = `Bearer ${options.apiKey}`

  const res = await fetch(options.apiUrl, {
    method: 'POST',
    headers,
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

  // Expected response: { reply: string }
  const data = (await res.json()) as { reply?: string }
  return data.reply ?? ''
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Read from env (client-side)
  const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim() || '/api/chat'
  const apiKey = process.env.NEXT_PUBLIC_CHAT_API_KEY?.trim() || undefined

  // Optional: if you want to attach some simple “selected context” without props.
  // You can later replace this with real dashboard state passed as props.
  const context = useMemo<ChatContext>(() => {
    return {
      page: 'dashboard',
      // You could add things like:
      // selectedUseCase: window.location.search ... (careful: window not in SSR)
    }
  }, [])

  const placeholder = useMemo(() => 'Ask about signals, competitors, or dashboard actions...', [])

  const toggleOpen = () => setOpen((current) => !current)

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = safeParseMessages(localStorage.getItem(STORAGE_KEY))
    if (loaded && loaded.length > 0) setMessages(loaded)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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

    const conversationSnapshot = [...messages, userMessage]
    setMessages(conversationSnapshot)
    setInput('')
    setSending(true)

    try {
      let replyText = ''

      try {
        replyText = await postChat({
          apiUrl,
          apiKey,
          message: trimmed,
          context,
          conversation: conversationSnapshot,
        })
      } catch (e) {
        // Fall back locally if the API isn't ready
        replyText = fallbackReply(trimmed)
        setError(e instanceof Error ? e.message : 'Chat API error')
      }

      const botMessage: ChatMessage = {
        id: makeId('bot'),
        from: 'bot',
        text: replyText || 'Sorry — I did not get a reply. Try again.',
        createdAt: Date.now(),
      }

      setMessages((current) => [...current, botMessage])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
          role="dialog"
          aria-label="Dashboard Assistant"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Dashboard Assistant</p>
              <p className="text-xs text-slate-500">
                API: <code className="font-mono">{apiUrl}</code>
              </p>
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
                <p className="text-xs whitespace-pre-wrap">{error}</p>
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
              LocalStorage key: <code className="font-mono">{STORAGE_KEY}</code>
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
