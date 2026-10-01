/** Local catalog photos (Wikimedia-derived, stored under /public/class-photos). */
export const classPhotos = {
  potGoldXl: '/class-photos/pot-gold-a-xl-mat.jpg',
  potGoldL: '/class-photos/pot-gold-a-l-mat.jpg',
  potGoldS: '/class-photos/pot-gold-a-s-r.png',
  potNjoy: '/class-photos/pot-njoy-b-m-est.jpg',
  monStdL: '/class-photos/mon-std-a-l-mat.jpg',
  monStdXl: '/class-photos/mon-std-a-xl-mat.jpg',
} as const

/** Legacy alias map — prefer classPhotos for market / greenhouse plants. */
export const plantImages = {
  pothos: classPhotos.potGoldXl,
  pothosL: classPhotos.potGoldL,
  pothosCutting: classPhotos.potGoldS,
  pothosNjoy: classPhotos.potNjoy,
  monstera: classPhotos.monStdL,
  monsteraXl: classPhotos.monStdXl,
  cuttings: classPhotos.potGoldS,
  nursery: classPhotos.potGoldL,
  greenery: classPhotos.potGoldXl,
  leaves: classPhotos.monStdL,
  pot: classPhotos.potNjoy,
  hero: classPhotos.potGoldXl,
} as const

export const defaultPlantPhoto = classPhotos.potGoldS
