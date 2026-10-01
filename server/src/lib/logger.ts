/** Swap the sink later (file, APM); callers stay the same. */

type Meta = Record<string, unknown>

function line(level: string, message: string, meta?: Meta, err?: unknown) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
    ...(err instanceof Error
      ? { err: { name: err.name, message: err.message, stack: err.stack } }
      : err != null
        ? { err }
        : {}),
  }
  if (level === 'error') console.error(payload)
  else if (level === 'warn') console.warn(payload)
  else console.log(payload)
}

export const logger = {
  info(message: string, meta?: Meta) {
    line('info', message, meta)
  },
  warn(message: string, meta?: Meta, err?: unknown) {
    line('warn', message, meta, err)
  },
  error(message: string, meta?: Meta, err?: unknown) {
    line('error', message, meta, err)
  },
}
