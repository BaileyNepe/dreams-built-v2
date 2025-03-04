import { Autocomplete, TextField } from '@mui/material';
import { type FC, memo } from 'react';

export const UserSelect: FC<{
  value?: string;
  onChange: (projectId: string) => void;
  label?: string;
}> = memo(({ value, onChange, label }) => {
  const users = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Doe' }
  ];

  return (
    <Autocomplete
      sx={{
        minWidth: 200
      }}
      options={users}
      getOptionLabel={(option) => `${option.name}`}
      value={users.find((user) => user.id === value) ?? null}
      onChange={(_event, newValue) => onChange(newValue?.id ?? '')}
      renderInput={(params) => (
        <TextField placeholder="Select User..." {...params} label={label} />
      )}
      slotProps={{ listbox: { style: { maxHeight: 200, overflow: 'auto' } } }}
    />
  );
});
