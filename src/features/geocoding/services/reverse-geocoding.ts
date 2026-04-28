interface ReverseGeocodeResult {
  city: string
  country: string
  admin1?: string
  countryCode?: string
}

// BigDataCloud free reverse geocoding — không cần API key.
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const d = (await res.json()) as {
      city?: string
      locality?: string
      principalSubdivision?: string
      countryName?: string
      countryCode?: string
    }
    return {
      city: d.city || d.locality || d.principalSubdivision || 'Vị trí hiện tại',
      country: d.countryName ?? '',
      admin1: d.principalSubdivision,
      countryCode: d.countryCode,
    }
  } catch {
    return null
  }
}
