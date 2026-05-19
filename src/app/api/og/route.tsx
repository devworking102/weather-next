import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

/** OG image 1200×630 — brand & city cards for social previews. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') ?? 'brand'
  const title = searchParams.get('title') ?? 'Trời Hôm Nay'
  const line2 = searchParams.get('line2') ?? 'Dự báo thời tiết thông minh'
  const line3 = searchParams.get('line3') ?? ''

  let fontData: ArrayBuffer | undefined
  try {
    const fontRes = await fetch(
      'https://fonts.gstatic.com/s/bevietnampro/v11/QdVMSTAyLFyvt_IDWHvWFlM.woff2',
    )
    if (fontRes.ok) fontData = await fontRes.arrayBuffer()
  } catch {
    /* optional font */
  }

  const fonts = fontData
    ? [{ name: 'Be Vietnam Pro', data: fontData, style: 'normal' as const, weight: 600 as const }]
    : []

  const bg =
    type === 'aqi'
      ? 'linear-gradient(135deg, #064e3b 0%, #022c22 45%, #0f172a 100%)'
      : type === 'weather'
        ? 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 40%, #0f172a 100%)'
        : 'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 50%, #0f172a 100%)'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 56,
          background: bg,
          color: '#f8fafc',
          fontFamily: fontData ? 'Be Vietnam Pro, system-ui, sans-serif' : 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}
          >
            ☀️
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', opacity: 0.95 }}>
            Trời Hôm Nay
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 980 }}>
          <div
            style={{
              fontSize: title.length > 36 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              textShadow: '0 4px 32px rgba(0,0,0,0.35)',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.88, lineHeight: 1.25 }}>{line2}</div>
          {line3 ? (
            <div style={{ fontSize: 24, opacity: 0.72, marginTop: 4 }}>{line3}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 20, opacity: 0.55 }}>troihomnay.vn · Open-Meteo</span>
          <span style={{ fontSize: 18, opacity: 0.45 }}>weather assistant</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    },
  )
}
