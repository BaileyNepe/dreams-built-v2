import { useClientsList } from 'api/clients';

import { type Control } from 'react-hook-form';
import { type ControlInputProps } from '../types';

import { GenericSelectRHF } from './SelectRHF';

export const ClientSelectRHF = <TFieldValues extends Record<string, unknown>>(
  props: ControlInputProps<TFieldValues> & {
    control: Control<TFieldValues>;
    className?: string;
  }
) => {
  const { clients } = useClientsList();

  return (
    <GenericSelectRHF
      {...props}
      options={clients ?? []}
      getOptionLabel={(option) => `${option.name}`}
      getOptionValue={(option) => option.id}
      placeholder="Select Client..."
    />
  );
};
