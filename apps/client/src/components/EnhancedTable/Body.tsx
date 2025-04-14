import { IconButton, Skeleton, TableCell, TableRow, Tooltip } from '@mui/material';
import Loader from 'components/Loader';
import { MenuPopup } from 'components/MenuPopup';
import { isValidElement, Suspense, type FC } from 'react';
import styled, { css } from 'styled-components';
import { Boolean } from './components/Boolean';
import { type Action, type EnhancedData, type HeadCell } from './types';

const isDate = (value: unknown): value is Date => value instanceof Date;

const StyledRow = styled(TableRow)<{ $hasOnClick: boolean }>`
  cursor: ${({ $hasOnClick }) => ($hasOnClick ? 'pointer' : 'default')};
`;

export const CondensedTableCell = styled(TableCell)<{
  $size?: 'x-small';
  $isHiddenOnPrint?: boolean;
}>`
  && {
    ${({ $size }) =>
      $size === 'x-small'
        ? css`
            padding: 0 0.2rem;
          `
        : ''}

    ${({ $isHiddenOnPrint }) =>
      $isHiddenOnPrint &&
      css`
        @media print {
          display: none;
        }
      `}
  }
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
    // if array of actions is only one element, render it directly
    if (Array.isArray(value) && value.length === 1) {
      const action = value[0] as Action;

      return (
        <Tooltip title={action.label}>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              action.onClick?.();
            }}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      );
    }

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
  size?: 'x-small';
  onRowClick?: (id: string) => void;
  onRowEnter?: (id: string) => void;
  onRowLeave?: () => void;
}> = ({ rows, isLoading, headCells, onRowClick, onRowEnter, onRowLeave, size }) => {
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
            $hasOnClick={!!onRowClick}
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
                    <CondensedTableCell
                      key={`${row.id}_${key}`}
                      $isHiddenOnPrint={key === 'actions'}
                      component="td"
                      id={labelId}
                      $size={size}
                      scope="row"
                      align={headCell.align}
                    >
                      <Cell data={row} rowKey={key} />
                    </CondensedTableCell>
                  );
                })}
            </>
          </StyledRow>
        );
      })}
    </>
  );
};
