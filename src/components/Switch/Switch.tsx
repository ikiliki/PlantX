import type { ReactNode } from 'react'
import { Button, Label, Spinner, Track } from './Switch.styles'

/** On/off button. While `busy`, the track becomes a spinner and `busyLabel` replaces the label. */
export function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
  busy,
  busyLabel,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  ariaLabel?: string
  busy?: boolean
  busyLabel?: ReactNode
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      $on={checked}
      onClick={() => onChange(!checked)}
    >
      {busy ? <Spinner aria-hidden /> : <Track aria-hidden $on={checked} />}
      <Label>{busy && busyLabel != null ? busyLabel : label}</Label>
    </Button>
  )
}
