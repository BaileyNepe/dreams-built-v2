import { Skeleton, TableCell, TableRow } from '@mui/material';
import Loader from 'components/Loader';
import { MenuPopup } from 'components/MenuPopup';
import { isValidElement, Suspense, type FC } from 'react';
import styled from 'styled-components';
import { Boolean } from './components/Boolean';
import { type EnhancedData, type HeadCell } from './types';

const isDate = (value: unknown): value is Date => value instanceof Date;

const StyledRow = styled(TableRow)<{ $hasOnClick: boolean }>`
  cursor: ${({ $hasOnClick }) => ($hasOnClick ? 'pointer' : 'default')};
`;

const Cell: FC<{ data: EnhancedData; rowKey: string }> = ({ rowKey, data }) => {
  const value = data[rowKey];

  if (isValidElement(value)) {
    return value;
  }

  if (typeof value === 'boolean') {
    return <Boolean value={value} />;
  }

  if (rowKey === 'actions') {
    return (
      <Suspense fallback={<Loader />}>
        <MenuPopup actions={data[rowKey]} />
      </Suspense>
    );
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (isDate(value)) {
    return value.toLocaleDateString();
  }

  return <>{value}</>;
};

export const EnhancedBody: FC<{
  isLoading?: boolean;
  rows: EnhancedData[];
  headCells: HeadCell[];
  onRowClick?: (id: string) => void;
  onRowEnter?: (id: string) => void;
  onRowLeave?: () => void;
}> = ({ rows, isLoading, headCells, onRowClick, onRowEnter, onRowLeave }) => {
  if (isLoading) {
    return Array.from({ length: 3 }).map((_, index) => (
      <StyledRow key={index} $hasOnClick={!!onRowClick}>
        <TableCell colSpan={headCells.length}>
          <Skeleton variant="rectangular" height={30} />
        </TableCell>
      </StyledRow>
    ));
  }

  return (
    <>
      {rows.map((row, index) => {
        const labelId = `enhanced-table-${index}`;

        return (
          <StyledRow
            hover
            $hasOnClick={false}
            key={row.id}
            onClick={() => {
              onRowClick?.(row.id);
            }}
            onMouseEnter={onRowEnter ? () => onRowEnter?.(row.id) : undefined}
            onMouseLeave={onRowLeave}
          >
            <>
              {Object.keys(row)
                .filter((key) => key !== 'id')

                // the rows should be sorted by the headCells
                .sort((a, b) => {
                  const aIndex = headCells.findIndex((cell) => cell.id === a);
                  const bIndex = headCells.findIndex((cell) => cell.id === b);

                  return aIndex - bIndex;
                })
                .map((key) => {
                  const headCell = headCells.find((cell) => cell.id === key);
                  if (!headCell) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={`${row.id}_${key}`}
                      component="td"
                      id={labelId}
                      scope="row"
                      align={headCell.align}
                    >
                      <Cell data={row} rowKey={key} />
                    </TableCell>
                  );
                })}
            </>
          </StyledRow>
        );
      })}
    </>
  );
};
