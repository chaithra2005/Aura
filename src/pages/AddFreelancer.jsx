import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const AddFreelancer = ({ user }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!user) {
      setError('You must be logged in to add a freelancer.');
      return;
    }
    if (!name || !service || !price || !image) {
      setError('Please fill all fields and upload an image.');
      return;
    }
    setLoading(true);
    
    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'camera_rental');
        const response = await fetch('https://api.cloudinary.com/v1_1/dnqxxqemt/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
          imageUrl = data.secure_url;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      await addDoc(collection(db, 'freelancers'), {
        name,
        service,
        price: parseFloat(price),
        imageUrl,
        createdAt: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email,
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/freelancers'), 1200);
    } catch (err) {
      console.error("Error adding freelancer: ", err);
      setError('Failed to add freelancer. ' + (err.message || ''));
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto', mt: 6, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight={800} fontFamily="Inter">
        Add Freelancer
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <TextField label="Freelancer Name" value={name} onChange={e => setName(e.target.value)} required />
        <TextField label="Service Description" value={service} onChange={e => setService(e.target.value)} multiline minRows={3} required />
        <TextField label="Price per Hour ($)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        <Button variant="outlined" component="label" sx={{ fontWeight: 700, borderRadius: 2, color: '#FF6B6B', borderColor: '#FF6B6B', '&:hover': { bgcolor: '#FFF0F0' } }}>
          Upload Image
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </Button>
        {image && <Typography color="#666">Selected: {image.name}</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">Freelancer added!</Typography>}
        <Button type="submit" variant="contained" sx={{ bgcolor: '#FF6B6B', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: 'none', '&:hover': { bgcolor: '#e55a5a' } }} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Freelancer'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddFreelancer; 