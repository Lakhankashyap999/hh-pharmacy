'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ShoppingCart, Search, Menu, X, Phone, MapPin, User, LogOut, Package, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/medicines?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top bar */}
      <div className="bg-teal-600 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              7827558443 / 8171093455
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Ghookna Mode, Ghaziabad
            </span>
          </div>
          <span className="font-semibold">🏷️ Discount Up to 15% on All Medicines</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-poppins font-bold text-sm leading-none">H&H</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-poppins font-bold text-gray-900 text-base leading-tight">H&H Pharmacy</p>
              <p className="text-teal-600 text-xs font-hindi">दवाईयाँ</p>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, brands, categories..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 text-white p-1.5 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-teal-700" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-20 truncate">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <nav className="p-2 space-y-0.5">
                        <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                          <Package className="w-4 h-4" />My Orders
                        </Link>
                        <Link href="/account/wishlist" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                          <Heart className="w-4 h-4" />Wishlist
                        </Link>
                        <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="w-4 h-4" />My Account
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
                        >
                          <LogOut className="w-4 h-4" />Sign Out
                        </button>
                      </nav>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-50 rounded-xl"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
          {[
            { href: '/medicines', label: 'All Medicines' },
            { href: '/medicines?category=1', label: 'Pain Relief' },
            { href: '/medicines?category=2', label: 'Fever & Cold' },
            { href: '/medicines?category=4', label: 'Vitamins' },
            { href: '/medicines?category=8', label: 'Ayurvedic' },
            { href: '/medicines?category=5', label: 'Digestive' },
            { href: '/medicines?schedule=OTC', label: '✅ No Prescription' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden overflow-hidden border-t border-gray-100"
          >
            <nav className="p-4 grid grid-cols-2 gap-2">
              {[
                { href: '/medicines', label: 'All Medicines' },
                { href: '/medicines?category=1', label: 'Pain Relief' },
                { href: '/medicines?category=2', label: 'Fever & Cold' },
                { href: '/medicines?category=4', label: 'Vitamins' },
                { href: '/medicines?category=8', label: 'Ayurvedic' },
                { href: '/medicines?schedule=OTC', label: 'No Prescription' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg text-center transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
