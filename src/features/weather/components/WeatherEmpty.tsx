'use client'

import { Compass } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { useT } from '@/shared/hooks/useT'

interface Props {
  onRetry?: () => void
}

export function WeatherEmpty({ onRetry }: Props) {
  const t = useT()
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <Compass className="h-10 w-10 text-slate-400" />
      <h3 className="text-lg font-semibold">{t.empty.title}</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{t.empty.hint}</p>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline">
          {t.empty.useMyLocation}
        </Button>
      ) : null}
    </Card>
  )
}
