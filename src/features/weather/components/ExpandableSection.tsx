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
    <section className={cn('space-y-4', className)}>
      <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </h2>
      {children}
    </section>
  )
}
