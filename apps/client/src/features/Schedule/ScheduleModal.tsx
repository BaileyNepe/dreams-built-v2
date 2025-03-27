import { type FC } from 'react';

import { Button } from '@mui/material';
import BasicModal from 'components/Modal';
import { type DateTime } from 'luxon';
import { type Task } from './useSchedule';

export const RangeSelectionModal: FC<{
  range: { start: DateTime; end: DateTime } | null;
  onClose: () => void;
}> = ({ range, onClose }) => (
  <BasicModal open={!!range} onClose={onClose} title="New Range">
    <form>
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  </BasicModal>
);

export const EditScheduleModal: FC<{
  open: boolean;
  onClose: () => void;
  data: Task;
}> = ({ open, onClose, data }) => (
  <BasicModal open={open} onClose={onClose} title="Edit Schedule">
    <form>
      {JSON.stringify(data, null, 2)}
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  </BasicModal>
);
