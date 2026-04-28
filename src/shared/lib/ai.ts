// Server-only — never import this from client components.
import { geminiGenerate, parseGeminiJson, type GeminiOptions } from './gemini'
import { groqGenerate } from './groq'

export type AiSource = 'gemini' | 'groq'

export interface AiResult {
  text: string
  source: AiSource
}

/**
 * Try Gemini first, fall back to Groq. Returns null only if both fail.
 */
export async function aiGenerate(
  prompt: string,
  options: GeminiOptions = {},
): Promise<AiResult | null> {
  const geminiText = await geminiGenerate(prompt, options)
  if (geminiText) return { text: geminiText, source: 'gemini' }

  const groqText = await groqGenerate(prompt, {
    temperature: options.temperature,
    maxTokens: options.maxOutputTokens,
    json: options.json,
  })
  if (groqText) return { text: groqText, source: 'groq' }

  return null
}

export { parseGeminiJson }
