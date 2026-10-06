'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Calendar, MapPin, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditMedicinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const medicineId = parseInt(params.id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  // Medicine data
  const [name, setName] = useState('')
  const [nameHindi, setNameHindi] = useState('')
  const [genericName, setGenericName] = useState('')
  const [brand, setBrand] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [mrp, setMrp] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [discountPercent, setDiscountPercent] = useState('15')
  const [unitType, setUnitType] = useState('strip')
  const [unitsPerPack, setUnitsPerPack] = useState('10')
  const [drugSchedule, setDrugSchedule] = useState('OTC')
  const [isActive, setIsActive] = useState(true)

  // Location data
  const [shelfLabel, setShelfLabel] = useState('')
  const [rackNumber, setRackNumber] = useState('')
  const [coverLabel, setCoverLabel] = useState('')

  // Batches
  const [batches, setBatches] = useState<any[]>([])

  // New batch modal state
  const [newBatchNumber, setNewBatchNumber] = useState('')
  const [newBatchQty, setNewBatchQty] = useState('100')
  const [newBatchExpiry, setNewBatchExpiry] = useState('2028-06-30')
  const [addingBatch, setAddingBatch] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/medicines/${medicineId}`).then((r) => r.json()),
    ]).then(([cats, med]) => {
      setCategories(cats)
      if (med) {
        setName(med.name || '')
        setNameHindi(med.nameHindi || '')
        setGenericName(med.genericName || '')
        setBrand(med.brand || '')
        setManufacturer(med.manufacturer || '')
        setCategoryId(med.categoryId ? med.categoryId.toString() : '')
        setMrp(med.mrp ? med.mrp.toString() : '')
        setSellingPrice(med.sellingPrice ? med.sellingPrice.toString() : '')
        setDiscountPercent(med.discountPercent ? med.discountPercent.toString() : '15')
        setUnitType(med.unitType || 'strip')
        setUnitsPerPack(med.unitsPerPack ? med.unitsPerPack.toString() : '10')
        setDrugSchedule(med.drugSchedule || 'OTC')
        setIsActive(med.isActive)
        setBatches(med.batches || [])
        if (med.location) {
          setShelfLabel(med.location.shelfLabel || '')
          setRackNumber(med.location.rackNumber || '')
          setCoverLabel(med.location.coverLabel || '')
        }
      }
      setLoading(false)
    })
  }, [medicineId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // 1. Update medicine details
      const res = await fetch(`/api/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          nameHindi: nameHindi.trim() || null,
          genericName: genericName.trim() || null,
          brand: brand.trim() || null,
          manufacturer: manufacturer.trim() || null,
          categoryId: categoryId ? parseInt(categoryId) : null,
          mrp: parseFloat(mrp),
          sellingPrice: parseFloat(sellingPrice),
          discountPercent: parseFloat(discountPercent) || 0,
          unitType,
          unitsPerPack: parseInt(unitsPerPack) || 10,
          drugSchedule,
          isActive,
        }),
      })

      // 2. Update location
      await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          shelfLabel,
          rackNumber,
          coverLabel,
        }),
      })

      if (res.ok) {
        toast.success('Medicine and location updated successfully! ✅')
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNewBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchNumber || !newBatchQty) {
      toast.error('Enter batch number and quantity')
      return
    }

    setAddingBatch(true)
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          batchId: null,
          change: parseInt(newBatchQty),
          batchNumber: newBatchNumber.trim(),
          expiryDate: newBatchExpiry,
          reason: `New batch ${newBatchNumber}`,
        }),
      })

      if (res.ok) {
        toast.success(`Batch ${newBatchNumber} (+${newBatchQty} units) added!`)
        // Refresh batches
        const medRes = await fetch(`/api/medicines/${medicineId}`)
        const data = await medRes.json()
        setBatches(data.batches || [])
        setNewBatchNumber('')
        setNewBatchQty('100')
      }
    } catch {
      toast.error('Failed to add batch')
    } finally {
      setAddingBatch(false)
    }
  }

  if (loading) {
    return <div className="h-64 bg-white rounded-3xl skeleton border border-gray-100" />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/medicines"
            className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-2xl text-gray-900">Edit {name}</h1>
            <p className="text-xs text-gray-500">ID #{medicineId} • Inventory & Stock Manager</p>
          </div>
        </div>

        <Link
          href={`/medicines/${medicineId}`}
          target="_blank"
          className="text-xs font-semibold text-teal-600 hover:underline"
        >
          View Public Page ↗
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Medicine Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900">Medicine Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Hindi Name</label>
              <input
                type="text"
                value={nameHindi}
                onChange={(e) => setNameHindi(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Salt / Generic</label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 font-bold text-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">MRP (₹)</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            Shop Storage Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shelf Label</label>
              <input
                type="text"
                value={shelfLabel}
                onChange={(e) => setShelfLabel(e.target.value)}
                placeholder="Shelf A"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rack Number</label>
              <input
                type="text"
                value={rackNumber}
                onChange={(e) => setRackNumber(e.target.value)}
                placeholder="Rack 1"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cover / Tag Color</label>
              <input
                type="text"
                value={coverLabel}
                onChange={(e) => setCoverLabel(e.target.value)}
                placeholder="Blue Cover"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl text-xs hover:bg-teal-700 transition-all shadow-md active:scale-98 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Update Medicine & Location'}
          </button>
        </div>
      </form>

      {/* Batches Management Box */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-teal-600" />
          Active Stock Batches
        </h2>

        <div className="divide-y divide-gray-100">
          {batches.map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900">Batch #{b.batchNumber}</p>
                <p className="text-gray-400">
                  Expiry: {new Date(b.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-teal-700">{b.currentQuantity} units</span>
                <span className="text-[10px] text-gray-400 block">in stock</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Batch Quick Form */}
        <form onSubmit={handleAddNewBatch} className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 mb-1">New Batch #</label>
            <input
              type="text"
              value={newBatchNumber}
              onChange={(e) => setNewBatchNumber(e.target.value)}
              placeholder="e.g. BATCH-2027"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 mb-1">Quantity (Units)</label>
            <input
              type="number"
              value={newBatchQty}
              onChange={(e) => setNewBatchQty(e.target.value)}
              placeholder="100"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 mb-1">Expiry Date</label>
            <input
              type="date"
              value={newBatchExpiry}
              onChange={(e) => setNewBatchExpiry(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200"
            />
          </div>
          <button
            type="submit"
            disabled={addingBatch}
            className="w-full py-2 bg-teal-50 text-teal-700 border border-teal-200 font-bold rounded-xl text-xs hover:bg-teal-100 transition-colors"
          >
            {addingBatch ? 'Adding...' : '+ Add Batch Stock'}
          </button>
        </form>
      </div>
    </div>
  )
}
