'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Zap } from 'lucide-react'

interface AdminFastRefreshBarProps {
  lastUpdated: number
  isRefreshing: boolean
  onRefresh: () => void
}

export function AdminFastRefreshBar({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: AdminFastRefreshBarProps) {
  const [timeAgo, setTimeAgo] = useState('just now')

  useEffect(() => {
    const updateTime = () => {
      if (!lastUpdated) {
        setTimeAgo('fetching...')
        return
      }
      const seconds = Math.floor((Date.now() - lastUpdated) / 1000)
      if (seconds < 5) setTimeAgo('just now')
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`)
      else setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
    }

    updateTime()
    const timer = setInterval(updateTime, 3000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  return (
    <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-gray-200/80 px-2.5 py-1.5 rounded-xl shadow-3xs text-[11px] text-gray-600">
      <div className="flex items-center gap-1 text-teal-700 font-semibold">
        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
        <span className="hidden sm:inline">Instant Data:</span>
        <span className="text-gray-500 font-medium">{isRefreshing ? 'updating...' : timeAgo}</span>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Force refresh latest data"
        className="p-1 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
      </button>
    </div>
  )
}
