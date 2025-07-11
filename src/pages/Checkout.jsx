import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import { useCart } from '../CartContext';
import loadRazorpayScript from '../utils/loadRazorpay';

const Checkout = ({ user }) => {
  const { cartItems, clearCart, removeFromCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentDays, setRentDays] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price * rentDays * (item.quantity || 1)),
    0
  );

  const handleRazorpayPayment = async () => {
    setError('');
    setSuccess('');
    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address || !rentStartDate || rentDays <= 0)
      return setError('Please fill all required fields.');
    if (cartItems.length === 0) return setError('Your cart is empty.');

    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load.');
      return;
    }

    const options = {
      key: 'rzp_test_9gpLmkr3hSpOrL', // Replace with your Razorpay test key
      amount: total * 100,
      currency: 'INR',
      name: 'Camera Rental',
      description: 'Rental Payment',
      handler: function (response) {
        handleOrder({
          paymentId: response.razorpay_payment_id,
          paymentMethod: 'razorpay_upi',
        });
      },
      prefill: {
        email: user.email,
      },
      theme: {
        color: '#3399cc',
      },
      method: {
        upi: true,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleOrder = async (paymentDetails = {}) => {
    setError('');
    setSuccess('');

    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address || !rentStartDate || rentDays <= 0)
      return setError('Please fill all required fields.');
    if (cartItems.length === 0) return setError('Your cart is empty.');

    setLoading(true);

    try {
      for (const item of cartItems) {
        await addDoc(collection(db, 'rentals'), {
          cameraId: item.id,
          cameraName: item.name,
          userId: user.uid,
          userEmail: user.email,
          rentStartDate,
          rentDays,
          paymentMethod: paymentDetails.paymentMethod || paymentMethod,
          razorpayPaymentId: paymentDetails.paymentId || '',
          name,
          phone,
          address,
          rentedAt: Timestamp.now(),
          status: 'pending',
        });
      }

      clearCart();
      setSuccess('Order placed successfully!');
      setTimeout(() => navigate('/featured'), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to place order. ' + (err.message || ''));
    }

    setLoading(false);
  };

  return loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Checkout
        </Typography>

        {cartItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 2,
              position: 'relative',
            }}
          >
            <Typography fontWeight={700}>{item.name}</Typography>
            <Typography>
              ₹{item.price} × {rentDays} day{rentDays > 1 ? 's' : ''}
            </Typography>
            <Typography fontWeight={600} color="primary.main">
              Total: ₹{item.price * rentDays}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => removeFromCart(item)}
            >
              Remove
            </Button>
          </Box>
        ))}

        <Typography variant="h6" mt={2}>
          Total: ₹{total}
        </Typography>

        {/* Customer Info */}
        <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 2 }} />
        <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mt: 2 }} />
        <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mt: 2 }} multiline rows={3} />

        {/* Rent Date */}
        <TextField
          fullWidth
          type="date"
          label="Start Date"
          value={rentStartDate}
          onChange={(e) => setRentStartDate(e.target.value)}
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          type="number"
          label="Number of Days"
          value={rentDays}
          onChange={(e) => setRentDays(parseInt(e.target.value))}
          sx={{ mt: 2 }}
          inputProps={{ min: 1 }}
        />

        {/* Payment Method */}
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel>Payment Method</FormLabel>
          <RadioGroup
            row
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
            <FormControlLabel value="upi" control={<Radio />} label="Pay using UPI (Razorpay)" />
          </RadioGroup>
        </FormControl>

        {paymentMethod === 'upi' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              sx={{ fontWeight: 700, py: 1.5 }}
              onClick={handleRazorpayPayment}
            >
              Pay with UPI (Razorpay)
            </Button>
            <Typography variant="body2" mt={2}>
              You will be redirected to complete your UPI payment securely.
            </Typography>
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, fontWeight: 700, py: 1.5 }}
          onClick={handleOrder}
        >
          Place Order
        </Button>
      </Paper>
    </Box>
  );
};

export default Checkout;
