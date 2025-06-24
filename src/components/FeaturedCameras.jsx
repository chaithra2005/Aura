import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box, CircularProgress, Chip, Paper } from '@mui/material';

const FeaturedCameras = ({ refresh, user }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCameras = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'cameras'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userCameras = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCameras(userCameras);
      } catch (err) {
        setCameras([]);
      }
      setLoading(false);
    };
    fetchCameras();
  }, [refresh]);

  return (
    <Container className="product-grid-container" sx={{ py: 8 }} maxWidth="lg">
      <Paper elevation={1} sx={{ p: 0, borderRadius: 2, boxShadow: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', width: '100%', justifyContent: 'space-between', minHeight: 600 }}>
          {/* Product grid */}
          <Box sx={{ flex: 3, p: { xs: 2, md: 6 }, pr: { md: 4 }, minWidth: 0 }}>
            <Typography
              component="h2"
              variant="h3"
              align="center"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700 }}
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
                  <Grid item key={camera.id} xs={12} sm={6} md={4} display="flex">
                    <Card
                      className="product-card"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        height: 'auto',
                        minHeight: { xs: 380, md: 440 },
                        position: 'relative',
                        overflow: 'hidden',
                        p: { xs: 2, md: 3 },
                        gap: 2,
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div className="card-accent" />
                      <Chip label="New" size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#FF6B6B', color: '#fff', fontWeight: 700 }} />
                      <Box className="product-image-bg" sx={{ height: { xs: 110, md: 170 }, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={
                            (camera.imageUrls && camera.imageUrls.length > 0)
                              ? camera.imageUrls[0]
                              : camera.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
                          }
                          alt={camera.name}
                          className="product-image"
                          style={{ objectFit: 'contain', maxHeight: '100%', maxWidth: '100%' }}
                        />
                      </Box>
                      <CardContent className="product-info" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: '0 !important', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography gutterBottom variant="h5" component="h2" align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {camera.name}
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                          <Typography
                            variant="h6"
                            align="center"
                            sx={{ color: '#FF6B6B', fontWeight: 700, width: '100%' }}
                          >
                            ₹{camera.price}/day
                          </Typography>
                          <CardActions
                            sx={{
                              justifyContent: 'center',
                              gap: 2,
                              p: 0,
                            }}
                          >
                            <Button
                              size="medium"
                              className="dark-action-btn"
                              sx={{ flex: 1, minHeight: 44, fontWeight: 600, width: '100%' }}
                              onClick={() => {
                                if (!user) {
                                  navigate('/login');
                                } else {
                                  navigate(`/camera/${camera.id}`);
                                }
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="medium"
                              className="dark-action-btn"
                              sx={{ flex: 1, minHeight: 44, fontWeight: 600, width: '100%' }}
                              onClick={() => {
                                if (!user) {
                                  navigate('/login');
                                } else {
                                  // Add Rent Now logic here for logged in users
                                }
                              }}
                            >
                              Rent Now
                            </Button>
                          </CardActions>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeaturedCameras; 