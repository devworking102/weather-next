// Server-only — never import this from client components.
const MODEL = 'llama-3.3-70b-versatile'
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

export interface GroqOptions {
  temperature?: number
  maxTokens?: number
  json?: boolean
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[]
}

export async function groqGenerate(
  prompt: string,
  options: GroqOptions = {},
): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 300,
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    })
    if (!res.ok) {
      const err = await res.text().catch(() => '')
      console.error('[Groq] HTTP', res.status, err.slice(0, 200))
      return null
    }
    const data = (await res.json()) as GroqResponse
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (e) {
    console.error('[Groq] fetch error:', e)
    return null
  }
}
