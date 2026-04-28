import { NextRequest, NextResponse } from 'next/server'
import { fetchIpLocation } from '@/features/geocoding/services/ip-location'

export async function GET(req: NextRequest) {
  // Ưu tiên header chuẩn Vercel/Cloudflare nếu có; fallback x-forwarded-for.
  const forwarded = req.headers.get('x-forwarded-for')
  const ip =
    req.headers.get('x-real-ip') ??
    (forwarded ? forwarded.split(',')[0]!.trim() : undefined)

  const data = await fetchIpLocation(ip && !isPrivateIp(ip) ? ip : undefined)
  // Không cache response null để lần sau có thể thử lại; thành công thì cache ngắn.
  const cacheHeader = data
    ? 'private, max-age=1800'
    : 'no-store, no-cache, must-revalidate'
  return NextResponse.json(data ?? null, {
    headers: { 'Cache-Control': cacheHeader },
  })
}

function isPrivateIp(ip: string): boolean {
  return /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fe80:)/.test(ip)
}
