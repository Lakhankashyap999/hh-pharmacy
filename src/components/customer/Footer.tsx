import Link from 'next/link'
import { Phone, MapPin, Clock, Shield, Heart, Zap, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      {/* Top Value Strip */}
      <div className="bg-gray-800/80 py-4 px-4 border-b border-gray-700/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-gray-200">
              60-Minute Fast Home Delivery in Ghaziabad (Ghookna Mode &amp; Nearby)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">Owners:</span>
            <span className="font-bold text-teal-300">Nishant Choudhary (7827558443)</span>
            <span className="text-gray-500">•</span>
            <span className="font-bold text-teal-300">Harsh Kashyap (8171093455)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center font-bold text-sm">
                H&amp;H
              </div>
              <div>
                <p className="font-poppins font-extrabold text-white text-base">H&amp;H Pharmacy</p>
                <p className="font-hindi text-teal-400 text-xs font-semibold">दवाईयाँ • उचित रेट पर</p>
              </div>
            </div>

            <p className="font-hindi text-gray-300 text-sm leading-relaxed max-w-md">
              हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ उचित रेट पर मिलती हैं।
            </p>

            <div className="bg-gray-800 p-3 rounded-2xl border border-gray-700 max-w-md space-y-1 text-xs">
              <p className="text-gray-400">
                🏪 <strong>Shop Location:</strong> Plot No-7, Kh No-606, Shop No-01, Ghookna Mode, Gali No-03, Ghaziabad, UP-201003
              </p>
              <p className="text-teal-400 font-semibold">
                🏷️ Flat Discount Up to 15% on English &amp; Ayurvedic Medicines
              </p>
            </div>
          </div>

          {/* Contact Direct */}
          <div>
            <h3 className="font-poppins font-bold text-sm text-white mb-3">Direct Contact</h3>
            <div className="space-y-2.5 text-xs text-gray-400">
              <a
                href="tel:7827558443"
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>7827558443 (Nishant Choudhary)</span>
              </a>

              <a
                href="tel:8171093455"
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>8171093455 (Harsh Kashyap)</span>
              </a>

              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>Mon–Sat: 8:00 AM – 9:00 PM</span>
              </div>

              <a
                href="https://wa.me/917827558443?text=Hello%20H%26H%20Pharmacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-600/50 hover:bg-emerald-700"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Nishant</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-bold text-sm text-white mb-3">Quick Navigation</h3>
            <div className="space-y-1.5 text-xs text-gray-400">
              {[
                { href: '/medicines', label: 'All Medicines 💊' },
                { href: '/medicines?schedule=OTC', label: 'OTC (No Prescription)' },
                { href: '/medicines?category=7', label: 'Ayurvedic & Immunity' },
                { href: '/cart', label: 'Shopping Cart & Rx Upload' },
                { href: '/account/orders', label: 'My Past Orders & Reorder' },
                { href: '/admin/login', label: '🔐 Admin Management' },
              ].map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="border-t border-gray-800 pt-5 mb-5">
          <div className="bg-gray-800/80 rounded-2xl p-4 text-[11px] text-gray-400 leading-relaxed border border-gray-700/50">
            <p>
              <strong className="text-gray-200">⚕️ Statutory Medical &amp; Legal Notice:</strong> H&amp;H Pharmacy operates strictly under the Drugs &amp; Cosmetics Act, 1940 and Rules, 1945. Schedule H, H1 and X medications require a valid physical or digital prescription from a registered medical practitioner. We do not dispense narcotics or controlled substances online without verified doctor verification.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500">
          <p>© 2026 H&amp;H Pharmacy, Ghaziabad. All rights reserved.</p>
          <p>Owners: Nishant Choudhary &amp; Harsh Kashyap</p>
        </div>
      </div>
    </footer>
  )
}
