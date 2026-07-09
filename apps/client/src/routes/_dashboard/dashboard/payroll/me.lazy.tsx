import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Grid,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useMyLeaveBalances, useMyPayslips, usePayslip } from 'api/xero';
import PageLayout from 'layouts/PageLayout';
import { useState, type FC } from 'react';
import { formatDate } from 'utils/date';

const formatMoney = (value: number | null | undefined) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value)
    : '—';

const formatShortDate = (value: string) =>
  value ? formatDate({ date: new Date(value.slice(0, 10)), format: 'd MMM yyyy' }) : '—';

const MyPayslipDrawer: FC<{ payslipId: string; onClose: () => void }> = ({
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
            <Typography variant="h6">Payslip</Typography>
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

const Page: FC = () => {
  const payslips = useMyPayslips();
  const leave = useMyLeaveBalances();
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);

  const isUnlinked = payslips.data?.unlinked || leave.data?.unlinked;

  return (
    <PageLayout title="My Pay" description="Your recent payslips and leave balances">
      {isUnlinked && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your account is not linked to a Xero payroll employee yet. Ask an admin to link
          you under Settings → Xero.
        </Alert>
      )}

      {(payslips.error ?? leave.error) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {(payslips.error ?? leave.error)?.message}
        </Alert>
      )}

      {!isUnlinked && !payslips.error && (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Leave balances
            </Typography>
            {leave.isLoading ? (
              <Skeleton variant="rectangular" height={48} />
            ) : (
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {(leave.data?.balances ?? []).map((balance) => (
                  <Chip
                    key={balance.leaveTypeId}
                    label={`${balance.name}: ${balance.balance} ${balance.typeOfUnits.toLowerCase()}`}
                    variant="outlined"
                    color="primary"
                  />
                ))}
                {leave.data?.balances.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No leave balances recorded.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Recent payslips
            </Typography>
            {payslips.isLoading ? (
              <Skeleton variant="rectangular" height={160} />
            ) : (
              <Grid container spacing={2}>
                {(payslips.data?.payslips ?? []).map((payslip) => (
                  <Grid item xs={12} sm={6} md={4} key={payslip.payslipId}>
                    <Card variant="outlined">
                      <CardActionArea
                        onClick={() => setSelectedPayslipId(payslip.payslipId)}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">
                            {formatShortDate(payslip.periodStartDate)} –{' '}
                            {formatShortDate(payslip.periodEndDate)}
                          </Typography>
                          <Typography variant="h6">
                            {formatMoney(payslip.takeHomePay)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Gross {formatMoney(payslip.grossEarnings)} · Paid{' '}
                            {formatShortDate(payslip.paymentDate)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
                {payslips.data?.payslips.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No payslips found in recent pay runs.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Stack>
      )}

      {selectedPayslipId && (
        <MyPayslipDrawer
          payslipId={selectedPayslipId}
          onClose={() => setSelectedPayslipId(null)}
        />
      )}
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/payroll/me')({
  component: Page
});
