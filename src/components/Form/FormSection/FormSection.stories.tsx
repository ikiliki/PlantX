import type { ReactNode } from 'react'
import { Field, Input } from '../Form'
import { FormSection, FormRow } from './FormSection'

export default {
  title: 'Components/Form/FormSection',
  component: FormSection,
}

const wrap = (Story: () => ReactNode) => (
  <div style={{ padding: 24, maxWidth: 480 }}>
    <Story />
  </div>
)

export const Default = {
  decorators: [wrap],
  render: () => (
    <FormSection title="Catalog" hint="Fields grouped like a standard form.">
      <FormRow>
        <Field>
          Category
          <Input placeholder="Pothos" />
        </Field>
        <Field>
          Subcategory
          <Input placeholder="Golden" />
        </Field>
      </FormRow>
    </FormSection>
  ),
}
