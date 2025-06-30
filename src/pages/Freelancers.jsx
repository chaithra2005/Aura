import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCart } from '../CartContext';

const Freelancers = ({ user }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
    <Box sx={{ 
      width: '100%', 
      px: { xs: 2, md: 4 }, 
      py: 8 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 6 
      }}>
        <Typography variant="h3" fontWeight={800} fontFamily="Inter" color="#222">
          Freelancers
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {freelancers.map(freelancer => (
            <Box
              key={freelancer.id}
              onClick={() => navigate(`/freelancers/${freelancer.id}`)}
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
              {/* Image on the left */}
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
                mr: 2
              }}>
                {freelancer.imageUrl ? (
                  <img
                    src={freelancer.imageUrl}
                    alt={freelancer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                ) : (
                  <Typography color="#999" variant="body2">No Image</Typography>
                )}
              </Box>
              {/* Info on the right */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#222" sx={{ mb: 1 }}>
                  {freelancer.name}
                </Typography>
                <Typography color="#666" sx={{ mb: 1 }}>
                  {freelancer.service}
                </Typography>
                <Typography fontWeight={800} color="#FF6B6B" sx={{ fontSize: '1.2rem', mt: 'auto' }}>
                  ₹{freelancer.price} / hour
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    size="large"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ ...freelancer, type: 'freelancer' });
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
                      window.open(`mailto:${freelancer.email || 'info@camerarent.com'}`);
                    }}
                  >
                    Contact
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Freelancers; 