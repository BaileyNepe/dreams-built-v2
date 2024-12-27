import { sentenceCase } from '@dreams-built/shared/src/utils/utils';
import { TextField, type TextFieldProps } from '@mui/material';
import { type FC } from 'react';

type InputProps = TextFieldProps & {
  name: string;
  error?: boolean;
  hasLabel?: boolean;
};

export const Input: FC<InputProps> = ({
  name,
  label,
  value,
  error,
  hasLabel = true,
  helperText,
  ...props
}) => (
  <TextField
    fullWidth
    error={!!error}
    label={hasLabel ? (label ?? sentenceCase(name)) : undefined}
    helperText={error ? helperText : undefined}
    value={value ?? ''}
    {...props}
  />
);
