import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box, CircularProgress, Chip, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useCart } from '../CartContext';

const FeaturedCameras = ({ refresh, user }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  const filteredCameras = selectedCompany === 'All' 
    ? cameras 
    : cameras.filter(camera => camera.company === selectedCompany);

  const companies = ['All', 'Nikon', 'Canon', 'Sony'];

  return (
    <Box sx={{ width: '100vw', px: 0, py: 8, margin: 0 }}>
      <Box sx={{ width: '100%', p: 0, minWidth: 0 }}>
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="company-filter-label">Filter by Company</InputLabel>
            <Select
              labelId="company-filter-label"
              value={selectedCompany}
              label="Filter by Company"
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {companies.map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {filteredCameras.map((camera) => (
              <Box
                key={camera.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  bgcolor: '#fff',
                  borderRadius: 2,
                  boxShadow: 2,
                  p: 4,
                  mb: 3,
                  width: '100%',
                  minHeight: 240,
                  border: '1px solid #eee',
                  gap: 4
                }}
              >
                {/* Image on the left */}
                <Box sx={{
                  width: 280,
                  height: 240,
                  minWidth: 180,
                  minHeight: 240,
                  maxWidth: 280,
                  maxHeight: 240,
                  bgcolor: '#f8f8f8',
                  borderRadius: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3
                }}>
                  <img
                    src={
                      (camera.imageUrls && camera.imageUrls.length > 0)
                        ? camera.imageUrls[0]
                        : camera.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
                    }
                    alt={camera.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
                {/* Info on the right */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <Typography variant="h4" fontWeight={700} fontFamily="Inter" color="#222" sx={{ mb: 2 }}>
                    {camera.name}
                  </Typography>
                  <Typography color="#666" sx={{ mb: 2, fontSize: '1.2rem' }}>
                    {camera.company}
                  </Typography>
                  <Typography fontWeight={800} color="#FF6B6B" sx={{ fontSize: '1.5rem', mt: 'auto' }}>
                    ₹{camera.price}/day
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      size="large"
                      className="dark-action-btn"
                      sx={{ fontWeight: 600 }}
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
                      size="large"
                      className="dark-action-btn"
                      sx={{ fontWeight: 600 }}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                        } else {
                          navigate(`/checkout/${camera.id}`);
                        }
                      }}
                    >
                      Rent Now
                    </Button>
                    <Button
                      size="large"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                      onClick={() => addToCart({ ...camera, type: 'camera' })}
                    >
                      Add to Cart
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeaturedCameras; 