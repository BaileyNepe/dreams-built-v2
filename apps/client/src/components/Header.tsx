import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Container, Drawer, IconButton, Toolbar } from '@mui/material';
import { type LinkProps } from '@tanstack/react-router';
import { type FC, useState } from 'react';
import styled from 'styled-components';
import { bgBlur } from 'themes/css';
import { useIsCoverPage } from 'utils/hooks/useIsCoverPage';
import { useOffSetTop } from 'utils/hooks/useOffsetTop';
import { useResponsive } from 'utils/hooks/useResponsive';
import { paths } from 'utils/paths';
import { AuthButton } from './AuthButton';
import { Button } from './Button';
import { RouterLink } from './Link';
import { Logo } from './Logo';

const links: {
  to: LinkProps['to'];
  label: string;
}[] = [
  { to: '/', label: 'Home' },
  { to: paths.services, label: 'Services' },
  { to: paths.about, label: 'About' },
  { to: paths.contact, label: 'Contact Us' }
];

export const HEADER = {
  H_DESKTOP: 80
};

export const NAV = {
  W_VERTICAL: 350
};

// Styled NavLink using MUI Link
const NavLink = styled((props: React.ComponentProps<typeof RouterLink>) => (
  <RouterLink {...props} />
))`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 500;
  margin: ${({ theme }) => theme.spacing(0, 1)};

  transition: all 0.2s ease-in-out;
`;

const ButtonContainer = styled(Box)`
  display: grid;
  width: 100%;
  button {
    width: 100%;
  }
`;

const StyledAppBar = styled(AppBar)`
  && {
    background-color: transparent;
    box-shadow: 0;
    color: ${({ theme }) => theme.palette.text.primary};

    position: fixed;
    transition: ${({ theme }) =>
      theme.transitions.create(['height', 'background-color'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter
      })};

    z-index: 30;
  }
`;

const StyledToolbar = styled(Toolbar)<{ $offset: boolean; $isLightMode: boolean }>`
  color: ${({ $isLightMode, theme }) =>
    $isLightMode ? theme.palette.grey[300] : 'inherit'};
  a {
    color: ${({ $isLightMode, theme }) =>
      $isLightMode ? theme.palette.grey[300] : 'inherit'};
  }

  height: ${({ $offset }) =>
    $offset ? `${HEADER.H_DESKTOP - 16}px` : `${HEADER.H_DESKTOP}px`};
  ${({ $offset: offset, theme }) =>
    offset && bgBlur({ color: theme.palette.background.default })}
  transition: ${({ theme }) =>
    theme.transitions.create(['height', 'background-color'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter
    })};
`;

const ShadowBox = styled.div`
  border-radius: 50%;
  bottom: 0;
  box-shadow: ${({ theme }) => theme.customShadows.z8};
  height: 24px;
  left: 0;
  margin: auto;
  opacity: 0.48;
  position: absolute;
  right: 0;
  width: calc(100% - 48px);
  z-index: -1;
`;

// Navigation on mobile (Drawer content)
const MobileNavigation: FC<{ onClose: () => void; open: boolean }> = ({
  onClose,
  open
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box
      sx={{
        width: 250,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <ButtonContainer>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onClose}>
            <Button>{link.label}</Button>
          </NavLink>
        ))}
      </ButtonContainer>

      <AuthButton />
    </Box>
  </Drawer>
);

// Main Header component
export const Header: FC = () => {
  const isCoverPage = useIsCoverPage();
  const isExtraSmallScreen = useResponsive('down', 'sm');
  const [mobileOpen, setMobileOpen] = useState(false);
  const offset = useOffSetTop();
  const isHeaderLightMode = isCoverPage && !offset;

  const handleOpenMobileNav = () => setMobileOpen(true);
  const handleCloseMobileNav = () => setMobileOpen(false);

  return (
    <StyledAppBar elevation={0}>
      <StyledToolbar disableGutters $offset={offset} $isLightMode={isHeaderLightMode}>
        <Container>
          <Toolbar disableGutters sx={{ py: 2, justifyContent: 'space-between' }}>
            {/* Left Section: Logo + Desktop Nav */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RouterLink to="/" aria-label="Home">
                <Logo light={isHeaderLightMode} />
              </RouterLink>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to}>
                    {link.label}
                  </NavLink>
                ))}
              </Box>
            </Box>

            {/* Right Section: AuthButton, CTA and Mobile Menu Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <AuthButton />
              </Box>
              {!isExtraSmallScreen && (
                <RouterLink to={paths.contact}>
                  <Button variant="contained" color="primary">
                    Contact Us
                  </Button>
                </RouterLink>
              )}

              {/* Mobile Menu Toggle */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <IconButton aria-label="Open navigation" onClick={handleOpenMobileNav}>
                  <MenuIcon
                    sx={{
                      color: isHeaderLightMode ? 'lightgray' : 'text.primary'
                    }}
                  />
                </IconButton>
              </Box>
            </Box>
          </Toolbar>
        </Container>
        <MobileNavigation open={mobileOpen} onClose={handleCloseMobileNav} />
      </StyledToolbar>
      {offset && <ShadowBox />}
    </StyledAppBar>
  );
};
