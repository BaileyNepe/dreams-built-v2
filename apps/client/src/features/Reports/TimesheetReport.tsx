import { type FC } from 'react';
import { useUsersReport } from './hooks/useUserReport';

export const TimesheetReport: FC<{ weekStart: string }> = ({ weekStart }) => {
  const { users, usersWithNoEntries } = useUsersReport(weekStart);
  return (
    <>
      {users.map((user) => (
        <div key={user.userId}>
          <h2>{user.userName}</h2>
          {user.entries.map((entry) => (
            <div key={entry.id}>
              <p>{entry.day}</p>
              <p>
                {entry.startTime} - {entry.endTime}
              </p>
              <p>{entry.duration}</p>
            </div>
          ))}
          {user.notes.map((note) => (
            <div key={note.id}>
              <p>{note.day}</p>
              <p>{note.message}</p>
            </div>
          ))}
        </div>
      ))}
      {users.length === 0 && <p>No users found</p>}
      {usersWithNoEntries.length === 0 && <p>All users have entries</p>}
      {usersWithNoEntries.length > 0 && (
        <div>
          <h2>Users with no entries</h2>
          {usersWithNoEntries.map((user) => (
            <div key={user.id}>
              <p>{user.firstName}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
