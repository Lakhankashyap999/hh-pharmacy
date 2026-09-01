import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isAuth =
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token') ||
    req.cookies.get('authjs.session-token')

  // Protect admin routes except login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!isAuth) {
      // In dev mode allow direct access or redirect
      // return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protect account routes
  if (path.startsWith('/account')) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
