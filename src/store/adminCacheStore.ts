import { create } from 'zustand'

export interface AdminStats {
  totalMedicines: number
  activeMedicines: number
  totalOrders: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockCount: number
  outOfStockCount: number
  expiringBatches: number
  expiredBatches: number
  recentOrders: any[]
  expiringSoon: any[]
}

interface AdminCacheState {
  // Data
  stats: AdminStats | null
  statsTimestamp: number
  medicines: any[]
  medicinesTimestamp: number
  orders: any[]
  ordersTimestamp: number
  stock: any[]
  stockTimestamp: number
  expiry: any[]
  expiryTimestamp: number

  // Loading states
  loading: Record<string, boolean>
  refreshing: Record<string, boolean>

  // Actions
  loadStats: (force?: boolean) => Promise<AdminStats | null>
  loadMedicines: (force?: boolean) => Promise<any[]>
  loadOrders: (force?: boolean) => Promise<any[]>
  loadStock: (force?: boolean) => Promise<any[]>
  loadExpiry: (force?: boolean) => Promise<any[]>

  // Local optimistic mutators
  updateOrderStatusLocal: (orderId: number, status: string) => void
  updatePrescriptionStatusLocal: (orderId: number, status: string) => void
  toggleMedicineActiveLocal: (medicineId: number, newActive: boolean) => void
  invalidate: (key?: 'stats' | 'medicines' | 'orders' | 'stock' | 'expiry' | 'all') => void
}

const STATS_TTL = 20 * 1000 // 20 seconds
const MEDICINES_TTL = 45 * 1000 // 45 seconds
const ORDERS_TTL = 15 * 1000 // 15 seconds
const STOCK_TTL = 45 * 1000 // 45 seconds
const EXPIRY_TTL = 45 * 1000 // 45 seconds

export const useAdminCacheStore = create<AdminCacheState>((set, get) => ({
  stats: null,
  statsTimestamp: 0,
  medicines: [],
  medicinesTimestamp: 0,
  orders: [],
  ordersTimestamp: 0,
  stock: [],
  stockTimestamp: 0,
  expiry: [],
  expiryTimestamp: 0,

  loading: {
    stats: false,
    medicines: false,
    orders: false,
    stock: false,
    expiry: false,
  },
  refreshing: {
    stats: false,
    medicines: false,
    orders: false,
    stock: false,
    expiry: false,
  },

  loadStats: async (force = false) => {
    const { stats, statsTimestamp } = get()
    const isFresh = Date.now() - statsTimestamp < STATS_TTL

    if (stats && isFresh && !force) {
      return stats
    }

    const hasCached = !!stats
    set((s) => ({
      loading: { ...s.loading, stats: !hasCached },
      refreshing: { ...s.refreshing, stats: true },
    }))

    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        set({
          stats: data,
          statsTimestamp: Date.now(),
        })
        return data
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
    } finally {
      set((s) => ({
        loading: { ...s.loading, stats: false },
        refreshing: { ...s.refreshing, stats: false },
      }))
    }
    return get().stats
  },

  loadMedicines: async (force = false) => {
    const { medicines, medicinesTimestamp } = get()
    const isFresh = Date.now() - medicinesTimestamp < MEDICINES_TTL

    if (medicines.length > 0 && isFresh && !force) {
      return medicines
    }

    const hasCached = medicines.length > 0
    set((s) => ({
      loading: { ...s.loading, medicines: !hasCached },
      refreshing: { ...s.refreshing, medicines: true },
    }))

    try {
      const res = await fetch('/api/medicines?limit=200')
      if (res.ok) {
        const data = await res.json()
        const list = data.medicines || []
        set({
          medicines: list,
          medicinesTimestamp: Date.now(),
        })
        return list
      }
    } catch (err) {
      console.error('Failed to load medicines:', err)
    } finally {
      set((s) => ({
        loading: { ...s.loading, medicines: false },
        refreshing: { ...s.refreshing, medicines: false },
      }))
    }
    return get().medicines
  },

  loadOrders: async (force = false) => {
    const { orders, ordersTimestamp } = get()
    const isFresh = Date.now() - ordersTimestamp < ORDERS_TTL

    if (orders.length > 0 && isFresh && !force) {
      return orders
    }

    const hasCached = orders.length > 0
    set((s) => ({
      loading: { ...s.loading, orders: !hasCached },
      refreshing: { ...s.refreshing, orders: true },
    }))

    try {
      const res = await fetch('/api/orders?admin=true')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        set({
          orders: list,
          ordersTimestamp: Date.now(),
        })
        return list
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      set((s) => ({
        loading: { ...s.loading, orders: false },
        refreshing: { ...s.refreshing, orders: false },
      }))
    }
    return get().orders
  },

  loadStock: async (force = false) => {
    const { stock, stockTimestamp } = get()
    const isFresh = Date.now() - stockTimestamp < STOCK_TTL

    if (stock.length > 0 && isFresh && !force) {
      return stock
    }

    const hasCached = stock.length > 0
    set((s) => ({
      loading: { ...s.loading, stock: !hasCached },
      refreshing: { ...s.refreshing, stock: true },
    }))

    try {
      const res = await fetch('/api/stock')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        set({
          stock: list,
          stockTimestamp: Date.now(),
        })
        return list
      }
    } catch (err) {
      console.error('Failed to load stock:', err)
    } finally {
      set((s) => ({
        loading: { ...s.loading, stock: false },
        refreshing: { ...s.refreshing, stock: false },
      }))
    }
    return get().stock
  },

  loadExpiry: async (force = false) => {
    const { expiry, expiryTimestamp } = get()
    const isFresh = Date.now() - expiryTimestamp < EXPIRY_TTL

    if (expiry.length > 0 && isFresh && !force) {
      return expiry
    }

    const hasCached = expiry.length > 0
    set((s) => ({
      loading: { ...s.loading, expiry: !hasCached },
      refreshing: { ...s.refreshing, expiry: true },
    }))

    try {
      const res = await fetch('/api/expiry')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        set({
          expiry: list,
          expiryTimestamp: Date.now(),
        })
        return list
      }
    } catch (err) {
      console.error('Failed to load expiry:', err)
    } finally {
      set((s) => ({
        loading: { ...s.loading, expiry: false },
        refreshing: { ...s.refreshing, expiry: false },
      }))
    }
    return get().expiry
  },

  updateOrderStatusLocal: (orderId, status) => {
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      stats: s.stats
        ? {
            ...s.stats,
            recentOrders: s.stats.recentOrders.map((o) =>
              o.id === orderId ? { ...o, status } : o
            ),
          }
        : null,
    }))
  },

  updatePrescriptionStatusLocal: (orderId, status) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === orderId ? { ...o, prescriptionStatus: status } : o
      ),
    }))
  },

  toggleMedicineActiveLocal: (medicineId, newActive) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === medicineId ? { ...m, isActive: newActive } : m
      ),
    }))
  },

  invalidate: (key = 'all') => {
    if (key === 'all') {
      set({
        statsTimestamp: 0,
        medicinesTimestamp: 0,
        ordersTimestamp: 0,
        stockTimestamp: 0,
        expiryTimestamp: 0,
      })
    } else {
      set({ [`${key}Timestamp`]: 0 } as any)
    }
  },
}))
