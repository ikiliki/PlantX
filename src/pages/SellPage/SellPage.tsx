import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Field, FormGrid, Input, Select } from '../../components/Form/Form'
import { useI18n } from '../../i18n/I18nProvider'
import { plantImages } from '../../mock/images'
import {
  buildMarketCode,
  buildMarketDisplay,
  rootingToStage,
  varietyCode,
} from '../../mock/marketNaming'
import { useStore } from '../../mock/store'
import type { QualityGrade, SizeBand } from '../../mock/types'
import { theme } from '../../theme/tokens'

const Steps = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: ${theme.space.lg};
`

const Step = styled.div<{ $on?: boolean }>`
  flex: 1;
  text-align: center;
  padding: 10px;
  border-radius: ${theme.radii.md};
  font-weight: 700;
  font-size: 13px;
  background: ${({ $on }) => ($on ? theme.colors.lime : '#E8EEEA')};
  color: ${theme.colors.forest};
`

export function SellPage() {
  const { db, currentUser, createPlantBatch, createListing } = useStore()
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [speciesId, setSpeciesId] = useState('sp-pothos')
  const [title, setTitle] = useState('Rooted cuttings batch')
  const [titleHe, setTitleHe] = useState('מנת ייחורים מושרשים')
  const [qty, setQty] = useState(25)
  const [quality, setQuality] = useState<QualityGrade>('B')
  const [rooting, setRooting] = useState<'rooted' | 'unrooted' | 'established'>('rooted')
  const [parentId, setParentId] = useState('')
  const [photoMock, setPhotoMock] = useState(false)
  const [plantId, setPlantId] = useState('')
  const [price, setPrice] = useState(10)
  const [unit, setUnit] = useState<'plant' | 'cutting' | 'bundle'>('cutting')
  const [offers, setOffers] = useState(true)
  const [variety, setVariety] = useState('Golden')
  const [sizeBand, setSizeBand] = useState<SizeBand>('M')

  if (!currentUser || currentUser.role === 'guest') {
    return (
      <div>
        <PageHeader>
          <h1>{t.sell.title}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </div>
    )
  }

  const parents = db.plants.filter((p) => p.ownerId === currentUser.id)
  const species = db.species.find((s) => s.id === speciesId)
  const stage = rootingToStage(rooting, sizeBand === 'XL' ? 'mature' : undefined)
  const matchedClass = db.marketClasses.find(
    (mc) =>
      mc.speciesId === speciesId &&
      mc.quality === quality &&
      mc.size === sizeBand &&
      mc.stage === stage,
  )
  const classCode =
    matchedClass?.code ??
    buildMarketCode({
      ticker: species?.ticker ?? 'PLT',
      varietyCode: varietyCode(variety),
      quality,
      size: sizeBand,
      stage,
    })
  const classDisplay =
    matchedClass
      ? locale === 'he'
        ? matchedClass.displayNameHe
        : matchedClass.displayName
      : buildMarketDisplay({
          species: locale === 'he' ? species?.commonNameHe ?? '' : species?.commonName ?? '',
          variety,
          quality,
          size: sizeBand,
          stage,
          locale,
        })

  const createBatch = (e: FormEvent) => {
    e.preventDefault()
    const id = createPlantBatch({
      speciesId,
      title,
      titleHe,
      quantity: qty,
      quality,
      rooting,
      parentId: parentId || undefined,
      photo: photoMock ? plantImages.cuttings : undefined,
    })
    setPlantId(id)
    setStep(2)
  }

  const publish = (e: FormEvent) => {
    e.preventDefault()
    if (!plantId) return
    const listingId = createListing({
      plantId,
      price,
      quantity: qty,
      unit,
      allowOffers: offers,
    })
    navigate(`/plants/${plantId}`)
    void listingId
  }

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.sell.title}</h1>
          <p>{t.growVerifyTrade}</p>
        </div>
      </PageHeader>
      <Steps>
        <Step $on={step === 0}>{t.sell.stepPlant}</Step>
        <Step $on={step === 1}>{t.sell.stepDetails}</Step>
        <Step $on={step === 2}>{t.sell.stepList}</Step>
      </Steps>

      {step === 0 && (
        <Card>
          <FormGrid>
            <Field>
              {t.sell.species}
              <Select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
                {db.species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {locale === 'he' ? s.commonNameHe : s.commonName}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              {t.sell.parent}
              <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">—</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {locale === 'he' ? p.titleHe : p.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="button" onClick={() => setStep(1)}>
              {t.common.continue}
            </Button>
          </FormGrid>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <form onSubmit={createBatch}>
            <FormGrid>
              <Field>
                {t.sell.titleLabel} (EN)
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field>
                {t.sell.titleLabel} (HE)
                <Input value={titleHe} onChange={(e) => setTitleHe(e.target.value)} />
              </Field>
              <Field>
                {t.sell.qty}
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </Field>
              <Field>
                {t.sell.quality}
                <Select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as QualityGrade)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </Select>
              </Field>
              <Field>
                Size
                <Select
                  value={sizeBand}
                  onChange={(e) => setSizeBand(e.target.value as SizeBand)}
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </Select>
              </Field>
              <Field>
                Variety
                <Input value={variety} onChange={(e) => setVariety(e.target.value)} />
              </Field>
              <Field>
                {t.sell.rooting}
                <Select
                  value={rooting}
                  onChange={(e) => setRooting(e.target.value as typeof rooting)}
                >
                  <option value="rooted">{t.market.rooted}</option>
                  <option value="unrooted">{t.market.unrooted}</option>
                  <option value="established">established</option>
                </Select>
              </Field>
              <Field>
                {t.sell.photo}
                <Button
                  type="button"
                  variant={photoMock ? 'primary' : 'ghost'}
                  onClick={() => setPhotoMock(true)}
                >
                  {photoMock ? t.sell.photoMock : t.sell.photo}
                </Button>
              </Field>
              <Button type="submit">{t.sell.create}</Button>
            </FormGrid>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <form onSubmit={publish}>
            <FormGrid>
              <div
                style={{
                  background: 'white',
                  color: theme.colors.ink,
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div style={{ color: theme.colors.muted, fontSize: 13 }}>{t.exchange.classifiedAs}</div>
                <strong style={{ fontSize: 18 }}>{classDisplay}</strong>
                <div style={{ color: theme.colors.greenDark, fontWeight: 800, marginTop: 6 }}>
                  {classCode}
                </div>
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  {t.exchange.currentRange}
                  <br />
                  <strong>
                    {matchedClass
                      ? `₪${matchedClass.rangeMin}–₪${matchedClass.rangeMax}`
                      : `₪${Math.round(price * 0.85)}–₪${Math.round(price * 1.15)}`}
                  </strong>
                </div>
                {matchedClass && (
                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                    {matchedClass.supplyUnits} / {matchedClass.demandUnits}{' '}
                    {t.exchange.availableWanted}
                  </div>
                )}
              </div>
              <p style={{ fontWeight: 700 }}>
                {t.sell.done} — {plantId}
              </p>
              <Field>
                {t.sell.price}
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </Field>
              <Field>
                {t.sell.unit}
                <Select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)}>
                  <option value="cutting">cutting</option>
                  <option value="plant">plant</option>
                  <option value="bundle">bundle</option>
                </Select>
              </Field>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={offers}
                  onChange={(e) => setOffers(e.target.checked)}
                />
                {t.sell.offers}
              </label>
              <Button type="submit">{t.sell.publish}</Button>
            </FormGrid>
          </form>
        </Card>
      )}
    </div>
  )
}
