import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, Select } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Catalog, CareRule, CareTaskRule } from '../../../../mock/types'
import { CareIntervalFields } from '../CareIntervalFields/CareIntervalFields'

export type CareRuleDraft = Omit<CareTaskRule, 'id' | 'source'>

/**
 * One rule in Care plans: a task for a whole category or one of its varieties — must, optional or off, and
 * its interval (or the task's default). Opened from a task (task fixed) or from a category (category fixed).
 */
export function CareRuleDialog({
  catalog,
  initial,
  fixed,
  onSave,
  onRemove,
  onClose,
}: {
  catalog: Catalog
  initial: Partial<CareRuleDraft>
  fixed: 'task' | 'category' | 'both'
  onSave: (rule: CareRuleDraft) => void
  onRemove?: () => void
  onClose: () => void
}) {
  const { t, tr } = useI18n()
  const [taskId, setTaskId] = useState(initial.taskId ?? catalog.careTasks[0]?.id ?? '')
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? catalog.categories[0]?.id ?? '')
  const [subcategoryId, setSubcategoryId] = useState(initial.subcategoryId ?? '')
  const [mode, setMode] = useState<CareTaskRule['mode']>(initial.mode ?? 'must')
  const [interval, setInterval] = useState<CareRule | undefined>(initial.interval)
  const task = catalog.careTasks.find((item) => item.id === taskId)
  const category = catalog.categories.find((item) => item.id === categoryId)
  const varieties = catalog.subcategories.filter((item) => item.categoryId === categoryId)
  const variety = varieties.find((item) => item.id === subcategoryId)
  const scope = variety ? tr(variety.name, variety.nameHe) : category ? tr(category.name, category.nameHe) : ''

  return (
    <ModalDialog
      title={t.admin.careRuleTitle.replace('{task}', task ? tr(task.name, task.nameHe) : '').replace('{scope}', scope)}
      width={520}
      onClose={onClose}
      footer={
        <>
          {onRemove ? (
            <Button type="button" variant="danger" size="sm" onClick={onRemove}>
              {t.admin.careRemove}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="growth"
            disabled={!taskId || !categoryId}
            onClick={() =>
              onSave({
                taskId,
                categoryId,
                ...(subcategoryId ? { subcategoryId } : {}),
                mode,
                ...(interval && mode !== 'off' ? { interval } : {}),
              })
            }
          >
            {t.common.save}
          </Button>
        </>
      }
    >
      <FormGrid>
        {fixed === 'category' ? (
          <Field>
            {t.admin.careTask}
            <Select value={taskId} onChange={(event) => setTaskId(event.target.value)}>
              {catalog.careTasks.map((item) => (
                <option key={item.id} value={item.id}>
                  {tr(item.name, item.nameHe)}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {fixed === 'task' ? (
          <Field>
            {t.admin.careCategory}
            <Select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value)
                setSubcategoryId('')
              }}
            >
              {catalog.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {tr(item.name, item.nameHe)}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {varieties.length > 0 && fixed !== 'both' ? (
          <Field>
            {t.admin.careVariety}
            <Select value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)}>
              <option value="">{t.admin.careWholeCategory}</option>
              {varieties.map((item) => (
                <option key={item.id} value={item.id}>
                  {tr(item.name, item.nameHe)}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field as="div">
          {t.admin.careMode}
          <Segmented
            ariaLabel={t.admin.careMode}
            value={mode}
            onChange={setMode}
            options={[
              { id: 'must', label: t.admin.careMust },
              { id: 'optional', label: t.admin.careOptional },
              { id: 'off', label: t.admin.careOff },
            ]}
          />
        </Field>
        {mode !== 'off' ? (
          <Field as="div">
            {t.admin.careInterval}
            <CareIntervalFields value={interval} onChange={setInterval} offLabel={t.admin.careUseTaskDefault} />
          </Field>
        ) : null}
      </FormGrid>
    </ModalDialog>
  )
}
