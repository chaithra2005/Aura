import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="fixed" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CameraAltIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 2, textDecoration: 'none', color: 'inherit' }}>
              Chaithra
            </Typography>
          </Box>
          <Box>
            <Button color="inherit" component={RouterLink} to="/">Home</Button>
            <Button color="inherit">Cameras</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Contact</Button>
            <Button variant="contained" color="secondary" sx={{ ml: 2, borderRadius: 3, fontWeight: 600 }} component={RouterLink} to="/add-camera">
              Add Camera
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 