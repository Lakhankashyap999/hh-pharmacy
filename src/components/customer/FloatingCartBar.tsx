'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowRight, MessageCircle, Phone } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function FloatingCartBar() {
  const pathname = usePathname()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  // Don't show floating cart on /cart page or admin pages
  const hideCartBar = pathname === '/cart' || pathname.startsWith('/admin')

  return (
    <>
      {/* Floating Bottom Cart Pill (Blinkit / Zepto Style) */}
      <AnimatePresence>
        {!hideCartBar && itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-5 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40"
          >
            <Link
              href="/cart"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-emerald-500/50 backdrop-blur-md cursor-pointer transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-poppins font-extrabold text-sm leading-tight">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'} in Cart
                  </p>
                  <p className="text-xs text-emerald-100 font-semibold mt-0.5">
                    Total: <strong className="text-white font-bold">₹{total.toFixed(0)}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white text-emerald-800 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs">
                <span>View Cart</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Quick Support Button */}
      {!pathname.startsWith('/admin') && (
        <a
          href="https://wa.me/917827558443?text=Hello%20H%26H%20Pharmacy,%20I%20need%20medicine%20assistance"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat with Pharmacist Nishant"
          className="fixed bottom-5 left-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="hidden sm:inline">WhatsApp Pharmacist</span>
        </a>
      )}
    </>
  )
}
