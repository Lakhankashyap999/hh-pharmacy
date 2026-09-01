'use client'

import { Suspense, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Heart, Clock } from 'lucide-react'

function LoginContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, callbackUrl, router])

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-md text-center space-y-6">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
          <span className="text-white font-poppins font-bold text-lg">H&H</span>
        </div>
      </div>

      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900">Welcome to H&H Pharmacy</h1>
        <p className="text-gray-500 text-xs mt-1 font-hindi">
          हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ उचित रेट पर मिलती हैं
        </p>
      </div>

      {/* Value props */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 text-left space-y-2.5 text-xs text-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Track past orders &amp; reorder medicines in 1-click</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Upload &amp; save medical prescriptions securely</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Rate medicines and read verified buyer reviews</span>
        </div>
      </div>

      {/* Google OAuth Login Button */}
      <div className="pt-2">
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
      </div>

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
