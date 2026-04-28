import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/15',
          'dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500',
          className,
        )}
        {...props}
      />
    )
  },
)
