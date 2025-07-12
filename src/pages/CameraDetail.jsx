import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import {
  Box, Container, Typography, CircularProgress, Paper, Grid, Button, Chip,
  Accordion, AccordionSummary, AccordionDetails, IconButton,
  Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useCart } from '../CartContext';

const CameraDetail = () => {
  const { id } = useParams();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rentStartDate, setRentStartDate] = useState(null);
  const [rentEndDate, setRentEndDate] = useState(null);
  const [bookedDatesMap, setBookedDatesMap] = useState([]);
  const [dateError, setDateError] = useState('');
  const { addToCart, replaceCartWithItem } = useCart();
  const navigate = useNavigate();

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex === 0 ? camera.imageUrls.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex === camera.imageUrls.length - 1 ? 0 : prevIndex + 1));
  };

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

  const handleRentNow = () => {
    setDateError('');
    if (!rentStartDate || !rentEndDate) {
      setDateError('Please select both start and end dates.');
      return;
    }
    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);
    if (end < start) {
      setDateError('End date must be after start date.');
      return;
    }
    // Check for overlap
    for (const range of bookedDatesMap) {
      if (range.start && range.end) {
        const rangeStart = new Date(range.start);
        const rangeEnd = new Date(range.end);
        if ((start <= rangeEnd && end >= rangeStart)) {
          setDateError('Selected dates overlap with an existing booking.');
          return;
        }
      }
    }
    const rentDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const total = camera.price * rentDays;
    replaceCartWithItem({ 
      ...camera, 
      type: 'camera', 
      rentDays, 
      rentStartDate: rentStartDate, 
      rentEndDate: rentEndDate, 
      total,
      dailyPrice: camera.price
    });
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
          // Handle Firestore Timestamp objects
          const start = data.rentStartDate?.toDate ? data.rentStartDate.toDate() : new Date(data.rentStartDate);
          const end = data.rentEndDate?.toDate ? data.rentEndDate.toDate() : new Date(data.rentEndDate);
          return {
            start,
            end,
          };
        });
        setBookedDatesMap(ranges);
        console.log('Booked dates for camera:', id, ranges);
      } catch (err) {
        setBookedDatesMap([]);
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
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
                  
                  {/* Date Selection */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Select Rental Period:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <DatePicker
                        label="Start Date"
                        value={rentStartDate ? dayjs(rentStartDate) : null}
                        onChange={(newValue) => {
                          const startDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                          setRentStartDate(startDate);
                          setDateError('');
                        }}
                        minDate={dayjs()}
                        maxDate={rentEndDate ? dayjs(rentEndDate) : null}
                        shouldDisableDate={(date) => {
                          // Disable dates that are already booked
                          const dateStr = date.format('YYYY-MM-DD');
                          const isDisabled = bookedDatesMap.some(range => {
                            if (!range.start || !range.end) return false;
                            const rangeStart = dayjs(range.start);
                            const rangeEnd = dayjs(range.end);
                            const checkDate = dayjs(dateStr);
                            return checkDate.isBetween(rangeStart, rangeEnd, 'day', '[]');
                          });
                          if (isDisabled) {
                            console.log(`Date ${dateStr} is disabled for camera ${id}`);
                          }
                          return isDisabled;
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: { flex: 1 }
                          }
                        }}
                      />
                      <DatePicker
                        label="End Date"
                        value={rentEndDate ? dayjs(rentEndDate) : null}
                        onChange={(newValue) => {
                          const endDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                          setRentEndDate(endDate);
                          setDateError('');
                        }}
                        minDate={rentStartDate ? dayjs(rentStartDate) : dayjs()}
                        shouldDisableDate={(date) => {
                          // Disable dates that are already booked
                          const dateStr = date.format('YYYY-MM-DD');
                          const isDisabled = bookedDatesMap.some(range => {
                            if (!range.start || !range.end) return false;
                            const rangeStart = dayjs(range.start);
                            const rangeEnd = dayjs(range.end);
                            const checkDate = dayjs(dateStr);
                            return checkDate.isBetween(rangeStart, rangeEnd, 'day', '[]');
                          });
                          if (isDisabled) {
                            console.log(`Date ${dateStr} is disabled for camera ${id}`);
                          }
                          return isDisabled;
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: { flex: 1 }
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      💡 Select your start date first, then your end date
                    </Typography>
                    <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                      ⚠️ Grayed out dates are already booked and unavailable
                    </Typography>
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
    </LocalizationProvider>
  );
};

export default CameraDetail; 