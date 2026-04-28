import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { GeoLocation } from '@/features/geocoding/types'

interface LocationState {
  current: GeoLocation | null
  setCurrent: (loc: GeoLocation | null) => void
  // Dấu hiệu người dùng đã chọn location thủ công (không override tự động nữa).
  pinned: boolean
  setPinned: (v: boolean) => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      current: null,
      pinned: false,
      setCurrent: (loc) => set({ current: loc }),
      setPinned: (v) => set({ pinned: v }),
    }),
    {
      name: 'weather-location',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ current: s.current, pinned: s.pinned }),
    },
  ),
)
