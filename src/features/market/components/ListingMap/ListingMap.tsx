import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../../../../i18n/I18nProvider'
import { listingPlace } from '../../../../mock/locations'
import { useStore } from '../../../../mock/store'
import type { Listing, MarketClass, Plant } from '../../../../mock/types'
import { maskedPrice } from '../../maskedQuote'
import { MarketPeekCard } from '../MarketPeek/MarketPeek'
import { Frame, MapCanvas, PeekDock } from './ListingMap.styles'

const ISRAEL: L.LatLngExpression = [31.5, 34.95]

type Pin = {
  listing: Listing
  plant?: Plant
  marketClass?: MarketClass
  lat: number
  lng: number
  price: number
  title: string
  region: string
  stack: number
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function withStack(pins: Omit<Pin, 'stack'>[]) {
  const seen = new Map<string, number>()
  return pins.map((pin) => {
    const key = `${pin.lat.toFixed(5)},${pin.lng.toFixed(5)}`
    const stack = seen.get(key) ?? 0
    seen.set(key, stack + 1)
    return { ...pin, stack }
  })
}

function iconAnchor(stack: number): L.PointExpression {
  if (stack === 0) return [44, 38]
  const perRing = 5
  const ring = Math.ceil(stack / perRing)
  const slot = (stack - 1) % perRing
  const angle = (slot / perRing) * Math.PI * 2 - Math.PI / 2
  const radius = 58 * ring
  return [44 - Math.cos(angle) * radius, 38 + Math.sin(angle) * radius]
}

function fitPins(map: L.Map, pins: Pin[]) {
  if (pins.length === 0) {
    map.setView(ISRAEL, 8)
    return
  }
  if (pins.length === 1) {
    map.setView([pins[0].lat, pins[0].lng], 13)
    return
  }
  map.fitBounds(
    L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng] as L.LatLngTuple)),
    { paddingTopLeft: [70, 52], paddingBottomRight: [52, 72], maxZoom: 14, animate: false },
  )
}

export function ListingMap({
  listings,
  tall = false,
  masked = false,
}: {
  listings: Listing[]
  tall?: boolean
  onOpen?: (listingId: string) => void
  /** Coming-soon map: stand-in prices, with pins and the hover card blurred. */
  masked?: boolean
}) {
  const { db } = useStore()
  const { locale, formatMoney } = useI18n()
  const canvasRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef(new Map<string, L.Marker>())
  const pinsRef = useRef<Pin[]>([])
  const fittedKey = useRef('')
  const selectedIdRef = useRef<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const pins = useMemo(() => {
    const placed = listings.flatMap((listing) => {
      const plant = db.plants.find((item) => item.id === listing.plantId)
      const place = listingPlace(listing, plant)
      if (!place) return []
      const marketClass = db.marketClasses.find(
        (item) => item.id === listing.marketClassId || item.id === plant?.marketClassId,
      )
      const title = marketClass
        ? locale === 'he'
          ? marketClass.displayNameHe
          : marketClass.displayName
        : plant
          ? locale === 'he'
            ? plant.titleHe
            : plant.title
          : listing.region
      return [
        {
          listing,
          plant,
          marketClass,
          lat: place.lat,
          lng: place.lng,
          price: masked ? maskedPrice(listing.id) : (marketClass?.lastPrice ?? listing.price),
          title,
          region: locale === 'he' ? place.regionHe : place.region,
        },
      ]
    })
    return withStack(placed)
  }, [listings, db.plants, db.marketClasses, locale, masked])

  pinsRef.current = pins
  selectedIdRef.current = selectedId
  const selected = pins.find((pin) => pin.listing.id === selectedId)

  const pinKey = pins.map((pin) => pin.listing.id).join('|')

  useEffect(() => {
    const node = canvasRef.current
    if (!node) return

    const map = L.map(node, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView(ISRAEL, 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    map.on('click', () => setSelectedId(null))
    mapRef.current = map

    const tryFit = () => {
      const height = node.clientHeight
      if (height < 80 || node.clientWidth < 80) return
      map.invalidateSize()
      const key = pinsRef.current.map((pin) => pin.listing.id).join('|')
      if (fittedKey.current === key) return
      fitPins(map, pinsRef.current)
      fittedKey.current = key
    }

    const observer = new ResizeObserver(() => tryFit())
    observer.observe(node)
    tryFit()

    return () => {
      observer.disconnect()
      if (mapRef.current === map) {
        map.remove()
        mapRef.current = null
        markersRef.current.clear()
        fittedKey.current = ''
      }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    for (const pin of pins) {
      const marker = L.marker([pin.lat, pin.lng], {
        keyboard: true,
        title: masked ? pin.title : `${pin.title} ${formatMoney(pin.price)}`,
        alt: pin.title,
        zIndexOffset: (pin.listing.id === selectedIdRef.current ? 800 : 0) + pin.stack,
        icon: L.divIcon({
          className: [
            'px-pin',
            pin.listing.id === selectedIdRef.current ? 'is-on' : '',
            masked ? 'is-masked' : '',
          ]
            .filter(Boolean)
            .join(' '),
          html: `<span class="px-pin-label">${escapeHtml(formatMoney(pin.price))}</span>`,
          iconSize: [88, 34],
          iconAnchor: iconAnchor(pin.stack),
        }),
      })
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event.originalEvent)
        setSelectedId((current) => (current === pin.listing.id ? null : pin.listing.id))
      })
      marker.on('mouseover', () => setSelectedId(pin.listing.id))
      marker.addTo(map)
      markersRef.current.set(pin.listing.id, marker)
    }

    const node = canvasRef.current
    if (node && node.clientHeight >= 80 && node.clientWidth >= 80) {
      map.invalidateSize()
      if (fittedKey.current !== pinKey) {
        fitPins(map, pins)
        fittedKey.current = pinKey
      }
    } else {
      fittedKey.current = ''
    }
  }, [pins, formatMoney, pinKey, masked])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const on = id === selectedId
      marker.setZIndexOffset(on ? 800 : 0)
      marker.getElement()?.classList.toggle('is-on', on)
    })
  }, [selectedId, pinKey])

  useEffect(() => {
    if (selectedId && !pins.some((pin) => pin.listing.id === selectedId)) {
      setSelectedId(null)
    }
  }, [pins, selectedId])

  return (
    <Frame $tall={tall}>
      <MapCanvas ref={canvasRef} />
      {selected && (
        <PeekDock
          $rtl={locale === 'he'}
          onMouseEnter={() => setSelectedId(selected.listing.id)}
          onMouseLeave={() => setSelectedId(null)}
        >
          <MarketPeekCard
            classId={selected.marketClass?.id}
            speciesId={selected.plant?.speciesId}
            plantId={selected.plant?.id}
            masked={masked}
          />
        </PeekDock>
      )}
    </Frame>
  )
}
