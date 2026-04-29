'use client'

import { useMemo } from 'react'
import { Card } from '@/shared/ui/Card'
import { moonPhase } from '@/features/calendar/utils/lunar'
import { formatTime } from '@/features/weather/utils/format'
import { useT } from '@/shared/hooks/useT'

interface Props {
  sunrise: string
  sunset: string
}

export function SunMoonCard({ sunrise, sunset }: Props) {
  const t = useT()
  const daylight = useMemo(() => {
    const rise = new Date(`1970-01-01T${formatTime(sunrise)}:00`)
    const set = new Date(`1970-01-01T${formatTime(sunset)}:00`)
    return (Math.abs(set.getTime() - rise.getTime()) / 36e5).toFixed(1) + 'h'
  }, [sunrise, sunset])
  const moon = useMemo(() => moonPhase(new Date()), [])

  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-black/5 px-5 py-3 dark:border-white/5">
        <span className="text-lg">🌅</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t.sunMoon.title}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <Item icon="🌅" value={formatTime(sunrise)} label={t.sunMoon.sunrise} />
        <Item icon="🌇" value={formatTime(sunset)} label={t.sunMoon.sunset} />
        <Item icon="☀️" value={daylight} label={t.sunMoon.daylight} />
        <Item icon={moon.icon} value={`${moon.illumination}%`} label={moon.name} />
      </div>
    </Card>
  )
}

function Item({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-black/5 bg-slate-50 p-3 text-center dark:border-white/5 dark:bg-slate-800/40">
      <span className="text-3xl drop-shadow-sm">{icon}</span>
      <span className="text-base font-bold text-slate-900 dark:text-white">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  )
}
