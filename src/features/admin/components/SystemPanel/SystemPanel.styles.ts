import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Shell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 36px;
`

export const Section = styled.section`
  container-type: inline-size;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 28px;
  }
`

export const Block = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 18px;
`

export const Head = styled.h2`
  margin: 0;
`

export const HeadToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 52px;
  padding: 0 2px 16px;
  border: 0;
  border-bottom: 1px solid ${theme.colors.border};
  border-radius: 0;
  background: transparent;
  color: ${theme.colors.forest};
  font-family: ${theme.fonts.display};
  font-size: 22px;
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.2;
  text-align: start;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${theme.colors.forestSoft};
  }

  &:disabled {
    cursor: progress;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Chevron = styled.span<{ $open: boolean }>`
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-bottom: 3px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(${({ $open }) => ($open ? '-135deg' : '45deg')});
  transition: transform ${theme.motion.fast} ${theme.motion.ease};
`

export const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Groups = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 18px;
`

export const Group = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 16px;
  padding: 18px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};

  @container (max-width: 480px) {
    padding: 12px;
  }
`

export const GroupToggle = styled.button<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${({ $open }) => ($open ? theme.colors.forest : theme.colors.border)};
  background: ${({ $open }) => ($open ? theme.colors.chipGreen : theme.colors.creamCard)};
  color: ${theme.colors.forest};
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  text-align: start;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${theme.colors.chipGreen};
  }

  &:disabled {
    cursor: progress;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Count = styled.span`
  margin-inline-start: auto;
  font-family: ${theme.fonts.body};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.moss};
`

export const Items = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 22px;
`

export const Nest = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 16px;
`

export const Item = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 14px;
`

export const ItemHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 20px;
`

export const PreviewWell = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 14px;
  padding: 20px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.creamCard};

  @container (max-width: 480px) {
    padding: 12px;
  }
`

export const PageHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`

export const FeatureToggle = styled(GroupToggle)`
  flex: 1 1 220px;
`

export const PageToggle = styled(GroupToggle)`
  flex: 1 1 220px;
  min-height: 56px;
  padding: 14px 18px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  border-color: ${({ $open }) => ($open ? theme.colors.moss : theme.colors.border)};
  font-weight: 600;

  &:hover:not(:disabled) {
    background: ${theme.colors.cream};
  }

  & > span:last-child {
    margin-inline-start: auto;
  }
`

export const FeatureBody = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 22px;
  margin-inline-start: 8px;
  padding-inline-start: 18px;
  border-inline-start: 2px solid ${theme.colors.border};

  @container (max-width: 480px) {
    margin-inline-start: 0;
    padding-inline-start: 10px;
  }
`

export const PageBand = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 12px;
`

export const PageMark = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const ComponentStack = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 18px;
  margin-inline-start: 14px;
  padding-inline-start: 14px;
  border-inline-start: 2px solid ${theme.colors.chipGreen};

  @container (max-width: 480px) {
    margin-inline-start: 0;
    padding-inline-start: 10px;
  }
`

export const Folder = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  gap: 14px;
  margin-inline-start: 14px;

  @container (max-width: 480px) {
    margin-inline-start: 0;
  }
`

export const FolderToggle = styled(GroupToggle)`
  min-height: 40px;
  padding: 8px 12px;
  border-style: dashed;
  background: transparent;
  font-size: 13px;
  font-weight: 700;

  &:hover {
    background: ${theme.colors.creamCard};
  }
`

export const PreviewLabel = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 12px 10px;
    text-align: start;
    border-bottom: 1px solid ${theme.colors.border};
    vertical-align: middle;
  }

  th {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: ${theme.type.labelTracking};
    text-transform: ${theme.type.labelCase};
    color: ${theme.colors.moss};
  }

  tr:last-child td {
    border-bottom: 0;
  }
`

export const Path = styled.span`
  unicode-bidi: isolate;
`

export const NameCell = styled.div`
  display: grid;
  gap: 2px;

  strong {
    font-weight: 700;
    color: ${theme.colors.ink};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`

export const Ok = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 4px 14px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.moss};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
`

export const Select = styled.select`
  appearance: none;
  min-width: min(160px, 100%);
  max-width: 100%;
  min-height: 36px;
  padding: 6px 28px 6px 12px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  background:
    linear-gradient(45deg, transparent 50%, ${theme.colors.moss} 50%) calc(100% - 14px) / 5px 5px no-repeat,
    linear-gradient(135deg, ${theme.colors.moss} 50%, transparent 50%) calc(100% - 9px) / 5px 5px no-repeat,
    ${theme.colors.cream};
  color: ${theme.colors.ink};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`
