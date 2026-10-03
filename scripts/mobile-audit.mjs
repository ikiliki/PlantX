/**
 * Mobile overflow audit: walks routes at phone widths and reports elements
 * that stick out past the viewport or past their own box.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = 'http://127.0.0.1:5174'
const OUT = join(process.cwd(), 'scripts', 'tmp-mobile-audit')
const WIDTHS = (process.env.WIDTHS || '320,360,390,430,768').split(',').map(Number)
const SHOTS = process.env.SHOTS === '1'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const LANG = process.env.LANG_UI || 'EN'
mkdirSync(OUT, { recursive: true })

const USER_ROUTES = [
  '/landing',
  '/home',
  '/greenhouse',
  '/greenhouse?tab=needs',
  '/greenhouse?tab=upcoming',
  '/tasks',
  '/market',
  '/market/categories',
  '/rank',
  '/wiki',
  '/settings',
  '/login',
]
const ADMIN_ROUTES = ['/admin/server', '/admin/system', '/admin/requests', '/admin/apis']

async function spaGo(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
  await page.waitForTimeout(900)
}

async function lang(page) {
  const btn = page.getByRole('button', { name: new RegExp(`^${LANG}$`, 'i') }).first()
  if (await btn.count()) await btn.click({ force: true }).catch(() => {})
}

async function selectPersona(page, re) {
  const tab = page.getByRole('button', { name: /Demo|דמו/i }).first()
  if (!(await tab.count())) return false
  await tab.hover()
  await page.waitForTimeout(300)
  for (const s of await page.locator('select[aria-label]').all()) {
    for (const opt of await s.locator('option').all()) {
      const label = ((await opt.textContent()) || '').trim()
      if (re.test(label)) {
        await s.selectOption((await opt.getAttribute('value')) || { label })
        await page.waitForTimeout(700)
        return label
      }
    }
  }
  return false
}

async function hideDemo(page) {
  await page.mouse.move(200, 400)
  await page.addStyleTag({ content: '[data-demo-hidden]{display:none!important}' })
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      if (!/^(DEMO|דמו)/.test(el.innerText || '')) continue
      let p = el
      while (p.parentElement && p.parentElement !== document.body && /^(DEMO|דמו)/.test(p.parentElement.innerText || '')) p = p.parentElement
      if (getComputedStyle(p).position !== 'fixed' && p.querySelector('main')) return
      p.setAttribute('data-demo-hidden', '')
      return
    }
  })
}

function audit() {
  const vw = document.documentElement.clientWidth
  const scrolls = (cs) => cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowX === 'hidden' || cs.overflowX === 'clip'
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p)
      if (scrolls(cs)) {
        const r = p.getBoundingClientRect()
        if (r.right <= vw + 1 && r.left >= -1) return true
      }
      if (cs.position === 'fixed') return p.getBoundingClientRect().left < -1
    }
    return false
  }
  const label = (el) => {
    const cls = (typeof el.className === 'string' ? el.className : '').split(' ')[0] || ''
    return `${el.tagName.toLowerCase()}.${cls} "${(el.innerText || el.getAttribute('aria-label') || '').slice(0, 36).replace(/\s+/g, ' ')}"`
  }
  const viewport = []
  const pokes = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.display === 'contents') continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    if (r.right > vw + 1 || r.left < -1) {
      if (!clipped(el)) {
        const pr = el.parentElement?.getBoundingClientRect()
        const parentOver = pr && (pr.right > vw + 1 || pr.left < -1) && !clipped(el.parentElement)
        if (!parentOver) viewport.push(`${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`)
      }
    }
    if (cs.position === 'absolute' || cs.position === 'fixed') continue
    const p = el.parentElement
    if (!p || p === document.body) continue
    const pcs = getComputedStyle(p)
    if (scrolls(pcs) || pcs.display === 'contents') continue
    const pr = p.getBoundingClientRect()
    const out = Math.max(r.right - pr.right, pr.left - r.left)
    if (out > 2 && pr.width > 0) pokes.push(`${label(el)} pokes ${Math.round(out)}px out of ${label(p)}`)
  }
  return { vw, sw: document.documentElement.scrollWidth, viewport: viewport.slice(0, 10), pokes: pokes.slice(0, 14) }
}

async function run(page, routes, report, admin = false) {
  for (const route of routes) {
    if (ONLY && !ONLY.some((o) => route.includes(o))) continue
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 800 })
      await spaGo(page, route)
      if (admin) {
        for (const h of (await page.locator('main button[aria-expanded="false"]').all()).slice(0, 6)) {
          await h.click({ force: true, timeout: 2000 }).catch(() => {})
        }
        await page.waitForTimeout(900)
      }
      const res = await page.evaluate(audit)
      const key = `${w} ${route}`
      report[key] = res
      const flag = res.sw > res.vw || res.viewport.length ? 'OVER' : res.pokes.length ? 'POKE' : 'ok  '
      console.log(`${flag} ${key} sw=${res.sw}/${res.vw}`)
      for (const it of res.viewport) console.log(`   V ${it}`)
      for (const it of res.pokes) console.log(`   P ${it}`)
      if (SHOTS) {
        const name = `${w}-${route.replace(/[^a-z0-9]+/gi, '_')}.png`
        await page.screenshot({ path: join(OUT, name), fullPage: true })
      }
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const report = {}
  const opts = { viewport: { width: 390, height: 844 }, locale: 'en-US', deviceScaleFactor: 1 }

  const user = await (await browser.newContext(opts)).newPage()
  user.on('pageerror', (e) => console.log('pageerror', e.message))
  await user.goto(`${BASE}/home`, { waitUntil: 'networkidle' })
  await lang(user)
  console.log('persona', await selectPersona(user, /Rich — full|עשיר — אוסף/i))
  await hideDemo(user)
  await run(user, USER_ROUTES, report)

  if (!ONLY || ONLY.includes('dialogs')) {
    const DIALOGS = [
      ['/greenhouse', 'passport', async (p) => p.locator('main article a[href^="/plants/"]').first().click({ force: true })],
      ['/greenhouse?tab=needs', 'care', async (p) => p.locator('main article').first().click({ force: true })],
      ['/greenhouse', 'add-plant', async (p) => p.locator('main button').filter({ hasText: '+' }).first().click({ force: true })],
      ['/market', 'listing', async (p) => p.locator('main a[href^="/market/"], main [role="row"], main article').first().click({ force: true })],
    ]
    for (const [route, name, open] of DIALOGS) {
      for (const w of WIDTHS) {
        await user.setViewportSize({ width: w, height: 800 })
        await spaGo(user, route)
        await open(user).catch((e) => console.log('open failed', name, e.message.split('\n')[0]))
        await user.waitForTimeout(1000)
        const res = await user.evaluate(audit)
        const flag = res.sw > res.vw || res.viewport.length ? 'OVER' : res.pokes.length ? 'POKE' : 'ok  '
        console.log(`${flag} ${w} dialog:${name} sw=${res.sw}/${res.vw}`)
        for (const it of res.viewport) console.log(`   V ${it}`)
        for (const it of res.pokes) console.log(`   P ${it}`)
        if (SHOTS) await user.screenshot({ path: join(OUT, `${w}-dialog-${name}.png`) })
        await user.keyboard.press('Escape')
        await user.waitForTimeout(400)
      }
    }
  }

  if (!ONLY || ONLY.some((o) => o.includes('admin'))) {
    const admin = await (await browser.newContext(opts)).newPage()
    admin.on('pageerror', (e) => console.log('pageerror', e.message))
    await admin.goto(`${BASE}/admin/server`, { waitUntil: 'networkidle' })
    await admin.getByRole('button', { name: /Google/i }).first().click({ force: true })
    await admin.waitForTimeout(1500)
    await lang(admin)
    await hideDemo(admin)
    await run(admin, ADMIN_ROUTES, report, true)
  }

  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
