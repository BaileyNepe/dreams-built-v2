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

type FieldErrorType = 'startTime' | 'endTime' | 'projectId';

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

interface FieldError {
  id: string; // which entry
  type: FieldErrorType;
  message: string;
}

interface TimesheetContextValue {
  isLoading: boolean;
  weekStart: string;
  userId: string | undefined;
  entries: Entry[];
  notes: Note[];
  errors: FieldError[];
  isSubmitting: boolean;
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
        if (index === -1) return [...prev, { day, message }];
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

      setErrors((prev) =>
        // Filter out errors for fields that were just changed
        prev.filter((err) => {
          if (err.id !== id) return true;
          // If we updated startTime, remove any 'startTime' errors
          if (startTime !== undefined && err.type === 'startTime') return false;
          // If we updated endTime, remove any 'endTime' errors
          if (endTime !== undefined && err.type === 'endTime') return false;
          // If we updated projectId, remove any 'projectId' errors
          if (projectId !== undefined && err.type === 'projectId') return false;
          return true;
        })
      );
    },
    []
  );

  const {
    user: { permissions }
  } = useAuth();

  const canEditOtherUsers = permissions?.includes(authz.timesheet_view_all);

  const updateUser = useCallback(
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

      // 1) Missing or invalid field formats
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
            message: 'Invalid start time (HH:MM)'
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
            message: 'Invalid end time (HH:MM)'
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

      // Helper to convert HH:MM to minutes since midnight
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      // Group entries by day (only those with valid time format)
      const entriesByDay: Record<string, Entry[]> = {};
      entries.forEach((entry) => {
        if (
          /^\d{2}:\d{2}$/.test(entry.startTime) &&
          /^\d{2}:\d{2}$/.test(entry.endTime)
        ) {
          if (!entriesByDay[entry.day]) {
            entriesByDay[entry.day] = [];
          }
          entriesByDay[entry.day].push(entry);
        }
      });

      // Validate each day's entries
      Object.keys(entriesByDay).forEach((day) => {
        // Sort by start time
        const dayEntries = entriesByDay[day].sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );
        let totalDayMinutes = 0;
        for (let i = 0; i < dayEntries.length; i++) {
          const entry = dayEntries[i];
          const start = timeToMinutes(entry.startTime);
          const end = timeToMinutes(entry.endTime);
          const duration = end - start;

          // Check for valid duration (> 0 and < 24 hours)
          if (duration <= 0) {
            newErrors.push({
              id: entry.id,
              type: 'startTime',
              message: 'Duration must be greater than 0'
            });
          } else if (duration >= 1440) {
            newErrors.push({
              id: entry.id,
              type: 'endTime',
              message: 'Duration must be less than 24 hours'
            });
          }

          totalDayMinutes += duration;

          // Check for overlapping entries
          if (i > 0) {
            const prevEntry = dayEntries[i - 1];
            const prevEnd = timeToMinutes(prevEntry.endTime);
            if (start < prevEnd) {
              newErrors.push({
                id: entry.id,
                type: 'startTime',
                message: 'Entry overlaps with a previous entry'
              });
            }
          }
        }

        // Check if total duration for the day exceeds 24 hours
        if (totalDayMinutes > 1440) {
          dayEntries.forEach((entry) => {
            newErrors.push({
              id: entry.id,
              type: 'startTime',
              message: 'Total duration for the day exceeds 24 hours'
            });
          });
        }
      });

      setErrors(newErrors);

      if (newErrors.length > 0) {
        newErrors.slice(0, 5).forEach((err) => {
          notify(err.message, { type: 'error' });
        });
        return;
      }

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
        isLoading: userEntries.isLoading || userEntries.isPending,
        isSubmitting: updateTimesheet.isPending,
        weekStart,
        userId,
        entries,
        notes,
        errors,
        addEntry,
        deleteEntry,
        updateComment,
        changeDate,
        updateEntry,
        handleSubmit,
        updateUser
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
