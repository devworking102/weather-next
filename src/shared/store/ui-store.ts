import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type TempUnit = 'c' | 'f'
export type WindUnit = 'kmh' | 'mph' | 'ms'
export type Locale = 'vi' | 'en'
export type WeatherTabId =
  | 'today'
  | 'hourly'
  | 'week'
  | 'daily'
  | 'month'
  | 'aqi'
  | 'health'
  | 'alerts'
  | 'wind'
  | 'news'
  | 'widget'

export interface FavoriteLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

interface UiState {
  theme: ThemeMode
  unit: TempUnit
  windUnit: WindUnit
  locale: Locale
  notifyEnabled: boolean
  favorites: FavoriteLocation[]
  weatherTab: WeatherTabId
  chatOpen: boolean
  setTheme: (t: ThemeMode) => void
  setUnit: (u: TempUnit) => void
  setWindUnit: (u: WindUnit) => void
  setLocale: (l: Locale) => void
  setNotifyEnabled: (v: boolean) => void
  addFavorite: (loc: FavoriteLocation) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
  setWeatherTab: (t: WeatherTabId) => void
  setChatOpen: (v: boolean) => void
  toggleChat: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      unit: 'c',
      windUnit: 'kmh',
      locale: 'vi',
      notifyEnabled: false,
      favorites: [],
      weatherTab: 'today',
      chatOpen: false,
      setTheme: (t) => set({ theme: t }),
      setUnit: (u) => set({ unit: u }),
      setWindUnit: (u) => set({ windUnit: u }),
      setLocale: (l) => set({ locale: l }),
      setNotifyEnabled: (v) => set({ notifyEnabled: v }),
      addFavorite: (loc) => {
        const existing = get().favorites
        if (existing.some((f) => f.id === loc.id)) return
        set({ favorites: [...existing, loc] })
      },
      removeFavorite: (id) => set({ favorites: get().favorites.filter((f) => f.id !== id) }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      setWeatherTab: (t) => set({ weatherTab: t }),
      setChatOpen: (v) => set({ chatOpen: v }),
      toggleChat: () => set({ chatOpen: !get().chatOpen }),
    }),
    {
      name: 'weather-ui-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        unit: s.unit,
        windUnit: s.windUnit,
        locale: s.locale,
        notifyEnabled: s.notifyEnabled,
        favorites: s.favorites,
      }),
    },
  ),
)

export function windLabel(u: WindUnit): string {
  return u === 'mph' ? 'mph' : u === 'ms' ? 'm/s' : 'km/h'
}

// Open-Meteo trả km/h. Convert sang đơn vị hiển thị.
export function convertWind(kmh: number, to: WindUnit): number {
  if (to === 'mph') return kmh * 0.621371
  if (to === 'ms') return kmh / 3.6
  return kmh
}
