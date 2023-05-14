// slices/validateSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ValidationError {
  message: string;
  entryId: string;
  error: string;
}

interface ValidateState {
  clientValidationErrors: ValidationError[];
  loading: boolean;
  error: string | null;
  success: boolean | null;
}

const initialState: ValidateState = {
  clientValidationErrors: [],
  loading: false,
  error: null,
  success: null,
};

const validateTimesheetSlice = createSlice({
  name: 'validate',
  initialState,
  reducers: {
    submitTimesheetRequest: (state) => {
      state.loading = true;
    },
    submitTimesheetValidated: (state) => {
      state.loading = true;
    },
    validationFail: (state, action: PayloadAction<ValidationError[]>) => {
      state.loading = false;
      state.clientValidationErrors = action.payload;
    },
    submitTimesheetSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    submitTimesheetFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  submitTimesheetRequest,
  submitTimesheetValidated,
  validationFail,
  submitTimesheetSuccess,
  submitTimesheetFail,
} = validateTimesheetSlice.actions;

export default validateTimesheetSlice.reducer;
