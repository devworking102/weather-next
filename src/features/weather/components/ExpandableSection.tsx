'use client'

import { cn } from '@/shared/lib/cn'
import { useT } from '@/shared/hooks/useT'

interface Props {
  title?: string
  children: React.ReactNode
  className?: string
}

export function ExpandableSection({ title, children, className }: Props) {
  const t = useT()
  const label = title ?? t.expandDetails.title

  return (
    <details
      className={cn(
        'group rounded-[1.75rem] border border-black/5 bg-white/35 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]',
        className,
      )}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-sm font-semibold text-slate-700 outline-none transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-slate-200 dark:hover:text-white [&::-webkit-details-marker]:hidden">
        <span>{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-lg leading-none text-slate-500 transition group-open:rotate-45 dark:bg-white/10 dark:text-slate-300">
          +
        </span>
      </summary>
      <div className="space-y-4 border-t border-black/5 p-4 dark:border-white/10 sm:p-5">
        {children}
      </div>
    </details>
  )
}
