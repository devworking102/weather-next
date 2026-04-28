import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocode } from '@/features/geocoding/services/reverse-geocoding'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lon = Number(searchParams.get('lon'))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 })
  }
  const data = await reverseGeocode(lat, lon)
  return NextResponse.json(data ?? {}, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
