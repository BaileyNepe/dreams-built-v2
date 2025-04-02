import { Divider } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { type FC } from 'react';
import styled from 'styled-components';
import { EnhancedBody } from './Body';
import { EnhancedTableHead } from './header';
import { EnhancedTableToolbar, type ToolbarProps } from './toolbar';
import { type EnhancedData, type HeadCell, type Order } from './types';

const Layout = styled.div<{ $hasShadow: boolean }>`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  box-shadow: ${({ $hasShadow, theme }) =>
    $hasShadow ? theme.customShadows.outline : 'none'};
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const TableWrapper = styled.div`
  -webkit-overflow-scrolling: touch;
  overflow-x: auto;
  white-space: nowrap;
  width: 100%;
`;

export const EnhancedTable: FC<{
  toolbar?: ToolbarProps;
  headers: HeadCell[];
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'x-small';
  onRowEnter?: (id: string) => void;
  onRowLeave?: () => void;
  onRowClick?: (id: string) => void;
  pagination?: {
    page: number;
    perPage: number;
    handlePageChange: (page: number) => void;
    handlePerPageChange: (perPage: number) => void;
    total?: number;
  };
  order?: {
    sort: Order;
    sortBy: string;
    // Use any as a generic type is used for a hook that sets the order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOrder: ({ sort, sortBy }: { sort: Order; sortBy: any }) => void;
  };

  rows?: EnhancedData[];
  tableTitle?: string;
  rowsPerPageOptions?: number[];
  hasShadow?: boolean;
}> = ({
  rows = [],
  onRowClick,
  onRowEnter,
  onRowLeave,
  hasShadow = true,
  headers,
  size = 'small',
  isLoading = false,
  rowsPerPageOptions = [25, 50, 100],
  pagination,
  order,
  toolbar
}) => {
  const {
    page = 1,
    perPage = 25,
    handlePageChange = () => {},
    handlePerPageChange = () => {},
    total = 0
  } = pagination || {};
  const { sort, sortBy, setOrder } = order || {
    sort: 'asc',
    sortBy: '',
    setOrder: () => {}
  };

  return (
    <Layout $hasShadow={hasShadow}>
      {toolbar && (
        <>
          <EnhancedTableToolbar {...toolbar} />
          <Divider />
        </>
      )}
      <TableWrapper>
        <TableContainer>
          <Table size={size === 'x-small' ? 'small' : size}>
            <EnhancedTableHead
              order={sort}
              size={size === 'x-small' ? 'x-small' : undefined}
              orderBy={sortBy}
              onRequestSort={(_, property) => {
                const isAsc = sortBy === property && sort === 'asc';
                setOrder({ sort: isAsc ? 'desc' : 'asc', sortBy: property });
              }}
              rowCount={rows.length}
              headCells={headers}
            />
            <TableBody>
              <EnhancedBody
                size={size === 'x-small' ? 'x-small' : undefined}
                isLoading={isLoading}
                rows={rows}
                headCells={headers}
                onRowClick={onRowClick}
                onRowEnter={onRowEnter}
                onRowLeave={onRowLeave}
              />
            </TableBody>
          </Table>
        </TableContainer>

        {pagination && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={total}
            rowsPerPage={perPage}
            page={page - 1}
            onPageChange={(_, pageNumber) => handlePageChange(pageNumber)}
            onRowsPerPageChange={(event) =>
              handlePerPageChange(parseInt(event.target.value, 10))
            }
          />
        )}
      </TableWrapper>
    </Layout>
  );
};
