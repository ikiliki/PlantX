#!/usr/bin/env node
/**
 * Roadmap dashboard: one static page per commit on master (v1 = oldest). Each page shows that commit / PR, the issues it touched, what changed
 * since the previous version, and the issue board by roadmap phase as of that moment.
 *
 *   node scripts/roadmap-dashboard.mjs          → docs/dashboard/v1 … vN, index.html
 *
 * Needs `git` and an authenticated `gh`. Issue state at a version is rebuilt from
 * createdAt / closedAt; phase = the issue's current milestone.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = 'ikiliki/PlantX'
const OUT = 'docs/dashboard'
const BRANCH = process.env.DASHBOARD_BRANCH || 'master'

const run = (cmd, args) =>
  execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const gh = (args) => JSON.parse(run('gh', args))

const PHASES = [
  ['W0', 'Stabilize'],
  ['W1', 'Core Greenhouse'],
  ['W2', 'Smart onboarding'],
  ['W3', 'Care loop'],
  ['W4', 'Harden + Guest→Free'],
  ['W5', 'Public Beta'],
  ['W6+', 'Retention → Social → Market'],
]
const phaseOf = (milestone) => (milestone?.title ?? '').split(' ')[0] || null

// ── data ────────────────────────────────────────────────────────────────────
const issues = gh([
  'issue', 'list', '-R', REPO, '--state', 'all', '--limit', '500',
  '--json', 'number,title,state,createdAt,closedAt,labels,milestone',
]).sort((a, b) => a.number - b.number)
const issueByNum = new Map(issues.map((i) => [i.number, i]))

const prs = gh([
  'pr', 'list', '-R', REPO, '--state', 'merged', '--limit', '500',
  '--json', 'number,title,body,mergedAt,headRefName,baseRefName,mergeCommit,url',
])
const prByMerge = new Map(prs.filter((p) => p.mergeCommit).map((p) => [p.mergeCommit.oid, p]))

const SEP = '\x1f'
const commits = run('git', [
  'log', '--first-parent', '--reverse', `--format=%H${SEP}%h${SEP}%cI${SEP}%an${SEP}%s${SEP}%P`, BRANCH,
])
  .trim()
  .split('\n')
  .map((line) => {
    const [sha, short, date, author, subject, parents] = line.split(SEP)
    return { sha, short, date, author, subject, parents: parents.split(' ') }
  })

/** Commits a merge brought in (second parent side), oldest first. */
function mergedCommits(c) {
  if (c.parents.length < 2) return []
  const out = run('git', ['log', '--reverse', `--format=%h${SEP}%s`, `${c.parents[0]}..${c.parents[1]}`]).trim()
  return out ? out.split('\n').map((l) => { const [h, s] = l.split(SEP); return { short: h, subject: s } }) : []
}

/** PR for a commit: by merge sha, or "#n" / "PR #n" in a merge subject. */
function prFor(c) {
  if (prByMerge.has(c.sha)) return prByMerge.get(c.sha)
  const m = c.subject.match(/(?:pull request|PR) #(\d+)/i)
  return m ? prs.find((p) => p.number === Number(m[1])) : undefined
}

const refsIn = (text = '') => [...text.matchAll(/#(\d+)\b/g)].map((m) => Number(m[1]))

// ── versions ────────────────────────────────────────────────────────────────
const versions = commits.map((c) => {
  const pr = prFor(c)
  const inner = mergedCommits(c)
  const nums = new Set([
    ...refsIn(c.subject),
    ...inner.flatMap((x) => refsIn(x.subject)),
    ...(pr ? refsIn(`${pr.title}\n${pr.body}`) : []),
  ])
  if (pr) nums.delete(pr.number)
  const related = [...nums].filter((n) => issueByNum.has(n)).sort((a, b) => a - b)
  return { kind: 'commit', at: c.date, commit: c, pr, inner, related }
})

function stateAt(issue, at) {
  if (issue.createdAt > at) return null
  return issue.closedAt && issue.closedAt <= at ? 'closed' : 'open'
}

// ── html ────────────────────────────────────────────────────────────────────
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
const fmt = (iso) => new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
const issueUrl = (n) => `https://github.com/${REPO}/issues/${n}`
const commitUrl = (sha) => `https://github.com/${REPO}/commit/${sha}`

// status: labels are today's state, so only the latest versions show them.
let showStatus = false

function issueRow(issue, state, extra = '') {
  const labels = issue.labels.filter((l) => showStatus || !l.name.startsWith('status:')).map((l) => `<span class="tag">${esc(l.name)}</span>`).join('')
  return `<li class="issue ${state}">
  <span class="dot" title="${state}"></span>
  <a href="${issueUrl(issue.number)}" target="_blank" rel="noopener">#${issue.number}</a>
  <span class="t">${esc(issue.title)}</span>${extra}
  <span class="tags">${labels}</span>
</li>`
}

const CSS = `
:root{--bg:#f4efe5;--card:#fffdf7;--text:#193128;--muted:#69776f;--line:#ddd7c9;--accent:#164b38;--soft:#e8f0e9;--open:#a86719;--closed:#1d744f;--new:#2a62b8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111a16;--card:#18241f;--text:#e3ece6;--muted:#9aaba1;--line:#2c3b34;--accent:#8fd1ae;--soft:#21332b;--open:#e0a457;--closed:#6fcf9b;--new:#8bb4ff}}
:root[data-theme="dark"]{--bg:#111a16;--card:#18241f;--text:#e3ece6;--muted:#9aaba1;--line:#2c3b34;--accent:#8fd1ae;--soft:#21332b;--open:#e0a457;--closed:#6fcf9b;--new:#8bb4ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
a{color:var(--accent)}
.wrap{max-width:1100px;margin:auto;padding:16px}
.nav{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--card);border-bottom:1px solid var(--line)}
.nav .btn{display:grid;place-items:center;min-width:44px;height:44px;border:1px solid var(--line);border-radius:12px;text-decoration:none;font-size:22px;font-weight:800;color:var(--accent);background:var(--soft)}
.nav .btn.off{opacity:.3;pointer-events:none}
.nav .mid{flex:1;min-width:0;text-align:center}
.nav .mid b{display:block;font-size:17px}
.nav .mid small{color:var(--muted)}
.nav select{max-width:100%;margin-top:4px;padding:4px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--text)}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:14px;min-width:0}
h1,h2,h3{margin:0 0 8px;color:var(--accent)}
h1{font-size:22px} h2{font-size:17px} h3{font-size:15px}
.muted{color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:14px}
ul{list-style:none;margin:0;padding:0}
.issue{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line)}
.issue:first-child{border-top:0}
.issue .t{flex:1 1 200px;min-width:0;overflow-wrap:anywhere}
.issue.closed .t{color:var(--muted);text-decoration:line-through}
.dot{width:9px;height:9px;border-radius:50%;background:var(--open);flex:none;align-self:center}
.closed .dot{background:var(--closed)}
.tags{display:flex;flex-wrap:wrap;gap:4px}
.tag{font-size:11px;padding:1px 7px;border-radius:99px;background:var(--soft);color:var(--muted)}
.chg{font-size:11px;font-weight:800;padding:1px 7px;border-radius:99px;color:#fff;background:var(--new)}
.chg.closedNow{background:var(--closed)}
.bar{height:8px;background:var(--soft);border-radius:99px;overflow:hidden;margin:6px 0 2px}
.bar i{display:block;height:100%;background:var(--closed)}
.phase{border-top:1px solid var(--line);padding:12px 0}
.phase:first-of-type{border-top:0}
.phase .head{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.commits li{padding:4px 0;border-top:1px dashed var(--line);font-size:13px;overflow-wrap:anywhere}
.commits li:first-child{border-top:0}
code{font:12px ui-monospace,Consolas,monospace;background:var(--soft);padding:1px 5px;border-radius:5px}
.pill{display:inline-block;font-size:12px;font-weight:800;padding:3px 9px;border-radius:99px;background:var(--soft);color:var(--accent)}
.list a{display:flex;gap:10px;padding:9px 0;border-top:1px solid var(--line);text-decoration:none;color:var(--text)}
.list a:first-child{border-top:0}
.list a b{color:var(--accent);min-width:44px}
`

function navHtml(i, rel) {
  const n = versions.length
  const prev = i > 0 ? `${rel}v${i}/index.html` : '#'
  const next = i < n - 1 ? `${rel}v${i + 2}/index.html` : '#'
  const options = versions
    .map((v, j) => `<option value="${rel}v${j + 1}/index.html"${j === i ? ' selected' : ''}>v${j + 1} · ${esc(label(v)).slice(0, 70)}</option>`)
    .join('')
  return `<nav class="nav">
  <a class="btn ${i === 0 ? 'off' : ''}" href="${prev}" aria-label="Previous version" id="prev">&lt;</a>
  <div class="mid"><b>v${i + 1} <span class="muted">of ${n}</span></b>
    <small>${fmt(versions[i].at)} · <a href="${rel}index.html">all versions</a></small><br>
    <select aria-label="Jump to version" onchange="location.href=this.value">${options}</select></div>
  <a class="btn ${i === n - 1 ? 'off' : ''}" href="${next}" aria-label="Next version" id="next">&gt;</a>
</nav>`
}

function label(v) {
  if (v.kind === 'now') return 'Now — issue snapshot (no new commit)'
  return v.pr ? `PR #${v.pr.number} ${v.pr.title}` : v.commit.subject
}

function page(v, i) {
  showStatus = i === versions.length - 1
  const prevAt = i > 0 ? versions[i - 1].at : ''
  const live = issues.map((iss) => ({ iss, s: stateAt(iss, v.at) })).filter((x) => x.s)
  const opened = issues.filter((x) => x.createdAt > prevAt && x.createdAt <= v.at)
  const closed = issues.filter((x) => x.closedAt && x.closedAt > prevAt && x.closedAt <= v.at)
  const open = live.filter((x) => x.s === 'open').length

  const head =
    v.kind === 'now'
      ? `<h1>Now · issue snapshot</h1><p class="muted">No new commit since <a href="${commitUrl(v.commit.sha)}" target="_blank" rel="noopener"><code>${v.commit.short}</code></a>. Shows issues opened, closed or re-aligned after the last commit.</p>`
      : `<h1>${esc(label(v))}</h1>
<p class="muted"><a href="${commitUrl(v.commit.sha)}" target="_blank" rel="noopener"><code>${v.commit.short}</code></a> · ${esc(v.commit.author)} · ${fmt(v.at)}
${v.pr ? ` · <a href="${v.pr.url}" target="_blank" rel="noopener">PR #${v.pr.number}</a> <span class="pill">${esc(v.pr.headRefName)} → ${esc(v.pr.baseRefName)}</span>` : ' · <span class="pill">direct commit</span>'}</p>`

  const inner = v.inner.length
    ? `<div class="card"><h2>Commits in this merge (${v.inner.length})</h2><ul class="commits">${v.inner
        .map((c) => `<li><code>${c.short}</code> ${esc(c.subject)}</li>`)
        .join('')}</ul></div>`
    : ''

  const related = v.related.length
    ? v.related.map((n) => issueRow(issueByNum.get(n), stateAt(issueByNum.get(n), v.at) ?? 'open')).join('')
    : '<li class="muted">No issue referenced.</li>'

  const changes = [
    ...opened.map((x) => issueRow(x, stateAt(x, v.at), ' <span class="chg">opened</span>')),
    ...closed.filter((x) => x.createdAt <= prevAt || !prevAt).map((x) => issueRow(x, 'closed', ' <span class="chg closedNow">closed</span>')),
  ].join('') || '<li class="muted">No issue opened or closed.</li>'

  const phases = [...PHASES, ['—', 'No phase']]
    .map(([key, name]) => {
      const rows = live.filter(({ iss }) => (phaseOf(iss.milestone) ?? '—') === key)
      if (!rows.length) return ''
      const done = rows.filter((r) => r.s === 'closed').length
      const pct = Math.round((done / rows.length) * 100)
      rows.sort((a, b) => (a.s === b.s ? a.iss.number - b.iss.number : a.s === 'open' ? -1 : 1))
      return `<div class="phase"><div class="head"><h3>${key} · ${esc(name)}</h3><span class="muted">${done}/${rows.length} closed</span></div>
<div class="bar"><i style="width:${pct}%"></i></div>
<ul>${rows.map((r) => issueRow(r.iss, r.s)).join('')}</ul></div>`
    })
    .join('')

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PlantX Roadmap v${i + 1}</title><style>${CSS}</style></head><body>
${navHtml(i, '../')}
<main class="wrap">
<div class="card">${head}
<p><span class="pill">${open} open</span> <span class="pill">${live.length - open} closed</span></p></div>
${inner}
<div class="grid">
<div class="card"><h2>Issues this version references</h2><ul>${related}</ul></div>
<div class="card"><h2>Changed since v${i}</h2><ul>${changes}</ul></div>
</div>
<div class="card"><h2>Board by roadmap phase</h2><p class="muted">State as of this version · phase = the issue's milestone today.</p>${phases}</div>
</main>
<script>
addEventListener('keydown', (e) => {
  if (e.target.closest('select')) return
  const a = document.getElementById(e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : '')
  if (a && !a.classList.contains('off')) location.href = a.href
})
</script></body></html>`
}

function indexPage() {
  const rows = versions
    .map((v, i) => `<a href="v${i + 1}/index.html"><b>v${i + 1}</b><span><span class="muted">${fmt(v.at)}</span><br>${esc(label(v))}${
      v.related.length ? ` <span class="muted">· ${v.related.map((n) => `#${n}`).join(' ')}</span>` : ''
    }</span></a>`)
    .reverse()
    .join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PlantX Roadmap Dashboard</title><style>${CSS}</style></head><body>
<nav class="nav"><a class="btn" href="v1/index.html" aria-label="Oldest version">&lt;</a>
<div class="mid"><b>PlantX roadmap dashboard</b><small>${versions.length} versions · built ${fmt(new Date().toISOString())}</small></div>
<a class="btn" href="v${versions.length}/index.html" aria-label="Latest version">&gt;</a></nav>
<main class="wrap"><div class="card list">${rows}</div></main></body></html>`
}

rmSync(OUT, { recursive: true, force: true })
versions.forEach((v, i) => {
  const dir = join(OUT, `v${i + 1}`)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), page(v, i))
})
writeFileSync(join(OUT, 'index.html'), indexPage())
console.log(`Wrote ${versions.length} versions to ${OUT}/`)
