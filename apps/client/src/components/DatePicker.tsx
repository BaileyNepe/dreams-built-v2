import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { type DateTime } from 'luxon';
import { type FC } from 'react';
import { formatDate, getLuxonDate } from 'utils/date';

export const BasicDatePicker: FC<{
  onChange: (value: string) => void;
  value: string;
  minDate?: string;
  maxDate?: string;
}> = ({ value, onChange, minDate, maxDate }) => {
  // A small helper to see if 'date' is within [minDate, maxDate].
  const isWithinRange = (date: DateTime, min?: DateTime, max?: DateTime): boolean => {
    if (min && date < min) return false;
    if (max && date > max) return false;
    return true;
  };

  const handleChange = (val: DateTime | null): void => {
    if (!val) {
      // If the user clears the date (or picks something invalid), just propagate an empty string.
      onChange('');
      return;
    }

    // Only check range if we have a minDate or maxDate; if neither is given, there's no restriction.
    const minLuxon = minDate ? getLuxonDate(minDate) : undefined;
    const maxLuxon = maxDate ? getLuxonDate(maxDate) : undefined;

    if (isWithinRange(val, minLuxon, maxLuxon)) {
      onChange(formatDate(val));
    }
    // If it's out of range, do nothing.
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-NZ">
      <DemoContainer components={['DatePicker']}>
        <DatePicker
          displayWeekNumber
          defaultValue={value ? getLuxonDate(value) : null}
          onChange={handleChange}
          minDate={minDate ? getLuxonDate(minDate) : undefined}
          maxDate={maxDate ? getLuxonDate(maxDate) : undefined}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};
