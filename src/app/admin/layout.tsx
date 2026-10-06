'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Pill,
  Package,
  Calendar,
  MapPin,
  Receipt,
  ShoppingCart,
  Star,
  FileSpreadsheet,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/medicines', label: 'Medicines Inventory', icon: Pill },
  { href: '/admin/stock', label: 'Stock & Batches', icon: Package },
  { href: '/admin/expiry', label: 'Expiry Alerts', icon: Calendar },
  { href: '/admin/locations', label: 'Location Finder', icon: MapPin },
  { href: '/admin/receipts', label: 'Scan Billing Receipt', icon: Receipt },
  { href: '/admin/orders', label: 'Customer Orders', icon: ShoppingCart },
  { href: '/admin/reviews', label: 'Review Moderation', icon: Star },
  { href: '/admin/drug-register', label: 'Drug Register (H1/X)', icon: FileSpreadsheet },
  { href: '/admin/analytics', label: 'Sales & Analytics', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Don't wrap login page with sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 hidden md:flex sticky top-0 h-screen">
        <div className="p-4 space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-poppins font-bold text-sm">
              H&H
            </div>
            <div>
              <p className="font-poppins font-bold text-sm text-gray-900 leading-tight">H&H Admin</p>
              <p className="text-[10px] text-teal-600 font-semibold font-hindi">मैनेजमेंट पैनल</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile & footer actions */}
        <div className="p-4 border-t border-gray-100 space-y-1.5">
          <Link
            href="/licenses"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Drug Licences (Form 20 &amp; 21)</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 hover:text-teal-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-teal-800 text-xs font-bold shrink-0">
                N
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">Nishant / Honey</p>
                <p className="text-[10px] text-gray-400">Owner (Admin)</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                H&H
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">H&H Pharmacy Ghookna Mode</p>
              <p className="text-[10px] text-gray-500">Contact: 7827558443 / 8171093455</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-green" />
              Live Inventory Synchronized
            </span>

            <Link
              href="/"
              className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
            >
              <span>Customer View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
