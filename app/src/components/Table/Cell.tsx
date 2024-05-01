import { type FC, isValidElement } from 'react'
import { type Row } from './Body'
import { Boolean } from './components/Boolean'

const isDate = (value: unknown): value is Date => value instanceof Date

export const Cell: FC<{ data: Row; rowKey: string }> = ({ rowKey, data }) => {
  const value = data[rowKey]

  if (isValidElement(value)) {
    return value
  }

  if (typeof value === 'boolean') {
    return <Boolean value={value} />
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (isDate(value)) {
    return value.toLocaleDateString()
  }

  return <>{value}</>
}
