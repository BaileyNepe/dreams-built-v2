// material-ui
import { sentenceCase } from '@dreams-built/shared/src/utils/utils';
import {
  Box,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import styled from 'styled-components';

// project imports
import { type FC } from 'react';
import { type HeadCell, type Order } from './types';

const Header = styled(Typography)`
  && {
    color: ${({ theme }) => theme.palette.text.secondary};
    font-weight: bold;
    padding: 0.7rem 0;
  }
`;

export const EnhancedTableHead: FC<{
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string | number;
  rowCount: number;
  headCells: HeadCell[];
}> = ({ order, orderBy, onRequestSort, headCells }) => {
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => {
          const label = headCell.label ?? sentenceCase(headCell.id);
          return (
            <TableCell
              key={headCell.id}
              width={headCell.width}
              align={headCell.align}
              padding="normal"
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  <Header>{label}</Header>
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                <Header>{label}</Header>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
