export interface GeoLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  countryCode?: string
}

export interface IpLocation {
  latitude: number
  longitude: number
  city: string
  country: string
  countryCode: string
  region?: string
}
