import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import { formatDate, isWithinRange } from 'utils/date';

export const BasicDatePicker: FC<{
  onChange: (value: string) => void;
  value: DateTime;
  minDate?: DateTime;
  maxDate?: DateTime;
}> = ({ value, onChange, minDate, maxDate }) => {
  const handleChange = (val: DateTime | null): void => {
    if (!val) {
      // If the user clears the date (or picks something invalid), just propagate an empty string.
      onChange('');
      return;
    }

    if (minDate && maxDate) {
      if (isWithinRange(val, minDate, maxDate)) {
        onChange(formatDate(val));
      }
    } else {
      onChange(formatDate(val));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-NZ">
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          displayWeekNumber
          defaultValue={value}
          onChange={handleChange}
          minDate={minDate}
          maxDate={maxDate}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};
