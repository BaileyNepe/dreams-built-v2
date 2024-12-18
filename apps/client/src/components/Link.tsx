import { styled } from '@mui/system';
import { Link } from '@tanstack/react-router';

import type React from 'react';

const StyledRouterLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main,
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline'
  }
}));

type RouterLinkProps = {
  to: string;
  children: React.ReactNode;
};

export const RouterLink: React.FC<RouterLinkProps> = ({ to, children }) => (
  <StyledRouterLink to={to}>{children}</StyledRouterLink>
);
