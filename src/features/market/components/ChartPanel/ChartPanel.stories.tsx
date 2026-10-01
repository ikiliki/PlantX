import { ChartPanel } from './ChartPanel'

export default {
  title: 'Features/Market/ChartPanel',
  component: ChartPanel,
}

export const WithTitle = () => (
  <div style={{ maxWidth: 720, padding: 24 }}>
    <ChartPanel title="Transactions" hint="Last 90 days · dot size = quantity">
      <div style={{ height: 160, borderRadius: 12, background: '#F4F1E8' }} />
    </ChartPanel>
  </div>
)

export const Plain = () => (
  <div style={{ maxWidth: 720, padding: 24 }}>
    <ChartPanel>
      <p>Any chart content</p>
    </ChartPanel>
  </div>
)
