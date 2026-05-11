'use client'

import { useState, useEffect } from 'react'
import { BellRing, X } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { useT } from '@/shared/hooks/useT'

export function PushAlertsCard() {
  const t = useT()
  const [show, setShow] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default' && !localStorage.getItem('hide_push_card')) {
          setShow(true)
        }
      }
    })
  }, [])

  const handleSubscribe = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // Kích hoạt logic lưu web-push subscription ở đây
      setShow(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('hide_push_card', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-lg dark:from-sky-600 dark:to-blue-800">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner">
          <BellRing size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold tracking-wide text-white">{t.pushCard.title}</h3>
          <p className="mt-1.5 pr-2 text-sm leading-relaxed text-sky-100">{t.pushCard.desc}</p>
          <button
            onClick={handleSubscribe}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-sky-600 shadow-sm transition-transform active:scale-95 hover:scale-105 dark:bg-slate-900 dark:text-sky-400"
          >
            {t.pushCard.btn}
          </button>
        </div>
      </div>
    </Card>
  )
}