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
import QRCode from 'react-qr-code';
import loadRazorpayScript from '../utils/loadRazorpay';

const Checkout = ({ user }) => {
  const { cartItems, clearCart, removeFromCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cloudUrl, setCloudUrl] = useState('');
  const navigate = useNavigate();

  const isMobile = /Android|iPhone/i.test(navigator.userAgent);

  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.total || item.price * (item.rentDays || 1) * (item.quantity || 1)),
    0
  );

  const merchantUpiId = 'jitheshdas08@oksbi';
  const merchantName = 'CameraRental';
  const upiUrl =
    total > 0
      ? `upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${total}&cu=INR`
      : '';

  const handleRazorpayPayment = async () => {
    setError('');
    setSuccess('');
    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address)
      return setError('Please fill all customer details.');
    if (cartItems.length === 0) return setError('Your cart is empty.');

    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: 'rzp_test_1JNt4Bc4714bcV',
      amount: total * 100, // in paise
      currency: 'INR',
      name: 'Camera Rental',
      description: 'Rental Payment',
      image: '/images/The Canon EOS R5 Mark II sets a new standard for….jpeg', // fallback logo
      handler: function (response) {
        // On payment success, place the order
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
        card: false,
        netbanking: false,
        wallet: false,
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleOrder = async (paymentDetails = {}) => {
    setError('');
    setSuccess('');

    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address)
      return setError('Please fill all customer details.');
    if (paymentMethod === 'upi' && (!upiId || !paymentProof))
      return setError('Please enter UPI ID and upload payment screenshot.');
    if (cartItems.length === 0) return setError('Your cart is empty.');

    setLoading(true);
    setUploading(paymentMethod === 'upi');

    try {
      let paymentProofURL = '';
      if (paymentMethod === 'upi' && paymentProof) {
        const formData = new FormData();
        formData.append('file', paymentProof);
        formData.append('upload_preset', 'camera_rental');
        const cloudRes = await fetch(
          'https://api.cloudinary.com/v1_1/dnqxxqemt/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await cloudRes.json();
        if (!data.secure_url) throw new Error('Failed to upload screenshot.');
        paymentProofURL = data.secure_url;
        setCloudUrl(data.secure_url);
      }

      for (const item of cartItems) {
        await addDoc(collection(db, 'rentals'), {
          cameraId: item.id,
          cameraName: item.name,
          userId: user.uid,
          userEmail: user.email,
          rentDays: item.rentDays || 1,
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
    setUploading(false);
  };

  return loading ? (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
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
              ₹{item.price} × {item.rentDays || 1} day
              {(item.rentDays || 1) > 1 ? 's' : ''}
            </Typography>
            <Typography fontWeight={600} color="primary.main">
              Total: ₹{item.total || item.price * (item.rentDays || 1)}
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
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{ mt: 2 }}
          placeholder="Enter your 10-digit number"
        />
        <TextField
          fullWidth
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ mt: 2 }}
          multiline
          rows={3}
        />

        {/* Payment Method */}
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel>Payment Method</FormLabel>
          <RadioGroup
            row
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel
              value="cod"
              control={<Radio />}
              label="Cash on Delivery"
            />
            <FormControlLabel
              value="upi"
              control={<Radio />}
              label="Pay using UPI"
            />
          </RadioGroup>
        </FormControl>

        {/* UPI Payment Section */}
        {paymentMethod === 'upi' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2, fontWeight: 700, py: 1.5 }}
              onClick={handleRazorpayPayment}
            >
              Pay with UPI (Razorpay)
            </Button>
            <Typography variant="body2" mt={2}>
              You will be redirected to complete your UPI payment securely.
            </Typography>
          </Box>
        )}

        {/* Alerts */}
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
