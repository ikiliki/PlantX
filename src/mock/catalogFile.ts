import type { Catalog } from './types'

const API = '/api/catalog'

export async function fetchCatalogFile(): Promise<Catalog | null> {
  try {
    const res = await fetch(API, { credentials: 'include', cache: 'no-store' })
    if (!res.ok) return null
    const body = (await res.json()) as { catalog?: Catalog } | Catalog
    if (body && typeof body === 'object' && 'catalog' in body && body.catalog) return body.catalog
    return body as Catalog
  } catch {
    return null
  }
}

export async function saveCatalogFile(catalog: Catalog): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalog }),
    })
    return res.ok
  } catch {
    return false
  }
}
