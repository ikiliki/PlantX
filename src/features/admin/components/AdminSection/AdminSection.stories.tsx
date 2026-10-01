import { AdminSection } from './AdminSection'

export default {
  title: 'Features/Admin/AdminSection',
  component: AdminSection,
}

export const WithLead = () => (
  <AdminSection title="Test playground" lead="Send a photo to one provider or the whole chain.">
    <p>Section body</p>
  </AdminSection>
)

export const WithAside = () => (
  <AdminSection title="Plant.id" aside="Order 1">
    <p>Section body</p>
  </AdminSection>
)
