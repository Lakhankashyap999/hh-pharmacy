'use client'

import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface Review {
  id: number
  rating: number
  title?: string | null
  comment?: string | null
  createdAt: Date
  user: { name?: string | null; image?: string | null }
}

export default function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-poppins font-bold text-xl text-gray-900 mb-2">Customer Reviews</h2>
          <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 px-4 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-poppins font-bold text-xl text-gray-900">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-sm text-gray-600 font-medium">4.8/5 from {reviews.length}+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                {review.user.image ? (
                  <img src={review.user.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                    {review.user.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{review.user.name || 'Customer'}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3 h-3 ${s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              {review.title && <p className="font-semibold text-gray-800 text-sm mb-1">{review.title}</p>}
              {review.comment && <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{review.comment}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
