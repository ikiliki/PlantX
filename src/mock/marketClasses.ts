import { classPhotos } from './images'
import type { MarketClass } from './types'

/** Liquid market rows (aggregated depth). */
export const seedMarketClasses: MarketClass[] = [
  {
    id: 'mc-pot-gold-a-m-r',
    code: 'POT-GOLD-A-M-R',
    speciesId: 'sp-pothos',
    variety: 'Golden',
    varietyHe: 'זהוב',
    quality: 'A',
    size: 'M',
    stage: 'ROOTED',
    displayName: 'Pothos Golden · A · M · Rooted',
    displayNameHe: 'פוטוס זהוב · A · M · מושרש',
    photo: classPhotos.potGoldS,
    lastPrice: 12.4,
    changePct: 8.3,
    bidQty: 1250,
    askQty: 420,
    supplyUnits: 1920,
    demandUnits: 2840,
    rangeMin: 10.5,
    rangeMax: 14.2,
    asks: [
      { qty: 120, price: 13, sellerLabel: 'Maya Levi', sellerLabelHe: 'מאיה לוי' },
      { qty: 300, price: 14, sellerLabel: 'Gal Nursery', sellerLabelHe: 'משתלת גל' },
    ],
    bids: [
      { qty: 1000, price: 11, buyerLabel: 'Event company', buyerLabelHe: 'חברת אירועים' },
      { qty: 250, price: 12, buyerLabel: 'Office project', buyerLabelHe: 'פרויקט משרדים' },
    ],
  },
  {
    id: 'mc-pot-gold-b-m-r',
    code: 'POT-GOLD-B-M-R',
    speciesId: 'sp-pothos',
    variety: 'Golden',
    varietyHe: 'זהוב',
    quality: 'B',
    size: 'M',
    stage: 'ROOTED',
    displayName: 'Pothos Golden · B · M · Rooted',
    displayNameHe: 'פוטוס זהוב · B · M · מושרש',
    photo: classPhotos.potGoldS,
    lastPrice: 8.7,
    changePct: 2.1,
    bidQty: 640,
    askQty: 510,
    supplyUnits: 1100,
    demandUnits: 900,
    rangeMin: 7.5,
    rangeMax: 9.8,
    asks: [
      { qty: 200, price: 9, sellerLabel: 'Maya Levi', sellerLabelHe: 'מאיה לוי' },
      { qty: 310, price: 9.5, sellerLabel: 'Gal Nursery', sellerLabelHe: 'משתלת גל' },
    ],
    bids: [
      { qty: 400, price: 8, buyerLabel: 'GreenSpace', buyerLabelHe: 'גרין־ספייס' },
      { qty: 240, price: 8.5, buyerLabel: 'Retailer', buyerLabelHe: 'קמעונאי' },
    ],
  },
  {
    id: 'mc-mon-std-a-l-est',
    code: 'MON-STD-A-L-EST',
    speciesId: 'sp-monstera',
    variety: 'Standard',
    varietyHe: 'סטנדרט',
    quality: 'A',
    size: 'L',
    stage: 'EST',
    displayName: 'Monstera Standard · A · L · Established',
    displayNameHe: 'מונסטרה סטנדרט · A · L · מבוססת',
    photo: classPhotos.monStdL,
    lastPrice: 68,
    changePct: 3.2,
    bidQty: 70,
    askQty: 50,
    supplyUnits: 90,
    demandUnits: 110,
    rangeMin: 58,
    rangeMax: 78,
    asks: [
      { qty: 30, price: 69, sellerLabel: 'Gal Nursery', sellerLabelHe: 'משתלת גל' },
      { qty: 20, price: 72, sellerLabel: 'Wholesale lot', sellerLabelHe: 'מנה סיטונאית' },
    ],
    bids: [
      { qty: 40, price: 64, buyerLabel: 'GreenSpace', buyerLabelHe: 'גרין־ספייס' },
      { qty: 30, price: 66, buyerLabel: 'Event hall', buyerLabelHe: 'אולם אירועים' },
    ],
  },
]

type Shelf = {
  id: string
  code: string
  speciesId: string
  variety: string
  varietyHe: string
  quality: MarketClass['quality']
  size: MarketClass['size']
  stage: MarketClass['stage']
  displayName: string
  displayNameHe: string
  photo: string
  price: number
  seller: string
  sellerHe: string
}

function shelf(item: Shelf): MarketClass {
  const price = item.price
  return {
    id: item.id,
    code: item.code,
    speciesId: item.speciesId,
    variety: item.variety,
    varietyHe: item.varietyHe,
    quality: item.quality,
    size: item.size,
    stage: item.stage,
    displayName: item.displayName,
    displayNameHe: item.displayNameHe,
    photo: item.photo,
    lastPrice: price,
    changePct: 1.4,
    bidQty: 3,
    askQty: 2,
    supplyUnits: 4,
    demandUnits: 5,
    rangeMin: Math.round(price * 0.86),
    rangeMax: Math.round(price * 1.12),
    asks: [{ qty: 1, price, sellerLabel: item.seller, sellerLabelHe: item.sellerHe }],
    bids: [
      {
        qty: 1,
        price: Math.max(1, Math.round(price * 0.9)),
        buyerLabel: 'Market bid',
        buyerLabelHe: 'הצעת שוק',
      },
    ],
  }
}

/** Graded configuration classes on the market (1:1 with class photos). */
export const configuredMarketClasses: MarketClass[] = [
  shelf({
    id: 'mc-pot-gold-a-xl-mat',
    code: 'POT-GOLD-A-XL-MAT',
    speciesId: 'sp-pothos',
    variety: 'Golden',
    varietyHe: 'זהוב',
    quality: 'A',
    size: 'XL',
    stage: 'MATURE',
    displayName: 'Pothos Golden · A · XL · Mature',
    displayNameHe: 'פוטוס זהוב · A · XL · בוגר',
    photo: classPhotos.potGoldXl,
    price: 86,
    seller: 'Maya Levi',
    sellerHe: 'מאיה לוי',
  }),
  shelf({
    id: 'mc-pot-gold-a-l-mat',
    code: 'POT-GOLD-A-L-MAT',
    speciesId: 'sp-pothos',
    variety: 'Golden',
    varietyHe: 'זהוב',
    quality: 'A',
    size: 'L',
    stage: 'MATURE',
    displayName: 'Pothos Golden · A · L · Mature',
    displayNameHe: 'פוטוס זהוב · A · L · בוגר',
    photo: classPhotos.potGoldL,
    price: 46,
    seller: 'Maya Levi',
    sellerHe: 'מאיה לוי',
  }),
  shelf({
    id: 'mc-pot-gold-a-s-r',
    code: 'POT-GOLD-A-S-R',
    speciesId: 'sp-pothos',
    variety: 'Golden',
    varietyHe: 'זהוב',
    quality: 'A',
    size: 'S',
    stage: 'ROOTED',
    displayName: 'Pothos Golden · A · S · Rooted',
    displayNameHe: 'פוטוס זהוב · A · S · מושרש',
    photo: classPhotos.potGoldS,
    price: 9,
    seller: 'Maya Levi',
    sellerHe: 'מאיה לוי',
  }),
  shelf({
    id: 'mc-pot-njoy-b-m-est',
    code: 'POT-NJOY-B-M-EST',
    speciesId: 'sp-pothos',
    variety: "N'Joy",
    varietyHe: "אן ג'וי",
    quality: 'B',
    size: 'M',
    stage: 'EST',
    displayName: "Pothos N'Joy · B · M · Established",
    displayNameHe: "פוטוס אן ג'וי · B · M · מבוסס",
    photo: classPhotos.potNjoy,
    price: 34,
    seller: 'Gal Nursery',
    sellerHe: 'משתלת גל',
  }),
  shelf({
    id: 'mc-mon-std-a-l-mat',
    code: 'MON-STD-A-L-MAT',
    speciesId: 'sp-monstera',
    variety: 'Standard',
    varietyHe: 'סטנדרט',
    quality: 'A',
    size: 'L',
    stage: 'MATURE',
    displayName: 'Monstera Standard · A · L · Mature',
    displayNameHe: 'מונסטרה סטנדרט · A · L · בוגר',
    photo: classPhotos.monStdL,
    price: 68,
    seller: 'Gal Nursery',
    sellerHe: 'משתלת גל',
  }),
  shelf({
    id: 'mc-mon-stmt-a-xl-mat',
    code: 'MON-STMT-A-XL-MAT',
    speciesId: 'sp-monstera',
    variety: 'Statement',
    varietyHe: 'מוקד',
    quality: 'A',
    size: 'XL',
    stage: 'MATURE',
    displayName: 'Monstera Statement · A · XL · Mature',
    displayNameHe: 'מונסטרה מוקד · A · XL · בוגר',
    photo: classPhotos.monStdXl,
    price: 145,
    seller: 'Daniel Cohen',
    sellerHe: 'דניאל כהן',
  }),
]

seedMarketClasses.push(...configuredMarketClasses)
