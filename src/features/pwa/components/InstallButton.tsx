'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

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
        title="Cài app lên màn hình chính"
        type="button"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Cài app</span>
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
                  📲 Cài trên iPhone / iPad
                </h3>
                <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed">
                  <li>
                    Mở menu <strong>Chia sẻ</strong> của Safari.
                  </li>
                  <li>
                    Chọn <strong>"Thêm vào Màn hình chính"</strong>.
                  </li>
                  <li>
                    Chạm <strong>"Thêm"</strong> để hoàn tất.
                  </li>
                </ol>
                <p className="mt-3 text-xs text-slate-500">Lưu ý: phải dùng Safari trên iOS.</p>
              </>
            ) : (
              <>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">📲 Cài trên Android</h3>
                <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed">
                  <li>
                    Mở menu <strong>⋮</strong> trên trình duyệt.
                  </li>
                  <li>
                    Chọn <strong>"Cài ứng dụng"</strong> / <strong>"Thêm vào Màn hình chính"</strong>
                    .
                  </li>
                  <li>Xác nhận để cài.</li>
                </ol>
                <p className="mt-3 text-xs text-slate-500">
                  Cần Chrome/Edge mới và trang HTTPS.
                </p>
              </>
            )}
            <button
              onClick={() => setHint(null)}
              className="mt-4 w-full rounded-xl bg-sky-600 py-2 font-semibold text-white hover:bg-sky-700"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
