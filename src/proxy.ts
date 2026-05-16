import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { verifyAdminToken } from '@/lib/admin-session'

export async function proxy(request: NextRequest) {
  const { nextUrl } = request

  const { response, user } = await updateSession(request)

  const adminSession = request.cookies.get('admin-session')?.value
  const adminAuthenticated = await verifyAdminToken(adminSession, process.env.ADMIN_SECRET)

  const isAdminPath = nextUrl.pathname.startsWith('/admin')
  const isAdminLogin = nextUrl.pathname === '/admin/login'
  const isDashboard = nextUrl.pathname.startsWith('/dashboard')

  // Protect admin routes
  if (isAdminPath && !isAdminLogin && !adminAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Redirect authenticated admins away from login
  if (isAdminLogin && adminAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect student dashboard
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const email = user.email ?? ''

    // Enforce university domain
    if (!email.endsWith('@isb.nu.edu.pk')) {
      // Sign out happens client-side; just redirect with error flag
      return NextResponse.redirect(new URL('/login?error=domain', request.url))
    }

    // Redirect authenticated students away from login
    if (nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
