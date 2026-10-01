import { useState } from 'react'
import { Switch } from './Switch'

export default {
  title: 'Components/Switch',
  component: Switch,
}

export const Interactive = () => {
  const [on, setOn] = useState(true)
  return <Switch checked={on} onChange={setOn} label={on ? 'On' : 'Off'} />
}

export const Off = () => <Switch checked={false} onChange={() => undefined} label="Off" />

export const Busy = () => (
  <Switch checked onChange={() => undefined} label="On" busy busyLabel="Saving…" />
)

export const Disabled = () => <Switch checked onChange={() => undefined} label="On" disabled />

export const RightToLeft = () => {
  const [on, setOn] = useState(false)
  return (
    <div dir="rtl">
      <Switch checked={on} onChange={setOn} label={on ? 'פעיל' : 'כבוי'} />
    </div>
  )
}
