import { authz } from '@dreams-built/shared/src/auth/permissions';
import { Box } from '@mui/material';
import { UserAvatar } from 'components/Avatar';
import { NotificationMenu } from 'components/NotificationMenu';
import { type FC } from 'react';
import styled from 'styled-components';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';

const ProfileContainer = styled(Box)`
  align-items: center;
  display: flex;
  gap: 0.8rem;
`;

export const UserProfile: FC = () => {
  const { user } = useAuthOptionalUser();

  return (
    <ProfileContainer>
      {!!user?.permissions?.includes(authz.messages_read) && (
        <NotificationMenu maxNotifications={5} />
      )}

      <UserAvatar
        image={user?.image}
        name={`${user?.firstName} ${user?.lastName}`.trim() || 'Anonymous'}
        isActive={false}
        textAlign="left"
      />
    </ProfileContainer>
  );
};
