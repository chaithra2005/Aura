import { Box, Container, Typography, Button, Paper } from '@mui/material';

const Hero = () => {
  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
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
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: '600px' }}>
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
          >
            Browse Cameras
          </Button>
        </Box>
      </Container>
    </Paper>
  );
};

export default Hero; 