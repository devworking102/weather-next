import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/** URL tiếng Việt cho SEO — chuyển vĩnh viễn sang route chuẩn `/alerts`. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/canh-bao') {
    const url = request.nextUrl.clone()
    url.pathname = '/alerts'
    return NextResponse.redirect(url, 308)
  }
  if (pathname.startsWith('/canh-bao/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/canh-bao/, '/alerts')
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/canh-bao', '/canh-bao/:path*'],
}
