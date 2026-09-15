import styled from 'styled-components'
import { theme } from '../../theme/tokens'
import { Link } from 'react-router-dom'

export const Shell = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  background:
    radial-gradient(1200px 500px at 10% -10%, rgba(124, 255, 107, 0.18), transparent 55%),
    radial-gradient(900px 400px at 100% 0%, rgba(31, 168, 90, 0.12), transparent 50%),
    ${theme.colors.cream};
`

export const DemoBarRoot = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  min-height: ${theme.layout.demoBar};
  background: ${theme.colors.forest};
  color: white;
  font-size: 12px;
  border-bottom: 1px solid rgba(124, 255, 107, 0.25);
`

export const DemoSelect = styled.select`
  background: ${theme.colors.forestSoft};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.radii.sm};
  padding: 4px 8px;
  max-width: 180px;
`

export const DemoLabel = styled.span`
  opacity: 0.7;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

export const LayoutBody = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 900px) {
    grid-template-columns: ${theme.layout.sideNav} 1fr;
  }
`

export const SideNav = styled.nav`
  display: none;
  @media (min-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: ${theme.space.lg};
    border-inline-end: 1px solid ${theme.colors.border};
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(8px);
    position: sticky;
    top: ${theme.layout.demoBar};
    height: calc(100vh - ${theme.layout.demoBar});
    overflow: auto;
  }
`

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: ${theme.space.lg};
  font-weight: 800;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const BrandMark = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${theme.colors.lime}, ${theme.colors.green});
  display: grid;
  place-items: center;
  font-size: 18px;
`

export const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  font-weight: 600;
  color: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.muted)};
  background: ${({ $active }) => ($active ? 'rgba(124,255,107,0.35)' : 'transparent')};
  &:hover {
    background: rgba(11, 31, 20, 0.05);
  }
`

export const Main = styled.main`
  padding: ${theme.space.md};
  padding-bottom: calc(${theme.layout.bottomNav} + ${theme.space.xl});
  max-width: ${theme.layout.max};
  width: 100%;
  margin: 0 auto;
  @media (min-width: 900px) {
    padding: ${theme.space.xl};
    padding-bottom: ${theme.space.xl};
  }
`

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  inset-inline: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid ${theme.colors.border};
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
  @media (min-width: 900px) {
    display: none;
  }
`

export const BottomLink = styled(Link)<{ $active?: boolean }>`
  display: grid;
  justify-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? theme.colors.greenDark : theme.colors.muted)};
  padding: 6px 2px;
`

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: ${theme.space.lg};
  h1 {
    font-size: clamp(24px, 4vw, 34px);
    color: ${theme.colors.forest};
  }
  p {
    color: ${theme.colors.muted};
    margin-top: 4px;
  }
`

export const Grid = styled.div<{ $min?: string }>`
  display: grid;
  gap: ${theme.space.md};
  grid-template-columns: repeat(auto-fill, minmax(${({ $min = '240px' }) => $min}, 1fr));
`

export const SectionTitle = styled.h2`
  font-size: 18px;
  margin: ${theme.space.lg} 0 ${theme.space.md};
  color: ${theme.colors.forest};
`
