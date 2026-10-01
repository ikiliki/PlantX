import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { WikiSection } from './WikiSection'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 640, padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Species/WikiSection',
  component: WikiSection,
  decorators: [withApp],
}

export const Folded = () => {
  const [open, setOpen] = useState(false)
  return (
    <WikiSection id="grades" title="What the grades mean" open={open} onToggle={() => setOpen((value) => !value)}>
      <p>A healthy plant holds its grade. B allows minor cosmetic damage.</p>
    </WikiSection>
  )
}

export const Open = () => {
  const [open, setOpen] = useState(true)
  return (
    <WikiSection id="overview" title="Overview" open={open} onToggle={() => setOpen((value) => !value)}>
      <p>Pothos is a forgiving class with an 8–12 week growth cycle.</p>
    </WikiSection>
  )
}
