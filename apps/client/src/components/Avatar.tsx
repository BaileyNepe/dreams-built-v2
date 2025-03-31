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

export const UserAvatar: FC<{ image?: string; name?: string; isActive?: boolean }> = ({
  image,
  name,
  isActive = false
}) => (
  <Stack direction="row" alignItems="center" spacing={2}>
    <AvatarContainer>
      <Avatar src={image} alt={name} sx={{ height: '2.2rem', width: '2.2rem' }} />
      {isActive && <ActiveDot />}
    </AvatarContainer>
    <Typography variant="body1">{name}</Typography>
  </Stack>
);
