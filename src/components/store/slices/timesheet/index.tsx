// slices/timesheetSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Entry {
  entryId: string;
  day: string;
  startTime: string;
  endTime: string;
  job: string;
  jobTime: number;
}

interface Comment {
  day: string;
  comments: string;
}

interface TimesheetState {
  dayEntries: Entry[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  dayEntries: [],
  comments: [],
  loading: false,
  error: null,
};

const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    setTimesheetEntries: (state, action: PayloadAction<Entry[]>) => {
      state.dayEntries = action.payload;
    },
    getTimesheetRequest: (state) => {
      state.loading = true;
    },
    getTimesheetSuccess: (
      state,
      action: PayloadAction<{ entries: Entry[]; comments: Comment[] }>,
    ) => {
      state.dayEntries = action.payload.entries;
      state.comments = action.payload.comments;
      state.loading = false;
    },
    getTimesheetFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createEntry: (state, action: PayloadAction<{ entryId: string; day: string }>) => {
      state.dayEntries.push({
        entryId: action.payload.entryId,
        day: action.payload.day,
        startTime: '',
        endTime: '',
        job: '',
        jobTime: 0,
      });
    },
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.dayEntries = state.dayEntries.filter((entry) => entry.entryId !== action.payload);
    },
    updateEntry: (
      state,
      action: PayloadAction<{
        entryId: string;
        day: string;
        startTime: string;
        endTime: string;
        job: string;
        jobTime: number;
      }>,
    ) => {
      const index = state.dayEntries.findIndex((entry) => entry.entryId === action.payload.entryId);
      if (index !== -1) {
        state.dayEntries[index] = action.payload;
      }
    },
    updateComments: (state, action: PayloadAction<{ day: string; comments: string }>) => {
      const index = state.comments.findIndex((comment) => comment.day === action.payload.day);
      if (index !== -1) {
        state.comments[index] = action.payload;
      } else {
        state.comments.push(action.payload);
      }
    },
  },
});

export const {
  setTimesheetEntries,
  getTimesheetRequest,
  getTimesheetSuccess,
  getTimesheetFail,
  createEntry,
  deleteEntry,
  updateEntry,
  updateComments,
} = timesheetSlice.actions;

export default timesheetSlice.reducer;
