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
    <div className="inline-flex rounded-full border border-black/5 bg-black/5 p-1 text-xs backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-medium transition-all duration-300',
            theme === key
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5',
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
