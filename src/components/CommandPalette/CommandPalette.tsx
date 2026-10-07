import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from '../Icon/Icon'
import {
  Backdrop,
  Empty,
  Field,
  Footer,
  GroupLabel,
  Input,
  Key,
  Option,
  OptionHint,
  OptionLabel,
  Panel,
  Results,
} from './CommandPalette.styles'

export type CommandItem = {
  id: string
  label: string
  group: string
  icon?: IconName
  hint?: string
  /** Searched too, not shown (e.g. a scientific name). */
  keywords?: string
}

/** How many entries of a group show before anything is typed. */
const IDLE_LIMIT = 8

/**
 * Quick jump: a filterable list of pages and plants. Arrow keys move, Enter opens, Escape closes,
 * and focus goes back to whatever opened it.
 */
export function CommandPalette({
  items,
  label,
  placeholder,
  emptyText,
  onPick,
  onClose,
}: {
  items: CommandItem[]
  label: string
  placeholder: string
  emptyText: string
  onPick: (item: CommandItem) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const resultsRef = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    opener.current = document.activeElement
    return () => {
      if (opener.current instanceof HTMLElement) opener.current.focus()
    }
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      const seen: Record<string, number> = {}
      return items.filter((item) => (seen[item.group] = (seen[item.group] ?? 0) + 1) <= IDLE_LIMIT)
    }
    return items.filter((item) => `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    resultsRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown' && visible.length) {
      event.preventDefault()
      setActive((index) => (index + 1) % visible.length)
    } else if (event.key === 'ArrowUp' && visible.length) {
      event.preventDefault()
      setActive((index) => (index - 1 + visible.length) % visible.length)
    } else if (event.key === 'Enter' && visible[active]) {
      event.preventDefault()
      onPick(visible[active])
    }
  }

  let lastGroup = ''
  return createPortal(
    <Backdrop onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <Panel role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKey}>
        <Field>
          <Icon name="search" size={20} />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={label}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Results ref={resultsRef} id={listId} role="listbox" aria-label={label}>
          {visible.length === 0 ? <Empty>{emptyText}</Empty> : null}
          {visible.map((item, index) => {
            const heading = item.group !== lastGroup ? item.group : null
            lastGroup = item.group
            return (
              <div key={item.id}>
                {heading ? <GroupLabel aria-hidden>{heading}</GroupLabel> : null}
                <Option
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  data-index={index}
                  $active={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => onPick(item)}
                >
                  {item.icon ? <Icon name={item.icon} size={18} /> : null}
                  <OptionLabel>{item.label}</OptionLabel>
                  {item.hint ? <OptionHint>{item.hint}</OptionHint> : null}
                </Option>
              </div>
            )
          })}
        </Results>
        <Footer aria-hidden>
          <span>
            <Key>↑</Key> <Key>↓</Key>
          </span>
          <span>
            <Key>↵</Key>
          </span>
          <span>
            <Key>Esc</Key>
          </span>
        </Footer>
      </Panel>
    </Backdrop>,
    document.body,
  )
}
