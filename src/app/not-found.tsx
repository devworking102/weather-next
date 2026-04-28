import Link from 'next/link'
import { Button } from '@/shared/ui/Button'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl">🌫️</div>
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-sm text-slate-500">Đường dẫn bạn truy cập không tồn tại.</p>
      <Link href="/">
        <Button>Về trang chủ</Button>
      </Link>
    </main>
  )
}
