import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createSeed } from './seed'
import type {
  CommitmentStatus,
  EventPhase,
  Locale,
  MockDb,
  ModerationStatus,
  QualityGrade,
  User,
} from './types'
import { defaultPlantPhoto } from './images'

const STORAGE_KEY = 'plantx-mock-db-v3'

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as MockDb
  } catch {
    /* ignore */
  }
  return createSeed()
}

function saveDb(db: MockDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

interface StoreApi {
  db: MockDb
  currentUser: User | null
  setLocale: (locale: Locale) => void
  loginAs: (userId: string | null) => void
  resetDemo: () => void
  createListing: (input: {
    plantId: string
    price: number
    quantity: number
    unit: 'plant' | 'cutting' | 'bundle'
    allowOffers: boolean
  }) => string
  createPlantBatch: (input: {
    speciesId: string
    title: string
    titleHe: string
    quantity: number
    quality: QualityGrade
    rooting: 'rooted' | 'unrooted' | 'established'
    parentId?: string
    photo?: string
  }) => string
  commitToDemand: (input: {
    demandId: string
    quantity: number
    offeredPrice: number
    quality: QualityGrade
    availableDate: string
    plantId?: string
  }) => string
  setCommitmentStatus: (id: string, status: CommitmentStatus) => void
  makeOffer: (input: {
    listingId: string
    amount: number
    message: string
    messageHe: string
  }) => void
  setOfferStatus: (id: string, status: 'accepted' | 'declined' | 'withdrawn') => void
  completeHandoff: (orderId: string) => void
  createDemand: (input: {
    title: string
    titleHe: string
    speciesId: string
    targetQty: number
    minSupplierQty: number
    priceMin: number
    priceMax: number
    quality: QualityGrade[]
    region: string
    regionHe: string
    dueDate: string
    notes: string
    notesHe: string
  }) => string
  aggregateAndConfirm: (demandId: string) => string
  setEventPhase: (eventId: string, phase: EventPhase) => void
  gradeRecovery: (
    eventId: string,
    items: { plantId: string; grade: QualityGrade | 'lost' | 'damaged'; notes: string; notesHe: string }[],
  ) => void
  redistributeEvent: (eventId: string, destination: string) => void
  resolveModeration: (id: string, status: ModerationStatus) => void
  claimDraft: (draftId: string) => void
  reserveListing: (listingId: string) => string
  sendMessage: (threadId: string, body: string, bodyHe: string) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<MockDb>(() => loadDb())

  useEffect(() => {
    saveDb(db)
  }, [db])

  const update = useCallback((fn: (prev: MockDb) => MockDb) => {
    setDb((prev) => fn(structuredClone(prev)))
  }, [])

  const currentUser = useMemo(
    () => db.users.find((u) => u.id === db.currentUserId) ?? null,
    [db],
  )

  const api: StoreApi = {
    db,
    currentUser,
    setLocale: (locale) => update((d) => ({ ...d, locale })),
    loginAs: (userId) => update((d) => ({ ...d, currentUserId: userId })),
    resetDemo: () => setDb(createSeed()),
    createListing: (input) => {
      const id = `ls-${Date.now()}`
      update((d) => {
        const plant = d.plants.find((p) => p.id === input.plantId)
        if (!plant || !d.currentUserId) return d
        plant.status = 'listed'
        d.listings.unshift({
          id,
          plantId: input.plantId,
          sellerId: d.currentUserId,
          price: input.price,
          quantity: input.quantity,
          unit: input.unit,
          pickupOnly: true,
          allowOffers: input.allowOffers,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          region: d.users.find((u) => u.id === d.currentUserId)?.region ?? '',
          regionHe: d.users.find((u) => u.id === d.currentUserId)?.regionHe ?? '',
        })
        return d
      })
      return id
    },
    createPlantBatch: (input) => {
      const id = `pl-${Date.now()}`
      update((d) => {
        if (!d.currentUserId) return d
        d.plants.unshift({
          id,
          code: `BT-${Math.floor(Math.random() * 90000 + 10000)}`,
          ownerId: d.currentUserId,
          speciesId: input.speciesId,
          title: input.title,
          titleHe: input.titleHe,
          photos: [
            input.photo ?? defaultPlantPhoto,
          ],
          quantity: input.quantity,
          sizeGrade: 'cutting',
          quality: input.quality,
          rooting: input.rooting,
          locationZone: d.users.find((u) => u.id === d.currentUserId)?.region ?? '',
          parentId: input.parentId,
          propagatedAt: new Date().toISOString().slice(0, 10),
          status: 'owned',
          createdAt: new Date().toISOString().slice(0, 10),
          history: [
            {
              at: new Date().toISOString().slice(0, 10),
              label: 'Created in greenhouse',
              labelHe: 'נוצר בחממה',
            },
          ],
        })
        return d
      })
      return id
    },
    commitToDemand: (input) => {
      const id = `cm-${Date.now()}`
      update((d) => {
        if (!d.currentUserId) return d
        const demand = d.demands.find((x) => x.id === input.demandId)
        if (!demand) return d
        d.commitments.unshift({
          id,
          demandId: input.demandId,
          growerId: d.currentUserId,
          quantity: input.quantity,
          offeredPrice: input.offeredPrice,
          quality: input.quality,
          availableDate: input.availableDate,
          status: 'pending',
          plantId: input.plantId,
        })
        demand.committedQty += input.quantity
        if (demand.status === 'open') demand.status = 'sourcing'
        if (input.plantId) {
          const plant = d.plants.find((p) => p.id === input.plantId)
          if (plant) plant.status = 'committed'
        }
        return d
      })
      return id
    },
    setCommitmentStatus: (id, status) =>
      update((d) => {
        const c = d.commitments.find((x) => x.id === id)
        if (c) c.status = status
        return d
      }),
    makeOffer: (input) =>
      update((d) => {
        if (!d.currentUserId) return d
        const listing = d.listings.find((l) => l.id === input.listingId)
        if (!listing) return d
        d.offers.unshift({
          id: `of-${Date.now()}`,
          listingId: input.listingId,
          fromUserId: d.currentUserId,
          toUserId: listing.sellerId,
          amount: input.amount,
          message: input.message,
          messageHe: input.messageHe,
          status: 'open',
          createdAt: new Date().toISOString().slice(0, 10),
        })
        return d
      }),
    setOfferStatus: (id, status) =>
      update((d) => {
        const o = d.offers.find((x) => x.id === id)
        if (o) o.status = status
        return d
      }),
    completeHandoff: (orderId) =>
      update((d) => {
        const order = d.orders.find((o) => o.id === orderId)
        if (!order) return d
        order.status = 'completed'
        order.completedAt = new Date().toISOString().slice(0, 10)
        if (order.listingId) {
          const listing = d.listings.find((l) => l.id === order.listingId)
          if (listing) listing.status = 'sold'
        }
        return d
      }),
    createDemand: (input) => {
      const id = `dm-${Date.now()}`
      update((d) => {
        if (!d.currentUserId) return d
        d.demands.unshift({
          id,
          buyerId: d.currentUserId,
          ...input,
          committedQty: 0,
          status: 'open',
          createdAt: new Date().toISOString().slice(0, 10),
        })
        return d
      })
      return id
    },
    aggregateAndConfirm: (demandId) => {
      const orderId = `or-${Date.now()}`
      update((d) => {
        const demand = d.demands.find((x) => x.id === demandId)
        if (!demand || !d.currentUserId) return d
        const accepted = d.commitments.filter(
          (c) => c.demandId === demandId && (c.status === 'accepted' || c.status === 'pending'),
        )
        accepted.forEach((c) => {
          c.status = 'accepted'
        })
        demand.status = 'confirmed'
        const species = d.species.find((s) => s.id === demand.speciesId)
        d.orders.unshift({
          id: orderId,
          buyerId: d.currentUserId,
          sellerIds: [...new Set(accepted.map((c) => c.growerId))],
          demandId,
          items: accepted.map((c) => ({
            plantId: c.plantId ?? 'aggregated',
            title: `${species?.commonName ?? 'Plant'} ×${c.quantity}`,
            titleHe: `${species?.commonNameHe ?? 'צמח'} ×${c.quantity}`,
            qty: c.quantity,
            unitPrice: c.offeredPrice,
            photo: defaultPlantPhoto,
          })),
          total: accepted.reduce((sum, c) => sum + c.quantity * c.offeredPrice, 0),
          status: 'confirmed',
          createdAt: new Date().toISOString().slice(0, 10),
          deliveryDate: demand.dueDate,
          deliveryPlace: demand.region,
          deliveryPlaceHe: demand.regionHe,
        })
        return d
      })
      return orderId
    },
    setEventPhase: (eventId, phase) =>
      update((d) => {
        const e = d.events.find((x) => x.id === eventId)
        if (e) e.phase = phase
        return d
      }),
    gradeRecovery: (eventId, items) =>
      update((d) => {
        const e = d.events.find((x) => x.id === eventId)
        if (!e) return d
        e.recovered = items
        e.phase = 'graded'
        items.forEach((item) => {
          const plant = d.plants.find((p) => p.id === item.plantId)
          if (plant) plant.status = item.grade === 'lost' ? 'sold' : 'recovered'
        })
        return d
      }),
    redistributeEvent: (eventId, destination) =>
      update((d) => {
        const e = d.events.find((x) => x.id === eventId)
        if (!e) return d
        e.phase = 'redistributed'
        e.redistributedTo = destination
        return d
      }),
    resolveModeration: (id, status) =>
      update((d) => {
        const m = d.moderation.find((x) => x.id === id)
        if (m) m.status = status
        return d
      }),
    claimDraft: (draftId) =>
      update((d) => {
        if (!d.currentUserId || d.currentUserId === 'u-guest') return d
        const draft = d.claimDrafts.find((x) => x.id === draftId)
        if (!draft || draft.claimedBy) return d
        draft.claimedBy = d.currentUserId
        const plantId = `pl-claimed-${Date.now()}`
        d.plants.unshift({
          id: plantId,
          code: `CL-${Math.floor(Math.random() * 9000 + 1000)}`,
          ownerId: d.currentUserId,
          speciesId: draft.speciesId,
          title: draft.title,
          titleHe: draft.titleHe,
          photos: [draft.photo],
          quantity: draft.quantity,
          sizeGrade: 'claimed',
          quality: 'B',
          rooting: 'established',
          locationZone: draft.region,
          status: 'listed',
          createdAt: new Date().toISOString().slice(0, 10),
          history: [
            {
              at: new Date().toISOString().slice(0, 10),
              label: 'Claimed draft & published',
              labelHe: 'טיוטה נתבעה ופורסמה',
            },
          ],
        })
        d.listings.unshift({
          id: `ls-claimed-${Date.now()}`,
          plantId,
          sellerId: d.currentUserId,
          price: draft.price,
          quantity: draft.quantity,
          unit: 'plant',
          pickupOnly: true,
          allowOffers: true,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          region: draft.region,
          regionHe: draft.regionHe,
        })
        const mod = d.moderation.find((m) => m.targetId === draftId)
        if (mod) mod.status = 'resolved'
        return d
      }),
    reserveListing: (listingId) => {
      const orderId = `or-${Date.now()}`
      update((d) => {
        if (!d.currentUserId) return d
        const listing = d.listings.find((l) => l.id === listingId)
        if (!listing) return d
        listing.status = 'reserved'
        const plant = d.plants.find((p) => p.id === listing.plantId)
        d.orders.unshift({
          id: orderId,
          buyerId: d.currentUserId,
          sellerIds: [listing.sellerId],
          listingId,
          items: [
            {
              plantId: listing.plantId,
              title: plant?.title ?? 'Plant',
              titleHe: plant?.titleHe ?? 'צמח',
              qty: listing.quantity,
              unitPrice: listing.price,
              photo: plant?.photos[0] ?? '',
            },
          ],
          total: listing.price * (listing.unit === 'bundle' ? 1 : Math.min(listing.quantity, 1)),
          status: 'intent',
          createdAt: new Date().toISOString().slice(0, 10),
          deliveryPlace: listing.region,
          deliveryPlaceHe: listing.regionHe,
        })
        return d
      })
      return orderId
    },
    sendMessage: (threadId, body, bodyHe) =>
      update((d) => {
        if (!d.currentUserId) return d
        const thread = d.threads.find((t) => t.id === threadId)
        if (!thread) return d
        thread.messages.push({
          id: `m-${Date.now()}`,
          fromUserId: d.currentUserId,
          body,
          bodyHe,
          at: new Date().toISOString(),
        })
        return d
      }),
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
