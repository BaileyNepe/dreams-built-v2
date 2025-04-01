import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Container, Drawer, IconButton, Toolbar } from '@mui/material';
import { type LinkProps } from '@tanstack/react-router';
import { type FC, useState } from 'react';
import styled from 'styled-components';
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

// Styled NavLink using MUI Link
const NavLink = styled((props: React.ComponentProps<typeof RouterLink>) => (
  <RouterLink {...props} />
))`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 500;
  margin: ${({ theme }) => theme.spacing(0, 1)};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenMobileNav = () => setMobileOpen(true);
  const handleCloseMobileNav = () => setMobileOpen(false);

  return (
    <StyledAppBar elevation={0}>
      <Container>
        <Toolbar disableGutters sx={{ py: 2, justifyContent: 'space-between' }}>
          {/* Left Section: Logo + Desktop Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RouterLink to="/" aria-label="Home">
              <Logo />
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
            <RouterLink to={paths.contact}>
              <Button variant="contained" color="primary">
                Contact Us
              </Button>
            </RouterLink>
            {/* Mobile Menu Toggle */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <IconButton aria-label="Open navigation" onClick={handleOpenMobileNav}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </Container>
      <MobileNavigation open={mobileOpen} onClose={handleCloseMobileNav} />
    </StyledAppBar>
  );
};
