import { NextRequest, NextResponse } from 'next/server'
import { fetchDisasterNews } from '@/features/news/services/gdacs'

export const revalidate = 900

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') ?? '20')
  try {
    const data = await fetchDisasterNews(Number.isFinite(limit) ? limit : 20)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'upstream_error', message: (e as Error).message },
      { status: 502 },
    )
  }
}
