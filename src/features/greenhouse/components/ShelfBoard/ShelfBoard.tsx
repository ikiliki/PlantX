import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Plant } from '../../../../mock/types'
import { SHELF_NAME_MAX, cleanShelfName, useShelves } from '../../useShelves'
import { ShelfRow } from '../ShelfRow/ShelfRow'
import { AddForm, AddInput, Hint, Root } from './ShelfBoard.styles'

/**
 * The greenhouse's Shelves view: an Add shelf box, one row per shelf in the grower's order, then the plants that
 * sit on no shelf. `plants` is already filtered (All / AI verified…), so filters work here too.
 */
export function ShelfBoard({ plants }: { plants: Plant[] }) {
  const { t } = useI18n()
  const { shelves, shelfOf, addShelf, renameShelf, moveShelf, removeShelf, placePlant } = useShelves()
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const loose = plants.filter((plant) => !shelves.some((shelf) => shelf.id === shelfOf(plant.id)))

  return (
    <Root data-shelf-board>
      <AddForm
        onSubmit={(event) => {
          event.preventDefault()
          if (!cleanShelfName(name) || adding) return
          setAdding(true)
          void addShelf(name).then((ok) => {
            setAdding(false)
            if (ok) setName('')
          })
        }}
      >
        <AddInput
          id="shelf-add-name"
          aria-label={t.greenhouse.shelfName}
          placeholder={t.greenhouse.shelfNamePlaceholder}
          value={name}
          maxLength={SHELF_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" variant="growth" disabled={!cleanShelfName(name) || adding}>
          {t.greenhouse.shelfAdd}
        </Button>
      </AddForm>
      {shelves.length === 0 ? <Hint>{t.greenhouse.shelvesFirst}</Hint> : null}

      {shelves.map((shelf, index) => (
        <ShelfRow
          key={shelf.id}
          shelf={shelf}
          shelves={shelves}
          plants={plants.filter((plant) => shelfOf(plant.id) === shelf.id)}
          first={index === 0}
          last={index === shelves.length - 1}
          onRename={(next) => renameShelf(shelf.id, next)}
          onMove={(direction) => void moveShelf(shelf.id, index + direction)}
          onDelete={() => void removeShelf(shelf.id)}
          onPlace={(plantId, shelfId) => void placePlant(plantId, shelfId)}
        />
      ))}

      <ShelfRow shelf={null} shelves={shelves} plants={loose} onPlace={(plantId, shelfId) => void placePlant(plantId, shelfId)} />
    </Root>
  )
}
