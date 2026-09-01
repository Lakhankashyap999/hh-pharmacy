'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Truck, Shield, Clock, Tag } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12 md:py-16">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left content */}
          <div className="flex-1 text-center md:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            >
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full pulse-green" />
              Licensed Pharmacy • Ghookna Mode, Ghaziabad
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight mb-3"
            >
              <span className="text-teal-600">H&H</span> Pharmacy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-hindi text-lg md:text-xl text-gray-600 mb-2"
            >
              हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-hindi text-lg md:text-xl text-gray-600 mb-6"
            >
              उचित रेट पर मिलती हैं
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <Link
                href="/medicines"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md group"
              >
                Browse Medicines
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:7827558443"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors"
              >
                📞 Call Now
              </a>
            </motion.div>
          </div>

          {/* Right — Info cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 grid grid-cols-2 gap-3 max-w-sm md:max-w-md"
          >
            {[
              { icon: Tag, label: 'Discount', sub: 'Up to 15% off', color: 'teal' },
              { icon: Shield, label: 'Genuine', sub: '100% authentic medicines', color: 'blue' },
              { icon: Truck, label: 'Delivery', sub: 'Home delivery available', color: 'purple' },
              { icon: Clock, label: 'Open', sub: 'Mon–Sat 8AM–9PM', color: 'orange' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${item.color}-50`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
