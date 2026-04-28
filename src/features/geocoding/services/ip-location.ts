import type { IpLocation } from '@/features/geocoding/types'

interface IpApiCoRaw {
  latitude?: number
  longitude?: number
  city?: string
  country_name?: string
  country_code?: string
  region?: string
  error?: boolean
}

interface IpApiComRaw {
  status?: string
  lat?: number
  lon?: number
  city?: string
  country?: string
  countryCode?: string
  regionName?: string
}

async function tryIpapiCo(clientIp?: string): Promise<IpLocation | null> {
  const url = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const d = (await res.json()) as IpApiCoRaw
    if (d.error) return null
    if (!Number.isFinite(d.latitude) || !Number.isFinite(d.longitude)) return null
    return {
      latitude: d.latitude!,
      longitude: d.longitude!,
      city: d.city ?? '',
      country: d.country_name ?? '',
      countryCode: d.country_code ?? '',
      region: d.region,
    }
  } catch {
    return null
  }
}

async function tryIpApiCom(clientIp?: string): Promise<IpLocation | null> {
  // ip-api.com: free tier không cần key, cho phép gọi từ datacenter IP.
  const url = clientIp
    ? `http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,regionName,city,lat,lon`
    : 'http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const d = (await res.json()) as IpApiComRaw
    if (d.status !== 'success') return null
    if (!Number.isFinite(d.lat) || !Number.isFinite(d.lon)) return null
    return {
      latitude: d.lat!,
      longitude: d.lon!,
      city: d.city ?? '',
      country: d.country ?? '',
      countryCode: d.countryCode ?? '',
      region: d.regionName,
    }
  } catch {
    return null
  }
}

export async function fetchIpLocation(clientIp?: string): Promise<IpLocation | null> {
  // ipapi.co hay bị rate-limit / chặn IP Vercel → fallback sang ip-api.com.
  return (await tryIpapiCo(clientIp)) ?? (await tryIpApiCom(clientIp))
}
