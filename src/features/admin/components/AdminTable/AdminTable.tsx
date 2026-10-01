import { Fragment, type ReactNode } from 'react'
import { Pager, usePaged } from '../../../../components/Pager/Pager'
import { Button } from '../../../../components/Button/Button'
import { useI18n } from '../../../../i18n/I18nProvider'
import {
  ActionBar,
  AddButton,
  BulkBar,
  Check,
  DetailGrid,
  DetailItem,
  Empty,
  ExpandBtn,
  ExpandCell,
  HeadActions,
  RowActions,
  Scroll,
  Table,
} from './AdminTable.styles'

export type AdminTableColumn<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  muted?: boolean
}

export type AdminTableAction<T> = {
  id: string
  label: string
  onClick: (row: T) => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'growth' | 'danger'
  disabled?: boolean
}

export type AdminTableBulkAction = {
  id: string
  label: string
  onClick: (ids: string[]) => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'growth' | 'danger'
  disabled?: boolean
}

export function AdminTable<T>({
  rows,
  rowId,
  columns,
  empty,
  selectable = false,
  selected = [],
  onSelectedChange,
  expandable = false,
  expandedIds = [],
  onExpandedChange,
  renderExpand,
  actions,
  bulkActions = [],
  addLabel,
  onAdd,
  onRowClick,
  embedded = false,
}: {
  rows: T[]
  rowId: (row: T) => string
  columns: AdminTableColumn<T>[]
  empty: string
  selectable?: boolean
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void
  expandable?: boolean
  expandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  renderExpand?: (row: T) => ReactNode
  actions?: (row: T) => AdminTableAction<T>[]
  bulkActions?: AdminTableBulkAction[]
  /** + sits in the actions header when a row can be added. */
  addLabel?: string
  onAdd?: () => void
  /** Clicking the row opens the preview. The expand chevron still toggles nested rows. */
  onRowClick?: (row: T) => void
  /** Nested table: no height cap, no outer chrome. */
  embedded?: boolean
}) {
  const { t } = useI18n()
  const paged = usePaged(rows, { signature: rows.map(rowId).join('|') })
  const pageRows = paged.shown
  const ids = pageRows.map(rowId)
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id))
  const someSelected = selected.length > 0
  const showAdd = Boolean(onAdd)
  const colSpan =
    columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (actions || showAdd ? 1 : 0)

  const toggleAll = () => {
    if (!onSelectedChange) return
    onSelectedChange(allSelected ? [] : ids)
  }

  const toggleOne = (id: string) => {
    if (!onSelectedChange) return
    onSelectedChange(
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    )
  }

  const toggleExpand = (id: string) => {
    if (!onExpandedChange) return
    onExpandedChange(
      expandedIds.includes(id)
        ? expandedIds.filter((item) => item !== id)
        : [...expandedIds, id],
    )
  }

  return (
    <>
      {selectable && someSelected && (
        <ActionBar>
          <BulkBar>
            <span>{t.admin.bulkSelected.replace('{count}', String(selected.length))}</span>
            <div>
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={action.variant ?? 'secondary'}
                  disabled={action.disabled}
                  onClick={() => action.onClick(selected)}
                >
                  {action.label}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => onSelectedChange?.([])}>
                {t.admin.bulkClear}
              </Button>
            </div>
          </BulkBar>
        </ActionBar>
      )}
      <Scroll $embedded={embedded}>
        <Table>
          <thead>
            <tr>
              {selectable && (
                <th className="check">
                  <Check
                    type="checkbox"
                    checked={allSelected}
                    aria-label={t.admin.selectAll}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {expandable && <th className="expand" aria-label={t.admin.expandRow} />}
              {columns.map((col) => (
                <th key={col.id}>{col.header}</th>
              ))}
              {(actions || showAdd) && (
                <th className="actions">
                  <HeadActions>
                    {actions && <span>{t.admin.serverColActions}</span>}
                    {showAdd && (
                      <AddButton type="button" aria-label={addLabel ?? t.admin.add} onClick={onAdd}>
                        +
                      </AddButton>
                    )}
                  </HeadActions>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <Empty>{empty}</Empty>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = rowId(row)
                const open = expandedIds.includes(id)
                const rowActions = actions?.(row) ?? []
                return (
                  <Fragment key={id}>
                    <tr
                      data-row-id={id}
                      data-selected={selected.includes(id) ? 'true' : undefined}
                      data-openable={onRowClick || expandable ? 'true' : undefined}
                      onClick={
                        onRowClick
                          ? () => onRowClick(row)
                          : expandable
                            ? () => toggleExpand(id)
                            : undefined
                      }
                    >
                      {selectable && (
                        <td className="check" onClick={(event) => event.stopPropagation()}>
                          <Check
                            type="checkbox"
                            checked={selected.includes(id)}
                            aria-label={t.admin.selectRow}
                            onChange={() => toggleOne(id)}
                          />
                        </td>
                      )}
                      {expandable && (
                        <td className="expand">
                          <ExpandBtn
                            type="button"
                            aria-expanded={open}
                            aria-label={t.admin.expandRow}
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleExpand(id)
                            }}
                          >
                            {open ? '▾' : '▸'}
                          </ExpandBtn>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.id} className={col.muted ? 'muted' : undefined}>
                          {col.cell(row)}
                        </td>
                      ))}
                      {actions && (
                        <td onClick={(event) => event.stopPropagation()}>
                          <RowActions>
                            {rowActions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant={action.variant ?? 'ghost'}
                                disabled={action.disabled}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </RowActions>
                        </td>
                      )}
                    </tr>
                    {expandable && open && renderExpand && (
                      <tr className="expand-row">
                        <ExpandCell colSpan={colSpan}>{renderExpand(row)}</ExpandCell>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </Table>
      </Scroll>
      <Pager
        page={paged.page}
        pageCount={paged.pageCount}
        from={paged.from}
        to={paged.to}
        total={paged.total}
        onPage={paged.setPage}
      />
    </>
  )
}

export function AdminDetailGrid({
  items,
}: {
  items: { label: string; value: ReactNode }[]
}) {
  return (
    <DetailGrid>
      {items.map((item) => (
        <DetailItem key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </DetailItem>
      ))}
    </DetailGrid>
  )
}
