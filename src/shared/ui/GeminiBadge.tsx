import { cn } from '@/shared/lib/cn'

export function GeminiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
        className,
      )}
    >
      Gemini
    </span>
  )
}
