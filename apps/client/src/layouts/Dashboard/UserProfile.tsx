import { UserAvatar } from 'components/Avatar';
import { type FC } from 'react';
import { useAuthOptionalUser } from 'utils/contexts/AuthProvider';

export const UserProfile: FC = () => {
  const { user } = useAuthOptionalUser();

  return (
    <UserAvatar
      image={user?.image}
      name={`${user?.firstName} ${user?.lastName}`.trim() ?? 'Anonymous'}
      isActive={false}
      textAlign="left"
    />
  );
};
