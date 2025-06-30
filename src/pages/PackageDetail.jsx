import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useCart } from '../CartContext';
import packages from './Packages'; // We'll export the packages array from Packages.jsx

const PackageDetail = () => {
  const { id } = useParams();
  const pkg = packages[parseInt(id, 10)];
  const { addToCart } = useCart();

  if (!pkg) return <Typography>Package not found.</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 8, px: 2 }}>
      <Typography variant="h3" fontWeight={800} mb={2}>{pkg.title}</Typography>
      <Typography variant="h5" color="#FF6B6B" fontWeight={700} mb={2}>₹{pkg.price.replace('$', '')}</Typography>
      <Box component="ul" sx={{ pl: 2, color: '#666', mb: 3 }}>
        {pkg.details.map((detail, i) => (
          <Typography component="li" key={i} sx={{ mb: 1 }}>{detail}</Typography>
        ))}
      </Box>
      <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => addToCart({ ...pkg, type: 'package' })}>Add to Cart</Button>
      <Button variant="contained" color="secondary">Book Now</Button>
    </Box>
  );
};

export default PackageDetail; 