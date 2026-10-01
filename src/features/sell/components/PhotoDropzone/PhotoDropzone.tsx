import { Hint, Icon, Label, Preview, Root } from './PhotoDropzone.styles'

export function PhotoDropzone({
  label,
  hint,
  previewSrc,
  onSelect,
}: {
  label: string
  hint: string
  previewSrc?: string
  onSelect: () => void
}) {
  return (
    <Root type="button" $filled={Boolean(previewSrc)} onClick={onSelect}>
      {previewSrc ? <Preview src={previewSrc} alt="" /> : <Icon aria-hidden>⌾</Icon>}
      <Label>{label}</Label>
      <Hint>{hint}</Hint>
    </Root>
  )
}
