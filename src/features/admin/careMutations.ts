import type { Catalog, CareTask, CareTaskRule } from '../../mock/types'
import { careTaskId } from '../todo/carePlan'

/**
 * Care plans in the admin catalog: tasks ("general tasks") and their category / variety rules. Pure; the
 * panel commits the result with `commitCatalog`, and the server cleans it again on save.
 */

function ruleKey(rule: Pick<CareTaskRule, 'taskId' | 'categoryId' | 'subcategoryId'>) {
  return `${rule.taskId}:${rule.subcategoryId ?? rule.categoryId}`
}

/** A new task gets an id from its name; an edit keeps its id. Built-in tasks keep their flag. */
export function upsertCareTask(catalog: Catalog, input: Omit<CareTask, 'id' | 'builtIn'> & { id?: string }): Catalog {
  const name = input.name.trim()
  if (!name) return catalog
  const tasks = [...catalog.careTasks]
  const existing = input.id ? tasks.find((task) => task.id === input.id) : undefined
  let id = existing?.id ?? careTaskId(name)
  if (!id) return catalog
  if (!existing) {
    let n = 2
    const base = id
    while (tasks.some((task) => task.id === id)) id = `${base}-${n++}`
  }
  const row: CareTask = {
    id,
    name,
    nameHe: input.nameHe.trim() || name,
    icon: input.icon,
    audience: input.audience,
    ...(input.interval ? { interval: input.interval } : {}),
    ...(existing?.builtIn ? { builtIn: true } : {}),
  }
  if (existing) tasks[tasks.findIndex((task) => task.id === id)] = row
  else tasks.push(row)
  return { ...catalog, careTasks: tasks }
}

/** Deleting a task drops its rules too (the server also drops every plant's tasks of that kind). */
export function deleteCareTask(catalog: Catalog, taskId: string): Catalog {
  const task = catalog.careTasks.find((item) => item.id === taskId)
  if (!task || task.builtIn) return catalog
  return {
    ...catalog,
    careTasks: catalog.careTasks.filter((item) => item.id !== taskId),
    careRules: catalog.careRules.filter((rule) => rule.taskId !== taskId),
  }
}

/** Sets one category's (or one variety's) rule for a task; whatever the admin saves is theirs (source admin). */
export function upsertCareRule(catalog: Catalog, input: Omit<CareTaskRule, 'id' | 'source'>): Catalog {
  const key = ruleKey(input)
  const row: CareTaskRule = {
    id: key,
    taskId: input.taskId,
    categoryId: input.categoryId,
    ...(input.subcategoryId ? { subcategoryId: input.subcategoryId } : {}),
    mode: input.mode,
    ...(input.interval ? { interval: input.interval } : {}),
    source: 'admin',
  }
  const rules = catalog.careRules.filter((rule) => ruleKey(rule) !== key)
  return { ...catalog, careRules: [...rules, row] }
}

export function deleteCareRule(catalog: Catalog, ruleId: string): Catalog {
  return { ...catalog, careRules: catalog.careRules.filter((rule) => rule.id !== ruleId) }
}

/** Keeps an AI rule as the admin's own: it stays when AI is asked again. */
export function acceptCareRule(catalog: Catalog, ruleId: string): Catalog {
  return {
    ...catalog,
    careRules: catalog.careRules.map((rule) => (rule.id === ruleId ? { ...rule, source: 'admin' as const } : rule)),
  }
}
