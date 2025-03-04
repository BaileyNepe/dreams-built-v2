import { authz } from '@dreams-built/shared/src/auth/permissions';
import { Container } from '@mui/material';
import { BasicDatePicker } from 'components/DatePicker';
import { SubmitButton } from 'components/SubmitButton';
import { notify } from 'libs/Notify';
import styled from 'styled-components';
import { useAuth } from 'utils/contexts/AuthProvider';
import { UserSelect } from './components/UserSelect';
import { TimesheetWeek } from './components/Week';
import { useTimesheet } from './hooks/useTimesheet';

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`;

export const Timesheet = () => {
  const { changeDate, weekStart, userId, updateUser } = useTimesheet();
  const {
    user: { permissions }
  } = useAuth();

  const canEditOthers = permissions?.includes(authz.timesheet_view_all);

  return (
    <Container>
      <Form>
        <HeaderContainer>
          <BasicDatePicker value={weekStart} onChange={changeDate} />
          {canEditOthers && <UserSelect value={userId} onChange={updateUser} />}
          <SubmitButton
            isLoading={false}
            onClick={() => notify('Timesheet saved successfully', { type: 'success' })}
          />
        </HeaderContainer>

        <TimesheetWeek />

        <FooterContainer>
          <SubmitButton
            isLoading={false}
            onClick={() => notify('Timesheet saved successfully', { type: 'success' })}
          />
        </FooterContainer>
      </Form>
    </Container>
  );
};
