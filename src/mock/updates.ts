import type { FeedUpdate } from './types'

function ago(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

/** Greenhouse activity lines for the news Activity tab — global, or friends when filtered. */
export function seedUpdates(): FeedUpdate[] {
  return [
    {
      id: 'up-maya-scan',
      kind: 'scan',
      userId: 'u-maya',
      plantId: 'pl-maya-njoy',
      identifyRequestId: 'req-maya-njoy',
      body: "AI scan: Epipremnum aureum · Plant.id 91%.",
      bodyHe: "סריקת AI: Epipremnum aureum · Plant.id 91%.",
      createdAt: ago(100),
    },
    {
      id: 'up-maya-added',
      kind: 'added',
      userId: 'u-maya',
      plantId: 'pl-maya-njoy',
      identifyRequestId: 'req-maya-njoy',
      body: "N'Joy pothos ×6 added to the greenhouse · AI verified by Plant.id.",
      bodyHe: "פוטוס אן ג'וי ×6 נוסף לחממה · אומת ב־AI על ידי Plant.id.",
      createdAt: ago(99),
    },
    {
      id: 'up-noa-scan',
      kind: 'scan',
      userId: 'u-noa',
      body: 'AI scan: the photo does not show a plant.',
      bodyHe: 'סריקת AI: בתמונה לא נמצא צמח.',
      createdAt: ago(30),
    },
    {
      id: 'up-maya-propagate',
      kind: 'propagate',
      userId: 'u-maya',
      plantId: 'pl-maya-mother',
      body: '3 rooted child cuttings recorded on the mother plant.',
      bodyHe: '3 ייחורים מושרשים נרשמו על צמח האם.',
      createdAt: ago(1),
    },
    {
      id: 'up-gal-photo',
      kind: 'photo',
      userId: 'u-gal',
      plantId: 'pl-gal-monstera',
      body: 'Monstera tray photo refreshed.',
      bodyHe: 'תמונת מגש המונסטרה רועננה.',
      createdAt: ago(3),
    },
    {
      id: 'up-daniel-passport',
      kind: 'passport',
      userId: 'u-daniel',
      plantId: 'pl-daniel-monstera',
      body: 'Statement monstera passport verified.',
      bodyHe: 'דרכון מונסטרת המוקד אומת.',
      createdAt: ago(6),
    },
    {
      id: 'up-noa-water',
      kind: 'water',
      userId: 'u-noa',
      body: 'Water confirmed on the office pothos.',
      bodyHe: 'השקיה אושרה לפוטוס המשרד.',
      createdAt: ago(10),
    },
    {
      id: 'up-maya-grade',
      kind: 'grade',
      userId: 'u-maya',
      plantId: 'pl-maya-mother',
      body: 'Golden pothos moved from B to A.',
      bodyHe: 'פוטוס זהוב עלה מדרגה B ל־A.',
      createdAt: ago(14),
    },
    {
      id: 'up-gal-list',
      kind: 'listing',
      userId: 'u-gal',
      plantId: 'pl-gal-pothos',
      body: 'N’Joy pothos listed from the nursery bench.',
      bodyHe: 'פוטוס N’Joy פורסם מדף המשתלה.',
      createdAt: ago(22),
    },
    {
      id: 'up-maya-batch',
      kind: 'propagate',
      userId: 'u-maya',
      plantId: 'pl-maya-njoy',
      body: "N'Joy batch updated to 6 plants on the balcony.",
      bodyHe: 'אצוות N’Joy עודכנה ל־6 צמחים במרפסת.',
      createdAt: ago(48),
    },
    {
      id: 'up-daniel-photo',
      kind: 'photo',
      userId: 'u-daniel',
      plantId: 'pl-daniel-monstera',
      body: 'Listing photo refreshed after 42 days.',
      bodyHe: 'תמונת המודעה רועננה אחרי 42 ימים.',
      createdAt: ago(60),
    },
  ]
}
