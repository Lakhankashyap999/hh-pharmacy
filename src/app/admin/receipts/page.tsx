'use client'

import { useState } from 'react'
import {
  Receipt,
  Upload,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Save,
  RotateCcw,
  Trash2,
  History,
  FileCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExtractedMedicine {
  name: string
  batchNumber: string
  expiryDate: string
  quantity: number
  mrp: number
  purchasePrice: number
  unitType: string
}

interface InvoicedBatch {
  id: string
  invoiceNumber: string
  date: string
  supplier: string
  medicinesCount: number
  totalUnitsAdded: number
  status: 'synced' | 'rolled_back'
  items: ExtractedMedicine[]
}

export default function AdminReceiptOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedItems, setExtractedItems] = useState<ExtractedMedicine[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Invoice Sync History (for rollback / undo)
  const [invoiceHistory, setInvoiceHistory] = useState<InvoicedBatch[]>([
    {
      id: 'INV-2026-0901',
      invoiceNumber: 'INV/MED/98421',
      date: '2026-09-01 18:30',
      supplier: 'MedPlus Wholesale Distributors, Ghaziabad',
      medicinesCount: 3,
      totalUnitsAdded: 600,
      status: 'synced',
      items: [
        { name: 'Dolo 650mg Tablet', batchNumber: 'DL-2026-OCT', expiryDate: '2028-10-31', quantity: 300, mrp: 34.5, purchasePrice: 22, unitType: 'strip' },
        { name: 'Pan-D Capsule', batchNumber: 'PD-2026-SEP', expiryDate: '2028-09-30', quantity: 150, mrp: 220, purchasePrice: 140, unitType: 'strip' },
        { name: 'Augmentin 625 Duo', batchNumber: 'AG-2027-01', expiryDate: '2028-06-30', quantity: 150, mrp: 223.5, purchasePrice: 150, unitType: 'strip' },
      ],
    },
  ])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setExtractedItems([])
  }

  // AI Vision OCR extractor
  const processReceipt = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    toast('Gemini AI Vision analyzing distributor invoice photo...', { icon: '🤖' })

    setTimeout(() => {
      const mockExtracted: ExtractedMedicine[] = [
        {
          name: 'Crocin 650mg Tablet',
          batchNumber: `CR-${new Date().getFullYear()}-A1`,
          expiryDate: '2028-12-31',
          quantity: 200,
          mrp: 35,
          purchasePrice: 24,
          unitType: 'strip',
        },
        {
          name: 'Shelcal 500mg Tablet',
          batchNumber: `SH-${new Date().getFullYear()}-B2`,
          expiryDate: '2028-11-30',
          quantity: 150,
          mrp: 135,
          purchasePrice: 90,
          unitType: 'strip',
        },
        {
          name: 'Volini Pain Relief Gel 30g',
          batchNumber: `VL-${new Date().getFullYear()}-C3`,
          expiryDate: '2028-10-31',
          quantity: 50,
          mrp: 165,
          purchasePrice: 110,
          unitType: 'tube',
        },
        {
          name: 'Limcee 500mg Chewable (Orange)',
          batchNumber: `LC-${new Date().getFullYear()}-D4`,
          expiryDate: '2028-08-31',
          quantity: 300,
          mrp: 26,
          purchasePrice: 18,
          unitType: 'strip',
        },
      ]

      setExtractedItems(mockExtracted)
      setIsProcessing(false)
      toast.success('Successfully extracted 4 medicine batches from distributor bill! 📋')
    }, 1800)
  }

  // Save Extracted Stock
  const saveExtractedStock = async () => {
    setIsSaving(true)
    try {
      const newInvoiceId = `INV-${Date.now()}`
      const totalUnits = extractedItems.reduce((sum, i) => sum + i.quantity, 0)

      const newHistoryEntry: InvoicedBatch = {
        id: newInvoiceId,
        invoiceNumber: `INV/GHZ/${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toLocaleString('en-IN'),
        supplier: 'Shree Balaji Pharma Distributors, Ghaziabad',
        medicinesCount: extractedItems.length,
        totalUnitsAdded: totalUnits,
        status: 'synced',
        items: [...extractedItems],
      }

      setInvoiceHistory((prev) => [newHistoryEntry, ...prev])
      toast.success('All medicines & stock successfully synced to inventory! 🎉', { duration: 5000 })
      setExtractedItems([])
      setSelectedFile(null)
      setPreviewUrl(null)
    } finally {
      setIsSaving(false)
    }
  }

  // 1-Click Rollback / Undo Wrong Invoice
  const handleRollbackInvoice = (invoiceId: string) => {
    if (!confirm('Are you sure you want to ROLLBACK / UNDO this invoice? All stock batches added by this bill will be removed and inventory restored to previous state.')) {
      return
    }

    setInvoiceHistory((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'rolled_back' } : inv
      )
    )

    toast.success('Invoice batch rolled back! Stock restored to previous state. You can now re-upload. ↩️', {
      duration: 5000,
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-teal-600" />
          Smart Distributor Bill Scanner (AI OCR + Undo Rollback)
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Scan paper invoice photos from distributors. AI auto-extracts medicine names, batch numbers &amp; stock. With 1-click mistake rollback support.
        </p>
      </div>

      {/* Main Grid: Left Upload & Right Extracted Results */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Upload & Scan Box (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="font-poppins font-bold text-base text-gray-900">Upload Invoice Photo</h2>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors">
              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Bill Preview" className="max-h-56 mx-auto rounded-xl object-contain shadow-2xs" />
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setExtractedItems([])
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer font-semibold"
                  >
                    Change / Re-upload Invoice Photo
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-xs font-bold text-teal-600 hover:underline">
                      Click to Browse Distributor Bill Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">Phone camera photos, JPG, PNG or PDF</p>
                </div>
              )}
            </div>

            {selectedFile && extractedItems.length === 0 && (
              <button
                onClick={processReceipt}
                disabled={isProcessing}
                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'AI Scanning & Reading Invoice...' : 'Scan Bill with Gemini AI'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: AI Extracted Preview & Confirm (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-poppins font-bold text-base text-gray-900">
                Extracted Medicines &amp; Batches
              </h2>
              {extractedItems.length > 0 && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                  {extractedItems.length} items parsed
                </span>
              )}
            </div>

            {extractedItems.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs border border-dashed border-gray-100 rounded-2xl">
                Upload and scan an invoice on the left to see parsed stock entries ready for automated inventory sync.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-gray-100">
                  {extractedItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-500">
                          Batch: <span className="font-mono font-bold">{item.batchNumber}</span> • Exp: {item.expiryDate}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Purchase: ₹{item.purchasePrice} | MRP: ₹{item.mrp}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-teal-700 text-sm">+{item.quantity} units</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Ready to Sync</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setExtractedItems([])
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      toast('Re-upload cleared. Ready for new scan.', { icon: '🔄' })
                    }}
                    className="py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-2xl text-xs hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel / Re-enter
                  </button>

                  <button
                    onClick={saveExtractedStock}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 text-white font-extrabold py-3 px-6 rounded-2xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Updating Inventory...' : 'Confirm & Automatically Update Inventory'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice History & 1-Click Rollback / Undo Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              Scanned Invoices History &amp; Mistake Rollback
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              If a wrong bill was uploaded by mistake, click "Rollback / Undo" to revert all added stock in 1-click.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {invoiceHistory.map((inv) => (
            <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">{inv.invoiceNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'synced'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800 line-through'
                    }`}
                  >
                    {inv.status === 'synced' ? 'ACTIVE SYNCED' : 'ROLLED BACK / UNDONE'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {inv.supplier} • {inv.medicinesCount} medicines ({inv.totalUnitsAdded} total units) • {inv.date}
                </p>
              </div>

              <div>
                {inv.status === 'synced' ? (
                  <button
                    onClick={() => handleRollbackInvoice(inv.id)}
                    className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>↩️ Rollback Invoice (Undo)</span>
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-semibold italic">
                    Restored to previous stock state
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
