import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { getSiteUrl } from '@/shared/lib/site-url'
import { SkipToContent } from '@/shared/ui/SkipToContent'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin', 'latin-ext'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
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
  openGraph: {
    type: 'website',
    siteName: 'Trời Hôm Nay',
    locale: 'vi_VN',
    images: [
      {
        url: '/api/og?type=brand&title=Trời+Hôm+Nay&line2=Dự+báo+thời+tiết+%26+AI+thông+minh',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trời Hôm Nay',
    description: 'Dự báo thời tiết, AQI, radar mưa và gợi ý AI.',
    images: ['/api/og?type=brand&title=Trời+Hôm+Nay&line2=Dự+báo+thời+tiết+%26+AI+thông+minh'],
  },
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
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

const siteJsonLd = () => {
  const base = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trời Hôm Nay',
    url: base,
    inLanguage: 'vi',
    description:
      'Dự báo thời tiết, AQI, radar mưa, cảnh báo và gợi ý AI — ưu tiên người dùng Việt Nam.',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <SkipToContent />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
