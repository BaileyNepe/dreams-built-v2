// components/ProjectSelect.tsx
import { Autocomplete, TextField } from '@mui/material';
import { useProjectsLargeList } from 'api/projects';
import { memo, type FC } from 'react';

export const ProjectSelect: FC<{
  value?: string;
  onChange: (projectId: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}> = memo(({ value, onChange, label, error, helperText }) => {
  const { data: projects, isLoading } = useProjectsLargeList();

  return (
    <Autocomplete
      options={projects?.projects ?? []}
      getOptionLabel={(option) => `${option.jobNumber} - ${option.address}`}
      value={projects?.projects.find((proj) => proj.id === value) ?? null}
      onChange={(_event, newValue) => {
        onChange(newValue?.id ?? '');
      }}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          placeholder="Select Project..."
          {...params}
          label={label}
          error={error}
          helperText={helperText}
        />
      )}
      slotProps={{
        listbox: {
          style: { maxHeight: 200, overflow: 'auto' }
        }
      }}
    />
  );
});
