import { Link, type LinkProps } from '@tanstack/react-router';
import styled from 'styled-components';

import type React from 'react';

const StyledRouterLink = styled((props: React.ComponentProps<typeof Link>) => (
  <Link {...props} />
))`
  color: ${({ theme }) => theme.palette.primary.main};
  font-weight: 500;
  text-decoration: none;
  transition: all 0.1s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.palette.primary.dark};
    text-decoration: none;
  }
`;

export const RouterLink: React.FC<
  LinkProps & { children: React.ReactNode; onClick?: () => void }
> = ({ children, ...rest }) => (
  <StyledRouterLink
    {...(rest as React.ComponentProps<typeof Link>)}
    onClick={rest.onClick}
  >
    {children}
  </StyledRouterLink>
);

export const LinkButton = styled(StyledRouterLink)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ theme }) => theme.palette.primary.contrastText};
  padding: 8px 16px;
  text-align: center;
  text-decoration: 'none';
  transition: all 0.1s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
    text-decoration: 'none';
  }
`;
