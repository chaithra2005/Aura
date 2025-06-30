import { Box, Container, Typography, Button, Paper } from '@mui/material';

const Hero = () => {

  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: 'white',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/e0c2518f-5640-48c7-a0a8-4fd5552fef56.jpeg')`,
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', px: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Text Section */}
          <Box sx={{ maxWidth: { xs: '100%', md: '600px' }, zIndex: 2, py: { xs: 6, md: 10 } }}>
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Capture Your Perfect Moment
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Rent professional cameras and equipment for your next photoshoot.
              High-quality gear, flexible rental periods, and exceptional service.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 2, fontWeight: 600 }}
              onClick={handleScrollToServices}
            >
              Browse Cameras
            </Button>
          </Box>
          {/* Decorative Image Section (hidden on mobile) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'flex-start', justifyContent: 'flex-end', flex: 1, pl: 6, height: '100%' }}>
            <img
              src="/images/fuji analog fixed lens camera how to get film….jpeg"
              alt="Decorative Fuji Analog Camera"
              style={{
                height: '420px', // Adjust as needed to match text section
                width: 'auto',
                maxWidth: 380,
                borderRadius: 16,
                boxShadow: '0 8px 32px 0 rgba(51,51,51,0.10)',
                objectFit: 'cover',
                objectPosition: 'top', // Crop from bottom
                display: 'block',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default Hero; 