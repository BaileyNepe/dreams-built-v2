import { Avatar, Box, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import styled from 'styled-components';

export const AvatarContainer = styled(Box)`
  position: relative;
  width: max-content;
`;

export const ActiveDot = styled(Box)`
  background-color: ${({ theme }) => theme.palette.success.main};
  border: 2px solid ${({ theme }) => theme.palette.background.paper};
  border-radius: 50%;
  bottom: 0;
  height: 0.8rem;
  position: absolute;
  right: 0;
  width: 0.8rem;
`;

export const UserAvatar: FC<{
  image?: string;
  name?: string;
  isActive?: boolean;
  textAlign?: 'left' | 'right';
}> = ({ image, name, isActive = false, textAlign = 'right' }) => (
  <Stack direction="row" alignItems="center" spacing={2}>
    {textAlign === 'left' && (
      <Typography variant="body1" fontWeight="bold">
        {name}
      </Typography>
    )}
    <AvatarContainer>
      <Avatar src={image} alt={name} sx={{ height: '1.9rem', width: '1.9rem' }} />
      {isActive && <ActiveDot />}
    </AvatarContainer>
    {textAlign === 'right' && <Typography>{name}</Typography>}
  </Stack>
);
