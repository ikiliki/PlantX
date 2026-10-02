/**
 * Downloads free-licensed Wikimedia photos for the QA catalog forms
 * into public/class-photos, then writes those paths on local QA only.
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import pg from 'pg'

const curl = promisify(execFile)

const QA = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const url = new URL(QA)
if (url.port !== '54322' || url.hostname !== '127.0.0.1') {
  throw new Error('Refusing to write: this script only targets local QA on 127.0.0.1:54322')
}

const OUT = path.resolve('public/class-photos')
const UA = 'PlantX/1.0 (local catalog; free-licensed plant photos from Wikimedia Commons)'

const reuse = {
  'pothos-gold': '/class-photos/pot-gold-a-l-mat.jpg',
  'pothos-njoy': '/class-photos/pot-njoy-b-m-est.jpg',
  'monstera-std': '/class-photos/mon-std-a-l-mat.jpg',
}

/** id, search, title must match this. */
const jobs = [
  ['pothos-marble', 'Epipremnum aureum Marble Queen', /marble/i],
  ['pothos-neon', 'Epipremnum aureum Neon pothos', /neon|aureum/i],
  ['monstera-thai', 'Monstera deliciosa Thai Constellation', /thai|constellation/i],
  ['monstera-albo', 'Monstera deliciosa albo variegata', /albo|variegat/i],
  ['snake-laurentii', 'Dracaena trifasciata Laurentii', /laurentii|trifasciata|sansevieria/i],
  ['snake-moonshine', 'Sansevieria Moonshine', /moonshine/i],
  ['snake-hahnii', 'Dracaena trifasciata Hahnii', /hahnii|bird.?nest/i],
  ['peace-wallisii', 'Spathiphyllum wallisii', /spathiphyllum/i],
  ['peace-sensation', 'Spathiphyllum Sensation -dwarf -floribundum', /sensation/i, /dwarf|floribundum/i],
  ['spider-vittatum', 'Chlorophytum comosum vittatum', /chlorophytum/i],
  ['spider-bonnie', 'intitle:Bonnie Chlorophytum', /bonnie/i],
  ['zz-std', 'Zamioculcas zamiifolia', /zamioculcas|zz plant/i],
  ['zz-raven', 'Zamioculcas zamiifolia Raven', /raven|zamioculcas/i],
  ['heart-green', 'Philodendron hederaceum', /hederaceum|scandens|heartleaf/i],
  ['heart-brasil', 'Philodendron hederaceum Brasil', /brasil/i],
  ['heart-micans', 'Philodendron micans', /micans/i],
  ['pilea-std', 'Pilea peperomioides', /pilea|peperomioides/i],
  ['fiddle-std', 'Ficus lyrata', /lyrata|fiddle/i],
  ['fiddle-bambino', 'Ficus lyrata Bambino -unfurling', /bambino/i, /unfurl|collage/i],
  ['adan-narrow', 'Monstera adansonii', /adansonii/i],
  ['adan-wide', 'Monstera adansonii', /adansonii/i, /173158377/i],
  ['satin-argy', 'Scindapsus pictus Argyraeus', /scindapsus|pictus|argy/i],
  ['satin-exotica', 'intitle:Exotica Scindapsus pictus', /exotica/i],
  ['rubber-burgundy', 'Ficus elastica Burgundy', /elastica|burgundy|robusta/i],
  ['rubber-tineke', 'intitle:Tineke Ficus', /tineke/i],
  ['rubber-ruby', 'intitle:Ruby Ficus elastica', /ruby/i],
  ['gloriosum-std', 'Philodendron gloriosum', /gloriosum/i],
  ['clarinervium-std', 'Anthurium clarinervium', /clarinervium/i],
  ['hoya-krimson', 'intitle:"Krimson Queen" Hoya', /krimson|crimson/i],
  ['hoya-compacta', 'Hoya carnosa compacta', /compacta|hoya/i],
  ['frydek-green', 'Alocasia micholitziana Frydek', /frydek|micholitziana/i],
  ['frydek-var', 'intitle:variegata Alocasia micholitziana', /variegat/i],
  ['syn-white', 'intitle:"White Butterfly" Syngonium', /butterfly|syngonium/i],
  ['syn-pink', 'Syngonium podophyllum Pink Allusion', /pink|syngonium/i],
  ['syn-neon', 'intitle:Neon Syngonium', /neon/i],
  ['begonia-std', 'Begonia maculata', /maculata|begonia/i],
  ['begonia-wightii', 'Begonia maculata Wightii', /wightii|maculata/i],
  ['orchid-white', 'Phalaenopsis amabilis white flower', /amabilis|white/i, /pink|spotted|purple|aka/i],
  ['orchid-pink', 'Phalaenopsis pink flower', /phalaenopsis/i],
  ['orchid-spotted', 'Phalaenopsis spotted flower', /phalaenopsis/i],
]

const skipTitle = /logo|icon|map|diagram|drawing|illustration|stamp|flag|coat of arms|svg|poster|painting|sketch|clipart|emoji|silhouette/i

function licenseOk(name) {
  const value = (name || '').toLowerCase()
  if (!value) return false
  if (value.includes('noncommercial') || /\bnc\b/.test(value)) return false
  return (
    value.includes('cc0') ||
    value.includes('public domain') ||
    value.includes('cc by') ||
    value.includes('cc-by')
  )
}

function textOf(meta, key) {
  const raw = meta?.[key]?.value || ''
  return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function search(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '12',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '960',
  })
  const api = `https://commons.wikimedia.org/w/api.php?${params}`
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const { stdout } = await curl('curl.exe', ['-fsSL', '-A', UA, api], { maxBuffer: 8 * 1024 * 1024 })
      const body = JSON.parse(stdout)
      return Object.values(body.query?.pages ?? {})
    } catch (error) {
      const message = String(error.stderr || error.message || '')
      if (!message.includes('429') || attempt === 5) throw error
      await new Promise((resolve) => setTimeout(resolve, attempt * 8000))
    }
  }
  return []
}

function pick(pages, need, avoid) {
  const ranked = []
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    const title = page.title.replace(/^File:/, '')
    const mime = info.mime || ''
    const license = textOf(info.extmetadata, 'LicenseShortName')
    if (!/^image\/(jpeg|png|webp)$/.test(mime)) continue
    if (skipTitle.test(title)) continue
    if (avoid && (avoid.test(title) || avoid.test(textOf(info.extmetadata, 'ImageDescription')))) continue
    if (!licenseOk(license)) continue
    if ((info.thumbwidth || info.width || 0) < 400) continue
    if (!need.test(title) && !need.test(textOf(info.extmetadata, 'ImageDescription'))) continue
    const score = (need.test(title) ? 2 : 0) + (mime === 'image/jpeg' ? 1 : 0)
    ranked.push({ title, mime, license, info, score })
  }
  ranked.sort((a, b) => b.score - a.score)
  return ranked[0] ?? null
}

await mkdir(OUT, { recursive: true })
const creditsPath = path.join(OUT, 'credits.json')
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, 'utf8')) : []
const photos = { ...reuse }
const missed = []

function savedPhoto(id) {
  for (const ext of ['jpg', 'png', 'webp']) {
    const filename = `${id}.${ext}`
    if (existsSync(path.join(OUT, filename))) return { filename, photo: `/class-photos/${filename}` }
  }
  return null
}

for (const id of ['orchid-white', 'fiddle-bambino']) {
  for (const ext of ['jpg', 'png', 'webp']) {
    const file = path.join(OUT, `${id}.${ext}`)
    if (existsSync(file)) unlinkSync(file)
  }
}

for (const [id, query, need, avoid] of jobs) {
  const saved = savedPhoto(id)
  if (saved) {
    photos[id] = saved.photo
    console.log(`KEEP ${id}`)
    continue
  }
  const pages = await search(query)
  const chosen = pick(pages, need, avoid)
  if (!chosen) {
    missed.push(id)
    console.log(`MISS ${id}`)
    continue
  }
  const ext = chosen.mime === 'image/png' ? 'png' : chosen.mime === 'image/webp' ? 'webp' : 'jpg'
  const filename = `${id}.${ext}`
  const fileUrl = chosen.info.thumburl || chosen.info.url
  const dest = path.join(OUT, filename)
  try {
    await curl('curl.exe', ['-fsSL', '-A', UA, '-o', dest, fileUrl])
  } catch {
    missed.push(id)
    console.log(`MISS ${id} download`)
    continue
  }
  photos[id] = `/class-photos/${filename}`
  const entry = {
    id,
    file: filename,
    title: chosen.title,
    author: textOf(chosen.info.extmetadata, 'Artist') || 'Wikimedia Commons',
    license: chosen.license,
    source: chosen.info.descriptionurl,
  }
  const index = credits.findIndex((item) => item.id === id)
  if (index >= 0) credits[index] = entry
  else credits.push(entry)
  console.log(`OK ${id} ${chosen.title}`)
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

writeFileSync(path.join(OUT, 'credits.json'), JSON.stringify(credits, null, 2))

const client = new pg.Client({ connectionString: QA })
await client.connect()
try {
  await client.query('begin')
  for (const [id, photo] of Object.entries(photos)) {
    await client.query('update catalog_subcategories set photo = $2 where id = $1', [id, photo])
  }
  await client.query(`
    update catalog_categories c
    set photo = s.photo
    from (
      select distinct on (category_id) category_id, photo
      from catalog_subcategories
      where photo is not null and photo <> ''
      order by category_id, position
    ) s
    where c.id = s.category_id
  `)
  await client.query('commit')
  const filled = await client.query(
    `select count(*)::int as with_photo from catalog_subcategories where photo is not null and photo <> ''`,
  )
  console.log(JSON.stringify({ saved: Object.keys(photos).length, withPhoto: filled.rows[0].with_photo, missed }))
} catch (error) {
  await client.query('rollback')
  throw error
} finally {
  await client.end()
}
