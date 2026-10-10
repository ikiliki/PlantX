import { useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Input } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Catalog, CareRule, CareTask, CareTaskRule } from '../../../../mock/types'
import { CatalogMark } from '../../../greenhouse/components/CatalogMark/CatalogMark'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { acceptCareRule, deleteCareRule, deleteCareTask, upsertCareRule, upsertCareTask } from '../../careMutations'
import { CareRuleDialog, type CareRuleDraft } from './CareRuleDialog'
import { CareTaskDialog } from './CareTaskDialog'
import {
  Actions,
  CategoryBody,
  CategoryHead,
  CategoryItem,
  Chip,
  Chips,
  Error,
  Lead,
  Muted,
  Root,
  RuleTable,
  Section,
  SectionHead,
  Source,
  TaskName,
} from './CarePlans.styles'

type Dialog =
  | { kind: 'none' }
  | { kind: 'task'; task?: CareTask }
  | { kind: 'rule'; initial: Partial<CareRuleDraft>; fixed: 'task' | 'category' | 'both'; ruleId?: string; back?: CareTask }

/**
 * Admin → Server → Care plans: the general tasks (who gets each, its default), then every category with its
 * rule per task — AI's or the admin's — and "Suggest with AI". Varieties appear only where they differ.
 * Edits go through `commitCatalog` (saved with the catalog; plants' tasks follow).
 */
export function CarePlans() {
  const { t, tr } = useI18n()
  const { db, commitCatalog, suggestCare } = useStore()
  const catalog = db.catalog
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' })
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)

  const commit = (fn: (catalog: Catalog) => Catalog) => commitCatalog(({ catalog: current }) => ({ catalog: fn(current) }))
  const close = () => setDialog({ kind: 'none' })

  const describe = (rule?: CareRule) => {
    if (!rule) return t.admin.careNotSet
    const every = rule.winterEveryDays
      ? t.admin.careEveryWinter.replace('{n}', String(rule.everyDays)).replace('{w}', String(rule.winterEveryDays))
      : t.admin.careEvery.replace('{n}', String(rule.everyDays))
    return rule.months ? `${every} · ${t.admin.careSeasonShort}` : every
  }
  const who = (task: CareTask) =>
    task.audience === 'all' ? t.admin.careWhoAll : task.audience === 'optional' ? t.admin.careWhoOptional : t.admin.careWhoLinked
  const taskName = (task: CareTask) => tr(task.name, task.nameHe)
  const ruleText = (rule: CareTaskRule, task: CareTask) =>
    rule.mode === 'off'
      ? t.admin.careOff
      : `${rule.mode === 'optional' ? `${t.admin.careOptional} · ` : ''}${describe(rule.interval ?? task.interval)}`

  const needle = query.trim().toLowerCase()
  const categories = catalog.categories.filter(
    (item) => !needle || item.name.toLowerCase().includes(needle) || item.nameHe.includes(query.trim()),
  )

  const suggest = async (categoryId: string) => {
    setBusyId(categoryId)
    setFailedId(null)
    const ok = await suggestCare(categoryId)
    setBusyId(null)
    if (!ok) setFailedId(categoryId)
  }

  return (
    <Root>
      <Lead>{t.admin.careLead}</Lead>

      <Section>
        <SectionHead>
          <h3>{t.admin.careTasks}</h3>
          <Button type="button" size="sm" variant="secondary" onClick={() => setDialog({ kind: 'task' })}>
            + {t.admin.careNewTask}
          </Button>
        </SectionHead>
        <RuleTable>
          <tbody>
            {catalog.careTasks.map((task) => (
              <tr key={task.id} data-care-task={task.id}>
                <td>
                  <TaskName>
                    <TodoKindIcon icon={task.icon} size={18} />
                    {taskName(task)}
                    {task.builtIn ? <Muted as="span">· {t.admin.careBuiltIn}</Muted> : null}
                  </TaskName>
                </td>
                <td>{who(task)}</td>
                <td>{task.interval ? describe(task.interval) : t.admin.careNoDefault}</td>
                <td>
                  <Muted as="span">
                    {t.admin.careRuleCount.replace('{n}', String(catalog.careRules.filter((rule) => rule.taskId === task.id).length))}
                  </Muted>
                </td>
                <td>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setDialog({ kind: 'task', task })}>
                    {t.admin.careEdit}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </RuleTable>
      </Section>

      <Section>
        <SectionHead>
          <h3>{t.admin.careByCategory}</h3>
          <Input
            type="search"
            value={query}
            placeholder={t.admin.careSearch}
            aria-label={t.admin.careSearch}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SectionHead>
        {categories.map((category) => {
          const open = openId === category.id
          const own = catalog.careRules.filter((rule) => rule.categoryId === category.id && !rule.subcategoryId)
          const varietyRules = catalog.careRules.filter((rule) => rule.categoryId === category.id && rule.subcategoryId)
          const aiCount = [...own, ...varietyRules].filter((rule) => rule.source === 'ai').length
          return (
            <CategoryItem key={category.id} data-care-category={category.id}>
              <CategoryHead type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : category.id)}>
                <CatalogMark photo={category.photo} name={category.name} size={28} />
                <strong>{tr(category.name, category.nameHe)}</strong>
                <Chips>
                  {catalog.careTasks.map((task) => {
                    const rule = own.find((item) => item.taskId === task.id)
                    const applies = rule ? rule.mode !== 'off' : task.audience === 'all'
                    const interval = rule?.interval ?? task.interval
                    if (!applies) return null
                    return (
                      <Chip key={task.id} title={taskName(task)} $optional={rule?.mode === 'optional'}>
                        <TodoKindIcon icon={task.icon} size={12} />
                        {interval ? `${interval.everyDays}d` : '?'}
                      </Chip>
                    )
                  })}
                </Chips>
                {aiCount > 0 ? <Source $ai>{t.admin.careAi}</Source> : null}
              </CategoryHead>
              {open ? (
                <CategoryBody>
                  <Actions>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId === category.id}
                      aria-busy={busyId === category.id}
                      onClick={() => void suggest(category.id)}
                    >
                      ✦ {busyId === category.id ? t.admin.careSuggesting : t.admin.careSuggestAi}
                    </Button>
                    {failedId === category.id ? <Error role="alert">{t.admin.careSuggestFailed}</Error> : null}
                  </Actions>
                  <RuleTable>
                    <tbody>
                      {catalog.careTasks.map((task) => {
                        const rule = own.find((item) => item.taskId === task.id)
                        return (
                          <tr key={task.id} data-care-rule={`${task.id}:${category.id}`}>
                            <td>
                              <TaskName>
                                <TodoKindIcon icon={task.icon} size={16} />
                                {taskName(task)}
                              </TaskName>
                            </td>
                            <td>
                              {rule
                                ? ruleText(rule, task)
                                : task.audience === 'all'
                                  ? describe(task.interval)
                                  : t.admin.careOff}
                            </td>
                            <td>
                              {rule ? (
                                <Source $ai={rule.source === 'ai'}>{rule.source === 'ai' ? t.admin.careAi : t.admin.careAdmin}</Source>
                              ) : (
                                <Muted as="span">{t.admin.careFromTask}</Muted>
                              )}
                            </td>
                            <td>
                              {rule?.source === 'ai' ? (
                                <Button type="button" size="sm" variant="ghost" onClick={() => commit((c) => acceptCareRule(c, rule.id))}>
                                  {t.admin.careAccept}
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setDialog({
                                    kind: 'rule',
                                    fixed: 'both',
                                    ruleId: rule?.id,
                                    initial: rule ?? { taskId: task.id, categoryId: category.id, mode: 'must' },
                                  })
                                }
                              >
                                {t.admin.careEdit}
                              </Button>
                              {rule ? (
                                <Button type="button" size="sm" variant="ghost" onClick={() => commit((c) => deleteCareRule(c, rule.id))}>
                                  {t.admin.careRemove}
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </RuleTable>

                  <SectionHead>
                    <h4>{t.admin.careVarieties}</h4>
                    {catalog.subcategories.some((item) => item.categoryId === category.id) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDialog({
                            kind: 'rule',
                            fixed: 'category',
                            initial: {
                              categoryId: category.id,
                              subcategoryId: catalog.subcategories.find((item) => item.categoryId === category.id)?.id,
                              mode: 'must',
                            },
                          })
                        }
                      >
                        + {t.admin.careAddVariety}
                      </Button>
                    ) : null}
                  </SectionHead>
                  {varietyRules.length === 0 ? (
                    <Muted>{t.admin.careSame}</Muted>
                  ) : (
                    <RuleTable>
                      <tbody>
                        {varietyRules.map((rule) => {
                          const task = catalog.careTasks.find((item) => item.id === rule.taskId)
                          const variety = catalog.subcategories.find((item) => item.id === rule.subcategoryId)
                          if (!task) return null
                          return (
                            <tr key={rule.id}>
                              <td>{variety ? tr(variety.name, variety.nameHe) : rule.subcategoryId}</td>
                              <td>
                                <TaskName>
                                  <TodoKindIcon icon={task.icon} size={16} />
                                  {taskName(task)}
                                </TaskName>
                              </td>
                              <td>{ruleText(rule, task)}</td>
                              <td>
                                <Source $ai={rule.source === 'ai'}>{rule.source === 'ai' ? t.admin.careAi : t.admin.careAdmin}</Source>
                              </td>
                              <td>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDialog({ kind: 'rule', fixed: 'both', ruleId: rule.id, initial: rule })}
                                >
                                  {t.admin.careEdit}
                                </Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => commit((c) => deleteCareRule(c, rule.id))}>
                                  {t.admin.careRemove}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </RuleTable>
                  )}
                </CategoryBody>
              ) : null}
            </CategoryItem>
          )
        })}
      </Section>

      {dialog.kind === 'task' ? (
        <CareTaskDialog
          catalog={catalog}
          task={dialog.task}
          describe={describe}
          onClose={close}
          onSave={(draft) => {
            commit((c) => upsertCareTask(c, draft))
            close()
          }}
          onDelete={
            dialog.task && !dialog.task.builtIn
              ? () => {
                  const id = dialog.task!.id
                  commit((c) => deleteCareTask(c, id))
                  close()
                }
              : undefined
          }
          onLink={
            dialog.task
              ? () => setDialog({ kind: 'rule', fixed: 'task', initial: { taskId: dialog.task!.id, mode: 'must' }, back: dialog.task })
              : undefined
          }
          onEditLink={
            dialog.task
              ? (rule) => setDialog({ kind: 'rule', fixed: 'both', ruleId: rule.id, initial: rule, back: dialog.task })
              : undefined
          }
        />
      ) : null}

      {dialog.kind === 'rule' ? (
        <CareRuleDialog
          catalog={catalog}
          initial={dialog.initial}
          fixed={dialog.fixed}
          onClose={() => setDialog(dialog.back ? { kind: 'task', task: dialog.back } : { kind: 'none' })}
          onSave={(rule) => {
            commit((c) => upsertCareRule(c, rule))
            setDialog(dialog.back ? { kind: 'task', task: dialog.back } : { kind: 'none' })
          }}
          onRemove={
            dialog.ruleId
              ? () => {
                  const id = dialog.ruleId!
                  commit((c) => deleteCareRule(c, id))
                  setDialog(dialog.back ? { kind: 'task', task: dialog.back } : { kind: 'none' })
                }
              : undefined
          }
        />
      ) : null}
    </Root>
  )
}
