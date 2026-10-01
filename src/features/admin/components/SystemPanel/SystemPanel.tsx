import { type ReactNode, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { Switch } from '../../../../components/Switch/Switch'
import type { ServerSlice } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import {
  PAGE_FEATURE,
  PAGE_IDS,
  PLAIN,
  PLACEMENTS,
  type FeatureId,
  type PageId,
  type PageStatus,
  type PlacementId,
  type ReleaseMode,
} from '../../../../theme/release'
import { PagePreview } from './PagePreview'
import { RedirectPreview } from './RedirectPreview'
import { PlacementPreview } from './PlacementPreview'
import { PlainPreview } from './PlainPreview'
import {
  Block,
  Chevron,
  ComponentStack,
  Controls,
  Count,
  Group,
  Groups,
  Head,
  HeadToggle,
  Item,
  ItemHead,
  Lead,
  NameCell,
  Ok,
  PageBand,
  PageHead,
  PageMark,
  Path,
  FeatureBody,
  FeatureToggle,
  Folder,
  FolderToggle,
  PageToggle,
  PreviewLabel,
  PreviewWell,
  Section,
  Select,
  Shell,
} from './SystemPanel.styles'

const PAGE_STATUSES: PageStatus[] = ['live', 'maintenance']
const RELEASE_MODES: ReleaseMode[] = ['ready', 'comingSoon', 'maintenance']
const FEATURE_ORDER: FeatureId[] = ['news', 'market', 'greenhouse', 'todo', 'rank', 'wiki']

const PAGE_SLICES = {
  home: ['users', 'plants', 'updates', 'todos', 'catalog'],
  market: ['users', 'plants', 'catalog'],
  greenhouse: ['users', 'plants', 'updates', 'todos', 'catalog'],
  todo: ['users', 'plants', 'todos', 'updates'],
  rank: ['users', 'plants'],
  wiki: ['plants', 'catalog'],
} as const satisfies Record<PageId, readonly ServerSlice[]>

const FEATURE_SLICES = {
  news: PAGE_SLICES.home,
  market: PAGE_SLICES.market,
  greenhouse: PAGE_SLICES.greenhouse,
  todo: PAGE_SLICES.todo,
  rank: PAGE_SLICES.rank,
  wiki: PAGE_SLICES.wiki,
} as const satisfies Record<FeatureId, readonly ServerSlice[]>

function FetchHold({
  active,
  slices,
  children,
}: {
  active: boolean
  slices: readonly ServerSlice[]
  children: (fetching: boolean) => ReactNode
}) {
  const fetching = useSectionFetch(active, slices)
  return children(fetching)
}

function pageLabel(id: PageId, t: ReturnType<typeof useI18n>['t']) {
  if (id === 'home') return t.nav.home
  if (id === 'market') return t.nav.market
  if (id === 'greenhouse') return t.nav.greenhouse
  if (id === 'todo') return t.nav.todo
  if (id === 'rank') return t.nav.rank
  return t.nav.wiki
}

function pageStatusLabel(status: PageStatus, t: ReturnType<typeof useI18n>['t']) {
  return status === 'live' ? t.admin.systemLive : t.admin.systemMaintenance
}

function featureLabel(id: FeatureId, t: ReturnType<typeof useI18n>['t']) {
  if (id === 'news') return t.nav.home
  if (id === 'market') return t.nav.market
  if (id === 'greenhouse') return t.nav.greenhouse
  if (id === 'todo') return t.nav.todo
  if (id === 'rank') return t.nav.rank
  return t.nav.wiki
}

function MountPath({ pageId, id }: { pageId: PageId; id: string }) {
  const { t } = useI18n()
  return (
    <span>
      {pageLabel(pageId, t)}
      {' / '}
      <Path dir="ltr">{id}</Path>
    </span>
  )
}

function featureStatusLabel(status: ReleaseMode, t: ReturnType<typeof useI18n>['t']) {
  if (status === 'ready') return t.admin.systemReady
  if (status === 'comingSoon') return t.admin.systemComingSoon
  return t.admin.systemMaintenance
}

export function SystemPanel() {
  const { t } = useI18n()
  const { db, systemPending, setAppLaunched, setPageStatus, setFeatureEnabled, setFeatureStatus, setPlacementEnabled } =
    useStore()
  const locked = systemPending !== null
  const [appOpen, setAppOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [openPages, setOpenPages] = useState<ReadonlySet<PageId>>(() => new Set())
  const [openGroups, setOpenGroups] = useState<ReadonlySet<FeatureId>>(() => new Set())
  const [openCategories, setOpenCategories] = useState<ReadonlySet<string>>(() => new Set())

  const toggleSet = <T extends string>(id: T, set: (value: ReadonlySet<T> | ((current: ReadonlySet<T>) => ReadonlySet<T>)) => void) => {
    set((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Shell>
      <Section>
        <Head>
          <HeadToggle type="button" aria-expanded={appOpen} onClick={() => setAppOpen((open) => !open)}>
            {t.admin.systemApp}
            <Chevron aria-hidden $open={appOpen} />
          </HeadToggle>
        </Head>
        {appOpen && (
          <Block>
            <Lead>{t.admin.systemAppLead}</Lead>
            <Switch
              disabled={locked}
              busy={systemPending === 'app'}
              busyLabel={t.common.loading}
              checked={db.system.launched}
              ariaLabel={t.admin.systemApp}
              onChange={setAppLaunched}
              label={db.system.launched ? t.admin.systemAppOn : t.admin.systemAppOff}
            />
          </Block>
        )}
      </Section>

      <Section>
        <Head>
          <HeadToggle
            type="button"
            aria-expanded={previewOpen}
            onClick={() => setPreviewOpen((open) => !open)}
          >
            {t.admin.systemRedirects}
            <Chevron aria-hidden $open={previewOpen} />
          </HeadToggle>
        </Head>
        {previewOpen && (
          <Block>
            <Lead>{t.admin.systemRedirectsLead}</Lead>
            <RedirectPreview />
          </Block>
        )}
      </Section>

      <Section>
        <Head>
          <HeadToggle
            type="button"
            aria-expanded={pagesOpen}
            onClick={() => setPagesOpen((open) => !open)}
          >
            {t.admin.systemPages}
            <Chevron aria-hidden $open={pagesOpen} />
          </HeadToggle>
        </Head>
        {pagesOpen && (
          <Block>
            <Lead>{t.admin.systemPagesLead}</Lead>
            <Groups>
              {PAGE_IDS.map((pageId) => {
                const open = openPages.has(pageId)
                const label = pageLabel(pageId, t)
                return (
                  <FetchHold key={pageId} active={open} slices={PAGE_SLICES[pageId]}>
                  {(fetching) => (
                  <Group>
                    <PageHead>
                      <PageToggle
                        type="button"
                        $open={open}
                        disabled={fetching}
                        aria-expanded={open}
                        aria-busy={fetching}
                        onClick={() => {
                          if (!fetching) toggleSet(pageId, setOpenPages)
                        }}
                      >
                        <NameCell>
                          <strong>{label}</strong>
                          <span>/{pageId === 'home' ? 'home' : pageId}</span>
                        </NameCell>
                        <Chevron aria-hidden $open={open} />
                      </PageToggle>
                      <Select
                        aria-label={`${label} ${t.admin.systemStatus}`}
                        aria-busy={systemPending === `page:${pageId}`}
                        disabled={locked}
                        value={db.system.pages[pageId]}
                        onChange={(event) => setPageStatus(pageId, event.target.value as PageStatus)}
                      >
                        {PAGE_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {pageStatusLabel(status, t)}
                          </option>
                        ))}
                      </Select>
                    </PageHead>
                    {open &&
                      (fetching ? (
                        <LoaderShell busy />
                      ) : (
                        <PreviewWell>
                          <PreviewLabel>{t.admin.systemPreview}</PreviewLabel>
                          <PagePreview pageId={pageId} />
                        </PreviewWell>
                      ))}
                  </Group>
                  )}
                  </FetchHold>
                )
              })}
            </Groups>
          </Block>
        )}
      </Section>

      <Section>
        <Head>
          <HeadToggle
            type="button"
            aria-expanded={featuresOpen}
            onClick={() => setFeaturesOpen((open) => !open)}
          >
            {t.admin.systemFeatures}
            <Chevron aria-hidden $open={featuresOpen} />
          </HeadToggle>
        </Head>
        {featuresOpen && (
          <Block>
            <Lead>{t.admin.systemFeaturesLead}</Lead>
            <Groups>
              {FEATURE_ORDER.map((featureId) => {
                const feature = db.system.features[featureId]
                const placements = PLACEMENTS.filter((item) => item.featureId === featureId)
                const editable = placements.filter((item) => !item.required)
                const plain = PLAIN.filter((item) => PAGE_FEATURE[item.pageId] === featureId)
                const categories = PAGE_IDS.flatMap((pageId) => {
                  const placed = placements.filter((item) => item.pageId === pageId)
                  const quiet = plain.filter((item) => item.pageId === pageId)
                  return placed.length + quiet.length === 0 ? [] : [{ pageId, placed, quiet }]
                })
                const open = openGroups.has(featureId)
                const label = featureLabel(featureId, t)
                return (
                  <FetchHold key={featureId} active={open} slices={FEATURE_SLICES[featureId]}>
                  {(fetching) => (
                  <Group>
                    <PageHead>
                      <FeatureToggle
                        type="button"
                        $open={open}
                        disabled={fetching}
                        aria-expanded={open}
                        aria-busy={fetching}
                        onClick={() => {
                          if (!fetching) toggleSet(featureId, setOpenGroups)
                        }}
                      >
                        {label}
                        <Count>{editable.length}</Count>
                        <Chevron aria-hidden $open={open} />
                      </FeatureToggle>
                      <Controls>
                        <Switch
                          disabled={locked}
                          busy={systemPending === `feature:${featureId}`}
                          busyLabel={t.common.loading}
                          checked={feature.enabled}
                          ariaLabel={`${label} ${feature.enabled ? t.admin.systemEnabled : t.admin.systemDisabled}`}
                          onChange={(next) => setFeatureEnabled(featureId, next)}
                          label={feature.enabled ? t.admin.systemEnabled : t.admin.systemDisabled}
                        />
                        {feature.enabled && (
                          <Select
                            aria-label={`${label} ${t.admin.systemStatus}`}
                            aria-busy={systemPending === `feature:${featureId}:status`}
                            disabled={locked}
                            value={feature.status}
                            onChange={(event) => setFeatureStatus(featureId, event.target.value as ReleaseMode)}
                          >
                            {RELEASE_MODES.map((status) => (
                              <option key={status} value={status}>
                                {featureStatusLabel(status, t)}
                              </option>
                            ))}
                          </Select>
                        )}
                      </Controls>
                    </PageHead>
                    {open && (fetching ? (
                      <LoaderShell busy />
                    ) : (
                      <FeatureBody>
                        {categories.map((category) => {
                          const openable = category.placed.filter((item) => !item.required)
                          const kept = category.placed.filter((item) => item.required)
                          const keptKey = `${featureId}:${category.pageId}:kept`
                          const plainKey = `${featureId}:${category.pageId}:plain`
                          const keptOpen = openCategories.has(keptKey)
                          const plainOpen = openCategories.has(plainKey)
                          return (
                            <PageBand key={category.pageId}>
                              <PageMark>{pageLabel(category.pageId, t)}</PageMark>
                              {openable.length > 0 && (
                                <ComponentStack>
                                  {openable.map((item) => {
                                    const shown = db.system.placements[item.id].enabled
                                    const name = t.admin.placement[item.id]
                                    return (
                                      <Item key={item.id}>
                                        <ItemHead>
                                          <NameCell>
                                            <strong>{name}</strong>
                                            <MountPath pageId={item.pageId} id={item.id} />
                                          </NameCell>
                                          <Controls>
                                            {!feature.enabled ? (
                                              <Ok>{t.admin.systemDisabled}</Ok>
                                            ) : (
                                              <Switch
                                                disabled={locked}
                                                busy={systemPending === `placement:${item.id}`}
                                                busyLabel={t.common.loading}
                                                checked={shown}
                                                ariaLabel={`${name} ${shown ? t.admin.systemShown : t.admin.systemHidden}`}
                                                onChange={(next) => setPlacementEnabled(item.id as PlacementId, next)}
                                                label={shown ? t.admin.systemShown : t.admin.systemHidden}
                                              />
                                            )}
                                          </Controls>
                                        </ItemHead>
                                        <PreviewWell>
                                          <PreviewLabel>{t.admin.systemPreview}</PreviewLabel>
                                          <PlacementPreview id={item.id} />
                                        </PreviewWell>
                                      </Item>
                                    )
                                  })}
                                </ComponentStack>
                              )}
                              {kept.length > 0 && (
                                <Folder>
                                  <FolderToggle
                                    type="button"
                                    $open={keptOpen}
                                    aria-expanded={keptOpen}
                                    onClick={() => toggleSet(keptKey, setOpenCategories)}
                                  >
                                    {t.admin.systemKept}
                                    <Count>{kept.length}</Count>
                                    <Chevron aria-hidden $open={keptOpen} />
                                  </FolderToggle>
                                  {keptOpen && (
                                    <ComponentStack>
                                      {kept.map((item) => (
                                        <Item key={item.id}>
                                          <ItemHead>
                                            <NameCell>
                                              <strong>{t.admin.placement[item.id]}</strong>
                                              <MountPath pageId={item.pageId} id={item.id} />
                                            </NameCell>
                                            <Ok>{feature.enabled ? t.admin.systemKept : t.admin.systemDisabled}</Ok>
                                          </ItemHead>
                                          <PreviewWell>
                                            <PreviewLabel>{t.admin.systemPreview}</PreviewLabel>
                                            <PlacementPreview id={item.id} />
                                          </PreviewWell>
                                        </Item>
                                      ))}
                                    </ComponentStack>
                                  )}
                                </Folder>
                              )}
                              {category.quiet.length > 0 && (
                                <Folder>
                                  <FolderToggle
                                    type="button"
                                    $open={plainOpen}
                                    aria-expanded={plainOpen}
                                    onClick={() => toggleSet(plainKey, setOpenCategories)}
                                  >
                                    {t.admin.systemNonControl}
                                    <Count>{category.quiet.length}</Count>
                                    <Chevron aria-hidden $open={plainOpen} />
                                  </FolderToggle>
                                  {plainOpen && (
                                    <ComponentStack>
                                      {category.quiet.map((item) => (
                                        <Item key={item.id}>
                                          <ItemHead>
                                            <NameCell>
                                              <strong>{t.admin.plain[item.id]}</strong>
                                              <MountPath pageId={item.pageId} id={item.id} />
                                            </NameCell>
                                            <Ok>{t.admin.systemOk}</Ok>
                                          </ItemHead>
                                          <PreviewWell>
                                            <PreviewLabel>{t.admin.systemPreview}</PreviewLabel>
                                            <PlainPreview id={item.id} />
                                          </PreviewWell>
                                        </Item>
                                      ))}
                                    </ComponentStack>
                                  )}
                                </Folder>
                              )}
                            </PageBand>
                          )
                        })}
                      </FeatureBody>
                    ))}
                  </Group>
                  )}
                  </FetchHold>
                )
              })}
            </Groups>
          </Block>
        )}
      </Section>
    </Shell>
  )
}
