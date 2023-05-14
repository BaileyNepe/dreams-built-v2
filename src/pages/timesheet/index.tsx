import { useEffect, useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import withAuth from '@/components/HOC/withAuthAndLoading';
import DropdownSelect from '@/components/ui/atoms/DropdownSelect';
import PageState from '@/components/ui/molecules/PageState';
import TimesheetWeek from '@/components/ui/organisms/Timesheet';
import { useUser } from '@/components/utils/hooks/useUser';
import { api } from '@/utils/api';
import { DateTime } from 'luxon';
import styles from './timesheet.module.css';

const generateTimesheetPeriods = (
  startWeekInit: DateTime,
  weekEndInit: DateTime,
  numberOfPeriods = 4,
) =>
  // Generate an array of timesheet periods based on the start and end of the week.
  Array.from({ length: numberOfPeriods }, (_, i) => ({
    weekStart: startWeekInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy'),
    weekEnd: weekEndInit.minus({ days: i * 7 }).toFormat('dd/MM/yyyy'),
  }));

/* COMPONENTS */

const Timesheet = () => {
  const { user, isAdmin } = useUser();
  const dispatch = useDispatch();

  if (!user || !user.sub) {
    throw new Error('User not found');
  }

  // const employeeList = useSelector((state) => state.employees);
  const [selectedUser, setSelectedUser] = useState({
    label: user.given_name || user?.email,
    value: user.sub,
  });

  const startWeekInit = DateTime.now().startOf('week');
  const weekEndInit = DateTime.now().endOf('week');

  const [weekStart, setWeekStart] = useState(startWeekInit.toFormat('dd/MM/yyyy'));
  const [weekEnd, setWeekEnd] = useState(weekEndInit.toFormat('dd/MM/yyyy'));

  const { isLoading, data, error } = api.timesheet.getWeek.useQuery({
    userId: selectedUser.value,
    weekStart,
  });

  const { dayEntries, comments } = data || { dayEntries: [], comments: '' };

  const timesheetPeriods = generateTimesheetPeriods(startWeekInit, weekEndInit);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const token = await getAccessTokenSilently();
  //       dispatch(getJobList(token));
  //       if (isAdmin) {
  //         dispatch(getEmployees(token));
  //         dispatch(getTimesheet(token, selectedUser.value, weekStart));
  //       } else {
  //         dispatch(getTimesheet(token, user.sub, weekStart));
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [dispatch, getAccessTokenSilently, user, weekStart, selectedUser]);

  // const submitHandler = async (event) => {
  //   event.preventDefault();
  //   const token = await getAccessTokenSilently();
  //   role === 'admin'
  //     ? dispatch(handleSubmit(dayEntries, weekStart, weekEnd, token, selectedUser.value, comments))
  //     : dispatch(handleSubmit(dayEntries, weekStart, weekEnd, token, user.sub, comments));
  // };

  return (
    <div className='parent-container'>
      <PageState loading={isLoading} error={error}>
        <Form onSubmit={submitHandler} className='container'>
          {isAdmin ? (
            <div className={styles.users}>
              <DropdownSelect
                defaultValue={selectedUser}
                onChange={setSelectedUser}
                options={employeeList?.employeeList.map((option) => ({
                  label: `${option.firstName} ${option.lastName}`,
                  value: option.userId,
                }))}
              />
            </div>
          ) : null}
          <div className={styles['grid-card-top']}>
            <Dropdown>
              <Dropdown.Toggle id='dropdown-button' variant='primary' className={styles.dropdown}>
                Week: {weekStart} - {weekEnd}
              </Dropdown.Toggle>
              <Dropdown.Menu
                as={CustomMenu}
                style={{ boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px' }}
              >
                {timesheetPeriods.map((date) => (
                  <Dropdown.Item
                    eventKey={date.weekEnd}
                    key={date.weekStart}
                    onClick={() => {
                      setWeekStart(date.weekStart);
                      setWeekEnd(date.weekEnd);
                    }}
                  >
                    {date.weekStart} - {date.weekEnd}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Button variant='info' type='submit' className={styles['btn-time-save']}>
              Save
            </Button>
          </div>
          <TimesheetWeek weekStart={weekStart} />

          <Button variant='info' type='submit' className={styles['btn-btm-save']}>
            Save
          </Button>
        </Form>
      </PageState>
    </div>
  );
};

export default withAuth(Timesheet);
