import { NextRequest, NextResponse } from 'next/server'
import { configureWebPush, sendPushToAll } from '@/server/push-web'

/**
 * Gửi thông báo thử tới mọi subscription đã lưu.
 * Production: bắt buộc header `x-weather-push-test` khớp `PUSH_TEST_SECRET`.
 */
export async function POST(req: NextRequest) {
  if (!configureWebPush()) {
    return NextResponse.json({ error: 'vapid_not_configured' }, { status: 503 })
  }
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.PUSH_TEST_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'push_test_secret_missing' }, { status: 503 })
    }
    if (req.headers.get('x-weather-push-test') !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const { sent, failed } = await sendPushToAll({
    title: 'Weather Next',
    body: 'Thử push từ máy chủ — nếu thấy thông báo này là đã cấu hình đúng.',
    url: '/thoi-tiet',
  })
  return NextResponse.json({ ok: true, sent, failed })
}
