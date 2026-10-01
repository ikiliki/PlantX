import type { DemoScenarios } from './types'

/** Signed-out visitor, a blank account, an unverified greenhouse, or a full one. */
export type PersonaKind = 'guest' | 'new' | 'unverified' | 'rich' | 'admin'

/** Stable demo scenario ids shown in pickers instead of personal names. */
export type PersonaScenarioId =
  | 'guest'
  | 'new'
  | 'unverified'
  | 'richCollection'
  | 'richCollector'
  | 'richNursery'
  | 'admin'

const guest: DemoScenarios = {
  updates: 'mixed',
  market: 'mixed',
  greenhouse: 'empty',
  topGreenhouses: 'ranked',
  gradeStack: 'full',
  publishRequirement: 'verified',
  marketBanner: 'full',
  trades: 'some',
}

const blank: DemoScenarios = {
  updates: 'empty',
  market: 'none',
  greenhouse: 'empty',
  topGreenhouses: 'empty',
  gradeStack: 'empty',
  publishRequirement: 'verified',
  marketBanner: 'empty',
  trades: 'none',
}

const unverified: DemoScenarios = {
  ...guest,
  greenhouse: 'mixed',
  publishRequirement: 'verified',
}

const rich: DemoScenarios = {
  updates: 'mixed',
  market: 'mixed',
  greenhouse: 'mixed',
  topGreenhouses: 'ranked',
  gradeStack: 'few',
  publishRequirement: 'none',
  marketBanner: 'full',
  trades: 'some',
}

/** Five greenhouse accounts, plus the admin. Guest is a signed-out visitor, not a greenhouse. */
const KIND: Record<string, PersonaKind> = {
  'u-ari': 'new',
  'u-noa': 'unverified',
  'u-maya': 'rich',
  'u-daniel': 'rich',
  'u-gal': 'rich',
  'u-dana': 'admin',
}

const SCENARIO: Record<string, PersonaScenarioId> = {
  'u-ari': 'new',
  'u-noa': 'unverified',
  'u-maya': 'richCollection',
  'u-daniel': 'richCollector',
  'u-gal': 'richNursery',
  'u-dana': 'admin',
}

const FLAGS: Record<PersonaKind, DemoScenarios> = {
  guest,
  new: blank,
  unverified,
  rich,
  admin: rich,
}

export function personaKind(userId: string | null): PersonaKind {
  if (!userId || userId === 'u-guest') return 'guest'
  return KIND[userId] ?? 'rich'
}

/** Scenario id for demo pickers — what world this account stands for. */
export function personaScenarioId(userId: string | null): PersonaScenarioId {
  if (!userId || userId === 'u-guest') return 'guest'
  return SCENARIO[userId] ?? 'richCollection'
}

/** Mock slices that belong to this persona. Switching persona replaces the previous slices. */
export function personaFlags(userId: string | null): DemoScenarios {
  return { ...FLAGS[personaKind(userId)] }
}
