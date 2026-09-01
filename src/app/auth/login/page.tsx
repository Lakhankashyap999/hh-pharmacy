'use client'

import { Suspense, useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Heart, Clock, Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, callbackUrl, router])

  // Handle email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const res = await signIn('customer-credentials', {
        redirect: false,
        email: loginEmail.trim(),
        password: loginPassword,
      })

      if (res?.error) {
        toast.error('Invalid email or password. New user? Click Sign Up!')
      } else {
        toast.success('Welcome back to H&H Pharmacy! 🛒')
        router.push(callbackUrl)
      }
    } catch {
      toast.error('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle 1-Click Demo Customer Login
  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      const res = await signIn('customer-credentials', {
        redirect: false,
        email: 'rahul.demo@gmail.com',
        password: 'demo123',
      })

      if (res?.error) {
        toast.error('Demo login failed')
      } else {
        toast.success('Logged in as Rahul Sharma (Demo Customer) 🎉')
        router.push(callbackUrl)
      }
    } catch {
      toast.error('Demo login error')
    } finally {
      setLoading(false)
    }
  }

  // Handle new customer registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          password: signupPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Account created! Logging you in...')
        // Auto-login newly registered user
        await signIn('customer-credentials', {
          redirect: false,
          email: signupEmail.trim(),
          password: signupPassword,
        })
        router.push(callbackUrl)
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch {
      toast.error('Something went wrong during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-xl text-center space-y-6">
      {/* Brand header */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
          <span className="text-white font-poppins font-bold text-lg">H&H</span>
        </div>
      </div>

      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900">
          {activeTab === 'signin' ? 'Customer Sign In' : 'Create Customer Account'}
        </h1>
        <p className="text-gray-500 text-xs mt-1 font-hindi">
          H&H Pharmacy • दवाई ऑर्डर एवं प्रिस्क्रिप्शन ट्रैकर
        </p>
      </div>

      {/* Tabs: Sign In vs Sign Up */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('signin')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'signin'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('signup')}
          className={`py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'signup'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          New Account (Sign Up)
        </button>
      </div>

      {/* 1-Click Fast Demo Login Pill */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-left flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-teal-950 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Instant Test Login
          </p>
          <p className="text-[10px] text-teal-800">Test order history &amp; cart without typing</p>
        </div>
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          1-Click Login
        </button>
      </div>

      {/* Sign In Tab Form */}
      {activeTab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-teal-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In to My Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Sign Up Tab Form */}
      {activeTab === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (WhatsApp)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Create Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-teal-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account & Sign In'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="flex-shrink mx-3 text-[10px] text-gray-400 uppercase font-semibold">Or</span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
        <Link href="/" className="hover:text-teal-600">
          ← Back to Store
        </Link>
        <Link href="/admin/login" className="text-gray-400 hover:text-gray-700">
          🔐 Admin Portal
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="h-64 w-96 bg-white rounded-3xl skeleton" />}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
