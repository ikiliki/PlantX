import type { MarketNameColumn, MarketNameRow } from '../../../catalog/marketNameMatrix'
import { Code, Scroll, Table } from './MarketNameTable.styles'

function cell(row: MarketNameRow, columnId: string) {
  if (columnId === 'category') return row.category
  if (columnId === 'subcategory') return row.subcategory
  if (columnId === 'name') return row.name
  return row.labels[columnId] ?? '—'
}

export function MarketNameTable({
  columns,
  rows,
  empty,
}: {
  columns: MarketNameColumn[]
  rows: MarketNameRow[]
  empty: string
}) {
  return (
    <Scroll>
      {rows.length === 0 ? (
        <p style={{ margin: 0, padding: 16 }}>{empty}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.id}>
                    {cell(row, column.id)}
                    {column.id === 'name' ? <Code>{row.code}</Code> : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Scroll>
  )
}
