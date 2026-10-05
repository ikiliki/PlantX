import { useEffect, useState } from 'react'
import { createCatalog } from '../../mock/catalog'
import { fetchMyCatalogSuggestions, postCatalogSuggestion } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { Catalog, CatalogSuggestion, CatalogSuggestionInput, Diagnosis } from '../../mock/types'
import { SUGGEST_OPEN_LIMIT, memberDraft, suggestionProblem, type SuggestProblem } from './catalogSuggest'

/** Mock mode keeps suggestions in the browser, next to the mock store. QA and production use the API. */
const MOCK_KEY = 'plantx.mock.catalogSuggestions'

const listeners = new Set<() => void>()

/** Every mounted list (Catalog, admin Requests) loads again. */
export function catalogSuggestionsChanged() {
  listeners.forEach((listener) => listener())
}

export function readMockSuggestions(): CatalogSuggestion[] {
  try {
    const raw = localStorage.getItem(MOCK_KEY)
    const rows = raw ? (JSON.parse(raw) as CatalogSuggestion[]) : []
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export function writeMockSuggestions(rows: CatalogSuggestion[]) {
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows))
  } catch {
    // Storage full or blocked: the mock list stays as it was.
  }
  catalogSuggestionsChanged()
}

/** Mark a mock row added or declined (admin Requests in mock mode). */
export function decideMockSuggestion(id: string, status: 'added' | 'dismissed', draft?: CatalogSuggestion['draft']) {
  writeMockSuggestions(
    readMockSuggestions().map((row) =>
      row.id === id && row.status === 'open' ? { ...row, status, draft: draft ?? row.draft } : row,
    ),
  )
}


export function useSuggestionsVersion() {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const bump = () => setVersion((value) => value + 1)
    listeners.add(bump)
    return () => {
      listeners.delete(bump)
    }
  }, [])
  return version
}

export type SuggestResult =
  | { ok: true; suggestion: CatalogSuggestion }
  | { ok: false; problem: SuggestProblem | 'limit' | 'failed' }

/** The signed-in member's open suggestions, and the form's submit. */
export function useMySuggestions() {
  const { db, plantxEnv, currentUser, signedIn } = useStore()
  const userId = signedIn ? (currentUser?.id ?? '') : ''
  const version = useSuggestionsVersion()
  const [rows, setRows] = useState<CatalogSuggestion[]>([])

  useEffect(() => {
    if (!userId) {
      setRows([])
      return
    }
    if (plantxEnv === 'mock') {
      setRows(readMockSuggestions().filter((row) => row.status === 'open' && row.suggestedBy.includes(userId)))
      return
    }
    let cancel = false
    void fetchMyCatalogSuggestions().then((list) => {
      if (!cancel && list) setRows(list)
    })
    return () => {
      cancel = true
    }
  }, [userId, plantxEnv, version])

  const submit = async (input: CatalogSuggestionInput): Promise<SuggestResult> => {
    const catalog = db.catalog ?? createCatalog()
    const problem = suggestionProblem(catalog, input)
    if (problem) return { ok: false, problem }
    if (plantxEnv === 'mock') {
      if (rows.length >= SUGGEST_OPEN_LIMIT) return { ok: false, problem: 'limit' }
      const suggestion: CatalogSuggestion = {
        id: `sug-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        name: input.name.trim(),
        scientificName: input.scientificName.trim(),
        genus: input.scientificName.trim().split(/\s+/)[0] ?? '',
        commonNames: [input.name.trim()],
        provider: '',
        hits: 1,
        status: 'open',
        origin: 'member',
        suggestedBy: [userId],
        note: input.note.trim(),
        draft: memberDraft(catalog, input),
      }
      writeMockSuggestions([suggestion, ...readMockSuggestions()])
      return { ok: true, suggestion }
    }
    const outcome = await postCatalogSuggestion(input)
    if (outcome.ok) {
      catalogSuggestionsChanged()
      return { ok: true, suggestion: outcome.data.suggestion }
    }
    const { status, message = '' } = outcome.failure
    if (status === 409) return { ok: false, problem: 'exists' }
    if (status === 400 && /too many/i.test(message)) return { ok: false, problem: 'limit' }
    return { ok: false, problem: 'failed' }
  }

  return { suggestions: rows, submit }
}
