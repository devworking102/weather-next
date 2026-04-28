import { NextRequest, NextResponse } from 'next/server'
import { fetchEarthquakes } from '@/features/earthquakes/services/usgs'

export const revalidate = 600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  const radius = Number(searchParams.get('radius') ?? '1500')
  const minMag = Number(searchParams.get('minMag') ?? '4')
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 })
  }
  try {
    const data = await fetchEarthquakes(lat, lon, radius, minMag)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'upstream_error', message: (e as Error).message },
      { status: 502 },
    )
  }
}
