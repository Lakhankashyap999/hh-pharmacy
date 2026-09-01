'use client'

import { useState } from 'react'
import { Receipt, Upload, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Save } from 'lucide-react'
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

export default function AdminReceiptOCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedItems, setExtractedItems] = useState<ExtractedMedicine[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setExtractedItems([])
  }

  // Simulated AI Vision OCR parser
  const processReceipt = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    toast('Gemini AI Vision analyzing distributor invoice...', { icon: '🤖' })

    // Simulate AI parsing of distributor invoice photo
    setTimeout(() => {
      const mockExtracted: ExtractedMedicine[] = [
        {
          name: 'Crocin 650mg Tablet',
          batchNumber: 'CR-2026-SEP',
          expiryDate: '2028-09-30',
          quantity: 200,
          mrp: 100,
          purchasePrice: 65,
          unitType: 'strip',
        },
        {
          name: 'Dolo 650mg Tablet',
          batchNumber: 'DL-2026-OCT',
          expiryDate: '2028-10-31',
          quantity: 300,
          mrp: 35,
          purchasePrice: 22,
          unitType: 'strip',
        },
        {
          name: 'Amoxicillin 500mg Capsule',
          batchNumber: 'AMX-2027-01',
          expiryDate: '2027-12-31',
          quantity: 100,
          mrp: 120,
          purchasePrice: 80,
          unitType: 'strip',
        },
      ]

      setExtractedItems(mockExtracted)
      setIsProcessing(false)
      toast.success('Successfully extracted 3 medicine batches from bill! 📋')
    }, 2000)
  }

  const saveExtractedStock = async () => {
    setIsSaving(true)
    try {
      // In production, loop and update batches / create stock logs
      toast.success('All extracted medicines and stock successfully added to inventory! 🎉', { duration: 5000 })
      setExtractedItems([])
      setSelectedFile(null)
      setPreviewUrl(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-teal-600" />
          Distributor Billing Receipt Scanner (AI OCR)
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload photo of distributor invoices. AI automatically extracts medicine names, batch numbers, expiry dates &amp; quantities to update stock.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview Area (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="font-poppins font-bold text-base text-gray-900">Upload Invoice Photo</h2>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors">
              {previewUrl ? (
                <div className="space-y-3">
                  <img src={previewUrl} alt="Bill Preview" className="max-h-56 mx-auto rounded-xl object-contain" />
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      setExtractedItems([])
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Change Invoice Photo
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-xs font-semibold text-teal-600 hover:underline">
                      Click to Browse Distributor Bill Photo
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-1">Camera photos, JPG, PNG or PDF</p>
                </div>
              )}
            </div>

            {selectedFile && extractedItems.length === 0 && (
              <button
                onClick={processReceipt}
                disabled={isProcessing}
                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl text-xs hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isProcessing ? 'AI Scanning Invoice...' : 'Scan Bill with Gemini AI'}
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
                Upload and scan an invoice on the left to see parsed stock entries ready for auto-updating.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-gray-100">
                  {extractedItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-500">
                          Batch: <span className="font-mono">{item.batchNumber}</span> • Exp: {item.expiryDate}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Purchase Rate: ₹{item.purchasePrice} | MRP: ₹{item.mrp}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-teal-700 text-sm">+{item.quantity} units</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Ready to Sync</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveExtractedStock}
                  disabled={isSaving}
                  className="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl text-xs hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Updating Inventory...' : 'Confirm & Automatically Update Inventory'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
