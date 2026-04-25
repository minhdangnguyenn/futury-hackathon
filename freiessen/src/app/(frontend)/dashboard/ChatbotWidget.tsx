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
const DEFAULT_CHAT_API_URL = 'https://backend-pzxsbovuxa-ew.a.run.app/debates/stream/idea'

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  from: 'bot',
  text: 'Share an idea and I will test it against the latest 5 dashboard signals with all 5 personas.',
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

function normalizeApiUrl(rawUrl?: string | null) {
  const trimmed = rawUrl?.trim()
  if (!trimmed) return DEFAULT_CHAT_API_URL
  if (/\/debates\/stream\/idea\/?$/.test(trimmed)) {
    return trimmed
  }
  if (/\/api\/chat\/?$/.test(trimmed)) {
    return trimmed.replace(/\/api\/chat\/?$/, '/debates/stream/idea')
  }
  return `${trimmed.replace(/\/+$/, '')}/debates/stream/idea`
}

function summarizeContext(context?: ChatContext) {
  if (!context) return ''

  const lines: string[] = []
  const activeUseCase = context.activeUseCase
  if (activeUseCase && typeof activeUseCase === 'object') {
    const label = (activeUseCase as { label?: unknown }).label
    if (typeof label === 'string' && label.trim()) {
      lines.push(`Active use case: ${label.trim()}`)
    }
  }

  const keyword = context.keyword
  if (typeof keyword === 'string' && keyword.trim()) {
    lines.push(`Current keyword filter: ${keyword.trim()}`)
  }

  const counts = context.counts
  if (counts && typeof counts === 'object') {
    const totalSignals = (counts as { totalSignals?: unknown }).totalSignals
    const signalsInUseCase = (counts as { signalsInUseCase?: unknown }).signalsInUseCase
    if (typeof totalSignals === 'number') {
      lines.push(`Signals tracked: ${totalSignals}`)
    }
    if (typeof signalsInUseCase === 'number') {
      lines.push(`Signals in current use case: ${signalsInUseCase}`)
    }
  }

  const topSignals = context.topSignals
  if (Array.isArray(topSignals)) {
    const titles = topSignals
      .slice(0, 3)
      .map((signal) => {
        if (!signal || typeof signal !== 'object') return null
        const title = (signal as { title?: unknown }).title
        return typeof title === 'string' && title.trim() ? title.trim() : null
      })
      .filter((value): value is string => !!value)

    if (titles.length > 0) {
      lines.push(`Top visible signals: ${titles.join('; ')}`)
    }
  }

  return lines.join('\n')
}

function buildIdeaPayload(message: string, context?: ChatContext) {
  const normalizedMessage = message.trim()
  const contextSummary = summarizeContext(context)
  if (!contextSummary) return normalizedMessage

  return [
    normalizedMessage,
    'Dashboard context:',
    contextSummary,
  ].join('\n\n')
}

type StreamEvent = {
  event: string
  data: Record<string, unknown>
}

type DebateFinalResult = {
  recommendation?: string
  confidence_score?: number
  reasoning?: string
  next_actions?: string[]
  agreements?: string[]
  conflicts?: string[]
}

function parseSseBlock(block: string): StreamEvent | null {
  const lines = block
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)

  if (lines.length === 0) return null

  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice('event:'.length).trim()
      continue
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trim())
    }
  }

  if (dataLines.length === 0) return null

  try {
    return { event, data: JSON.parse(dataLines.join('\n')) as Record<string, unknown> }
  } catch {
    return null
  }
}

function formatFinalReply(result: DebateFinalResult | null) {
  if (!result) {
    return 'I reviewed the idea, but I did not receive a final debate result. Please try again.'
  }

  const lines = [
    `Recommendation: ${result.recommendation ?? 'MONITOR'}`,
  ]

  if (typeof result.confidence_score === 'number') {
    lines.push(`Confidence: ${result.confidence_score}/10`)
  }

  if (result.reasoning) {
    lines.push('', result.reasoning)
  }

  if (Array.isArray(result.next_actions) && result.next_actions.length > 0) {
    lines.push('', 'Next actions:')
    for (const action of result.next_actions.slice(0, 3)) {
      lines.push(`- ${action}`)
    }
  }

  if (Array.isArray(result.agreements) && result.agreements.length > 0) {
    lines.push('', `Key agreement: ${result.agreements[0]}`)
  }

  if (Array.isArray(result.conflicts) && result.conflicts.length > 0) {
    lines.push(`Key tension: ${result.conflicts[0]}`)
  }

  return lines.join('\n')
}

function streamStatusFromEvent(streamEvent: StreamEvent) {
  const { event, data } = streamEvent

  if (event === 'idea_received') {
    return 'Reviewing your idea against the latest dashboard signals...'
  }
  if (event === 'session_started') {
    const signals = Array.isArray(data.signals) ? data.signals.length : null
    return signals ? `Debate started with ${signals} signals in scope.` : 'Debate session started.'
  }
  if (event === 'correlation_started') {
    return 'Finding relationships across the latest signals...'
  }
  if (event === 'brief_started') {
    return 'Preparing the executive brief for the personas...'
  }
  if (event === 'persona_started') {
    const personaName = data.persona_name
    if (typeof personaName === 'string' && personaName.trim()) {
      return `${personaName} is responding...`
    }
    return 'A persona is responding...'
  }
  if (event === 'synthesis_started') {
    return 'Synthesizing the final recommendation...'
  }

  return null
}

async function postChat(options: {
  apiUrl: string
  message: string
  context?: ChatContext
  apiKey?: string
  onStatus?: (text: string) => void
}) {
  const requestBody = JSON.stringify({
    idea: buildIdeaPayload(options.message, options.context),
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  }
  if (options.apiKey?.trim()) {
    headers['X-API-Key'] = options.apiKey.trim()
  }

  console.info('[ChatbotWidget] Calling debate API', {
    url: options.apiUrl,
    requestBody,
  })

  const res = await fetch(options.apiUrl, {
    method: 'POST',
    headers,
    body: requestBody,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const debugInfo = {
      url: options.apiUrl,
      requestBody,
      status: res.status,
      statusText: res.statusText,
      responseText: text,
    }
    console.error('[ChatbotWidget] Debate API returned non-OK response', debugInfo)
    throw new Error(`Chat API failed: ${res.status} ${res.statusText} ${text}`)
  }

  if (!res.body) {
    const debugInfo = {
      url: options.apiUrl,
      requestBody,
      status: res.status,
      statusText: res.statusText,
      responseText: 'Response body is empty.',
    }
    console.error('[ChatbotWidget] Debate API response body missing', debugInfo)
    throw new Error('Chat API did not return a response body.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResult: DebateFinalResult | null = null

  const processBlocks = (raw: string, flush: boolean) => {
    const blocks = raw.split('\n\n')
    const remainder = flush ? '' : (blocks.pop() ?? '')

    for (const block of blocks) {
      const streamEvent = parseSseBlock(block)
      if (!streamEvent) continue

      const status = streamStatusFromEvent(streamEvent)
      if (status) {
        options.onStatus?.(status)
      }

      if (streamEvent.event === 'error') {
        const message = streamEvent.data.message
        const debugInfo = {
          url: options.apiUrl,
          requestBody,
          status: res.status,
          statusText: res.statusText,
          responseText: typeof message === 'string' ? message : 'Chat stream failed.',
        }
        console.error('[ChatbotWidget] Debate API stream error', debugInfo)
        throw new Error(typeof message === 'string' ? message : 'Chat stream failed.')
      }

      if (streamEvent.event === 'final_result') {
        const result = streamEvent.data.result
        if (result && typeof result === 'object') {
          finalResult = result as DebateFinalResult
        }
      }
    }

    return remainder
  }

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })
    buffer = processBlocks(buffer, done)

    if (done) break
  }

  return formatFinalReply(finalResult)
}

export function ChatbotWidget({
  context,
  apiUrl,
  storageKey = DEFAULT_STORAGE_KEY,
  title = 'Dashboard Assistant',
  subtitle = 'Test an idea against the latest dashboard signals',
}: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const resolvedApiUrl = useMemo(
    () => normalizeApiUrl(apiUrl ?? process.env.NEXT_PUBLIC_CHAT_API_URL),
    [apiUrl],
  )
  const apiKey = process.env.NEXT_PUBLIC_CHAT_API_KEY

  const placeholder = useMemo(
    () => 'Describe an idea to test with the latest dashboard signals...',
    [],
  )

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

    const botMessageId = makeId('bot')
    const conversationSnapshot = [...messages, userMessage]

    setMessages([
      ...conversationSnapshot,
      {
        id: botMessageId,
        from: 'bot',
        text: 'Reviewing your idea against the latest dashboard signals...',
        createdAt: Date.now(),
      },
    ])
    setInput('')
    setSending(true)

    try {
      const replyText = await postChat({
        apiUrl: resolvedApiUrl,
        message: trimmed,
        context,
        apiKey,
        onStatus: (status) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === botMessageId ? { ...message, text: status } : message,
            ),
          )
        },
      })

      setMessages((current) =>
        current.map((message) =>
          message.id === botMessageId
            ? {
                ...message,
                text: replyText || 'Sorry — I did not get a reply. Try again.',
              }
            : message,
        ),
      )
    } catch (e) {
      setMessages((current) => current.filter((message) => message.id !== botMessageId))
      console.error('[ChatbotWidget] Debate API call failed', {
        url: resolvedApiUrl,
        error: e,
      })
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
