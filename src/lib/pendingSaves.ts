import { useSyncExternalStore } from 'react'

/**
 * Saves in flight: every write the app sends through `plantFetch` (POST / PUT / PATCH / DELETE), for members
 * and the admin alike. `SaveIndicator` reads it. Writes that already have their own feedback stay out:
 * sign-in, analytics, crash reports and the AI scan.
 */
const QUIET = [/^\/api\/session(\/google|\/test-login)?$/, /^\/api\/events/, /^\/api\/health/, /^\/api\/identify/, /^\/api\/issues/]

let pending = 0
let lastFailed = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

/** Whether this request is a save the grower should see. */
export function isTrackedSave(method: string, path: string) {
  return method !== 'GET' && method !== 'HEAD' && !QUIET.some((pattern) => pattern.test(path))
}

/** Call when a tracked save starts; call the returned function once with whether it worked. */
export function beginSave() {
  pending += 1
  emit()
  let done = false
  return (ok: boolean) => {
    if (done) return
    done = true
    pending = Math.max(0, pending - 1)
    if (!ok) lastFailed = true
    else if (pending === 0) lastFailed = false
    emit()
  }
}

export type SaveState = { pending: number; lastFailed: boolean }

let snapshot: SaveState = { pending: 0, lastFailed: false }
function read(): SaveState {
  if (snapshot.pending !== pending || snapshot.lastFailed !== lastFailed) snapshot = { pending, lastFailed }
  return snapshot
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSaveState(): SaveState {
  return useSyncExternalStore(subscribe, read, read)
}
