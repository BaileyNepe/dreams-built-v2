import { type FC } from 'react'
import { sentenceCase } from 'utils/string'

export type HeadCell = {
  key: string
  label?: string
}

export const TableHead: FC<{ headers: HeadCell[] }> = ({ headers }) => (
  <thead className="bg-gray-50">
    <tr>
      {headers.map((header) => (
        <th
          key={header.key}
          scope="col"
          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
        >
          {header.label || sentenceCase(header.key)}
        </th>
      ))}
    </tr>
  </thead>
)
