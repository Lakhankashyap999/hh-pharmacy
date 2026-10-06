import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 }),
      user: null,
    }
  }
  return { authorized: true, response: null, user: session.user }
}

export async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Login required' }, { status: 401 }),
      user: null,
    }
  }
  return { authorized: true, response: null, user: session.user }
}
