import React from 'react';
import { Box, Typography, Container, Paper, Grid, Button } from '@mui/material';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

export const packages = [
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
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: 8 }}>
      <Typography variant="h3" fontWeight={800} fontFamily="Inter" color="#222" align="center" gutterBottom>
        Photo & Video Shoot Packages
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
        Choose the perfect package for your needs. We offer a range of options for capturing your special moments.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {packages.map((pkg, index) => (
          <Box
            key={index}
            onClick={() => navigate(`/packages/${index}`)}
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 },
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: 2,
              p: 2,
              mb: 2,
              width: '100%',
              minHeight: 160,
              border: '1px solid #eee',
              gap: 3
            }}
          >
            {/* Icon on the left */}
            <Box sx={{
              width: 120,
              height: 160,
              minWidth: 120,
              minHeight: 160,
              maxWidth: 120,
              maxHeight: 160,
              bgcolor: '#f8f8f8',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: 64
            }}>
              <span role="img" aria-label="package">📦</span>
            </Box>
            {/* Info on the right */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#222" sx={{ mb: 1 }}>
                {pkg.title}
              </Typography>
              <Typography color="#666" sx={{ mb: 1 }}>
                {pkg.details.join(' | ')}
              </Typography>
              <Typography fontWeight={800} color="#FF6B6B" sx={{ fontSize: '1.2rem', mt: 'auto' }}>
                ₹{pkg.price.replace('$', '')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ ...pkg, type: 'package' });
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  size="large"
                  className="dark-action-btn"
                  sx={{ fontWeight: 600 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Book Now logic here
                  }}
                >
                  Book Now
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Packages; 