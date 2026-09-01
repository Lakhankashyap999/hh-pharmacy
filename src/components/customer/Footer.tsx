import Link from 'next/link'
import { Phone, MapPin, Clock, Shield, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-poppins font-bold text-sm">H&H</span>
              </div>
              <div>
                <p className="font-poppins font-bold text-white text-base">H&H Pharmacy</p>
                <p className="font-hindi text-teal-400 text-xs">दवाईयाँ</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              हमारे यहाँ सभी प्रकार की अंग्रेजी व देशी दवाईयाँ उचित रेट पर मिलती हैं।
            </p>
            <p className="mt-2 text-sm text-gray-400">Owners:</p>
            <p className="text-sm text-gray-300">Nishant Choudhary & Honey Kashyap</p>
            <div className="mt-3 inline-block bg-teal-900 text-teal-300 text-xs px-3 py-1 rounded-full border border-teal-800">
              🏷️ Discount Up to 15%
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <a href="tel:7827558443" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                7827558443 (Nishant)
              </a>
              <a href="tel:8171093455" className="flex items-center gap-2 hover:text-teal-400 transition-colors">
                <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                8171093455 (Honey)
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>Plot No-7, Kh No-606, Shop No-01, Ghookna Mode, Gali No-03, Ghaziabad, UP-201003</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-500 shrink-0" />
                Mon–Sat: 8:00 AM – 9:00 PM
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-poppins font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm text-gray-400">
              {[
                { href: '/medicines', label: 'All Medicines' },
                { href: '/medicines?schedule=OTC', label: 'No Prescription Medicines' },
                { href: '/medicines?category=8', label: 'Ayurvedic Medicines' },
                { href: '/cart', label: 'My Cart' },
                { href: '/account/orders', label: 'My Orders' },
                { href: '/admin/login', label: '🔐 Admin Login' },
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

        {/* Legal disclaimer */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-300">⚕️ Medical Disclaimer: </span>
                We are a licensed pharmacy (License No.: Required). Schedule H, H1, and X medicines require a valid prescription from a registered medical practitioner.
                Self-medication can be harmful. We reserve the right to refuse any order without a valid prescription.
                All drug sales comply with the Drugs &amp; Cosmetics Act, 1940.
                For emergencies, call <strong>108</strong>.
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 H&H Pharmacy. All rights reserved.</p>
          <p>Powered by H&H Digital Platform</p>
        </div>
      </div>
    </footer>
  )
}
