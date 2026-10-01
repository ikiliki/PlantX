import { Card } from '../Card/Card'
import { Reveal } from './Reveal'

export default {
  title: 'Components/Reveal',
  component: Reveal,
}

export const StaggeredList = () => (
  <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
    {Array.from({ length: 12 }, (_, i) => (
      <Reveal key={i} index={i}>
        <Card>Row {i + 1}</Card>
      </Reveal>
    ))}
  </div>
)
