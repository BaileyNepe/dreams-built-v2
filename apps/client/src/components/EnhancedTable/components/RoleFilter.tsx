import { roles } from '@dreams-built/shared/src/auth/roles';
import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { type FC } from 'react';

export const RoleFilter: FC<{
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ value, onChange }) => {
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    // e.target.value may be a string or a string array
    const newValue =
      typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    onChange(newValue);
  };

  return (
    <Select multiple value={value} onChange={handleChange}>
      {roles.map((role) => (
        <MenuItem key={role.id} value={role.id}>
          {role.name}
        </MenuItem>
      ))}
    </Select>
  );
};
