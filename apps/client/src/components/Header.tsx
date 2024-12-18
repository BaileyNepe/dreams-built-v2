import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  Button as MUIButton,
  Toolbar,
  Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { type FC, Fragment, useState } from 'react';
import { RouterLink } from './Link';

// Placeholder Logo component
const Logo: FC = () => (
  <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
    MyLogo
  </Typography>
);

// Placeholder AuthButton component
const AuthButton: FC = () => (
  <MUIButton variant="text" color="inherit">
    Sign In
  </MUIButton>
);

// Array of links for navigation
const links = [
  { href: '#features', label: 'Features' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' }
];

// Styled NavLink using MUI Link
const NavLink = styled(RouterLink)(({ theme }) => ({
  margin: theme.spacing(0, 1.5),
  textDecoration: 'none',
  color: theme.palette.text.primary,
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline'
  }
}));

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
      {links.map((link) => (
        <NavLink key={link.href} href={link.href} onClick={onClose}>
          {link.label}
        </NavLink>
      ))}
      {/* Add AuthButton or other elements as needed here */}
    </Box>
  </Drawer>
);

// Main Header component
export const Header: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenMobileNav = () => setMobileOpen(true);
  const handleCloseMobileNav = () => setMobileOpen(false);

  return (
    <AppBar position="static" color="inherit" elevation={0}>
      <Container>
        <Toolbar disableGutters sx={{ py: 2, justifyContent: 'space-between' }}>
          {/* Left Section: Logo + Desktop Nav */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <RouterLink href="#" underline="none" color="inherit" aria-label="Home">
              <Logo />
            </RouterLink>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {links.map((link) => (
                <NavLink key={link.href} href={link.href}>
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
            <MUIButton variant="contained" color="primary" href="/register">
              Get started{' '}
              <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>
                today
              </Box>
            </MUIButton>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <IconButton aria-label="Open navigation" onClick={handleOpenMobileNav}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </Container>
      <MobileNavigation open={mobileOpen} onClose={handleCloseMobileNav} />
    </AppBar>
  );
};
