'use client'

import { AlertTriangle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { useT } from '@/shared/hooks/useT'

interface Props {
  message?: string
  onRetry?: () => void
}

export function WeatherError({ message, onRetry }: Props) {
  const t = useT()
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle className="h-10 w-10 text-rose-500" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.error.title}</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message ?? t.error.hint}
      </p>
      {onRetry ? <Button onClick={onRetry}>{t.error.retry}</Button> : null}
    </Card>
  )
}
