import { Autocomplete, TextField } from '@mui/material';
import { useUsers } from 'api/user';
import { type FC, memo, useMemo } from 'react';

export const UserSelect: FC<{
  value?: string;
  onChange: (userId: string) => void;
  label?: string;
}> = memo(({ value, onChange, label }) => {
  const { data: users, isLoading } = useUsers();

  // Find duplicate names to handle them specially
  const nameCounts = useMemo(() => {
    if (!users?.length) return new Map();

    const counts = new Map<string, number>();
    users.forEach((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      counts.set(fullName, (counts.get(fullName) || 0) + 1);
    });
    return counts;
  }, [users]);

  if (isLoading || !users?.length) {
    return <TextField label={label} placeholder="Loading..." disabled />;
  }

  return (
    <Autocomplete
      sx={{
        minWidth: 200
      }}
      loading={isLoading}
      options={users ?? []}
      getOptionLabel={(option) => {
        const fullName = `${option.firstName} ${option.lastName}`;

        return nameCounts.get(fullName) > 1
          ? `${fullName} (${option.authId.split('|')[0].slice(0, 6)})`
          : fullName;
      }}
      value={users?.find((user) => user.id === value) ?? null}
      onChange={(_event, newValue) => onChange(newValue?.id ?? '')}
      renderInput={(params) => (
        <TextField placeholder="Select User..." {...params} label={label} />
      )}
      slotProps={{ listbox: { style: { maxHeight: 200, overflow: 'auto' } } }}
    />
  );
});
