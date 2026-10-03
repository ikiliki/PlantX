/**
 * Write back only what a service changed. Take a snapshot right after `list()`, mutate the rows,
 * then pass `changedSince(before, rows)` to the store's `upsert` (new rows count as changed).
 */
export function snapshot<T extends { id: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, JSON.stringify(row)]))
}

export function changedSince<T extends { id: string }>(before: Map<string, string>, rows: T[]) {
  return rows.filter((row) => before.get(row.id) !== JSON.stringify(row))
}
