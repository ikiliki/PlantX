/** Verified Unsplash URLs (HEAD 200). Prefer auto=format for CDN reliability. */
const q = 'auto=format&fit=crop&w=800&q=80'

export const plantImages = {
  pothos: `https://images.unsplash.com/photo-1485955900006-10f4d324d411?${q}`,
  monstera: `https://images.unsplash.com/photo-1545241047-6083a3684587?${q}`,
  monstera2: `https://images.unsplash.com/photo-1616046229478-9901c5536a45?${q}`,
  fiddle: `https://images.unsplash.com/photo-1466781783364-36c955e42a7f?${q}`,
  maple: `https://images.unsplash.com/photo-1509423350716-97f9360b4e09?${q}`,
  philodendron: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?${q}`,
  olive: `https://images.unsplash.com/photo-1463320726281-696a485928c7?${q}`,
  palm: `https://images.unsplash.com/photo-1497250681960-ef046c08a56e?${q}`,
  greenery: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?${q}`,
  cuttings: `https://images.unsplash.com/photo-1501004318641-b39e6451bec6?${q}`,
  leaves: `https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?${q}`,
  pot: `https://images.unsplash.com/photo-1463936575829-25148e1db1b8?${q}`,
  nursery: `https://images.unsplash.com/photo-1459156212016-c812468e2115?${q}`,
  office: `https://images.unsplash.com/photo-1497366216548-37526070297c?${q}`,
  hero: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=80`,
} as const

export const defaultPlantPhoto = plantImages.cuttings
