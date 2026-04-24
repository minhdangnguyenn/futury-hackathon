export type InteractionEvent =
  | {
      type: 'chat_opened' | 'chat_closed'
      ts: number
      path?: string
    }
  | {
      type: 'chat_message_sent'
      ts: number
      path?: string
      messageId: string
      text: string
    }
  | {
      type: 'ui_click'
      ts: number
      path?: string
      target: string
      meta?: Record<string, unknown>
    }
  | {
      type: 'ui_select'
      ts: number
      path?: string
      key: string
      value: string
      meta?: Record<string, unknown>
    }

const STORAGE_KEY = 'viega.interactions.v1'
const MAX_EVENTS = 200 // prevent localStorage bloat

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function readInteractionLog(): InteractionEvent[] {
  if (typeof window === 'undefined') return []
  return safeParse<InteractionEvent[]>(window.localStorage.getItem(STORAGE_KEY), [])
}

export function appendInteractionEvent(event: InteractionEvent) {
  if (typeof window === 'undefined') return
  const current = readInteractionLog()
  const next = [...current, event].slice(-MAX_EVENTS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearInteractionLog() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
