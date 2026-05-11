import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-2xl border border-black/5 bg-black/5 px-4 text-sm text-slate-900 placeholder:text-slate-500 backdrop-blur-xl transition-all duration-300',
          'focus:border-sky-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:shadow-lg',
          'dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400 dark:focus:bg-black/40',
          className,
        )}
        {...props}
      />
    )
  },
)
