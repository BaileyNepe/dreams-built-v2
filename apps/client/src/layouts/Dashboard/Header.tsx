import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';

import { type FC } from 'react';
import { styled } from 'styled-components';
import { HEADER_HEIGHT } from './constants';
import { UserProfile } from './UserProfile';

const StyledAppBar = styled(AppBar)`
  height: ${HEADER_HEIGHT};
`;

export const Header: FC<{
  openSidebar: () => void;
}> = ({ openSidebar }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar>
        {!isDesktop && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={openSidebar}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box flex={1} display="flex" justifyContent="flex-end">
          <UserProfile />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};
