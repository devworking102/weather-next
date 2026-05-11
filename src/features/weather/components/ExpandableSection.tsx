'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'

interface Props {
  title?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function ExpandableSection({ title, children, defaultOpen = false, className }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const t = useT()
  const label = title ?? t.expandDetails.title

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900/40 dark:hover:bg-white/[0.07]"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {open ? t.expandDetails.showLess : t.expandDetails.showMore}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-400 transition-transform duration-300',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </div>
      </button>

      {/*
        CSS grid-template-rows collapse — children stay mounted so charts
        don't remount every time the section is toggled.
      */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
