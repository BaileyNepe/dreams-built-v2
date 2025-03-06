import {
  type FieldErrors,
  type Path,
  type RegisterOptions,
  type UseFormRegister
} from 'react-hook-form';

export interface ControlInputProps<TFieldValues extends Record<string, unknown>> {
  label?: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  validationRules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  formState: { errors: FieldErrors<TFieldValues> };
}
