'use client'

import { Compass } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

interface Props {
  onRetry?: () => void
}

export function WeatherEmpty({ onRetry }: Props) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <Compass className="h-10 w-10 text-slate-400" />
      <h3 className="text-lg font-semibold">Chưa xác định được vị trí</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        Tìm kiếm thành phố ở thanh trên hoặc bấm để chúng tôi tự động định vị.
      </p>
      {onRetry ? (
        <Button onClick={onRetry} variant="outline">
          Dùng vị trí của tôi
        </Button>
      ) : null}
    </Card>
  )
}
