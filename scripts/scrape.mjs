/**
 * Daily catalog intake (local fixtures until a real source is added).
 *
 * Headless (default):  npm run scrape
 * Headed (watch UI):   npm run scrape:headed
 *
 * Cron or Task Scheduler should call `npm run scrape`.
 * Add a live site later as a new entry in scripts/scrape-sources.json
 * with a rowSelector and a fields selector map. Do not rewrite this script.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const root = dirname(fileURLToPath(import.meta.url))
const sourcesPath = resolve(root, 'scrape-sources.json')
const outputPath = resolve(root, 'scrape-output.json')
const SNIPPET_MAX = 160
const KNOWN = ['category', 'variety', 'grade', 'size', 'price']

const headed = process.argv.includes('--headed')
const headless = !headed
const mode = headless ? 'headless' : 'headed'

function resolveSourceUrl(raw) {
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('file:')) {
    const spec = raw.slice('file:'.length)
    if (spec.startsWith('//')) return raw
    const relative = spec.replace(/^\.\//, '').replace(/^\//, '')
    return pathToFileURL(resolve(root, relative)).href
  }
  return pathToFileURL(resolve(root, raw)).href
}

function clip(html) {
  const compact = html.replace(/\s+/g, ' ').trim()
  return compact.length > SNIPPET_MAX ? `${compact.slice(0, SNIPPET_MAX)}…` : compact
}

const config = JSON.parse(readFileSync(sourcesPath, 'utf8'))
if (!Array.isArray(config.sources) || config.sources.length === 0) {
  throw new Error('scrape-sources.json needs a sources array')
}

console.log(`Catalog intake · ${mode}`)

async function launchBrowser() {
  try {
    return await chromium.launch({ headless, channel: 'chrome' })
  } catch (error) {
    console.log(`Chrome channel unavailable (${error.message}). Trying bundled Chromium.`)
    return chromium.launch({ headless })
  }
}

const browser = await launchBrowser()
const sources = []

try {
  for (const source of config.sources) {
    if (!source.rowSelector || !source.fields) {
      throw new Error(`Source ${source.id ?? source.name} needs rowSelector and fields`)
    }
    const url = resolveSourceUrl(source.url)
    const page = await browser.newPage()
    console.log(`\n→ ${source.name}`)
    console.log(`  url      ${url}`)
    console.log(`  rows     ${source.rowSelector}`)
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const extracted = await page.$$eval(
      source.rowSelector,
      (rows, fields) =>
        rows.map((row, index) => {
          const record = {}
          for (const [name, spec] of Object.entries(fields)) {
            const el = row.querySelector(spec.selector)
            if (!el) {
              record[name] = { value: null, selector: spec.selector, snippet: '' }
              continue
            }
            record[name] = {
              value: (el.textContent || '').replace(/\s+/g, ' ').trim(),
              selector: spec.selector,
              snippet: el.outerHTML,
            }
          }
          return { index: index + 1, fields: record }
        }),
      source.fields,
    )

    console.log(`  matched  ${extracted.length} row(s)`)
    const configurations = extracted.map((row) => {
      const fields = {}
      for (const [name, field] of Object.entries(row.fields)) {
        fields[name] = { ...field, snippet: clip(field.snippet) }
        const shown = fields[name].value ?? '(missing)'
        console.log(`  row ${row.index}  ${name}: ${shown}`)
        console.log(`           selector  ${fields[name].selector}`)
        console.log(`           snippet   ${fields[name].snippet}`)
      }
      const known = {}
      const extra = {}
      for (const [name, field] of Object.entries(fields)) {
        if (KNOWN.includes(name)) known[name] = field
        else extra[name] = field
      }
      return {
        sourceId: source.id,
        sourceName: source.name,
        ...known,
        ...(Object.keys(extra).length ? { extra } : {}),
      }
    })

    sources.push({
      id: source.id,
      name: source.name,
      url,
      rowSelector: source.rowSelector,
      rowCount: configurations.length,
      configurations,
    })
    await page.close()
  }
} finally {
  await browser.close()
}

const output = {
  scrapedAt: new Date().toISOString(),
  mode,
  preview: true,
  note: 'Local fixture extract. Not a crawl of an outside site.',
  configurations: sources.flatMap((source) => source.configurations),
  sources,
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)
console.log(`\nWrote ${output.configurations.length} configuration row(s)`)
console.log(outputPath)
