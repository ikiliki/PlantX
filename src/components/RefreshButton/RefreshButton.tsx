import { Btn } from './RefreshButton.styles'

/** Round refresh icon; it spins while `busy`. */
export function RefreshButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <Btn type="button" aria-label={label} title={label} aria-busy={busy} $busy={busy} disabled={busy} onClick={onClick}>
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
    </Btn>
  )
}
