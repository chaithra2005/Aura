import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Divider, Grid, Fade } from '@mui/material';

const confettiColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6F91'];

const AnimatedCongrats = () => (
  <Box sx={{ position: 'relative', width: '100%', textAlign: 'center', mb: 4 }}>
    <Fade in timeout={1200}>
      <Typography
        variant="h2"
        fontWeight={900}
        sx={{
          color: '#4D96FF',
          letterSpacing: 2,
          textShadow: '0 4px 32px rgba(77,150,255,0.15)',
          mb: 2,
          fontSize: { xs: '2.5rem', md: '4rem' },
          animation: 'pop 1.2s cubic-bezier(.4,2,.6,1)'
        }}
        className="congrats-anim"
      >
        🎉 Congratulations!
      </Typography>
    </Fade>
    {/* Confetti dots */}
    <Box sx={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {[...Array(30)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60 + 10}%`,
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: confettiColors[i % confettiColors.length],
            opacity: 0.7,
            filter: 'blur(0.5px)',
            animation: `fall ${1.5 + Math.random()}s ${Math.random()}s ease-in-out infinite`,
          }}
        />
      ))}
    </Box>
    <style>{`
      @keyframes pop {
        0% { transform: scale(0.7) rotate(-8deg); opacity: 0; }
        60% { transform: scale(1.1) rotate(2deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes fall {
        0% { transform: translateY(-40px) scale(1.2); opacity: 0.7; }
        80% { opacity: 0.8; }
        100% { transform: translateY(60px) scale(1); opacity: 0; }
      }
    `}</style>
  </Box>
);

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const items = location.state?.items;
  const paymentMethod = location.state?.paymentMethod;
  const total = location.state?.total;

  if (!items) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7fafd' }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No order details found.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e0e7ff 0%, #f7fafd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 4 } }}>
      <Paper sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: { xs: 2, md: 6 }, borderRadius: 4, boxShadow: 6, bgcolor: '#fff', minHeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedCongrats />
        <Typography variant="h5" fontWeight={700} gutterBottom align="center" sx={{ mb: 3 }}>
          Your order has been placed successfully.
        </Typography>
        <Divider sx={{ my: 2, width: '100%' }} />
        <Typography variant="subtitle1" fontWeight={700} gutterBottom align="center">
          Order Details:
        </Typography>
        <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
          {items.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, textAlign: 'center', bgcolor: '#f7fafd' }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={item.imageUrls?.[0] || item.imageUrl || 'https://via.placeholder.com/180x120?text=No+Image'}
                    alt={item.name || item.title}
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(77,150,255,0.08)' }}
                  />
                </Box>
                <Typography fontWeight={700} sx={{ fontSize: '1.1rem' }}>{item.name || item.title}</Typography>
                <Typography color="text.secondary">Type: {item.type}</Typography>
                <Typography color="primary" fontWeight={700}>₹{item.price} x {item.quantity || 1}</Typography>
                {item.rentDays && <Typography color="text.secondary">Days: {item.rentDays}</Typography>}
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 2, width: '100%' }} />
        <Typography sx={{ fontSize: '1.2rem', mb: 1 }}>
          Payment Method: <b>{paymentMethod === 'razorpay_upi' ? 'UPI (Razorpay)' : 'Cash on Delivery'}</b>
        </Typography>
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#4D96FF', mb: 3 }}>
          Total Paid: ₹{total}
        </Typography>
        <Button variant="contained" size="large" sx={{ mt: 2, fontWeight: 700, borderRadius: 3, px: 5, py: 1.5, fontSize: '1.1rem', bgcolor: '#4D96FF', color: '#fff', boxShadow: '0 4px 24px 0 rgba(77,150,255,0.10)', '&:hover': { bgcolor: '#2563eb' } }} onClick={() => navigate('/')}>Back to Home</Button>
      </Paper>
    </Box>
  );
};

export default OrderConfirmation; 