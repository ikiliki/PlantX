import { HomeMobileFloats } from './HomeMobileFloats'

export default {
  title: 'Features/Discover/HomeMobileFloats',
  component: HomeMobileFloats,
}

export const Mobile = () => (
  <div style={{ minHeight: '160vh', padding: 16 }}>
    <p>Resize below 900px to see floating chips.</p>
    <HomeMobileFloats />
  </div>
)
