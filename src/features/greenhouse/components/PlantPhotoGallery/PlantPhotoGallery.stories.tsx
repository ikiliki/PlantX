import type { ReactNode } from 'react'
import { useState } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { PlantPhotoGallery } from './PlantPhotoGallery'

const photos = [
  '/class-photos/pot-gold-a-xl-mat.jpg',
  '/class-photos/pot-gold-a-l-mat.jpg',
  '/class-photos/mon-std-a-xl-mat.jpg',
]

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <div style={{ maxWidth: 640, padding: 24 }}>
      <Story />
    </div>
  </I18nProvider>
)

export default {
  title: 'Features/Greenhouse/PlantPhotoGallery',
  component: PlantPhotoGallery,
  decorators: [withApp],
}

export const Default = () => {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  return (
    <PlantPhotoGallery
      photos={photos}
      alt="Sample plant"
      index={index}
      onIndexChange={setIndex}
      viewerOpen={open}
      onViewerOpenChange={setOpen}
    />
  )
}
