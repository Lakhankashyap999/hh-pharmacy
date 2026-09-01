'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@hhpharmacy.in')
  const [password, setPassword] = useState('HHPharmacy@2024')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('admin-credentials', {
        redirect: false,
        email: email.trim(),
        password,
      })

      if (res?.error) {
        toast.error('Invalid admin credentials!')
      } else {
        toast.success('Welcome back, Admin!')
        router.push('/admin/dashboard')
      }
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <span className="text-white font-poppins font-bold text-lg">H&H</span>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900">Admin Control Portal</h1>
          <p className="text-xs text-gray-500 font-hindi">
            H&H Pharmacy • मैनेजमेंट एवं इन्वेंटरी सिस्टम
          </p>
        </div>

        {/* Demo Creds Alert Box */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>🔑 Default Admin Credentials:</span>
          </p>
          <p>
            Email: <span className="font-mono font-semibold">admin@hhpharmacy.in</span>
          </p>
          <p>
            Password: <span className="font-mono font-semibold">HHPharmacy@2024</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-teal-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-98"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-gray-500 hover:text-teal-600">
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </div>
  )
}
