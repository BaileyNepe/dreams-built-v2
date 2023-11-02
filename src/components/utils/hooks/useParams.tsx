import { useRouter } from 'next/router';

export const useClientParams = () => {
  const params = useRouter();

  const clientId = params.query.clientId as string;

  if (!clientId) {
    throw new Error('Client id is missing');
  }

  return clientId;
};
