import { generateCuid } from '@dreams-built/shared/src/utils/utils';
import { useTimeSheetEntries } from 'api/timesheet';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren
} from 'react';
import { getWeekStart } from 'utils/date';

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

const TimesheetContext = createContext<
  | {
      weekStart: string;
      userId: string | undefined;
      entries: Entry[];
      comments: Note[];
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
  | undefined
>(undefined);

export const TimesheetProvider: FC<PropsWithChildren> = ({ children }) => {
  const [weekStart, setWeekStart] = useState(getWeekStart());

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const userEntries = useTimeSheetEntries({
    weekStart,
    userId
  });

  const [entries, setEntries] = useState<Entry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    setEntries(
      userEntries.entries.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    setNotes(userEntries.notes);
  }, [userEntries]);

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
        return prev.map((note) => {
          if (note.day === day) {
            return { day, message };
          }
          return note;
        });
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
        if (index === -1) {
          return prev;
        }

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

  const updateUser = useCallback((newUserId?: string) => {
    setUserId(newUserId);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 1. Validate the entries
    // 2. Submit the entries
    // 3. feedback to the user
  }, []);

  return (
    <TimesheetContext.Provider
      value={{
        weekStart,
        userId,
        entries,
        comments: notes,
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
