import { CommandPalette, type CommandItem } from './CommandPalette'

export default {
  title: 'Components/CommandPalette',
  component: CommandPalette,
}

const items: CommandItem[] = [
  { id: 'home', label: 'Home', group: 'Pages', icon: 'home' },
  { id: 'market', label: 'Market', group: 'Pages', icon: 'market' },
  { id: 'greenhouse', label: 'Greenhouse', group: 'Pages', icon: 'greenhouse' },
  { id: 'monstera', label: 'Monstera', group: 'Plants', icon: 'wiki', hint: 'Uncommon', keywords: 'Monstera deliciosa' },
  { id: 'pothos', label: 'Pothos', group: 'Plants', icon: 'wiki', hint: 'Common', keywords: 'Epipremnum aureum' },
]

export const Open = () => (
  <CommandPalette
    items={items}
    label="Search"
    placeholder="Jump to a page or a plant"
    emptyText="Nothing matches that. Try a plant name."
    onPick={() => undefined}
    onClose={() => undefined}
  />
)
