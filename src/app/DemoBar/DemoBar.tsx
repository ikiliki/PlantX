import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { demoPersonas } from '../../mock/session'
import { personaScenarioId } from '../../mock/personas'
import { useStore } from '../../mock/store'
import type {
  GradeStackScenario,
  GreenhouseScenario,
  MarketBannerScenario,
  MarketScenario,
  PublishRequirement,
  TopGreenhouseScenario,
  TradeScenario,
  UpdateScenario,
} from '../../mock/types'
import {
  DemoLabel,
  DemoSelect,
  Dock,
  Field,
  Fields,
  Panel,
  PanelHead,
  Pin,
  ResetButton,
  Tab,
} from './DemoBar.styles'

const updateOptions: UpdateScenario[] = ['empty', 'one', 'multiple', 'mixed']
const marketOptions: MarketScenario[] = ['none', 'one', 'some', 'pages', 'mixed', 'category', 'prices', 'listings']
const plantOptions: GreenhouseScenario[] = ['empty', 'one', 'several', 'mixed', 'listed']
const topOptions: TopGreenhouseScenario[] = ['empty', 'ranked', 'tied', 'single']
const bannerOptions: MarketBannerScenario[] = ['empty', 'few', 'full']
const tradeOptions: TradeScenario[] = ['none', 'one', 'some']
const gradeOptions: GradeStackScenario[] = ['empty', 'one', 'few', 'full']
const publishOptions: PublishRequirement[] = ['none', 'verified', 'graded']

export function DemoBar() {
  const { db, loginAs, setDemoScenarios, resetDemo } = useStore()
  const { t } = useI18n()
  const navigate = useNavigate()
  const flags = db.flags
  const personas = demoPersonas(db.users)
  const dockRef = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [focused, setFocused] = useState(false)
  const open = hot || pinned || focused

  return (
    <Dock
      ref={dockRef}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        window.setTimeout(() => {
          if (!dockRef.current?.contains(document.activeElement)) setFocused(false)
        }, 0)
      }}
    >
      <Tab type="button" $open={open} aria-expanded={open}>
        {t.demo.label}
      </Tab>
      {open && (
        <Panel>
          <PanelHead>
            <DemoLabel>{t.demo.label}</DemoLabel>
            <Pin type="button" $on={pinned} aria-pressed={pinned} onClick={() => setPinned((value) => !value)}>
              {pinned ? t.demo.unpin : t.demo.pin}
            </Pin>
          </PanelHead>
          <Fields>
            <Field>
              {t.demo.persona}
              <DemoSelect
                aria-label={t.demo.persona}
                value={personas.some((user) => user.id === db.currentUserId) ? (db.currentUserId ?? '') : ''}
                onChange={(e) => loginAs(e.target.value || null)}
              >
                <option value="">{t.demo.signedOut}</option>
                {personas.map((u) => (
                  <option key={u.id} value={u.id}>
                    {t.demo.personaScenarios[personaScenarioId(u.id)]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.updates}
              <DemoSelect
                aria-label={t.demo.updates}
                value={flags.updates}
                onChange={(e) => setDemoScenarios({ updates: e.target.value as UpdateScenario })}
              >
                {updateOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.updateOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.market}
              <DemoSelect
                aria-label={t.demo.market}
                value={flags.market}
                onChange={(e) => setDemoScenarios({ market: e.target.value as MarketScenario })}
              >
                {marketOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.marketOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.greenhouse}
              <DemoSelect
                aria-label={t.demo.greenhouse}
                value={flags.greenhouse}
                onChange={(e) => setDemoScenarios({ greenhouse: e.target.value as GreenhouseScenario })}
              >
                {plantOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.plantOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.topGreenhouses}
              <DemoSelect
                aria-label={t.demo.topGreenhouses}
                value={flags.topGreenhouses}
                onChange={(e) => setDemoScenarios({ topGreenhouses: e.target.value as TopGreenhouseScenario })}
              >
                {topOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.topOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.marketBanner}
              <DemoSelect
                aria-label={t.demo.marketBanner}
                value={flags.marketBanner}
                onChange={(e) => setDemoScenarios({ marketBanner: e.target.value as MarketBannerScenario })}
              >
                {bannerOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.bannerOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.trades}
              <DemoSelect
                aria-label={t.demo.trades}
                value={flags.trades}
                onChange={(e) => setDemoScenarios({ trades: e.target.value as TradeScenario })}
              >
                {tradeOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.tradeOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.gradeStack}
              <DemoSelect
                aria-label={t.demo.gradeStack}
                value={flags.gradeStack}
                onChange={(e) => setDemoScenarios({ gradeStack: e.target.value as GradeStackScenario })}
              >
                {gradeOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.gradeOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
            <Field>
              {t.demo.publishRequirement}
              <DemoSelect
                aria-label={t.demo.publishRequirement}
                value={flags.publishRequirement}
                onChange={(e) => setDemoScenarios({ publishRequirement: e.target.value as PublishRequirement })}
              >
                {publishOptions.map((id) => (
                  <option key={id} value={id}>
                    {t.demo.publishOptions[id]}
                  </option>
                ))}
              </DemoSelect>
            </Field>
          </Fields>
          <ResetButton
            type="button"
            onClick={() => {
              resetDemo()
              navigate('/login')
            }}
          >
            {t.demo.reset}
          </ResetButton>
        </Panel>
      )}
    </Dock>
  )
}
