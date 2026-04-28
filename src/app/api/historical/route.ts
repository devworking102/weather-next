import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalCompare } from '@/features/historical/services/archive'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  const todayMax = Number(searchParams.get('today_max'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(todayMax)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
  }
  try {
    const data = await fetchHistoricalCompare(lat, lon, todayMax)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'upstream_error', message: (e as Error).message },
      { status: 502 },
    )
  }
}
