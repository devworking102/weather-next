'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useUiStore } from '@/shared/store/ui-store'
import { cn } from '@/shared/lib/cn'

const options = [
  { key: 'light', label: 'Sáng', icon: Sun },
  { key: 'system', label: 'Hệ thống', icon: Monitor },
  { key: 'dark', label: 'Tối', icon: Moon },
] as const

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  return (
    <div className="inline-flex rounded-full border border-black/10 bg-white p-1 text-xs dark:border-white/10 dark:bg-slate-900/60">
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded-full px-2.5 font-medium transition-colors',
            theme === key
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
          )}
          aria-label={label}
          type="button"
        >
          <Icon size={12} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
