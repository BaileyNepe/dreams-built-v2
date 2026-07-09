import LinkIcon from '@mui/icons-material/Link';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
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
  TextField,
  Typography
} from '@mui/material';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useClientsList } from 'api/clients';
import {
  useEarningsRates,
  useLinkClientContactMutation,
  useLinkEmployeeMutation,
  useSetDefaultEarningsRateMutation,
  useXeroConnectMutation,
  useXeroContacts,
  useXeroDisconnectMutation,
  useXeroEmployees,
  useXeroStatus
} from 'api/xero';
import PageLayout from 'layouts/PageLayout';
import { notify } from 'libs/Notify';
import { Suspense, useEffect, useState, type FC } from 'react';

const statusChip = (status: string, expiresSoon: boolean) => {
  if (status === 'CONNECTED' && expiresSoon) {
    return <Chip label="Connected — reconnect soon" color="warning" size="small" />;
  }

  switch (status) {
    case 'CONNECTED':
      return <Chip label="Connected" color="success" size="small" />;
    case 'ERROR':
      return <Chip label="Connection expired" color="error" size="small" />;
    default:
      return <Chip label="Not connected" color="default" size="small" />;
  }
};

const ConnectionCard: FC = () => {
  const status = useXeroStatus();
  const connect = useXeroConnectMutation();
  const disconnect = useXeroDisconnectMutation();

  if (status.isLoading || !status.data) {
    return <Skeleton variant="rectangular" height={120} />;
  }

  const { configured, status: connectionStatus, tenantName, expiresSoon } = status.data;
  const isConnected = connectionStatus === 'CONNECTED';

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Xero connection</Typography>
              {statusChip(connectionStatus, expiresSoon)}
            </Stack>
            {isConnected && tenantName ? (
              <Typography variant="body2" color="text.secondary">
                Connected to <strong>{tenantName}</strong>
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {configured
                  ? 'Connect your Xero organisation to sync projects and payroll.'
                  : 'Xero environment variables are not configured on the server.'}
              </Typography>
            )}
            {connectionStatus === 'ERROR' && (
              <Alert severity="error" sx={{ mt: 1 }}>
                The Xero connection has expired or been revoked. Reconnect to resume
                syncing.
              </Alert>
            )}
            {expiresSoon && isConnected && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                The connection has not been used in a while and will expire soon —
                reconnect to refresh it.
              </Alert>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {isConnected && (
              <Button
                variant="outlined"
                color="error"
                disabled={disconnect.isPending}
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  if (window.confirm('Disconnect Xero? Syncing will stop until reconnected.')) {
                    disconnect.mutate();
                  }
                }}
              >
                Disconnect
              </Button>
            )}
            <Button
              variant="contained"
              disabled={!configured || connect.isPending}
              onClick={() => connect.mutate()}
            >
              {isConnected ? 'Reconnect' : 'Connect to Xero'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// million-ignore
const EmployeeMappingTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const employees = useXeroEmployees(isConnected);
  const linkEmployee = useLinkEmployeeMutation();

  if (!isConnected) {
    return <Alert severity="info">Connect Xero to map employees.</Alert>;
  }

  if (employees.isLoading) return <Skeleton variant="rectangular" height={240} />;

  if (employees.error) {
    return <Alert severity="error">{employees.error.message}</Alert>;
  }

  const users = employees.data?.users ?? [];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link each Xero payroll employee to their app user. Linked users see their own
        payslips and leave on the My Pay page, and their timesheets can be exported to
        Xero.
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Xero employee</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Linked app user</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {(employees.data?.employees ?? []).map((employee) => (
            <TableRow key={employee.xeroEmployeeId}>
              <TableCell>
                {employee.firstName} {employee.lastName}
                {employee.endDate && (
                  <Chip label="Ended" size="small" sx={{ ml: 1 }} color="default" />
                )}
              </TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell sx={{ minWidth: 220 }}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={employee.linkedUserId ?? ''}
                    displayEmpty
                    disabled={linkEmployee.isPending}
                    onChange={(event) => {
                      const userId = event.target.value;

                      if (userId) {
                        linkEmployee.mutate({
                          userId,
                          xeroEmployeeId: employee.xeroEmployeeId
                        });
                      } else if (employee.linkedUserId) {
                        linkEmployee.mutate({
                          userId: employee.linkedUserId,
                          xeroEmployeeId: null
                        });
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Not linked</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem
                        key={user.id}
                        value={user.id}
                        disabled={user.linked && user.id !== employee.linkedUserId}
                      >
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                {!employee.linkedUserId && employee.suggestedUserId && (
                  <Button
                    size="small"
                    startIcon={<LinkIcon />}
                    disabled={linkEmployee.isPending}
                    onClick={() =>
                      linkEmployee.mutate({
                        userId: employee.suggestedUserId as string,
                        xeroEmployeeId: employee.xeroEmployeeId
                      })
                    }
                  >
                    Link {employee.suggestedUserName}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// million-ignore
const ClientMappingContent: FC = () => {
  const clients = useClientsList();
  const contacts = useXeroContacts();
  const linkContact = useLinkClientContactMutation();

  if (contacts.isLoading) return <Skeleton variant="rectangular" height={240} />;

  if (contacts.error) {
    return <Alert severity="error">{contacts.error.message}</Alert>;
  }

  const contactOptions = contacts.data?.contacts ?? [];

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Map app clients to Xero contacts. Pushed projects are created against the
        client&apos;s Xero contact; unmapped clients get a contact created automatically
        on first push.
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Client</TableCell>
            <TableCell sx={{ minWidth: 280 }}>Xero contact</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>
                <Autocomplete
                  size="small"
                  options={contactOptions}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={
                    contactOptions.find((contact) => contact.id === client.xeroContactId) ??
                    null
                  }
                  disabled={linkContact.isPending}
                  onChange={(_event, value) =>
                    linkContact.mutate({
                      clientId: client.id,
                      xeroContactId: value?.id ?? null
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Not linked" />
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const ClientMappingTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  if (!isConnected) {
    return <Alert severity="info">Connect Xero to map clients.</Alert>;
  }

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={240} />}>
      <ClientMappingContent />
    </Suspense>
  );
};

const DefaultsTab: FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const earningsRates = useEarningsRates(isConnected);
  const setDefault = useSetDefaultEarningsRateMutation();
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (earningsRates.data) {
      setSelected(earningsRates.data.defaultEarningsRateId);
    }
  }, [earningsRates.data]);

  if (!isConnected) {
    return <Alert severity="info">Connect Xero to configure defaults.</Alert>;
  }

  if (earningsRates.isLoading) return <Skeleton variant="rectangular" height={120} />;

  if (earningsRates.error) {
    return <Alert severity="error">{earningsRates.error.message}</Alert>;
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 480 }}>
      <Typography variant="body2" color="text.secondary">
        Timesheet hours are pushed to Xero against this earnings rate unless overridden
        at export time.
      </Typography>
      <FormControl size="small" fullWidth>
        <InputLabel id="default-earnings-rate">Default earnings rate</InputLabel>
        <Select
          labelId="default-earnings-rate"
          label="Default earnings rate"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {(earningsRates.data?.earningsRates ?? []).map((rate) => (
            <MenuItem key={rate.id} value={rate.id}>
              {rate.name} ({rate.typeOfUnits})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Button
          variant="contained"
          disabled={!selected || setDefault.isPending}
          onClick={() => setDefault.mutate({ earningsRateId: selected })}
        >
          Save default
        </Button>
      </Box>
    </Stack>
  );
};

const Page: FC = () => {
  const status = useXeroStatus();
  const [tab, setTab] = useState(0);

  // The OAuth callback redirects back here with ?connected=1 or ?error=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const connected = params.get('connected');

    if (error) {
      notify(error, { type: 'error' });
    } else if (connected) {
      notify('Xero connected successfully', { type: 'success' });
    }

    if (error || connected) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const isConnected = status.data?.status === 'CONNECTED';

  return (
    <PageLayout
      title="Xero"
      description="Manage the Xero connection, employee and client mappings, and payroll defaults"
    >
      <Stack spacing={3}>
        <ConnectionCard />

        <Card variant="outlined">
          <CardContent>
            <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
              <Tab label="Employees" />
              <Tab label="Clients" />
              <Tab label="Defaults" />
            </Tabs>

            {status.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {tab === 0 && <EmployeeMappingTab isConnected={isConnected} />}
                {tab === 1 && <ClientMappingTab isConnected={isConnected} />}
                {tab === 2 && <DefaultsTab isConnected={isConnected} />}
              </>
            )}
          </CardContent>
        </Card>
      </Stack>
    </PageLayout>
  );
};

export const Route = createLazyFileRoute('/_dashboard/dashboard/settings/xero')({
  component: Page
});
