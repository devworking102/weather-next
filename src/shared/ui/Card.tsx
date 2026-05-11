import { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/50 bg-white/40 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl',
        'dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)]',
        className,
      )}
      {...props}
    />
  )
}
