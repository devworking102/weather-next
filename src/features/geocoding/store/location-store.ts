import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GeoLocation } from '@/features/geocoding/types'

interface LocationState {
  current: GeoLocation | null
  setCurrent: (loc: GeoLocation | null) => void
  // Dấu hiệu người dùng đã chọn location thủ công (không override tự động nữa).
  pinned: boolean
  setPinned: (v: boolean) => void
  /** Tối đa 6 địa điểm tìm gần đây (định danh theo lat/lon). */
  recentLocations: GeoLocation[]
  addRecentLocation: (loc: GeoLocation) => void
}

function locKey(l: GeoLocation) {
  return `${l.latitude.toFixed(4)},${l.longitude.toFixed(4)}`
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      current: null,
      pinned: false,
      recentLocations: [],
      setCurrent: (loc) => set({ current: loc }),
      setPinned: (v) => set({ pinned: v }),
      addRecentLocation: (loc) =>
        set((s) => {
          const k = locKey(loc)
          const rest = s.recentLocations.filter((x) => locKey(x) !== k)
          return { recentLocations: [loc, ...rest].slice(0, 6) }
        }),
    }),
    {
      name: 'weather-location',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        current: s.current,
        pinned: s.pinned,
        recentLocations: s.recentLocations,
      }),
    },
  ),
)
