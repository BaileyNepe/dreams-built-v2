import { sentenceCase } from '@dreams-built/shared/src/utils/utils';
import { TextField, type TextFieldProps } from '@mui/material';
import { type FC } from 'react';

type InputProps = TextFieldProps & {
  name: string;
  error?: boolean;
};

export const Input: FC<InputProps> = ({
  name,
  label,
  value,
  error,
  helperText,
  ...props
}) => (
  <TextField
    fullWidth
    error={!!error}
    label={label ?? sentenceCase(name)}
    helperText={error ? helperText : undefined}
    value={value ?? ''}
    {...props}
  />
);
