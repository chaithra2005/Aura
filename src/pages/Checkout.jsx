import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection, Timestamp, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { useCart } from '../CartContext';
import loadRazorpayScript from '../utils/loadRazorpay';
import LocationPicker from '../components/LocationPicker';

const Checkout = ({ user }) => {
  const { cartItems, clearCart, removeFromCart, updateCartItemDates } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();

  // Remove local cartDateRanges state
  // Use cartItems from context for the calendar's ranges prop
  // On date selection, call updateCartItemDates only
  const allDatesSelected = cartItems.every(item => item.rentStartDate && item.rentEndDate);

  // Remove rentStartDate and rentEndDate state and inputs.
  // For each cart item, display the rental period (item.rentStartDate to item.rentEndDate) and calculate rentDays from these values.
  // Use rentDays for price calculations and display.
  const total = cartItems.reduce(
    (sum, item) => {
      const startDate = new Date(item.rentStartDate);
      const endDate = new Date(item.rentEndDate);
      const rentDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
      return sum + (item.price * rentDays);
    },
    0
  );

  const [bookedDatesMap, setBookedDatesMap] = useState({}); // { [cameraId]: [disabledDates] }

  // Fetch booked dates for all cart items missing dates
  useEffect(() => {
    async function fetchAllBookedDates() {
      const newMap = {};
      for (const item of cartItems) {
        if (!item.rentStartDate || !item.rentEndDate) {
          const q = query(collection(db, 'rentals'), where('cameraId', '==', item.id));
          const snapshot = await getDocs(q);
          const bookedRanges = snapshot.docs.map(doc => {
            const data = doc.data();
            // Handle Firestore Timestamp objects
            const start = data.rentStartDate?.toDate ? data.rentStartDate.toDate() : new Date(data.rentStartDate);
            const end = data.rentEndDate?.toDate ? data.rentEndDate.toDate() : new Date(data.rentEndDate);
            return { start, end };
          });
          // Helper to get all disabled dates
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
          newMap[item.id] = disabled;
        }
      }
      setBookedDatesMap(newMap);
      console.log('Booked dates map:', newMap);
    }
    fetchAllBookedDates();
  }, [cartItems]);

  // Fetch user profile data on component mount (name and phone only)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.email) {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.email));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            setName(profileData.name || '');
            setPhone(profileData.phone || '');
            // Don't auto-fill address from profile
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
      setProfileLoaded(true);
    };
    fetchUserProfile();
  }, [user]);

  // Handle location selection from LocationPicker
  const handleLocationSelect = (selectedAddress, selectedCoordinates) => {
    setAddress(selectedAddress);
    setCoordinates(selectedCoordinates);
  };

  const handleRazorpayPayment = async () => {
    setError('');
    setSuccess('');
    if (!user) return setError('You must be logged in to rent items.');
    if (!name || !phone || !address)
      return setError('Please fill all required fields.');
    if (cartItems.length === 0) return setError('Your cart is empty.');
    if (!allDatesSelected) return setError('Please select rental dates for all items.');

    const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError('Razorpay SDK failed to load.');
      return;
    }

    const options = {
      key: 'rzp_live_hyjT9nUfMniPJh', // Updated to live Razorpay key
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
    if (!name || !phone || !address)
      return setError('Please fill all required fields.');
    if (cartItems.length === 0) return setError('Your cart is empty.');
    if (!allDatesSelected) return setError('Please select rental dates for all items.');

    setLoading(true);

    try {
      for (const item of cartItems) {
        const startDate = new Date(item.rentStartDate);
        const endDate = new Date(item.rentEndDate);
        const rentDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day

        await addDoc(collection(db, 'rentals'), {
          cameraId: item.id,
          cameraName: item.name,
          dailyPrice: item.price, // Store the daily price
          userId: user.uid,
          userEmail: user.email,
          rentStartDate: startDate, // Store as Date object
          rentEndDate: endDate, // Store as Date object
          paymentMethod: paymentDetails.paymentMethod || paymentMethod,
          razorpayPaymentId: paymentDetails.paymentId || '',
          name,
          phone,
          address,
          coordinates: coordinates ? {
            latitude: coordinates.lat,
            longitude: coordinates.lng
          } : null,
          rentedAt: Timestamp.now(),
          status: 'pending',
        });
      }

      clearCart();
      setSuccess('Order placed successfully!');
      setTimeout(() => navigate('/order-confirmation', { state: { items: cartItems, paymentMethod: paymentDetails.paymentMethod || paymentMethod, total: total } }), 2000);
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, mb: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Checkout
          </Typography>

          {cartItems.map((item) => {
            const startDate = new Date(item.rentStartDate);
            const endDate = new Date(item.rentEndDate);
            const rentDays = (startDate && endDate)
              ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
              : 0;
            console.log('Rendering item:', item, 'startDate:', startDate, 'endDate:', endDate, 'rentDays:', rentDays);
            return (
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
                {item.rentStartDate && item.rentEndDate ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography>
                      Rental Period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        // Clear the dates to show the date pickers again
                        updateCartItemDates(item.id, item.type, null, null);
                      }}
                      sx={{ 
                        fontSize: '0.75rem', 
                        py: 0.5, 
                        px: 1.5,
                        minWidth: 'auto'
                      }}
                    >
                      Change Dates
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Select Rental Period:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <DatePicker
                        label="Start Date"
                        value={item.rentStartDate ? dayjs(item.rentStartDate) : null}
                        onChange={(newValue) => {
                          const startDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                          updateCartItemDates(item.id, item.type, startDate, item.rentEndDate);
                        }}
                        minDate={dayjs()}
                        maxDate={item.rentEndDate ? dayjs(item.rentEndDate) : null}
                        shouldDisableDate={(date) => {
                          // Disable dates that are already booked
                          const dateStr = date.format('YYYY-MM-DD');
                          const isDisabled = bookedDatesMap[item.id]?.some(bookedDate => {
                            const bookedDateStr = dayjs(bookedDate).format('YYYY-MM-DD');
                            return bookedDateStr === dateStr;
                          });
                          if (isDisabled) {
                            console.log(`Date ${dateStr} is disabled for item ${item.id}`);
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
                        value={item.rentEndDate ? dayjs(item.rentEndDate) : null}
                        onChange={(newValue) => {
                          const endDate = newValue ? newValue.format('YYYY-MM-DD') : null;
                          updateCartItemDates(item.id, item.type, item.rentStartDate, endDate);
                        }}
                        minDate={item.rentStartDate ? dayjs(item.rentStartDate) : dayjs()}
                        shouldDisableDate={(date) => {
                          // Disable dates that are already booked
                          const dateStr = date.format('YYYY-MM-DD');
                          const isDisabled = bookedDatesMap[item.id]?.some(bookedDate => {
                            const bookedDateStr = dayjs(bookedDate).format('YYYY-MM-DD');
                            return bookedDateStr === dateStr;
                          });
                          if (isDisabled) {
                            console.log(`Date ${dateStr} is disabled for item ${item.id}`);
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
                )}
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
            );
          })}

          <Typography variant="h6" mt={2}>
            Total: ₹{total}
          </Typography>

          {/* Customer Info */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Customer Information
          </Typography>
          <TextField 
            fullWidth 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            sx={{ mt: 2 }} 
            placeholder={profileLoaded && !name ? "Enter your name" : ""}
          />
          <TextField 
            fullWidth 
            label="Phone Number" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            sx={{ mt: 2 }} 
            placeholder={profileLoaded && !phone ? "Enter your phone number" : ""}
          />
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Delivery Address
          </Typography>
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialAddress={address}
          />
          {profileLoaded && (name || phone) && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              💡 Your name and phone number have been auto-filled from your profile. You can edit if needed.
            </Typography>
          )}

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
            onClick={paymentMethod === 'upi' ? handleRazorpayPayment : handleOrder}
            disabled={!allDatesSelected}
          >
            {paymentMethod === 'upi' ? 'Place Order & Pay with UPI' : 'Place Order'}
          </Button>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default Checkout;
