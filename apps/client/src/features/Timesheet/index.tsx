import { authz } from '@dreams-built/shared/src/auth/permissions';
import { Container } from '@mui/material';
import { DateSelector } from 'components/DateSelector';
import { SubmitButton } from 'components/SubmitButton';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { getDate, getEndOfWeek } from 'utils/date';
import { useResponsive } from 'utils/hooks/useResponsive';
import { UserSelect } from '../../components/Forms/Selects/UserSelect';
import { MobileTimesheetWeek } from './components/MobileWeek';
import { TimesheetWeek } from './components/Week';
import { useTimesheet } from './hooks/useTimesheet';

const Form = styled.form`
  display: grid;
  gap: 1rem;
  padding-bottom: 2rem;
`;

const HeaderContainer = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1rem;
  }
`;

const LeftItem = styled.div`
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    justify-self: start;
  }
`;

const CenterItem = styled.div`
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    justify-self: center;
  }
`;

const RightItem = styled.div`
  button {
    width: 100%;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    justify-self: end;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

export const Timesheet = () => {
  const { changeDate, weekStart, userId, updateUser, handleSubmit, isSubmitting } =
    useTimesheet();
  const {
    user: { permissions }
  } = useAuth();
  const isDesktop = useResponsive('up', 'md');

  const canEditOtherUsers = permissions?.includes(authz.timesheet_view_all);

  // Compute our current week date using getDate.
  // Assuming getDate returns a Luxon DateTime.
  const currentWeekDate = getDate(weekStart);
  const nextWeekDate = currentWeekDate.plus({ weeks: 1 });
  const previousWeekDate = currentWeekDate.minus({ weeks: 1 });

  // Get minimum and maximum allowed dates.
  // We assume getDate returns a DateTime and getEndOfWeek returns a DateTime as well.
  const minSelectableDate = getDate().minus({ months: 6 });
  const maxSelectableDate = getEndOfWeek();

  // Compare using toMillis() so that we're comparing numbers.
  const getNextPeriod =
    nextWeekDate.toMillis() > maxSelectableDate.toMillis()
      ? undefined
      : () => changeDate(nextWeekDate.toFormat('yyyy-MM-dd'));

  const getPreviousPeriod =
    previousWeekDate.toMillis() < minSelectableDate.toMillis()
      ? undefined
      : () => changeDate(previousWeekDate.toFormat('yyyy-MM-dd'));

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <HeaderContainer>
          <LeftItem>
            <DateSelector
              value={currentWeekDate}
              defaultValue={currentWeekDate}
              onChange={changeDate}
              getNextPeriod={getNextPeriod}
              getPreviousPeriod={getPreviousPeriod}
              minDate={minSelectableDate}
              maxDate={maxSelectableDate}
            />
          </LeftItem>
          {canEditOtherUsers ? (
            <CenterItem>
              <UserSelect value={userId} onChange={updateUser} />
            </CenterItem>
          ) : (
            <CenterItem />
          )}
          {isDesktop && (
            <RightItem>
              <SubmitButton isLoading={isSubmitting} />
            </RightItem>
          )}
        </HeaderContainer>

        {isDesktop ? (
          <>
            <TimesheetWeek />
            <FooterContainer>
              <SubmitButton isLoading={isSubmitting} />
            </FooterContainer>
          </>
        ) : (
          // Keyed by week so the selected day resets when the week changes.
          <MobileTimesheetWeek key={weekStart} />
        )}
      </Form>
    </Container>
  );
};
