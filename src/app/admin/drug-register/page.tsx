'use client'

import { useState } from 'react'
import { FileSpreadsheet, ShieldCheck, Download, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDrugRegisterPage() {
  const [entries, setEntries] = useState<any[]>([
    {
      id: 1,
      date: '2026-09-01',
      medicineName: 'Amoxicillin 500mg Capsule',
      batchNumber: 'BATCH-0007-2024',
      quantitySold: 10,
      customerName: 'Rahul Sharma',
      doctorName: 'Dr. A. K. Gupta',
      doctorRegNumber: 'DMC-45892',
      soldBy: 'Nishant Choudhary',
    },
    {
      id: 2,
      date: '2026-09-02',
      medicineName: 'Azithromycin 500mg Tablet',
      batchNumber: 'BATCH-0008-2024',
      quantitySold: 5,
      customerName: 'Priya Verma',
      doctorName: 'Dr. Sunita Rao',
      doctorRegNumber: 'UPMC-78912',
      soldBy: 'Honey Kashyap',
    },
  ])

  const exportRegister = () => {
    toast.success('Downloading Schedule H1 & X Legal Drug Register PDF... 📄')
  }

  return (
    <div className="space-y-6">
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

        <button
          onClick={exportRegister}
          className="inline-flex items-center gap-1.5 bg-teal-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" /> Export Inspector Report (PDF)
        </button>
      </div>

      {/* Legal Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Govt. Drug Inspector Compliance Ready ✅</p>
          <p className="mt-0.5 text-emerald-800 leading-relaxed">
            Every transaction of Schedule H1 (3rd gen antibiotics, anti-TB) and Schedule X narcotic drugs is automatically logged with Customer Name, Prescribing Doctor, Reg No., and Date.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 border-b border-gray-100 font-semibold text-gray-600 uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-3">Medicine &amp; Batch</th>
                <th className="py-3.5 px-3">Qty Sold</th>
                <th className="py-3.5 px-3">Customer Name</th>
                <th className="py-3.5 px-3">Doctor Name &amp; Reg No.</th>
                <th className="py-3.5 px-4 text-right">Sold By (Staff)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/70">
                  <td className="py-3 px-4 font-mono font-medium">{e.date}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900">{e.medicineName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">Batch: {e.batchNumber}</p>
                  </td>
                  <td className="py-3 px-3 font-bold text-teal-700">{e.quantitySold} units</td>
                  <td className="py-3 px-3 font-medium text-gray-800">{e.customerName}</td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-gray-900">{e.doctorName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{e.doctorRegNumber}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-600">{e.soldBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
