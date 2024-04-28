import { FC } from 'react'
import { TableBody } from './Body'
import { HeadCell, TableHead } from './Header'

export const Table: FC<{
  rows: {
    id: string
    [key: string]: string | number | boolean | JSX.Element
  }[]
  headers: HeadCell[]
  pagination: {
    page: number
    total: number
    perPage: number
    onChange: (page: number) => void
  }
}> = ({ rows, headers, pagination }) => {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            {/* Table */}
            <table className="min-w-full divide-y divide-gray-300">
              <TableHead headers={headers} />
              <TableBody rows={rows} headers={headers} />
            </table>
            {/* Pagination */}
          </div>
        </div>
      </div>
    </div>
  )
}
