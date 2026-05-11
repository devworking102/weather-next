'use client'

import { Settings as Gear } from 'lucide-react'
import { useUiStore, type WindUnit, type TempUnit, type ThemeMode, type Locale } from '@/shared/store/ui-store'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { WebPushSetup } from '@/features/pwa/components/WebPushSetup'
import { useT } from '@/shared/hooks/useT'
import { cn } from '@/shared/lib/cn'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'

export function SettingsMenu() {
  const t = useT()

  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const tempUnit = useUiStore((s) => s.unit)
  const setUnit = useUiStore((s) => s.setUnit)
  const windUnit = useUiStore((s) => s.windUnit)
  const setWindUnit = useUiStore((s) => s.setWindUnit)
  const locale = useUiStore((s) => s.locale)
  const setLocale = useUiStore((s) => s.setLocale)
  const { enabled: notifyEnabled, permission, request, disable } = useNotifications()

  const THEMES: Array<{ key: ThemeMode; label: string }> = [
    { key: 'light', label: t.settings.themeLight },
    { key: 'dark', label: t.settings.themeDark },
    { key: 'system', label: t.settings.themeAuto },
  ]
  const TEMPS: Array<{ key: TempUnit; label: string }> = [
    { key: 'c', label: '°C' },
    { key: 'f', label: '°F' },
  ]
  const WINDS: Array<{ key: WindUnit; label: string }> = [
    { key: 'kmh', label: 'km/h' },
    { key: 'mph', label: 'mph' },
    { key: 'ms', label: 'm/s' },
  ]
  const LOCALES: Array<{ key: Locale; label: string }> = [
    { key: 'vi', label: 'Tiếng Việt' },
    { key: 'en', label: 'English' },
  ]

  async function onToggleNotify() {
    if (notifyEnabled) {
      disable()
      return
    }
    if (permission === 'granted') {
      useUiStore.getState().setNotifyEnabled(true)
    } else {
      await request()
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-black/5 backdrop-blur-xl text-slate-600 transition-all duration-300 hover:scale-105 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Settings"
          type="button"
        >
          <Gear size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end">
        <Section title={t.settings.appearance}>
          <Row>
            {THEMES.map((th) => (
              <Chip key={th.key} active={theme === th.key} onClick={() => setTheme(th.key)}>
                {th.label}
              </Chip>
            ))}
          </Row>
        </Section>
        <Section title={t.settings.temperature}>
          <Row>
            {TEMPS.map((u) => (
              <Chip key={u.key} active={tempUnit === u.key} onClick={() => setUnit(u.key)}>
                {u.label}
              </Chip>
            ))}
          </Row>
        </Section>
        <Section title={t.settings.windSpeed}>
          <Row>
            {WINDS.map((u) => (
              <Chip key={u.key} active={windUnit === u.key} onClick={() => setWindUnit(u.key)}>
                {u.label}
              </Chip>
            ))}
          </Row>
        </Section>
        <Section title={t.settings.language}>
          <Row>
            {LOCALES.map((l) => (
              <Chip key={l.key} active={locale === l.key} onClick={() => setLocale(l.key)}>
                {l.label}
              </Chip>
            ))}
          </Row>
        </Section>
        <Section title={t.settings.notifications}>
          <button
            onClick={onToggleNotify}
            disabled={permission === 'unsupported' || permission === 'denied'}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
              notifyEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
            )}
          >
            <span className="flex items-center gap-2 font-semibold">
              <span>{notifyEnabled ? '🔔' : '🔕'}</span>
              <span>{notifyEnabled ? t.settings.notifyOn : t.settings.notifyOff}</span>
            </span>
            <span className="text-[10px] opacity-70">
              {permission === 'unsupported'
                ? t.settings.notSupported
                : permission === 'denied'
                  ? t.settings.blocked
                  : ''}
            </span>
          </button>
          {permission === 'denied' ? (
            <p className="mt-2 text-[10px] leading-snug text-rose-500">{t.settings.blockedHint}</p>
          ) : notifyEnabled ? (
            <p className="mt-2 text-[10px] leading-snug text-slate-500">{t.settings.notifyDetail}</p>
          ) : null}
        </Section>
        <Section title={t.push.sectionTitle}>
          <WebPushSetup />
        </Section>
      </PopoverContent>
    </Popover>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95',
        active
          ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/20'
          : 'border-black/5 bg-black/5 text-slate-700 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
      )}
    >
      {children}
    </button>
  )
}
