import { NextResponse } from 'next/server'

interface RainViewerMaps {
  host: string
  radar: { past: { time: number; path: string }[] }
}

/** Trả về URL mẫu XYZ RainViewer (khung radar mới nhất trong JSON công khai). */
export async function GET() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      next: { revalidate: 180 },
    })
    if (!res.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 })
    const data = (await res.json()) as RainViewerMaps
    const past = data.radar?.past
    if (!past?.length) return NextResponse.json({ error: 'no_frames' }, { status: 502 })
    const last = past[past.length - 1]!
    const host = data.host.replace(/\/$/, '')
    const path = last.path.startsWith('/') ? last.path : `/${last.path}`
    const tileUrl = `${host}${path}/512/{z}/{x}/{y}/4/1_1.png`
    return NextResponse.json({ tileUrl, time: last.time }, { headers: { 'Cache-Control': 'public, s-maxage=180' } })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 502 })
  }
}
