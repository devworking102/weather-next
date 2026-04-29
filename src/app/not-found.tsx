'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/Button'
import { useT } from '@/shared/hooks/useT'

export default function NotFound() {
  const t = useT()
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl">🌫️</div>
      <h1 className="text-2xl font-bold">{t.notFound.title}</h1>
      <p className="text-sm text-slate-500">{t.notFound.hint}</p>
      <Link href="/">
        <Button>{t.notFound.goHome}</Button>
      </Link>
    </main>
  )
}
