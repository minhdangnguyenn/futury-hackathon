'use client'

import { useMemo, useState } from 'react'

type ChatMessage = {
  id: string
  from: 'user' | 'bot'
  text: string
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  from: 'bot',
  text: 'Hi there! Ask me anything about the dashboard, signals, or competitors.',
}

function generateBotReply(question: string): string {
  const normalized = question.trim().toLowerCase()

  if (!normalized) {
    return 'Please type a question and I will try to help.'
  }

  if (normalized.includes('signal')) {
    return 'I can help you understand the signal list, trends, and relevance scores. Try asking about top signals or freshness.'
  }

  if (normalized.includes('competitor') || normalized.includes('competitors')) {
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

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const toggleOpen = () => setOpen((current) => !current)

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setSending(true)

    const replyText = generateBotReply(trimmed)

    await new Promise((resolve) => setTimeout(resolve, 250))

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      from: 'bot',
      text: replyText,
    }

    setMessages((current) => [...current, botMessage])
    setSending(false)
  }

  const placeholder = useMemo(
    () => 'Ask about signals, competitors, or dashboard actions...',
    []
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Dashboard Assistant</p>
              <p className="text-xs text-slate-500">Start with a quick question</p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-3 py-2 ${
                  message.from === 'user'
                    ? 'ml-auto bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm leading-6">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <div className="flex gap-2">
              <input
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
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-red-700 focus:outline-none"
      >
        {open ? 'Close chat' : 'Chat with assistant'}
      </button>
    </div>
  )
}
