import type { Metadata } from 'next'
import Link from 'next/link'
import { TopBar } from '@/shared/ui/TopBar'

export const metadata: Metadata = {
  title: 'Đọc thời tiết (sắp có)',
  description: 'Tính năng giọng nói / TTS cho thời tiết.',
}

export default function VoicePlaceholderPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto container max-w-lg p-6 pb-28 md:pb-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đọc thời tiết (sắp có)</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Tính năng giọng nói và TTS sẽ được bổ sung sau khi tích hợp nhà cung cấp (OpenAI / Vbee / ElevenLabs…).
        </p>
        <Link href="/weather" className="mt-6 inline-block text-sky-600 underline dark:text-sky-400">
          ← Về thời tiết
        </Link>
      </main>
    </>
  )
}
