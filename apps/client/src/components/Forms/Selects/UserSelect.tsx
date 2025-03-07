import { Autocomplete, TextField } from '@mui/material';
import { useUsers } from 'api/user';
import { type FC, memo } from 'react';

export const UserSelect: FC<{
  value?: string;
  onChange: (projectId: string) => void;
  label?: string;
}> = memo(({ value, onChange, label }) => {
  const { data: users, isLoading } = useUsers();

  return (
    <Autocomplete
      sx={{
        minWidth: 200
      }}
      loading={isLoading}
      options={users ?? []}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
      value={users?.find((user) => user.id === value) ?? null}
      onChange={(_event, newValue) => onChange(newValue?.id ?? '')}
      renderInput={(params) => (
        <TextField placeholder="Select User..." {...params} label={label} />
      )}
      slotProps={{ listbox: { style: { maxHeight: 200, overflow: 'auto' } } }}
    />
  );
});
