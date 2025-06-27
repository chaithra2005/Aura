import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Box, Paper, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material';

const ADMIN_EMAILS = [
  'deekshithsk24@gmail.com', // Replace with your admin email(s)
];

const Admin = ({ user }) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'rentals'));
        const rentalData = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
          };
        }));
        setRentals(rentalData);
      } catch (err) {
        setError('Failed to fetch rentals.');
      }
      setLoading(false);
    };
    fetchRentals();
  }, []);

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Alert severity="error">Access denied. Admins only.</Alert>;
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Admin Dashboard</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Camera</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell>Rental Days</TableCell>
                <TableCell>Rented At</TableCell>
                <TableCell>Payment Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{rental.cameraName}</TableCell>
                  <TableCell>{rental.userEmail}</TableCell>
                  <TableCell>{rental.rentDays}</TableCell>
                  <TableCell>{rental.rentedAt && rental.rentedAt.toDate ? rental.rentedAt.toDate().toLocaleString() : ''}</TableCell>
                  <TableCell>{rental.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Admin; 