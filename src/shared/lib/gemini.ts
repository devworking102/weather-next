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
}

/**
 * Call Gemini. Returns null when key is missing or request fails — caller decides fallback.
 */
export async function geminiGenerate(
  prompt: string,
  options: GeminiOptions = {},
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`${ENDPOINT}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 300,
          ...(options.json ? { response_mime_type: 'application/json' } : {}),
        },
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as GeminiResponse
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
  } catch {
    return null
  }
}

/** Parse JSON returned by Gemini (strips possible markdown fences). */
export function parseGeminiJson<T>(text: string): T | null {
  try {
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    return JSON.parse(clean) as T
  } catch {
    return null
  }
}
