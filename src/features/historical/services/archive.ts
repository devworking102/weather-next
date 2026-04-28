export interface HistoricalCompare {
  yesterdayMax: number | null
  yesterdayMin: number | null
  lastYearMax: number | null
  lastYearMin: number | null
  deltaMax: number | null
  deltaYearMax: number | null
}

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface ArchiveRaw {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

export async function fetchHistoricalCompare(
  lat: number,
  lon: number,
  todayMax: number,
): Promise<HistoricalCompare | null> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const lastYear = new Date(today)
  lastYear.setFullYear(today.getFullYear() - 1)

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
    `&start_date=${ymd(lastYear)}&end_date=${ymd(yesterday)}` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const json = (await res.json()) as ArchiveRaw

  const times = json.daily.time ?? []
  const maxes = json.daily.temperature_2m_max ?? []
  const mins = json.daily.temperature_2m_min ?? []

  const yIdx = times.indexOf(ymd(yesterday))
  const lyIdx = times.indexOf(ymd(lastYear))

  const yMax = yIdx >= 0 ? maxes[yIdx]! : null
  const yMin = yIdx >= 0 ? mins[yIdx]! : null
  const lyMax = lyIdx >= 0 ? maxes[lyIdx]! : null
  const lyMin = lyIdx >= 0 ? mins[lyIdx]! : null

  return {
    yesterdayMax: yMax,
    yesterdayMin: yMin,
    lastYearMax: lyMax,
    lastYearMin: lyMin,
    deltaMax: yMax != null ? todayMax - yMax : null,
    deltaYearMax: lyMax != null ? todayMax - lyMax : null,
  }
}
