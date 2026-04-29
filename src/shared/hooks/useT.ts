'use client'

import { useUiStore } from '@/shared/store/ui-store'
import { translations } from '@/shared/i18n/translations'

export function useT() {
  const locale = useUiStore((s) => s.locale)
  return translations[locale]
}
