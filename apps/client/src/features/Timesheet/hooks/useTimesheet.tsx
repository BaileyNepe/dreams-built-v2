import { authz } from '@dreams-built/shared/src/auth/permissions';
import { generateCuid } from '@dreams-built/shared/src/utils/utils';
import { useTimesheetEntries, useTimesheetMutation } from 'api/timesheet';
import { notify } from 'libs/Notify';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren
} from 'react';
import { useAuth } from 'utils/contexts/AuthProvider';
import { calculateTimeDifference, getWeekStart } from 'utils/date';

interface Entry {
  id: string;
  day: string;
  weekStart: string;
  projectId: string;
  startTime: string;
  endTime: string;
}

interface Note {
  day: string;
  message: string;
}

// Types for field-level errors
type FieldErrorType = 'startTime' | 'endTime' | 'projectId';

interface FieldError {
  id: string; // The entry id
  type: FieldErrorType;
  message: string;
}

interface TimesheetContextValue {
  isLoading: boolean;
  weekStart: string;
  userId: string | undefined;
  entries: Entry[];
  notes: Note[];
  errors: FieldError[]; // <= Expose errors to the context
  addEntry: (day: string) => void;
  deleteEntry: (id: string) => void;
  updateComment: (comment: { day: string; message: string }) => void;
  changeDate: (date: string) => void;
  updateEntry: (entry: {
    id: string;
    projectId?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  updateUser: (userId?: string) => void;
}

const TimesheetContext = createContext<TimesheetContextValue | undefined>(undefined);

export const TimesheetProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [userId, setUserId] = useState<string>(user.id);

  const updateTimesheet = useTimesheetMutation({ userId, weekStart });
  const userEntries = useTimesheetEntries({ weekStart, userId });

  const [entries, setEntries] = useState<Entry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [errors, setErrors] = useState<FieldError[]>([]);

  useEffect(() => {
    if (userEntries.data && !userEntries.isLoading) {
      setEntries(
        userEntries.data.entries.sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
      setNotes(userEntries.data.notes);
    }
  }, [userEntries.data, userEntries.isLoading]);

  const addEntry = useCallback(
    (day: string) => {
      setEntries((prev) => [
        ...prev,
        {
          id: generateCuid(),
          day,
          weekStart,
          projectId: '',
          startTime: '',
          endTime: ''
        }
      ]);
    },
    [weekStart]
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateComment = useCallback(
    ({ day, message }: { day: string; message: string }) => {
      setNotes((prev) => {
        const index = prev.findIndex((note) => note.day === day);
        if (index === -1) {
          return [...prev, { day, message }];
        }
        return prev.map((note) => (note.day === day ? { day, message } : note));
      });
    },
    []
  );

  const changeDate = useCallback((date: string) => {
    setWeekStart(getWeekStart(date));
  }, []);

  const updateEntry = useCallback(
    ({
      id,
      projectId,
      startTime,
      endTime
    }: {
      id: string;
      projectId?: string | null;
      startTime?: string;
      endTime?: string;
    }) => {
      setEntries((prev) => {
        const index = prev.findIndex((entry) => entry.id === id);
        if (index === -1) return prev;

        return prev.map((entry) => {
          if (entry.id === id) {
            return {
              ...entry,
              projectId: projectId ?? entry.projectId,
              startTime: startTime ?? entry.startTime,
              endTime: endTime ?? entry.endTime
            };
          }
          return entry;
        });
      });
    },
    []
  );

  const {
    user: { permissions }
  } = useAuth();

  const canEditOtherUsers = permissions?.includes(authz.timesheet_view_all);

  const changeUser = useCallback(
    (newUserId?: string) => {
      if (!canEditOtherUsers) {
        notify('You do not have permission to view other users timesheets', {
          type: 'error'
        });
        return;
      }
      setUserId(newUserId ?? user.id);
    },
    [canEditOtherUsers, user.id]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const newErrors: FieldError[] = [];

      // --- Validate each entry ---
      // 1) Missing fields, invalid format
      entries.forEach((entry) => {
        if (!entry.startTime) {
          newErrors.push({
            id: entry.id,
            type: 'startTime',
            message: 'Start time is required'
          });
        } else if (!/^\d{2}:\d{2}$/.test(entry.startTime)) {
          newErrors.push({
            id: entry.id,
            type: 'startTime',
            message: 'Start time must be valid (HH:MM)'
          });
        }

        if (!entry.endTime) {
          newErrors.push({
            id: entry.id,
            type: 'endTime',
            message: 'End time is required'
          });
        } else if (!/^\d{2}:\d{2}$/.test(entry.endTime)) {
          newErrors.push({
            id: entry.id,
            type: 'endTime',
            message: 'End time must be valid (HH:MM)'
          });
        }

        if (!entry.projectId) {
          newErrors.push({
            id: entry.id,
            type: 'projectId',
            message: 'Please select a project'
          });
        }
      });

      // 2) Overlapping times (only compare entries with the same day)
      entries.forEach((entry, i) => {
        const startTime = new Date(`2021-01-01T${entry.startTime}`);
        const endTime = new Date(`2021-01-01T${entry.endTime}`);

        entries.forEach((otherEntry, j) => {
          if (i === j) return; // skip self

          if (entry.day === otherEntry.day) {
            const otherStart = new Date(`2021-01-01T${otherEntry.startTime}`);
            const otherEnd = new Date(`2021-01-01T${otherEntry.endTime}`);

            const overlaps =
              (startTime >= otherStart && startTime < otherEnd) ||
              (endTime > otherStart && endTime <= otherEnd) ||
              (startTime <= otherStart && endTime >= otherEnd);

            if (overlaps) {
              // Instead of pushing multiple error messages for the same entry,
              // you could push a single 'time overlap' error. For demonstration:
              newErrors.push({
                id: entry.id,
                type: 'startTime',
                message: 'Time range overlaps with another entry'
              });
            }
          }
        });
      });

      // 3) Durations (between 1 minute and 24 hours)
      entries.forEach((entry) => {
        const duration = calculateTimeDifference(
          entry.startTime,
          entry.endTime
        ).totalMinutes;
        if (duration < 1 || duration > 24 * 60) {
          newErrors.push({
            id: entry.id,
            type: 'endTime', // or 'startTime' – whichever you prefer to highlight
            message: 'Entry must be between 1 minute and 24 hours'
          });
        }
      });

      // Store errors
      setErrors(newErrors);

      if (newErrors.length > 0) {
        notify('Please fix the highlighted errors before submitting.', { type: 'error' });
        return;
      }

      // If we pass all checks, proceed
      updateTimesheet.mutate({
        userId,
        weekStart,
        entries: entries.map((entry) => ({
          id: entry.id,
          day: entry.day,
          projectId: entry.projectId,
          startTime: entry.startTime,
          endTime: entry.endTime,
          duration: calculateTimeDifference(entry.startTime, entry.endTime).totalMinutes
        })),
        notes
      });
    },
    [entries, notes, updateTimesheet, userId, weekStart]
  );

  return (
    <TimesheetContext.Provider
      value={{
        isLoading: userEntries.isLoading,
        weekStart,
        userId,
        entries,
        notes,
        errors, // <= Make sure to provide errors here
        addEntry,
        deleteEntry,
        updateComment,
        changeDate,
        updateEntry,
        handleSubmit,
        updateUser: changeUser
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
};

export const useTimesheet = () => {
  const context = useContext(TimesheetContext);
  if (context === undefined) {
    throw new Error('useTimesheet must be used within a TimesheetProvider');
  }
  return context;
};
