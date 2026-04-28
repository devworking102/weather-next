import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

export function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="h-48 p-6">
        <div className="flex items-start justify-between">
          <div className="w-full space-y-4">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-14 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}
