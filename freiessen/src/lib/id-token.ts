import crypto from 'crypto'

function getSecret() {
  const secret = process.env.ID_TOKEN_SECRET
  if (!secret) {
    throw new Error('Missing ID_TOKEN_SECRET')
  }
  return secret
}

export type IdTokenPayload = {
  id: string
  col?: string
  exp?: number
}

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

function unb64url(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function signId(payload: IdTokenPayload) {
  const json = JSON.stringify(payload)
  const body = b64url(json)
  const secret = getSecret()
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyId(token: unknown): IdTokenPayload | null {
  if (typeof token !== 'string' || token.length === 0) return null

  const [body, sig] = token.split('.')
  if (!body || !sig) return null

  const secret = getSecret()
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url')

  // constant-time compare
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null
  if (!crypto.timingSafeEqual(a, b)) return null

  const payload = JSON.parse(unb64url(body)) as IdTokenPayload
  if (!payload?.id) return null
  if (payload.exp && Date.now() / 1000 > payload.exp) return null

  return payload
}
