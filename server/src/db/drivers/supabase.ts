import pg from 'pg'
import type {
  Catalog,
  CatalogProperty,
  PhotoCheck,
  Plant,
  PlantIdentification,
  User,
} from '../../../../src/mock/types.ts'
import type { FeatureId, PageId, PlacementId, SystemConfig } from '../../../../src/theme/release.ts'
import type { Activity } from '../../features/activity/activity.types.ts'
import type { Todo } from '../../features/todo/todo.types.ts'
import type { PendingTransaction, PendingUser } from '../../features/users/users.types.ts'
import type { PlantxStore } from '../store.ts'
import { supabaseCatalogSuggestions } from './supabaseCatalogSuggestions.ts'
import { supabaseIdentifyRequests } from './supabaseIdentifyRequests.ts'
import { supabaseIssueReports } from './supabaseIssueReports.ts'
import { supabaseIdentifySettings } from './supabaseIdentifySettings.ts'

const { Pool } = pg
type PoolClient = pg.PoolClient
type SqlRow = Record<string, unknown>

/** `all` replaces the table with the list (seeding, admin bulk edits). `rows` writes only the given rows. */
type SaveMode = 'all' | 'rows'

function connectionString() {
  const url = (process.env.DATABASE_URL || process.env.PROD_DATABASE_URL || '').trim()
  if (!url) {
    throw new Error(
      'DATABASE_URL is required. Local Docker: npm run dev:qa. Hosted production: set PROD_DATABASE_URL in .env',
    )
  }
  return url
}

function isLocal(url: string) {
  return /@(127\.0\.0\.1|localhost)(:|\/)/.test(url)
}

/**
 * Session mode on `pooler.supabase.com:5432` allows about 15 clients (EMAXCONNSESSION).
 * Serverless needs transaction mode on port 6543, which shares server connections.
 */
function hostedPoolerUrl(url: string) {
  if (!/pooler\.supabase\.(?:com|co)/.test(url)) return url
  if (/pooler\.supabase\.(?:com|co):6543\b/.test(url)) return url
  if (/pooler\.supabase\.(?:com|co):5432\b/.test(url)) {
    return url.replace(/(pooler\.supabase\.(?:com|co)):5432\b/, '$1:6543')
  }
  return url.replace(/(pooler\.supabase\.(?:com|co))(?!:\d)/, '$1:6543')
}

/**
 * Supabase Postgres driver. Swap this file for another PlantxStore to leave Supabase.
 * Local QA uses the Docker stack from `npm run qa:up` (postgres/postgres on port 54322).
 * A hosted process keeps one idle-closing client so warm instances do not fill the pool.
 */
export function createSupabaseStore(): PlantxStore {
  const raw = connectionString()
  const local = isLocal(raw)
  const url = local ? raw : hostedPoolerUrl(raw)
  const pool = new Pool({
    connectionString: url,
    max: local ? 10 : 1,
    idleTimeoutMillis: local ? undefined : 1000,
    allowExitOnIdle: !local,
    ssl: local || url.includes('sslmode=') ? undefined : { rejectUnauthorized: false },
  })

  void pool
    .query(`
      alter table plants drop constraint if exists plants_quality_check;
      alter table plants alter column quality drop not null;
      alter table plants add constraint plants_quality_check check (quality is null or quality in ('S', 'A', 'B', 'C', 'D'));
    `)
    .catch(() => undefined)

  async function rows(client: PoolClient, sql: string, params: unknown[] = []) {
    const result = await client.query(sql, params)
    return result.rows as SqlRow[]
  }

  async function withTx<T>(fn: (client: PoolClient) => Promise<T>) {
    const client = await pool.connect()
    try {
      await client.query('begin')
      const value = await fn(client)
      await client.query('commit')
      return value
    } catch (err) {
      try {
        await client.query('rollback')
      } catch {
        /* connection already failed */
      }
      throw err
    } finally {
      client.release()
    }
  }

  async function ids(client: PoolClient, sql: string) {
    const found = await rows(client, sql)
    return new Set(found.map((row) => String(row.id)))
  }

  /**
   * Row positions. `all` (saveAll) renumbers the list as given. `rows` (upsert) keeps a stored row's
   * position and puts new rows before the first or after the last, so one write never touches the rest.
   */
  async function placer(
    client: PoolClient,
    table: string,
    items: { id: string }[],
    mode: SaveMode,
    place: 'first' | 'last',
  ): Promise<(id: string, index: number) => number> {
    if (mode === 'all') return (_id, index) => index
    const known = new Map(
      (await rows(client, `select id, position from ${table} where id = any($1::text[])`, [items.map((item) => item.id)])).map(
        (row) => [String(row.id), Number(row.position)] as const,
      ),
    )
    const edge = await rows(client, `select coalesce(${place === 'first' ? 'min' : 'max'}(position), 0) as p from ${table}`)
    const fresh = items.filter((item) => !known.has(item.id))
    const base = Number(edge[0]?.p ?? 0)
    fresh.forEach((item, i) => known.set(item.id, place === 'first' ? base - fresh.length + i : base + 1 + i))
    return (id) => known.get(id) ?? 0
  }

  return {
    driver: 'supabase',

    async isReady() {
      const found = await withTx((client) =>
        rows(client, `select 1 as ok from system_config where id = 'default' limit 1`),
      )
      return found.length > 0
    },

    users: {
      list: () => withTx(listUsers),
      saveAll: (users) => withTx((client) => saveUsers(client, users)),
      upsert: (users) => withTx((client) => saveUsers(client, users, 'rows')),
    },
    pendingUsers: {
      list: () => withTx(listPendingUsers),
      saveAll: (items) => withTx((client) => savePendingUsers(client, items)),
      upsert: (items) => withTx((client) => savePendingUsers(client, items, 'rows')),
    },
    pendingTransactions: {
      list: () => withTx(listPendingTransactions),
      saveAll: (items) => withTx((client) => savePendingTransactions(client, items)),
    },
    plants: {
      list: () => withTx(listPlants),
      count: () =>
        withTx(async (client) => {
          const found = await rows(client, 'select count(*)::int as n from plants')
          return Number(found[0]?.n ?? 0)
        }),
      saveAll: (plants) => withTx((client) => savePlants(client, plants)),
      upsert: (plants) => withTx((client) => savePlants(client, plants, 'rows')),
    },
    activities: {
      list: () => withTx(listActivities),
      saveAll: (items) => withTx((client) => saveActivities(client, items)),
      upsert: (items) => withTx((client) => saveActivities(client, items, 'rows')),
    },
    todos: {
      list: () => withTx(listTodos),
      saveAll: (items) => withTx((client) => saveTodos(client, items)),
      upsert: (items) => withTx((client) => saveTodos(client, items, 'rows')),
    },
    catalog: {
      get: () => withTx(getCatalog),
      save: (catalog) => withTx((client) => saveCatalog(client, catalog)),
    },
    system: {
      get: () => withTx(getSystem),
      save: (system) => withTx((client) => saveSystem(client, system)),
    },
    identifyRequests: supabaseIdentifyRequests(pool),
    issueReports: supabaseIssueReports(pool),
    identifySettings: supabaseIdentifySettings(pool),
    catalogSuggestions: supabaseCatalogSuggestions(pool),
  }

  async function listUsers(client: PoolClient): Promise<User[]> {
    const people = await rows(client, 'select * from users order by position, id')
    const specialties = await rows(
      client,
      'select * from user_specialties order by user_id, locale, position',
    )
    const friends = await rows(client, 'select * from user_friends order by user_id, position')
    return people.map((row) => {
      const id = text(row, 'id')
      const user: User = {
        id,
        name: text(row, 'name'),
        nameHe: text(row, 'name_he'),
        role: text(row, 'role') as User['role'],
        region: text(row, 'region'),
        regionHe: text(row, 'region_he'),
        bio: text(row, 'bio'),
        bioHe: text(row, 'bio_he'),
        rating: num(row, 'rating'),
        completedOrders: num(row, 'completed_orders'),
        verificationRate: num(row, 'verification_rate'),
        cancellations: num(row, 'cancellations'),
        specialties: labels(specialties, id, 'en'),
        specialtiesHe: labels(specialties, id, 'he'),
        avatarColor: text(row, 'avatar_color'),
        friendIds: friends.filter((item) => text(item, 'user_id') === id).map((item) => text(item, 'friend_id')),
        accountStatus: text(row, 'account_status') as User['accountStatus'],
        preapproved: Boolean(row.preapproved),
      }
      const businessName = optional(row, 'business_name')
      const businessNameHe = optional(row, 'business_name_he')
      const email = optional(row, 'email')
      const nickname = optional(row, 'nickname')
      const avatarIcon = optional(row, 'avatar_icon')
      const lat = optionalNum(row, 'lat')
      const lng = optionalNum(row, 'lng')
      if (businessName) user.businessName = businessName
      if (businessNameHe) user.businessNameHe = businessNameHe
      if (email) user.email = email
      if (nickname) user.nickname = nickname
      if (avatarIcon) user.avatarIcon = avatarIcon
      if (lat != null) user.lat = lat
      if (lng != null) user.lng = lng
      return user
    })
  }

  async function saveUsers(client: PoolClient, users: User[], mode: SaveMode = 'all') {
    const known = new Set(users.map((user) => user.id))
    if (mode === 'rows') for (const id of await ids(client, 'select id from users')) known.add(id)
    const cleaned = users.map((user) => ({
      ...user,
      friendIds: [...new Set((user.friendIds ?? []).filter((id) => known.has(id) && id !== user.id))],
      specialties: user.specialties ?? [],
      specialtiesHe: user.specialtiesHe ?? [],
    }))
    if (cleaned.length === 0) {
      if (mode === 'all') await client.query('delete from users')
      return
    }
    const positionOf = await placer(client, 'users', cleaned, mode, 'last')
    for (const [index, user] of cleaned.entries()) {
      const position = positionOf(user.id, index)
      await client.query(
        `insert into users (
          id, position, name, name_he, role, business_name, business_name_he,
          region, region_he, lat, lng, bio, bio_he, rating, completed_orders,
          verification_rate, cancellations, avatar_color, email, account_status, preapproved,
          nickname, avatar_icon
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
        )
        on conflict (id) do update set
          position = excluded.position,
          name = excluded.name,
          name_he = excluded.name_he,
          role = excluded.role,
          business_name = excluded.business_name,
          business_name_he = excluded.business_name_he,
          region = excluded.region,
          region_he = excluded.region_he,
          lat = excluded.lat,
          lng = excluded.lng,
          bio = excluded.bio,
          bio_he = excluded.bio_he,
          rating = excluded.rating,
          completed_orders = excluded.completed_orders,
          verification_rate = excluded.verification_rate,
          cancellations = excluded.cancellations,
          avatar_color = excluded.avatar_color,
          email = excluded.email,
          account_status = excluded.account_status,
          preapproved = excluded.preapproved,
          nickname = excluded.nickname,
          avatar_icon = excluded.avatar_icon`,
        [
          user.id,
          position,
          user.name,
          user.nameHe,
          user.role,
          user.businessName ?? null,
          user.businessNameHe ?? null,
          user.region,
          user.regionHe,
          user.lat ?? null,
          user.lng ?? null,
          user.bio,
          user.bioHe,
          user.rating,
          user.completedOrders,
          user.verificationRate,
          user.cancellations,
          user.avatarColor,
          user.email?.trim() ? user.email.trim() : null,
          user.accountStatus ?? 'active',
          Boolean(user.preapproved),
          user.nickname?.trim() ? user.nickname.trim() : null,
          user.avatarIcon?.trim() ? user.avatarIcon.trim() : 'seed',
        ],
      )
    }
    const kept = cleaned.map((user) => user.id)
    await client.query('delete from user_specialties where user_id = any($1::text[])', [kept])
    await client.query('delete from user_friends where user_id = any($1::text[])', [kept])
    for (const user of cleaned) {
      for (const [position, label] of user.specialties.entries()) {
        await client.query(
          'insert into user_specialties (user_id, locale, position, label) values ($1, $2, $3, $4)',
          [user.id, 'en', position, label],
        )
      }
      for (const [position, label] of user.specialtiesHe.entries()) {
        await client.query(
          'insert into user_specialties (user_id, locale, position, label) values ($1, $2, $3, $4)',
          [user.id, 'he', position, label],
        )
      }
      for (const [position, friendId] of user.friendIds.entries()) {
        await client.query(
          'insert into user_friends (user_id, position, friend_id) values ($1, $2, $3)',
          [user.id, position, friendId],
        )
      }
    }
    if (mode === 'all') await client.query('delete from users where not (id = any($1::text[]))', [kept])
  }

  async function listPendingUsers(client: PoolClient): Promise<PendingUser[]> {
    const found = await rows(client, 'select * from pending_users order by position, id')
    return found.map((row) => {
      const item: PendingUser = {
        id: text(row, 'id'),
        name: text(row, 'name'),
        email: text(row, 'email'),
        createdAt: text(row, 'created_at'),
        status: text(row, 'status') as PendingUser['status'],
      }
      const note = optional(row, 'note')
      const approvedAt = optional(row, 'approved_at')
      const rejectedAt = optional(row, 'rejected_at')
      const userId = optional(row, 'user_id')
      if (note) item.note = note
      if (approvedAt) item.approvedAt = approvedAt
      if (rejectedAt) item.rejectedAt = rejectedAt
      if (userId) item.userId = userId
      return item
    })
  }

  async function savePendingUsers(client: PoolClient, items: PendingUser[], mode: SaveMode = 'all') {
    const userIds = await ids(client, 'select id from users')
    if (items.length === 0) {
      if (mode === 'all') await client.query('delete from pending_users')
      return
    }
    const positionOf = await placer(client, 'pending_users', items, mode, 'first')
    for (const [index, item] of items.entries()) {
      const position = positionOf(item.id, index)
      await client.query(
        `insert into pending_users (
          id, position, name, email, note, created_at, status, approved_at, rejected_at, user_id
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        on conflict (id) do update set
          position = excluded.position,
          name = excluded.name,
          email = excluded.email,
          note = excluded.note,
          created_at = excluded.created_at,
          status = excluded.status,
          approved_at = excluded.approved_at,
          rejected_at = excluded.rejected_at,
          user_id = excluded.user_id`,
        [
          item.id,
          position,
          item.name,
          item.email,
          item.note ?? null,
          item.createdAt,
          item.status,
          item.approvedAt ?? null,
          item.rejectedAt ?? null,
          item.userId && userIds.has(item.userId) ? item.userId : null,
        ],
      )
    }
    if (mode === 'all') {
      await client.query('delete from pending_users where not (id = any($1::text[]))', [items.map((item) => item.id)])
    }
  }

  async function listPendingTransactions(client: PoolClient): Promise<PendingTransaction[]> {
    const found = await rows(client, 'select * from pending_transactions order by position, id')
    return found.map((row) => {
      const item: PendingTransaction = {
        id: text(row, 'id'),
        kind: text(row, 'kind') as PendingTransaction['kind'],
        userId: text(row, 'user_id'),
        label: text(row, 'label'),
        labelHe: text(row, 'label_he'),
        createdAt: text(row, 'created_at'),
        status: text(row, 'status') as PendingTransaction['status'],
      }
      const amount = optionalNum(row, 'amount')
      if (amount != null) item.amount = amount
      return item
    })
  }

  async function savePendingTransactions(client: PoolClient, items: PendingTransaction[]) {
    const userIds = await ids(client, 'select id from users')
    const kept = items.filter((item) => userIds.has(item.userId))
    if (kept.length === 0) {
      await client.query('delete from pending_transactions')
      return
    }
    for (const [position, item] of kept.entries()) {
      await client.query(
        `insert into pending_transactions (
          id, position, kind, user_id, label, label_he, amount, created_at, status
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        on conflict (id) do update set
          position = excluded.position,
          kind = excluded.kind,
          user_id = excluded.user_id,
          label = excluded.label,
          label_he = excluded.label_he,
          amount = excluded.amount,
          created_at = excluded.created_at,
          status = excluded.status`,
        [
          item.id,
          position,
          item.kind,
          item.userId,
          item.label,
          item.labelHe,
          item.amount ?? null,
          item.createdAt,
          item.status,
        ],
      )
    }
    await client.query('delete from pending_transactions where not (id = any($1::text[]))', [
      kept.map((item) => item.id),
    ])
  }

  async function listPlants(client: PoolClient): Promise<Plant[]> {
    const plants = await rows(client, 'select * from plants order by position, id')
    const photos = await rows(client, 'select * from plant_photos order by plant_id, position')
    const traits = await rows(client, 'select * from plant_traits order by plant_id, position')
    const history = await rows(client, 'select * from plant_history order by plant_id, position')
    const comps = await rows(client, 'select * from plant_comps order by plant_id, position')
    const grades = await rows(client, 'select * from plant_grades order by plant_id, position')
    const identifications = (await hasIdentifications(client))
      ? await rows(client, 'select * from plant_identifications')
      : []
    const checks = (await hasIdentifyLinks(client))
      ? await rows(client, 'select * from plant_photo_checks order by plant_id, position')
      : []
    return plants.map((row) => {
      const plant = plantFrom(row, photos, traits, history, comps, grades)
      const found = identifications.find((item) => text(item, 'plant_id') === plant.id)
      if (found) {
        plant.identification = identificationFrom(found)
        const mine = checks.filter((item) => text(item, 'plant_id') === plant.id)
        if (mine.length > 0) plant.identification.photos = mine.map(photoCheckFrom)
      }
      return plant
    })
  }

  /** Prod may not have the migration yet. A failed query would abort the transaction, so check first. */
  async function hasIdentifications(client: PoolClient) {
    const found = await rows(client, `select to_regclass('public.plant_identifications') as name`)
    return Boolean(found[0]?.name)
  }

  /** `plant_photo_checks` ships with the request links and the `scan` / `added` activity kinds. */
  async function hasIdentifyLinks(client: PoolClient) {
    const found = await rows(client, `select to_regclass('public.plant_photo_checks') as name`)
    return Boolean(found[0]?.name)
  }

  async function savePlants(client: PoolClient, plants: Plant[], mode: SaveMode = 'all') {
    if (plants.length === 0) {
      if (mode === 'all') await client.query('delete from plants')
      return
    }
    const subIds = await ids(client, 'select id from catalog_subcategories')
    const ownerIds = await ids(client, 'select id from users')
    const keptPlants = plants.filter((plant) => ownerIds.has(plant.ownerId))
    const keptIds = new Set(keptPlants.map((plant) => plant.id))
    if (keptPlants.length === 0) {
      if (mode === 'all') await client.query('delete from plants')
      return
    }
    // A parent may be a stored plant this write does not carry.
    const parentIds = mode === 'rows' ? new Set([...keptIds, ...(await ids(client, 'select id from plants'))]) : keptIds
    const positionOf = await placer(client, 'plants', keptPlants, mode, 'first')
    for (const [index, plant] of keptPlants.entries()) {
      const position = positionOf(plant.id, index)
      await client.query(
        `insert into plants (
          id, position, code, owner_id, species_id, market_class_id, variety, variety_he,
          subcategory_id, title, title_he, description, description_he, quantity, size_grade,
          size_band, quality, rooting, stage, pot_format, pot_format_he, pot_size_cm,
          stem_length_cm, leaf_count, location_zone, location_zone_he, lat, lng, parent_id,
          batch_id, propagated_at, verified_at, verified_by, photo_at, watered_at, status,
          published_at, rarity, growth_time_en, growth_time_he, growth_light, growth_light_he,
          growth_water, growth_water_he, growth_note, growth_note_he, created_at
        ) values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,null,$29,$30,$31,$32,$33,$34,$35,$36,$37,
          $38,$39,$40,$41,$42,$43,$44,$45,$46
        )
        on conflict (id) do update set
          position = excluded.position,
          code = excluded.code,
          owner_id = excluded.owner_id,
          species_id = excluded.species_id,
          market_class_id = excluded.market_class_id,
          variety = excluded.variety,
          variety_he = excluded.variety_he,
          subcategory_id = excluded.subcategory_id,
          title = excluded.title,
          title_he = excluded.title_he,
          description = excluded.description,
          description_he = excluded.description_he,
          quantity = excluded.quantity,
          size_grade = excluded.size_grade,
          size_band = excluded.size_band,
          quality = excluded.quality,
          rooting = excluded.rooting,
          stage = excluded.stage,
          pot_format = excluded.pot_format,
          pot_format_he = excluded.pot_format_he,
          pot_size_cm = excluded.pot_size_cm,
          stem_length_cm = excluded.stem_length_cm,
          leaf_count = excluded.leaf_count,
          location_zone = excluded.location_zone,
          location_zone_he = excluded.location_zone_he,
          lat = excluded.lat,
          lng = excluded.lng,
          batch_id = excluded.batch_id,
          propagated_at = excluded.propagated_at,
          verified_at = excluded.verified_at,
          verified_by = excluded.verified_by,
          photo_at = excluded.photo_at,
          watered_at = excluded.watered_at,
          status = excluded.status,
          published_at = excluded.published_at,
          rarity = excluded.rarity,
          growth_time_en = excluded.growth_time_en,
          growth_time_he = excluded.growth_time_he,
          growth_light = excluded.growth_light,
          growth_light_he = excluded.growth_light_he,
          growth_water = excluded.growth_water,
          growth_water_he = excluded.growth_water_he,
          growth_note = excluded.growth_note,
          growth_note_he = excluded.growth_note_he,
          created_at = excluded.created_at`,
        plantParams(plant, position, subIds),
      )
    }
    for (const plant of keptPlants) {
      const parentId = plant.parentId && parentIds.has(plant.parentId) ? plant.parentId : null
      await client.query('update plants set parent_id = $2 where id = $1', [plant.id, parentId])
    }
    const kept = [...keptIds]
    await client.query('delete from plant_photos where plant_id = any($1::text[])', [kept])
    await client.query('delete from plant_traits where plant_id = any($1::text[])', [kept])
    await client.query('delete from plant_history where plant_id = any($1::text[])', [kept])
    await client.query('delete from plant_comps where plant_id = any($1::text[])', [kept])
    await client.query('delete from plant_grades where plant_id = any($1::text[])', [kept])
    for (const plant of keptPlants) {
      for (const [position, url] of (plant.photos ?? []).entries()) {
        await client.query('insert into plant_photos (plant_id, position, url) values ($1, $2, $3)', [
          plant.id,
          position,
          url,
        ])
      }
      for (const [position, [key, value]] of Object.entries(plant.traits ?? {}).entries()) {
        await client.query(
          'insert into plant_traits (plant_id, position, trait_key, trait_value) values ($1, $2, $3, $4)',
          [plant.id, position, key, value],
        )
      }
      for (const [position, event] of (plant.history ?? []).entries()) {
        await client.query(
          'insert into plant_history (plant_id, position, at, label, label_he) values ($1, $2, $3, $4, $5)',
          [plant.id, position, event.at, event.label, event.labelHe],
        )
      }
      for (const [position, comp] of (plant.comps ?? []).entries()) {
        await client.query(
          'insert into plant_comps (plant_id, position, price, on_date, note, note_he) values ($1, $2, $3, $4, $5, $6)',
          [plant.id, position, comp.price, comp.date, comp.note, comp.noteHe],
        )
      }
      const seenGraders = new Set<string>()
      for (const [position, grade] of (plant.grades ?? []).entries()) {
        if (seenGraders.has(grade.graderId)) continue
        seenGraders.add(grade.graderId)
        await client.query(
          'insert into plant_grades (plant_id, position, grader_id, letter, at) values ($1, $2, $3, $4, $5)',
          [plant.id, position, grade.graderId, grade.letter, grade.at],
        )
      }
    }
    if (await hasIdentifications(client)) {
      await client.query('delete from plant_identifications where plant_id = any($1::text[])', [kept])
      const wanted = keptPlants.flatMap((plant) => (plant.identification?.requestId ? [plant.identification.requestId] : []))
      const requestIds = new Set(
        (await rows(client, 'select id from identify_requests where id = any($1::text[])', [wanted])).map((row) =>
          String(row.id),
        ),
      )
      for (const plant of keptPlants) {
        const found = plant.identification
        if (!found) continue
        await client.query(
          `insert into plant_identifications (
            plant_id, source, provider, mode, label, scientific_name, probability, request_id, identified_at
          ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            plant.id,
            found.source,
            found.provider ?? null,
            found.mode ?? null,
            found.label ?? null,
            found.scientificName ?? null,
            found.probability ?? null,
            found.requestId && requestIds.has(found.requestId) ? found.requestId : null,
            found.at,
          ],
        )
      }
      if (await hasIdentifyLinks(client)) {
        await client.query('delete from plant_photo_checks where plant_id = any($1::text[])', [kept])
        const checkIds = keptPlants.flatMap((plant) =>
          (plant.identification?.photos ?? []).flatMap((check) => (check.requestId ? [check.requestId] : [])),
        )
        const knownChecks = new Set(
          (await rows(client, 'select id from identify_requests where id = any($1::text[])', [checkIds])).map((row) =>
            String(row.id),
          ),
        )
        for (const plant of keptPlants) {
          for (const check of plant.identification?.photos ?? []) {
            await client.query(
              `insert into plant_photo_checks (
                plant_id, position, result, request_id, provider, mode, label, probability
              ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
              [
                plant.id,
                check.position,
                check.result,
                check.requestId && knownChecks.has(check.requestId) ? check.requestId : null,
                check.provider ?? null,
                check.mode ?? null,
                check.label ?? null,
                check.probability ?? null,
              ],
            )
          }
        }
      }
    }
    if (mode === 'all') await client.query('delete from plants where not (id = any($1::text[]))', [kept])
  }

  /** Care todos. Missing until the todos migration runs. */
  async function hasTodos(client: PoolClient) {
    const found = await rows(client, `select to_regclass('public.todos') as name`)
    return Boolean(found[0]?.name)
  }

  async function listTodos(client: PoolClient): Promise<Todo[]> {
    if (!(await hasTodos(client))) return []
    const found = await rows(client, 'select * from todos order by position, id')
    return found.map((row) => {
      const todo: Todo = {
        id: text(row, 'id'),
        ownerId: text(row, 'owner_id'),
        plantId: text(row, 'plant_id'),
        category: text(row, 'category') as Todo['category'],
        subcategory: text(row, 'subcategory') as Todo['subcategory'],
        dueOn: optional(row, 'due_on') ?? null,
        completedOn: optional(row, 'completed_on') ?? null,
        createdAt: text(row, 'created_at'),
      }
      return todo
    })
  }

  async function saveTodos(client: PoolClient, items: Todo[], mode: SaveMode = 'all') {
    if (!(await hasTodos(client))) return
    const userIds = await ids(client, 'select id from users')
    const plantIds = await ids(client, 'select id from plants')
    const kept = items.filter((item) => userIds.has(item.ownerId) && plantIds.has(item.plantId))
    if (kept.length === 0) {
      if (mode === 'all') await client.query('delete from todos')
      return
    }
    const positionOf = await placer(client, 'todos', kept, mode, 'first')
    // Close finished rows before inserting the next open one. todos_open_unique
    // allows one open row per plant and kind, and Postgres checks it on each insert.
    const pending = kept.map((item, index) => ({ item, position: positionOf(item.id, index) }))
    pending.sort((a, b) => Number(a.item.completedOn == null) - Number(b.item.completedOn == null))
    for (const { item, position } of pending) {
      await client.query(
        `insert into todos (id, position, owner_id, plant_id, category, subcategory, due_on, completed_on, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         on conflict (id) do update set
           position = excluded.position,
           owner_id = excluded.owner_id,
           plant_id = excluded.plant_id,
           category = excluded.category,
           subcategory = excluded.subcategory,
           due_on = excluded.due_on,
           completed_on = excluded.completed_on,
           created_at = excluded.created_at`,
        [
          item.id,
          position,
          item.ownerId,
          item.plantId,
          item.category,
          item.subcategory,
          item.dueOn,
          item.completedOn,
          item.createdAt,
        ],
      )
    }
    if (mode === 'all') await client.query('delete from todos where not (id = any($1::text[]))', [kept.map((item) => item.id)])
  }

  async function listActivities(client: PoolClient): Promise<Activity[]> {
    const found = await rows(client, 'select * from activities order by position, id')
    return found.map((row) => {
      const activity: Activity = {
        id: text(row, 'id'),
        kind: text(row, 'kind') as Activity['kind'],
        userId: text(row, 'user_id'),
        body: text(row, 'body'),
        bodyHe: text(row, 'body_he'),
        createdAt: text(row, 'created_at'),
      }
      const plantId = optional(row, 'plant_id')
      if (plantId) activity.plantId = plantId
      const requestId = optional(row, 'identify_request_id')
      if (requestId) activity.identifyRequestId = requestId
      return activity
    })
  }

  async function saveActivities(client: PoolClient, items: Activity[], mode: SaveMode = 'all') {
    const userIds = await ids(client, 'select id from users')
    const plantIds = await ids(client, 'select id from plants')
    const linked = await hasIdentifyLinks(client)
    // Without the migration the kind check rejects scan / added, so they are not stored.
    const kept = items.filter(
      (item) => userIds.has(item.userId) && (linked || (item.kind !== 'scan' && item.kind !== 'added')),
    )
    if (kept.length === 0) {
      if (mode === 'all') await client.query('delete from activities')
      return
    }
    const positionOf = await placer(client, 'activities', kept, mode, 'first')
    const wanted = kept.flatMap((item) => (item.identifyRequestId ? [item.identifyRequestId] : []))
    const requestIds = linked
      ? new Set(
          (await rows(client, 'select id from identify_requests where id = any($1::text[])', [wanted])).map((row) =>
            String(row.id),
          ),
        )
      : new Set<string>()
    for (const [index, item] of kept.entries()) {
      const params = [
        item.id,
        positionOf(item.id, index),
        item.kind,
        item.userId,
        item.plantId && plantIds.has(item.plantId) ? item.plantId : null,
        item.body,
        item.bodyHe,
        item.createdAt,
      ]
      if (linked) {
        await client.query(
          `insert into activities (id, position, kind, user_id, plant_id, body, body_he, created_at, identify_request_id)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           on conflict (id) do update set
             position = excluded.position,
             kind = excluded.kind,
             user_id = excluded.user_id,
             plant_id = excluded.plant_id,
             body = excluded.body,
             body_he = excluded.body_he,
             created_at = excluded.created_at,
             identify_request_id = excluded.identify_request_id`,
          [
            ...params,
            item.identifyRequestId && requestIds.has(item.identifyRequestId) ? item.identifyRequestId : null,
          ],
        )
        continue
      }
      await client.query(
        `insert into activities (id, position, kind, user_id, plant_id, body, body_he, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (id) do update set
           position = excluded.position,
           kind = excluded.kind,
           user_id = excluded.user_id,
           plant_id = excluded.plant_id,
           body = excluded.body,
           body_he = excluded.body_he,
           created_at = excluded.created_at`,
        params,
      )
    }
    if (mode === 'all') {
      await client.query('delete from activities where not (id = any($1::text[]))', [kept.map((item) => item.id)])
    }
  }

  async function getCatalog(client: PoolClient): Promise<Catalog> {
    const categories = await rows(client, 'select * from catalog_categories order by position, id')
    const subcategories = await rows(client, 'select * from catalog_subcategories order by position, id')
    const properties = await rows(client, 'select * from catalog_properties order by position, id')
    const options = await rows(
      client,
      'select * from catalog_property_options order by property_id, position',
    )
    const categoryLinks = await rows(client, 'select * from catalog_property_categories')
    const subcategoryLinks = await rows(client, 'select * from catalog_property_subcategories')
    return {
      categories: categories.map((row) => ({
        id: text(row, 'id'),
        speciesId: text(row, 'species_id'),
        name: text(row, 'name'),
        nameHe: text(row, 'name_he'),
        ticker: text(row, 'ticker'),
        photo: text(row, 'photo'),
      })),
      subcategories: subcategories.map((row) => {
        const item = {
          id: text(row, 'id'),
          categoryId: text(row, 'category_id'),
          name: text(row, 'name'),
          nameHe: text(row, 'name_he'),
          code: text(row, 'code'),
        }
        const photo = optional(row, 'photo')
        return photo ? { ...item, photo } : item
      }),
      properties: properties.map((row) => propertyFrom(row, options, categoryLinks, subcategoryLinks)),
    }
  }

  async function saveCatalog(client: PoolClient, catalog: Catalog) {
    const categoryIds = catalog.categories.map((item) => item.id)
    for (const [position, item] of catalog.categories.entries()) {
      await client.query(
        `insert into catalog_categories (id, position, species_id, name, name_he, ticker, photo)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id) do update set
           position = excluded.position,
           species_id = excluded.species_id,
           name = excluded.name,
           name_he = excluded.name_he,
           ticker = excluded.ticker,
           photo = excluded.photo`,
        [item.id, position, item.speciesId, item.name, item.nameHe, item.ticker, item.photo ?? ''],
      )
    }
    const knownCategories = new Set(categoryIds)
    for (const [position, item] of catalog.subcategories.entries()) {
      if (!knownCategories.has(item.categoryId)) continue
      await client.query(
        `insert into catalog_subcategories (id, position, category_id, name, name_he, code, photo)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (id) do update set
           position = excluded.position,
           category_id = excluded.category_id,
           name = excluded.name,
           name_he = excluded.name_he,
           code = excluded.code,
           photo = excluded.photo`,
        [item.id, position, item.categoryId, item.name, item.nameHe, item.code, item.photo ?? null],
      )
    }
    const keptSubs = catalog.subcategories.filter((item) => knownCategories.has(item.categoryId)).map((item) => item.id)
    await client.query(
      `update plants set subcategory_id = null
       where subcategory_id is not null and not (subcategory_id = any($1::text[]))`,
      [keptSubs],
    )
    await client.query('delete from catalog_subcategories where not (id = any($1::text[]))', [keptSubs])
    await client.query('delete from catalog_categories where not (id = any($1::text[]))', [categoryIds])

    await client.query('delete from catalog_properties')
    const liveCategories = new Set(categoryIds)
    const liveSubs = new Set(keptSubs)
    for (const [position, item] of catalog.properties.entries()) {
      await client.query(
        `insert into catalog_properties (id, position, name, name_he, required, in_market_name, sign)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [item.id, position, item.name, item.nameHe, item.required, item.inMarketName, item.sign ?? ''],
      )
      for (const [optionPos, option] of item.options.entries()) {
        await client.query(
          `insert into catalog_property_options (property_id, id, position, label, label_he, sign)
           values ($1,$2,$3,$4,$5,$6)`,
          [item.id, option.id, optionPos, option.label, option.labelHe, option.sign ?? ''],
        )
      }
      for (const categoryId of item.categoryIds) {
        if (!liveCategories.has(categoryId)) continue
        await client.query(
          'insert into catalog_property_categories (property_id, category_id) values ($1, $2)',
          [item.id, categoryId],
        )
      }
      for (const subcategoryId of item.subcategoryIds) {
        if (!liveSubs.has(subcategoryId)) continue
        await client.query(
          'insert into catalog_property_subcategories (property_id, subcategory_id) values ($1, $2)',
          [item.id, subcategoryId],
        )
      }
    }
  }

  async function getSystem(client: PoolClient): Promise<Partial<SystemConfig> | null> {
    const config = await rows(client, `select launched from system_config where id = 'default'`)
    if (!config[0]) return null
    const pages = await rows(client, 'select * from system_pages')
    const features = await rows(client, 'select * from system_features')
    const placements = await rows(client, 'select * from system_placements')
    const pageMap = {} as SystemConfig['pages']
    for (const row of pages) pageMap[text(row, 'page_id') as PageId] = text(row, 'status') as SystemConfig['pages'][PageId]
    const featureMap = {} as SystemConfig['features']
    for (const row of features) {
      featureMap[text(row, 'feature_id') as FeatureId] = {
        enabled: Boolean(row.enabled),
        status: text(row, 'status') as SystemConfig['features'][FeatureId]['status'],
      }
    }
    const placementMap = {} as SystemConfig['placements']
    for (const row of placements) {
      placementMap[text(row, 'placement_id') as PlacementId] = { enabled: Boolean(row.enabled) }
    }
    return {
      launched: Boolean(config[0].launched),
      pages: pageMap,
      features: featureMap,
      placements: placementMap,
    }
  }

  async function saveSystem(client: PoolClient, system: SystemConfig) {
    await client.query(
      `insert into system_config (id, launched) values ('default', $1)
       on conflict (id) do update set launched = excluded.launched`,
      [system.launched],
    )
    await client.query('delete from system_pages')
    await client.query('delete from system_features')
    await client.query('delete from system_placements')
    for (const [pageId, status] of Object.entries(system.pages)) {
      await client.query('insert into system_pages (page_id, status) values ($1, $2)', [pageId, status])
    }
    for (const [featureId, feature] of Object.entries(system.features)) {
      await client.query(
        'insert into system_features (feature_id, enabled, status) values ($1, $2, $3)',
        [featureId, feature.enabled, feature.status],
      )
    }
    for (const [placementId, placement] of Object.entries(system.placements)) {
      await client.query('insert into system_placements (placement_id, enabled) values ($1, $2)', [
        placementId,
        placement.enabled,
      ])
    }
  }
}

function plantParams(plant: Plant, position: number, subIds: Set<string>) {
  return [
    plant.id,
    position,
    plant.code,
    plant.ownerId,
    plant.speciesId,
    plant.marketClassId ?? null,
    plant.variety ?? null,
    plant.varietyHe ?? null,
    plant.subcategoryId && subIds.has(plant.subcategoryId) ? plant.subcategoryId : null,
    plant.title,
    plant.titleHe,
    plant.description ?? null,
    plant.descriptionHe ?? null,
    plant.quantity,
    plant.sizeGrade,
    plant.sizeBand ?? null,
    plant.quality || null,
    plant.rooting,
    plant.stage ?? null,
    plant.potFormat ?? null,
    plant.potFormatHe ?? null,
    plant.potSizeCm ?? null,
    plant.stemLengthCm ?? null,
    plant.leafCount ?? null,
    plant.locationZone,
    plant.locationZoneHe,
    plant.lat,
    plant.lng,
    plant.batchId ?? null,
    plant.propagatedAt ?? null,
    plant.verifiedAt ?? null,
    plant.verifiedBy ?? null,
    // Cleared after todo.backfillFromPlants. Still written while legacy dates exist.
    plant.photoAt ?? null,
    plant.wateredAt ?? null,
    plant.status,
    plant.publishedAt ?? null,
    plant.rarity ?? null,
    plant.growthTime?.en ?? null,
    plant.growthTime?.he ?? null,
    plant.conditions?.light ?? null,
    plant.conditions?.lightHe ?? null,
    plant.conditions?.water ?? null,
    plant.conditions?.waterHe ?? null,
    plant.conditions?.note ?? null,
    plant.conditions?.noteHe ?? null,
    plant.createdAt,
  ]
}

function identificationFrom(row: SqlRow): PlantIdentification {
  const found: PlantIdentification = {
    source: text(row, 'source') as PlantIdentification['source'],
    at: text(row, 'identified_at'),
  }
  assign(found, 'provider', optional(row, 'provider') as PlantIdentification['provider'])
  assign(found, 'mode', optional(row, 'mode') as PlantIdentification['mode'])
  assign(found, 'label', optional(row, 'label'))
  assign(found, 'scientificName', optional(row, 'scientific_name'))
  assign(found, 'probability', optionalNum(row, 'probability'))
  assign(found, 'requestId', optional(row, 'request_id'))
  return found
}

function photoCheckFrom(row: SqlRow): PhotoCheck {
  const check: PhotoCheck = {
    position: num(row, 'position'),
    result: text(row, 'result') as PhotoCheck['result'],
  }
  assign(check, 'requestId', optional(row, 'request_id'))
  assign(check, 'provider', optional(row, 'provider') as PhotoCheck['provider'])
  assign(check, 'mode', optional(row, 'mode') as PhotoCheck['mode'])
  assign(check, 'label', optional(row, 'label'))
  assign(check, 'probability', optionalNum(row, 'probability'))
  return check
}

function plantFrom(
  row: SqlRow,
  photos: SqlRow[],
  traits: SqlRow[],
  history: SqlRow[],
  comps: SqlRow[],
  grades: SqlRow[],
): Plant {
  const id = text(row, 'id')
  const plant: Plant = {
    id,
    code: text(row, 'code'),
    ownerId: text(row, 'owner_id'),
    speciesId: text(row, 'species_id'),
    title: text(row, 'title'),
    titleHe: text(row, 'title_he'),
    photos: photos.filter((item) => text(item, 'plant_id') === id).map((item) => text(item, 'url')),
    quantity: num(row, 'quantity'),
    sizeGrade: text(row, 'size_grade'),
    quality: text(row, 'quality') as Plant['quality'],
    rooting: text(row, 'rooting') as Plant['rooting'],
    locationZone: text(row, 'location_zone'),
    locationZoneHe: text(row, 'location_zone_he'),
    lat: num(row, 'lat'),
    lng: num(row, 'lng'),
    status: text(row, 'status') as Plant['status'],
    createdAt: text(row, 'created_at'),
    history: history
      .filter((item) => text(item, 'plant_id') === id)
      .map((item) => ({ at: text(item, 'at'), label: text(item, 'label'), labelHe: text(item, 'label_he') })),
  }
  assign(plant, 'marketClassId', optional(row, 'market_class_id'))
  assign(plant, 'variety', optional(row, 'variety'))
  assign(plant, 'varietyHe', optional(row, 'variety_he'))
  assign(plant, 'subcategoryId', optional(row, 'subcategory_id'))
  assign(plant, 'description', optional(row, 'description'))
  assign(plant, 'descriptionHe', optional(row, 'description_he'))
  assign(plant, 'sizeBand', optional(row, 'size_band') as Plant['sizeBand'])
  assign(plant, 'stage', optional(row, 'stage') as Plant['stage'])
  assign(plant, 'potFormat', optional(row, 'pot_format'))
  assign(plant, 'potFormatHe', optional(row, 'pot_format_he'))
  assign(plant, 'potSizeCm', optionalNum(row, 'pot_size_cm'))
  assign(plant, 'stemLengthCm', optionalNum(row, 'stem_length_cm'))
  assign(plant, 'leafCount', optionalNum(row, 'leaf_count'))
  assign(plant, 'parentId', optional(row, 'parent_id'))
  assign(plant, 'batchId', optional(row, 'batch_id'))
  assign(plant, 'propagatedAt', optional(row, 'propagated_at'))
  assign(plant, 'verifiedAt', optional(row, 'verified_at'))
  assign(plant, 'verifiedBy', optional(row, 'verified_by'))
  // Legacy care dates — todo.backfillFromPlants moves them into todos, then clears these.
  assign(plant, 'photoAt', optional(row, 'photo_at'))
  assign(plant, 'wateredAt', optional(row, 'watered_at'))
  assign(plant, 'publishedAt', optional(row, 'published_at'))
  assign(plant, 'rarity', optional(row, 'rarity') as Plant['rarity'])
  const growthEn = optional(row, 'growth_time_en')
  const growthHe = optional(row, 'growth_time_he')
  if (growthEn || growthHe) plant.growthTime = { en: growthEn ?? '', he: growthHe ?? '' }
  const light = optional(row, 'growth_light')
  const lightHe = optional(row, 'growth_light_he')
  const water = optional(row, 'growth_water')
  const waterHe = optional(row, 'growth_water_he')
  const note = optional(row, 'growth_note')
  const noteHe = optional(row, 'growth_note_he')
  if (light || lightHe || water || waterHe || note || noteHe) {
    plant.conditions = {
      light: light ?? '',
      lightHe: lightHe ?? '',
      water: water ?? '',
      waterHe: waterHe ?? '',
      note: note ?? '',
      noteHe: noteHe ?? '',
    }
  }
  const traitRows = traits.filter((item) => text(item, 'plant_id') === id)
  if (traitRows.length) {
    plant.traits = Object.fromEntries(traitRows.map((item) => [text(item, 'trait_key'), text(item, 'trait_value')]))
  }
  const compRows = comps.filter((item) => text(item, 'plant_id') === id)
  if (compRows.length) {
    plant.comps = compRows.map((item) => ({
      price: num(item, 'price'),
      date: text(item, 'on_date'),
      note: text(item, 'note'),
      noteHe: text(item, 'note_he'),
    }))
  }
  const gradeRows = grades.filter((item) => text(item, 'plant_id') === id)
  if (gradeRows.length) {
    plant.grades = gradeRows.map((item) => ({
      letter: text(item, 'letter') as NonNullable<Plant['grades']>[number]['letter'],
      at: text(item, 'at'),
      graderId: text(item, 'grader_id'),
    }))
  }
  return plant
}

function propertyFrom(
  row: SqlRow,
  options: SqlRow[],
  categoryLinks: SqlRow[],
  subcategoryLinks: SqlRow[],
): CatalogProperty {
  const id = text(row, 'id')
  return {
    id,
    name: text(row, 'name'),
    nameHe: text(row, 'name_he'),
    required: Boolean(row.required),
    inMarketName: Boolean(row.in_market_name),
    sign: text(row, 'sign'),
    categoryIds: categoryLinks
      .filter((item) => text(item, 'property_id') === id)
      .map((item) => text(item, 'category_id')),
    subcategoryIds: subcategoryLinks
      .filter((item) => text(item, 'property_id') === id)
      .map((item) => text(item, 'subcategory_id')),
    options: options
      .filter((item) => text(item, 'property_id') === id)
      .map((item) => ({
        id: text(item, 'id'),
        label: text(item, 'label'),
        labelHe: text(item, 'label_he'),
        sign: text(item, 'sign'),
      })),
  }
}

function labels(rows: SqlRow[], userId: string, locale: string) {
  return rows
    .filter((row) => text(row, 'user_id') === userId && text(row, 'locale') === locale)
    .map((row) => text(row, 'label'))
}

function text(row: SqlRow, key: string) {
  const value = row[key]
  return value == null ? '' : String(value)
}

function optional(row: SqlRow, key: string) {
  const value = row[key]
  if (value == null || value === '') return undefined
  return String(value)
}

function num(row: SqlRow, key: string) {
  return Number(row[key] ?? 0)
}

function optionalNum(row: SqlRow, key: string) {
  const value = row[key]
  if (value == null || value === '') return undefined
  return Number(value)
}

function assign<T extends object, K extends keyof T>(target: T, key: K, value: T[K] | undefined) {
  if (value !== undefined) target[key] = value
}
