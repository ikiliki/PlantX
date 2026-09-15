import puppeteer from 'puppeteer-core'

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

// Reset demo
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('button')]
  const reset = buttons.find((b) => /איפוס|Reset/i.test(b.textContent || ''))
  reset?.click()
})
await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})

await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' })
// Click Maya enter button
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('button')]
  const maya = buttons.find((b) => /כניסה כדמות|Enter as/i.test(b.textContent || ''))
  maya?.click()
})
await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {})
await new Promise((r) => setTimeout(r, 500))

const user = await page.evaluate(() => localStorage.getItem('plantx-mock-db-v1'))
const parsed = JSON.parse(user)
const checks = {
  loggedInAsMaya: parsed.currentUserId === 'u-maya',
  localeHe: parsed.locale === 'he',
}

await page.goto('http://127.0.0.1:5173/greenhouse', { waitUntil: 'networkidle0' })
checks.greenhouseHasMother = await page.evaluate(() =>
  document.body.innerText.includes('פוטוס אם') || document.body.innerText.includes('Mother'),
)

await page.goto('http://127.0.0.1:5173/demand/dm-pothos-1000', { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) =>
    /שליחת התחייבות|Submit commitment/i.test(b.textContent || ''),
  )
  btn?.click()
})
await new Promise((r) => setTimeout(r, 300))
const after = JSON.parse(await page.evaluate(() => localStorage.getItem('plantx-mock-db-v1')))
checks.commitmentAdded = after.commitments.length > parsed.commitments.length || after.commitments.some((c) => c.id.startsWith('cm-') && c.growerId === 'u-maya')

// Switch to Yael events and advance phase
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await page.select('select', 'u-yael')
await page.goto('http://127.0.0.1:5173/events', { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /in use/i.test(b.textContent || ''))
  btn?.click()
})
await new Promise((r) => setTimeout(r, 200))
const ev = JSON.parse(await page.evaluate(() => localStorage.getItem('plantx-mock-db-v1')))
checks.eventInUse = ev.events[0].phase === 'in_use'

// Admin resolve
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
const selects = await page.$$('select')
await selects[0].select('u-dana')
await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle0' })
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => /סגור|Resolve/i.test(b.textContent || ''))
  btn?.click()
})
await new Promise((r) => setTimeout(r, 200))
const mod = JSON.parse(await page.evaluate(() => localStorage.getItem('plantx-mock-db-v1')))
checks.moderationResolved = mod.moderation.some((m) => m.status === 'resolved')

// Financing button disabled
await page.goto('http://127.0.0.1:5173/future/financing', { waitUntil: 'networkidle0' })
checks.financingBlocked = await page.evaluate(() =>
  [...document.querySelectorAll('button')].some((b) => b.disabled && /חסום|blocked/i.test(b.textContent || '')),
)

console.log(JSON.stringify({ checks, errors }, null, 2))
await browser.close()
process.exit(Object.values(checks).every(Boolean) && errors.length === 0 ? 0 : 1)
