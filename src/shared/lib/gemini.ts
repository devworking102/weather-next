// Server-only — never import this from client components.
const MODEL = 'gemini-2.0-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export interface GeminiOptions {
  temperature?: number
  maxOutputTokens?: number
  /** return JSON via response_mime_type */
  json?: boolean
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { code: number; message: string; status: string }
}

/**
 * Call Gemini. Returns null when key is missing or request fails — caller decides fallback.
 */
export async function geminiGenerate(
  prompt: string,
  options: GeminiOptions = {},
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  console.log('[Gemini] key present:', !!key, '| key prefix:', key?.slice(0, 8))
  if (!key) {
    console.error('[Gemini] GEMINI_API_KEY is missing or empty')
    return null
  }
  try {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 300,
        ...(options.json ? { response_mime_type: 'application/json' } : {}),
      },
    })
    console.log('[Gemini] calling model:', MODEL, '| prompt length:', prompt.length)
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    console.log('[Gemini] HTTP status:', res.status, res.statusText)
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error('[Gemini] error body:', err.slice(0, 400))
      return null
    }
    const data = (await res.json()) as GeminiResponse
    if (data.error) {
      console.error('[Gemini] API error:', data.error)
      return null
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
    console.log('[Gemini] response ok | text length:', text?.length ?? 0, '| preview:', text?.slice(0, 80))
    return text
  } catch (e) {
    console.error('[Gemini] fetch exception:', e)
    return null
  }
}

/** Parse JSON returned by Gemini (strips possible markdown fences). */
export function parseGeminiJson<T>(text: string): T | null {
  try {
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(clean) as T
  } catch (e) {
    console.error('[Gemini] JSON parse error:', e, '| raw:', text.slice(0, 200))
    return null
  }
}
