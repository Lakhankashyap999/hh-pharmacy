'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Pill } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
}

export default function AddMedicinePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // Form Fields
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
  const [requiresPrescription, setRequiresPrescription] = useState(false)
  const [description, setDescription] = useState('')
  const [usageInstructions, setUsageInstructions] = useState('')
  const [sideEffects, setSideEffects] = useState('')

  // Initial batch fields
  const [batchNumber, setBatchNumber] = useState('')
  const [initialQuantity, setInitialQuantity] = useState('100')
  const [expiryDate, setExpiryDate] = useState('2027-12-31')
  const [shelfLabel, setShelfLabel] = useState('Shelf A')
  const [rackNumber, setRackNumber] = useState('Rack 1')
  const [coverLabel, setCoverLabel] = useState('Blue Cover')

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data)
        if (data.length > 0) setCategoryId(data[0].id.toString())
      })
  }, [])

  // Auto calculate discount
  const handleMrpChange = (val: string) => {
    setMrp(val)
    const numMrp = parseFloat(val)
    if (!isNaN(numMrp) && numMrp > 0) {
      const disc = parseFloat(discountPercent) || 0
      setSellingPrice((numMrp - (numMrp * disc) / 100).toFixed(0))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !mrp || !sellingPrice) {
      toast.error('Please enter name, MRP and selling price')
      return
    }

    setLoading(true)
    try {
      // 1. Create medicine
      const res = await fetch('/api/medicines', {
        method: 'POST',
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
          requiresPrescription: drugSchedule === 'H' || drugSchedule === 'H1' || drugSchedule === 'X' || requiresPrescription,
          isNarcotic: drugSchedule === 'X',
          description: description.trim() || null,
          usageInstructions: usageInstructions.trim() || null,
          sideEffects: sideEffects.trim() || null,
          isActive: true,
        }),
      })

      if (res.ok) {
        const createdMedicine = await res.json()

        // 2. Add initial batch if provided
        if (initialQuantity && parseInt(initialQuantity) > 0) {
          await fetch('/api/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              medicineId: createdMedicine.id,
              batchId: null,
              change: parseInt(initialQuantity),
              batchNumber: batchNumber.trim() || undefined,
              expiryDate: expiryDate || undefined,
              reason: 'Initial stock intake',
            }),
          }).catch(() => {})
        }

        // 3. Set shop location
        await fetch('/api/locations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicineId: createdMedicine.id,
            shelfLabel,
            rackNumber,
            section: 'Middle',
            coverLabel,
            description: 'Main counter area',
          }),
        }).catch(() => {})

        toast.success(`Medicine "${name}" created and added to catalog! 💊`, { duration: 4000 })
        router.push('/admin/medicines')
      } else {
        toast.error('Failed to create medicine')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
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
            <h1 className="font-poppins font-bold text-2xl text-gray-900">Add New Medicine</h1>
            <p className="text-xs text-gray-500">Add authentic medicine to H&H Pharmacy catalog</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            1. Medicine Identity & Clinical Salt
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medicine Name (English) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Crocin 650mg Tablet"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Medicine Name (Hindi / दवाई का नाम)
              </label>
              <input
                type="text"
                value={nameHindi}
                onChange={(e) => setNameHindi(e.target.value)}
                placeholder="e.g. क्रोसिन 650mg टैबलेट"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Generic Composition (Salt)
              </label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Paracetamol 650mg"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Crocin / GSK"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. GlaxoSmithKline Pharmaceuticals"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Unit Packaging Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900">
            2. Pricing & Packaging Unit (Loose Tablet Controls)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Printed MRP (₹) *</label>
              <input
                type="number"
                step="0.1"
                value={mrp}
                onChange={(e) => handleMrpChange(e.target.value)}
                placeholder="100"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Discount (% Off)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => {
                  setDiscountPercent(e.target.value)
                  const numMrp = parseFloat(mrp)
                  const disc = parseFloat(e.target.value) || 0
                  if (!isNaN(numMrp)) setSellingPrice((numMrp - (numMrp * disc) / 100).toFixed(0))
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Final Selling Price (₹) *</label>
              <input
                type="number"
                step="0.1"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="85"
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 font-bold text-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Packaging Form</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="strip">Strip (Tablets/Capsules)</option>
                <option value="bottle">Bottle (Syrup/Drops/Oils)</option>
                <option value="tube">Tube (Gel/Ointment/Cream)</option>
                <option value="sachet">Sachet (Powder/Electral)</option>
                <option value="injection">Injection / Vial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tablets per Strip / Pack (e.g. 10 or 15)
              </label>
              <input
                type="number"
                value={unitsPerPack}
                onChange={(e) => setUnitsPerPack(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Drug Schedule Law</label>
              <select
                value={drugSchedule}
                onChange={(e) => setDrugSchedule(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="OTC">OTC (Over the Counter - Freely Sold)</option>
                <option value="G">Schedule G (Caution Label)</option>
                <option value="H">Schedule H (Doctor Rx Mandatory)</option>
                <option value="H1">Schedule H1 (Strict Rx + Register)</option>
                <option value="X">Schedule X (Narcotic - In-Person Only)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Shop Location Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900">
            3. Physical Shop Location (Ghookna Mode Store)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shelf Label</label>
              <input
                type="text"
                value={shelfLabel}
                onChange={(e) => setShelfLabel(e.target.value)}
                placeholder="e.g. Shelf A / Counter Shelf"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rack Number</label>
              <input
                type="text"
                value={rackNumber}
                onChange={(e) => setRackNumber(e.target.value)}
                placeholder="e.g. Rack 1 / Rack 2"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Cover / Tag Color</label>
              <input
                type="text"
                value={coverLabel}
                onChange={(e) => setCoverLabel(e.target.value)}
                placeholder="e.g. Blue Cover / Green Label"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Clinical Info & Descriptions */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900">4. Medicine Guidance & Usage</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Uses</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Used for reducing fever and relieving mild to moderate headache/pain..."
                rows={2}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Dosage / How to Use</label>
              <textarea
                value={usageInstructions}
                onChange={(e) => setUsageInstructions(e.target.value)}
                placeholder="Take 1 tablet every 4-6 hours with water..."
                rows={2}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/medicines"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-xs hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-2xl text-xs hover:bg-teal-700 transition-all shadow-md active:scale-98 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Medicine...' : 'Save & Publish to Store'}
          </button>
        </div>
      </form>
    </div>
  )
}
