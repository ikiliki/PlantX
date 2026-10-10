import type { CareRule, CareTaskRule } from '../../mock/types'

/**
 * AI care suggestions for the example catalog, written once for every category (source 'ai'), plus the few
 * varieties that differ from their category. The admin sees them under Care plans and can keep, change or
 * delete each; "Suggest with AI" asks again for one category. Mock mode and the care-plan migration use these.
 */

type Group = {
  water: CareRule
  feed?: CareRule | null
  repot?: CareRule | null
  rotate?: CareRule
  /** Humidity lovers: misting is offered, not required. */
  mist?: CareRule
}

const SPRING_SUMMER = [3, 4, 5, 6, 7, 8, 9]
const WARM = [4, 5, 6, 7, 8]

const GROUPS = {
  /** Aroids and everyday foliage: water when the top few centimetres dry. */
  tropical: { water: { everyDays: 7, winterEveryDays: 12 }, feed: { everyDays: 30, months: SPRING_SUMMER }, repot: { everyDays: 365 } },
  /** Calatheas, velvet anthuriums, alocasias: evenly moist, like humid air. */
  humid: {
    water: { everyDays: 5, winterEveryDays: 9 },
    feed: { everyDays: 30, months: SPRING_SUMMER },
    repot: { everyDays: 365 },
    mist: { everyDays: 3 },
  },
  ferns: {
    water: { everyDays: 4, winterEveryDays: 7 },
    feed: { everyDays: 30, months: [4, 5, 6, 7, 8, 9] },
    repot: { everyDays: 365 },
    mist: { everyDays: 2 },
  },
  /** Thick leaves or rhizomes that store water. */
  sturdy: { water: { everyDays: 14, winterEveryDays: 28 }, feed: { everyDays: 60, months: WARM }, repot: { everyDays: 730 } },
  succulent: { water: { everyDays: 14, winterEveryDays: 30 }, feed: { everyDays: 60, months: WARM }, repot: { everyDays: 730 } },
  /** Lithops and caudex plants: long dry spells, rarely fed. */
  desert: { water: { everyDays: 21, winterEveryDays: 45 }, feed: null, repot: { everyDays: 1095 } },
  /** Semi-succulent trailers and epiphytes. */
  trailing: { water: { everyDays: 10, winterEveryDays: 18 }, feed: { everyDays: 30, months: SPRING_SUMMER }, repot: { everyDays: 730 } },
  /** Big upright plants that lean to the window. */
  tree: {
    water: { everyDays: 7, winterEveryDays: 14 },
    feed: { everyDays: 30, months: SPRING_SUMMER },
    repot: { everyDays: 365 },
    rotate: { everyDays: 14 },
  },
  palm: { water: { everyDays: 7, winterEveryDays: 14 }, feed: { everyDays: 30, months: WARM }, repot: { everyDays: 730 } },
  orchid: { water: { everyDays: 10, winterEveryDays: 14 }, feed: { everyDays: 14, months: [3, 4, 5, 6, 7, 8, 9, 10] }, repot: { everyDays: 730 } },
  /** Bog plants on rain or distilled water; no fertiliser. */
  carnivorous: { water: { everyDays: 3, winterEveryDays: 7 }, feed: null, repot: { everyDays: 365 } },
  /** Air plants: a soak, no soil to repot. */
  air: { water: { everyDays: 7, winterEveryDays: 14 }, feed: { everyDays: 30, months: SPRING_SUMMER }, repot: null, mist: { everyDays: 3 } },
  /** Flowering pot plants fed through the year. */
  blooming: { water: { everyDays: 7, winterEveryDays: 10 }, feed: { everyDays: 14 }, repot: { everyDays: 365 } },
} satisfies Record<string, Group>

const CATEGORY_GROUP: Record<string, keyof typeof GROUPS> = {
  pothos: 'tropical',
  monstera: 'tree',
  'snake-plant': 'sturdy',
  'peace-lily': 'humid',
  'spider-plant': 'tropical',
  zz: 'sturdy',
  heartleaf: 'tropical',
  pilea: 'tropical',
  fiddle: 'tree',
  adansonii: 'tropical',
  satin: 'tropical',
  rubber: 'tree',
  gloriosum: 'humid',
  clarinervium: 'humid',
  hoya: 'trailing',
  frydek: 'humid',
  syngonium: 'tropical',
  begonia: 'humid',
  orchid: 'orchid',
  'baby-rubber': 'trailing',
  'watermelon-pep': 'trailing',
  'ripple-pep': 'trailing',
  'string-turtles': 'trailing',
  'prayer-plant': 'humid',
  orbifolia: 'humid',
  'peacock-plant': 'humid',
  pinstripe: 'humid',
  'birds-nest-fern': 'ferns',
  'boston-fern': 'ferns',
  staghorn: 'ferns',
  maidenhair: 'ferns',
  'parlor-palm': 'palm',
  'areca-palm': 'palm',
  'ponytail-palm': 'desert',
  'cast-iron': 'sturdy',
  'dragon-tree': 'tree',
  'corn-plant': 'tree',
  'inch-plant': 'tropical',
  'nerve-plant': 'humid',
  'aluminum-plant': 'tropical',
  'string-hearts': 'trailing',
  'string-pearls': 'succulent',
  jade: 'succulent',
  'aloe-vera': 'succulent',
  'zebra-haworthia': 'succulent',
  'mexican-snowball': 'succulent',
  thanksgiving: 'trailing',
  'mistletoe-cactus': 'trailing',
  'venus-flytrap': 'carnivorous',
  'mini-monstera': 'tropical',
  'hoya-kerrii': 'trailing',
  'living-stones': 'desert',
  'sky-plant': 'air',
  'desert-rose': 'desert',
  'purple-shamrock': 'tropical',
  'flamingo-flower': 'blooming',
  'bird-paradise': 'tree',
  'white-paradise': 'tree',
  fatsia: 'tropical',
  coffee: 'tree',
  banana: 'tree',
  caladium: 'humid',
  'african-violet': 'blooming',
  cyclamen: 'blooming',
  crystallinum: 'humid',
  veitchii: 'humid',
  melanochrysum: 'humid',
  cuprea: 'humid',
}

/** Varieties that differ from their category (everything else follows the category). */
const VARIETY_RULES: { categoryId: string; subcategoryId: string; taskId: string; mode?: CareTaskRule['mode']; interval?: CareRule }[] = [
  // A dwarf rosette that barely fills its pot.
  { categoryId: 'snake-plant', subcategoryId: 'snake-hahnii', taskId: 'repot', interval: { everyDays: 1095 } },
  // Variegated monstera grows slower and burns in direct sun: turn it less often.
  { categoryId: 'monstera', subcategoryId: 'monstera-albo', taskId: 'rotate', interval: { everyDays: 21 } },
  // The compact fiddle leans less.
  { categoryId: 'fiddle', subcategoryId: 'fiddle-bambino', taskId: 'rotate', interval: { everyDays: 28 } },
  // Marble Queen is slower than golden pothos: feed less.
  { categoryId: 'pothos', subcategoryId: 'pothos-marble', taskId: 'feed', interval: { everyDays: 45, months: SPRING_SUMMER } },
]

function rule(taskId: string, categoryId: string, value: CareRule | null | undefined, mode: CareTaskRule['mode'], subcategoryId?: string): CareTaskRule {
  return {
    id: `${taskId}:${subcategoryId ?? categoryId}`,
    taskId,
    categoryId,
    ...(subcategoryId ? { subcategoryId } : {}),
    mode: value === null ? 'off' : mode,
    ...(value ? { interval: value } : {}),
    source: 'ai',
  }
}

/** AI rules for one category id (empty for a category the suggestions do not know). */
export function careSuggestionsFor(categoryId: string): CareTaskRule[] {
  const group: Group | undefined = GROUPS[CATEGORY_GROUP[categoryId]]
  if (!group) return []
  const rules = [rule('water', categoryId, group.water, 'must')]
  if (group.feed !== undefined) rules.push(rule('feed', categoryId, group.feed, 'must'))
  if (group.repot !== undefined) rules.push(rule('repot', categoryId, group.repot, 'must'))
  if (group.rotate) rules.push(rule('rotate', categoryId, group.rotate, 'must'))
  if (group.mist) rules.push(rule('mist', categoryId, group.mist, 'optional'))
  for (const item of VARIETY_RULES.filter((entry) => entry.categoryId === categoryId)) {
    rules.push(rule(item.taskId, categoryId, item.interval, item.mode ?? 'must', item.subcategoryId))
  }
  return rules
}

/** Categories the suggestions know (the example catalog). */
export const SUGGESTED_CATEGORY_IDS = Object.keys(CATEGORY_GROUP)

/** Every AI rule for the example catalog. */
export function allCareSuggestions(categoryIds: string[]): CareTaskRule[] {
  return categoryIds.flatMap((id) => careSuggestionsFor(id))
}
