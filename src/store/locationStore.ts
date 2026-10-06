import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserDeliveryLocation {
  address: string
  subLocality: string
  pincode: string
  lat: number
  lng: number
  tag?: string
}

interface LocationStoreState {
  currentLocation: UserDeliveryLocation
  recentLocations: string[]
  setLocation: (loc: Partial<UserDeliveryLocation> & { address: string }) => void
  addRecent: (address: string) => void
}

const DEFAULT_LOCATION: UserDeliveryLocation = {
  address: 'Ghookna Mode, Gali No-03, Meerut Road, Ghaziabad',
  subLocality: 'Ghookna Mode, Ghaziabad',
  pincode: '201003',
  lat: 28.6947,
  lng: 77.4422,
  tag: 'Pharmacy Hub',
}

export const useLocationStore = create<LocationStoreState>()(
  persist(
    (set, get) => ({
      currentLocation: DEFAULT_LOCATION,
      recentLocations: [
        'Ghookna Mode, Meerut Road, Ghaziabad - 201003',
        'Raj Nagar Extension, Ghaziabad - 201017',
        'Sanjay Nagar (Sector 23), Ghaziabad - 201002',
        'Kavi Nagar, Ghaziabad - 201002',
      ],

      setLocation: (loc) =>
        set((state) => {
          const updated: UserDeliveryLocation = {
            address: loc.address,
            subLocality: loc.subLocality || loc.address.split(',')[0].trim(),
            pincode: loc.pincode || state.currentLocation.pincode || '201003',
            lat: loc.lat || state.currentLocation.lat || 28.6947,
            lng: loc.lng || state.currentLocation.lng || 77.4422,
            tag: loc.tag || 'Custom',
          }

          const filteredRecent = state.recentLocations.filter((a) => a !== loc.address)
          return {
            currentLocation: updated,
            recentLocations: [loc.address, ...filteredRecent].slice(0, 8),
          }
        }),

      addRecent: (address) =>
        set((state) => {
          const filtered = state.recentLocations.filter((a) => a !== address)
          return {
            recentLocations: [address, ...filtered].slice(0, 8),
          }
        }),
    }),
    {
      name: 'hh-pharmacy-delivery-location',
    }
  )
)
