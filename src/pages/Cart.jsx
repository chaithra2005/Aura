import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { useCart } from '../CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 8, px: 2 }}>
      <Typography variant="h3" fontWeight={800} mb={4} align="center">Your Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography align="center" color="text.secondary">Your cart is empty.</Typography>
      ) : (
        <>
          {cartItems.map((item, idx) => (
            <Box key={item.id + item.type} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', borderRadius: 2, boxShadow: 1, p: 3, mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{item.name || item.title}</Typography>
                <Typography color="text.secondary">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Typography>
                <Typography color="#FF6B6B" fontWeight={800} sx={{ mt: 1 }}>₹{item.price} x {item.quantity || 1}</Typography>
              </Box>
              <Button color="error" variant="outlined" onClick={() => removeFromCart(item)}>Remove</Button>
            </Box>
          ))}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" fontWeight={800} align="right" mb={2}>Total: ₹{total}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" color="error" onClick={clearCart}>Clear Cart</Button>
            <Button variant="contained" color="primary">Checkout</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart; 