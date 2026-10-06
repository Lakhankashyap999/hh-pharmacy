'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Clock,
  Tag,
  Upload,
  Phone,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  FileText,
} from 'lucide-react'

export default function HeroSection() {
  const quickSearchTags = [
    'Dolo 650',
    'Crocin 650',
    'Combiflam',
    'Becosules',
    'Volini Gel',
    'Digene',
    'Chyawanprash',
    'Limcee (Vitamin C)',
    'Band-Aid',
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-gray-50/40 py-8 md:py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Main Grid: Left hero & Right Prescription Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column (7 cols): Main Title, Hindi Tagline, Quick Tags, Action Buttons */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top pill */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-teal-100/80 border border-teal-200 text-teal-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                <span>Ghookna Mode, Ghaziabad • Plot No-7, Kh No-606</span>
              </div>
              <Link
                href="/licenses"
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs transition-colors"
                title="View Government Form 20 and 21 Licences"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>UP Govt FDA Licensed (Form 20 &amp; 21)</span>
              </Link>
            </div>

            {/* Main Headline */}
            <h1 className="font-poppins font-extrabold text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-[1.15] tracking-tight">
              Your Trusted Medical Pharmacy{' '}
              <span className="text-teal-600 block mt-1">Delivered in 60 Minutes</span>
            </h1>

            {/* Authentic Hindi Tagline from Shop Board */}
            <div className="bg-white/90 border border-teal-100 p-3.5 rounded-2xl shadow-2xs inline-block">
              <p className="font-hindi text-base md:text-lg text-teal-800 font-bold leading-snug">
                हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ उचित रेट पर मिलती हैं
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Owner: <strong>Nishant Choudhary</strong> (7827558443) &amp; <strong>Harsh Kashyap</strong> (8171093455)
              </p>
            </div>

            {/* Quick Search Chips */}
            <div className="pt-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                ⚡ Popular Quick Search:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickSearchTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/medicines?search=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-gray-700 font-medium text-xs rounded-xl border border-gray-200 transition-all shadow-3xs"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/medicines"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <span>Browse All Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="tel:7827558443"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-5 py-3.5 rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Pharmacist (7827558443)</span>
              </a>
            </div>
          </div>

          {/* Right Column (5 cols): Prescription Upload Feature Box & Discount Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Prescription Card */}
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2">
                <span className="p-2 bg-white/20 rounded-xl text-white">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-poppins font-bold text-base text-white">Upload Doctor Prescription</h3>
                  <p className="text-[11px] text-teal-100">We verify &amp; pack your medicines instantly</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Pharmacist reviews your prescription</span>
                </div>
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Up to 15% discount applied automatically</span>
                </div>
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Home delivered within 60 minutes</span>
                </div>
              </div>

              <Link
                href="/cart"
                className="w-full bg-white text-teal-900 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors shadow-md block text-center"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Prescription &amp; Order Now</span>
              </Link>
            </div>

            {/* Discount Promo Pill Card */}
            <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-base">
                  🏷️
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900">Flat Discount Up to 15%</p>
                  <p className="text-[10px] text-gray-500">Applicable on English &amp; Ayurvedic medicines</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl">
                SAVE MORE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { icon: ShieldCheck, title: '100% Genuine Medicines', sub: 'DL: RLF20UP2025007813' },
            { icon: Zap, title: '60 Mins Fast Home Delivery', sub: 'Ghookna Mode & Ghaziabad' },
            { icon: Award, title: 'Mr. Ashwani Kumar (B.Pharma)', sub: 'Reg Pharmacist #20257554956' },
            { icon: Clock, title: 'Open 8:00 AM – 9:00 PM', sub: 'Mon–Sat fast support' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-gray-900 leading-tight">{item.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
