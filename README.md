# PlantX — Clickable UI Mock

Frontend-only, bilingual (Hebrew default + English) marketplace mock for living inventory.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://127.0.0.1:5173`).

## Demo controls

Use the dark **Demo** bar at the top to:

- Switch **persona** (Maya, Daniel, Noa, Gal, Yael, Admin Dana, Guest)
- Toggle **עברית / English**
- Jump to a **scenario** (demand commit, passport, handoff, B2B aggregate, event reuse, admin queue, claim draft, sell flow, financing gate)
- **Reset data** (restores seed; also stored in `localStorage`)

## Stack

Vite + React + TypeScript, React Router, styled-components, PWA. No backend.
