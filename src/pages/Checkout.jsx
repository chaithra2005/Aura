import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GpayImg from '../assets/gpay.jpg';
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

const Checkout = ({ user }) => {
  const { cartItems, clearCart } = useCart();
  const [rentDays, setRentDays] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const handleOrder = async () => {
    setError('');
    setSuccess('');

    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address)
      return setError('Please fill all customer details.');
    if (paymentMethod === 'upi' && (!upiId || !paymentProof))
      return setError('Please enter UPI ID and upload payment screenshot.');
    if (cartItems.length === 0) return setError('Your cart is empty.');

    setLoading(true);
    try {
      let paymentProofURL = '';
      if (paymentMethod === 'upi' && paymentProof) {
        const storageRef = ref(
          storage,
          `payments/${user.uid}_${Date.now()}_${paymentProof.name}`
        );
        const snapshot = await uploadBytes(storageRef, paymentProof);
        paymentProofURL = await getDownloadURL(snapshot.ref);
      }

      for (const item of cartItems) {
        await addDoc(collection(db, 'rentals'), {
          cameraId: item.id,
          cameraName: item.name,
          userId: user.uid,
          userEmail: user.email,
          rentDays,
          paymentMethod,
          upiId: paymentMethod === 'upi' ? upiId : '',
          paymentProofURL: paymentMethod === 'upi' ? paymentProofURL : '',
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
      setError('Failed to place order.');
    }
    setLoading(false);
  };

  const handleRentDaysChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setRentDays(value);
    } else if (e.target.value === '') {
      setRentDays('');
    }
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
          <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography fontWeight={700}>{item.name}</Typography>
            <Typography>
              ₹{item.price} × {item.quantity || 1}
            </Typography>
          </Box>
        ))}

        <Typography variant="h6" mt={2}>Total: ₹{total}</Typography>

        {/* Customer Info */}
        <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 2 }} />
        <TextField fullWidth label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mt: 2 }} placeholder="Enter your 10-digit number" />
        <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} sx={{ mt: 2 }} multiline rows={3} />
        <TextField fullWidth label="Rental Duration (days)" type="number" value={rentDays} onChange={handleRentDaysChange} sx={{ mt: 2 }} inputProps={{ min: 1 }} />

        {/* Payment Method */}
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel>Payment Method</FormLabel>
          <RadioGroup row value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
            <FormControlLabel value="upi" control={<Radio />} label="Pay using UPI" />
          </RadioGroup>
        </FormControl>
{paymentMethod === 'upi' && (
  <>
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>
        Scan the QR Code to Pay
      </Typography>
      <img
        src={GpayImg}
        alt="UPI QR Code"
        style={{ width: '200px', height: '200px', borderRadius: '8px' }}
      />
    </Box>

    <TextField
      fullWidth
      type="file"
      label="Upload Payment Screenshot"
      InputLabelProps={{ shrink: true }}
      inputProps={{ accept: 'image/*' }}
      onChange={(e) => setPaymentProof(e.target.files[0])}
      sx={{ mt: 2 }}
    />
  </>
)}


        {/* Alerts */}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

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
