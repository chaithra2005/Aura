import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';

const ADMIN_EMAILS = [
  'deekshithsk24@gmail.com', // Add other admin emails if needed
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
        const rentalData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setRentals(rentalData);
      } catch (err) {
        setError('Failed to fetch rentals.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchRentals();
  }, []);

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Alert severity="error">Access denied. Admins only.</Alert>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Admin Dashboard
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Camera</strong></TableCell>
                <TableCell><strong>User Email</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell><strong>Rental Days</strong></TableCell>
                <TableCell><strong>Rented At</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell><strong>UPI ID</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>{rental.cameraName || '-'}</TableCell>
                  <TableCell>{rental.userEmail || '-'}</TableCell>
                  <TableCell>{rental.name || '-'}</TableCell>
                  <TableCell>{rental.phone || '-'}</TableCell>
                  <TableCell>{rental.address || '-'}</TableCell>
                  <TableCell>{rental.rentDays || '-'}</TableCell>
                  <TableCell>
                    {rental.rentedAt?.toDate
                      ? rental.rentedAt.toDate().toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {rental.paymentMethod === 'upi'
                      ? 'UPI'
                      : rental.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {rental.paymentMethod === 'upi' ? rental.upiId || '-' : '-'}
                  </TableCell>
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
