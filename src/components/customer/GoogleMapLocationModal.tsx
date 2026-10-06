'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Compass,
  Clock,
  Sparkles,
  Building,
  Home,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLocationStore, UserDeliveryLocation } from '@/store/locationStore'

interface GoogleMapLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelected?: (location: UserDeliveryLocation) => void
}

// Comprehensive database of Ghaziabad & NCR delivery localities with Pincodes & Lat/Lng
const GHAZIABAD_LOCALITIES = [
  // Near Ghookna Mode (15-30 Mins)
  {
    name: 'Ghookna Mode, Meerut Road',
    address: 'Plot No-7, Kh No-606, Ghookna Mode, Meerut Road, Ghaziabad',
    pincode: '201003',
    zone: '⚡ Super Fast (15-30 mins)',
    lat: 28.6947,
    lng: 77.4422,
    category: 'near',
  },
  {
    name: 'Gali No-3, Ghookna',
    address: 'Gali No-03, Near Primary School, Ghookna Mode, Ghaziabad',
    pincode: '201003',
    zone: '⚡ Super Fast (15-30 mins)',
    lat: 28.6955,
    lng: 77.4431,
    category: 'near',
  },
  {
    name: 'Nandgram',
    address: 'Nandgram Main Market & A-Block, Ghaziabad',
    pincode: '201003',
    zone: '⚡ Super Fast (15-30 mins)',
    lat: 28.7012,
    lng: 77.4468,
    category: 'near',
  },
  {
    name: 'Sihani Gate & Sihani Village',
    address: 'Sihani Gate Chauraha, Meerut Road, Ghaziabad',
    pincode: '201001',
    zone: '⚡ Super Fast (15-30 mins)',
    lat: 28.6821,
    lng: 77.4389,
    category: 'near',
  },
  {
    name: 'Sewa Nagar',
    address: 'Sewa Nagar, Near Railway Crossing, Meerut Road, Ghaziabad',
    pincode: '201003',
    zone: '⚡ Super Fast (15-30 mins)',
    lat: 28.6892,
    lng: 77.4411,
    category: 'near',
  },
  {
    name: 'Patel Nagar',
    address: 'Patel Nagar 1st & 2nd, Near New Bus Stand, Ghaziabad',
    pincode: '201001',
    zone: '⚡ Super Fast (20-35 mins)',
    lat: 28.6754,
    lng: 77.4312,
    category: 'near',
  },

  // Prime Residential Colonies (30-45 Mins)
  {
    name: 'Sanjay Nagar (Sector 23)',
    address: 'Sector 23, Sanjay Nagar, Near Combined Hospital, Ghaziabad',
    pincode: '201002',
    zone: '🚗 Fast Home Delivery (30-45 mins)',
    lat: 28.6922,
    lng: 77.4589,
    category: 'prime',
  },
  {
    name: 'Raj Nagar (Sectors 1-14)',
    address: 'Raj Nagar Sector 10 & ALT Centre Road, Ghaziabad',
    pincode: '201002',
    zone: '🚗 Fast Home Delivery (30-45 mins)',
    lat: 28.6854,
    lng: 77.4512,
    category: 'prime',
  },
  {
    name: 'Kavi Nagar',
    address: 'Kavi Nagar C-Block Market & Diamond Palace, Ghaziabad',
    pincode: '201002',
    zone: '🚗 Fast Home Delivery (30-45 mins)',
    lat: 28.6698,
    lng: 77.4554,
    category: 'prime',
  },
  {
    name: 'Shastri Nagar',
    address: 'Shastri Nagar Block C & D, Near Mahamaya Sports Stadium, Ghaziabad',
    pincode: '201002',
    zone: '🚗 Fast Home Delivery (35-50 mins)',
    lat: 28.6612,
    lng: 77.4621,
    category: 'prime',
  },
  {
    name: 'Govindpuram',
    address: 'Govindpuram Main Market, Blocks A to J, Ghaziabad',
    pincode: '201013',
    zone: '🚗 Fast Home Delivery (35-50 mins)',
    lat: 28.6891,
    lng: 77.4912,
    category: 'prime',
  },
  {
    name: 'Swarn Jayanti Puram',
    address: 'Swarn Jayanti Puram, Near Hapur Chungi Road, Ghaziabad',
    pincode: '201013',
    zone: '🚗 Fast Home Delivery (35-50 mins)',
    lat: 28.6812,
    lng: 77.4876,
    category: 'prime',
  },
  {
    name: 'Chiranjiv Vihar',
    address: 'Chiranjiv Vihar, Avantika Colony, Ghaziabad',
    pincode: '201002',
    zone: '🚗 Fast Home Delivery (30-45 mins)',
    lat: 28.6781,
    lng: 77.4698,
    category: 'prime',
  },

  // High Rises & Extensions (45-60 Mins)
  {
    name: 'Raj Nagar Extension (High-Rises)',
    address: 'Raj Nagar Extension, Meerut Bypass Road, Ghaziabad',
    pincode: '201017',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.7245,
    lng: 77.4289,
    category: 'extension',
  },
  {
    name: 'Morta & Morti Village',
    address: 'Morta, Delhi-Meerut Expressway / Road, Ghaziabad',
    pincode: '201003',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.7312,
    lng: 77.4354,
    category: 'extension',
  },
  {
    name: 'Crossings Republik',
    address: 'Crossings Republik Townships (GH-07, Panchsheel, Saviour), Ghaziabad',
    pincode: '201016',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6312,
    lng: 77.4412,
    category: 'extension',
  },
  {
    name: 'Wave City / NH-24',
    address: 'Wave City Sector 2 & 3, NH-24 Bypass, Ghaziabad',
    pincode: '201015',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6542,
    lng: 77.5121,
    category: 'extension',
  },

  // Trans-Hindon Belt (45-60 Mins)
  {
    name: 'Indirapuram',
    address: 'Vaibhav Khand, Ahinsa Khand & Nyay Khand, Indirapuram, Ghaziabad',
    pincode: '201014',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6412,
    lng: 77.3712,
    category: 'trans_hindon',
  },
  {
    name: 'Vaishali',
    address: 'Sector 4 & 5, Near Vaishali Metro Station, Ghaziabad',
    pincode: '201010',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6489,
    lng: 77.3412,
    category: 'trans_hindon',
  },
  {
    name: 'Vasundhara',
    address: 'Sector 1 to Sector 19, Vasundhara, Ghaziabad',
    pincode: '201012',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6612,
    lng: 77.3789,
    category: 'trans_hindon',
  },
  {
    name: 'Mohan Nagar',
    address: 'Mohan Nagar Chauraha & World Square Mall, Ghaziabad',
    pincode: '201007',
    zone: '⚡ 60-Min Express Delivery',
    lat: 28.6791,
    lng: 77.3912,
    category: 'trans_hindon',
  },
]

export function GoogleMapLocationModal({
  isOpen,
  onClose,
  onLocationSelected,
}: GoogleMapLocationModalProps) {
  const { currentLocation, setLocation, recentLocations } = useLocationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'near' | 'prime' | 'extension' | 'trans_hindon'>('all')
  const [isDetectingGps, setIsDetectingGps] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<UserDeliveryLocation>(currentLocation)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')
  const [liveSearchResults, setLiveSearchResults] = useState<any[]>([])
  const [isSearchingOnline, setIsSearchingOnline] = useState(false)

  // Sync selected location when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLoc(currentLocation)
      setSearchQuery('')
      setLiveSearchResults([])
    }
  }, [isOpen, currentLocation])

  // Online reverse/forward search debounce for any custom address typed
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setLiveSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true)
      try {
        const queryWithContext = `${searchQuery.trim()}, Ghaziabad, Uttar Pradesh, India`
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryWithContext
        )}&addressdetails=1&limit=5`

        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
        if (res.ok) {
          const data = await res.json()
          setLiveSearchResults(data)
        }
      } catch (err) {
        console.warn('Live map search fallback:', err)
      } finally {
        setIsSearchingOnline(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  // GPS Auto-detect via Browser Geolocation + Reverse Geocoding
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }

    setIsDetectingGps(true)
    toast('Accessing live Google GPS satellite location...', { icon: '🛰️' })

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        try {
          // OpenStreetMap free reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          )

          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}

            const subLocality =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.commercial ||
              addr.road ||
              'Current GPS Location'

            const city = addr.city || addr.town || addr.county || 'Ghaziabad'
            const postcode = addr.postcode || '201003'
            const fullAddress = `${subLocality}, ${city} - ${postcode}`

            const detectedLocation: UserDeliveryLocation = {
              address: fullAddress,
              subLocality: `${subLocality}, ${city}`,
              pincode: postcode,
              lat,
              lng,
              tag: 'GPS Live Location',
            }

            setSelectedLoc(detectedLocation)
            toast.success(`📍 Live GPS Detected: ${subLocality}, ${city}!`, { duration: 4000 })
          } else {
            // Fallback with coordinates
            setSelectedLoc({
              address: `Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Ghaziabad`,
              subLocality: 'Live GPS Pin',
              pincode: '201003',
              lat,
              lng,
              tag: 'GPS Pin',
            })
            toast.success('📍 Live GPS coordinates locked!')
          }
        } catch {
          setSelectedLoc({
            address: `Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Ghaziabad`,
            subLocality: 'Live GPS Pin',
            pincode: '201003',
            lat,
            lng,
            tag: 'GPS Pin',
          })
          toast.success('📍 Live GPS coordinates locked!')
        } finally {
          setIsDetectingGps(false)
        }
      },
      (err) => {
        console.warn('GPS Error:', err)
        setIsDetectingGps(false)
        if (err.code === 1) {
          toast.error('Location permission was denied. Please allow location access in your browser or pick from list below.')
        } else {
          toast.error('GPS signal timed out. Please select your colony below.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  // Confirm selection
  const handleConfirmLocation = (locToSave?: UserDeliveryLocation) => {
    const target = locToSave || selectedLoc
    setLocation(target)
    if (onLocationSelected) {
      onLocationSelected(target)
    }
    toast.success(`Delivery address set to: ${target.subLocality || target.address}! 🚚`)
    onClose()
  }

  // Filter internal locality database
  const filteredLocalities = GHAZIABAD_LOCALITIES.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.pincode.includes(q)
    )
  })

  // Google Maps embed URL
  const mapCenterQuery = `${selectedLoc.lat || 28.6947},${selectedLoc.lng || 77.4422}`
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    selectedLoc.address || 'Ghookna Mode, Ghaziabad'
  )}&t=${mapType === 'satellite' ? 'k' : ''}&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Google 4-Color Stripe Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-emerald-500" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-base sm:text-lg text-gray-900 flex items-center gap-1.5">
                <span>Google Maps Delivery Location</span>
                <span className="text-[10px] bg-teal-50 text-teal-800 font-extrabold px-2 py-0.5 rounded-full border border-teal-200">
                  ⚡ 60-MIN RUSH
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Pin your live GPS position or choose your Ghaziabad &amp; NCR colony
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar + GPS Button */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-100 space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colony, sector, landmark, or pincode (e.g. Raj Nagar, Sanjay Nagar, 201002)..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-xs text-gray-900 rounded-2xl border border-gray-200 shadow-2xs focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons: Live GPS & Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleDetectGPS}
              disabled={isDetectingGps}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Detecting via Google GPS...' : '🎯 Use Current Location (GPS)'}</span>
            </button>

            {/* Map View Switcher */}
            <div className="inline-flex items-center bg-gray-200 p-0.5 rounded-xl text-[11px] font-semibold text-gray-700">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === 'roadmap' ? 'bg-white text-gray-900 shadow-3xs font-bold' : 'text-gray-600'
                }`}
              >
                🗺️ Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  mapType === 'satellite' ? 'bg-white text-gray-900 shadow-3xs font-bold' : 'text-gray-600'
                }`}
              >
                🛰️ Satellite
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Interactive Google Map Preview Container */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner h-48 sm:h-56">
            <iframe
              src={mapEmbedUrl}
              title="Google Maps Location View"
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Google Map Floating Marker Badge */}
            <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-xl px-2.5 py-1 text-[11px] shadow-sm flex items-center gap-1.5 font-bold text-gray-800 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Location Lock:</span>
              <span className="text-teal-700 font-extrabold max-w-48 truncate">
                {selectedLoc.subLocality || selectedLoc.address}
              </span>
            </div>

            {/* Map center marker overlay graphic */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative -translate-y-3 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <MapPin className="w-4 h-4 fill-white" />
                </div>
                <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
              </div>
            </div>

            {/* Map Open in Google Maps Full Tab */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedLoc.address || 'Ghookna Mode Ghaziabad'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-gray-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1 transition-all"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>

          {/* Currently Selected Location Summary Card */}
          <div className="p-3.5 bg-teal-50/80 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">
                  Delivery Destination
                </p>
                <p className="text-xs font-bold text-gray-900 leading-snug">
                  {selectedLoc.address}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                  <span className="bg-white px-2 py-0.5 rounded-md border border-teal-200 text-teal-800 font-bold">
                    Pincode: {selectedLoc.pincode}
                  </span>
                  <span className="text-emerald-700 font-semibold">
                    ✅ 60-Min Home Delivery Serviceable
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleConfirmLocation()}
              className="self-end sm:self-center bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Deliver Here</span>
            </button>
          </div>

          {/* Online Live Search Results (if typing custom location) */}
          {liveSearchResults.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                🌐 Online Google / OpenStreet Matches ({liveSearchResults.length})
              </p>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                {liveSearchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newLoc: UserDeliveryLocation = {
                        address: res.display_name,
                        subLocality: res.display_name.split(',')[0],
                        pincode: res.address?.postcode || '201003',
                        lat: parseFloat(res.lat),
                        lng: parseFloat(res.lon),
                        tag: 'Search Match',
                      }
                      setSelectedLoc(newLoc)
                      handleConfirmLocation(newLoc)
                    }}
                    className="w-full p-2.5 text-left hover:bg-teal-50/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">📍</span>
                      <span className="font-semibold text-gray-800 truncate max-w-md">
                        {res.display_name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-600">Select →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Category Filter Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                Select Ghaziabad &amp; NCR Locality ({filteredLocalities.length} Areas)
              </p>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'All Localities' },
                { id: 'near', label: '⚡ Near Ghookna (15m)' },
                { id: 'prime', label: '🏡 Prime Colonies' },
                { id: 'extension', label: '🏢 Extensions & NH-24' },
                { id: 'trans_hindon', label: '🏙️ Indirapuram & Vaishali' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Localities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredLocalities.map((item, idx) => {
                const isSelected = selectedLoc.address === item.address

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const newLoc: UserDeliveryLocation = {
                        address: item.address,
                        subLocality: item.name,
                        pincode: item.pincode,
                        lat: item.lat,
                        lng: item.lng,
                        tag: item.name,
                      }
                      setSelectedLoc(newLoc)
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.pincode}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{item.address}</p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-gray-100/80 flex items-center justify-between text-[10px]">
                      <span className="text-teal-700 font-semibold">{item.zone}</span>
                      {isSelected && (
                        <span className="text-teal-700 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleConfirmLocation()}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Set Delivery Location</span>
          </button>
        </div>
      </div>
    </div>
  )
}
