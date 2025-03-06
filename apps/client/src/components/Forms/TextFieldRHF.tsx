import { TextField as TextFieldComponent } from '@mui/material';

import { sentenceCase } from '@dreams-built/shared/src/utils/utils';
import { type ControlInputProps } from './types';
import { getObjectValue } from './utils';

export const TextFieldRHF = <TFieldValues extends Record<string, unknown>>(
  props: ControlInputProps<TFieldValues> & {
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    helperText?: string;
  } & React.ComponentProps<typeof TextFieldComponent>
) => {
  const {
    name: fieldName,
    register,
    validationRules,
    formState: { errors },
    color
  } = props;

  const error = getObjectValue(errors, fieldName) as { message?: string } | undefined;

  return (
    <TextFieldComponent
      {...props}
      fullWidth
      label={props.label ?? sentenceCase(fieldName)}
      color={error ? 'error' : color}
      variant="outlined"
      id={fieldName}
      {...register(fieldName, validationRules)}
      error={!!error}
      helperText={error ? error.message : props.helperText}
    />
  );
};
