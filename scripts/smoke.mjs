import puppeteer from 'puppeteer-core'

const chrome =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const routes = [
  '/',
  '/home',
  '/login',
  '/market',
  '/plants/pl-daniel-maple',
  '/sellers/u-daniel',
  '/greenhouse',
  '/sell',
  '/messages',
  '/admin',
  '/claim',
  '/settings',
  '/future/financing',
]

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})

await page.goto('http://127.0.0.1:5173/home', { waitUntil: 'networkidle0', timeout: 30000 })

// Login as Maya via demo select
await page.waitForSelector('select')
const selects = await page.$$('select')
// persona select is first
await selects[0].select('u-maya')
await page.waitForFunction(() => document.body.innerText.includes('מאיה') || document.body.innerText.includes('Maya') || document.body.innerText.length > 100)

const results = []
for (const route of routes) {
  await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
  const text = await page.evaluate(() => document.body.innerText.slice(0, 200))
  const hasContent = text.trim().length > 20
  results.push({ route, hasContent, preview: text.replace(/\s+/g, ' ').slice(0, 80) })
}

// Switch language to English
await page.goto('http://127.0.0.1:5173/home', { waitUntil: 'networkidle0' })
const sels = await page.$$('select')
await sels[1].select('en')
await page.waitForFunction(() => document.documentElement.lang === 'en')
const enText = await page.evaluate(() => document.body.innerText.includes('Discover') || document.body.innerText.includes('Market'))

// Admin
await page.goto('http://127.0.0.1:5173/home', { waitUntil: 'networkidle0' })
const sels4 = await page.$$('select')
await sels4[0].select('u-dana')
await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle0' })
const adminOk = await page.evaluate(() => document.body.innerText.includes('stolen') || document.body.innerText.includes('גנוב') || document.body.innerText.includes('Moderation') || document.body.innerText.includes('מודרציה') || document.body.innerText.includes('open'))

// Financing gate
await page.goto('http://127.0.0.1:5173/future/financing', { waitUntil: 'networkidle0' })
const finDisabled = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.disabled)
  return Boolean(btn)
})

console.log(JSON.stringify({
  routes: results,
  enText,
  adminOk,
  finDisabled,
  errors: errors.slice(0, 20),
}, null, 2))

await browser.close()
process.exit(errors.length ? 1 : 0)
