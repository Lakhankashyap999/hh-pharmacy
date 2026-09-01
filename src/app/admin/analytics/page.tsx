'use client'

import { BarChart3, TrendingUp, DollarSign, Award, Users, ShoppingBag } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Sales &amp; Financial Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Track daily revenue, profit margins, high demand categories, and top selling medicines
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Monthly Revenue</p>
          <p className="font-poppins font-bold text-2xl text-gray-900 mt-1">₹1,45,800</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18.4% from last month
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Estimated Gross Margin</p>
          <p className="font-poppins font-bold text-2xl text-teal-700 mt-1">₹42,280</p>
          <span className="text-[10px] text-teal-600 font-semibold mt-1 block">~29% average margin</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Orders Delivered</p>
          <p className="font-poppins font-bold text-2xl text-gray-900 mt-1">348</p>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">94% on-time delivery</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Repeat Customers</p>
          <p className="font-poppins font-bold text-2xl text-purple-700 mt-1">68%</p>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 block">High brand loyalty</span>
        </div>
      </div>

      {/* Top Selling Medicines & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Selling Medicines This Month
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Dolo 650mg Tablet', units: '1,450 units', revenue: '₹43,500', bar: '95%' },
              { name: 'Crocin 650mg Tablet', units: '980 units', revenue: '₹34,300', bar: '75%' },
              { name: 'Combiflam Tablet', units: '720 units', revenue: '₹22,800', bar: '60%' },
              { name: 'Limcee 500mg (Vitamin C)', units: '540 units', revenue: '₹18,900', bar: '45%' },
              { name: 'Digene Gel 200ml', units: '310 units', revenue: '₹14,200', bar: '35%' },
            ].map((med, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-800">
                    {i + 1}. {med.name}
                  </span>
                  <span className="text-teal-700">{med.revenue}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: med.bar }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h2 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            Category Revenue Share
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Pain Relief & Fever', share: '38%', color: 'bg-red-500' },
              { name: 'Antibiotics (Schedule H)', share: '24%', color: 'bg-purple-500' },
              { name: 'Vitamins & Supplements', share: '18%', color: 'bg-emerald-500' },
              { name: 'Digestive & Acidity Care', share: '12%', color: 'bg-blue-500' },
              { name: 'Ayurvedic & Baby Care', share: '8%', color: 'bg-amber-500' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-900">{cat.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
