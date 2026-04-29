// Server-only — never import this from client components.
import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-opus-4-7'

let _client: Anthropic | null = null

export function getClaudeClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  if (!_client) _client = new Anthropic({ apiKey: key })
  return _client
}

export interface ClaudeOptions {
  maxOutputTokens?: number
  systemPrompt?: string
}

export async function claudeGenerate(
  prompt: string,
  options: ClaudeOptions = {},
): Promise<string | null> {
  const client = getClaudeClient()
  if (!client) return null

  try {
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }]
    const systemBlocks: Anthropic.TextBlockParam[] = options.systemPrompt
      ? [{ type: 'text', text: options.systemPrompt, cache_control: { type: 'ephemeral' } }]
      : []

    // Adaptive thinking uses tokens from max_tokens budget — enforce a minimum so
    // short-output endpoints (e.g. recommendations: 450) don't starve thinking.
    const maxTokens = Math.max(options.maxOutputTokens ?? 1024, 1024)

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      ...(systemBlocks.length > 0 && { system: systemBlocks }),
      messages,
    })

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
    return textBlock?.text ?? null
  } catch {
    return null
  }
}

export function parseClaudeJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!match) return null
    return JSON.parse(match[0]) as T
  } catch {
    return null
  }
}
