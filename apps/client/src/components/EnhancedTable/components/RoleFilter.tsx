import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { type FC } from 'react';

export type RoleFilterProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

const roles = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'User', value: 'USER' }
];

export const RoleFilter: FC<RoleFilterProps> = ({ value, onChange }) => {
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    // e.target.value may be a string or a string array
    const newValue =
      typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
    onChange(newValue);
  };

  return (
    <Select multiple value={value} onChange={handleChange}>
      {roles.map((role) => (
        <MenuItem key={role.value} value={role.value}>
          {role.label}
        </MenuItem>
      ))}
    </Select>
  );
};
