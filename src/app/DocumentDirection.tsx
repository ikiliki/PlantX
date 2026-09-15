import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'

export function DocumentDirection() {
  const { dir, locale } = useI18n()
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [dir, locale])
  return null
}
