export type NoticeTone = 'pending' | 'ok' | 'fail'

export type HttpNotice = {
  id: number
  method: string
  path: string
  status: number
  tone: NoticeTone
}

type Listener = (items: readonly HttpNotice[]) => void

const listeners = new Set<Listener>()
let items: HttpNotice[] = []
let seq = 0
const timers = new Map<number, number>()

function emit() {
  const snapshot = items.slice()
  listeners.forEach((listener) => listener(snapshot))
}

export function subscribeHttpNotices(listener: Listener) {
  listener(items.slice())
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function dismissHttpNotice(id: number) {
  const timer = timers.get(id)
  if (timer != null) window.clearTimeout(timer)
  timers.delete(id)
  items = items.filter((item) => item.id !== id)
  emit()
}

function push(notice: HttpNotice) {
  items = [notice, ...items.filter((item) => item.id !== notice.id)].slice(0, 4)
  emit()
}

/** Show a notice only when the server answers 200 or 500. */
export function reportHttp(method: string, path: string, status: number) {
  if (status !== 200 && status !== 500) return
  const id = ++seq
  const tone: NoticeTone = status === 200 ? 'ok' : 'fail'
  push({ id, method, path, status, tone })
  const timer = window.setTimeout(() => dismissHttpNotice(id), status === 200 ? 2800 : 5200)
  timers.set(id, timer)
}

/** Writes report 200 and 500. Reads stay quiet so a save is one alert. */
export function plantFetch(path: string, init?: RequestInit) {
  const method = (init?.method ?? 'GET').toUpperCase()
  const clean = path.split('?')[0] || path
  return fetch(path, init).then((res) => {
    if (method !== 'GET' && (res.status === 200 || res.status === 500)) reportHttp(method, clean, res.status)
    return res
  })
}
