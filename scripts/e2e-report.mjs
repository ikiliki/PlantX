// Turns Playwright's JSON results into a Markdown summary with inline screenshots.
// Usage: node scripts/e2e-report.mjs <assetDir> <assetUrlBase> <reportUrl>
// Copies the last screenshot of every test into <assetDir> (pushed to the qa-assets branch by CI)
// and writes test-results/summary.md, which links images as <assetUrlBase>/<file>?raw=true.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [assetDir = 'test-results/assets', assetBase = '', reportUrl = ''] = process.argv.slice(2)
const results = JSON.parse(readFileSync('test-results/results.json', 'utf8'))
mkdirSync(assetDir, { recursive: true })

const rows = []
const walk = (suite, path) => {
  const here = suite.title && !suite.title.endsWith('.ts') ? [...path, suite.title] : path
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      const last = test.results.at(-1)
      const status = test.status === 'expected' ? 'passed' : test.status === 'flaky' ? 'flaky' : last?.status ?? 'skipped'
      const shot = [...(last?.attachments ?? [])].reverse().find((item) => item.contentType === 'image/png' && item.path)
      rows.push({
        title: [...here, spec.title].join(' › '),
        project: test.projectName,
        status,
        error: last?.errors?.[0]?.message?.split('\n')[0]?.replace(/\u001b\[[0-9;]*m/g, '') ?? '',
        shot: shot?.path,
      })
    }
  }
  for (const child of suite.suites ?? []) walk(child, here)
}
for (const suite of results.suites ?? []) walk(suite, [])

const image = (row, index) => {
  if (!row.shot || !existsSync(row.shot)) return ''
  const file = `${String(index).padStart(2, '0')}-${row.project}-${row.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60)}.png`
  copyFileSync(row.shot, join(assetDir, file))
  return `${assetBase}/${file}?raw=true`
}

const icon = { passed: '✅', flaky: '🟡', failed: '❌', timedOut: '❌', interrupted: '⚪', skipped: '⚪' }
const failed = rows.filter((row) => row.status !== 'passed' && row.status !== 'skipped' && row.status !== 'flaky')
const lines = [
  `### ${failed.length ? `❌ ${failed.length} failed` : '✅ All passed'} · ${rows.length} tests`,
  '',
  reportUrl ? `Full report with videos and traces: ${reportUrl}` : '',
  '',
  '| | Test | Size |',
  '| --- | --- | --- |',
  ...rows.map((row) => `| ${icon[row.status] ?? row.status} | ${row.title} | ${row.project} |`),
  '',
]
rows.forEach((row, index) => (row.url = image(row, index)))
if (failed.length) {
  lines.push('#### Failures', '')
  for (const row of failed) {
    lines.push(`**${row.title}** (${row.project})`, '', row.error ? `> ${row.error}` : '', '')
    if (row.url) lines.push(`<img src="${row.url}" width="360">`, '')
  }
}
lines.push('<details><summary>Screenshots of every test</summary>', '')
for (const row of rows.filter((item) => item.url)) {
  lines.push(`**${row.title}** (${row.project})`, '', `<img src="${row.url}" width="${row.project === 'phone' ? 220 : 480}">`, '')
}
lines.push('</details>')

writeFileSync('test-results/summary.md', lines.join('\n'))
console.log(`${rows.length} tests, ${failed.length} failed; summary in test-results/summary.md`)
