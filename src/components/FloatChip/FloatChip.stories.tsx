import { FloatChip } from './FloatChip'

export default {
  title: 'Components/FloatChip',
  component: FloatChip,
}

export const Demo = () => (
  <div style={{ minHeight: '140vh', padding: 24 }}>
    <p>Scroll and drag the chip on a narrow viewport.</p>
    <FloatChip id="story-float" label="Demo chip" defaultPoint={{ x: 24, y: 120 }} face={<span>✦</span>}>
      <p>Sheet body for the floating chip.</p>
    </FloatChip>
  </div>
)
