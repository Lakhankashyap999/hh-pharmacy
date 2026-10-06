'use client'

import { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  ShieldCheck,
  Download,
  Plus,
  Search,
  RefreshCw,
  X,
  AlertTriangle,
  Calendar,
  User,
  Stethoscope,
  Pill,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DrugRegisterEntry {
  id: number
  saleDate: string
  medicineName: string
  batchNumber?: string | null
  quantitySold: number
  customerName: string
  customerAddress?: string | null
  doctorName?: string | null
  doctorRegNumber?: string | null
  soldBy?: string | null
  remarks?: string | null
  medicine?: {
    id: number
    name: string
    brand?: string
    drugSchedule?: string
  }
  batch?: {
    batchNumber: string
    expiryDate: string
  }
  order?: {
    orderNumber: string
    customerName: string
    customerPhone: string
  }
}

interface MedicineOption {
  id: number
  name: string
  brand: string
  drugSchedule: string
}

export default function AdminDrugRegisterPage() {
  const [entries, setEntries] = useState<DrugRegisterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Medicine list for manual record entry
  const [medicines, setMedicines] = useState<MedicineOption[]>([])
  const [formData, setFormData] = useState({
    medicineId: '',
    medicineName: '',
    batchNumber: '',
    quantitySold: '1',
    customerName: '',
    customerAddress: '',
    doctorName: '',
    doctorRegNumber: '',
    soldBy: 'Harsh Kashyap / Nishant Choudhary',
    remarks: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/drug-register')
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      } else {
        toast.error('Failed to load drug register records')
      }
    } catch {
      toast.error('Network error loading register')
    } finally {
      setLoading(false)
    }
  }

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines?limit=100')
      if (res.ok) {
        const data = await res.json()
        setMedicines(data.medicines || [])
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchEntries()
    fetchMedicines()
  }, [])

  const handleMedicineSelect = (id: string) => {
    const med = medicines.find((m) => m.id.toString() === id)
    setFormData((prev) => ({
      ...prev,
      medicineId: id,
      medicineName: med ? med.name : '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.medicineId || !formData.customerName || !formData.quantitySold) {
      toast.error('Please fill required fields (Medicine, Quantity, Customer Name)')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/drug-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Entry recorded in statutory drug register')
        setShowAddModal(false)
        setFormData({
          medicineId: '',
          medicineName: '',
          batchNumber: '',
          quantitySold: '1',
          customerName: '',
          customerAddress: '',
          doctorName: '',
          doctorRegNumber: '',
          soldBy: 'Harsh Kashyap / Nishant Choudhary',
          remarks: '',
        })
        fetchEntries()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save entry')
      }
    } catch {
      toast.error('Network error while saving entry')
    } finally {
      setSubmitting(false)
    }
  }

  const exportRegister = () => {
    if (entries.length === 0) {
      toast.error('No records available to export')
      return
    }

    const headers = [
      'Date & Time',
      'Order Ref',
      'Medicine Name',
      'Schedule',
      'Batch No',
      'Qty Sold',
      'Customer Name',
      'Customer Address',
      'Doctor Name',
      'Doctor Reg No',
      'Dispensed By',
      'Remarks',
    ]

    const csvRows = [headers.join(',')]

    entries.forEach((entry) => {
      const row = [
        `"${new Date(entry.saleDate).toLocaleString('en-IN')}"`,
        `"${entry.order?.orderNumber || 'Counter Sale'}"`,
        `"${(entry.medicineName || '').replace(/"/g, '""')}"`,
        `"${entry.medicine?.drugSchedule || 'Schedule H1'}"`,
        `"${entry.batchNumber || entry.batch?.batchNumber || 'N/A'}"`,
        entry.quantitySold,
        `"${(entry.customerName || '').replace(/"/g, '""')}"`,
        `"${(entry.customerAddress || '').replace(/"/g, '""')}"`,
        `"${(entry.doctorName || '').replace(/"/g, '""')}"`,
        `"${(entry.doctorRegNumber || '').replace(/"/g, '""')}"`,
        `"${(entry.soldBy || '').replace(/"/g, '""')}"`,
        `"${(entry.remarks || '').replace(/"/g, '""')}"`,
      ]
      csvRows.push(row.join(','))
    })

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Drug_Inspector_Register_Schedule_H1_X_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Compliance Register exported successfully (CSV for Drug Inspector audit)')
  }

  const filteredEntries = entries.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.medicineName?.toLowerCase().includes(q) ||
      e.batchNumber?.toLowerCase().includes(q) ||
      e.customerName?.toLowerCase().includes(q) ||
      e.doctorName?.toLowerCase().includes(q) ||
      e.order?.orderNumber?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
            Schedule H1 &amp; X Drug Compliance Register
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Mandatory statutory sale records as per the Drugs &amp; Cosmetics Rules 1945 (preserved for 2 years)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-black transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Record Counter Sale
          </button>

          <button
            onClick={exportRegister}
            className="inline-flex items-center gap-1.5 bg-teal-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Inspector Report (CSV)
          </button>
        </div>
      </div>

      {/* Legal Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-sm text-emerald-950">Govt. Drug Inspector Compliance Ready ✅</p>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                DL: RLF20UP2025007813 &amp; RLF21UP2025007766
              </span>
            </div>
            <p className="mt-1 text-emerald-800 leading-relaxed text-[11px]">
              <strong>Premises:</strong> Plot No-7, Kh No-606, Shop No-01, Ghokna Mode Gali-3, Ghaziabad • <strong>Pharmacist:</strong> Mr. Ashwani Kumar (B.Pharma, Reg #20257554956) • <strong>Proprietor:</strong> Honey Kashyap
            </p>
          </div>
        </div>

        <a
          href="/licenses"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition-colors"
        >
          View Form 20 &amp; 21 Licences &rarr;
        </a>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, batch, patient, doctor..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-teal-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredEntries.length}</strong> of {entries.length} legal records
          </span>
          <button
            onClick={fetchEntries}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            Loading statutory compliance entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            No statutory drug records found matching your search.
            <p className="mt-1 text-[11px] text-gray-400">
              When an order containing Schedule H1 or X medicine is confirmed, it will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 border-b border-gray-100 font-semibold text-gray-600 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Date &amp; Ref</th>
                  <th className="py-3.5 px-3">Medicine &amp; Batch</th>
                  <th className="py-3.5 px-3">Schedule</th>
                  <th className="py-3.5 px-3">Qty Sold</th>
                  <th className="py-3.5 px-3">Patient / Buyer</th>
                  <th className="py-3.5 px-3">Prescribing Doctor</th>
                  <th className="py-3.5 px-4 text-right">Dispensed By</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-gray-900 font-bold">
                        {new Date(e.saleDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {e.order?.orderNumber ? `#${e.order.orderNumber}` : 'Counter Walk-in'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-gray-900">{e.medicineName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Batch: {e.batchNumber || e.batch?.batchNumber || 'N/A'}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          e.medicine?.drugSchedule === 'Schedule X'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {e.medicine?.drugSchedule || 'Schedule H1'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-teal-700">{e.quantitySold} units</td>

                    <td className="py-3 px-3">
                      <p className="font-medium text-gray-800">{e.customerName}</p>
                      {e.customerAddress && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{e.customerAddress}</p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-900">{e.doctorName || 'Prescribed MD'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        Reg: {e.doctorRegNumber || 'Reg Verified'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <p className="font-medium text-gray-700">{e.soldBy || 'Harsh / Nishant'}</p>
                      {e.remarks && <p className="text-[10px] text-gray-400 italic">{e.remarks}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Counter Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                Record Offline Counter Sale (Schedule H1/X)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Medicine *</label>
                <select
                  value={formData.medicineId}
                  onChange={(e) => handleMedicineSelect(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  required
                >
                  <option value="">-- Choose Medicine --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.brand}) - {m.drugSchedule}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. BATCH-2024"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity Sold *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantitySold}
                    onChange={(e) => setFormData({ ...formData, quantitySold: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Patient / Buyer Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Patient Address / Phone</label>
                  <input
                    type="text"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    placeholder="e.g. Ghookna, Ghaziabad"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="Dr. Name"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Doctor Reg Number</label>
                  <input
                    type="text"
                    value={formData.doctorRegNumber}
                    onChange={(e) => setFormData({ ...formData, doctorRegNumber: e.target.value })}
                    placeholder="e.g. DMC-54321"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pharmacist Dispensed By</label>
                  <input
                    type="text"
                    value={formData.soldBy}
                    onChange={(e) => setFormData({ ...formData, soldBy: e.target.value })}
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Counter Walk-in Prescription"
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save to Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
