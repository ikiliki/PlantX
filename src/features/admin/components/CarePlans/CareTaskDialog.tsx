import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormGrid, Input } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { CareAudience, CareIcon, CareRule, CareTask, CareTaskRule, Catalog } from '../../../../mock/types'
import { CARE_ICONS, TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { CareIntervalFields } from '../CareIntervalFields/CareIntervalFields'
import { IconPick, IconRow, LinkList, LinkRow, Muted, Source } from './CarePlans.styles'

export type CareTaskDraft = Omit<CareTask, 'id' | 'builtIn'> & { id?: string }

/**
 * A general task in Care plans: its names, icon, who gets it (every plant, linked categories, or optional),
 * its default interval (none: owners set it), and the categories / varieties it is linked to.
 */
export function CareTaskDialog({
  catalog,
  task,
  describe,
  onSave,
  onDelete,
  onLink,
  onEditLink,
  onClose,
}: {
  catalog: Catalog
  task?: CareTask
  describe: (rule?: CareRule) => string
  onSave: (draft: CareTaskDraft) => void
  onDelete?: () => void
  onLink?: () => void
  onEditLink?: (rule: CareTaskRule) => void
  onClose: () => void
}) {
  const { t, tr } = useI18n()
  const [name, setName] = useState(task?.name ?? '')
  const [nameHe, setNameHe] = useState(task?.nameHe ?? '')
  const [icon, setIcon] = useState<CareIcon>(task?.icon ?? 'sun')
  const [audience, setAudience] = useState<CareAudience>(task?.audience ?? 'linked')
  const [interval, setInterval] = useState<CareRule | undefined>(task?.interval)
  const [confirming, setConfirming] = useState(false)
  const links = task ? catalog.careRules.filter((rule) => rule.taskId === task.id) : []

  const scopeName = (rule: CareTaskRule) => {
    const category = catalog.categories.find((item) => item.id === rule.categoryId)
    const variety = rule.subcategoryId ? catalog.subcategories.find((item) => item.id === rule.subcategoryId) : undefined
    const base = category ? tr(category.name, category.nameHe) : rule.categoryId
    return variety ? `${base} · ${tr(variety.name, variety.nameHe)}` : base
  }

  if (confirming && onDelete) {
    return (
      <ModalDialog
        title={t.admin.careDeleteTask}
        lead={t.admin.careDeleteLead}
        onClose={() => setConfirming(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
              {t.common.cancel}
            </Button>
            <Button type="button" variant="danger" onClick={onDelete}>
              {t.admin.careDeleteTask}
            </Button>
          </>
        }
      />
    )
  }

  return (
    <ModalDialog
      title={task ? t.admin.careEditTask : t.admin.careNewTask}
      width={560}
      onClose={onClose}
      footer={
        <>
          {task && !task.builtIn && onDelete ? (
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirming(true)}>
              {t.admin.careDeleteTask}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            variant="growth"
            disabled={!name.trim()}
            onClick={() => onSave({ id: task?.id, name, nameHe, icon, audience, interval })}
          >
            {t.common.save}
          </Button>
        </>
      }
    >
      <FormGrid>
        <Field>
          {t.admin.careTaskName}
          <Input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field>
          {t.admin.careTaskNameHe}
          <Input value={nameHe} maxLength={40} dir="rtl" onChange={(event) => setNameHe(event.target.value)} />
        </Field>
        <Field as="div">
          {t.admin.careTaskIcon}
          <IconRow role="radiogroup" aria-label={t.admin.careTaskIcon}>
            {CARE_ICONS.map((item) => (
              <IconPick
                key={item}
                type="button"
                role="radio"
                aria-checked={icon === item}
                aria-label={item}
                $on={icon === item}
                onClick={() => setIcon(item)}
              >
                <TodoKindIcon icon={item} size={18} />
              </IconPick>
            ))}
          </IconRow>
        </Field>
        <Field as="div">
          {t.admin.careWho}
          <Segmented
            ariaLabel={t.admin.careWho}
            value={audience}
            onChange={setAudience}
            options={[
              { id: 'all', label: t.admin.careWhoAll },
              { id: 'linked', label: t.admin.careWhoLinked },
              { id: 'optional', label: t.admin.careWhoOptional },
            ]}
          />
        </Field>
        <Field as="div">
          {t.admin.careDefault}
          <CareIntervalFields value={interval} onChange={setInterval} offLabel={t.admin.careNoDefault} />
        </Field>
        {task ? (
          <Field as="div">
            {t.admin.careLinks}
            {links.length === 0 ? (
              <Muted>{t.admin.careNoLinks}</Muted>
            ) : (
              <LinkList>
                {links.map((rule) => (
                  <LinkRow key={rule.id}>
                    <span>{scopeName(rule)}</span>
                    <span>
                      {rule.mode === 'off'
                        ? t.admin.careOff
                        : `${rule.mode === 'optional' ? `${t.admin.careOptional} · ` : ''}${describe(rule.interval ?? task.interval)}`}
                    </span>
                    <Source $ai={rule.source === 'ai'}>{rule.source === 'ai' ? t.admin.careAi : t.admin.careAdmin}</Source>
                    {onEditLink ? (
                      <Button type="button" size="sm" variant="ghost" onClick={() => onEditLink(rule)}>
                        {t.admin.careEdit}
                      </Button>
                    ) : null}
                  </LinkRow>
                ))}
              </LinkList>
            )}
            {onLink ? (
              <Button type="button" size="sm" variant="secondary" onClick={onLink}>
                + {t.admin.careLink}
              </Button>
            ) : null}
          </Field>
        ) : null}
      </FormGrid>
    </ModalDialog>
  )
}
