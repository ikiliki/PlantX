/** Stand-in figures for the coming-soon board. Not a real price or change. */
export function maskedPrice(id: string) {
  let n = 2166136261
  for (let i = 0; i < id.length; i += 1) n = Math.imul(n ^ id.charCodeAt(i), 16777619)
  return 36 + (Math.abs(n) % 210)
}

export function maskedChange(id: string) {
  let n = 0
  for (let i = 0; i < id.length; i += 1) n = (n + id.charCodeAt(i) * (i + 3)) % 90
  return Math.round(((n % 50) - 22) * 10) / 10
}

export function maskedQty(id: string) {
  return 1 + (maskedPrice(id) % 6)
}
