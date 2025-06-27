import { Box, Container, Grid, Typography, Link } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#fff',
        color: '#333',
        py: { xs: 4, md: 8 },
        mt: 'auto',
        borderTop: '1px solid #eee'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CameraAltIcon sx={{ mr: 1, color: '#333', fontSize: 18 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Chaithra</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Capture your perfect moment with our high-quality equipment.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Quick Links
            </Typography>
            
            <Link href="#" display="block" sx={{ color: '#333', textDecoration: 'none', mb: 1, '&:hover': { color: '#FF6B6B' } }}>
              Camera Collection
            </Link>
            <Link href="#" display="block" sx={{ color: '#333', textDecoration: 'none', mb: 1, '&:hover': { color: '#FF6B6B' } }}>
              Rental Terms
            </Link>
            <Link href="#" display="block" sx={{ color: '#333', textDecoration: 'none', '&:hover': { color: '#FF6B6B' } }}>
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Contact Info
            </Typography>
            <Typography variant="body2" color="text.secondary">
              123 Camera Street<br />
              Photography City, PC 12345
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Email: info@camerarent.com<br />
              Phone: (123) 456-7890
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #eee', pt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Chaithra. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 