# PlantX scrape

Daily extractor for plant configuration data: category, variety, quality (`A`/`B`/`C`), size (`S`/`M`/`L`/`XL`), and stage (`CUT`/`ROOTED`/`EST`/`MATURE`). Those names match the grading fields in `src/mock/types.ts`.

Real site URLs are not included. Add each site's `startUrl` and selectors to `sources.json` when you have them. The shipped sources read local HTML fixtures only.

## Run

From the repo root:

```bash
npm run scrape
npm run scrape:headed
```

`npm run scrape` is headless. `npm run scrape:headed` opens a visible browser, outlines each matched element, and pauses briefly on the page.

Both npm scripts pass `--dry-run`, so they load `scripts/scrape/fixtures/` and do not use the network. A headed dry-run is how you watch the sample pages.

Flags:

- `--headless` is the default. `--headed` shows the browser.
- `--dry-run` reads each source's `fixture` file with `page.setContent`. `http` and `https` requests are aborted. A filled-in `startUrl` is ignored and logged.
- `--source <id>` runs one source.

After `startUrl` values are filled in, a live run (this uses the network) is:

```bash
node scripts/scrape/run.mjs
node scripts/scrape/run.mjs --headed
```

Drop `--dry-run` from the npm scripts when you want `npm run scrape` to hit those URLs.

## Config and output

- Sources: `scripts/scrape/sources.json`
- Fixtures: `scripts/scrape/fixtures/category.html` and `fixtures/detail.html`
- Reports: `scripts/scrape/out/latest.json` and a timestamped copy next to it

Selectors live on each source (`recordSelector` and `fields.*.selector`). `kind` is `text`, `quality`, `size`, or `stage`. The runner does not hardcode site selectors.

`site-pending` is an empty disabled source. Copy it, set `enabled` to `true`, and fill `startUrl` plus selectors when a site is chosen.

Each record stores the normalized fields plus `snippets` (`selector`, `text`, and a short `html` excerpt) so you can see what came off the page. The console prints the same evidence.

## Install

```bash
npm install --save-dev playwright
```

The runner launches installed Google Chrome (`channel: 'chrome'`). If Chrome is missing:

```bash
npx playwright install chromium
```

## Daily run

No scheduler is installed in this repo. Headless is the one to put on a timer.

Windows Task Scheduler, every day at 06:00:

```bat
schtasks /Create /SC DAILY /ST 06:00 /TN "PlantX scrape" /TR "cmd /c cd /d C:\Users\USER\plantx && npm run scrape"
```

cron:

```cron
0 6 * * * cd /path/to/plantx && npm run scrape
```

While the npm script still includes `--dry-run`, that job reads fixtures only. Point it at `node scripts/scrape/run.mjs` once real URLs are in `sources.json`.
