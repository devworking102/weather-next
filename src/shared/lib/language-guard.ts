const DISALLOWED_SCRIPT_RE = /[\u3400-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/u

export function hasDisallowedScript(text: string): boolean {
  return DISALLOWED_SCRIPT_RE.test(text)
}

export function hasOnlySupportedLanguageText(...values: string[]): boolean {
  return values.every((value) => !hasDisallowedScript(value))
}

export function stripDisallowedScript(text: string): string {
  return text.replace(DISALLOWED_SCRIPT_RE, '')
}
