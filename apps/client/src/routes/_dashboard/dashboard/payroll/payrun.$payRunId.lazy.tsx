import { ChevronLeft } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { usePayRun, usePayslip } from 'api/xero';
import PageLayout from 'layouts/PageLayout';
import { useState, type FC } from 'react';
import { formatDate } from 'utils/date';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';
import { usePayRunParams } from './payrun.$payRunId';

const formatMoney = (value: number | null | undefined) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value)
    : '—';

const formatShortDate = (value: string) =>
  value ? formatDate({ date: new Date(value.slice(0, 10)), format: 'd MMM yyyy' }) : '—';

const PayslipDrawer: FC<{ payslipId: string; onClose: () => void }> = ({
  payslipId,
  onClose
}) => {
  const payslip = usePayslip(payslipId);

  return (
    <Drawer anchor="right" open onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
        {payslip.isLoading && <Skeleton variant="rectangular" height={300} />}
        {payslip.error && <Alert severity="error">{payslip.error.message}</Alert>}
        {payslip.data && (
          <Stack spacing={2}>
            <Typography variant="h6">{payslip.data.employeeName}</Typography>
            <Divider />

            <Stack spacing={1}>
              {payslip.data.earningsLines.map((line, index) => (
                <Stack
                  key={`${line.displayName}-${index}`}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    {line.displayName}
                    {line.numberOfUnits !== null && line.ratePerUnit !== null
                      ? ` (${line.numberOfUnits} × ${formatMoney(line.ratePerUnit)})`
                      : ''}
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(line.amount ?? line.fixedAmount)}
                  </Typography>
                </Stack>
              ))}
              {payslip.data.leaveEarningsLines.map((line, index) => (
                <Stack
                  key={`leave-${line.displayName}-${index}`}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">{line.displayName} (leave)</Typography>
                  <Typography variant="body2">{formatMoney(line.amount)}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Gross earnings</Typography>
                <Typography variant="body2">
                  {formatMoney(payslip.data.grossEarnings)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Tax (PAYE)</Typography>
                <Typography variant="body2">
                  -{formatMoney(payslip.data.totalTax)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Deductions</Typography>
                <Typography variant="body2">
                  -{formatMoney(payslip.data.totalDeductions)}
                </Typography>
              </Stack>
              {payslip.data.totalReimbursements > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Reimbursements</Typography>
                  <Typography variant="body2">
                    {formatMoney(payslip.data.totalReimbursements)}
                  </Typography>
                </Stack>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1">Take-home pay</Typography>
                <Typography variant="subtitle1">
                  {formatMoney(payslip.data.takeHomePay)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

// million-ignore
const Page: FC = () => {
  const { payRunId } = usePayRunParams();
  const navigate = useNavigate();
  const payRun = usePayRun(payRunId);
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);

  return (
    <PageLayout title="Pay Run" description="Payslips for this pay run">
      <Button
        startIcon={<ChevronLeft />}
        onClick={() => navigate({ to: paths.payroll })}
        sx={{ mb: 2 }}
      >
        Back to Payroll
      </Button>

      {payRun.isLoading && <Skeleton variant="rectangular" height={240} />}
      {payRun.error && <Alert severity="error">{payRun.error.message}</Alert>}

      {payRun.data && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">
              {formatShortDate(payRun.data.payRun.periodStartDate)} –{' '}
              {formatShortDate(payRun.data.payRun.periodEndDate)}
            </Typography>
            <Chip
              label={payRun.data.payRun.status}
              size="small"
              color={payRun.data.payRun.status === 'Posted' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="text.secondary">
              Payment date: {formatShortDate(payRun.data.payRun.paymentDate)}
            </Typography>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Gross</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Deductions</TableCell>
                  <TableCell align="right">Take-home</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payRun.data.payslips.map((payslip) => (
                  <TableRow
                    key={payslip.payslipId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPayslipId(payslip.payslipId)}
                  >
                    <TableCell>{payslip.employeeName}</TableCell>
                    <TableCell align="right">
                      {formatMoney(payslip.grossEarnings)}
                    </TableCell>
                    <TableCell align="right">{formatMoney(payslip.totalTax)}</TableCell>
                    <TableCell align="right">
                      {formatMoney(payslip.totalDeductions)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(payslip.takeHomePay)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      )}

      {selectedPayslipId && (
        <PayslipDrawer
          payslipId={selectedPayslipId}
          onClose={() => setSelectedPayslipId(null)}
        />
      )}
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/payroll/payrun/$payRunId')({
  component: Page
});
