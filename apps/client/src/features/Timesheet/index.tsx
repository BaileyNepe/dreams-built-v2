import { authz } from '@dreams-built/shared/src/auth/permissions';
import { Container } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import { SubmitButton } from 'components/SubmitButton';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { getDate, getEndOfWeek } from 'utils/date';
import { UserSelect } from '../../components/Forms/Selects/UserSelect';
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

  /* For desktop, switch to a grid layout with 3 columns */
  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    display: grid;
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

  const canEditOtherUsers = permissions?.includes(authz.timesheet_view_all);

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <HeaderContainer>
          <LeftItem>
            <BasicDatePicker
              defaultValue={getDate(weekStart)}
              onChange={changeDate}
              maxDate={getEndOfWeek()}
              minDate={getDate().minus({ months: 6 })}
            />
          </LeftItem>
          {canEditOtherUsers ? (
            <CenterItem>
              <UserSelect value={userId} onChange={updateUser} />
            </CenterItem>
          ) : (
            // User to keep the layout consistent
            <CenterItem />
          )}
          <RightItem>
            <SubmitButton isLoading={isSubmitting} />
          </RightItem>
        </HeaderContainer>

        <TimesheetWeek />

        <FooterContainer>
          <SubmitButton isLoading={isSubmitting} />
        </FooterContainer>
      </Form>
    </Container>
  );
};
