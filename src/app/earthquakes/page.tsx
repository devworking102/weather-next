import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { EarthquakeList } from '@/features/earthquakes/components/EarthquakeList'

export const metadata: Metadata = { title: 'Hoạt động địa chấn' }

export default function EarthquakesPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-6 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Hoạt động địa chấn</h1>
          <p className="text-sm text-slate-500">
            Các trận động đất M≥4 trong vòng 1500 km từ vị trí hiện tại (nguồn: USGS).
          </p>
        </header>
        <EarthquakeList />
      </main>
    </>
  )
}
