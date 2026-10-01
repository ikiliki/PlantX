import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(root, 'sources.json')

const args = process.argv.slice(2)
const headed = args.includes('--headed')
const headlessFlag = args.includes('--headless')
const dryRun = args.includes('--dry-run')
const sourceFlag = readOption(args, '--source')

if (headed && headlessFlag) {
  console.error('Pass only one of --headed or --headless.')
  process.exit(1)
}

const headless = !headed
const capturedAt = new Date().toISOString()

const GRADES = new Set(['A', 'B', 'C'])
const SIZES = ['XL', 'L', 'M', 'S']
const STAGES = [
  ['MATURE', /MATURE/],
  ['EST', /ESTABLISH|\bEST\b/],
  ['ROOTED', /ROOTED/],
  ['CUT', /CUTTING|\bCUT\b/],
]

function readOption(argv, name) {
  const index = argv.indexOf(name)
  if (index === -1) return ''
  return argv[index + 1] || ''
}

function compact(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 3)}...`
}

function normalize(kind, text) {
  const raw = compact(text, 500)
  if (!raw) return { value: null, unmapped: false }
  if (!kind || kind === 'text') return { value: raw, unmapped: false }
  if (kind === 'quality') {
    const match = raw.toUpperCase().match(/\b([ABC])\b/)
    const value = match && GRADES.has(match[1]) ? match[1] : null
    return { value, unmapped: !value }
  }
  if (kind === 'size') {
    const upper = raw.toUpperCase()
    const value = SIZES.find((band) => new RegExp(`\\b${band}\\b`).test(upper)) || null
    return { value, unmapped: !value }
  }
  if (kind === 'stage') {
    const upper = raw.toUpperCase()
    const found = STAGES.find(([, pattern]) => pattern.test(upper))
    return { value: found ? found[0] : null, unmapped: !found }
  }
  return { value: raw, unmapped: false }
}

function printField(name, field) {
  const shown = field.value == null ? '(empty)' : field.value
  console.log(`  ${name.padEnd(10)} ${shown}`)
  console.log(`  ${''.padEnd(10)} selector  ${field.selector || '(none)'}`)
  console.log(`  ${''.padEnd(10)} text      ${JSON.stringify(field.text)}`)
  if (field.html) console.log(`  ${''.padEnd(10)} html      ${field.html}`)
  if (field.missing) console.log(`  ${''.padEnd(10)} missing   no element matched`)
  if (field.unmapped) console.log(`  ${''.padEnd(10)} unmapped  text did not match ${field.kind}`)
}

function toRecord(source, url, fields) {
  const record = {
    sourceId: source.id,
    url,
    capturedAt,
    snippets: {},
  }
  for (const [name, field] of Object.entries(fields)) {
    record[name] = field.value
    record.snippets[name] = {
      selector: field.selector,
      text: field.text,
      html: field.html,
    }
  }
  return record
}

async function loadConfig() {
  const parsed = JSON.parse(await readFile(configPath, 'utf8'))
  if (!Array.isArray(parsed.sources)) throw new Error('sources.json is missing a sources array')
  return parsed
}

async function loadPlaywright() {
  try {
    const playwright = await import('playwright')
    return playwright.chromium
  } catch {
    console.error('Playwright is not installed. From the repo root:')
    console.error('  npm install --save-dev playwright')
    console.error('The runner uses installed Google Chrome. If that fails:')
    console.error('  npx playwright install chromium')
    process.exit(1)
  }
}

async function launchBrowser(chromium) {
  const options = { headless, slowMo: headed ? 80 : 0 }
  try {
    return await chromium.launch({ ...options, channel: 'chrome' })
  } catch (error) {
    console.error(`Chrome channel unavailable (${error.message}). Trying bundled Chromium.`)
    return chromium.launch(options)
  }
}

async function showMatches(page, source) {
  const scope = source.recordSelector || 'body'
  const selectors = [...new Set(Object.values(source.fields).map((field) => field.selector).filter(Boolean))]
  for (const selector of selectors) {
    const locator = page.locator(scope).locator(selector)
    const count = await locator.count()
    for (let index = 0; index < count; index += 1) {
      await locator.nth(index).evaluate((element) => {
        element.style.outline = '3px solid #1b7a3a'
        element.style.outlineOffset = '2px'
        element.style.backgroundColor = 'rgba(27, 122, 58, 0.16)'
      })
    }
    if (count > 0) await locator.first().scrollIntoViewIfNeeded()
  }
  await page.waitForTimeout(700)
}

async function readPage(page, source) {
  return page.evaluate(({ recordSelector, fields }) => {
    const roots = recordSelector
      ? [...document.querySelectorAll(recordSelector)]
      : [document.body]
    return roots.map((root) => {
      const found = {}
      for (const [name, field] of Object.entries(fields)) {
        if (!field.selector) {
          found[name] = { selector: '', text: '', html: '', missing: true }
          continue
        }
        const element = root.querySelector(field.selector)
        if (!element) {
          found[name] = { selector: field.selector, text: '', html: '', missing: true }
          continue
        }
        found[name] = {
          selector: field.selector,
          text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
          html: (element.outerHTML || '').replace(/\s+/g, ' ').trim().slice(0, 500),
          missing: false,
        }
      }
      return found
    })
  }, { recordSelector: source.recordSelector || '', fields: source.fields || {} })
}

function applyKinds(source, rawRecords) {
  return rawRecords.map((raw) => {
    const fields = {}
    for (const [name, spec] of Object.entries(source.fields || {})) {
      const snippet = raw[name] || { selector: spec.selector || '', text: '', html: '', missing: true }
      const mapped = normalize(spec.kind, snippet.text)
      fields[name] = {
        ...snippet,
        html: compact(snippet.html, 180),
        kind: spec.kind || 'text',
        value: snippet.missing ? null : mapped.value,
        unmapped: snippet.missing ? false : mapped.unmapped,
      }
    }
    return fields
  })
}

async function openSource(page, source) {
  if (dryRun) {
    if (!source.fixture) return { skip: 'no local fixture' }
    if (/^https?:/i.test(source.fixture)) {
      throw new Error(`${source.id} fixture must be a local file`)
    }
    const fixturePath = path.resolve(root, source.fixture)
    const html = await readFile(fixturePath, 'utf8')
    await page.route('**/*', (route) => {
      const requestUrl = route.request().url()
      if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) return route.abort()
      return route.continue()
    })
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    if (source.startUrl) console.log(`dry-run  ignoring startUrl ${source.startUrl}`)
    return { url: pathToFileURL(fixturePath).href }
  }

  const startUrl = String(source.startUrl || '').trim()
  if (!startUrl) return { skip: 'startUrl is empty' }
  let parsed
  try {
    parsed = new URL(startUrl)
  } catch {
    throw new Error(`${source.id} has an invalid startUrl`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${source.id} startUrl must be http or https`)
  }
  await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
  return { url: page.url() }
}

async function main() {
  const config = await loadConfig()
  const chromium = await loadPlaywright()
  const browser = await launchBrowser(chromium)
  const records = []
  const skipped = []
  let failed = false

  console.log('PlantX scrape')
  console.log(`mode     ${headless ? 'headless' : 'headed'}${dryRun ? ' dry-run' : ' live'}`)
  console.log(`config   ${configPath}`)

  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } })
    const sources = config.sources.filter((source) => !sourceFlag || source.id === sourceFlag)
    if (sourceFlag && sources.length === 0) throw new Error(`No source with id ${sourceFlag}`)

    for (const source of sources) {
      console.log(`\n── ${source.id} ──`)
      if (source.enabled === false) {
        skipped.push({ id: source.id, reason: 'disabled' })
        console.log('skipped  disabled')
        continue
      }
      try {
        const opened = await openSource(page, source)
        if (opened.skip) {
          skipped.push({ id: source.id, reason: opened.skip })
          console.log(`skipped  ${opened.skip}`)
          continue
        }
        console.log(`url      ${opened.url}`)
        const extracted = applyKinds(source, await readPage(page, source))
        if (extracted.length === 0) {
          failed = true
          console.log('records  0 (selector matched nothing)')
          continue
        }
        console.log(`records  ${extracted.length}`)
        extracted.forEach((fields, index) => {
          console.log(`\n  [${index + 1}]`)
          for (const [name, field] of Object.entries(fields)) printField(name, field)
          if (Object.values(fields).some((field) => field.missing || field.unmapped)) failed = true
          records.push(toRecord(source, opened.url, fields))
        })
        if (headed) await showMatches(page, source)
      } catch (error) {
        failed = true
        skipped.push({ id: source.id, reason: error.message })
        console.error(`failed   ${error.message}`)
      } finally {
        await page.unroute('**/*').catch(() => {})
      }
    }
  } finally {
    await browser.close()
  }

  const outDir = path.join(root, 'out')
  await mkdir(outDir, { recursive: true })
  const report = {
    ranAt: capturedAt,
    headed,
    dryRun,
    skipped,
    records,
  }
  const stamp = capturedAt.replace(/[:.]/g, '-')
  const stampedPath = path.join(outDir, `${stamp}.json`)
  const latestPath = path.join(outDir, 'latest.json')
  const body = `${JSON.stringify(report, null, 2)}\n`
  await writeFile(stampedPath, body)
  await writeFile(latestPath, body)

  console.log(`\nwrote    ${latestPath}`)
  console.log(`wrote    ${stampedPath}`)
  console.log(`records  ${records.length}`)
  if (failed) process.exit(1)
}

await main()
