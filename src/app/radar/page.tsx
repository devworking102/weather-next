import type { Metadata } from 'next'
import { TopBar } from '@/shared/ui/TopBar'
import { RadarPageContent } from '@/features/radar/components/RadarPageContent'

export const metadata: Metadata = {
  title: 'Radar mưa',
  description: 'Radar RainViewer (OpenLayers) + Windy embed. Offline cache thời tiết qua service worker.',
}

export default function RadarPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container space-y-4 p-4 pb-28 md:space-y-6 md:p-6 md:pb-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">🌧️ Radar mưa</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            OpenLayers + tiles RainViewer (miễn phí) và tùy chọn Windy embed.
          </p>
        </header>
        <RadarPageContent />
      </main>
    </>
  )
}
