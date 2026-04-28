import { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-black/5 bg-white p-5 shadow-sm',
        'dark:border-white/5 dark:bg-slate-900/60 dark:shadow-black/40',
        className,
      )}
      {...props}
    />
  )
}
