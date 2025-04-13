import { Badge } from '@mui/material';
import { type FC, type ReactNode } from 'react';
import styled from 'styled-components';

const StyledBadge = styled(Badge)`
  .MuiBadge-badge {
    background-color: ${({ theme }) => theme.palette.error.main};
    color: white;
    font-weight: bold;
    right: -3px;
    top: 3px;
  }
`;

interface NotificationBadgeProps {
  count?: number;
  children: ReactNode;
  max?: number;
}

export const NotificationBadge: FC<NotificationBadgeProps> = ({
  count = 0,
  children,
  max = 99
}) => {
  const showBadge = count > 0;

  return (
    <StyledBadge badgeContent={count} color="error" invisible={!showBadge} max={max}>
      {children}
    </StyledBadge>
  );
};
