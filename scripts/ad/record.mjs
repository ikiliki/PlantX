import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const require = createRequire(import.meta.url)
const ffmpegPath = require('./node_modules/ffmpeg-static/index.js')
const here = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(here, 'out')
const shotDir = path.join(outDir, 'shots')
const mp4File = path.join(outDir, 'plantx-ad.mp4')
const publicMp4 = path.join(here, '..', '..', 'public', 'plantx-ad.mp4')
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const origin = 'http://127.0.0.1:5173'
const fade = 0.4

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const overlayCss = `
  html, body { scrollbar-width: none !important; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  #ad-root, #ad-root * { box-sizing: border-box; }
  #ad-root {
    position: fixed;
    inset: 0;
    z-index: 80;
    pointer-events: none;
    font-family: Inter, Heebo, sans-serif;
  }
  #ad-card {
    position: absolute;
    inset: 0;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 14px;
    padding: 48px;
    background:
      radial-gradient(900px 420px at 15% 0%, rgba(207, 234, 120, 0.22), transparent 60%),
      radial-gradient(700px 380px at 100% 100%, rgba(242, 200, 167, 0.18), transparent 55%),
      #123C2D;
    color: #F4F1E8;
    opacity: 0;
    transition: opacity 0.45s ease;
  }
  #ad-card.on { opacity: 1; }
  #ad-card .k {
    margin: 0;
    color: #CFEA78;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.28em;
  }
  #ad-card h2 {
    margin: 0;
    max-width: 980px;
    font-family: "DM Serif Display", "Frank Ruhl Libre", serif;
    font-weight: 400;
    font-size: 74px;
    line-height: 1.02;
    letter-spacing: -0.03em;
    text-align: center;
  }
  #ad-card p {
    margin: 8px 0 0;
    max-width: 680px;
    font-size: 22px;
    line-height: 1.45;
    text-align: center;
    color: rgba(244, 241, 232, 0.78);
  }
  #ad-lower {
    position: absolute;
    left: 28px;
    bottom: 28px;
    width: min(440px, calc(100% - 56px));
    padding: 16px 20px 18px;
    border-radius: 18px;
    background: rgba(18, 60, 45, 0.94);
    color: #F4F1E8;
    box-shadow: 0 16px 40px rgba(18, 60, 45, 0.28);
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.35s ease, transform 0.35s ease;
  }
  #ad-lower.on { opacity: 1; transform: none; }
  #ad-lower.right { left: auto; right: 28px; }
  #ad-lower .k {
    color: #CFEA78;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
  }
  #ad-lower strong {
    display: block;
    margin-top: 4px;
    font-family: "DM Serif Display", "Frank Ruhl Libre", serif;
    font-weight: 400;
    font-size: 30px;
    line-height: 1.1;
  }
  #ad-lower .s {
    display: block;
    margin-top: 6px;
    font-size: 15px;
    line-height: 1.4;
    color: rgba(244, 241, 232, 0.82);
  }
  #ad-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 3px;
    width: 0;
    background: #CFEA78;
  }
`

function log(message) {
  console.log(`[ad] ${message}`)
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    child.stderr.on('data', (chunk) => {
      err += chunk.toString()
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(err.slice(-2000) || `ffmpeg exited ${code}`))
    })
  })
}

async function installStage(page) {
  await page.evaluate((css) => {
    const hideBar = () => {
      for (const select of document.querySelectorAll('select')) {
        const bar = select.parentElement
        if (bar && bar.querySelectorAll('select').length >= 4) {
          bar.style.display = 'none'
          break
        }
      }
    }
    const hideNoise = () => {
      for (const el of document.querySelectorAll('p')) {
        const text = el.textContent || ''
        if (text.includes('Mock history') || text.includes('not a promise')) el.style.visibility = 'hidden'
      }
    }
    hideBar()
    hideNoise()
    if (!document.documentElement.dataset.adHide) {
      document.documentElement.dataset.adHide = '1'
      const observer = new MutationObserver(() => {
        hideBar()
        hideNoise()
      })
      observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    }
    let style = document.getElementById('ad-style')
    if (!style) {
      style = document.createElement('style')
      style.id = 'ad-style'
      document.head.appendChild(style)
    }
    style.textContent = css
    if (!document.getElementById('ad-root')) {
      const root = document.createElement('div')
      root.id = 'ad-root'
      root.innerHTML = `
        <div id="ad-progress"></div>
        <div id="ad-card"><p class="k"></p><h2></h2><p class="body"></p></div>
        <div id="ad-lower"><div class="k"></div><strong></strong><span class="s"></span></div>`
      document.body.appendChild(root)
    }
  }, overlayCss)
}

async function showCard(page, kicker, title, body) {
  await page.evaluate(
    ({ kicker, title, body }) => {
      const card = document.getElementById('ad-card')
      card.querySelector('.k').textContent = kicker
      card.querySelector('h2').textContent = title
      card.querySelector('.body').textContent = body
      card.classList.add('on')
      const lower = document.getElementById('ad-lower')
      lower.classList.remove('on')
      document.getElementById('ad-progress').style.width = '0%'
    },
    { kicker, title, body },
  )
  await wait(520)
}

async function hideCard(page) {
  await page.evaluate(() => document.getElementById('ad-card').classList.remove('on'))
  await wait(480)
}

async function caption(page, kicker, title, body, progress, place = 'left') {
  await page.evaluate(
    ({ kicker, title, body, progress, place }) => {
      const lower = document.getElementById('ad-lower')
      lower.querySelector('.k').textContent = kicker
      lower.querySelector('strong').textContent = title
      lower.querySelector('.s').textContent = body
      lower.classList.toggle('right', place === 'right')
      lower.classList.add('on')
      document.getElementById('ad-progress').style.width = `${progress}%`
    },
    { kicker, title, body, progress, place },
  )
  await wait(280)
}

async function findByText(page, tag, text, exact) {
  const handle = await page.evaluateHandle(
    (tag, text, exact) => {
      return (
        [...document.querySelectorAll(tag)].find((node) => {
          const value = (node.innerText || '').replace(/\s+/g, ' ').trim()
          return exact ? value === text : value.includes(text)
        }) || null
      )
    },
    tag,
    text,
    exact,
  )
  const el = handle.asElement()
  if (!el) throw new Error(`missing ${tag} "${text}"`)
  return el
}

async function clickEl(page, el) {
  await el.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await wait(200)
  await el.click()
}

async function top(page) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await wait(200)
}

async function smoothScroll(page, delta) {
  await page.evaluate(async (delta) => {
    const scroller = document.scrollingElement
    const start = scroller.scrollTop
    const end = start + delta
    const duration = 700
    const t0 = performance.now()
    await new Promise((resolve) => {
      function frame(now) {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - (1 - p) ** 3
        scroller.scrollTop = start + (end - start) * eased
        if (p < 1) requestAnimationFrame(frame)
        else resolve()
      }
      requestAnimationFrame(frame)
    })
  }, delta)
}

async function shot(page, name) {
  const file = path.join(shotDir, `${name}.png`)
  await page.screenshot({ path: file })
  log(name)
  return file
}

async function prepare(page) {
  await page.goto(origin, { waitUntil: 'networkidle0', timeout: 30000 })
  await page.waitForSelector('select')
  const pick = async (index, value) => {
    const selects = await page.$$('select')
    await selects[index].select(value)
    await wait(180)
  }
  await pick(1, 'en')
  await pick(0, 'u-maya')
  await pick(2, 'mixed')
  await pick(3, 'mixed')
  await pick(4, 'several')
  await pick(5, 'mixed')
  await pick(6, 'mixed')
  await pick(7, 'ranked')
  await page.waitForFunction(() => document.body.innerText.includes('Home'), { timeout: 15000 })
  await wait(400)
  await installStage(page)
}

async function compose(shots) {
  const args = ['-y']
  for (const item of shots) {
    args.push('-loop', '1', '-t', String(item.dur), '-i', item.file)
  }
  const filters = shots.map(
    (_, i) =>
      `[${i}:v]scale=1440:810:force_original_aspect_ratio=decrease,pad=1440:810:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p,setpts=PTS-STARTPTS[v${i}]`,
  )
  let prev = 'v0'
  let offset = shots[0].dur - fade
  for (let i = 1; i < shots.length; i += 1) {
    const out = i === shots.length - 1 ? 'vout' : `x${i}`
    filters.push(`[${prev}][v${i}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(3)}[${out}]`)
    prev = out
    if (i < shots.length - 1) offset += shots[i].dur - fade
  }
  args.push(
    '-filter_complex',
    filters.join(';'),
    '-map',
    '[vout]',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    mp4File,
  )
  await ffmpeg(args)
}

async function run() {
  await mkdir(shotDir, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    defaultViewport: { width: 1440, height: 810, deviceScaleFactor: 1 },
    args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
  })
  const page = await browser.newPage()
  const shots = []
  const add = (file, dur) => shots.push({ file, dur })

  try {
    log('preparing mocks')
    await prepare(page)

    await showCard(page, 'PLANTX', 'The market for living plants', 'A greenhouse, a passport, and a price you can trade.')
    add(await shot(page, '01-title'), 4.2)

    await hideCard(page)
    await caption(page, 'FEED', "See what's growing", 'Posts, updates, and the market, side by side.', 14)
    add(await shot(page, '02-feed'), 2.4)
    await smoothScroll(page, 520)
    add(await shot(page, '03-feed-posts'), 2.4)

    await caption(page, 'GREENHOUSE', 'Your next best action', 'Owned, listed, and the one thing worth doing next.', 30, 'right')
    await clickEl(page, await findByText(page, 'a', 'Greenhouse', true))
    await page.waitForFunction(() => location.pathname === '/greenhouse')
    await wait(500)
    await top(page)
    await installStage(page)
    await caption(page, 'GREENHOUSE', 'Your next best action', 'Owned, listed, and the one thing worth doing next.', 30, 'right')
    add(await shot(page, '04-greenhouse'), 2.2)
    const next = await findByText(page, 'button', 'Next best action', true)
    const box = await next.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await wait(600)
      add(await shot(page, '05-next'), 2.2)
      await page.mouse.move(40, 500)
      await wait(200)
    }

    await caption(page, 'PASSPORT', 'Every plant, identified', 'Photos, traits, grade, and the class it trades as.', 48)
    await clickEl(page, await findByText(page, 'a', 'Open passport', false))
    await page.waitForSelector('[role="dialog"]')
    await wait(600)
    add(await shot(page, '06-passport'), 2.6)
    const photo = await page.$('button[aria-label="Photo 2"]')
    if (photo) {
      await photo.click()
      await wait(400)
      add(await shot(page, '07-passport-photo'), 1.8)
    }
    const tabs = await page.$$('[role="dialog"] [role="tab"]')
    if (tabs[1]) {
      await tabs[1].click()
      await wait(400)
      add(await shot(page, '08-passport-activity'), 1.8)
    }
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'))
    await wait(300)

    await caption(page, 'MARKET', 'Prices, not guesses', 'Listings on a map, and a book of bids and asks.', 68)
    await clickEl(page, await findByText(page, 'a', 'Market', true))
    await page.waitForFunction(() => location.pathname === '/market')
    await wait(700)
    await top(page)
    await installStage(page)
    await caption(page, 'MARKET', 'Prices, not guesses', 'Listings on a map, and a book of bids and asks.', 68)
    add(await shot(page, '09-market'), 3.2)

    await caption(page, 'TRADE', 'Buy the class', 'A chart, a range, and a ticket for one plant.', 86)
    const listing = await page.evaluateHandle(() => {
      return (
        [...document.querySelectorAll('button')].find((button) => {
          const text = button.innerText || ''
          return text.includes('₪') && text.includes('×')
        }) || null
      )
    })
    const row = listing.asElement()
    if (!row) throw new Error('missing listing row')
    await clickEl(page, row)
    await page.waitForFunction(() => /^\/market\/.+/.test(location.pathname))
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some((button) => button.innerText.trim() === 'Purchase'))
    await wait(500)
    await top(page)
    await installStage(page)
    await caption(page, 'TRADE', 'Buy the class', 'A chart, a range, and a ticket for one plant.', 86)
    add(await shot(page, '10-trade'), 3.6)
    await smoothScroll(page, 340)
    await caption(page, 'TRADE', 'The book behind the price', 'Asks, bids, and who is on each side.', 94)
    add(await shot(page, '11-book'), 2.4)

    await page.evaluate(() => {
      document.getElementById('ad-progress').style.width = '100%'
    })
    await showCard(page, 'PLANTX', 'Grow it. Verify it. Trade it.', 'English and Hebrew. For growers, collectors, and nurseries.')
    add(await shot(page, '12-end'), 4.4)
  } finally {
    await browser.close()
  }

  log('cutting')
  await compose(shots)
  await copyFile(mp4File, publicMp4)
  const seconds = shots.reduce((sum, item) => sum + item.dur, 0) - fade * (shots.length - 1)
  await writeFile(path.join(outDir, 'shots.json'), JSON.stringify({ seconds, shots: shots.map((s) => s.file) }, null, 2))
  log(`wrote ${publicMp4} (${seconds.toFixed(1)}s)`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
