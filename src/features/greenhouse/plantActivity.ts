/**
 * Text for the owner's private plant activity (shared by the server and mock mode). Pure, no React.
 * `edited`: which values changed, or the privacy switch. `deleted`: the plant is gone from the greenhouse.
 */

/** Plant fields an edit can change, with the words the activity uses for them. */
const FIELD_WORDS: Record<string, { en: string; he: string }> = {
  title: { en: 'name', he: 'שם' },
  description: { en: 'note', he: 'הערה' },
  sizeBand: { en: 'size', he: 'גודל' },
  stage: { en: 'stage', he: 'שלב' },
  quality: { en: 'quality', he: 'איכות' },
  traits: { en: 'details', he: 'פרטים' },
  photos: { en: 'photos', he: 'תמונות' },
  care: { en: 'care plan', he: 'תוכנית טיפול' },
}

/** One line per edit: "Edited Golden pothos: name, size" / "Golden pothos is now private". */
export function editedActivityText(
  title: string,
  titleHe: string,
  changed: string[],
  privacy?: 'private' | 'public',
): { body: string; bodyHe: string } {
  const words = [...new Set(changed.map((key) => FIELD_WORDS[key]).filter(Boolean))]
  const parts: { en: string[]; he: string[] } = { en: [], he: [] }
  if (words.length > 0) {
    parts.en.push(`Edited ${title}: ${words.map((word) => word.en).join(', ')}`)
    parts.he.push(`${titleHe} נערך: ${words.map((word) => word.he).join(', ')}`)
  }
  if (privacy === 'private') {
    parts.en.push(`${title} is now private`)
    parts.he.push(`${titleHe} פרטי עכשיו`)
  }
  if (privacy === 'public') {
    parts.en.push(`${title} is now public`)
    parts.he.push(`${titleHe} ציבורי עכשיו`)
  }
  return { body: parts.en.join(' · '), bodyHe: parts.he.join(' · ') }
}

export function deletedActivityText(title: string, titleHe: string) {
  return { body: `Deleted ${title} from the greenhouse`, bodyHe: `${titleHe} נמחק מהחממה` }
}

