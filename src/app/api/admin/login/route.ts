import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminToken } from '@/lib/admin-session'

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  const ADMIN_USER = process.env.ADMIN_USER
  const ADMIN_PASS = process.env.ADMIN_PASS
  const ADMIN_SECRET = process.env.ADMIN_SECRET

  if (!ADMIN_SECRET) {
    console.error('ADMIN_SECRET env var is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = await createAdminToken(ADMIN_SECRET)
    const cookieStore = await cookies()

    cookieStore.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
  return NextResponse.json({ success: true })
}
