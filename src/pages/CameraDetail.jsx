import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {
  Box, Container, Typography, CircularProgress, Paper, Grid, Button, Chip,
  Accordion, AccordionSummary, AccordionDetails, IconButton,
  Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useCart } from '../CartContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const CameraDetail = () => {
  const { id } = useParams();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rentDays, setRentDays] = useState(1);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
    },
  ]);
  const [dateError, setDateError] = useState('');
  const { addToCart, replaceCartWithItem } = useCart();
  const navigate = useNavigate();

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex === 0 ? camera.imageUrls.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex === camera.imageUrls.length - 1 ? 0 : prevIndex + 1));
  };

  function isOverlap(start1, end1, start2, end2) {
    return (
      (start1 <= end2 && end1 >= start2)
    );
  }

  // Helper to get all disabled dates
  function getDisabledDates(bookedRanges) {
    const disabled = [];
    bookedRanges.forEach(range => {
      if (!range.start || !range.end) return;
      let current = new Date(range.start);
      const end = new Date(range.end);
      while (current <= end) {
        disabled.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return disabled;
  }
  const disabledDates = getDisabledDates(bookedRanges);

  const handleRentNow = () => {
    setDateError('');
    if (!selectedRange[0].startDate || !selectedRange[0].endDate) {
      setDateError('Please select both start and end dates.');
      return;
    }
    const start = new Date(selectedRange[0].startDate);
    const end = new Date(selectedRange[0].endDate);
    if (end < start) {
      setDateError('End date must be after start date.');
      return;
    }
    // Check for overlap
    for (const range of bookedRanges) {
      if (range.start && range.end && isOverlap(start, end, new Date(range.start), new Date(range.end))) {
        setDateError('Selected dates overlap with an existing booking.');
        return;
      }
    }
    const rentDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const total = camera.price * rentDays;
    replaceCartWithItem({ ...camera, type: 'camera', rentDays, rentStartDate: selectedRange[0].startDate, rentEndDate: selectedRange[0].endDate, total });
    navigate('/checkout');
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);

    const fetchCamera = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'cameras', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCamera({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Camera not found.');
        }
      } catch (err) {
        setError('Failed to fetch camera details.');
        console.error(err);
      }
      setLoading(false);
    };

    if (id) {
      fetchCamera();
    }
  }, [id]);

  useEffect(() => {
    // Fetch booked date ranges for this camera
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, 'rentals'), where('cameraId', '==', id));
        const snapshot = await getDocs(q);
        const ranges = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            start: data.rentStartDate,
            end: data.rentEndDate,
          };
        });
        setBookedRanges(ranges);
      } catch (err) {
        setBookedRanges([]);
      }
    };
    if (id) fetchBookings();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container sx={{ py: 8, textAlign: 'center' }}><Typography variant="h5" color="error">{error}</Typography></Container>;
  }

  if (!camera) return null;

  // Backward compatibility: handle both imageUrls (array) and imageUrl (single string)
  const imageSources = Array.isArray(camera.imageUrls) && camera.imageUrls.length > 0
    ? camera.imageUrls
    : (camera.imageUrl ? [camera.imageUrl] : []);

  return (
    <Box sx={{
      bgcolor: '#fff',
      color: '#333',
      py: { xs: 4, md: 8 },
      pt: { xs: '56px', md: '110px' }
    }}>
      <Container maxWidth={false} sx={{ width: '100%', px: 0 }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Left Side: Image Gallery */}
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
              {imageSources.length > 0 ? (
                <Box
                  component="img"
                  src={imageSources[activeImageIndex]}
                  alt={`${camera.name} image ${activeImageIndex + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                />
              ) : (
                <Typography>No Image Available</Typography>
              )}
              {imageSources.length > 1 && (
                <>
                  <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 16, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)'} }}>
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton onClick={handleNextImage} sx={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 16, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)'} }}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Paper>
          </Grid>

          {/* Right Side: Info Panel */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: '100px' }}>
              {/* <Chip label="New Arrival" sx={{ bgcolor: '#333', color: '#fff', mb: 2 }} /> */}
              <Typography variant="h1" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '2.5rem', mb: 2 }}>
                {camera.name}
              </Typography>
              
              {/* Pricing Card */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                ₹{camera.price}
                  <Box component="span" sx={{ fontSize: '1rem', fontWeight: 400, color: 'text.secondary' }}>/day</Box>
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="rent-duration-label">Rental Duration</InputLabel>
                  <Select
                    labelId="rent-duration-label"
                    value={rentDays}
                    label="Rental Duration"
                    onChange={(e) => setRentDays(e.target.value)}
                  >
                    {[...Array(7).keys()].map(i => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1} Day{i > 0 ? 's' : ''}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Date pickers for new booking */}
                <Box sx={{ mb: 2 }}>
                  <DateRange
                    editableDateInputs={true}
                    onChange={item => {
                      setSelectedRange([item.selection]);
                      setDateError('');
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={selectedRange}
                    minDate={new Date()}
                    disabledDates={disabledDates}
                    rangeColors={['#4D96FF']}
                  />
                </Box>
                {dateError && <Typography color="error" sx={{ mb: 2 }}>{dateError}</Typography>}
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: '#FF6B6B',
                    '&:hover': { bgcolor: '#e55a5a' },
                    color: '#fff',
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                  onClick={handleRentNow}
                >
                  Rent Now
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* --- Details Section --- */}
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          {camera.description && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  className="camera-description"
                  dangerouslySetInnerHTML={{ __html: camera.description }}
                  sx={{
                    lineHeight: 1.7,
                    color: '#666',
                    '& p': { mb: 2 },
                    '& ul, & ol': { pl: 3 },
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )}

          {camera.specs && Object.keys(camera.specs).length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Technical Specifications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  {Object.entries(camera.specs).map(([key, value]) => (
                    <Grid container key={key} sx={{ borderBottom: '1px solid #eee', py: 1.5 }}>
                      <Grid item xs={6}><Typography sx={{ fontWeight: 'bold' }}>{key}</Typography></Grid>
                      <Grid item xs={6}><Typography>{value}</Typography></Grid>
                    </Grid>
                  ))}
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CameraDetail; 