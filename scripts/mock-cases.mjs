import { chromium } from 'playwright'
import { existsSync } from 'fs'

const BASE = process.env.MOCK_URL || 'http://127.0.0.1:5174'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const results = []

function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

async function english(page) {
  const en = page.getByRole('button', { name: /^EN$/i }).first()
  if (await en.count()) await en.click().catch(() => {})
  await page.waitForTimeout(200)
}

async function go(page, href) {
  await page.evaluate((to) => document.querySelector(`a[href="${to}"]`)?.click(), href)
  await page.waitForTimeout(800)
}

async function login(page, userId) {
  const tab = page.getByRole('button', { name: /Demo|דמו/i }).first()
  await tab.waitFor({ timeout: 8000 })
  await tab.hover()
  await page.waitForTimeout(200)
  const pin = page.getByRole('button', { name: /Pin|נעיצה|הצמדה|Unpin|בטל/i }).first()
  if (await pin.count() && (await pin.getAttribute('aria-pressed')) !== 'true') await pin.click()
  const select = page.locator('select[aria-label]').first()
  await select.waitFor({ timeout: 5000 })
  await select.selectOption(userId)
  await page.waitForTimeout(600)
}

const browser = await chromium.launch({
  executablePath: existsSync(CHROME) ? CHROME : undefined,
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
page.on('pageerror', (err) => check('page error', false, String(err).slice(0, 180)))

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await english(page)
const landing = await page.locator('body').innerText()
check('landing mentions greenhouse XP', /50 XP/.test(landing) && /Greenhouse XP/i.test(landing), landing.includes('50 XP') ? '50 XP visible' : 'XP copy missing')
check('landing tour mentions level', /level ring/i.test(landing))

await page.goto(BASE + '/greenhouse', { waitUntil: 'domcontentloaded' })
await english(page)
const guest = await page.locator('body').innerText()
check('guest greenhouse asks to sign in', /sign in/i.test(guest))

await page.goto(BASE + '/home', { waitUntil: 'domcontentloaded' })
await english(page)
await login(page, 'u-maya')
await go(page, '/greenhouse')
await english(page)
const greenhouse = await page.locator('body').innerText()
check('Maya greenhouse shows a level', /Greenhouse level/i.test(greenhouse), greenhouse.replace(/\s+/g, ' ').slice(0, 180))
check('Maya greenhouse shows XP', /\d+\s*XP/i.test(greenhouse))
check('Maya greenhouse has plants', /Add another plant/i.test(greenhouse))

await go(page, '/tasks')
await english(page)
const tasks = await page.locator('body').innerText()
check('Maya tasks calendar is open', /Today|Planned|Water/i.test(tasks), tasks.replace(/\s+/g, ' ').slice(0, 160))

await go(page, '/wiki')
await english(page)
const wiki = await page.locator('body').innerText()
check('catalog is open', /Common|Pothos|Catalog/i.test(wiki))

await login(page, 'u-ari')
await go(page, '/greenhouse')
await english(page)
const empty = await page.locator('body').innerText()
check('new grower greenhouse is empty', /first plant/i.test(empty), empty.replace(/\s+/g, ' ').slice(0, 180))

const failed = results.filter((row) => !row.ok)
console.log(JSON.stringify({ base: BASE, passed: results.length - failed.length, failed: failed.length, results }, null, 2))
await browser.close()
if (failed.length) process.exit(1)
