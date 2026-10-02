import type { Plant, Todo } from '../../mock/types'

/**
 * Greenhouse level. Derived from what the owner already did, so it needs no table:
 * every plant added and every care task completed earns XP. No cap.
 * Pure, no React, so the server can compute the same number later.
 */

/** XP for each plant the owner added (sold plants still count: they were grown here). */
export const PLANT_XP = 50
/** XP for each completed care task (water or photo). */
export const CARE_XP = 10
/** Each level costs this much more than the one before: 100, 200, 300, … */
export const LEVEL_STEP_XP = 100

/** Rank names for the first levels. Past the list the last rank stays, and the number keeps climbing. */
export const LEVEL_RANKS = 10

export type GreenhouseLevel = {
  level: number
  /** 1-based index into the rank names, capped at `LEVEL_RANKS`. */
  rank: number
  xp: number
  /** Total XP where this level started and where the next one starts. */
  levelStartXp: number
  nextLevelXp: number
  /** 0..1 through the current level. */
  progress: number
  plants: number
  care: number
  plantXp: number
  careXp: number
}

/** Total XP needed to reach `level` (level 1 starts at 0). */
export function xpForLevel(level: number) {
  return (LEVEL_STEP_XP / 2) * level * (level - 1)
}

/** Highest level whose start is at or below `xp`. */
export function levelForXp(xp: number) {
  const safe = Math.max(0, xp)
  // Inverse of xpForLevel, then nudged for float edges.
  let level = Math.floor((1 + Math.sqrt(1 + (8 * safe) / LEVEL_STEP_XP)) / 2)
  while (xpForLevel(level + 1) <= safe) level += 1
  while (level > 1 && xpForLevel(level) > safe) level -= 1
  return Math.max(1, level)
}

export function greenhouseLevel(ownerId: string, plants: Plant[], todos: Todo[]): GreenhouseLevel {
  const plantCount = plants.filter((plant) => plant.ownerId === ownerId).length
  const careCount = todos.filter((todo) => todo.ownerId === ownerId && Boolean(todo.completedOn)).length
  const plantXp = plantCount * PLANT_XP
  const careXp = careCount * CARE_XP
  const xp = plantXp + careXp
  const level = levelForXp(xp)
  const levelStartXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  return {
    level,
    rank: Math.min(level, LEVEL_RANKS),
    xp,
    levelStartXp,
    nextLevelXp,
    progress: (xp - levelStartXp) / (nextLevelXp - levelStartXp),
    plants: plantCount,
    care: careCount,
    plantXp,
    careXp,
  }
}
