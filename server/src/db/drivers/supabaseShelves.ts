import type pg from 'pg'
import type { Shelf, ShelfPlacement } from '../../../../src/mock/types.ts'
import type { PlantxStore } from '../store.ts'

function shelfOf(row: Record<string, unknown>): Shelf {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    name: String(row.name),
    position: Number(row.position),
  }
}

function placementOf(row: Record<string, unknown>): ShelfPlacement {
  return { plantId: String(row.plant_id), shelfId: String(row.shelf_id), position: Number(row.position) }
}

/** A grower's shelves and which of their plants sits on which shelf. */
export function supabaseShelves(pool: pg.Pool): PlantxStore['shelves'] {
  return {
    async list(ownerId) {
      const result = await pool.query('select * from shelves where owner_id = $1 order by position, id', [ownerId])
      return (result.rows as Record<string, unknown>[]).map(shelfOf)
    },

    async placements(ownerId) {
      const result = await pool.query(
        `select sp.* from shelf_plants sp join shelves s on s.id = sp.shelf_id
         where s.owner_id = $1 order by sp.shelf_id, sp.position`,
        [ownerId],
      )
      return (result.rows as Record<string, unknown>[]).map(placementOf)
    },

    async add(ownerId, name) {
      const id = `shelf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
      const result = await pool.query(
        `insert into shelves (id, owner_id, name, position, created_at)
         values ($1, $2, $3, coalesce((select max(position) + 1 from shelves where owner_id = $2), 0), $4)
         returning *`,
        [id, ownerId, name, new Date().toISOString()],
      )
      return shelfOf(result.rows[0] as Record<string, unknown>)
    },

    async rename(id, name) {
      await pool.query('update shelves set name = $2 where id = $1', [id, name])
    },

    async reorder(ownerId, orderedIds) {
      const client = await pool.connect()
      try {
        await client.query('begin')
        for (const [position, id] of orderedIds.entries()) {
          await client.query('update shelves set position = $3 where id = $1 and owner_id = $2', [id, ownerId, position])
        }
        await client.query('commit')
      } catch (err) {
        await client.query('rollback')
        throw err
      } finally {
        client.release()
      }
    },

    async remove(id) {
      await pool.query('delete from shelves where id = $1', [id])
    },

    async place(plantId, shelfId) {
      if (!shelfId) {
        await pool.query('delete from shelf_plants where plant_id = $1', [plantId])
        return null
      }
      const result = await pool.query(
        `insert into shelf_plants (plant_id, shelf_id, position, placed_at)
         values ($1, $2, coalesce((select max(position) + 1 from shelf_plants where shelf_id = $2), 0), $3)
         on conflict (plant_id) do update set shelf_id = excluded.shelf_id, position = excluded.position, placed_at = excluded.placed_at
         returning *`,
        [plantId, shelfId, new Date().toISOString()],
      )
      return placementOf(result.rows[0] as Record<string, unknown>)
    },
  }
}
