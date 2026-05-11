import { NextResponse } from 'next/server'
import { getVapidPublicKey, isWebPushConfigured } from '@/server/push-web'

export async function GET() {
  if (!isWebPushConfigured()) {
    return NextResponse.json({ configured: false, publicKey: null })
  }
  return NextResponse.json({ configured: true, publicKey: getVapidPublicKey() })
}
