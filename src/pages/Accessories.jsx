import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Grid } from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Accessories = ({ user }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'accessories'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const accessoriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAccessories(accessoriesData);
      } catch (err) {
        console.error("Error fetching accessories: ", err);
        setAccessories([]);
      }
      setLoading(false);
    };
    fetchAccessories();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={800} fontFamily="Inter" color="#222">
          Camera Accessories
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {accessories.map(accessory => (
            <Grid item key={accessory.id} xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, display: 'flex', flexDirection: 'column', height: 450, justifyContent: 'space-between' }}>
                <Box>
                  {accessory.imageUrl && (
                    <Box sx={{ height: 200, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={accessory.imageUrl} alt={accessory.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </Box>
                  )}
                  <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#333" sx={{ minHeight: '2.5em' }}>{accessory.name}</Typography>
                  <Typography color="#666" sx={{ flexGrow: 1, mt: 1 }}>{accessory.description}</Typography>
                </Box>
                <Typography fontWeight={800} color="#FF6B6B" sx={{ mt: 2 }}>${accessory.price}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Accessories;