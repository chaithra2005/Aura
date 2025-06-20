import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const Navbar = () => {
  return (
    <AppBar position="fixed" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CameraAltIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 2 }}>
              Chaithra
            </Typography>
          </Box>
          <Box>
            <Button color="inherit">Home</Button>
            <Button color="inherit">Cameras</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Contact</Button>
            <Button variant="contained" color="secondary" sx={{ ml: 2, borderRadius: 3, fontWeight: 600 }}>
              Rent Now
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 