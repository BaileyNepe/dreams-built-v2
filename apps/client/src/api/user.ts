import { api } from './trpc';

export const useProfileQuery = ({
  enabled,
  firstName,
  lastName,
  email,
  image
}: {
  enabled: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
}) =>
  api.user.profile.useQuery(
    {
      firstName,
      lastName,
      email,
      image
    },
    {
      enabled
    }
  );
