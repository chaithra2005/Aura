import { Box, Container, Grid, Typography, Link } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CameraAltIcon sx={{ mr: 1 }} />
              <Typography variant="h6">CameraRent</Typography>
            </Box>
            <Typography variant="body2">
              Your trusted source for professional camera rentals.
              Capture your perfect moment with our high-quality equipment.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              About Us
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Camera Collection
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Rental Terms
            </Link>
            <Link href="#" color="inherit" display="block">
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Info
            </Typography>
            <Typography variant="body2" paragraph>
              123 Camera Street
              <br />
              Photography City, PC 12345
            </Typography>
            <Typography variant="body2" paragraph>
              Email: info@camerarent.com
              <br />
              Phone: (123) 456-7890
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} CameraRent. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 