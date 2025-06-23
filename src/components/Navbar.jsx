import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu, X } from 'react-feather';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Cameras', to: '/featured' },
  { label: 'About', to: '/' },
  { label: 'Contact', to: '/' },
  { label: 'Add Camera', to: '/add-camera' },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 56, md: 72 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: 'Inter',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#333',
                textDecoration: 'none',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                mr: 2,
              }}
            >
              Chaithra
            </Typography>
          </Box>
          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {navLinks.map((link) => (
              <Typography
                key={link.label}
                component={RouterLink}
                to={link.to}
                className={`navbar-link${location.pathname === link.to ? ' active' : ''}`}
                sx={{ fontWeight: 800, fontSize: '1rem' }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>
          {/* Hamburger Icon for Mobile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
          >
            <Menu size={28} color="#FF6B6B" />
          </IconButton>
        </Toolbar>
      </Container>
      {/* Slide-out Drawer for Mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { width: 240, bgcolor: '#fff', pt: 2 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
          <IconButton onClick={handleDrawerToggle} aria-label="close menu">
            <X size={24} color="#FF6B6B" />
          </IconButton>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.label}
              component={RouterLink}
              to={link.to}
              onClick={handleDrawerToggle}
              selected={location.pathname === link.to}
              sx={{
                fontFamily: 'Inter',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#333',
                '&.Mui-selected, &.Mui-selected:hover': {
                  color: '#FF6B6B',
                  bgcolor: 'transparent',
                },
                py: 2,
                px: 3,
              }}
            >
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 800 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 