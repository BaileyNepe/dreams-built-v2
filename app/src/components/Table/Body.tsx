import { FC } from 'react'
import { Cell } from './Cell'
import { HeadCell } from './Header'

export type Row = {
  id: string
  [key: string]: string | number | boolean | JSX.Element
}

export const TableBody: FC<{ rows: Row[]; headers: HeadCell[] }> = ({
  rows,
  headers,
}) => {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {rows.map((row) => (
        <tr key={row.id}>
          {Object.keys(row)
            .filter((key) => key !== 'id')
            .sort((a, b) => {
              const aIndex = headers.findIndex((cell) => cell.key === a)
              const bIndex = headers.findIndex((cell) => cell.key === b)

              return aIndex - bIndex
            })
            .map((key) => {
              return (
                <td
                  className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                  key={`${row.id}-${key}`}
                >
                  <Cell data={row} rowKey={key} />
                </td>
              )
            })}
        </tr>
      ))}
    </tbody>
  )
}
