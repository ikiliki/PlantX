import { createContext, useContext, useMemo, type ReactNode } from 'react'
import en from './en.json'
import he from './he.json'
import { activeLocale } from './locales'
import { useStore } from '../mock/store'
import type { Locale } from '../mock/types'

type Dict = typeof en

const dictionaries: Record<Locale, Dict> = { en, he }

const I18nContext = createContext<{
  locale: Locale
  t: Dict
  dir: 'rtl' | 'ltr'
  tr: (enText: string, heText: string) => string
  formatMoney: (n: number) => string
} | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const { db } = useStore()
  const locale = activeLocale(db.locale)
  const value = useMemo(() => {
    const t = dictionaries[locale]
    return {
      locale,
      t,
      dir: (locale === 'he' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
      tr: (enText: string, heText: string) => (locale === 'he' ? heText : enText),
      formatMoney: (n: number) =>
        `${t.common.ils}${n.toLocaleString(locale === 'he' ? 'he-IL' : 'en-IL', {
          maximumFractionDigits: 2,
        })}`,
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
