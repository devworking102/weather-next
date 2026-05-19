import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const ROUTE_ALIASES: Record<string, string> = {
  '/weather': '/thoi-tiet',
  '/radar': '/radar-mua',
  '/aqi': '/chat-luong-khong-khi',
  '/alerts': '/canh-bao',
  '/health': '/suc-khoe',
  '/news': '/tin-tuc',
  '/earthquakes': '/dong-dat',
  '/calendar': '/lich',
  '/wind': '/gio',
  '/widget': '/tien-ich',
  '/voice': '/giong-noi',
}

const VI_TO_INTERNAL = Object.fromEntries(
  Object.entries(ROUTE_ALIASES)
    .filter(([, vi]) => vi !== '/thoi-tiet')
    .map(([internal, vi]) => [vi, internal]),
)

function replacePrefix(pathname: string, from: string, to: string) {
  return pathname === from || pathname.startsWith(`${from}/`)
    ? pathname.replace(from, to)
    : null
}

// Public URLs are Vietnamese; internal routes stay unchanged to keep page code small.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  for (const [internal, vi] of Object.entries(ROUTE_ALIASES)) {
    const nextPath = replacePrefix(pathname, internal, vi)
    if (nextPath) {
      const url = request.nextUrl.clone()
      url.pathname = nextPath
      return NextResponse.redirect(url, 308)
    }
  }

  for (const [vi, internal] of Object.entries(VI_TO_INTERNAL)) {
    const nextPath = replacePrefix(pathname, vi, internal)
    if (nextPath) {
      const url = request.nextUrl.clone()
      url.pathname = nextPath
      return NextResponse.rewrite(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/weather/:path*',
    '/radar/:path*',
    '/aqi/:path*',
    '/alerts/:path*',
    '/health/:path*',
    '/news/:path*',
    '/earthquakes/:path*',
    '/calendar/:path*',
    '/wind/:path*',
    '/widget/:path*',
    '/voice/:path*',
    '/thoi-tiet/:path*',
    '/radar-mua/:path*',
    '/chat-luong-khong-khi/:path*',
    '/canh-bao/:path*',
    '/suc-khoe/:path*',
    '/tin-tuc/:path*',
    '/dong-dat/:path*',
    '/lich/:path*',
    '/gio/:path*',
    '/tien-ich/:path*',
    '/giong-noi/:path*',
  ],
}
