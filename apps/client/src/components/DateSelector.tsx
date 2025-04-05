import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import styled from 'styled-components';

const DateSelectors = styled.div`
  align-items: center;
  display: flex;
  gap: 0.2rem;
  justify-content: center;

  .MuiStack-root {
    padding: 0;
  }
`;

export const DateSelector: FC<{
  value?: DateTime;
  defaultValue: DateTime;
  onChange: (value: string) => void;
  minDate?: DateTime;
  maxDate?: DateTime;
  getPreviousPeriod: () => void;
  getNextPeriod: () => void;
}> = ({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  getNextPeriod,
  getPreviousPeriod
}) => (
  <DateSelectors>
    <IconButton onClick={getPreviousPeriod}>
      <ChevronLeftIcon />
    </IconButton>
    <BasicDatePicker
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
    />
    <IconButton onClick={getNextPeriod}>
      <ChevronRightIcon />
    </IconButton>
  </DateSelectors>
);
