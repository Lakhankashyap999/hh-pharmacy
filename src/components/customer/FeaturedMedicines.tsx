import { MedicineCard } from './MedicineCard'
import Link from 'next/link'

export default function FeaturedMedicines({ medicines }: { medicines: any[] }) {
  return (
    <section className="py-10 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-poppins font-bold text-xl text-gray-900">Popular Medicines</h2>
            <p className="text-gray-500 text-sm mt-0.5">Fast moving medicines at best prices</p>
          </div>
          <Link href="/medicines" className="text-teal-600 text-sm font-medium hover:text-teal-700">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {medicines.map((medicine, i) => (
            <MedicineCard key={medicine.id} medicine={medicine} index={i} />
          ))}
        </div>

        {medicines.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">💊</span>
            <p className="mt-4 font-medium">No medicines found</p>
            <p className="text-sm">Admin will add medicines from the admin panel</p>
          </div>
        )}
      </div>
    </section>
  )
}
