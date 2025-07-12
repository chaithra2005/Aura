import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { auth, applyActionCode, checkActionCode } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to store user profile in Firestore
  const storeUserProfile = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: Timestamp.now(),
        emailVerified: true,
        lastLogin: Timestamp.now(),
        provider: user.providerData[0]?.providerId || 'email'
      }, { merge: true });
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the action code from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const actionCode = urlParams.get('oobCode');
        if (!actionCode) {
          setError('Invalid verification link. Please try signing up again.');
          setVerifying(false);
          return;
        }
        // Check if the code is valid or already used
        try {
          await checkActionCode(auth, actionCode);
        } catch (err) {
          // If code is already used, show already verified message
          setAlreadyVerified(true);
          setVerifying(false);
          setTimeout(() => {
            navigate('/login');
          }, 3500);
          return;
        }
        // Try to apply the code
        try {
          await applyActionCode(auth, actionCode);
          setSuccess(true);
          setVerifying(false);
          // Optionally update Firestore (if user is logged in)
          if (auth.currentUser) {
            await storeUserProfile(auth.currentUser);
          }
          // Store the signup email in localStorage for the login page
          const signupEmail = window.localStorage.getItem('signupEmail');
          if (signupEmail) {
            window.localStorage.setItem('loginPrefillEmail', signupEmail);
            window.localStorage.removeItem('signupEmail');
          }
          setTimeout(() => {
            navigate('/login');
          }, 3500);
        } catch (err) {
          setError('Email verification failed. Please try again or contact support.');
          setVerifying(false);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setError('Email verification failed. Please try again or contact support.');
        setVerifying(false);
      }
    };
    verifyEmail();
  }, [location, navigate]);

  if (verifying) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying your email...</Typography>
        </Paper>
      </Box>
    );
  }

  if (success) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
          <Typography variant="h5" mb={3} align="center" color="success.main">
            ✅ Email Verified Successfully!
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            Your email has been verified.<br />
            <b>Now go to the login page and enter your password to access your account.</b>
            <br />Redirecting to login page...
          </Alert>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Paper>
      </Box>
    );
  }

  if (alreadyVerified) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
          <Typography variant="h5" mb={3} align="center" color="info.main">
            📧 Email Already Verified
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Your email address is already verified.<br />
            <b>Please log in with your email and password.</b>
            <br />Redirecting to login page...
          </Alert>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
        <Typography variant="h5" mb={3} align="center" color="black">
        If you have verified your email, you can go to the login page to log in.
        </Typography>
   
   
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default EmailVerification; 