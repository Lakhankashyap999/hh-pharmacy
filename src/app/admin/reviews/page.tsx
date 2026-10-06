'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle, MessageSquare, Reply } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?status=all')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const moderateReview = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Review ${status}!`)
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        )
      }
    } catch {
      toast.error('Failed to update review status')
    }
  }

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      })
      if (res.ok) {
        toast.success('Reply posted on review! 💬')
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, adminReply: replyText.trim() } : r))
        )
        setReplyingReviewId(null)
        setReplyText('')
      }
    } catch {
      toast.error('Failed to post reply')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900">
          Public Reviews &amp; Ratings Moderation
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Approve genuine customer feedback, block spam/abusive comments, and reply as H&H Pharmacy owner
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 skeleton rounded-xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No reviews submitted yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 hover:bg-gray-50/50 transition-colors space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                      {rev.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{rev.user?.name || 'Customer'}</p>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.status.toUpperCase()}
                  </span>
                </div>

                {rev.title && <p className="font-bold text-xs text-gray-900">{rev.title}</p>}
                {rev.comment && <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>}

                {rev.adminReply && (
                  <div className="p-2.5 bg-teal-50 border-l-2 border-teal-600 rounded-r-xl text-xs text-teal-900">
                    <strong>H&H Pharmacy Reply:</strong> {rev.adminReply}
                  </div>
                )}

                {/* Moderation Controls */}
                <div className="flex items-center gap-2 pt-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => moderateReview(rev.id, 'approved')}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold hover:bg-emerald-100"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve &amp; Publish
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => moderateReview(rev.id, 'rejected')}
                      className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-xl text-xs font-semibold hover:bg-red-100"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}

                  <button
                    onClick={() => setReplyingReviewId(rev.id === replyingReviewId ? null : rev.id)}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-xl text-xs font-semibold hover:bg-gray-200"
                  >
                    <Reply className="w-3.5 h-3.5" /> Reply to Review
                  </button>
                </div>

                {/* Reply Form */}
                {replyingReviewId === rev.id && (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your public pharmacy response..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700"
                    >
                      Post Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
