/**
 * Loads the catalog from src/mock/catalogGuide.ts into local QA only (port 54322).
 * Does not touch production.
 *
 *   npx tsx scripts/qa-catalog.mjs
 */
import pg from 'pg'
import { CATALOG_PLANTS } from '../src/mock/catalogGuide.ts'

const QA = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const url = new URL(QA)
if (url.port !== '54322' || url.hostname !== '127.0.0.1') {
  throw new Error('Refusing to write: this script only targets local QA on 127.0.0.1:54322')
}

const opt = (id, label, labelHe, sign = id) => ({ id, label, labelHe, sign })

const categories = CATALOG_PLANTS.map(({ id, speciesId, name, nameHe, ticker, photo }) => ({
  id,
  speciesId,
  name,
  nameHe,
  ticker,
  photo,
}))

const subcategories = CATALOG_PLANTS.flatMap((plant) =>
  plant.subs.map(({ id, name, nameHe, code, photo }) => ({ id, categoryId: plant.id, name, nameHe, code, photo })),
)

const letter = (id) => opt(id, id, id, id)

const properties = [
  {
    id: 'health',
    name: 'Health',
    nameHe: 'בריאות',
    required: true,
    inMarketName: true,
    sign: 'HLT',
    categoryIds: [],
    subcategoryIds: [],
    options: ['S', 'A', 'B', 'C', 'D'].map(letter),
  },
  {
    id: 'size',
    name: 'Size',
    nameHe: 'גודל',
    required: true,
    inMarketName: false,
    sign: '',
    categoryIds: [],
    subcategoryIds: [],
    options: ['S', 'M', 'L', 'XL'].map(letter),
  },
  {
    id: 'stage',
    name: 'Stage',
    nameHe: 'שלב',
    required: true,
    inMarketName: false,
    sign: '',
    categoryIds: [],
    subcategoryIds: [],
    options: [
      opt('CUT', 'Cutting', 'ייחור', 'CUT'),
      opt('ROOTED', 'Rooted', 'מושרש', 'R'),
      opt('EST', 'Established', 'מבוסס', 'EST'),
      opt('MATURE', 'Mature', 'בוגר', 'MAT'),
    ],
  },
  {
    id: 'growth-form',
    name: 'Growth form',
    nameHe: 'צורת גידול',
    required: true,
    inMarketName: true,
    sign: 'GF',
    categoryIds: [
      'pothos',
      'string-turtles',
      'inch-plant',
      'string-hearts',
      'string-pearls',
      'mistletoe-cactus',
      'mini-monstera',
      'melanochrysum',
    ],
    subcategoryIds: [],
    options: [
      opt('climbing', 'Climbing', 'מטפס', 'CLB'),
      opt('hanging', 'Hanging', 'תלוי', 'HNG'),
      opt('bush', 'Bush', 'שיחי', 'BSH'),
    ],
  },
  {
    id: 'fenestration',
    name: 'Fenestration',
    nameHe: 'חלונות',
    required: false,
    inMarketName: true,
    sign: 'FEN',
    categoryIds: ['monstera'],
    subcategoryIds: [],
    options: [
      opt('juvenile', 'Juvenile', 'צעיר', 'JUV'),
      opt('fenestrated', 'Fenestrated', 'עם חלונות', 'FEN'),
      opt('full-splits', 'Full splits', 'שסעים מלאים', 'SPL'),
    ],
  },
  {
    id: 'variegation',
    name: 'Variegation',
    nameHe: 'מגוון',
    required: false,
    inMarketName: true,
    sign: 'VAR',
    categoryIds: [],
    subcategoryIds: ['pothos-gold', 'pothos-marble'],
    options: [
      opt('high', 'High', 'גבוה', 'HI'),
      opt('medium', 'Medium', 'בינוני', 'MID'),
      opt('low', 'Low', 'נמוך', 'LO'),
    ],
  },
  {
    id: 'leaf-shape',
    name: 'Leaf shape',
    nameHe: 'צורת עלה',
    required: false,
    inMarketName: true,
    sign: 'LSH',
    categoryIds: ['syngonium'],
    subcategoryIds: [],
    options: [
      opt('arrow', 'Arrow', 'חץ', 'ARW'),
      opt('lobed', 'Lobed', 'אונות', 'LOB'),
      opt('split', 'Split', 'מפוצל', 'SPT'),
    ],
  },
  {
    id: 'spot-density',
    name: 'Spot density',
    nameHe: 'צפיפות נקודות',
    required: false,
    inMarketName: true,
    sign: 'SPT',
    categoryIds: ['begonia'],
    subcategoryIds: [],
    options: [
      opt('light', 'Light', 'דליל', 'LT'),
      opt('medium', 'Medium', 'בינוני', 'MID'),
      opt('heavy', 'Heavy', 'צפוף', 'HV'),
    ],
  },
  {
    id: 'bloom',
    name: 'Bloom',
    nameHe: 'פריחה',
    required: false,
    inMarketName: true,
    sign: 'BLM',
    categoryIds: ['orchid'],
    subcategoryIds: [],
    options: [
      opt('spike', 'Spike', 'שיבולת', 'SPK'),
      opt('open', 'Open', 'פתוח', 'OPN'),
      opt('resting', 'Resting', 'מנוחה', 'RST'),
    ],
  },
  {
    id: 'flowering',
    name: 'Flowering',
    nameHe: 'מצב פריחה',
    required: false,
    inMarketName: true,
    sign: 'FLW',
    categoryIds: ['african-violet', 'cyclamen', 'flamingo-flower', 'thanksgiving', 'desert-rose'],
    subcategoryIds: [],
    options: [
      opt('buds', 'Buds', 'ניצנים', 'BUD'),
      opt('blooming', 'In bloom', 'פורח', 'INB'),
      opt('resting', 'Resting', 'במנוחה', 'RST'),
    ],
  },
]

const client = new pg.Client({ connectionString: QA })
await client.connect()
try {
  await client.query('begin')
  const categoryIds = categories.map((item) => item.id)
  for (const [position, item] of categories.entries()) {
    await client.query(
      `insert into catalog_categories (id, position, species_id, name, name_he, ticker, photo)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set
         position = excluded.position,
         species_id = excluded.species_id,
         name = excluded.name,
         name_he = excluded.name_he,
         ticker = excluded.ticker,
         photo = case when excluded.photo <> '' then excluded.photo else catalog_categories.photo end`,
      [item.id, position, item.speciesId, item.name, item.nameHe, item.ticker, item.photo],
    )
  }
  for (const [position, item] of subcategories.entries()) {
    await client.query(
      `insert into catalog_subcategories (id, position, category_id, name, name_he, code, photo)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set
         position = excluded.position,
         category_id = excluded.category_id,
         name = excluded.name,
         name_he = excluded.name_he,
         code = excluded.code,
         photo = coalesce(excluded.photo, catalog_subcategories.photo)`,
      [item.id, position, item.categoryId, item.name, item.nameHe, item.code, item.photo],
    )
  }
  const keptSubs = subcategories.map((item) => item.id)
  await client.query('delete from catalog_subcategories where not (id = any($1::text[]))', [keptSubs])
  await client.query('delete from catalog_categories where not (id = any($1::text[]))', [categoryIds])
  await client.query('delete from catalog_properties')
  for (const [position, item] of properties.entries()) {
    await client.query(
      `insert into catalog_properties (id, position, name, name_he, required, in_market_name, sign)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [item.id, position, item.name, item.nameHe, item.required, item.inMarketName, item.sign],
    )
    for (const [optionPos, option] of item.options.entries()) {
      await client.query(
        `insert into catalog_property_options (property_id, id, position, label, label_he, sign)
         values ($1,$2,$3,$4,$5,$6)`,
        [item.id, option.id, optionPos, option.label, option.labelHe, option.sign],
      )
    }
    for (const categoryId of item.categoryIds) {
      await client.query(
        'insert into catalog_property_categories (property_id, category_id) values ($1, $2)',
        [item.id, categoryId],
      )
    }
    for (const subcategoryId of item.subcategoryIds) {
      await client.query(
        'insert into catalog_property_subcategories (property_id, subcategory_id) values ($1, $2)',
        [item.id, subcategoryId],
      )
    }
  }
  await client.query('commit')

  const counts = await client.query(`
    select
      (select count(*)::int from catalog_categories) as categories,
      (select count(*)::int from catalog_subcategories) as subcategories,
      (select count(*)::int from catalog_properties) as properties,
      (select count(*)::int from catalog_property_options) as options
  `)
  const names = await client.query(
    'select id, name, required from catalog_properties order by position',
  )
  const checks = await client.query(`
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = rel.oid and att.attnum = any (con.conkey)
    where con.contype = 'c'
      and rel.relname in ('plants', 'plant_grades')
      and att.attname in ('quality', 'letter')
  `)
  for (const row of checks.rows) {
    await client.query(`alter table ${row.relname} drop constraint if exists ${row.conname}`)
  }
  await client.query(
    `alter table plants add constraint plants_quality_check check (quality is null or quality in ('S', 'A', 'B', 'C', 'D'))`,
  )
  await client.query(
    `alter table plant_grades add constraint plant_grades_letter_check check (letter in ('S', 'A', 'B', 'C', 'D'))`,
  )
  console.log(JSON.stringify({ counts: counts.rows[0], properties: names.rows }, null, 2))
} catch (error) {
  await client.query('rollback')
  throw error
} finally {
  await client.end()
}
