import crypto from 'crypto'

// Password-gated session for the hidden /backstage traffic dashboard - a
// separate, lighter mechanism from the Supabase-account-based /admin (owner)
// panel, since /backstage needs to be reachable without logging into the app
// at all. The session cookie is signed with the admin password itself so no
// server-side session store is needed: anyone who can forge a valid
// signature already knows the password.
export const COOKIE_NAME = 'backstage_session'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12h

function sign(payload: string): string {
  const secret = process.env.ADMIN_PASSWORD || ''
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function createAdminSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload = String(expiresAt)
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = sign(payload)
  const signatureBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (signatureBuf.length !== expectedBuf.length) return false
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) return false

  const expiresAt = Number(payload)
  return Number.isFinite(expiresAt) && Date.now() < expiresAt
}

export function verifyAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof password !== 'string' || password.length === 0) return false

  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
