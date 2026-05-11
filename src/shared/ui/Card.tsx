import { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/40 bg-white/30 p-5 shadow-lg backdrop-blur-2xl backdrop-saturate-150',
        'dark:border-white/10 dark:bg-black/20 dark:shadow-2xl',
        'transition-all duration-300 ease-out',
        'motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl',
        className,
      )}
      {...props}
    />
  )
}
