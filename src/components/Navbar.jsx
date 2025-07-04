import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemText, Menu, MenuItem, InputBase, Paper } from '@mui/material';
import { Menu as MenuIcon, X, Search } from 'react-feather';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { styled, alpha } from '@mui/material/styles';
import { collection, getDocs } from 'firebase/firestore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const navLinks = [
  { label: 'Home', to: '/' },
];

const ADMIN_EMAILS = [
  'deekshithsk24@gmail.com', 
];

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = ({ user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const fetchAndSearch = async () => {
      setLoadingSearch(true);
      const collections = {
        cameras: 'camera',
        freelancers: 'freelancer',
        accessories: 'accessory',
      };
      const allResults = [];

      for (const colName in collections) {
        try {
          const querySnapshot = await getDocs(collection(db, colName));
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.name && data.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              allResults.push({ id: doc.id, type: collections[colName], ...data });
            }
          });
        } catch (error) {
          console.error(`Error fetching from ${colName}:`, error);
        }
      }
      setSearchResults(allResults);
      setLoadingSearch(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchAndSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)' }}>
      <Container maxWidth={false} sx={{ width: '100%', px: 2 }}>
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
              Aperture Aura
            </Typography>
          </Box>
          
          {/* Elongated Search Bar */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', px: 2 }}>
            <SearchBar sx={{ width: '100%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
               {searchResults.length > 0 && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1200 }}>
                  <List>
                    {searchResults.map((result) => (
                      <ListItem
                        button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          let path = '/';
                          switch (result.type) {
                            case 'camera':
                              path = `/camera/${result.id}`;
                              break;
                            case 'freelancer':
                              path = `/freelancers/${result.id}`;
                              break;
                            case 'accessory':
                              path = `/accessories/${result.id}`;
                              break;
                          }
                          navigate(path);
                          setSearchQuery('');
                        }}
                      >
                        <ListItemText primary={result.name} secondary={result.type} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </SearchBar>
          </Box>

          {/* Desktop Nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, flexShrink: 0 }}>
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
            {/* Cart Icon */}
            <IconButton color="inherit" onClick={() => navigate('/cart')} sx={{ ml: 1 }}>
              <ShoppingCartIcon />
            </IconButton>
            {user && (
              <>
                <Button
                  aria-controls="add-service-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  className={`navbar-link${location.pathname.startsWith('/add-') ? ' active' : ''}`}
                  sx={{ fontWeight: 800, fontSize: '1rem', color: 'inherit', textTransform: 'none' }}
                >
                  Add Service
                </Button>
                <Menu
                  id="add-service-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem component={RouterLink} to="/add-camera" onClick={handleMenuClose}>Add Camera</MenuItem>
                  <MenuItem component={RouterLink} to="/add-accessory" onClick={handleMenuClose}>Add Accessory</MenuItem>
                  <MenuItem component={RouterLink} to="/add-freelancer" onClick={handleMenuClose}>Add Freelancer</MenuItem>
                  <MenuItem component={RouterLink} to="/add-package" onClick={handleMenuClose}>Add Packages</MenuItem>
                </Menu>
              </>
            )}
            {user && ADMIN_EMAILS.includes(user.email) && (
              <Typography
                component={RouterLink}
                to="/admin"
                className={`navbar-link${location.pathname === '/admin' ? ' active' : ''}`}
                sx={{ fontWeight: 800, fontSize: '1rem' }}
              >
                Admin
              </Typography>
            )}
            {user ? (
              <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 800, ml: 2 }}>
                Logout
              </Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit" sx={{ fontWeight: 800, ml: 2 }}>
                  Login
                </Button>
                <Button component={RouterLink} to="/signup" color="inherit" sx={{ fontWeight: 800, ml: 1 }}>
                  Sign Up
                </Button>
              </>
            )}
          </Box>
          {/* Hamburger Icon for Mobile */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, ml: 1 }}
          >
            <MenuIcon size={28} color="#FF6B6B" />
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
          <ListItem
            button
            key="Cart"
            component={RouterLink}
            to="/cart"
            onClick={handleDrawerToggle}
            selected={location.pathname === '/cart'}
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
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <ListItemText primary="Cart" primaryTypographyProps={{ fontWeight: 800 }} />
          </ListItem>
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
          {user && (
            <>
              <ListItem button onClick={handleMenuOpen}>
                <ListItemText primary="Add Service" primaryTypographyProps={{ fontWeight: 800 }} />
              </ListItem>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={RouterLink} to="/add-camera" onClick={() => { handleDrawerToggle(); handleMenuClose(); }}>Add Camera</MenuItem>
                <MenuItem component={RouterLink} to="/add-accessory" onClick={() => { handleDrawerToggle(); handleMenuClose(); }}>Add Accessory</MenuItem>
                <MenuItem component={RouterLink} to="/add-freelancer" onClick={() => { handleDrawerToggle(); handleMenuClose(); }}>Add Freelancer</MenuItem>
                <MenuItem component={RouterLink} to="/add-package" onClick={() => { handleDrawerToggle(); handleMenuClose(); }}>Add Packages</MenuItem>
              </Menu>
            </>
          )}
          {user && ADMIN_EMAILS.includes(user.email) && (
            <ListItem button component={RouterLink} to="/admin" onClick={handleDrawerToggle}>
              <ListItemText primary="Admin" primaryTypographyProps={{ fontWeight: 800 }} />
            </ListItem>
          )}
          {user ? (
            <ListItem button onClick={() => { handleDrawerToggle(); handleLogout(); }}>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 800 }} />
            </ListItem>
          ) : (
            <>
              <ListItem button component={RouterLink} to="/login" onClick={handleDrawerToggle}>
                <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 800 }} />
              </ListItem>
              <ListItem button component={RouterLink} to="/signup" onClick={handleDrawerToggle}>
                <ListItemText primary="Sign Up" primaryTypographyProps={{ fontWeight: 800 }} />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar; 