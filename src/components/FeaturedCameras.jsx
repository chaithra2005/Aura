import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, addDoc } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box, CircularProgress } from '@mui/material';

const defaultCameras = [
  {
    id: '1',
    name: 'Fuji Analog Fixed Lens Camera',
    imageUrl: '/images/fuji analog fixed lens camera how to get film….jpeg',
    price: '35',
    description: 'Perfect for vintage photography enthusiasts. Includes film roll.',
  },
  {
    id: '2',
    name: 'Canon EOS R5 Mark II',
    imageUrl: '/images/The Canon EOS R5 Mark II sets a new standard for….jpeg',
    price: '75',
    description: 'Professional-grade mirrorless camera with 8K video capabilities.',
  },
  {
    id: '3',
    name: 'Professional DSLR Kit',
    imageUrl: '/images/e0c2518f-5640-48c7-a0a8-4fd5552fef56.jpeg',
    price: '55',
    description: 'Complete DSLR kit with multiple lenses and accessories.',
  },
];

const FeaturedCameras = ({ refresh }) => {
  const [cameras, setCameras] = useState(defaultCameras);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCameras = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'cameras'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userCameras = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCameras([...userCameras, ...defaultCameras]);
      } catch (err) {
        setCameras(defaultCameras);
      }
      setLoading(false);
    };
    fetchCameras();
  }, [refresh]);

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography
        component="h2"
        variant="h3"
        align="center"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Featured Cameras
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Choose from our selection of high-quality cameras for your next project
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {cameras.map((camera) => (
            <Grid item key={camera.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: 250,
                    objectFit: 'cover',
                  }}
                  image={camera.imageUrl}
                  alt={camera.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {camera.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {camera.description || ''}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" color="primary">
                      ₹{camera.price}/day
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                  <Button size="small" variant="contained" color="secondary">
                    Rent Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FeaturedCameras; 