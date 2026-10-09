import { useEffect, useRef } from 'react'

/**
 * Popups ("layers": dialogs, sheets, menus) share two behaviours:
 *
 * 1. The page behind does not scroll. The document scrolls on `<html>` (GlobalStyle), so the lock is set
 *    there; a counter lets layers stack. While any layer is open `<html data-layer-open>` is set, which
 *    pull to refresh reads so a pull inside a popup never refreshes the page under it.
 * 2. Back closes the top layer. Opening a layer adds a history entry on the same URL; the phone's back button
 *    (or the browser's) pops it and closes only that layer. Closing the layer any other way removes its
 *    entry again, so history stays as it was.
 */

const LAYER_KEY = '__plantxLayer'

let locks = 0
let saved: { overflow: string; overscroll: string } | null = null

function lockPageScroll() {
  const html = document.documentElement
  if (locks === 0) {
    saved = { overflow: html.style.overflow, overscroll: html.style.overscrollBehavior }
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    html.dataset.layerOpen = 'true'
  }
  locks += 1
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks > 0) return
    html.style.overflow = saved?.overflow ?? ''
    html.style.overscrollBehavior = saved?.overscroll ?? ''
    delete html.dataset.layerOpen
    saved = null
  }
}

/** True while any popup is open. */
export function isLayerOpen() {
  return typeof document !== 'undefined' && document.documentElement.dataset.layerOpen === 'true'
}

let seq = 0
const stack: string[] = []
const closers = new Map<string, () => void>()
let listening = false

function currentLayer(): string | undefined {
  const state = window.history.state as Record<string, unknown> | null
  const key = state?.[LAYER_KEY]
  return typeof key === 'string' ? key : undefined
}

/** Back (or forward) moved to another entry: close every layer above the one that entry belongs to. */
function onPop() {
  const here = currentLayer()
  while (stack.length && stack[stack.length - 1] !== here) {
    const key = stack.pop() as string
    const close = closers.get(key)
    closers.delete(key)
    close?.()
  }
}

function pushLayer(close: () => void) {
  if (!listening) {
    window.addEventListener('popstate', onPop)
    listening = true
  }
  const key = `layer-${++seq}`
  const state = (window.history.state as Record<string, unknown> | null) ?? {}
  window.history.pushState({ ...state, [LAYER_KEY]: key }, '')
  stack.push(key)
  closers.set(key, close)
  return () => {
    closers.delete(key)
    const index = stack.indexOf(key)
    if (index < 0) return // Closed by back: its entry is already gone.
    stack.splice(index, 1)
    // Closed another way: drop its entry, unless something newer (a navigation, or React re-running the
    // effect in development) has replaced it since.
    window.setTimeout(() => {
      if (currentLayer() === key) window.history.back()
    }, 0)
  }
}

/**
 * Make a popup a layer while `enabled` (default: while mounted). `history: false` for a popup that already
 * has its own URL (a `/plants/:id` passport), where back already closes it.
 */
export function useDialogLayer(onClose: () => void, { enabled = true, history = true }: { enabled?: boolean; history?: boolean } = {}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!enabled) return
    const release = lockPageScroll()
    const pop = history ? pushLayer(() => closeRef.current()) : undefined
    return () => {
      pop?.()
      release()
    }
  }, [enabled, history])
}
