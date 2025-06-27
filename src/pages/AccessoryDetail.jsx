import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box, Container, Typography, CircularProgress, Paper, Grid, Button
} from '@mui/material';

const AccessoryDetail = () => {
  const { id } = useParams();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchAccessory = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'accessories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAccessory({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Accessory not found.');
        }
      } catch (err) {
        setError('Failed to fetch accessory details.');
        console.error(err);
      }
      setLoading(false);
    };

    if (id) {
      fetchAccessory();
    }
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 8, textAlign: 'center' }}><Typography variant="h5" color="error">{error}</Typography></Container>;
  }

  if (!accessory) return null;

  return (
    <Box sx={{
      bgcolor: '#fff',
      color: '#333',
      py: { xs: 4, md: 8 },
      pt: { xs: '56px', md: '110px' }
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                height: { xs: 300, sm: 400, md: 500 },
                bgcolor: '#f0f0f0'
              }}
            >
              {accessory.imageUrl ? (
                <Box
                  component="img"
                  src={accessory.imageUrl}
                  alt={accessory.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Typography>No Image Available</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
              <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                {accessory.name}
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                {accessory.description}
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#FF6B6B" sx={{ my: 2 }}>
                ${accessory.price}
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
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
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AccessoryDetail; 