import type { TopGreenhouse } from './types'

export function seedTopGreenhouses(): TopGreenhouse[] {
  return [
    {
      id: 'gh-daniel',
      userId: 'u-daniel',
      grade: 98,
      line: 'Statement monsteras with full passports, almost no cancellations.',
      lineHe: 'מונסטרות מוקד עם דרכון מלא, כמעט בלי ביטולים.',
    },
    {
      id: 'gh-gal',
      userId: 'u-gal',
      grade: 94,
      line: 'Nursery volume on pothos and monstera that holds its grade.',
      lineHe: 'נפח משתלה בפוטוס ומונסטרה ששומר על הדירוג.',
    },
    {
      id: 'gh-maya',
      userId: 'u-maya',
      grade: 90,
      line: 'Home golden pothos and N’Joy that stay consistent.',
      lineHe: 'פוטוס זהוב ו־N’Joy ביתיים שנשארים עקביים.',
    },
    {
      id: 'gh-noa',
      userId: 'u-noa',
      grade: 82,
      line: 'Office lots of trailing pothos, checked before they land.',
      lineHe: 'מנות משרד של פוטוס תלוי, נבדקות לפני שהן מגיעות.',
    },
  ]
}
