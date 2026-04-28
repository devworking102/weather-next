import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces } from '@/features/geocoding/services/geocoding'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const count = Number(searchParams.get('count') ?? '8')
  const data = await searchPlaces(q, Number.isFinite(count) ? count : 8)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
