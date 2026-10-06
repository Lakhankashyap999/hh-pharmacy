import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  FileCheck2,
  Download,
  ExternalLink,
  Award,
  Building,
  User,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  Phone,
} from 'lucide-react'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'

export const metadata = {
  title: 'Official Drug Licenses & FDA Certification | H&H Pharmacy',
  description:
    'Official Retail Drug Licenses Form 20 and Form 21 issued by Food Safety and Drug Administration, Meerut Division, Government of Uttar Pradesh.',
}

export default function LicensesPage() {
  const licenseDetails = [
    {
      title: 'Form 20 Retail Drug Licence',
      rule: 'Rule 61(1) of the Drugs Rules 1945',
      desc: 'Licence to sell, stock or exhibit or offer for sale, or distribute by retail drugs other than those specified in Schedules C, C(1) and X',
      licenceNo: 'RLF20UP2025007813',
      fileNo: 'UP/RL/F19/2025/10307',
      siteId: 'UP0035348',
      issueDate: '20-APR-2025',
      validityDate: '19-APR-2030 (Perpetual 5-Year Assessment)',
      imageSrc: '/licenses/form-20-licence.jpg',
      scheduleCovered: 'All Drugs (Except Schedules C, C1, and X)',
    },
    {
      title: 'Form 21 Retail Drug Licence',
      rule: 'Rule 61(2) of the Drugs Rules 1945',
      desc: 'Licence to sell, stock or exhibit or offer for sale, or distribute by retail drugs specified in Schedules C and C(1) excluding Schedule X',
      licenceNo: 'RLF21UP2025007766',
      fileNo: 'UP/RL/F19/2025/10307',
      siteId: 'UP0035348',
      issueDate: '20-APR-2025',
      validityDate: '19-APR-2030 (Perpetual 5-Year Assessment)',
      imageSrc: '/licenses/form-21-licence.jpg',
      scheduleCovered: 'Schedule C & C(1) Drugs (Biological & Special Products)',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Government Drug Licences &amp; Regulatory Compliance</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-gray-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Verified &amp; Certified by Govt. of Uttar Pradesh
            </div>

            <h1 className="font-poppins font-extrabold text-2xl sm:text-4xl leading-tight">
              Statutory Retail Drug Licences &amp; Pharmacist Credentials
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              H &amp; H PHARMACY operates under strict compliance with the Drugs and Cosmetics Act, 1940 and Drugs Rules, 1945. Both retail licenses are officially granted and digitally authenticated by the Food Safety and Drug Administration (FSDA), Meerut Division, Government of Uttar Pradesh.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-teal-100">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Form 20: <strong>RLF20UP2025007813</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Form 21: <strong>RLF21UP2025007766</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Site ID: <strong>UP0035348</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statutory Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-sm">Licensed Shop Premises</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Premises:</strong> Plot No-7, Khasra No-606, Shop No-01, Ghokna Mode Gali No-3, Ghaziabad, Uttar Pradesh - 201003.
            </p>
            <p className="text-[11px] text-gray-400">
              Constitution: Proprietary (<strong>Honey Kashyap / Harsh Kashyap</strong>)
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-sm">Qualified Person-in-Charge</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Registered Pharmacist:</strong> Mr. Ashwani Kumar<br />
              <strong>Qualification:</strong> Bachelor of Pharmacy (B. Pharma)<br />
              <strong>Member / Reg ID:</strong> 20257554956
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold">
              Authorized to compound &amp; dispense all scheduled medicines.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-poppins font-bold text-gray-900 text-sm">Licensing Authority</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Authority:</strong> Arvind Kumar Gupta<br />
              <strong>Division:</strong> Meerut Division, Food Safety &amp; Drug Administration (FSDA)<br />
              <strong>Office:</strong> Meerut, Uttar Pradesh - 250003
            </p>
            <p className="text-[11px] text-gray-400">
              Digitally Signed Certificate Verification active.
            </p>
          </div>
        </div>

        {/* The Two Official Certificates Side by Side */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
            <div>
              <h2 className="font-poppins font-bold text-xl text-gray-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                Original Government Issued Certificates
              </h2>
              <p className="text-xs text-gray-500">
                Click any certificate to expand, verify digital signature, or download high-resolution copy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {licenseDetails.map((lic, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Certificate Meta Details */}
                <div className="p-6 bg-gray-50/70 border-b border-gray-200 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                        {lic.rule}
                      </span>
                      <h3 className="font-poppins font-extrabold text-gray-900 text-lg mt-1">{lic.title}</h3>
                    </div>

                    <a
                      href={lic.imageSrc}
                      download={`HH_Pharmacy_${lic.title.replace(/\s+/g, '_')}.jpg`}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 hover:text-teal-700 hover:border-teal-300 font-bold text-xs py-2 px-3.5 rounded-xl shadow-3xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{lic.desc}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Licence No</span>
                      <strong className="text-teal-800 font-mono">{lic.licenceNo}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Issue Date</span>
                      <strong className="text-gray-900">{lic.issueDate}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-gray-100 col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Validity</span>
                      <strong className="text-emerald-700">{lic.validityDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Certificate Image Frame */}
                <div className="p-4 sm:p-6 bg-gray-100 flex items-center justify-center">
                  <a
                    href={lic.imageSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group relative rounded-2xl overflow-hidden border border-gray-300 shadow-md hover:shadow-xl transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lic.imageSrc}
                      alt={lic.title}
                      className="w-full h-auto object-contain max-h-[720px] transition-transform duration-300 group-hover:scale-101"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-2">
                      <ExternalLink className="w-5 h-5" /> Click to View Full Size
                    </div>
                  </a>
                </div>

                {/* Footer of card */}
                <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Scope: <strong>{lic.scheduleCovered}</strong></span>
                  <a
                    href={lic.imageSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 font-bold inline-flex items-center gap-1"
                  >
                    Open Certificate <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Help Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-poppins font-bold text-gray-900 text-base">
              Need Verification or Prescription Assistance?
            </h3>
            <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
              Our registered pharmacist Mr. Ashwani Kumar and store managers Nishant Choudhary &amp; Harsh Kashyap are available directly by phone or at our Ghookna Mode pharmacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:7827558443"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Nishant (7827558443)
            </a>
            <a
              href="tel:8171093455"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold px-5 py-3 rounded-xl text-xs shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Harsh (8171093455)
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
