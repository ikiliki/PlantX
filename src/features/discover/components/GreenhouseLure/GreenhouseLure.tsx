import { useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useAuth } from '../../../auth/AuthProvider'
import { AddPlantDialog } from '../../../greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { AddSlot, Body, Card, Copy, Eyebrow, Lure, Open, Photo, Photos, Title } from './GreenhouseLure.styles'

const SLOTS = 3

export function GreenhouseLure() {
  const { db, currentUser, signedIn } = useStore()
  const { openAuth } = useAuth()
  const { t } = useI18n()
  const [adding, setAdding] = useState(false)
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId && plant.photos[0]).slice(0, SLOTS)
  const empty = SLOTS - mine.length

  return (
    <Card>
      <Body>
        <Copy to="/greenhouse">
          <Eyebrow>{t.discover.lureEyebrow}</Eyebrow>
          <Title>{mine.length > 0 ? t.discover.lureYours : t.discover.lureTitle}</Title>
          <Lure>{mine.length > 0 ? t.discover.lureYoursBody : t.discover.lureBody}</Lure>
          <Open>{t.discover.lureOpen}</Open>
        </Copy>
        <Photos>
          {mine.map((plant, index) => (
            <Photo key={plant.id} to="/greenhouse" $i={index}>
              <PlantImage src={plant.photos[0]} alt="" />
            </Photo>
          ))}
          {Array.from({ length: empty }, (_, index) => (
            <AddSlot
              key={`add-${index}`}
              type="button"
              $i={mine.length + index}
              aria-label={t.greenhouse.add}
              onClick={() => (signedIn ? setAdding(true) : openAuth('buy'))}
            >
              +
            </AddSlot>
          ))}
        </Photos>
      </Body>
      {adding && <AddPlantDialog onClose={() => setAdding(false)} />}
    </Card>
  )
}
