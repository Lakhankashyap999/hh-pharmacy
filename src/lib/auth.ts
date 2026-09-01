import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
    CredentialsProvider({
      id: 'customer-credentials',
      name: 'Customer Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const cleanEmail = credentials.email.trim().toLowerCase()

        // Check if demo login
        if (cleanEmail === 'rahul.demo@gmail.com' && credentials.password === 'demo123') {
          let demoUser = await prisma.user.findUnique({ where: { email: cleanEmail } })
          if (!demoUser) {
            demoUser = await prisma.user.create({
              data: {
                name: 'Rahul Sharma (Demo Customer)',
                email: cleanEmail,
                phone: '9876543210',
              },
            })
          }
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            role: 'customer',
          } as any
        }

        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        })

        if (!user) return null

        if (user.passwordHash && credentials.password) {
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) return null
        }

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
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
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
    }),
  ],
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
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'hh-secret-fallback-key',
}
