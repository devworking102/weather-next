'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useT } from '@/shared/hooks/useT'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [hint, setHint] = useState<'ios' | 'android' | null>(null)
  const [ua, setUa] = useState('')

  useEffect(() => {
    queueMicrotask(() => {
      setUa(typeof navigator !== 'undefined' ? navigator.userAgent : '')
    })
    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    function onInstalled() {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const isIos = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isMobile = isIos || isAndroid || /mobile/i.test(ua)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS-only
      window.navigator.standalone === true)

  const t = useT()

  if (installed || isStandalone) return null
  if (!deferred && !isMobile) return null

  async function onClick() {
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferred(null)
      return
    }
    setHint(isIos ? 'ios' : 'android')
  }

  return (
    <>
      <button
        onClick={onClick}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
        title={t.install.buttonTitle}
        type="button"
      >
        <Download size={14} />
        <span className="hidden sm:inline">{t.install.buttonLabel}</span>
      </button>

      <Dialog open={hint !== null} onOpenChange={(open) => !open && setHint(null)}>
        <DialogContent
          hideClose
          className="top-auto bottom-0 left-1/2 max-h-[min(90dvh,640px)] w-[calc(100%-1.25rem)] max-w-sm -translate-x-1/2 translate-y-0 rounded-2xl rounded-b-none border-t border-t-white/20 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:bottom-auto sm:top-1/2 sm:max-h-[min(90vh,720px)] sm:w-full sm:max-w-lg sm:-translate-y-1/2 sm:rounded-2xl sm:border-t-0 sm:pb-6 sm:pt-6"
        >
          {hint === 'ios' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{t.install.iosTitle}</DialogTitle>
                <DialogDescription className="sr-only">Hướng dẫn thêm Trời Hôm Nay vào màn hình chính trên iOS.</DialogDescription>
              </DialogHeader>
              <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {t.install.iosSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.install.iosNote}</p>
            </>
          ) : hint === 'android' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">{t.install.androidTitle}</DialogTitle>
                <DialogDescription className="sr-only">Hướng dẫn thêm Trời Hôm Nay vào màn hình chính trên Android.</DialogDescription>
              </DialogHeader>
              <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {t.install.androidSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.install.androidNote}</p>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setHint(null)}
            className="mt-2 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            {t.install.dismiss}
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
