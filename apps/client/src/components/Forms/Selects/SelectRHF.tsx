import { sentenceCase } from '@dreams-built/shared/src/utils/utils';
import { Autocomplete, TextField as TextFieldComponent } from '@mui/material';
import { type Control, Controller } from 'react-hook-form';
import { type ControlInputProps } from '../types';
import { getObjectValue } from '../utils';

interface GenericSelectRHFProps<T, TFieldValues extends Record<string, unknown>>
  extends ControlInputProps<TFieldValues> {
  control: Control<TFieldValues>;
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  placeholder?: string;
  label?: string;
  className?: string;
  loading?: boolean;
}

export const GenericSelectRHF = <T, TFieldValues extends Record<string, unknown>>(
  props: GenericSelectRHFProps<T, TFieldValues>
) => {
  const {
    name: fieldName,
    control,
    formState: { errors },
    validationRules,
    label,
    options,
    getOptionLabel,
    getOptionValue,
    placeholder,
    className,
    ...rest
  } = props;

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
          value={options.find((option) => getOptionValue(option) === field.value) ?? null}
          onChange={(_, value) => {
            field.onChange(value ? getOptionValue(value) : null);
          }}
          sx={{ minWidth: 200 }}
          options={options}
          getOptionLabel={getOptionLabel}
          renderInput={(params) => (
            <TextFieldComponent
              {...params}
              error={!!error}
              helperText={error ? error.message : ''}
              placeholder={placeholder ?? 'Select...'}
              label={label ?? sentenceCase(fieldName)}
            />
          )}
          slotProps={{ listbox: { style: { maxHeight: 200, overflow: 'auto' } } }}
          className={className}
        />
      )}
    />
  );
};
