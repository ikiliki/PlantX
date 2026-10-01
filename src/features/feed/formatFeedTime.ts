import type { Locale } from '../../mock/types'

export function formatFeedTime(
  iso: string,
  locale: Locale,
  labels: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string },
) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 1) return labels.justNow
  if (minutes < 60) {
    return locale === 'he' ? `לפני ${minutes} ${labels.minutesAgo}` : `${minutes}${labels.minutesAgo}`
  }
  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return locale === 'he' ? `לפני ${hours} ${labels.hoursAgo}` : `${hours}${labels.hoursAgo}`
  }
  const days = Math.round(hours / 24)
  if (days < 7) {
    if (locale === 'he') return days === 1 ? 'לפני יום' : `לפני ${days} ${labels.daysAgo}`
    return `${days}${labels.daysAgo}`
  }
  return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}
