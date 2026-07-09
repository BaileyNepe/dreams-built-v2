import { notify } from 'libs/Notify';
import { api } from './trpc';

// --- Connection ---

export const useXeroStatus = () => api.xero.connection.status.useQuery();

export const useXeroConnectMutation = () =>
  api.xero.connection.getConnectUrl.useMutation({
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    }
  });

export const useXeroDisconnectMutation = () => {
  const utils = api.useUtils();

  return api.xero.connection.disconnect.useMutation({
    onSuccess: () => {
      notify('Xero disconnected', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.invalidate();
    }
  });
};

export const useSetDefaultEarningsRateMutation = () => {
  const utils = api.useUtils();

  return api.xero.connection.setDefaultEarningsRate.useMutation({
    onSuccess: () => {
      notify('Default earnings rate saved', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.payroll.getEarningsRates.invalidate();
      utils.xero.timesheets.previewExport.invalidate();
    }
  });
};

// --- Projects ---

export const useXeroProjects = (query?: string, enabled = true) =>
  api.xero.projects.listXero.useQuery({ query }, { enabled, retry: false });

export const useLinkProjectMutation = () => {
  const utils = api.useUtils();

  return api.xero.projects.link.useMutation({
    onSuccess: () => {
      notify('Project linked to Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.projects.invalidate();
      utils.projects.invalidate();
    }
  });
};

export const useUnlinkProjectMutation = () => {
  const utils = api.useUtils();

  return api.xero.projects.unlink.useMutation({
    onSuccess: () => {
      notify('Project unlinked from Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.projects.invalidate();
      utils.projects.invalidate();
    }
  });
};

export const usePushProjectMutation = () => {
  const utils = api.useUtils();

  return api.xero.projects.push.useMutation({
    onSuccess: () => {
      notify('Project pushed to Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.projects.invalidate();
      utils.projects.invalidate();
    }
  });
};

export const useImportProjectMutation = () => {
  const utils = api.useUtils();

  return api.xero.projects.import.useMutation({
    onSuccess: () => {
      notify('Project imported from Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.projects.invalidate();
      utils.projects.invalidate();
    }
  });
};

export const useXeroContacts = (query?: string, enabled = true) =>
  api.xero.projects.listContacts.useQuery({ query }, { enabled, retry: false });

export const useLinkClientContactMutation = () => {
  const utils = api.useUtils();

  return api.xero.projects.linkClientContact.useMutation({
    onSuccess: () => {
      notify('Client mapping saved', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.invalidate();
      utils.clients.invalidate();
    }
  });
};

// --- Payroll ---

export const useXeroEmployees = (enabled = true) =>
  api.xero.payroll.listEmployees.useQuery(undefined, { enabled, retry: false });

export const useLinkEmployeeMutation = () => {
  const utils = api.useUtils();

  return api.xero.payroll.linkEmployee.useMutation({
    onSuccess: () => {
      notify('Employee mapping saved', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.invalidate();
      utils.users.invalidate();
    }
  });
};

export const useLeaveBalances = (xeroEmployeeId: string, enabled = true) =>
  api.xero.payroll.getLeaveBalances.useQuery(
    { xeroEmployeeId },
    { enabled: enabled && Boolean(xeroEmployeeId), retry: false }
  );

export const usePayRuns = (page = 1, enabled = true) =>
  api.xero.payroll.listPayRuns.useQuery({ page }, { enabled, retry: false });

export const usePayRun = (payRunId: string) =>
  api.xero.payroll.getPayRun.useQuery({ payRunId }, { retry: false });

export const usePayslip = (payslipId: string, enabled = true) =>
  api.xero.payroll.getPayslip.useQuery(
    { payslipId },
    { enabled: enabled && Boolean(payslipId), retry: false }
  );

export const useMyPayslips = () =>
  api.xero.payroll.getMyPayslips.useQuery(undefined, { retry: false });

export const useMyLeaveBalances = () =>
  api.xero.payroll.getMyLeaveBalances.useQuery(undefined, { retry: false });

export const useEarningsRates = (enabled = true) =>
  api.xero.payroll.getEarningsRates.useQuery(undefined, { enabled, retry: false });

// --- Timesheets ---

export const useTimesheetExportPreview = (weekStart: string, enabled = true) =>
  api.xero.timesheets.previewExport.useQuery({ weekStart }, { enabled, retry: false });

export const usePushTimesheetsMutation = () => {
  const utils = api.useUtils();

  return api.xero.timesheets.push.useMutation({
    onSuccess: ({ results }) => {
      const succeeded = results.filter((result) => result.ok);
      const failed = results.filter((result) => !result.ok);

      if (succeeded.length > 0) {
        notify(`Pushed ${succeeded.length} timesheet${succeeded.length === 1 ? '' : 's'} to Xero`, {
          type: 'success'
        });
      }

      failed.forEach((result) => {
        notify(`${result.userName}: ${result.error}`, { type: 'error' });
      });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.timesheets.invalidate();
    }
  });
};

export const useApproveTimesheetMutation = () => {
  const utils = api.useUtils();

  return api.xero.timesheets.approve.useMutation({
    onSuccess: () => {
      notify('Timesheet approved in Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.timesheets.invalidate();
    }
  });
};

export const useRevertTimesheetMutation = () => {
  const utils = api.useUtils();

  return api.xero.timesheets.revert.useMutation({
    onSuccess: () => {
      notify('Timesheet draft removed from Xero', { type: 'success' });
    },
    onError: (error) => {
      notify(error.message, { type: 'error' });
    },
    onSettled: () => {
      utils.xero.timesheets.invalidate();
    }
  });
};
