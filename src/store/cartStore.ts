import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  mrp: number
  unitType: string
  unitsPerPack: number
  requiresPrescription: boolean
  quantity: number
  quantityType: 'full_pack' | 'loose_units'
  looseUnitCount?: number
  imageUrl?: string | null
}

interface CartStore {
  items: CartItem[]
  prescriptionFile: string | null
  addItem: (item: Omit<CartItem, 'quantity' | 'quantityType'> & { quantity?: number; quantityType?: 'full_pack' | 'loose_units'; looseUnitCount?: number }) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  updateLooseUnits: (id: number, count: number) => void
  toggleQuantityType: (id: number) => void
  setPrescription: (url: string | null) => void
  clearCart: () => void
  total: () => number
  hasPrescriptionRequired: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      prescriptionFile: null,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          const isLoose = item.quantityType === 'loose_units'
          if (existing) {
            if (isLoose) {
              const newCount = (existing.looseUnitCount || 0) + (item.looseUnitCount || 1)
              return {
                items: state.items.map((i) =>
                  i.id === item.id
                    ? { ...i, quantityType: 'loose_units', looseUnitCount: newCount }
                    : i
                ),
              }
            }
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: item.quantity || 1,
                quantityType: item.quantityType || 'full_pack',
                looseUnitCount: isLoose ? item.looseUnitCount || 4 : undefined,
              },
            ],
          }
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      updateLooseUnits: (id, count) =>
        set((state) => ({
          items: count <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) =>
                i.id === id
                  ? { ...i, quantityType: 'loose_units', looseUnitCount: count }
                  : i
              ),
        })),

      toggleQuantityType: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i
            if (i.quantityType === 'full_pack') {
              const defaultLoose = Math.max(1, Math.min(i.unitsPerPack, 4))
              return { ...i, quantityType: 'loose_units', looseUnitCount: defaultLoose }
            } else {
              return { ...i, quantityType: 'full_pack', quantity: 1 }
            }
          }),
        })),

      setPrescription: (url) => set({ prescriptionFile: url }),

      clearCart: () => set({ items: [], prescriptionFile: null }),

      total: () => {
        const { items } = get()
        return items.reduce((sum, item) => {
          const unitPrice = item.quantityType === 'loose_units'
            ? item.price / item.unitsPerPack
            : item.price
          const units = item.quantityType === 'loose_units'
            ? (item.looseUnitCount || 1)
            : item.quantity
          return sum + unitPrice * units
        }, 0)
      },

      hasPrescriptionRequired: () => get().items.some((i) => i.requiresPrescription),
    }),
    { name: 'hh-pharmacy-cart' }
  )
)
