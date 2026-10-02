import { useState, type KeyboardEvent } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { landingShots, type LandingDevice } from '../../landingShots'
import { DeviceFrame } from '../DeviceFrame/DeviceFrame'
import {
  Band,
  Copy,
  Device,
  DeviceSwitch,
  Head,
  Kicker,
  Lead,
  Point,
  Points,
  Screen,
  Tab,
  Tabs,
  Title,
  View,
} from './LandingTour.styles'

type AreaId = 'home' | 'greenhouse' | 'passport' | 'tasks' | 'catalog'

/** Stills per area. An area without a phone still stays on desktop. */
const AREAS: { id: AreaId; desk: string; phone?: string }[] = [
  { id: 'greenhouse', desk: landingShots.greenhouseDesk, phone: landingShots.greenhousePhone },
  { id: 'passport', desk: landingShots.passportDesk, phone: landingShots.passportPhone },
  { id: 'tasks', desk: landingShots.tasksDesk, phone: landingShots.tasksPhone },
  { id: 'home', desk: landingShots.homeDesk, phone: landingShots.homePhone },
  { id: 'catalog', desk: landingShots.wikiDesk },
]

/** The landing's interactive dashboard: real app stills, picked by area and screen size. */
export function LandingTour() {
  const { t } = useI18n()
  const [areaId, setAreaId] = useState<AreaId>('greenhouse')
  // A phone visitor starts on the phone stills; the desktop ones are too small to read there.
  const [device, setDevice] = useState<LandingDevice>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches ? 'phone' : 'desk',
  )

  const copy: Record<AreaId, { label: string; title: string; body: string; points: string[] }> = {
    home: {
      label: t.landing.tourHome,
      title: t.landing.tourHomeTitle,
      body: t.landing.tourHomeBody,
      points: [t.landing.tourHome1, t.landing.tourHome2, t.landing.tourHome3],
    },
    greenhouse: {
      label: t.landing.tourGreenhouse,
      title: t.landing.tourGreenhouseTitle,
      body: t.landing.tourGreenhouseBody,
      points: [t.landing.tourGreenhouse1, t.landing.tourGreenhouse2, t.landing.tourGreenhouse3],
    },
    passport: {
      label: t.landing.tourPassport,
      title: t.landing.tourPassportTitle,
      body: t.landing.tourPassportBody,
      points: [t.landing.tourPassport1, t.landing.tourPassport2, t.landing.tourPassport3],
    },
    tasks: {
      label: t.landing.tourTasks,
      title: t.landing.tourTasksTitle,
      body: t.landing.tourTasksBody,
      points: [t.landing.tourTasks1, t.landing.tourTasks2, t.landing.tourTasks3],
    },
    catalog: {
      label: t.landing.tourCatalog,
      title: t.landing.tourCatalogTitle,
      body: t.landing.tourCatalogBody,
      points: [t.landing.tourCatalog1, t.landing.tourCatalog2, t.landing.tourCatalog3],
    },
  }

  const area = AREAS.find((item) => item.id === areaId) ?? AREAS[0]
  const shown: LandingDevice = device === 'phone' && area.phone ? 'phone' : 'desk'
  const text = copy[area.id]

  // Arrow keys move between tabs, as a tablist should.
  const onTabsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const rtl = document.documentElement.dir === 'rtl'
    const forward = (event.key === 'ArrowRight') !== rtl
    const index = AREAS.findIndex((item) => item.id === areaId)
    const next = AREAS[(index + (forward ? 1 : -1) + AREAS.length) % AREAS.length]
    setAreaId(next.id)
    document.getElementById(`tour-tab-${next.id}`)?.focus()
  }

  return (
    <Band id="tour">
      <Head>
        <Kicker>{t.landing.tourKicker}</Kicker>
        <Title>{t.landing.tourTitle}</Title>
        <Lead>{t.landing.tourLead}</Lead>
      </Head>

      <View>
        <Tabs role="tablist" aria-label={t.landing.tourAreas} onKeyDown={onTabsKey}>
          {AREAS.map((item) => (
            <Tab
              key={item.id}
              id={`tour-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={item.id === areaId}
              aria-controls="tour-panel"
              tabIndex={item.id === areaId ? 0 : -1}
              $on={item.id === areaId}
              onClick={() => setAreaId(item.id)}
            >
              {copy[item.id].label}
            </Tab>
          ))}
        </Tabs>
        <DeviceSwitch role="group" aria-label={t.landing.tourDevice}>
          {(['desk', 'phone'] as const).map((id) => (
            <Device
              key={id}
              type="button"
              aria-pressed={shown === id}
              disabled={id === 'phone' && !area.phone}
              $on={shown === id}
              onClick={() => setDevice(id)}
            >
              {id === 'desk' ? t.landing.tourDesktop : t.landing.tourPhone}
            </Device>
          ))}
        </DeviceSwitch>
      </View>

      <Screen id="tour-panel" role="tabpanel" aria-labelledby={`tour-tab-${area.id}`} $device={shown}>
        <div key={`${area.id}-${shown}`}>
          <DeviceFrame
            device={shown}
            src={shown === 'phone' && area.phone ? area.phone : area.desk}
            alt={text.title}
          />
        </div>
        <Copy key={area.id}>
          <h3>{text.title}</h3>
          <p>{text.body}</p>
          <Points>
            {text.points.map((point) => (
              <Point key={point}>
                <i aria-hidden="true">✓</i>
                <span>{point}</span>
              </Point>
            ))}
          </Points>
        </Copy>
      </Screen>
    </Band>
  )
}
