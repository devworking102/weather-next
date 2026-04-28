'use client'

import { AlertTriangle } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

interface Props {
  message?: string
  onRetry?: () => void
}

export function WeatherError({ message, onRetry }: Props) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle className="h-10 w-10 text-rose-500" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Không tải được dữ liệu</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message ?? 'Có lỗi xảy ra khi kết nối tới máy chủ thời tiết. Vui lòng thử lại sau giây lát.'}
      </p>
      {onRetry ? <Button onClick={onRetry}>Thử lại</Button> : null}
    </Card>
  )
}
