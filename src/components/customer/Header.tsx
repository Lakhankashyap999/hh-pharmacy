'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  MessageCircle,
  FileText,
  Lock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export default function Header() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
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
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when mobile side navbar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

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
      const target = e.target as Node
      if (
        (searchRef.current && !searchRef.current.contains(target)) &&
        (mobileSearchRef.current && !mobileSearchRef.current.contains(target))
      ) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change / ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        setShowSearchDropdown(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchDropdown(false)
      setIsMenuOpen(false)
      window.location.href = `/medicines?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs w-full">
        {/* Top Banner Ticker */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 text-white text-[11px] py-1.5 px-3 sm:px-4 font-medium w-full overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 truncate">
              <span className="flex items-center gap-1 shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
                <strong className="font-semibold">60-Min Fast Delivery</strong>
                <span className="hidden xs:inline">in Ghaziabad</span>
              </span>
              <span className="hidden md:flex items-center gap-1 text-teal-100 truncate">
                <Phone className="w-3 h-3 shrink-0" />
                Call Pharmacy: <strong>7827558443</strong> / 8171093455
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                href="/licenses"
                className="hidden lg:flex items-center gap-1.5 text-[10px] bg-teal-800/80 hover:bg-teal-900 text-teal-100 hover:text-white px-2.5 py-0.5 rounded-full border border-teal-500/40 transition-colors"
                title="Form 20 & 21 Licences issued by UP FDA Meerut Div"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-300 shrink-0" />
                <span>UP Govt. DL: RLF20UP2025007813</span>
              </Link>

              <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                🏷️ UP TO 15% OFF
              </span>

              <Link
                href="/admin/login"
                className="hidden md:inline text-[10px] text-teal-200 hover:text-white hover:underline"
              >
                🔐 Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* DESKTOP HEADER (md & up) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 justify-between py-2.5">
            {/* Logo & Shop Details */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors shrink-0">
                <span className="text-white font-poppins font-extrabold text-sm tracking-tight">H&amp;H</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-poppins font-extrabold text-gray-900 text-base leading-tight tracking-tight">
                    H&amp;H Pharmacy
                  </p>
                  <Link
                    href="/licenses"
                    title="View UP Govt Drug Licences (Form 20 & 21)"
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide transition-colors"
                  >
                    Govt. Licensed
                  </Link>
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

            {/* Desktop Search Bar with Dropdown */}
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

              {/* Desktop Autocomplete Dropdown */}
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

            {/* Desktop Right Actions (Cart & User) */}
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
                    <span className="text-xs font-bold text-gray-800 max-w-24 truncate">
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
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-2xl border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Cart Button */}
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
                <div className="text-left leading-none">
                  <p className="text-[9px] font-medium opacity-90">{cartCount === 0 ? 'My Cart' : `${cartCount} items`}</p>
                  <p className="text-xs font-bold mt-0.5">{cartTotal > 0 ? `₹${cartTotal.toFixed(0)}` : 'Cart'}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* MOBILE HEADER (< md) */}
          <div className="md:hidden py-2 space-y-2">
            {/* Row 1: Brand Logo + Quick Call + Cart + Hamburger Toggle */}
            <div className="flex items-center justify-between gap-2">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center shadow-xs shrink-0">
                  <span className="text-white font-poppins font-extrabold text-xs">H&amp;H</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-poppins font-extrabold text-gray-900 text-sm leading-none">
                      H&amp;H Pharmacy
                    </p>
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1 py-0.2 rounded uppercase">
                      Govt. Lic
                    </span>
                  </div>
                  <p className="text-teal-600 text-[10px] font-hindi font-medium leading-none mt-0.5">
                    दवाईयाँ • Ghookna Mode
                  </p>
                </div>
              </Link>

              {/* Right Quick Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Quick Call */}
                <a
                  href="tel:7827558443"
                  className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center transition-colors"
                  title="Call Pharmacy"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                {/* Cart Button */}
                <Link
                  href="/cart"
                  className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95"
                >
                  <div className="relative">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-amber-400 text-gray-900 text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-2xs">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold">
                    {cartTotal > 0 ? `₹${cartTotal.toFixed(0)}` : 'Cart'}
                  </span>
                </Link>

                {/* Hamburger Button (Opens Slide-in Side Navbar) */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Open side navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Full Width Mobile Search Bar */}
            <div ref={mobileSearchRef} className="relative w-full">
              <form onSubmit={handleSearch}>
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true)
                    }}
                    placeholder="Search 'Crocin', 'Dolo', 'Paracetamol'..."
                    className="w-full pl-8.5 pr-16 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-100"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-teal-700"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Mobile Autocomplete Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100 max-h-72 overflow-y-auto"
                  >
                    <div className="p-2 bg-gray-50 text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                      Matching Medicines
                    </div>
                    {searchResults.map((med) => (
                      <Link
                        key={med.id}
                        href={`/medicines/${med.id}`}
                        onClick={() => {
                          setShowSearchDropdown(false)
                          setIsMenuOpen(false)
                        }}
                        className="p-2.5 flex items-center justify-between hover:bg-teal-50/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">💊</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-tight">{med.name}</p>
                            <p className="text-[10px] text-gray-400 leading-none mt-0.5">{med.genericName || med.brand}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-teal-700">₹{med.sellingPrice}</p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/medicines?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setShowSearchDropdown(false)
                        setIsMenuOpen(false)
                      }}
                      className="p-2 text-center text-[11px] font-bold text-teal-600 hover:bg-teal-50 block"
                    >
                      View all results for "{searchQuery}" →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Category Navigation Pills */}
          <nav className="hidden md:flex items-center gap-2 mt-1.5 pt-2 border-t border-gray-100 overflow-x-auto pb-1.5 scrollbar-none text-xs">
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
      </header>

      {/* PORTAL-RENDERED SLIDE-IN SIDE NAVBAR (Never clipped by header, full viewport height) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isMenuOpen && (
              <div className="fixed inset-0 z-[9999] md:hidden">
                {/* Dark Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Left Slide-in Drawer Container */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="fixed top-0 left-0 bottom-0 w-[295px] max-w-[85vw] h-[100dvh] bg-white shadow-2xl z-10 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Header of Sidebar */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-poppins font-extrabold text-sm shadow-xs shrink-0">
                        H&amp;H
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-poppins font-extrabold text-sm text-gray-900 leading-none">
                            H&amp;H Pharmacy
                          </h3>
                        </div>
                        <p className="text-[10px] text-teal-700 font-hindi font-medium mt-0.5">
                          दवाईयाँ • Ghookna Mode
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 cursor-pointer shadow-3xs"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrollable Middle Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Location Box */}
                    <div
                      onClick={() => {
                        setShowLocationModal(true)
                        setIsMenuOpen(false)
                      }}
                      className="bg-teal-50/80 border border-teal-200/70 rounded-xl p-2.5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-bold text-teal-700 leading-none">Deliver To</p>
                          <p className="text-xs font-bold text-gray-800 leading-tight mt-0.5 truncate">
                            {deliveryLocation}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-teal-700 font-bold underline shrink-0 ml-1">Change</span>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 px-1 tracking-wider">
                        Direct Pharmacist Contact
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="tel:7827558443"
                          className="flex items-center justify-center gap-1.5 bg-teal-600 text-white py-2 px-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-teal-700"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>Call Nishant</span>
                        </a>
                        <a
                          href="https://wa.me/917827558443?text=Hello%20H%26H%20Pharmacy%20I%20want%20to%20order%20medicine"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 px-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-emerald-700"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <a
                        href="tel:8171093455"
                        className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-2.5 rounded-xl text-[11px] font-semibold hover:bg-gray-100 block text-center"
                      >
                        <Phone className="w-3 h-3 inline mr-1 text-teal-600" />
                        Call Harsh: <strong>8171093455</strong>
                      </a>
                    </div>

                    {/* Navigation Menu */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 px-1 tracking-wider">
                        Main Menu
                      </p>
                      <Link
                        href="/medicines"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">💊</span>
                          <span>All Medicines</span>
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                      <Link
                        href="/medicines?schedule=OTC"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-bold text-emerald-800 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">✅</span>
                          <span>OTC (No Prescription)</span>
                        </span>
                        <span className="text-emerald-500 font-extrabold">Instant</span>
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Upload Doctor Prescription</span>
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                      <Link
                        href="/licenses"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>UP Govt Licences (Form 20/21)</span>
                        </span>
                        <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>My Orders &amp; Track</span>
                        </span>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </div>

                    {/* Popular Categories */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-gray-400 px-1 tracking-wider">
                        Categories
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {[
                          { href: '/medicines?category=1', label: 'Pain & Fever', icon: '🔥' },
                          { href: '/medicines?category=2', label: 'Cold & Cough', icon: '🤧' },
                          { href: '/medicines?category=4', label: 'Vitamins', icon: '⚡' },
                          { href: '/medicines?category=8', label: 'Ayurvedic', icon: '🌿' },
                          { href: '/medicines?category=5', label: 'Digestive', icon: '🥣' },
                          { href: '/medicines?category=6', label: 'Skin Care', icon: '✨' },
                        ].map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-800 font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <span>{c.icon}</span>
                            <span className="truncate">{c.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Pharmacist Trust Card */}
                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 text-[10px] text-gray-500 space-y-0.5">
                      <p className="font-bold text-gray-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Reg Pharmacist: Mr. Ashwani Kumar
                      </p>
                      <p>B.Pharma • Reg ID: 20257554956</p>
                      <p className="text-gray-400">Shop No-01, Gali-3, Ghokna Mode, Ghaziabad</p>
                    </div>
                  </div>

                  {/* Bottom Footer Area */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-2.5 shrink-0">
                    {session ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {session.user?.name?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-tight truncate">
                                {session.user?.name}
                              </p>
                              <p className="text-[10px] text-gray-500 leading-tight truncate">
                                {session.user?.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              signOut()
                              setIsMenuOpen(false)
                            }}
                            className="text-xs font-bold text-red-600 hover:underline shrink-0 ml-1 cursor-pointer"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-700"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Sign In / Create Account</span>
                      </Link>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
                      <Link
                        href="/admin/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-teal-700 font-medium"
                      >
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Admin Portal</span>
                      </Link>
                      <span className="text-[10px] text-gray-400">UP FSDA DL 2025</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* PORTAL-RENDERED LOCATION MODAL */}
      {mounted &&
        showLocationModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
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
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
