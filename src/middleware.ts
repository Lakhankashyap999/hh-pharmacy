import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const secret = process.env.NEXTAUTH_SECRET || 'hh-secret-fallback-key'
  const token = await getToken({ req, secret })

  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      if (token && (token as any).role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return NextResponse.next()
    }

    if (!token || (token as any).role !== 'admin') {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect customer account routes
  if (path.startsWith('/account')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
