import { Link } from '@tanstack/react-router';
import styled from 'styled-components';

import type React from 'react';

const StyledRouterLink = styled((props: React.ComponentProps<typeof Link>) => (
  <Link {...props} />
))`
  color: ${({ theme }) => theme.palette.primary.main};
  font-weight: 500;
  text-decoration: 'none';
  transition: all 0.1s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

type RouterLinkProps = {
  children: React.ReactNode;
} & React.ComponentProps<typeof Link>;

export const RouterLink: React.FC<RouterLinkProps> = ({ children, ...rest }) => (
  <StyledRouterLink {...rest}>{children}</StyledRouterLink>
);
