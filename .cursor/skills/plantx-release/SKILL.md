---
name: plantx-release
description: >-
  Gate PlantX features and pages from Admin System config. Use when adding or
  changing a feature, its public entries, a landing widget, a nav item, a tab
  that embeds another feature, or admin system controls.
---

# PlantX release

Release status is editable config in Admin → System (`db.system`). It is not a TypeScript interface of required faces.

A page is a container of features. Pages never show an empty screen. Gate features, not by wiping the page.

## Config

Types and defaults live in `src/theme/release.ts`. Values persist on `MockDb.system`.

`/admin` never shows the maintenance hold. The only way into admin from the app is the account popup on the avatar, shown to the operator alone; it is not a nav or bottom-bar tab. There is no separate admin sign-in: a signed-out visit goes to `/login?next=/admin/...`, a signed-in non-operator goes to `/greenhouse`, and the operator (the Google account in `PLANTX_BOOTSTRAP_ADMIN_EMAIL`, the only admin) gets the admin shell. `/login` is the hold — back to landing, no product header — and stays open when the API is down. `?mode=signup` opens it on Sign up; `next` returns only to same-site paths.

Sign-in is Google only (mock mode uses a stand-in button that signs in the operator). Log in and sign up are one flow: a Google email with no account signs up (see `launched` below). While the app is off it files a pending application and the card shows "Thanks for signing up" (server error `pending`); a repeat sign-in reuses the open application; a rejected application or disabled account gets `declined`. Admin approves in Requests, then the next Google sign-in opens the account. Do not call it early access or request access anywhere. When the API is down, failed lists say unavailable. The HTTP status and the server message stay on the admin server, system, and APIs screens. Sign-in, the product shell, and every other public page do not show them. Demo rows are not substituted. Empty environment names are listed on the signed-in admin server status only; the values are never shown, and the sign-in card does not list them.

`launched: false` shows the not-launched hold. The operator and members with `preapproved` still enter; every other member sees the hold. Approving an application marks that account pre-approved. Admin can clear the mark on the member.

Sign-up follows `launched`: app on, a new Google email gets its account at once and is signed in (not pre-approved; an application still open from when the app was off is approved the same way), and later sign-ins are plain log-ins. App off, it files an application (`pending`) for the admin to pre-approve in Requests.

**Pages** (`live` | `maintenance`):

- `maintenance` hides the page from nav. Direct visits show one shared maintenance notice (`PageGate`) — no feature UI peek underneath. Feature status is separate; page maintenance wins for the route.

**Features** (`features` on `SystemConfig`): `{ enabled, status }`. This is the only place a status is chosen.

- `enabled: false` — every component in that feature is disabled and not rendered. Their show switches are locked. The last status is kept.
- `enabled: true` — each component can still be hidden. Components that stay shown follow the feature status (`ready`, `comingSoon`, or `maintenance`).

A feature can own a route with a page row. Tasks (`todo`) has `PAGE_IDS` entry `todo`, required placement `todo.board`, and widget placement `home.todo`. Greenhouse care uses the todo feature flag for Needs/Upcoming filters and `TodoCareDialog` (no `greenhouse.todo` widget). Admin System lists Tasks under Pages and under Features.

**Components**, one `{ enabled }` per placement. The show switch works whenever the feature is on, except placements marked `required: true`. Those are the page itself (the market board, class, categories, category, greenhouse portfolio, news feed, greenhouse collection, rank, wiki, and todo widgets). They stay shown while the feature is on and have no hide switch. `placementRelease` is what gates read. Pieces in `PLAIN` have no flag: list them under their page with OK and no edit.

A placement is grouped in Admin under its page, and it follows `featureId`. Market coming soon shows the market page and the home market rail as the board with prices withheld, not a blur of live listings. It still forces the market board, the news market rail, the greenhouse portfolio, and the passport market together. The plant card follows the greenhouse, so turning the market off leaves the plants on the shelf. A listed plant only reads as on the market when the market itself is ready. Greenhouse Growing Now **Listed** and **Sold** filters follow the same gate (`isPlacementReady(..., 'market.board')`) and stay off the shelf while the market is not ready. Profile market stats and trust (`profile.market.stats`, `profile.market.trust`) are required market placements: always on when the market feature is ready, no hide switch. They stay off the seller summary while the market is not ready. Passport To Do (`passport.todo`) follows the care feature: planned and history care rows for that plant. The page status does not change its components.

```tsx
<PageGate pageId="market" title={t.nav.market}>
  <FeatureGate placement="market.board" title={t.nav.market}>
    <MarketBoard />
  </FeatureGate>
</PageGate>
```

Home hosts market, rank, and wiki rails. Greenhouse level (`greenhouse.level`) is an optional greenhouse placement, on by default. Level comes from `greenhouseLevel()` (`src/features/greenhouse/greenhouseLevel.ts`, shared with the server): +50 XP per plant added, +10 per completed care task, no cap. Your own card computes it in the browser; another grower's public card reads `GET /api/users/:id/level` (counts and XP only, tasks stay private). Each rail has its own placement. Greenhouse being ready does not turn those rails on.

## Admin

`SystemPanel` on `/admin/system` edits pages, then features. There is no separate feature list. Headers follow the catalog section style. **App** starts open. **Pages**, **Features**, and the redirect preview start collapsed; individual page/feature rows and the kept/plain folders inside stay collapsed. Opening a page or feature row shows the loader and that row stays open until its data arrives.

**System health** (#56) and the funnel sit on Admin → Server, under the live status card (Live · Retry · API docs). Issue reports live on Requests. Server ends with collapsible Reactions and Comments (read-only); Moderation has users / plants / activities, the log, Reactions (Remove, logged on the post: `DELETE /api/admin/reactions/:activityId/:userId`) and Comments. The admin tabs are one line that scrolls sideways. System health: `SystemHealthCard` reads the admin-only `GET /api/system/health` (API version / env / region, a database round trip, the newest applied migration against the one baked into the build, identify keys set or missing, never a live provider call, this instance's server and browser error counts, whether the alert webhook is set) and shows one row per part with a status dot, Refresh and "Last updated". Mock mode says it needs the API. The missing env names that `EnvMissing` (Admin → Server) lists come from this endpoint; the public `GET /api/env` names none (#88). `GET /api/health` is the public, database-free uptime check. Every API response has an `x-request-id` and one `request` log line (`server/src/lib/requestLog.ts`); issue reports carry it. Server 5xx and browser crashes (`POST /api/health/client-error`, sent by `watchClientErrors` outside mock mode) are logged and, with `PLANTX_ALERT_WEBHOOK_URL` set, posted to that Slack / Discord webhook at most once per message every 10 minutes (`server/src/lib/observability.ts`). The static site's headers (CSP `frame-ancestors`, nosniff, Referrer-Policy, no wildcard CORS) are set in `scripts/build-prod.mjs`; the API docs need an admin in production.

**Webhooks** (`/admin/webhooks`, `WebhooksPanel`): every outgoing webhook goes through `server/src/lib/webhook.ts` (2 s timeout, never throws, mentions off) and `lib/webhookSettings.ts` (env URL + the `webhook_settings` on/off switch, cached 30 s; no row = on). `alerts` uses `PLANTX_ALERT_WEBHOOK_URL`; `signups`, `signins` and `activities` use `PLANTX_EVENTS_WEBHOOK_URL` (`lib/events.ts`, called after the work succeeded). Sign-ups carry name and email (for approval); everything else names the grower by `publicGrowerName`; an activity is posted only when a signed-out visitor could see it (XP kind, not a private plant, not hidden). The tab shows whether each env is set, never the URL, with a switch and Send test (works while off). PlantX only sends: it never signs in to or reads Discord / Slack. GitHub's issue webhook is configured in GitHub and listed for reference. Home previews start on the first page of the feed. An open page renders that page inside a max-height window that scrolls on its own. A feature header carries that feature’s enable switch and status, and its number is how many components can be hidden. Page rows, feature rows, and component rows use different indent and weight. Hideable components sit open under their page. Always shown and non controllable pieces each sit in a folder that starts collapsed. Under each component is the page and placement path it is mounted on. Optional rows are a show switch while the feature is on. Every component shows a disabled label with no edit when its feature is off.

## Landing

The landing uses stills of the real app, not mounted pages (see plantx-views). Only features that are ready get a section or a tour tab. Not-ready features (market, rank) show only as non-interactive Coming soon cards in `LandingSoon`.

## Reserved later

Market stage `pendingListings` stays reserved until that release needs it.

## Check

Changing a page status updates that page and its nav link. Changing a feature status updates every shown component in that feature, wherever it is mounted. Hiding a component applies while its feature is on. Turning the feature off disables every component and locks the switches. No route that is open should render only a blank notice. A tab or title that opens market content stays hidden unless that market piece is ready. The market nav link stays hidden when the market feature itself is off.
