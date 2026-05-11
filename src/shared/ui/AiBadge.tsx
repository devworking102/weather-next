import { cn } from '@/shared/lib/cn'
import type { AiSource } from '@/shared/lib/ai'

export type AiBadgeSource = AiSource | 'fallback'

const CONFIG: Record<AiBadgeSource, { label: string; className: string }> = {
  claude: {
    label: 'Claude',
    className: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
  },
  gemini: {
    label: 'Gemini',
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  },
  groq: {
    label: 'Groq',
    className: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
  },
  fallback: {
    label: 'Gợi ý',
    className: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  },
}

export function AiBadge({ source, className }: { source: AiBadgeSource; className?: string }) {
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
