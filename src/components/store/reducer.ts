// third-party
import { combineReducers } from 'redux';
import timesheetReducer from './slices/timesheet';

const reducer = combineReducers({
  timesheet: timesheetReducer,
});

export default reducer;
