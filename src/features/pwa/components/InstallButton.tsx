'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { useT } from '@/shared/hooks/useT'

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
    setUa(typeof navigator !== 'undefined' ? navigator.userAgent : '')
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
        className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
        title={t.install.buttonTitle}
        type="button"
      >
        <Download size={14} />
        <span className="hidden sm:inline">{t.install.buttonLabel}</span>
      </button>

      {hint ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHint(null)
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-800 shadow-2xl dark:bg-slate-900 dark:text-slate-100">
            {hint === 'ios' ? (
              <>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  {t.install.iosTitle}
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed">
                  {t.install.iosSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                <p className="mt-3 text-xs text-slate-500">{t.install.iosNote}</p>
              </>
            ) : (
              <>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">{t.install.androidTitle}</h3>
                <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed">
                  {t.install.androidSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                <p className="mt-3 text-xs text-slate-500">{t.install.androidNote}</p>
              </>
            )}
            <button
              onClick={() => setHint(null)}
              className="mt-4 w-full rounded-xl bg-sky-600 py-2 font-semibold text-white hover:bg-sky-700"
            >
              {t.install.dismiss}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
