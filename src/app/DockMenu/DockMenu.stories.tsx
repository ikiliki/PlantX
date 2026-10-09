import { DockMenu } from './DockMenu'

export default {
  title: 'App/DockMenu',
  component: DockMenu,
}

export const Greenhouse = () => (
  <DockMenu
    id="dock-menu-greenhouse"
    title="Greenhouse"
    items={[
      { to: '/greenhouse', label: 'My greenhouse' },
      { to: '/greenhouse?scope=global', label: 'All greenhouses' },
    ]}
    onClose={() => undefined}
  />
)
