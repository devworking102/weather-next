import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Trời Hôm Nay — Dự báo thời tiết thông minh',
    template: '%s · Trời Hôm Nay',
  },
  description:
    'Dự báo thời tiết thông minh, cập nhật theo thời gian thực. Chất lượng không khí, cảnh báo thiên tai, radar mưa và gợi ý sinh hoạt được hỗ trợ bởi AI.',
  applicationName: 'Trời Hôm Nay',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Trời Hôm Nay' },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }] },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F8CFF' },
    { media: '(prefers-color-scheme: dark)', color: '#070b14' },
  ],
}

// Script inline đặt .dark trước khi React hydrate để tránh FOUC
const themeInitScript = `
  (function() {
    try {
      var stored = JSON.parse(localStorage.getItem('weather-ui-state'));
      var theme = stored && stored.state && stored.state.theme ? stored.state.theme : 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
    } catch (_) {}
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
