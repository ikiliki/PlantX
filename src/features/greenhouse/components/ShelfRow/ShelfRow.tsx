import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant, Shelf } from '../../../../mock/types'
import { GreenhousePlantCard } from '../GreenhousePlantCard/GreenhousePlantCard'
import { SHELF_NAME_MAX, cleanShelfName } from '../../useShelves'
import {
  Actions,
  Cell,
  Count,
  Empty,
  Head,
  IconButton,
  Move,
  Name,
  RenameForm,
  RenameInput,
  Root,
  Row,
} from './ShelfRow.styles'

/**
 * One shelf: its name and tools (rename, up, down, delete), then its plants in one sideways row. Each card has
 * a "Move to…" select. `shelf` null is the "Not on a shelf" row, which has no tools.
 */
export function ShelfRow({
  shelf,
  plants,
  shelves,
  first = false,
  last = false,
  onRename,
  onMove,
  onDelete,
  onPlace,
}: {
  shelf: Shelf | null
  plants: Plant[]
  shelves: Shelf[]
  first?: boolean
  last?: boolean
  onRename?: (name: string) => Promise<boolean>
  onMove?: (direction: -1 | 1) => void
  onDelete?: () => void
  onPlace: (plantId: string, shelfId: string | null) => void
}) {
  const { t } = useI18n()
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(shelf?.name ?? '')
  const [confirming, setConfirming] = useState(false)
  const title = shelf ? shelf.name : t.greenhouse.shelfNone

  return (
    <Root data-shelf={shelf?.id ?? 'none'} aria-label={title}>
      <Head>
        {renaming && shelf && onRename ? (
          <RenameForm
            onSubmit={(event) => {
              event.preventDefault()
              void onRename(name).then((ok) => ok && setRenaming(false))
            }}
          >
            <RenameInput
              id={`shelf-name-${shelf.id}`}
              aria-label={t.greenhouse.shelfName}
              value={name}
              maxLength={SHELF_NAME_MAX}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" size="sm" variant="growth" disabled={!cleanShelfName(name)}>
              {t.greenhouse.shelfSave}
            </Button>
          </RenameForm>
        ) : (
          <Name>
            {title} <Count>({plants.length})</Count>
          </Name>
        )}
        {shelf && !renaming ? (
          <Actions>
            <IconButton type="button" onClick={() => setRenaming(true)}>
              {t.greenhouse.shelfRename}
            </IconButton>
            <IconButton type="button" aria-label={t.greenhouse.shelfUp} title={t.greenhouse.shelfUp} disabled={first} onClick={() => onMove?.(-1)}>
              ↑
            </IconButton>
            <IconButton type="button" aria-label={t.greenhouse.shelfDown} title={t.greenhouse.shelfDown} disabled={last} onClick={() => onMove?.(1)}>
              ↓
            </IconButton>
            <IconButton type="button" aria-label={t.greenhouse.shelfDelete} title={t.greenhouse.shelfDelete} onClick={() => setConfirming(true)} data-shelf-delete>
              ×
            </IconButton>
          </Actions>
        ) : null}
      </Head>

      {plants.length === 0 ? (
        <Empty>{t.greenhouse.shelfEmpty}</Empty>
      ) : (
        <Row>
          {plants.map((plant) => (
            <Cell key={plant.id}>
              <GreenhousePlantCard plant={plant} />
              <Move
                aria-label={`${t.greenhouse.moveTo} ${plant.title}`}
                value={shelf?.id ?? ''}
                onChange={(event) => onPlace(plant.id, event.target.value || null)}
                data-move-plant={plant.id}
              >
                <option value={shelf?.id ?? ''} disabled>
                  {t.greenhouse.moveTo}
                </option>
                {shelves
                  .filter((item) => item.id !== shelf?.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                {shelf ? <option value="">{t.greenhouse.shelfNone}</option> : null}
              </Move>
            </Cell>
          ))}
        </Row>
      )}

      {confirming && shelf ? (
        <ModalDialog
          title={t.greenhouse.shelfDeleteTitle.replace('{name}', shelf.name)}
          lead={t.greenhouse.shelfDeleteBody}
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setConfirming(false)
                  onDelete?.()
                }}
                data-shelf-delete-confirm
              >
                {t.greenhouse.shelfDelete}
              </Button>
            </>
          }
        />
      ) : null}
    </Root>
  )
}
