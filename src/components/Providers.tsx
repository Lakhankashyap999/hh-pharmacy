'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import FloatingCartBar from '@/components/customer/FloatingCartBar'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <FloatingCartBar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#0d9488', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
          },
        }}
      />
    </SessionProvider>
  )
}
