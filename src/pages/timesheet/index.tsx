import { useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
// import { useDispatch, useSelector } from 'react-redux';

import withAuth from '@/components/HOC/withAuthAndLoading';
// import DropdownSelect from '@/components/ui/atoms/DropdownSelect';
import { useDispatch } from '@/components/store';
import Button from '@/components/ui/atoms/Button';
import CustomMenu from '@/components/ui/atoms/CustomMenu';
import PageState from '@/components/ui/molecules/PageState';
import TimesheetWeek from '@/components/ui/organisms/Timesheet';
import { generateWeeks } from '@/components/utils/helpers';
import { useUser } from '@/components/utils/hooks/useUser';
import { api } from '@/utils/api';
import { DateTime } from 'luxon';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  @media only screen and (min-width: 50rem) {
    .grid-card-top {
      grid-template-columns: 1fr 1fr;
    }
  }
`;

const DropdownToggle = styled(Dropdown.Toggle)`
  width: 100%;
  @media only screen and (min-width: 50rem) {
    width: max-content;
  }
`;

/* COMPONENTS */

const Timesheet = () => {
  const { user, isAdmin } = useUser();
  const dispatch = useDispatch();

  if (!user?.sub) throw new Error('User not found');

  // const employeeList = useSelector((state) => state.employees);
  const [selectedUser, setSelectedUser] = useState({
    label: user.given_name || user?.email,
    value: user.sub,
  });

  const startWeekInit = DateTime.now().startOf('week');
  const weekEndInit = DateTime.now().endOf('week');

  const [weekStart, setWeekStart] = useState(startWeekInit.toFormat('dd/MM/yyyy'));
  const [weekEnd, setWeekEnd] = useState(weekEndInit.toFormat('dd/MM/yyyy'));

  const { isLoading, error } = api.timesheet.getWeek.useQuery(
    {
      userId: selectedUser.value,
      weekStart,
    },
    {
      cacheTime: 0,
      onSuccess: (apiData) => {
        dispatch({
          type: 'timesheet/setTimesheetEntries',
          payload: apiData?.data?.timeSheetEntries,
        });
      },
    },
  );

  const timesheetPeriods = generateWeeks(startWeekInit, weekEndInit);

  // useEffect(() => {
  //   (async () => {
  //     try {

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
  // }, [dispatch, user, weekStart, selectedUser]);

  const submitHandler = () => {};
  // const submitHandler = async (event) => {
  //   event.preventDefault();
  //   role === 'admin'
  //     ? dispatch(handleSubmit(dayEntries, weekStart, weekEnd, token, selectedUser.value, comments))
  //     : dispatch(handleSubmit(dayEntries, weekStart, weekEnd, token, user.sub, comments));
  // };

  return (
    <div className='parent-container'>
      <PageState loading={isLoading} error={error?.message}>
        <Form onSubmit={submitHandler} className='container'>
          {/* {isAdmin ? (
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
          ) : null} */}
          <GridContainer>
            <Dropdown>
              <DropdownToggle id='dropdown-button' variant='primary'>
                Week: {weekStart} - {weekEnd}
              </DropdownToggle>
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
            <Button variant='info' type='submit' text='Save' />
          </GridContainer>
          <TimesheetWeek weekStart={weekStart} />
          <Button variant='info' type='submit' text='Save' />
        </Form>
      </PageState>
    </div>
  );
};

export default withAuth(Timesheet);
