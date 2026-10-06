import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const providers: any[] = []

// Only enable Google Provider if valid credentials exist in env
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.includes('dummy')
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

providers.push(
  CredentialsProvider({
    id: 'customer-credentials',
    name: 'Customer Login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      const cleanEmail = credentials.email.trim().toLowerCase()

      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      })

      if (!user) return null

      // If user signed up with OAuth and has no password set, reject credentials login
      if (!user.passwordHash) {
        return null
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
      if (!isValid) return null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: 'customer',
      } as any
    },
  }),
  CredentialsProvider({
    id: 'admin-credentials',
    name: 'Admin Login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      const cleanEmail = credentials.email.trim().toLowerCase()

      const admin = await prisma.admin.findUnique({
        where: { email: cleanEmail },
      })
      if (!admin) return null

      const isValid = await bcrypt.compare(credentials.password, admin.passwordHash)
      if (!isValid) return null

      return {
        id: `admin_${admin.id}`,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        adminRole: admin.role,
      } as any
    },
  })
)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = user.role || 'customer'
        token.adminRole = user.adminRole
        token.sub = user.id
      }
      if (account?.provider === 'google') {
        token.role = 'customer'
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role || 'customer'
        session.user.adminRole = token.adminRole
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'hh-secret-fallback-key',
}
