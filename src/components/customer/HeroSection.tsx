'use client'

import { useState } from 'react'
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
  MapPin,
} from 'lucide-react'
import { useLocationStore } from '@/store/locationStore'
import { GoogleMapLocationModal } from './GoogleMapLocationModal'

export default function HeroSection() {
  const { currentLocation } = useLocationStore()
  const [showMapModal, setShowMapModal] = useState(false)

  const quickSearchTags = [
    'Dolo 650',
    'Crocin 650',
    'Combiflam',
    'Becosules',
    'Volini Gel',
    'Digene',
    'Chyawanprash',
    'Limcee',
    'Band-Aid',
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-gray-50/40 py-5 sm:py-8 md:py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* Main Grid: Left hero & Right Prescription Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left Column (7 cols): Main Title, Hindi Tagline, Quick Tags, Action Buttons */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            {/* Top pill */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowMapModal(true)}
                className="inline-flex items-center gap-1.5 bg-teal-100/90 hover:bg-teal-200 border border-teal-300 text-teal-950 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer group"
                title="Change delivery location on Google Map"
              >
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse shrink-0" />
                <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-none">
                  Delivering to: <strong>{currentLocation.subLocality || currentLocation.address}</strong>
                </span>
                <span className="text-[10px] text-teal-800 underline font-extrabold shrink-0 ml-0.5 group-hover:text-teal-950">
                  Change 🗺️
                </span>
              </button>
              <Link
                href="/licenses"
                className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-2xs transition-colors"
                title="View Government Form 20 and 21 Licences"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>UP Govt FDA Licensed (Form 20 &amp; 21)</span>
              </Link>
            </div>

            {/* Main Headline */}
            <h1 className="font-poppins font-extrabold text-2xl sm:text-4xl lg:text-5xl text-gray-900 leading-[1.15] tracking-tight">
              Your Trusted Medical Pharmacy{' '}
              <span className="text-teal-600 block mt-1">Delivered in 60 Minutes</span>
            </h1>

            {/* Authentic Hindi Tagline from Shop Board */}
            <div className="bg-white/90 border border-teal-100 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-2xs block">
              <p className="font-hindi text-sm sm:text-base md:text-lg text-teal-800 font-bold leading-snug">
                हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ उचित रेट पर मिलती हैं
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">
                Owner: <strong>Nishant Choudhary</strong> (7827558443) &amp; <strong>Harsh Kashyap</strong> (8171093455)
              </p>
            </div>

            {/* Quick Search Chips */}
            <div className="pt-0.5">
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                ⚡ Popular Medicines:
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {quickSearchTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/medicines?search=${encodeURIComponent(tag)}`}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-gray-700 font-medium text-[11px] sm:text-xs rounded-lg sm:rounded-xl border border-gray-200 transition-all shadow-3xs"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
              <Link
                href="/medicines"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer text-center"
              >
                <span>Browse All Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="tel:7827558443"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-4 py-3 rounded-xl sm:rounded-2xl border border-gray-200 text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Pharmacist (7827558443)</span>
              </a>
            </div>
          </div>

          {/* Right Column (5 cols): Prescription Upload Feature Box & Discount Card */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            {/* Quick Prescription Card */}
            <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden space-y-3 sm:space-y-4">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-white/20 rounded-xl text-white shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <div>
                  <h3 className="font-poppins font-bold text-sm sm:text-base text-white">Upload Doctor Prescription</h3>
                  <p className="text-[10px] sm:text-[11px] text-teal-100">We verify &amp; pack your medicines instantly</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Pharmacist reviews your prescription</span>
                </div>
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Up to 15% discount applied automatically</span>
                </div>
                <div className="flex items-center gap-2 text-teal-50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Home delivered within 60 minutes</span>
                </div>
              </div>

              <Link
                href="/prescription"
                className="w-full bg-white text-teal-900 font-extrabold py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors shadow-md block text-center"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Prescription &amp; Order Now</span>
              </Link>
            </div>

            {/* Discount Promo Pill Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-gray-100 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                  🏷️
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900">Flat Discount Up to 15%</p>
                  <p className="text-[10px] text-gray-500">English &amp; Ayurvedic medicines</p>
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl shrink-0">
                SAVE MORE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1">
          {[
            { icon: ShieldCheck, title: '100% Genuine', sub: 'DL: RLF20UP2025007813' },
            { icon: Zap, title: '60 Mins Delivery', sub: 'Ghaziabad Zone' },
            { icon: Award, title: 'Mr. Ashwani Kumar', sub: 'B.Pharma #20257554956' },
            { icon: Clock, title: '8:00 AM – 9:00 PM', sub: 'Mon–Sat Fast Service' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-3xs flex items-center gap-2 sm:gap-3"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[11px] sm:text-xs text-gray-900 leading-tight truncate">{item.title}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GOOGLE MAPS LOCATION PICKER MODAL IN HERO */}
      <GoogleMapLocationModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
      />
    </section>
  )
}
