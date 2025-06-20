import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dnqxxqemt/image/upload';
const UPLOAD_PRESET = 'unsigned_preset';

const AddCamera = ({ onCameraAdded }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !price) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    let imageUrl = PLACEHOLDER_IMAGE;
    try {
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          throw new Error('Image upload failed');
        }
      }
      // Save camera info to Firestore
      await addDoc(collection(db, 'cameras'), {
        name,
        price,
        imageUrl,
        createdAt: Timestamp.now(),
      });
      setName('');
      setPrice('');
      setImage(null);
      if (onCameraAdded) onCameraAdded();
    } catch (err) {
      console.error('Error adding camera:', err);
      setError('Failed to add camera. ' + (err.message || 'Please try again.'));
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 6, borderRadius: 4, boxShadow: 3 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
        Add Your Camera for Rent
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Camera Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="Price per Day (₹)"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Button variant="outlined" component="label">
          {image ? image.name : 'Upload Camera Image (optional)'}
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </Button>
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="secondary" disabled={loading} sx={{ fontWeight: 600, borderRadius: 3 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Camera'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCamera; 