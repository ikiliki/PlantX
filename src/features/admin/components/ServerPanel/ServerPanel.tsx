import { type ReactNode, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { Button } from '../../../../components/Button/Button'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { FeedUpdate, FeedUpdateKind, ModerationItem, PendingUser, Plant, User } from '../../../../mock/types'
import { useStore, type LiveStatus } from '../../../../mock/store'
import { useServerSlices } from '../../../../mock/useServerSlices'
import { categoryBySpeciesId } from '../../../catalog/catalog'
import { IdentifyBadge } from '../../../greenhouse/components/IdentifyBadge/IdentifyBadge'
import { PhotoChecks } from '../../../greenhouse/components/PhotoChecks/PhotoChecks'
import { AdminDetailGrid, AdminTable } from '../AdminTable/AdminTable'
import { CatalogTree, CatalogTreeDialog } from '../CatalogTree/CatalogTree'
import {
  Backdrop,
  Close,
  Dialog,
  DialogActions,
  DialogTitle,
  DocsLink,
  Panel,
  Pill,
  PreviewCard,
  PreviewDetails,
  PreviewIdentity,
  PreviewName,
  PreviewNote,
  PreviewPhoto,
  PreviewStats,
  PreviewVerify,
  Section,
  SectionHead,
  HeadMeta,
  DemoRibbon,
  FilterBar,
  RelationLink,
  UserHover,
  StatusActions,
  StatusCard,
  StatusCopy,
  UserFilter,
  UserSelect,
} from './ServerPanel.styles'

const ACTIVITY_KINDS = [
  'scan',
  'added',
  'water',
  'photo',
  'propagate',
  'grade',
  'passport',
  'listing',
] as const satisfies readonly FeedUpdateKind[]

type ActivityTypeFilter = 'all' | FeedUpdateKind

const ACTIVITY_KIND_KEY = {
  photo: 'updatePhoto',
  water: 'updateWater',
  propagate: 'updatePropagate',
  grade: 'updateGrade',
  passport: 'updatePassport',
  listing: 'updateListing',
  scan: 'updateScan',
  added: 'updateAdded',
} as const satisfies Record<FeedUpdateKind, keyof ReturnType<typeof useI18n>['t']['feed']>

function activityKindLabel(kind: FeedUpdateKind, feed: ReturnType<typeof useI18n>['t']['feed']) {
  return feed[ACTIVITY_KIND_KEY[kind]]
}

function statusTone(status: LiveStatus): 'up' | 'down' | 'loading' {
  if (status === 'up') return 'up'
  if (status === 'down') return 'down'
  return 'loading'
}

function statusLabel(status: LiveStatus, t: ReturnType<typeof useI18n>['t']) {
  if (status === 'up') return t.admin.serverUp
  if (status === 'down') return t.admin.serverDown
  return t.admin.serverLoading
}

function UserNameLink({ user, onOpen }: { user: User; onOpen: (userId: string) => void }) {
  const { t, tr } = useI18n()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const name = tr(user.name, user.nameHe)

  return (
    <>
      <RelationLink
        type="button"
        data-user-link={user.id}
        onMouseEnter={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setPos({ top: rect.bottom + 8, left: rect.left })
        }}
        onMouseLeave={() => setPos(null)}
        onClick={(event) => {
          event.stopPropagation()
          setPos(null)
          onOpen(user.id)
        }}
      >
        {name}
      </RelationLink>
      {pos &&
        createPortal(
          <UserHover data-user-card style={{ top: pos.top, left: pos.left }}>
            <Avatar name={user.name} color={user.avatarColor} size={40} />
            <div>
              <strong>{name}</strong>
              <span>
                {user.email ?? '—'} · {t.roles[user.role]}
              </span>
            </div>
          </UserHover>,
          document.body,
        )}
    </>
  )
}

function avatarTone(seed: string) {
  const palette = ['#1FA85A', '#5D7C4E', '#C4A35A', '#3C6B8F', '#B4553D']
  let hash = 0
  for (const ch of seed) hash = (hash + ch.charCodeAt(0) * 17) % palette.length
  return palette[hash] ?? palette[0]
}

function PreviewShell({
  titleId,
  title,
  onClose,
  children,
  actions,
}: {
  titleId: string
  title: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        {children}
        {actions && <DialogActions>{actions}</DialogActions>}
      </Dialog>
    </Backdrop>
  )
}

function PendingPreview({
  row,
  busy,
  onClose,
  onActivate,
  onReject,
}: {
  row: PendingUser
  busy: boolean
  onClose: () => void
  onActivate: () => void
  onReject: () => void
}) {
  const { t } = useI18n()
  return (
    <PreviewShell
      titleId="server-pending-preview"
      title={t.admin.previewMember}
      onClose={onClose}
      actions={
        <>
          <Button size="sm" variant="ghost" disabled={busy} onClick={onReject}>
            {t.admin.reject}
          </Button>
          <Button size="sm" variant="growth" disabled={busy} onClick={onActivate}>
            {t.admin.activate}
          </Button>
        </>
      }
    >
      <PreviewCard>
        <PreviewIdentity>
          <Avatar name={row.name} color={avatarTone(row.email)} size={64} />
          <PreviewName>
            <strong>{row.name}</strong>
            <span>
              {row.email} · {t.roles.grower}
            </span>
          </PreviewName>
        </PreviewIdentity>
        {row.note && <PreviewNote>{row.note}</PreviewNote>}
        <PreviewStats>
          <div>
            <dt>{t.seller.rating}</dt>
            <dd>★ 0</dd>
          </div>
          <div>
            <dt>{t.seller.orders}</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>{t.admin.accountStatus}</dt>
            <dd>{t.admin.statusPending}</dd>
          </div>
        </PreviewStats>
      </PreviewCard>
    </PreviewShell>
  )
}

function UserPreview({
  row,
  plantCount,
  busy,
  onClose,
  onDisable,
  onEnable,
}: {
  row: User
  plantCount: number
  busy: boolean
  onClose: () => void
  onDisable: () => void
  onEnable: () => void
}) {
  const { t, tr, locale } = useI18n()
  const disabled = (row.accountStatus ?? 'active') === 'disabled'
  const specialties = (locale === 'he' ? row.specialtiesHe : row.specialties).join(', ') || '—'

  return (
    <PreviewShell
      titleId="server-user-preview"
      title={t.admin.previewUser}
      onClose={onClose}
      actions={
        row.role === 'admin' ? (
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
        ) : disabled ? (
          <>
            <Button size="sm" variant="ghost" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button size="sm" variant="growth" disabled={busy} onClick={onEnable}>
              {t.admin.enable}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button size="sm" variant="danger" disabled={busy} onClick={onDisable}>
              {t.admin.disable}
            </Button>
          </>
        )
      }
    >
      <PreviewCard>
        <PreviewIdentity>
          <Avatar name={row.name} color={row.avatarColor} size={64} />
          <PreviewName>
            <strong>{tr(row.name, row.nameHe)}</strong>
            <span>
              {row.email ?? '—'} · {t.roles[row.role]}
            </span>
          </PreviewName>
        </PreviewIdentity>
        <PreviewNote>{tr(row.bio, row.bioHe)}</PreviewNote>
        <PreviewStats>
          <div>
            <dt>{t.seller.rating}</dt>
            <dd>★ {row.rating}</dd>
          </div>
          <div>
            <dt>{t.seller.orders}</dt>
            <dd>{row.completedOrders}</dd>
          </div>
          <div>
            <dt>{t.admin.accountStatus}</dt>
            <dd>{disabled ? t.admin.statusDisabled : t.admin.statusActive}</dd>
          </div>
        </PreviewStats>
      </PreviewCard>
      <PreviewDetails>
        <AdminDetailGrid
          items={[
            { label: t.admin.serverColId, value: row.id },
            {
              label: t.admin.serverColRegion,
              value: locale === 'he' ? row.regionHe : row.region,
            },
            {
              label: t.seller.verification,
              value: `${Math.round(row.verificationRate * 100)}%`,
            },
            { label: t.seller.cancellations, value: row.cancellations },
            { label: t.seller.specialties, value: specialties },
            { label: t.admin.serverColPlants, value: plantCount },
          ]}
        />
      </PreviewDetails>
    </PreviewShell>
  )
}

function PlantPreview({
  row,
  ownerLabel,
  activityCount,
  onClose,
}: {
  row: Plant
  ownerLabel: string
  activityCount: number
  onClose: () => void
}) {
  const { t, tr } = useI18n()
  const photo = row.photos[0]

  return (
    <PreviewShell
      titleId="server-plant-preview"
      title={t.admin.previewPlant}
      onClose={onClose}
      actions={
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t.common.cancel}
        </Button>
      }
    >
      <PreviewCard>
        <PreviewIdentity>
          <PreviewPhoto>{photo ? <PlantImage src={photo} alt="" /> : null}</PreviewPhoto>
          <PreviewName>
            <strong>{tr(row.title, row.titleHe)}</strong>
            <span>
              {row.code} · {row.status}
            </span>
          </PreviewName>
        </PreviewIdentity>
        {(row.description || row.descriptionHe) && (
          <PreviewNote>{tr(row.description ?? '', row.descriptionHe ?? '')}</PreviewNote>
        )}
        <PreviewStats>
          <div>
            <dt>{t.admin.serverColQuality}</dt>
            <dd>{row.quality}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColSize}</dt>
            <dd>{row.sizeBand ?? row.sizeGrade}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColQty}</dt>
            <dd>{row.quantity}</dd>
          </div>
        </PreviewStats>
      </PreviewCard>
      <PreviewDetails>
        <AdminDetailGrid
          items={[
            { label: t.admin.serverColId, value: row.id },
            { label: t.admin.serverColSpecies, value: row.speciesId },
            {
              label: t.admin.serverColVariety,
              value: tr(row.variety ?? '—', row.varietyHe ?? '—'),
            },
            { label: t.admin.serverColStage, value: row.stage ?? '—' },
            { label: t.admin.serverColOwner, value: ownerLabel },
            { label: t.admin.serverColPhotos, value: row.photos.length },
            { label: t.admin.serverColActivities, value: activityCount },
            {
              label: t.admin.serverColVerified,
              value: row.verifiedAt ? row.verifiedAt.slice(0, 10) : t.admin.serverNotVerified,
            },
            {
              label: t.admin.serverColZone,
              value: tr(row.locationZone, row.locationZoneHe),
            },
          ]}
        />
      </PreviewDetails>
    </PreviewShell>
  )
}

/** `added` shows every photo with its sticker; a linked `scan` shows the photo it checked. */
function ActivityVerification({ row, plant }: { row: FeedUpdate; plant?: Plant }) {
  const { t } = useI18n()
  if (!plant || (row.kind !== 'added' && row.kind !== 'scan')) return null
  const checks = plant.identification?.photos ?? []
  const photos = plant.photos.filter(Boolean)
  const scanned = row.kind === 'scan' ? checks.find((check) => check.requestId === row.identifyRequestId) : undefined
  if (row.kind === 'scan' && !scanned) return null
  return (
    <PreviewVerify aria-label={t.admin.previewVerification}>
      <h3>{t.admin.previewVerification}</h3>
      <IdentifyBadge identification={plant.identification} />
      <PhotoChecks
        photos={scanned ? [photos[scanned.position] ?? ''] : photos}
        checks={scanned ? [{ ...scanned, position: 0 }] : checks}
      />
    </PreviewVerify>
  )
}

function ActivityPreview({
  row,
  plant,
  userLabel,
  userEmail,
  plantLabel,
  plantCode,
  plantOwner,
  plantStatus,
  onClose,
}: {
  row: FeedUpdate
  plant?: Plant
  userLabel: string
  userEmail: string
  plantLabel: string
  plantCode: string
  plantOwner: string
  plantStatus: string
  onClose: () => void
}) {
  const { t, tr } = useI18n()

  return (
    <PreviewShell
      titleId="server-activity-preview"
      title={t.admin.previewActivity}
      onClose={onClose}
      actions={
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t.common.cancel}
        </Button>
      }
    >
      <PreviewCard>
        <PreviewIdentity>
          <Avatar name={userLabel} color={avatarTone(row.userId)} size={64} />
          <PreviewName>
            <strong>{activityKindLabel(row.kind, t.feed)}</strong>
            <span>
              {userLabel} · {row.createdAt.slice(0, 16).replace('T', ' ')}
            </span>
          </PreviewName>
        </PreviewIdentity>
        <PreviewNote>{tr(row.body, row.bodyHe)}</PreviewNote>
        <PreviewStats>
          <div>
            <dt>{t.admin.serverColKind}</dt>
            <dd>{activityKindLabel(row.kind, t.feed)}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColPlant}</dt>
            <dd>{row.plantId ?? '—'}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColWhen}</dt>
            <dd>{row.createdAt.slice(0, 10)}</dd>
          </div>
        </PreviewStats>
        <ActivityVerification row={row} plant={plant} />
      </PreviewCard>
      <PreviewDetails>
        <AdminDetailGrid
          items={[
            { label: t.admin.serverColId, value: row.id },
            { label: t.admin.serverColUser, value: userLabel },
            { label: t.admin.serverColEmail, value: userEmail },
            { label: t.admin.serverColPlant, value: plantLabel },
            { label: t.admin.serverColCode, value: plantCode },
            { label: t.admin.serverColOwner, value: plantOwner },
            { label: t.admin.serverColStatus, value: plantStatus },
            ...(row.identifyRequestId ? [{ label: t.admin.serverColRequest, value: row.identifyRequestId }] : []),
            {
              label: t.admin.serverColWhen,
              value: row.createdAt.replace('T', ' ').slice(0, 19),
            },
          ]}
        />
      </PreviewDetails>
    </PreviewShell>
  )
}

function ReportPreview({
  row,
  onClose,
  onResolve,
  onDismiss,
}: {
  row: ModerationItem
  onClose: () => void
  onResolve: () => void
  onDismiss: () => void
}) {
  const { t, tr } = useI18n()
  const open = row.status === 'open'

  return (
    <PreviewShell
      titleId="server-report-preview"
      title={t.admin.previewReport}
      onClose={onClose}
      actions={
        open ? (
          <>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              {t.admin.dismiss}
            </Button>
            <Button size="sm" variant="growth" onClick={onResolve}>
              {t.admin.resolve}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
        )
      }
    >
      <PreviewCard>
        <PreviewIdentity>
          <Avatar name={row.type} color={avatarTone(row.id)} size={64} />
          <PreviewName>
            <strong>{tr(row.title, row.titleHe)}</strong>
            <span>
              {row.type} · {row.createdAt}
            </span>
          </PreviewName>
        </PreviewIdentity>
        <PreviewNote>{tr(row.details, row.detailsHe)}</PreviewNote>
        <PreviewStats>
          <div>
            <dt>{t.admin.serverColStatus}</dt>
            <dd>{row.status}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColId}</dt>
            <dd>{row.id}</dd>
          </div>
          <div>
            <dt>{t.admin.serverColTarget}</dt>
            <dd>{row.targetId}</dd>
          </div>
        </PreviewStats>
      </PreviewCard>
      <PreviewDetails>
        <AdminDetailGrid
          items={[
            { label: t.admin.serverColKind, value: row.type },
            { label: t.admin.serverColTarget, value: row.targetId },
            { label: t.admin.serverColWhen, value: row.createdAt },
            {
              label: t.admin.viewListing,
              value:
                row.type === 'stolen_photo' ? (
                  <Link to="/market">{t.admin.viewListing}</Link>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </PreviewDetails>
    </PreviewShell>
  )
}

export function ServerPanel() {
  const {
    db,
    fullDb,
    liveStatus,
    liveWritable,
    plantxEnv,
    plantxEnvLabel,
    retryLive,
    disableUser,
    enableUser,
    approvePendingUser,
    rejectPendingUser,
    liveMeta,
    resolveModeration,
  } = useStore()
  const { t, tr, locale, formatMoney } = useI18n()

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedPending, setSelectedPending] = useState<string[]>([])
  const [selectedPlants, setSelectedPlants] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [selectedTx, setSelectedTx] = useState<string[]>([])
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [expandedPlants, setExpandedPlants] = useState<string[]>([])
  const [expandedActivities, setExpandedActivities] = useState<string[]>([])
  const [expandedUsers, setExpandedUsers] = useState<string[]>([])
  const [pendingPreviewId, setPendingPreviewId] = useState<string | null>(null)
  const [userPreviewId, setUserPreviewId] = useState<string | null>(null)
  const [plantPreviewId, setPlantPreviewId] = useState<string | null>(null)
  const [activityPreviewId, setActivityPreviewId] = useState<string | null>(null)
  const [reportPreviewId, setReportPreviewId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ users: true })
  const [categoryPopupId, setCategoryPopupId] = useState<string | null>(null)
  const [activityKind, setActivityKind] = useState<ActivityTypeFilter>('all')
  const [activityUserId, setActivityUserId] = useState('all')

  const loadingSlices = useServerSlices([
    ...(openSections.users ? (['users'] as const) : []),
    ...(openSections.plants || openSections.activities ? (['plants'] as const) : []),
    ...(openSections.activities ? (['updates'] as const) : []),
    ...(openSections.catalog ? (['catalog'] as const) : []),
    ...(openSections.pending ? (['pending'] as const) : []),
    ...(openSections.transactions ? (['transactions'] as const) : []),
  ])

  const toggleSection = (id: string) => {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }))
  }

  const users = db.users.filter((user) => user.role !== 'guest')
  const plants = db.plants
  const activities = useMemo(
    () => (fullDb.updates ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [fullDb.updates],
  )
  const activityUsers = useMemo(() => {
    const ids = [...new Set(activities.map((row) => row.userId))]
    return ids
      .map((id) => {
        const user = db.users.find((item) => item.id === id)
        return { id, label: user ? tr(user.name, user.nameHe) : id }
      })
      .sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [activities, db.users, locale, tr])
  const shownActivities = activities.filter(
    (row) =>
      (activityKind === 'all' || row.kind === activityKind) &&
      (activityUserId === 'all' || row.userId === activityUserId),
  )
  const reports = db.moderation.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const pending = db.pendingUsers
    .filter((row) => row.status === 'pending')
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const transactions = db.pendingTransactions
    .filter((row) => row.status === 'pending')
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const categories = db.catalog.categories
  const subcategories = db.catalog.subcategories
  const properties = db.catalog.properties
  const fromServer = liveWritable

  const pendingPreview = pending.find((row) => row.id === pendingPreviewId) ?? null
  const userPreview = users.find((row) => row.id === userPreviewId) ?? null
  const plantPreview = plants.find((row) => row.id === plantPreviewId) ?? null
  const activityPreview = activities.find((row) => row.id === activityPreviewId) ?? null
  const reportPreview = reports.find((row) => row.id === reportPreviewId) ?? null

  const userName = (userId: string) => {
    const user = db.users.find((item) => item.id === userId)
    return user ? tr(user.name, user.nameHe) : userId
  }

  const openSection = (id: string) => {
    setOpenSections((current) => ({ ...current, [id]: true }))
  }

  const goToUser = (userId: string) => {
    if (!db.users.some((user) => user.id === userId)) return
    openSection('users')
    window.setTimeout(() => {
      document
        .querySelector(`#server-users [data-row-id="${CSS.escape(userId)}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    }, 0)
  }

  const focusPlant = (plantId: string) => {
    if (!plants.some((plant) => plant.id === plantId)) return
    openSection('plants')
    setPlantPreviewId(plantId)
    setExpandedPlants((ids) => (ids.includes(plantId) ? ids : [...ids, plantId]))
  }

  const userLink = (userId: string) => {
    const user = db.users.find((item) => item.id === userId)
    if (!user) return userName(userId)
    return <UserNameLink user={user} onOpen={goToUser} />
  }

  const plantLink = (plantId?: string) => {
    if (!plantId) return '—'
    const plant = plants.find((item) => item.id === plantId)
    if (!plant) return plantId
    return (
      <RelationLink type="button" onClick={() => focusPlant(plant.id)}>
        {tr(plant.title, plant.titleHe)}
      </RelationLink>
    )
  }

  const run = async (id: string, action: () => Promise<boolean>) => {
    setBusyId(id)
    try {
      await action()
    } finally {
      setBusyId(null)
    }
  }

  const bulkUsers = async (ids: string[], mode: 'disable' | 'enable') => {
    for (const id of ids) {
      const user = users.find((item) => item.id === id)
      if (!user || user.role === 'admin') continue
      if (mode === 'disable') await disableUser(id)
      else await enableUser(id)
    }
    setSelectedUsers([])
  }

  const bulkRejectPending = async (ids: string[]) => {
    for (const id of ids) await rejectPendingUser(id)
    setSelectedPending([])
    if (pendingPreviewId && ids.includes(pendingPreviewId)) setPendingPreviewId(null)
  }

  const bulkResolveReports = (ids: string[], status: 'resolved' | 'dismissed') => {
    for (const id of ids) {
      const row = reports.find((item) => item.id === id)
      if (row?.status === 'open') resolveModeration(id, status)
    }
    setSelectedReports([])
    if (reportPreviewId && ids.includes(reportPreviewId)) setReportPreviewId(null)
  }

  return (
    <Panel>
      <StatusCard>
        <StatusCopy>
          <Pill $tone={statusTone(liveStatus)}>{statusLabel(liveStatus, t)}</Pill>
          <p>
            <strong>{plantxEnvLabel}</strong>
            {plantxEnv === 'mock'
              ? ` · ${t.admin.serverLocalBody}`
              : liveWritable
                ? ` · ${t.admin.serverUpBody}`
                : liveStatus === 'down'
                  ? ` · ${t.admin.serverDownBody}`
                  : ` · ${t.admin.serverLoadingBody}`}
          </p>
        </StatusCopy>
        <StatusActions>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void retryLive()}
            disabled={plantxEnv === 'mock' || liveStatus === 'loading'}
          >
            {t.common.retry}
          </Button>
          {plantxEnv !== 'mock' && (
            <DocsLink href="/api/docs" target="_blank" rel="noreferrer">
              {t.admin.serverDocs}
            </DocsLink>
          )}
        </StatusActions>
      </StatusCard>

      {reports.length > 0 && (
      <Section $demo>
        <SectionHead type="button" $open={Boolean(openSections.reports)} onClick={() => toggleSection('reports')}>
          <h2>{t.admin.reports}</h2>
          <HeadMeta>
            <span>
              {t.admin.reportsOpenCount.replace(
                '{count}',
                String(reports.filter((row) => row.status === 'open').length),
              )}
            </span>
            <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>
          </HeadMeta>
        </SectionHead>
        {openSections.reports && (
        <AdminTable
          rows={reports}
          rowId={(row) => row.id}
          empty={t.admin.reportsEmpty}
          onRowClick={(row) => setReportPreviewId(row.id)}
          selectable
          selected={selectedReports}
          onSelectedChange={setSelectedReports}
          columns={[
            {
              id: 'title',
              header: t.admin.serverColTitle,
              cell: (row) => tr(row.title, row.titleHe),
            },
            { id: 'type', header: t.admin.serverColKind, cell: (row) => row.type, muted: true },
            {
              id: 'status',
              header: t.admin.serverColStatus,
              cell: (row) => (
                <Badge $tone={row.status === 'open' ? 'warn' : 'muted'}>{row.status}</Badge>
              ),
            },
            {
              id: 'when',
              header: t.admin.serverColWhen,
              cell: (row) => row.createdAt,
              muted: true,
            },
          ]}
          bulkActions={[
            {
              id: 'resolve',
              label: t.admin.bulkResolve,
              variant: 'growth',
              onClick: (ids) => bulkResolveReports(ids, 'resolved'),
            },
            {
              id: 'dismiss',
              label: t.admin.bulkDismiss,
              variant: 'ghost',
              onClick: (ids) => bulkResolveReports(ids, 'dismissed'),
            },
          ]}
        />
        )}
      </Section>
      )}

      <Section $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.pending)} onClick={() => toggleSection('pending')}>
          <h2>{t.admin.pendingMembers}</h2>
          <HeadMeta>
            <span>{openSections.pending || liveMeta == null ? pending.length : liveMeta.pending}</span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.pending &&
          (loadingSlices.has('pending') ? (
            <LoaderShell />
          ) : (
        <AdminTable
          rows={pending}
          rowId={(row) => row.id}
          empty={t.admin.pendingEmpty}
          onRowClick={(row) => setPendingPreviewId(row.id)}
          selectable
          selected={selectedPending}
          onSelectedChange={setSelectedPending}
          columns={[
            { id: 'name', header: t.admin.serverColName, cell: (row) => row.name },
            { id: 'email', header: t.admin.serverColEmail, cell: (row) => row.email, muted: true },
            {
              id: 'note',
              header: t.landing.registerNote,
              cell: (row) => row.note ?? '—',
              muted: true,
            },
            {
              id: 'when',
              header: t.admin.serverColWhen,
              cell: (row) => row.createdAt.slice(0, 10),
              muted: true,
            },
          ]}
          actions={(row) => [
            {
              id: 'reject',
              label: t.admin.reject,
              variant: 'ghost',
              disabled: busyId === row.id,
              onClick: () => void run(row.id, () => rejectPendingUser(row.id)),
            },
          ]}
          bulkActions={[
            {
              id: 'reject',
              label: t.admin.bulkReject,
              variant: 'danger',
              onClick: (ids) => void bulkRejectPending(ids),
            },
          ]}
        />
          ))}
      </Section>

      <Section id="server-users" $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.users)} onClick={() => toggleSection('users')}>
          <h2>{t.admin.serverUsers}</h2>
          <HeadMeta>
            <span>{openSections.users || liveMeta == null ? users.length : liveMeta.users}</span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.users &&
          (loadingSlices.has('users') ? (
            <LoaderShell />
          ) : (
        <AdminTable
          rows={users}
          rowId={(row) => row.id}
          empty={t.admin.serverEmpty}
          onRowClick={(row) => setUserPreviewId(row.id)}
          selectable
          selected={selectedUsers}
          onSelectedChange={setSelectedUsers}
          expandable
          expandedIds={expandedUsers}
          onExpandedChange={setExpandedUsers}
          columns={[
            { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
            {
              id: 'name',
              header: t.admin.serverColName,
              cell: (row) => (locale === 'he' ? row.nameHe : row.name),
            },
            {
              id: 'email',
              header: t.admin.serverColEmail,
              cell: (row) => row.email ?? '—',
              muted: true,
            },
            { id: 'role', header: t.admin.serverColRole, cell: (row) => row.role },
            {
              id: 'status',
              header: t.admin.serverColStatus,
              cell: (row) => {
                const disabled = (row.accountStatus ?? 'active') === 'disabled'
                return (
                  <Badge $tone={disabled ? 'muted' : 'forest'}>
                    {disabled ? t.admin.statusDisabled : t.admin.statusActive}
                  </Badge>
                )
              },
            },
          ]}
          renderExpand={(row: User) => (
            <AdminDetailGrid
              items={[
                {
                  label: t.admin.serverColRegion,
                  value: locale === 'he' ? row.regionHe : row.region,
                },
                { label: t.seller.rating, value: `★ ${row.rating}` },
                { label: t.seller.orders, value: row.completedOrders },
                {
                  label: t.seller.verification,
                  value: `${Math.round(row.verificationRate * 100)}%`,
                },
                { label: t.admin.serverColPlants, value: plants.filter((p) => p.ownerId === row.id).length },
              ]}
            />
          )}
          bulkActions={[
            {
              id: 'disable',
              label: t.admin.bulkDisable,
              variant: 'danger',
              onClick: (ids) => void bulkUsers(ids, 'disable'),
            },
            {
              id: 'enable',
              label: t.admin.bulkEnable,
              variant: 'growth',
              onClick: (ids) => void bulkUsers(ids, 'enable'),
            },
          ]}
        />
          ))}
      </Section>

      <Section $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.plants)} onClick={() => toggleSection('plants')}>
          <h2>{t.admin.serverPlants}</h2>
          <HeadMeta>
            <span>{openSections.plants || liveMeta == null ? plants.length : liveMeta.plants}</span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.plants &&
          (loadingSlices.has('plants') ? (
            <LoaderShell />
          ) : (
        <AdminTable
          rows={plants}
          rowId={(row) => row.id}
          empty={t.admin.serverEmpty}
          onRowClick={(row) => setPlantPreviewId(row.id)}
          selectable
          selected={selectedPlants}
          onSelectedChange={setSelectedPlants}
          expandable
          expandedIds={expandedPlants}
          onExpandedChange={setExpandedPlants}
          columns={[
            { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
            { id: 'code', header: t.admin.serverColCode, cell: (row) => row.code },
            {
              id: 'title',
              header: t.admin.serverColTitle,
              cell: (row) => tr(row.title, row.titleHe),
            },
            {
              id: 'category',
              header: t.admin.category,
              cell: (row) => {
                const category = categoryBySpeciesId(db.catalog, row.speciesId)
                if (!category) return '—'
                return (
                  <RelationLink
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setCategoryPopupId(category.id)
                    }}
                  >
                    {tr(category.name, category.nameHe)}
                  </RelationLink>
                )
              },
            },
            {
              id: 'owner',
              header: t.admin.serverColOwner,
              cell: (row) => userLink(row.ownerId),
              muted: true,
            },
            { id: 'status', header: t.admin.serverColStatus, cell: (row) => row.status },
          ]}
          renderExpand={(row: Plant) => (
            <AdminDetailGrid
              items={[
                { label: t.admin.serverColSpecies, value: row.speciesId },
                {
                  label: t.admin.serverColVariety,
                  value: tr(row.variety ?? '—', row.varietyHe ?? '—'),
                },
                { label: t.admin.serverColQuality, value: row.quality },
                { label: t.admin.serverColStage, value: row.stage ?? '—' },
                {
                  label: t.admin.serverColActivities,
                  value: activities.filter((item) => item.plantId === row.id).length,
                },
              ]}
            />
          )}
          bulkActions={[]}
        />
          ))}
      </Section>

      <Section $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.activities)} onClick={() => toggleSection('activities')}>
          <h2>{t.admin.serverActivities}</h2>
          <HeadMeta>
            <span>
              {openSections.activities || liveMeta == null ? shownActivities.length : liveMeta.updates}
            </span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.activities &&
          (loadingSlices.has('updates') ? (
            <LoaderShell />
          ) : (
        <>
        <FilterBar>
          <Segmented
            ariaLabel={t.admin.serverActivityTypes}
            value={activityKind}
            onChange={setActivityKind}
            options={[
              { id: 'all', label: t.admin.serverActivityAll },
              ...ACTIVITY_KINDS.map((kind) => ({ id: kind, label: activityKindLabel(kind, t.feed) })),
            ]}
          />
          <UserFilter>
            {t.admin.serverActivityUsers}
            <UserSelect
              aria-label={t.admin.serverActivityUsers}
              value={activityUsers.some((user) => user.id === activityUserId) ? activityUserId : 'all'}
              onChange={(event) => setActivityUserId(event.target.value)}
            >
              <option value="all">{t.admin.serverActivityAllUsers}</option>
              {activityUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.label}
                </option>
              ))}
            </UserSelect>
          </UserFilter>
        </FilterBar>
        <AdminTable
          rows={shownActivities}
          rowId={(row) => row.id}
          empty={
            activityKind === 'all' && activityUserId === 'all' ? t.admin.serverEmpty : t.admin.serverActivityEmpty
          }
          onRowClick={(row) => setActivityPreviewId(row.id)}
          selectable
          selected={selectedActivities}
          onSelectedChange={setSelectedActivities}
          expandable
          expandedIds={expandedActivities}
          onExpandedChange={setExpandedActivities}
          columns={[
            { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
            {
              id: 'kind',
              header: t.admin.serverColKind,
              cell: (row) => activityKindLabel(row.kind, t.feed),
            },
            {
              id: 'user',
              header: t.admin.serverColUser,
              cell: (row) => userLink(row.userId),
            },
            {
              id: 'body',
              header: t.admin.serverColBody,
              cell: (row) => tr(row.body, row.bodyHe),
            },
            {
              id: 'plant',
              header: t.admin.serverColPlant,
              cell: (row) => plantLink(row.plantId),
              muted: true,
            },
            {
              id: 'when',
              header: t.admin.serverColWhen,
              cell: (row) => row.createdAt.slice(0, 16).replace('T', ' '),
              muted: true,
            },
          ]}
          renderExpand={(row: FeedUpdate) => {
            const plant = row.plantId ? plants.find((item) => item.id === row.plantId) : undefined
            return (
              <>
                <AdminDetailGrid
                  items={[
                    { label: t.admin.serverColUser, value: userLink(row.userId) },
                    { label: t.admin.serverColPlant, value: plantLink(row.plantId) },
                    { label: t.admin.serverColKind, value: activityKindLabel(row.kind, t.feed) },
                    { label: t.admin.serverColId, value: row.identifyRequestId ?? '—' },
                  ]}
                />
                <ActivityVerification row={row} plant={plant} />
              </>
            )
          }}
          bulkActions={[]}
        />
        </>
          ))}
      </Section>

      <Section $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.transactions)} onClick={() => toggleSection('transactions')}>
          <h2>{t.admin.transactions}</h2>
          <HeadMeta>
            <span>{openSections.transactions || liveMeta == null ? transactions.length : liveMeta.transactions}</span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.transactions &&
          (loadingSlices.has('transactions') ? (
            <LoaderShell />
          ) : (
        <AdminTable
          rows={transactions}
          rowId={(row) => row.id}
          empty={t.admin.transactionsEmpty}
          selectable
          selected={selectedTx}
          onSelectedChange={setSelectedTx}
          columns={[
            { id: 'id', header: t.admin.serverColId, cell: (row) => row.id, muted: true },
            {
              id: 'kind',
              header: t.admin.serverColKind,
              cell: (row) => t.admin.txKind[row.kind],
            },
            {
              id: 'label',
              header: t.admin.serverColTitle,
              cell: (row) => tr(row.label, row.labelHe),
            },
            {
              id: 'user',
              header: t.admin.serverColUser,
              cell: (row) => userLink(row.userId),
              muted: true,
            },
            {
              id: 'amount',
              header: t.admin.serverColAmount,
              cell: (row) => (row.amount != null ? formatMoney(row.amount) : '—'),
            },
            {
              id: 'when',
              header: t.admin.serverColWhen,
              cell: (row) => row.createdAt.slice(0, 10),
              muted: true,
            },
          ]}
        />
          ))}
      </Section>

      <Section $demo={!fromServer}>
        <SectionHead type="button" $open={Boolean(openSections.catalog)} onClick={() => toggleSection('catalog')}>
          <h2>{t.admin.serverCatalog}</h2>
          <HeadMeta>
            <span>
              {openSections.catalog || liveMeta == null
                ? categories.length + subcategories.length + properties.length
                : liveMeta.catalog.categories + liveMeta.catalog.subcategories + liveMeta.catalog.properties}
            </span>
            {!fromServer && <DemoRibbon>{t.admin.serverDemoMark}</DemoRibbon>}
          </HeadMeta>
        </SectionHead>
        {openSections.catalog &&
          (loadingSlices.has('catalog') ? <LoaderShell /> : <CatalogTree />)}
      </Section>

      {categoryPopupId && (
        <CatalogTreeDialog categoryId={categoryPopupId} onClose={() => setCategoryPopupId(null)} />
      )}

      {pendingPreview && (
        <PendingPreview
          row={pendingPreview}
          busy={busyId === pendingPreview.id}
          onClose={() => setPendingPreviewId(null)}
          onActivate={() =>
            void run(pendingPreview.id, async () => {
              const ok = await approvePendingUser(pendingPreview.id)
              if (ok) {
                setPendingPreviewId(null)
                setSelectedPending((ids) => ids.filter((id) => id !== pendingPreview.id))
              }
              return ok
            })
          }
          onReject={() =>
            void run(pendingPreview.id, async () => {
              const ok = await rejectPendingUser(pendingPreview.id)
              if (ok) {
                setPendingPreviewId(null)
                setSelectedPending((ids) => ids.filter((id) => id !== pendingPreview.id))
              }
              return ok
            })
          }
        />
      )}

      {userPreview && (
        <UserPreview
          row={userPreview}
          plantCount={plants.filter((plant) => plant.ownerId === userPreview.id).length}
          busy={busyId === userPreview.id}
          onClose={() => setUserPreviewId(null)}
          onDisable={() =>
            void run(userPreview.id, async () => {
              const ok = await disableUser(userPreview.id)
              if (ok) setUserPreviewId(null)
              return ok
            })
          }
          onEnable={() =>
            void run(userPreview.id, async () => {
              const ok = await enableUser(userPreview.id)
              if (ok) setUserPreviewId(null)
              return ok
            })
          }
        />
      )}

      {plantPreview && (
        <PlantPreview
          row={plantPreview}
          ownerLabel={`${userName(plantPreview.ownerId)} (${plantPreview.ownerId})`}
          activityCount={activities.filter((item) => item.plantId === plantPreview.id).length}
          onClose={() => setPlantPreviewId(null)}
        />
      )}

      {activityPreview && (() => {
        const user = db.users.find((item) => item.id === activityPreview.userId)
        const plant = activityPreview.plantId
          ? plants.find((item) => item.id === activityPreview.plantId)
          : undefined
        return (
          <ActivityPreview
            row={activityPreview}
            plant={plant}
            userLabel={user ? tr(user.name, user.nameHe) : activityPreview.userId}
            userEmail={user?.email ?? '—'}
            plantLabel={
              plant
                ? `${tr(plant.title, plant.titleHe)} (${plant.id})`
                : (activityPreview.plantId ?? '—')
            }
            plantCode={plant?.code ?? '—'}
            plantOwner={plant ? userName(plant.ownerId) : '—'}
            plantStatus={plant?.status ?? '—'}
            onClose={() => setActivityPreviewId(null)}
          />
        )
      })()}

      {reportPreview && (
        <ReportPreview
          row={reportPreview}
          onClose={() => setReportPreviewId(null)}
          onResolve={() => {
            resolveModeration(reportPreview.id, 'resolved')
            setReportPreviewId(null)
          }}
          onDismiss={() => {
            resolveModeration(reportPreview.id, 'dismissed')
            setReportPreviewId(null)
          }}
        />
      )}
    </Panel>
  )
}
