import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type FC } from 'react';
import { formatDate, getLuxonDate } from 'utils/date';

export const BasicDatePicker: FC<{
  onChange: (value: string) => void;
  value: string;
}> = ({ value, onChange }) => (
  <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-NZ">
    <DemoContainer components={['DatePicker']}>
      <DatePicker
        displayWeekNumber
        defaultValue={value ? getLuxonDate(value) : null}
        onChange={(val) => onChange(val ? formatDate(val) : '')}
      />
    </DemoContainer>
  </LocalizationProvider>
);
