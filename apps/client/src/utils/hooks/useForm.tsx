import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  useFieldArray as useReactHookFormFieldArray,
  type ArrayPath,
  type Control,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn
} from 'react-hook-form';
import { type ZodType } from 'zod';

interface UseCustomFormProps<T extends FieldValues> {
  defaultValues: DefaultValues<T>;
  schema?: ZodType<T>;
}

export const useFieldArray = <TFieldValues extends FieldValues>({
  control,
  fieldName
}: {
  control: Control<TFieldValues>;
  fieldName: string;
}) =>
  useReactHookFormFieldArray<TFieldValues>({
    control,
    // TODO: improve this type
    name: fieldName as ArrayPath<TFieldValues>
  });

export const useCustomForm = <T extends FieldValues>({
  defaultValues,
  schema
}: UseCustomFormProps<T>): UseFormReturn<T> =>
  useForm<T>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined
  });
