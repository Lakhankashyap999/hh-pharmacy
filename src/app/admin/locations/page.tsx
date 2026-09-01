'use client'

import { useState } from 'react'
import { Search, MapPin, Edit3, Save, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface LocationResult {
  id: number
  shelfLabel?: string | null
  rackNumber?: string | null
  section?: string | null
  coverLabel?: string | null
  description?: string | null
  medicine: {
    id: number
    name: string
    brand?: string | null
    genericName?: string | null
  }
}

export default function AdminLocationFinderPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<LocationResult | null>(null)

  // Edit form state
  const [shelfLabel, setShelfLabel] = useState('')
  const [rackNumber, setRackNumber] = useState('')
  const [section, setSection] = useState('')
  const [coverLabel, setCoverLabel] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/locations?q=${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data)
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (loc: LocationResult) => {
    setEditingItem(loc)
    setShelfLabel(loc.shelfLabel || '')
    setRackNumber(loc.rackNumber || '')
    setSection(loc.section || 'Middle')
    setCoverLabel(loc.coverLabel || '')
  }

  const saveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      const res = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: editingItem.medicine.id,
          shelfLabel,
          rackNumber,
          section,
          coverLabel,
        }),
      })

      if (res.ok) {
        toast.success(`Location updated for ${editingItem.medicine.name}! 📍`)
        setResults((prev) =>
          prev.map((r) =>
            r.medicine.id === editingItem.medicine.id
              ? { ...r, shelfLabel, rackNumber, section, coverLabel }
              : r
          )
        )
        setEditingItem(null)
      }
    } catch {
      toast.error('Failed to update location')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900">
          Shop Medicine Location Finder 📍
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Type any medicine name to instantly locate its Shelf, Rack, Section &amp; Cover Label in your Ghookna Mode store
        </p>
      </div>

      {/* Instant Search Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type medicine name (e.g. Crocin, Dolo, Amoxicillin, Volini)..."
            className="w-full pl-12 pr-28 py-3.5 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
          >
            {loading ? 'Finding...' : 'Find Location'}
          </button>
        </div>
      </form>

      {/* Quick Visual Layout Map of the store */}
      <div className="bg-teal-50/70 border border-teal-100 rounded-3xl p-6 space-y-3">
        <p className="font-poppins font-bold text-sm text-teal-900">
          🏬 H&H Pharmacy Shop Physical Zones Guide:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-teal-100">
            <p className="font-bold text-gray-900">Shelf A</p>
            <p className="text-[10px] text-gray-500">Pain, Fever, Cold &amp; Cough</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-teal-100">
            <p className="font-bold text-gray-900">Shelf B</p>
            <p className="text-[10px] text-gray-500">Antibiotics, Skin &amp; Digestive</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-teal-100">
            <p className="font-bold text-gray-900">Shelf C</p>
            <p className="text-[10px] text-gray-500">Ayurvedic, Vitamins, Baby</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-teal-100">
            <p className="font-bold text-gray-900">Counter Shelf</p>
            <p className="text-[10px] text-gray-500">Fast Moving OTC &amp; Surgical</p>
          </div>
        </div>
      </div>

      {/* Search Results Display */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-poppins font-bold text-sm text-gray-800">
            Search Results ({results.length}):
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3 hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-poppins font-bold text-base text-gray-900">{loc.medicine.name}</h3>
                    <p className="text-xs text-gray-400">{loc.medicine.brand || loc.medicine.genericName}</p>
                  </div>
                  <button
                    onClick={() => startEdit(loc)}
                    className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg hover:bg-gray-50"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Shelf</span>
                    <span className="font-bold text-teal-700">{loc.shelfLabel || 'Shelf A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Rack #</span>
                    <span className="font-bold text-gray-800">{loc.rackNumber || 'Rack 1'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Section</span>
                    <span className="font-bold text-gray-800">{loc.section || 'Middle'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Cover Label</span>
                    <span className="font-bold text-blue-700">{loc.coverLabel || 'Blue Cover'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-poppins font-bold text-lg text-gray-900">
              Update Shelf Location for {editingItem.medicine.name}
            </h3>

            <form onSubmit={saveLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Shelf Label</label>
                <input
                  type="text"
                  value={shelfLabel}
                  onChange={(e) => setShelfLabel(e.target.value)}
                  placeholder="e.g. Shelf A / Counter Shelf"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rack Number</label>
                <input
                  type="text"
                  value={rackNumber}
                  onChange={(e) => setRackNumber(e.target.value)}
                  placeholder="e.g. Rack 1"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cover / Tag Color</label>
                <input
                  type="text"
                  value={coverLabel}
                  onChange={(e) => setCoverLabel(e.target.value)}
                  placeholder="e.g. Blue Cover / Green Label"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
