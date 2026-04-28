import { cn } from '@/shared/lib/cn'
import type { AiSource } from '@/shared/lib/ai'

const CONFIG: Record<AiSource, { label: string; className: string }> = {
  gemini: {
    label: 'Gemini',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  },
  groq: {
    label: 'Groq',
    className: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  },
}

export function AiBadge({ source, className }: { source: AiSource; className?: string }) {
  const cfg = CONFIG[source]
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-bold',
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  )
}
