import { Autocomplete, TextField } from '@mui/material';
import { useClientsList } from 'api/clients';

import { sentenceCase } from '@dreams-built/shared/src/utils/utils';

import { type Control, Controller } from 'react-hook-form';
import { type ControlInputProps } from '../types';
import { getObjectValue } from '../utils';

export const ClientSelectRHF = <TFieldValues extends Record<string, unknown>>(
  props: ControlInputProps<TFieldValues> & {
    control: Control<TFieldValues>;
    className?: string;
  }
) => {
  const {
    name: fieldName,
    control,
    formState: { errors },
    validationRules,
    label,

    ...rest
  } = props;

  const { data, isLoading } = useClientsList();
  const clients = data?.clients;

  const error = getObjectValue(errors, fieldName) as { message?: string } | undefined;

  return (
    <Controller
      {...rest}
      name={fieldName}
      control={control}
      rules={validationRules}
      render={({ field }) => (
        <Autocomplete
          {...field}
          value={clients?.find((client) => client.id === field.value)}
          onChange={(_, value) => {
            field.onChange(value?.id ?? null);
          }}
          sx={{
            minWidth: 200
          }}
          loading={isLoading}
          options={clients ?? []}
          getOptionLabel={(option) => `${option.name}`}
          renderInput={(params) => (
            <TextField
              {...params}
              error={!!error}
              helperText={error ? error.message : ''}
              placeholder="Select User..."
              label={label ?? sentenceCase(fieldName)}
            />
          )}
          slotProps={{ listbox: { style: { maxHeight: 200, overflow: 'auto' } } }}
        />
      )}
    />
  );
};
