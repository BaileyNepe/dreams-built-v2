import { type projectSchema } from '@dreams-built/shared/src/schemas';
import { ClientSelectRHF } from 'components/Forms/Selects/ClientSelect';
import { TextFieldRHF } from 'components/Forms/TextFieldRHF';
import { type FC } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import styled from 'styled-components';
import { type z } from 'zod';

const Grid = styled.div`
  display: grid;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    .address {
      grid-column: span 2;
    }
    .color {
      width: 5rem;
    }
  }

  max-width: 40rem;
`;

export const ProjectFormFields: FC<{
  methods: UseFormReturn<z.infer<typeof projectSchema>>;
}> = ({ methods }) => (
  <Grid>
    <TextFieldRHF name="jobNumber" {...methods} type="number" />
    <TextFieldRHF className="address" name="address" {...methods} />
    <TextFieldRHF name="city" {...methods} />
    <TextFieldRHF name="area" {...methods} type="number" />
    <ClientSelectRHF name="clientId" {...methods} />
    <TextFieldRHF name="endClient" {...methods} />
    <TextFieldRHF className="color" name="color" {...methods} type="color" />
  </Grid>
);
