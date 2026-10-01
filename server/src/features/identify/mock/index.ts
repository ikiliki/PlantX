import type { Catalog, IdentifyMockScenario, IdentifyProviderId } from '../../../../../src/mock/types.ts'
import { parseGeminiBody } from '../providers/gemini.ts'
import { parsePlantidBody } from '../providers/plantid.ts'
import { parsePlantnetBody } from '../providers/plantnet.ts'
import type { RawSuggestion } from '../types.ts'
import { applyMockPlan, type MockPlan } from './applyPlan.ts'
import { geminiMockBody } from './gemini.fixture.ts'
import { plantidMockBody } from './plantid.fixture.ts'
import { plantnetMockBody } from './plantnet.fixture.ts'

const MOCKS: Record<IdentifyProviderId, (catalog: Catalog, scenario: IdentifyMockScenario) => RawSuggestion> = {
  plantid: (catalog, scenario) => parsePlantidBody(plantidMockBody(catalog, scenario), catalog),
  plantnet: (catalog, scenario) => parsePlantnetBody(plantnetMockBody(catalog, scenario), catalog),
  gemini: (catalog, scenario) => parseGeminiBody(geminiMockBody(catalog, scenario), catalog),
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300))
}

/** Canned provider body through the real parser. No network, keys, or credits. */
export async function mockIdentify(
  provider: IdentifyProviderId,
  catalog: Catalog,
  scenario: IdentifyMockScenario,
  plan?: MockPlan,
): Promise<RawSuggestion> {
  await delay()
  return applyMockPlan(MOCKS[provider](catalog, scenario), catalog, scenario, plan)
}
