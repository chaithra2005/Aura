import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Grid, Button } from '@mui/material';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

const Accessories = ({ user }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 }, py: 8 }}>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {accessories.map(accessory => (
            <Box
              key={accessory.id}
              onClick={() => navigate(`/accessories/${accessory.id}`)}
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
                {accessory.imageUrl ? (
                  <img
                    src={accessory.imageUrl}
                    alt={accessory.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                ) : (
                  <Typography color="#999" variant="body2">No Image</Typography>
                )}
              </Box>
              {/* Info on the right */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Typography variant="h5" fontWeight={700} fontFamily="Inter" color="#222" sx={{ mb: 1 }}>
                  {accessory.name}
                </Typography>
                <Typography color="#666" sx={{ mb: 1 }}>
                  {accessory.description}
                </Typography>
                <Typography fontWeight={800} color="#FF6B6B" sx={{ fontSize: '1.2rem', mt: 'auto' }}>
                  ₹{accessory.price}
                </Typography>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{ fontWeight: 600, mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ ...accessory, type: 'accessory' });
                  }}
                >
                  Add to Cart
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Accessories;