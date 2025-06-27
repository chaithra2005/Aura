import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { Box, Paper, Typography, Button, CircularProgress, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, TextField, Alert } from '@mui/material';

const Checkout = ({ user }) => {
  const { cameraId } = useParams();
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentDays, setRentDays] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamera = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'cameras', cameraId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCamera({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Camera not found.');
        }
      } catch (err) {
        setError('Failed to fetch camera details.');
      }
      setLoading(false);
    };
    if (cameraId) fetchCamera();
  }, [cameraId]);

  const handleOrder = async () => {
    setError('');
    setSuccess('');
    if (!user) {
      setError('You must be logged in to rent a camera.');
      return;
    }
    if (paymentMethod === 'upi' && !upiId) {
      setError('Please enter your UPI ID.');
      return;
    }
    try {
      await addDoc(collection(db, 'rentals'), {
        cameraId: camera.id,
        cameraName: camera.name,
        userId: user.uid,
        userEmail: user.email,
        rentDays,
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : '',
        rentedAt: Timestamp.now(),
        status: 'pending',
      });
      setSuccess('Order placed successfully!');
      setTimeout(() => navigate('/featured'), 2000);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!camera) return null;

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Checkout</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">{camera.name}</Typography>
          <Typography color="text.secondary">₹{camera.price}/day</Typography>
        </Box>
        <TextField
          label="Rental Duration (days)"
          type="number"
          value={rentDays}
          onChange={e => setRentDays(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1, max: 30 }}
          sx={{ mb: 3 }}
          fullWidth
        />
        <Typography variant="h6" sx={{ mb: 1 }}>Total: ₹{camera.price * rentDays}</Typography>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup
            row
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
            <FormControlLabel value="upi" control={<Radio />} label="Pay using UPI" />
          </RadioGroup>
        </FormControl>
        {paymentMethod === 'upi' && (
          <TextField
            label="Your UPI ID"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, bgcolor: '#FF6B6B', '&:hover': { bgcolor: '#e55a5a' } }}
          onClick={handleOrder}
        >
          Place Order
        </Button>
      </Paper>
    </Box>
  );
};

export default Checkout; 