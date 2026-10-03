import { useI18n } from '../../../../i18n/I18nProvider'
import { Copy, HeroBody, HeroCopy, Hint, Orb, Plus, Root, Spark, Stage } from './AddPlantCard.styles'

/**
 * Last tile of the collection. `hero` spans the grid as the empty greenhouse invite.
 * `label` replaces "Add another plant" (a guest tries Add Plant on a greenhouse they don't have).
 */
export function AddPlantCard({ onClick, hero, label }: { onClick: () => void; hero?: boolean; label?: string }) {
  const { t } = useI18n()

  if (hero) {
    return (
      <Root type="button" onClick={onClick} $hero>
        <Orb aria-hidden>
          <Spark style={{ animationDelay: '0ms' }}>✦</Spark>
          <Spark style={{ animationDelay: '600ms' }}>✦</Spark>
          <Spark style={{ animationDelay: '1200ms' }}>✦</Spark>
          <Plus>+</Plus>
        </Orb>
        <HeroBody>
          <HeroCopy>
            <strong>{t.greenhouse.emptyTitle}</strong>
            <span>{t.greenhouse.emptyBody}</span>
          </HeroCopy>
          <Hint $solid>{t.greenhouse.emptyAction}</Hint>
        </HeroBody>
      </Root>
    )
  }

  return (
    <Root type="button" onClick={onClick}>
      <Stage>
        <Orb aria-hidden>
          <Spark style={{ animationDelay: '0ms' }}>✦</Spark>
          <Plus>+</Plus>
        </Orb>
      </Stage>
      <Copy>
        <strong>{label ?? t.greenhouse.addAnother}</strong>
        <Hint>{t.greenhouse.addCardHint}</Hint>
      </Copy>
    </Root>
  )
}
