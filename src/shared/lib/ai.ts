// Server-only — never import this from client components.
import { geminiGenerate, parseGeminiJson, type GeminiOptions } from './gemini'
import { groqGenerate } from './groq'
import { claudeGenerate } from './claude'

export type AiSource = 'claude' | 'gemini' | 'groq'

export interface AiResult {
  text: string
  source: AiSource
}

// Try Claude first, then Gemini, then Groq. Returns null only if all fail.
export async function aiGenerate(
  prompt: string,
  options: GeminiOptions = {},
): Promise<AiResult | null> {
  const claudeText = await claudeGenerate(prompt, { maxOutputTokens: options.maxOutputTokens })
  if (claudeText) return { text: claudeText, source: 'claude' }

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
