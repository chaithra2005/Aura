import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, getDoc, doc, updateDoc } from 'firebase/firestore';
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
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Button
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  CalendarToday,
  Payment,
  Person,
  CameraAlt,
  AccessTime,
  Receipt,
  Map
} from '@mui/icons-material';

const ADMIN_EMAILS = [
  'deekshithsk24@gmail.com',
  'jitheshdas08@gmail.com',
   // Add other admin emails if needed
];

const Admin = ({ user }) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    codOrders: 0,
    upiOrders: 0
  });
  const [updatingStatus, setUpdatingStatus] = useState({});

  const handleDeliveryConfirmation = async (rentalId) => {
    setUpdatingStatus(prev => ({ ...prev, [rentalId]: true }));
    try {
      await updateDoc(doc(db, 'rentals', rentalId), {
        status: 'delivered',
        deliveredAt: new Date()
      });
      
      // Update the local state
      setRentals(prevRentals => 
        prevRentals.map(rental => 
          rental.id === rentalId 
            ? { ...rental, status: 'delivered', deliveredAt: new Date() }
            : rental
        )
      );
      
      // Recalculate stats
      const updatedRentals = rentals.map(rental => 
        rental.id === rentalId 
          ? { ...rental, status: 'delivered' }
          : rental
      );
      
      const totalOrders = updatedRentals.length;
      const pendingOrders = updatedRentals.filter(rental => rental.status === 'pending').length;
      const deliveredOrders = updatedRentals.filter(rental => rental.status === 'delivered').length;
      const codOrders = updatedRentals.filter(rental => rental.paymentMethod === 'cod').length;
      const upiOrders = updatedRentals.filter(rental => rental.paymentMethod === 'upi').length;
      
      setStats(prev => ({
        ...prev,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        codOrders,
        upiOrders
      }));
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [rentalId]: false }));
    }
  };

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        // Fetch rentals ordered by most recent first
        const q = query(collection(db, 'rentals'), orderBy('rentedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const rentalData = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setRentals(rentalData);
        
        // Calculate statistics
        const totalOrders = rentalData.length;
        const pendingOrders = rentalData.filter(rental => rental.status === 'pending').length;
        const deliveredOrders = rentalData.filter(rental => rental.status === 'delivered').length;
        const codOrders = rentalData.filter(rental => rental.paymentMethod === 'cod').length;
        const upiOrders = rentalData.filter(rental => rental.paymentMethod === 'upi').length;
        
        // Calculate total revenue with accurate pricing
        let totalRevenue = 0;
        for (const rental of rentalData) {
          const startDate = rental.rentStartDate?.toDate ? rental.rentStartDate.toDate() : new Date(rental.rentStartDate);
          const endDate = rental.rentEndDate?.toDate ? rental.rentEndDate.toDate() : new Date(rental.rentEndDate);
          const rentDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          let dailyPrice = rental.dailyPrice;
          
          // If dailyPrice is not available, fetch it from the camera document
          if (!dailyPrice && rental.cameraId) {
            try {
              const cameraDoc = await getDoc(doc(db, 'cameras', rental.cameraId));
              if (cameraDoc.exists()) {
                dailyPrice = cameraDoc.data().price;
              }
            } catch (err) {
              console.error('Error fetching camera price:', err);
            }
          }
          
          // Use a reasonable fallback if still no price found
          if (!dailyPrice) {
            dailyPrice = 500; // Fallback price
            console.warn(`No price found for rental ${rental.id}, using fallback price of ₹500`);
          }
          
          totalRevenue += dailyPrice * rentDays;
        }
        
        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalRevenue,
          codOrders,
          upiOrders
        });
      } catch (err) {
        setError('Failed to fetch rentals.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchRentals();
  }, []);

  // Debug logging
  console.log('Admin page - Current user:', user);
  console.log('Admin page - User email:', user?.email);
  console.log('Admin page - Admin emails:', ADMIN_EMAILS);
  console.log('Admin page - Is admin?', user && ADMIN_EMAILS.includes(user.email));

  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, mb: 6 }}>
        <Alert severity="error">
          Access denied. Admins only.
          {user && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current user: {user.email}
            </Typography>
          )}
        </Alert>
      </Box>
    );
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
    <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 12, mb: 6, px: 2 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        📊 Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',           // 1 column on mobile
            sm: '1fr 1fr',       // 2 columns on tablet
            md: '1fr 1fr 1fr'    // 3 columns on desktop and up
          },
          gap: 3,                // spacing between cards
          mb: 4
        }}
      >
        <Card sx={{ bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Orders
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {stats.totalOrders}
                </Typography>
              </Box>
              <Receipt sx={{ fontSize: 40, color: '#2196f3' }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Pending Orders
                </Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.pendingOrders}
                </Typography>
              </Box>
              <AccessTime sx={{ fontSize: 40, color: '#ff9800' }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Revenue
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
              <Payment sx={{ fontSize: 40, color: '#4caf50' }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#f3e5f5', border: '1px solid #9c27b0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  COD Orders
                </Typography>
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {stats.codOrders}
                </Typography>
              </Box>
              <Payment sx={{ fontSize: 40, color: '#9c27b0' }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Delivered Orders
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.deliveredOrders}
                </Typography>
              </Box>
              <CameraAlt sx={{ fontSize: 40, color: '#4caf50' }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: '#e0f2f1', border: '1px solid #009688' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  UPI Orders
                </Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {stats.upiOrders}
                </Typography>
              </Box>
              <Payment sx={{ fontSize: 40, color: '#009688' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Detailed Orders Table */}
      <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" fontWeight={700}>
            📋 All Rental Orders
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Complete customer information and order details
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontWeight: 700 }}>📷 Equipment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>👤 Customer Info</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>📍 Delivery Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>📅 Rental Period</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>💳 Payment</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>📊 Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentals.map((rental) => {
                const startDate = rental.rentStartDate?.toDate ? rental.rentStartDate.toDate() : new Date(rental.rentStartDate);
                const endDate = rental.rentEndDate?.toDate ? rental.rentEndDate.toDate() : new Date(rental.rentEndDate);
                const rentDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const orderDate = rental.rentedAt?.toDate ? rental.rentedAt.toDate() : new Date(rental.rentedAt);
                
                return (
                  <TableRow key={rental.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    {/* Equipment Column */}
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="primary">
                          {rental.cameraName || 'Camera Equipment'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {rental.cameraId || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Customer Info Column */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Person sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {rental.name || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Email sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                          <Typography variant="body2" color="textSecondary">
                            {rental.userEmail || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                          <Typography variant="body2" color="textSecondary">
                            {rental.phone || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    {/* Delivery Details Column */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                          <Typography variant="body2" sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                            {rental.address || 'N/A'}
                          </Typography>
                        </Box>
                        {rental.coordinates && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Map sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                            <Typography variant="caption" color="textSecondary">
                              📍 GPS: {rental.coordinates.latitude?.toFixed(4)}, {rental.coordinates.longitude?.toFixed(4)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* Rental Period Column */}
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: '#666' }} />
                          <Typography variant="body2">
                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {rentDays} day{rentDays > 1 ? 's' : ''} rental
                        </Typography>
                        <Typography variant="caption" display="block" color="textSecondary">
                          Ordered: {orderDate.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Payment Column */}
                    <TableCell>
                      <Box>
                        <Chip
                          label={rental.paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
                          color={rental.paymentMethod === 'upi' ? 'success' : 'warning'}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {rental.paymentMethod === 'upi' && rental.razorpayPaymentId && (
                          <Typography variant="caption" display="block" color="textSecondary">
                            ID: {rental.razorpayPaymentId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    {/* Status Column */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={rental.status === 'pending' ? 'Pending' : rental.status === 'delivered' ? 'Delivered' : 'Completed'}
                          color={rental.status === 'pending' ? 'warning' : rental.status === 'delivered' ? 'success' : 'info'}
                          size="small"
                        />
                        {rental.status === 'pending' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            disabled={updatingStatus[rental.id]}
                            onClick={() => handleDeliveryConfirmation(rental.id)}
                            sx={{ 
                              fontSize: '0.7rem', 
                              py: 0.5, 
                              px: 1,
                              minWidth: 'auto',
                              textTransform: 'none'
                            }}
                          >
                            {updatingStatus[rental.id] ? (
                              <CircularProgress size={12} color="inherit" />
                            ) : (
                              'Confirm Delivery'
                            )}
                          </Button>
                        )}
                        {rental.status === 'delivered' && rental.deliveredAt && (
                          <Typography variant="caption" color="textSecondary">
                            Delivered: {new Date(rental.deliveredAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {rentals.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No rental orders found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Orders will appear here once customers place them
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Admin;
