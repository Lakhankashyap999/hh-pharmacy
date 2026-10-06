'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Category {
  id: number
  name: string
  nameHindi?: string | null
  icon?: string | null
  color?: string | null
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-6 sm:py-10 px-3 sm:px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="font-poppins font-bold text-lg sm:text-xl text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">श्रेणी के अनुसार खोजें</p>
          </div>
          <Link href="/medicines" className="text-teal-600 text-xs sm:text-sm font-semibold hover:text-teal-700 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/medicines?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-xs transition-all group text-center h-full justify-between"
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-transform group-hover:scale-110 shrink-0"
                  style={{ background: `${cat.color}15` }}
                >
                  {cat.icon || '💊'}
                </div>
                <div>
                  <p className="font-poppins font-semibold text-gray-800 text-[11px] sm:text-xs leading-tight line-clamp-1">{cat.name}</p>
                  {cat.nameHindi && (
                    <p className="font-hindi text-gray-400 text-[10px] sm:text-xs mt-0.5 leading-tight line-clamp-1">{cat.nameHindi}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
