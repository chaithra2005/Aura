import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Button, TextField, CircularProgress, Divider, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [rentalCameras, setRentalCameras] = useState({});
  const [addedItems, setAddedItems] = useState({ cameras: [], accessories: [], freelancers: [], packages: [] });
  const [loadingData, setLoadingData] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '' });

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      getDoc(doc(db, 'profiles', user.email)).then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
          setForm(snap.data());
        }
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.email && profile) {
      setLoadingData(true);
      // Fetch rentals
      getDocs(query(collection(db, 'rentals'), where('userEmail', '==', user.email))).then((snap) => {
        setRentals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      // Fetch items added by user
      Promise.all([
        getDocs(query(collection(db, 'cameras'), where('userEmail', '==', user.email))),
        getDocs(query(collection(db, 'accessories'), where('userEmail', '==', user.email))),
        getDocs(query(collection(db, 'freelancers'), where('userEmail', '==', user.email))),
        getDocs(query(collection(db, 'packages'), where('userEmail', '==', user.email))),
      ]).then(([cams, accs, frls, pkgs]) => {
        setAddedItems({
          cameras: cams.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          accessories: accs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          freelancers: frls.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          packages: pkgs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        });
        setLoadingData(false);
      });
    }
  }, [user, profile]);

  // Fetch camera details for rentals
  useEffect(() => {
    const fetchCamerasForRentals = async () => {
      if (rentals.length === 0) return;
      const cameraMap = {};
      await Promise.all(rentals.map(async (rental) => {
        if (rental.cameraId) {
          try {
            const snap = await getDoc(doc(db, 'cameras', rental.cameraId));
            if (snap.exists()) {
              cameraMap[rental.cameraId] = snap.data();
            }
          } catch {}
        }
      }));
      setRentalCameras(cameraMap);
    };
    fetchCamerasForRentals();
  }, [rentals]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, 'profiles', user.email), form);
    setProfile(form);
    setEditing(false);
    setSaving(false);
  };

  // Delete handler for user-added items
  const handleDeleteItem = async (type, id) => {
    let col = '';
    if (type === 'camera') col = 'cameras';
    else if (type === 'accessory') col = 'accessories';
    else if (type === 'freelancer') col = 'freelancers';
    else if (type === 'package') col = 'packages';
    if (!col) return;
    await deleteDoc(doc(db, col, id));
    setAddedItems((prev) => ({
      ...prev,
      [type + (type === 'accessory' ? 'ies' : 's')]: prev[type + (type === 'accessory' ? 'ies' : 's')].filter(item => item.id !== id)
    }));
    setDeleteDialog({ open: false, type: '', id: '' });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6">Please log in to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', pt: 4 }}>
      {/* Edit button at the top right corner of the page */}
      {profile && !editing && (
        <Button
          variant="outlined"
          onClick={() => setEditing(true)}
          sx={{ position: 'fixed', top: { xs: 100, md: 72 }, right: 32, zIndex: 1200 }}
        >
          Edit
        </Button>
      )}
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mb: 4, px: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 6, textAlign: 'center' }}>
          {profile ? `Hi, ${profile.name}` : 'User Profile'}
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>
        ) : editing ? (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2, maxWidth: 400, mx: 'auto' }}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} fullWidth required />
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} sx={{ mt: 1 }}>
              {saving ? <CircularProgress size={24} /> : 'Save'}
            </Button>
            <Button onClick={() => setEditing(false)} sx={{ mt: 1 }}>Cancel</Button>
          </Box>
        ) : profile ? (
          null
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => setEditing(true)}>
              Create Your Profile
            </Button>
          </Box>
        )}
      </Box>
      {profile && (
        <Box sx={{ width: '100vw', minHeight: 400, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, px: 0, mx: 0 }}>
          {/* Left: Rented Cameras */}
          <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom align="center">
              Rented Cameras
            </Typography>
            {loadingData ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box> : rentals.length === 0 ? (
              <Typography color="text.secondary" align="center">No rentals found.</Typography>
            ) : (
              rentals.map(rental => {
                const camera = rental.cameraId ? rentalCameras[rental.cameraId] : undefined;
                return (
                  <Box
                    key={rental.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      bgcolor: '#fff',
                      borderRadius: 2,
                      boxShadow: 2,
                      p: { xs: 2, sm: 4 },
                      mb: 3,
                      width: '100%',
                      minHeight: { xs: 'auto', sm: 240 },
                      border: '1px solid #eee',
                      gap: { xs: 2, sm: 4 }
                    }}
                  >
                    {/* Image */}
                    <Box sx={{
                      width: { xs: '100%', sm: 280 },
                      height: { xs: 180, sm: 240 },
                      bgcolor: '#f8f8f8',
                      borderRadius: 1,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: { xs: 2, sm: 0 }
                    }}>
                      <img
                        src={
                          camera?.imageUrls?.[0] || camera?.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
                        }
                        alt={camera?.name || rental.cameraName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Box>
                    {/* Info */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                        {camera?.name || rental.cameraName}
                      </Typography>
                      <Typography color="#666" sx={{ mb: 2, fontSize: '1.2rem' }}>
                        {camera?.company || ''}
                      </Typography>
                      <Typography fontWeight={800} color="#FF6B6B" sx={{ fontSize: '1.5rem', mt: 'auto' }}>
                        ₹{camera?.price !== undefined ? camera.price : '-'} / day
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">Rental Days: {rental.rentDays}</Typography>
                        <Typography variant="body2">Start Date: {rental.rentStartDate?.toDate ? rental.rentStartDate.toDate().toLocaleDateString() : rental.rentStartDate}</Typography>
                        <Typography variant="body2">Status: {rental.status}</Typography>
                        <Typography variant="body2">Payment: {rental.paymentMethod}</Typography>
                        <Typography variant="body2">Address: {rental.address}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
          {/* Divider */}
          <Box sx={{ width: { xs: '100%', md: 2 }, bgcolor: { xs: 'transparent', md: '#eee' }, minHeight: { md: 400 }, display: { xs: 'none', md: 'block' } }} />
          {/* Right: Added Items */}
          <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom align="center">
              Your Added Items
            </Typography>
            {loadingData ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box> : (
              <>
                {addedItems.cameras.length === 0 && addedItems.accessories.length === 0 && addedItems.freelancers.length === 0 && addedItems.packages.length === 0 ? (
                  <Typography color="text.secondary" align="center">No items added by you yet.</Typography>
                ) : (
                  <>
                    {addedItems.cameras.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 4 }, mb: 3, width: '100%', minHeight: { xs: 'auto', sm: 180 }, border: '1px solid #eee', gap: { xs: 2, sm: 4 } }}>
                        {/* Image */}
                        <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 120, sm: 180 }, bgcolor: '#f8f8f8', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, sm: 0 } }}>
                          <img src={item.imageUrls?.[0] || item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                        {/* Info */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700}>Camera: {item.name}</Typography>
                          <Typography variant="body2">Company: {item.company}</Typography>
                          <Typography variant="body2">Price: {item.price}</Typography>
                          <Button color="error" variant="outlined" size="small" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => setDeleteDialog({ open: true, type: 'camera', id: item.id })}>Remove</Button>
                        </Box>
                      </Box>
                    ))}
                    {addedItems.accessories.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 4 }, mb: 3, width: '100%', minHeight: { xs: 'auto', sm: 180 }, border: '1px solid #eee', gap: { xs: 2, sm: 4 } }}>
                        {/* Image */}
                        <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 120, sm: 180 }, bgcolor: '#f8f8f8', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, sm: 0 } }}>
                          <img src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                        {/* Info */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700}>Accessory: {item.name}</Typography>
                          <Typography variant="body2">Price: {item.price}</Typography>
                          <Button color="error" variant="outlined" size="small" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => setDeleteDialog({ open: true, type: 'accessory', id: item.id })}>Remove</Button>
                        </Box>
                      </Box>
                    ))}
                    {addedItems.freelancers.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 4 }, mb: 3, width: '100%', minHeight: { xs: 'auto', sm: 180 }, border: '1px solid #eee', gap: { xs: 2, sm: 4 } }}>
                        {/* Image */}
                        <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 120, sm: 180 }, bgcolor: '#f8f8f8', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, sm: 0 } }}>
                          <img src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                        {/* Info */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700}>Freelancer: {item.name}</Typography>
                          <Typography variant="body2">Service: {item.service}</Typography>
                          <Typography variant="body2">Price: {item.price}</Typography>
                          <Button color="error" variant="outlined" size="small" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => setDeleteDialog({ open: true, type: 'freelancer', id: item.id })}>Remove</Button>
                        </Box>
                      </Box>
                    ))}
                    {addedItems.packages.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 4 }, mb: 3, width: '100%', minHeight: { xs: 'auto', sm: 180 }, border: '1px solid #eee', gap: { xs: 2, sm: 4 } }}>
                        {/* Image */}
                        <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 120, sm: 180 }, bgcolor: '#f8f8f8', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, sm: 0 } }}>
                          <img src={item.imageUrls?.[0] || item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        </Box>
                        {/* Info */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700}>Package: {item.title}</Typography>
                          <Typography variant="body2">Price: {item.price}</Typography>
                          <Button color="error" variant="outlined" size="small" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => setDeleteDialog({ open: true, type: 'package', id: item.id })}>Remove</Button>
                        </Box>
                      </Box>
                    ))}
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: '', id: '' })}>
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: '', id: '' })} color="primary">Cancel</Button>
          <Button onClick={() => handleDeleteItem(deleteDialog.type, deleteDialog.id)} color="error" variant="contained">Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 