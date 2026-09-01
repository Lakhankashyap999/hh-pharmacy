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
    <section className="py-10 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-poppins font-bold text-xl text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 text-sm mt-0.5">श्रेणी के अनुसार खोजें</p>
          </div>
          <Link href="/medicines" className="text-teal-600 text-sm font-medium hover:text-teal-700 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={`/medicines?category=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group text-center"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                  style={{ background: `${cat.color}15` }}
                >
                  {cat.icon || '💊'}
                </div>
                <div>
                  <p className="font-poppins font-medium text-gray-800 text-xs leading-tight">{cat.name}</p>
                  {cat.nameHindi && (
                    <p className="font-hindi text-gray-400 text-xs mt-0.5 leading-tight">{cat.nameHindi}</p>
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
