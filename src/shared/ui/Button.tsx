import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600 active:scale-[0.98] shadow-md shadow-sky-500/20 disabled:from-sky-300 disabled:to-sky-400 dark:from-sky-500 dark:to-sky-600',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100/50 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-white/10',
  outline:
    'border border-black/5 bg-white/50 backdrop-blur-md text-slate-700 hover:bg-white/80 active:scale-[0.98] dark:border-white/10 dark:bg-black/20 dark:text-slate-200 dark:hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
})
