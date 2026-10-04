import type { CatalogSuggestionDraft } from '../../../../src/mock/types.ts'
import {
  SUGGEST_OPEN_LIMIT,
  memberDraft,
  ownSuggestion,
  readSuggestionInput,
  suggestionProblem,
} from '../../../../src/features/catalog/catalogSuggest.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import { catalogService } from './catalog.service.ts'
import { fallbackDraft, type CatalogDraftHint } from './catalogDraft.ts'

const PROBLEM_TEXT = {
  name: 'Give the plant a name',
  category: 'That category is not in the catalog',
  exists: 'That plant is already in the catalog',
  photo: 'The photo is too large',
  note: 'The note is too long',
} as const

/** The only place catalog suggestions are filed: the Catalog form and identify. */
export const catalogSuggestionService = {
  async mine(userId: string) {
    const rows = await getStore().catalogSuggestions.listFor(userId)
    return rows.map((row) => ownSuggestion(row, userId))
  },

  /** A member's "Suggest a plant" form. */
  async suggestFromMember(userId: string, body: unknown) {
    const input = readSuggestionInput(body)
    const catalog = await catalogService.get()
    const problem = suggestionProblem(catalog, input)
    if (problem === 'exists') throw Errors.exists(PROBLEM_TEXT.exists)
    if (problem) throw Errors.invalid(PROBLEM_TEXT[problem])
    const store = getStore().catalogSuggestions
    const open = await store.listFor(userId)
    if (open.length >= SUGGEST_OPEN_LIMIT) throw Errors.invalid('Too many suggestions are waiting for review')
    const saved = await store.suggest({
      name: input.name,
      scientificName: input.scientificName,
      genus: input.scientificName.split(/\s+/)[0] ?? '',
      commonNames: [input.name],
      provider: '',
      draft: memberDraft(catalog, input),
      origin: 'member',
      userId,
      note: input.note,
    })
    if (!saved) throw Errors.invalid(PROBLEM_TEXT.name)
    return ownSuggestion(saved, userId)
  },

  /**
   * A scan recognized a plant that matched no category. Files it for the member who scanned before identify
   * answers, so it is already pending in their Catalog. A new row starts on the plain draft; `better` (Gemini on
   * a live scan, owned by identify) replaces it when it arrives. Never fails the scan.
   */
  async fromScan(hint: CatalogDraftHint, userId?: string, better?: () => Promise<CatalogSuggestionDraft>) {
    const store = getStore().catalogSuggestions
    try {
      const saved = await store.suggest({
        name: hint.name,
        scientificName: hint.scientificName,
        genus: hint.genus,
        commonNames: hint.commonNames,
        provider: hint.provider,
        draft: fallbackDraft(hint),
        origin: 'identify',
        userId,
      })
      if (!saved || saved.hits > 1 || !better) return
      void better()
        .then((draft) => store.setDraft(saved.id, draft))
        .catch((err) => logger.warn('catalog suggestion draft skipped', { id: saved.id }, err))
    } catch (err) {
      logger.warn('catalog suggestion skipped', undefined, err)
    }
  },
}
