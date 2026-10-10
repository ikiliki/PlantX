import { useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { CatalogCategory, CatalogProperty, CatalogSubcategory } from '../../../../mock/types'
import {
  deleteProperty,
  propertiesForCategory,
  propertiesForSubcategory,
  upsertCategory,
  upsertProperty,
  upsertSubcategory,
  deleteCategory,
  deleteSubcategory,
  SYSTEM_PROPERTY_IDS,
} from '../../catalogMutations'
import { AdminTable } from '../AdminTable/AdminTable'
import { CategoryEditorDialog } from '../CatalogEditor/CategoryEditorDialog'
import { PropertyEditorDialog } from '../CatalogEditor/PropertyEditorDialog'
import { SubcategoryEditorDialog } from '../CatalogEditor/SubcategoryEditorDialog'
import { Backdrop, Close, DialogTitle, Nested, Photo, TreeDialog } from './CatalogTree.styles'

type PropertyScope =
  | { level: 'category'; categoryId: string }
  | { level: 'subcategory'; subcategoryId: string }

type DialogState =
  | { kind: 'none' }
  | { kind: 'category'; item?: CatalogCategory }
  | { kind: 'subcategory'; categoryId: string; item?: CatalogSubcategory }
  | { kind: 'properties'; scope: PropertyScope }
  | { kind: 'property'; scope: PropertyScope; item?: CatalogProperty }

export function CatalogTree({
  onlyCategoryId,
  startExpanded = false,
}: {
  /** When set, show just this category (used from a plant row). */
  onlyCategoryId?: string
  startExpanded?: boolean
}) {
  const { db, commitCatalog } = useStore()
  const { t, tr } = useI18n()
  const catalog = db.catalog
  const categories = onlyCategoryId
    ? catalog.categories.filter((item) => item.id === onlyCategoryId)
    : catalog.categories
  const [expanded, setExpanded] = useState<string[]>(() =>
    onlyCategoryId && startExpanded ? [onlyCategoryId] : [],
  )
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' })

  const scopeLabel = (scope: PropertyScope) => {
    if (scope.level === 'category') {
      const category = catalog.categories.find((item) => item.id === scope.categoryId)
      return category ? tr(category.name, category.nameHe) : t.admin.forCategory
    }
    const sub = catalog.subcategories.find((item) => item.id === scope.subcategoryId)
    return sub ? tr(sub.name, sub.nameHe) : t.admin.forSubcategory
  }

  const propertiesFor = (scope: PropertyScope) =>
    scope.level === 'category'
      ? propertiesForCategory(catalog, scope.categoryId)
      : propertiesForSubcategory(catalog, scope.subcategoryId)

  const close = () => setDialog({ kind: 'none' })

  return (
    <>
      <AdminTable
        rows={categories}
        rowId={(row) => row.id}
        empty={t.admin.serverEmpty}
        addLabel={t.admin.addCategory}
        onAdd={onlyCategoryId ? undefined : () => setDialog({ kind: 'category' })}
        onRowClick={(row) => setDialog({ kind: 'category', item: row })}
        expandable
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        columns={[
          {
            id: 'name',
            header: t.admin.serverColName,
            cell: (row) => (
              <>
                {row.photo ? (
                  <Photo>
                    <PlantImage src={row.photo} alt="" />
                  </Photo>
                ) : null}
                {tr(row.name, row.nameHe)}
              </>
            ),
          },
          { id: 'ticker', header: t.admin.serverColCode, cell: (row) => row.ticker, muted: true },
          {
            id: 'subs',
            header: t.admin.serverSubcategories,
            cell: (row) => String(catalog.subcategories.filter((item) => item.categoryId === row.id).length),
            muted: true,
          },
        ]}
        renderExpand={(category) => {
          const subs = catalog.subcategories.filter((item) => item.categoryId === category.id)
          return (
            <Nested>
              <AdminTable
                embedded
                rows={subs}
                rowId={(row) => row.id}
                empty={t.admin.serverEmpty}
                addLabel={t.admin.addSubcategory}
                onAdd={() => setDialog({ kind: 'subcategory', categoryId: category.id })}
                onRowClick={(row) =>
                  setDialog({ kind: 'subcategory', categoryId: category.id, item: row })
                }
                columns={[
                  { id: 'name', header: t.admin.serverColName, cell: (row) => tr(row.name, row.nameHe) },
                  { id: 'code', header: t.admin.serverColCode, cell: (row) => row.code, muted: true },
                ]}
                actions={(row) => [
                  {
                    id: 'properties',
                    label: t.admin.properties,
                    variant: 'secondary',
                    onClick: () => setDialog({ kind: 'properties', scope: { level: 'subcategory', subcategoryId: row.id } }),
                  },
                ]}
              />
            </Nested>
          )
        }}
        actions={(row) => [
          {
            id: 'properties',
            label: t.admin.properties,
            variant: 'secondary',
            onClick: () => setDialog({ kind: 'properties', scope: { level: 'category', categoryId: row.id } }),
          },
        ]}
      />

      {dialog.kind === 'category' && (
        <CategoryEditorDialog
          initial={dialog.item}
          onClose={close}
          onConfirm={(draft) => {
            commitCatalog(({ catalog: cat, species }) => upsertCategory(cat, species, draft))
            close()
          }}
          onDelete={
            dialog.item
              ? () => {
                  const id = dialog.item?.id
                  if (!id) return
                  commitCatalog(({ catalog: cat }) => ({ catalog: deleteCategory(cat, id) }))
                  close()
                }
              : undefined
          }
        />
      )}

      {dialog.kind === 'subcategory' && (
        <SubcategoryEditorDialog
          categoryId={dialog.categoryId}
          initial={dialog.item}
          onClose={close}
          onConfirm={(draft) => {
            commitCatalog(({ catalog: cat }) => ({ catalog: upsertSubcategory(cat, draft) }))
            close()
          }}
          onDelete={
            dialog.item
              ? () => {
                  const id = dialog.item?.id
                  if (!id) return
                  commitCatalog(({ catalog: cat }) => ({ catalog: deleteSubcategory(cat, id) }))
                  close()
                }
              : undefined
          }
        />
      )}

      {dialog.kind === 'properties' && (
        <PropertiesList
          title={scopeLabel(dialog.scope)}
          rows={propertiesFor(dialog.scope)}
          onClose={close}
          onAdd={() => setDialog({ kind: 'property', scope: dialog.scope })}
          onEdit={(item) => setDialog({ kind: 'property', scope: dialog.scope, item })}
          onDelete={(id) => {
            if (SYSTEM_PROPERTY_IDS.has(id)) return
            commitCatalog(({ catalog: cat }) => ({ catalog: deleteProperty(cat, id) }))
          }}
        />
      )}

      {dialog.kind === 'property' && (
        <PropertyEditorDialog
          scopeLabel={scopeLabel(dialog.scope)}
          initial={dialog.item}
          defaultRequired
          takenSigns={catalog.properties
            .filter((item) => item.id !== dialog.item?.id && item.sign)
            .map((item) => item.sign)}
          onClose={() => setDialog({ kind: 'properties', scope: dialog.scope })}
          onConfirm={(draft) => {
            if (draft.options.length === 0 || dialog.kind !== 'property') return
            const scope = dialog.scope
            commitCatalog(({ catalog: cat }) => ({
              catalog: upsertProperty(cat, {
                id: draft.id,
                name: draft.name,
                nameHe: draft.nameHe,
                required: draft.required,
                inMarketName: draft.inMarketName,
                sign: draft.sign,
                categoryIds: scope.level === 'category' ? [scope.categoryId] : [],
                subcategoryIds: scope.level === 'subcategory' ? [scope.subcategoryId] : [],
                options: draft.options,
              }),
            }))
            setDialog({ kind: 'properties', scope })
          }}
          onDelete={
            dialog.item
              ? () => {
                  const id = dialog.item?.id
                  const scope = dialog.kind === 'property' ? dialog.scope : null
                  if (!id || !scope) return
                  commitCatalog(({ catalog: cat }) => ({ catalog: deleteProperty(cat, id) }))
                  setDialog({ kind: 'properties', scope })
                }
              : undefined
          }
        />
      )}
    </>
  )
}

function PropertiesList({
  title,
  rows,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string
  rows: CatalogProperty[]
  onClose: () => void
  onAdd: () => void
  onEdit: (row: CatalogProperty) => void
  onDelete: (id: string) => void
}) {
  const { t, tr } = useI18n()
  return (
    <Backdrop onClick={onClose}>
      <TreeDialog role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <DialogTitle>{title}</DialogTitle>
        <AdminTable
          embedded
          rows={rows}
          rowId={(row) => row.id}
          empty={t.admin.noCategoryProperties}
          addLabel={t.admin.addProperty}
          onAdd={onAdd}
          onRowClick={onEdit}
          columns={[
            { id: 'name', header: t.admin.serverColName, cell: (row) => tr(row.name, row.nameHe) },
            { id: 'sign', header: t.admin.sign, cell: (row) => row.sign || '—', muted: true },
            {
              id: 'options',
              header: t.admin.optionsEn,
              cell: (row) => String(row.options.length),
              muted: true,
            },
          ]}
          actions={(row) => [
            {
              id: 'edit',
              label: t.admin.editProperty,
              variant: 'secondary',
              onClick: () => onEdit(row),
            },
            {
              id: 'delete',
              label: t.admin.delete,
              variant: 'danger',
              disabled: SYSTEM_PROPERTY_IDS.has(row.id),
              onClick: () => onDelete(row.id),
            },
          ]}
        />
      </TreeDialog>
    </Backdrop>
  )
}

export function CatalogTreeDialog({
  categoryId,
  onClose,
}: {
  categoryId: string
  onClose: () => void
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const category = db.catalog.categories.find((item) => item.id === categoryId)
  return (
    <Backdrop onClick={onClose}>
      <TreeDialog role="dialog" aria-modal="true" aria-labelledby="catalog-tree-title" onClick={(event) => event.stopPropagation()}>
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <DialogTitle id="catalog-tree-title">
          {category ? tr(category.name, category.nameHe) : t.admin.serverCategories}
        </DialogTitle>
        <CatalogTree onlyCategoryId={categoryId} startExpanded />
      </TreeDialog>
    </Backdrop>
  )
}
