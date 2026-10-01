import { Description, Root, Title } from './ListingTypeCard.styles'

export { TypeRow } from './ListingTypeCard.styles'

export function ListingTypeCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string
  description: string
  selected?: boolean
  onSelect: () => void
}) {
  return (
    <Root type="button" $selected={selected} aria-pressed={selected} onClick={onSelect}>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Root>
  )
}
