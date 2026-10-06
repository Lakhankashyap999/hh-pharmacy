'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Phone,
  MapPin,
  User,
  LogOut,
  Package,
  Heart,
  Clock,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState('Ghookna Mode, Ghaziabad')
  const [showLocationModal, setShowLocationModal] = useState(false)

  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0))
  const cartTotal = useCartStore((s) => s.total())
  const searchRef = useRef<HTMLDivElement>(null)

  // Live quick search dropdown
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/medicines?q=${encodeURIComponent(searchQuery.trim())}&limit=5`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.medicines || [])
          setShowSearchDropdown(true)
        }
      } catch {
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Click outside search to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchDropdown(false)
      window.location.href = `/medicines?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 text-white text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              <strong className="font-semibold">60-Min Fast Home Delivery</strong> in Ghaziabad
            </span>
            <span className="hidden sm:flex items-center gap-1 text-teal-100">
              <Phone className="w-3 h-3" />
              Call Pharmacy: <strong>7827558443</strong> / 8171093455
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              🏷️ UP TO 15% OFF
            </span>
            <Link href="/admin/login" className="hidden md:inline text-[10px] text-teal-200 hover:text-white hover:underline">
              🔐 Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3 md:gap-6 justify-between">
          {/* Logo & Shop Details */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
              <span className="text-white font-poppins font-extrabold text-sm tracking-tight">H&amp;H</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-poppins font-extrabold text-gray-900 text-base leading-tight tracking-tight">
                  H&amp;H Pharmacy
                </p>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                  Licensed
                </span>
              </div>
              <p className="text-teal-600 text-[11px] font-hindi font-medium leading-none mt-0.5">
                दवाईयाँ • Ghookna Mode
              </p>
            </div>
          </Link>

          {/* Quick Location Pill */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="hidden lg:flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 px-3 py-1.5 rounded-xl text-left transition-colors shrink-0 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Deliver to</p>
              <p className="text-xs font-semibold text-gray-800 max-w-36 truncate leading-tight mt-0.5">
                {deliveryLocation}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
          </button>

          {/* Live Search Bar with Dropdown */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true)
                  }}
                  placeholder="Search 'Crocin', 'Dolo', 'Paracetamol', 'Vitamins'..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/70 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-3 py-1.5 rounded-xl hover:bg-teal-700 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100"
                >
                  <div className="p-2 bg-gray-50/80 text-[10px] font-bold text-gray-500 uppercase tracking-wide px-3">
                    Matching Medicines
                  </div>
                  {searchResults.map((med) => (
                    <Link
                      key={med.id}
                      href={`/medicines/${med.id}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="p-3 flex items-center justify-between hover:bg-teal-50/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-sm shrink-0">
                          💊
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 group-hover:text-teal-700">
                            {med.name}
                          </p>
                          <p className="text-[10px] text-gray-400">{med.genericName || med.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-teal-700">₹{med.sellingPrice}</p>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-sm">
                          In Stock
                        </span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/medicines?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="p-2.5 text-center text-xs font-bold text-teal-600 hover:bg-teal-50 block"
                  >
                    View all results for "{searchQuery}" →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Actions (Cart & User) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Profile / Login */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-gray-50 border border-gray-200/80 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {session.user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden md:block text-xs font-bold text-gray-800 max-w-24 truncate">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-1.5 space-y-0.5"
                    >
                      <div className="p-3 bg-gray-50 rounded-xl mb-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{session.user?.email}</p>
                      </div>

                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl font-medium"
                      >
                        <Package className="w-4 h-4 text-teal-600" /> My Orders &amp; Reorder
                      </Link>

                      <Link
                        href="/cart"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-800 rounded-xl font-medium"
                      >
                        <ShoppingCart className="w-4 h-4 text-teal-600" /> My Cart ({cartCount})
                      </Link>

                      <hr className="my-1 border-gray-100" />

                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl font-medium w-full text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-2xl border border-teal-200 transition-colors shadow-2xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button (Blinkit green pill) */}
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <p className="text-[9px] font-medium opacity-90">{cartCount === 0 ? 'My Cart' : `${cartCount} items`}</p>
                <p className="text-xs font-bold mt-0.5">{cartTotal > 0 ? `₹${cartTotal.toFixed(0)}` : 'Cart'}</p>
              </div>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <nav className="hidden md:flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { href: '/medicines', label: 'All Medicines 💊' },
            { href: '/medicines?category=1', label: 'Pain & Fever' },
            { href: '/medicines?category=2', label: 'Cold & Cough' },
            { href: '/medicines?category=4', label: 'Vitamins & Immunity' },
            { href: '/medicines?category=8', label: 'Ayurvedic & Herbal' },
            { href: '/medicines?category=5', label: 'Digestive & Acidity' },
            { href: '/medicines?category=6', label: 'Skin Care' },
            { href: '/medicines?schedule=OTC', label: '✅ No Prescription Required' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1 rounded-xl bg-gray-50 hover:bg-teal-50 hover:text-teal-700 text-gray-700 font-semibold whitespace-nowrap transition-colors border border-transparent hover:border-teal-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> Set Delivery Location
            </h3>
            <p className="text-xs text-gray-500">
              We deliver in 60 minutes across Ghaziabad &amp; nearby areas.
            </p>

            <div className="space-y-2">
              {['Ghookna Mode, Ghaziabad', 'Gali No-3, Ghaziabad', 'Sanjay Nagar, Ghaziabad', 'Raj Nagar, Ghaziabad'].map(
                (loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setDeliveryLocation(loc)
                      setShowLocationModal(false)
                      toast.success(`Location updated to ${loc}!`)
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all ${
                      deliveryLocation === loc
                        ? 'border-teal-500 bg-teal-50 text-teal-900'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    📍 {loc}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setShowLocationModal(false)}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
