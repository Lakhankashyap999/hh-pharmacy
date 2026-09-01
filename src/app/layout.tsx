import type { Metadata } from 'next'
import { Poppins, Inter, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'H&H Pharmacy - हमारे यहाँ सभी दवाईयाँ मिलती हैं',
  description:
    'H&H Pharmacy, Ghookna Mode, Ghaziabad. All types of English & Ayurvedic medicines at best prices. Discount up to 15%. Fast delivery available.',
  keywords: ['pharmacy', 'medicine', 'Ghaziabad', 'H&H Pharmacy', 'davai', 'online pharmacy'],
  openGraph: {
    title: 'H&H Pharmacy',
    description: 'Your trusted medical pharmacy in Ghaziabad',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${notoDevanagari.variable}`}>
      <body className="font-inter bg-white text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
