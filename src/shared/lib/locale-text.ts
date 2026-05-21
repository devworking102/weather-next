const DISALLOWED_SCRIPT_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

export function hasDisallowedScript(text: string): boolean {
  return DISALLOWED_SCRIPT_RE.test(text)
}

export function isLocaleSafeText(text: string, locale: 'vi' | 'en'): boolean {
  const clean = text.trim()
  if (!clean) return true
  if (hasDisallowedScript(clean)) return false

  if (locale === 'en') {
    return !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(clean)
  }

  return true
}

export function areLocaleSafeTexts(values: string[], locale: 'vi' | 'en'): boolean {
  return values.every((value) => isLocaleSafeText(value, locale))
}
