import { authz } from '@dreams-built/shared/src/auth/permissions';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import {
  useApproveTimesheetMutation,
  useLeaveBalances,
  usePayRuns,
  usePushTimesheetsMutation,
  useRevertTimesheetMutation,
  useTimesheetExportPreview,
  useXeroEmployees,
  useXeroStatus
} from 'api/xero';
import { DateSelector } from 'components/DateSelector';
import PageLayout from 'layouts/PageLayout';
import { Fragment, useEffect, useMemo, useState, type FC } from 'react';
import { useAuth } from 'utils/contexts/AuthProvider';
import { formatDate, getDate, getWeekStart } from 'utils/date';
import { useNavigate } from 'utils/hooks/useNavigate';
import { paths } from 'utils/paths';

const formatMoney = (value: number | null | undefined) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value)
    : '—';

const formatShortDate = (value: string) =>
  value ? formatDate({ date: new Date(value.slice(0, 10)), format: 'd MMM yyyy' }) : '—';

const payRunStatusChip = (status: string) => (
  <Chip
    label={status || 'Unknown'}
    size="small"
    color={status === 'Posted' ? 'success' : 'warning'}
  />
);

// million-ignore
const PayRunsTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const payRuns = usePayRuns(page, isConnected);

  if (!isConnected) {
    return <Alert severity="info">Connect Xero in Settings to see pay runs.</Alert>;
  }

  if (payRuns.isLoading) return <Skeleton variant="rectangular" height={240} />;

  if (payRuns.error) return <Alert severity="error">{payRuns.error.message}</Alert>;

  const rows = payRuns.data?.payRuns ?? [];
  const pageCount = payRuns.data?.pageCount ?? 1;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            <TableCell>Payment date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Total pay</TableCell>
            <TableCell align="right">Total cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No pay runs found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {rows.map((payRun) => (
            <TableRow
              key={payRun.payRunId}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() =>
                navigate({
                  to: paths.payrollPayRun,
                  params: { payRunId: payRun.payRunId }
                })
              }
            >
              <TableCell>
                {formatShortDate(payRun.periodStartDate)} –{' '}
                {formatShortDate(payRun.periodEndDate)}
              </TableCell>
              <TableCell>{formatShortDate(payRun.paymentDate)}</TableCell>
              <TableCell>{payRunStatusChip(payRun.status)}</TableCell>
              <TableCell align="right">{formatMoney(payRun.totalPay)}</TableCell>
              <TableCell align="right">{formatMoney(payRun.totalCost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pageCount > 1 && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {page} of {pageCount}
          </Typography>
          <Button
            size="small"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  );
};

const LeaveBalancesRow: FC<{ xeroEmployeeId: string }> = ({ xeroEmployeeId }) => {
  const balances = useLeaveBalances(xeroEmployeeId);

  if (balances.isLoading) return <Skeleton variant="rectangular" height={60} />;

  if (balances.error) return <Alert severity="error">{balances.error.message}</Alert>;

  const rows = balances.data?.balances ?? [];

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No leave balances recorded in Xero.
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {rows.map((balance) => (
        <Chip
          key={balance.leaveTypeId}
          label={`${balance.name}: ${balance.balance} ${balance.typeOfUnits.toLowerCase()}`}
          variant="outlined"
        />
      ))}
    </Stack>
  );
};

// million-ignore
const EmployeesTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const employees = useXeroEmployees(isConnected);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!isConnected) {
    return <Alert severity="info">Connect Xero in Settings to see employees.</Alert>;
  }

  if (employees.isLoading) return <Skeleton variant="rectangular" height={240} />;

  if (employees.error) return <Alert severity="error">{employees.error.message}</Alert>;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Employee</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Job title</TableCell>
            <TableCell>Linked user</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(employees.data?.employees ?? []).map((employee) => (
            <Fragment key={employee.xeroEmployeeId}>
              <TableRow hover>
                <TableCell sx={{ width: 40 }}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev === employee.xeroEmployeeId ? null : employee.xeroEmployeeId
                      )
                    }
                  >
                    {expanded === employee.xeroEmployeeId ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.jobTitle || '—'}</TableCell>
                <TableCell>
                  {employee.linkedUserName ?? (
                    <Typography variant="body2" color="text.secondary">
                      Not linked
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
                  <Collapse in={expanded === employee.xeroEmployeeId} unmountOnExit>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Leave balances
                      </Typography>
                      <LeaveBalancesRow xeroEmployeeId={employee.xeroEmployeeId} />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const exportStatusChip = (status: string) => {
  switch (status) {
    case 'PUSHED':
      return <Chip label="Pushed (draft)" size="small" color="info" />;
    case 'APPROVED':
      return <Chip label="Approved" size="small" color="success" />;
    case 'REVERSED':
      return <Chip label="Reverted" size="small" color="default" />;
    case 'FAILED':
      return <Chip label="Failed" size="small" color="error" />;
    default:
      return null;
  }
};

// million-ignore
const TimesheetExportTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const [currentWeek, setCurrentWeek] = useState(getDate(getWeekStart()));
  const weekStart = formatDate({ date: currentWeek });
  const preview = useTimesheetExportPreview(weekStart, isConnected);
  const push = usePushTimesheetsMutation();
  const approve = useApproveTimesheetMutation();
  const revert = useRevertTimesheetMutation();

  const [selected, setSelected] = useState<string[]>([]);
  const [earningsRateId, setEarningsRateId] = useState('');

  useEffect(() => {
    setSelected([]);
  }, [weekStart]);

  useEffect(() => {
    if (preview.data && !earningsRateId) {
      setEarningsRateId(preview.data.defaultEarningsRateId);
    }
  }, [preview.data, earningsRateId]);

  const exportableUserIds = useMemo(
    () =>
      (preview.data?.rows ?? [])
        .filter((row) => row.blockers.length === 0)
        .map((row) => row.userId),
    [preview.data]
  );

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <DateSelector
          value={currentWeek}
          defaultValue={currentWeek}
          onChange={(date: string) => setCurrentWeek(getDate(getWeekStart(date)))}
          getNextPeriod={() => setCurrentWeek((prev) => prev.plus({ weeks: 1 }))}
          getPreviousPeriod={() => setCurrentWeek((prev) => prev.minus({ weeks: 1 }))}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="earnings-rate-select">Earnings rate</InputLabel>
            <Select
              labelId="earnings-rate-select"
              label="Earnings rate"
              value={earningsRateId}
              onChange={(event) => setEarningsRateId(event.target.value)}
            >
              {(preview.data?.earningsRates ?? []).map((rate) => (
                <MenuItem key={rate.id} value={rate.id}>
                  {rate.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            disabled={selected.length === 0 || !earningsRateId || push.isPending}
            onClick={() =>
              push.mutate(
                { weekStart, userIds: selected, earningsRateId },
                { onSuccess: () => setSelected([]) }
              )
            }
          >
            Push {selected.length > 0 ? `${selected.length} ` : ''}to Xero
          </Button>
        </Stack>
      </Stack>

      {!isConnected && (
        <Alert severity="info">Connect Xero in Settings to export timesheets.</Alert>
      )}

      {isConnected && preview.isLoading && <Skeleton variant="rectangular" height={240} />}

      {isConnected && preview.error && (
        <Alert severity="error">{preview.error.message}</Alert>
      )}

      {isConnected && preview.data && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      exportableUserIds.length > 0 &&
                      selected.length === exportableUserIds.length
                    }
                    indeterminate={
                      selected.length > 0 && selected.length < exportableUserIds.length
                    }
                    onChange={(event) =>
                      setSelected(event.target.checked ? exportableUserIds : [])
                    }
                  />
                </TableCell>
                <TableCell>Employee</TableCell>
                {days.map((day) => (
                  <TableCell key={day} align="right">
                    {day.slice(0, 3)}
                  </TableCell>
                ))}
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.data.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No timesheet entries for this week.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {preview.data.rows.map((row) => {
                const isExportable = row.blockers.length === 0;
                const isSelected = selected.includes(row.userId);

                return (
                  <TableRow key={row.userId} hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        disabled={!isExportable}
                        onChange={(event) =>
                          setSelected((prev) =>
                            event.target.checked
                              ? [...prev, row.userId]
                              : prev.filter((id) => id !== row.userId)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{row.userName}</span>
                        {row.blockers.map((blocker) => (
                          <Tooltip key={blocker} title={blocker}>
                            <Chip label="!" size="small" color="warning" />
                          </Tooltip>
                        ))}
                      </Stack>
                      {row.blockers.length > 0 && (
                        <Typography variant="caption" color="warning.main">
                          {row.blockers.join('; ')}
                        </Typography>
                      )}
                    </TableCell>
                    {days.map((day) => (
                      <TableCell key={day} align="right">
                        {row.hoursByDay[day] ?? ''}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <strong>{row.totalHours}</strong>
                    </TableCell>
                    <TableCell>
                      {row.existingExport ? (
                        <Tooltip title={row.existingExport.error || ''}>
                          <span>{exportStatusChip(row.existingExport.status)}</span>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {row.existingExport?.status === 'PUSHED' && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            disabled={approve.isPending}
                            onClick={() =>
                              approve.mutate({ exportId: row.existingExport!.id })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={revert.isPending}
                            onClick={() =>
                              revert.mutate({ exportId: row.existingExport!.id })
                            }
                          >
                            Revert
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
};

const Page: FC = () => {
  const { user } = useAuth();
  const status = useXeroStatus();
  const [tab, setTab] = useState(0);

  const isConnected = status.data?.status === 'CONNECTED';
  const canManagePayroll = user.permissions?.includes(authz.payroll_manage) ?? false;

  return (
    <PageLayout
      title="Payroll"
      description="Pay runs, employees and leave balances from Xero, and timesheet export"
    >
      {status.data && !isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Xero is not connected
          {status.data.status === 'ERROR' ? ' (the connection has expired)' : ''}. An
          admin can connect it under Settings → Xero.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Pay Runs" />
        <Tab label="Employees & Leave" />
        {canManagePayroll && <Tab label="Timesheet Export" />}
      </Tabs>

      {tab === 0 && <PayRunsTab isConnected={isConnected} />}
      {tab === 1 && <EmployeesTab isConnected={isConnected} />}
      {tab === 2 && canManagePayroll && <TimesheetExportTab isConnected={isConnected} />}
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/payroll/')({
  component: Page
});
