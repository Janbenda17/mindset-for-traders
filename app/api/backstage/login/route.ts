import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, createAdminSessionToken, COOKIE_NAME } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!verifyAdminPassword(body?.password)) {
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return response
}
