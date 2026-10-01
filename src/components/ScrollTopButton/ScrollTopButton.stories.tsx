import { ScrollTopButton } from './ScrollTopButton'

export default {
  title: 'Components/ScrollTopButton',
  component: ScrollTopButton,
}

export const AppearsAfterScroll = () => (
  <div style={{ height: 3000, padding: 24 }}>
    Scroll down to reveal the button.
    <ScrollTopButton label="Back to top" threshold={200} />
  </div>
)
