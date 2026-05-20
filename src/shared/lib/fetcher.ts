export class FetchError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error?: { code: string; message: string } }

function isApiEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
  return !!body && typeof body === 'object' && 'ok' in body
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    let message = 'Không tải được dữ liệu. Bạn thử lại sau nhé.'
    let code: string | undefined
    if (isApiEnvelope<T>(body) && !body.ok) {
      message = body.error?.message ?? message
      code = body.error?.code
    } else if (body && typeof body === 'object') {
      const legacy = body as { message?: string; error?: string }
      message = legacy.message ?? legacy.error ?? message
    }
    const error = new FetchError(message, res.status)
    error.code = code
    throw error
  }

  if (isApiEnvelope<T>(body)) {
    if (body.ok) return body.data
    const error = new FetchError(body.error?.message ?? 'Không tải được dữ liệu.', res.status)
    error.code = body.error?.code
    throw error
  }

  return body as T
}
