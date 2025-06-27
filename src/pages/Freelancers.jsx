import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Freelancers = ({ user }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'freelancers'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const freelancersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFreelancers(freelancersData);
      } catch (err) {
        console.error("Error fetching freelancers: ", err);
        setFreelancers([]);
      }
      setLoading(false);
    };
    fetchFreelancers();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={800} fontFamily="Inter" color="#222">
          Freelancers
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {freelancers.map(freelancer => (
            <Grid item key={freelancer.id} xs={12} sm={6} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, display: 'flex', flexDirection: 'column', height: 450, justifyContent: 'space-between' }}>
                <Box>
                  {freelancer.imageUrl && (
                    <Box sx={{ height: 200, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={freelancer.imageUrl} alt={freelancer.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </Box>
                  )}
                  <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#333" sx={{ minHeight: '2.5em' }}>{freelancer.name}</Typography>
                  <Typography color="#666" sx={{ flexGrow: 1, mt: 1 }}>{freelancer.service}</Typography>
                </Box>
                <Typography fontWeight={800} color="#FF6B6B" sx={{ mt: 2 }}>${freelancer.price} / hour</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Freelancers; 