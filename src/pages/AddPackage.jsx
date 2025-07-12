import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const AddPackage = ({ user }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!user) {
      setError('You must be logged in to add a package.');
      return;
    }
    if (!title || !details || !price || images.length === 0 || !contactName || !contactEmail || !contactPhone) {
      setError('Please fill all fields and upload at least one image.');
      return;
    }
    setLoading(true);
    try {
      // Upload images to Cloudinary (or your image host)
      const imageUrls = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'camera_rental');
        const response = await fetch('https://api.cloudinary.com/v1_1/dnqxxqemt/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
          imageUrls.push(data.secure_url);
        } else {
          throw new Error('Image upload failed.');
        }
      }
      await addDoc(collection(db, 'packages'), {
        title,
        details,
        price: parseFloat(price),
        imageUrls,
        contactName,
        contactEmail,
        contactPhone,
        createdAt: Timestamp.now(),
        userId: user.uid,
        userEmail: user.email,
      });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/packages'), 1200);
    } catch (err) {
      setError('Failed to add package. ' + (err.message || ''));
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto', mt: 6, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight={800} fontFamily="Inter">
        Add Package
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <TextField label="Package Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <TextField label="Details/Description" value={details} onChange={e => setDetails(e.target.value)} multiline minRows={3} required />
        <TextField label="Price (₹)" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        <Button variant="outlined" component="label" sx={{ fontWeight: 700, borderRadius: 2, color: '#FF6B6B', borderColor: '#FF6B6B', '&:hover': { bgcolor: '#FFF0F0' } }}>
          Upload Images
          <input type="file" accept="image/*" hidden multiple onChange={handleImageChange} />
        </Button>
        {images.length > 0 && <Typography color="#666">Selected: {images.map(img => img.name).join(', ')}</Typography>}
        <TextField label="Contact Name" value={contactName} onChange={e => setContactName(e.target.value)} required />
        <TextField label="Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required />
        <TextField label="Contact Phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">Package added!</Typography>}
        <Button type="submit" variant="contained" sx={{ bgcolor: '#FF6B6B', color: '#fff', fontWeight: 700, borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: 'none', '&:hover': { bgcolor: '#e55a5a' } }} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Package'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddPackage; 