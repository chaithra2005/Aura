import React from 'react';
import { Box, Typography, Container, Paper, Grid, Button } from '@mui/material';

const packages = [
  {
    title: 'Basic Photo Package',
    price: '$250',
    details: [
      '2-hour session',
      '50 edited photos',
      'Online gallery',
      '1 location',
    ],
  },
  {
    title: 'Standard Video Package',
    price: '$600',
    details: [
      '4-hour coverage',
      '3-5 minute highlight reel',
      'Full ceremony video',
      '2 videographers',
    ],
  },
  {
    title: 'Premium Combo Package',
    price: '$950',
    details: [
      '6-hour photo & video coverage',
      '150 edited photos',
      '5-7 minute highlight reel',
      'Drone footage',
    ],
  },
];

const Packages = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} fontFamily="Inter" color="#222" align="center" gutterBottom>
        Photo & Video Shoot Packages
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        Choose the perfect package for your needs. We offer a range of options for capturing your special moments.
      </Typography>
      <Grid container spacing={4}>
        {packages.map((pkg, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#333" gutterBottom>
                  {pkg.title}
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#FF6B6B" sx={{ my: 2 }}>
                  {pkg.price}
                </Typography>
                <Box component="ul" sx={{ pl: 2, color: '#666' }}>
                  {pkg.details.map((detail, i) => (
                    <Typography component="li" key={i} sx={{ mb: 1 }}>{detail}</Typography>
                  ))}
                </Box>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  bgcolor: '#FF6B6B',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#e55a5a' }
                }}
              >
                Book Now
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Packages; 