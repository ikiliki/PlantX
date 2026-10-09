import { Btn } from './RefreshButton.styles'

/**
 * Refresh control; the arrow spins while `busy`. Round icon by default; with `text` it is a pill that says
 * what it does (the label then comes from the text, not a tooltip).
 */
export function RefreshButton({
  label,
  busy,
  onClick,
  text,
}: {
  label: string
  busy: boolean
  onClick: () => void
  text?: string
}) {
  return (
    <Btn
      type="button"
      aria-label={text ? undefined : label}
      title={text ? undefined : label}
      aria-busy={busy}
      $busy={busy}
      $pill={Boolean(text)}
      disabled={busy}
      onClick={onClick}
    >
      <svg viewBox="0 0 20 20" aria-hidden>
        <path
          d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {text ? <span>{text}</span> : null}
    </Btn>
  )
}
