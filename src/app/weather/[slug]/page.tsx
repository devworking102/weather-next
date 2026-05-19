import { redirect } from 'next/navigation'

export default async function LegacyWeatherCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/thoi-tiet/${slug}`)
}
