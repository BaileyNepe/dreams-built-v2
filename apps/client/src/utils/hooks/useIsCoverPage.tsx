import { useLocation } from '@tanstack/react-router';

export const useIsCoverPage = () => {
  const { pathname } = useLocation();

  return pathname === '/' || pathname === '/contact';
};
