'use client'

import { useState } from 'react'
import { Card } from '@/shared/ui/Card'
import { useLocationStore } from '@/features/geocoding/store/location-store'
import { useT } from '@/shared/hooks/useT'

type Theme = 'auto' | 'light' | 'dark'
type Units = 'celsius' | 'fahrenheit'

const WIDGET_HEIGHTS: Record<string, number> = { compact: 180, standard: 240 }

export function WidgetTab() {
  const location = useLocationStore((s) => s.current)
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<Theme>('auto')
  const [units, setUnits] = useState<Units>('celsius')
  const [size, setSize] = useState<'compact' | 'standard'>('compact')

  const THEMES: { value: Theme; label: string }[] = [
    { value: 'auto', label: t.widget.themeAuto },
    { value: 'light', label: t.widget.themeLight },
    { value: 'dark', label: t.widget.themeDark },
  ]

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://weather.app'
  const lat = location?.latitude?.toFixed(4) ?? ''
  const lon = location?.longitude?.toFixed(4) ?? ''
  const name = location?.name ?? 'Vị trí của bạn'
  const height = WIDGET_HEIGHTS[size]

  const embedSrc = lat && lon
    ? `/widget/embed?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&theme=${theme}&units=${units}`
    : ''

  const iframeCode = `<iframe
  src="${baseUrl}/widget/embed?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&theme=${theme}&units=${units}"
  width="360"
  height="${height}"
  style="border:0;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.12)"
  title="Weather widget — ${name}"
  allowtransparency="true"
></iframe>`

  async function copy() {
    try {
      await navigator.clipboard.writeText(iframeCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Config */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.widget.configTitle}
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Theme */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t.widget.themeLabel}</p>
            <div className="flex gap-1">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-white/5'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Units */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t.widget.unitsLabel}</p>
            <div className="flex gap-1">
              {(['celsius', 'fahrenheit'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnits(u)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    units === u
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-white/5'
                  }`}
                >
                  {u === 'celsius' ? '°C Celsius' : '°F Fahrenheit'}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{t.widget.sizeLabel}</p>
            <div className="flex gap-1">
              {(['compact', 'standard'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    size === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-white/5'
                  }`}
                >
                  {s === 'compact' ? `${t.widget.sizeCompact} (${WIDGET_HEIGHTS.compact}px)` : `${t.widget.sizeStandard} (${WIDGET_HEIGHTS.standard}px)`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Embed code */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t.widget.embedCodeTitle}
          </h3>
        </div>
        {lat && lon ? (
          <>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              {t.widget.embedHint}
            </p>
            <div className="relative">
              <pre className="scrollbar-thin overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
                <code>{iframeCode}</code>
              </pre>
              <button
                onClick={copy}
                className="absolute right-3 top-3 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/20"
                type="button"
              >
                {copied ? `✓ ${t.widget.copied}` : t.widget.copy}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">{t.widget.noLocation}</p>
        )}
      </Card>

      {/* Preview */}
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.widget.previewTitle}
        </h3>
        {embedSrc ? (
          <iframe
            key={embedSrc}
            src={embedSrc}
            width="360"
            height={height}
            style={{ border: 0, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.12)' }}
            title="Preview widget"
          />
        ) : (
          <p className="text-sm text-slate-400">{t.widget.noPreview}</p>
        )}
      </Card>
    </div>
  )
}
