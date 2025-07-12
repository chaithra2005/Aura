import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert, Divider } from '@mui/material';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [email, setEmail] = useState(() => {
    // Prefill email from localStorage if available
    const prefill = window.localStorage.getItem('loginPrefillEmail');
    if (prefill) {
      window.localStorage.removeItem('loginPrefillEmail');
      return prefill;
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const navigate = useNavigate();

  // Handle redirect result from Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in via redirect
          // Update user profile in Firestore
          await updateUserLogin(result.user);
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Google login failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, [navigate]);

  // Function to update user login activity in Firestore
  const updateUserLogin = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        lastLogin: Timestamp.now(),
        provider: user.providerData[0]?.providerId || 'email'
      }, { merge: true }); // merge: true will update existing document or create new one
    } catch (error) {
      console.error('Error updating user login:', error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResendSuccess('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Update user profile in Firestore
      await updateUserLogin(userCredential.user);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Login failed');
      }
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setResendLoading(true);
    setError('');
    setResendSuccess('');
    
    try {
      // Store email in localStorage for email link verification
      window.localStorage.setItem('emailForSignIn', email);
      
      // Send sign-in link to email
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true,
      });
      
      setResendSuccess('Verification email sent! Please check your inbox.');
      
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please sign up first.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
      
      // Clean up localStorage on error
      window.localStorage.removeItem('emailForSignIn');
    }
    
    setResendLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Try popup first, fallback to redirect if popup fails
      try {
        const result = await signInWithPopup(auth, provider);
        // Update user profile in Firestore
        await updateUserLogin(result.user);
        navigate('/');
      } catch (popupError) {
        console.log('Popup failed, trying redirect:', popupError);
        // If popup fails due to COOP or other issues, use redirect
        await signInWithRedirect(auth, provider);
        // Note: With redirect, the page will reload and handle the result
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else {
        setError('Google login failed. Please try again or use email login.');
      }
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" mb={2} align="center">Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleEmailLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          {error && error.includes('verify your email') && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResendVerification}
              disabled={resendLoading || !email}
              sx={{ mt: 1 }}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          )}
          {resendSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {resendSuccess}
            </Alert>
          )}
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<FcGoogle size={22} />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{
            fontWeight: 600,
            borderColor: '#ccc',
            textTransform: 'none',
            backgroundColor: '#fff',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          {loading ? 'Connecting...' : 'Continue with Google'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
