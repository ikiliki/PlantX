import { Fragment, useEffect, useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { catalogName, propertyChipText } from '../../../catalog/catalog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { CatalogProperty, CatalogCategory, CatalogSubcategory } from '../../../../mock/types'
import {
  deleteCategory,
  deleteProperty,
  deleteSubcategory,
  propertiesForCategory,
  propertiesForSubcategory,
  upsertCategory,
  upsertProperty,
  upsertSubcategory,
} from '../../catalogMutations'
import { CategoryEditorDialog } from './CategoryEditorDialog'
import { PropertyEditorDialog } from './PropertyEditorDialog'
import { SubcategoryEditorDialog } from './SubcategoryEditorDialog'
import {
  Action,
  ActionRow,
  DetailCell,
  Empty,
  HeadRow,
  NameCell,
  PanelTitle,
  PrimaryAction,
  PropertyPanel,
  RowMain,
  Scope,
  Section,
  SectionHead,
  Select,
  Table,
  Thumb,
} from './CatalogEditor.styles'

type PropertyScope =
  | { level: 'catalog' }
  | { level: 'category'; categoryId: string }
  | { level: 'subcategory'; subcategoryId: string }

type DialogState =
  | { kind: 'none' }
  | { kind: 'category'; item?: CatalogCategory }
  | { kind: 'subcategory'; item?: CatalogSubcategory }
  | { kind: 'property'; item?: CatalogProperty; scope: PropertyScope }

function ScopedProperties({
  title,
  hint,
  empty,
  items,
  onAdd,
  onEdit,
}: {
  title: string
  hint: string
  empty: string
  items: CatalogProperty[]
  onAdd: () => void
  onEdit: (item: CatalogProperty) => void
}) {
  const { t, locale } = useI18n()

  return (
    <PropertyPanel>
      <HeadRow>
        <PanelTitle>
          <strong>{title}</strong>
          <span>{hint}</span>
        </PanelTitle>
        <PrimaryAction type="button" onClick={onAdd}>
          + {t.admin.addProperty}
        </PrimaryAction>
      </HeadRow>
      {items.length === 0 ? (
        <Empty>{empty}</Empty>
      ) : (
        <Table>
          <thead>
            <tr>
              <th scope="col">{t.admin.nameEn}</th>
              <th scope="col">{t.admin.sign}</th>
              <th scope="col">{t.admin.optionsEn}</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} data-openable="true" onClick={() => onEdit(item)}>
                <td>
                  <NameCell>
                    <strong>{propertyChipText(item, locale)}</strong>
                    <span>{item.id}</span>
                  </NameCell>
                </td>
                <td>{item.sign || '—'}</td>
                <td>{item.options.length}</td>
                <td>
                  <Action
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onEdit(item)
                    }}
                  >
                    {t.admin.editProperty}
                  </Action>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PropertyPanel>
  )
}

export function CatalogEditor() {
  const { db, commitCatalog } = useStore()
  const { t, locale } = useI18n()
  const catalog = db.catalog
  const [scopeCategoryId, setScopeCategoryId] = useState(catalog.categories[0]?.id ?? '')
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [openSubcategoryId, setOpenSubcategoryId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' })

  useEffect(() => {
    if (!catalog.categories.some((item) => item.id === scopeCategoryId)) {
      setScopeCategoryId(catalog.categories[0]?.id ?? '')
    }
  }, [catalog.categories, scopeCategoryId])

  useEffect(() => {
    if (openCategoryId && !catalog.categories.some((item) => item.id === openCategoryId)) {
      setOpenCategoryId(null)
    }
  }, [catalog.categories, openCategoryId])

  useEffect(() => {
    if (openSubcategoryId && !catalog.subcategories.some((item) => item.id === openSubcategoryId)) {
      setOpenSubcategoryId(null)
    }
  }, [catalog.subcategories, openSubcategoryId])

  const subs = catalog.subcategories.filter((item) => item.categoryId === scopeCategoryId)
  const required = catalog.properties.filter(
    (item) => item.required && item.categoryIds.length === 0 && item.subcategoryIds.length === 0,
  )

  const close = () => setDialog({ kind: 'none' })

  const propertyScopeLabel = (scope: PropertyScope) => {
    if (scope.level === 'catalog') return t.admin.requiredPropertiesScope
    if (scope.level === 'category') {
      const category = catalog.categories.find((item) => item.id === scope.categoryId)
      return category ? `${t.admin.forCategory} · ${catalogName(category, locale)}` : t.admin.forCategory
    }
    const sub = catalog.subcategories.find((item) => item.id === scope.subcategoryId)
    return sub ? `${t.admin.forSubcategory} · ${catalogName(sub, locale)}` : t.admin.forSubcategory
  }

  return (
    <>
      <Section>
        <SectionHead>
          <HeadRow>
            <div>
              <h2>{t.admin.requiredProperties}</h2>
              <p>{t.admin.requiredPropertiesHint}</p>
            </div>
            <PrimaryAction type="button" onClick={() => setDialog({ kind: 'property', scope: { level: 'catalog' } })}>
              + {t.admin.addProperty}
            </PrimaryAction>
          </HeadRow>
        </SectionHead>
        {required.length === 0 ? (
          <Empty>{t.admin.noRequiredProperties}</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th scope="col">{t.admin.nameEn}</th>
                <th scope="col">{t.admin.sign}</th>
                <th scope="col">{t.admin.optionsEn}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {required.map((item) => (
                <tr key={item.id}>
                  <td>
                    <NameCell>
                      <strong>{catalogName(item, locale)}</strong>
                      <span>{item.id}</span>
                    </NameCell>
                  </td>
                  <td>{item.sign || '—'}</td>
                  <td>{item.options.length}</td>
                  <td>
                    <Action
                      type="button"
                      onClick={() => setDialog({ kind: 'property', item, scope: { level: 'catalog' } })}
                    >
                      {t.admin.editProperty}
                    </Action>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <SectionHead>
          <HeadRow>
            <div>
              <h2>{t.admin.category}</h2>
              <p>{t.admin.categoryChipHint}</p>
            </div>
            <PrimaryAction type="button" onClick={() => setDialog({ kind: 'category' })}>
              + {t.admin.addCategory}
            </PrimaryAction>
          </HeadRow>
        </SectionHead>
        {catalog.categories.length === 0 ? (
          <Empty>{t.admin.noCategories}</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th scope="col">{t.admin.nameEn}</th>
                <th scope="col">{t.admin.ticker}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {catalog.categories.map((item) => (
                <Fragment key={item.id}>
                  <tr data-openable="true" onClick={() => setDialog({ kind: 'category', item })}>
                    <td>
                      <RowMain>
                        <Thumb>{item.photo ? <PlantImage src={item.photo} alt="" /> : null}</Thumb>
                        <NameCell>
                          <strong>{catalogName(item, locale)}</strong>
                          <span>{item.id}</span>
                        </NameCell>
                      </RowMain>
                    </td>
                    <td>{item.ticker}</td>
                    <td>
                      <ActionRow onClick={(event) => event.stopPropagation()}>
                        <Action
                          type="button"
                          $active={openCategoryId === item.id}
                          onClick={() =>
                            setOpenCategoryId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          {t.admin.properties}
                        </Action>
                        <Action type="button" onClick={() => setDialog({ kind: 'category', item })}>
                          {t.admin.editCategory}
                        </Action>
                      </ActionRow>
                    </td>
                  </tr>
                  {openCategoryId === item.id && (
                    <tr>
                      <DetailCell colSpan={3}>
                        <ScopedProperties
                          title={catalogName(item, locale)}
                          hint={t.admin.forCategory}
                          empty={t.admin.noCategoryProperties}
                          items={propertiesForCategory(catalog, item.id)}
                          onAdd={() =>
                            setDialog({
                              kind: 'property',
                              scope: { level: 'category', categoryId: item.id },
                            })
                          }
                          onEdit={(property) =>
                            setDialog({
                              kind: 'property',
                              item: property,
                              scope: { level: 'category', categoryId: item.id },
                            })
                          }
                        />
                      </DetailCell>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <SectionHead>
          <HeadRow>
            <div>
              <h2>{t.admin.subcategory}</h2>
              <p>{t.admin.subcategoryChipHint}</p>
            </div>
            <PrimaryAction
              type="button"
              disabled={!scopeCategoryId}
              onClick={() => setDialog({ kind: 'subcategory' })}
            >
              + {t.admin.addSubcategory}
            </PrimaryAction>
          </HeadRow>
        </SectionHead>
        <Scope>
          {t.admin.editCatalog}
          <Select
            value={scopeCategoryId}
            disabled={catalog.categories.length === 0}
            onChange={(event) => {
              setScopeCategoryId(event.target.value)
              setOpenSubcategoryId(null)
            }}
            aria-label={t.admin.category}
          >
            {catalog.categories.length === 0 && <option value="">{t.admin.noCategories}</option>}
            {catalog.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {catalogName(item, locale)}
              </option>
            ))}
          </Select>
        </Scope>
        {!scopeCategoryId ? (
          <Empty>{t.admin.noCategories}</Empty>
        ) : subs.length === 0 ? (
          <Empty>{t.admin.noSubcategories}</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <th scope="col">{t.admin.nameEn}</th>
                <th scope="col">{t.admin.code}</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {subs.map((item) => (
                <Fragment key={item.id}>
                  <tr
                    data-openable="true"
                    onClick={() => setDialog({ kind: 'subcategory', item })}
                  >
                    <td>
                      <RowMain>
                        <Thumb>{item.photo ? <PlantImage src={item.photo} alt="" /> : null}</Thumb>
                        <NameCell>
                          <strong>{catalogName(item, locale)}</strong>
                          <span>{item.id}</span>
                        </NameCell>
                      </RowMain>
                    </td>
                    <td>{item.code}</td>
                    <td>
                      <ActionRow onClick={(event) => event.stopPropagation()}>
                        <Action
                          type="button"
                          $active={openSubcategoryId === item.id}
                          onClick={() =>
                            setOpenSubcategoryId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          {t.admin.properties}
                        </Action>
                        <Action type="button" onClick={() => setDialog({ kind: 'subcategory', item })}>
                          {t.admin.editSubcategory}
                        </Action>
                      </ActionRow>
                    </td>
                  </tr>
                  {openSubcategoryId === item.id && (
                    <tr>
                      <DetailCell colSpan={3}>
                        <ScopedProperties
                          title={catalogName(item, locale)}
                          hint={t.admin.forSubcategory}
                          empty={t.admin.noSubProperties}
                          items={propertiesForSubcategory(catalog, item.id)}
                          onAdd={() =>
                            setDialog({
                              kind: 'property',
                              scope: { level: 'subcategory', subcategoryId: item.id },
                            })
                          }
                          onEdit={(property) =>
                            setDialog({
                              kind: 'property',
                              item: property,
                              scope: { level: 'subcategory', subcategoryId: item.id },
                            })
                          }
                        />
                      </DetailCell>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      {dialog.kind === 'category' && (
        <CategoryEditorDialog
          initial={dialog.item}
          onClose={close}
          onConfirm={(draft) => {
            commitCatalog(({ catalog: cat, species }) => {
              const next = upsertCategory(cat, species, draft)
              if (!dialog.item?.id && next.catalog.categories.length > cat.categories.length) {
                const created = next.catalog.categories[next.catalog.categories.length - 1]
                setScopeCategoryId(created.id)
              }
              return next
            })
            close()
          }}
          onDelete={
            dialog.item
              ? () => {
                  commitCatalog(({ catalog: cat }) => ({
                    catalog: deleteCategory(cat, dialog.item!.id),
                    species: undefined,
                  }))
                  close()
                }
              : undefined
          }
        />
      )}

      {dialog.kind === 'subcategory' && scopeCategoryId && (
        <SubcategoryEditorDialog
          categoryId={scopeCategoryId}
          initial={dialog.item}
          inheritedCare={catalog.categories.find((item) => item.id === scopeCategoryId)?.care}
          onClose={close}
          onConfirm={(draft) => {
            commitCatalog(({ catalog: cat }) => ({
              catalog: upsertSubcategory(cat, draft),
            }))
            close()
          }}
          onDelete={
            dialog.item
              ? () => {
                  commitCatalog(({ catalog: cat }) => ({
                    catalog: deleteSubcategory(cat, dialog.item!.id),
                  }))
                  if (openSubcategoryId === dialog.item?.id) setOpenSubcategoryId(null)
                  close()
                }
              : undefined
          }
        />
      )}

      {dialog.kind === 'property' && (
        <PropertyEditorDialog
          scopeLabel={propertyScopeLabel(dialog.scope)}
          initial={dialog.item}
          forceRequired={dialog.scope.level === 'catalog'}
          defaultRequired
          takenSigns={catalog.properties
            .filter((item) => item.id !== dialog.item?.id && item.sign)
            .map((item) => item.sign)}
          onClose={close}
          onConfirm={(draft) => {
            if (draft.options.length === 0) return
            const scope = dialog.scope
            commitCatalog(({ catalog: cat }) => ({
              catalog: upsertProperty(cat, {
                id: draft.id,
                name: draft.name,
                nameHe: draft.nameHe,
                required: scope.level === 'catalog' ? true : draft.required,
                inMarketName: draft.inMarketName,
                sign: draft.sign,
                categoryIds: scope.level === 'category' ? [scope.categoryId] : [],
                subcategoryIds: scope.level === 'subcategory' ? [scope.subcategoryId] : [],
                options: draft.options,
              }),
            }))
            close()
          }}
          onDelete={
            dialog.item
              ? () => {
                  commitCatalog(({ catalog: cat }) => ({
                    catalog: deleteProperty(cat, dialog.item!.id),
                  }))
                  close()
                }
              : undefined
          }
        />
      )}
    </>
  )
}
