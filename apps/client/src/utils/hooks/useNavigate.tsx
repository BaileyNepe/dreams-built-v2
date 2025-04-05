import { useNavigate as useNavigateRouter } from '@tanstack/react-router';

export const useNavigate = () => {
  const navigate = useNavigateRouter();

  return navigate;
};
