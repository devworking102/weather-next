import { NextRequest, NextResponse } from 'next/server'
import type { StoredPushSubscription } from '@/server/push-subscription-store'
import { savePushSubscription } from '@/server/push-subscription-store'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StoredPushSubscription
    if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'invalid_subscription' }, { status: 400 })
    }
    savePushSubscription(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
}
