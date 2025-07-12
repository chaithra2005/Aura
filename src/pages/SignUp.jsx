import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert, Divider, Checkbox, FormControlLabel, Link } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  // Handle redirect result from Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in via redirect
          // Store user profile in Firestore
          await storeUserProfile(result.user);
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Google sign-up failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, [navigate]);

  // Function to store user profile in Firestore
  const storeUserProfile = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: Timestamp.now(),
        emailVerified: user.emailVerified,
        lastLogin: Timestamp.now(),
        provider: user.providerData[0]?.providerId || 'email'
      });
    } catch (error) {
      console.error('Error storing user profile:', error);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user profile in Firestore
      await storeUserProfile(userCredential.user);
      
      // Store email and password in localStorage for auto-login after verification
      window.localStorage.setItem('signupEmail', email);
      window.localStorage.setItem('signupPassword', password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/verify-email',
        handleCodeInApp: true,
      });
      
      // Sign out the user immediately after creation
      await signOut(auth);
      
      setVerificationSent(true);
      setSuccess('Account created! A verification email has been sent to your inbox. Please check your email and click the verification link to complete your registration.');
      setEmail('');
      setPassword('');
      setAcceptedTerms(false);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message || 'Sign up failed');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      // Try popup first, fallback to redirect if popup fails
      try {
        const result = await signInWithPopup(auth, provider);
        // Store user profile in Firestore
        await storeUserProfile(result.user);
        navigate('/');
      } catch (popupError) {
        console.log('Popup failed, trying redirect:', popupError);
        // If popup fails due to COOP or other issues, use redirect
        await signInWithRedirect(auth, provider);
        // Note: With redirect, the page will reload and handle the result
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-up was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site and try again.');
      } else {
        setError('Google sign-up failed. Please try again or use email sign-up.');
      }
    }
    setLoading(false);
  };

  if (verificationSent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
          <Typography variant="h5" mb={3} align="center">Check Your Email</Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            We've sent a verification email to your inbox. Please check your email and click the verification link to complete your registration.
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Didn't receive the email? Check your spam folder or try signing up again.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setVerificationSent(false);
              setSuccess('');
            }}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" mb={2} align="center">Sign Up</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleEmailSignUp}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <>
                  I accept the
                  <Button
                    variant="text"
                    size="small"
                    sx={{ ml: 0.5, textTransform: 'none', fontWeight: 600, color: '#1976d2', p: 0, minWidth: 0 }}
                    onClick={e => {
                      e.preventDefault();
                      navigate('/rental-terms');
                    }}
                  >
                    Read Now
                  </Button>
                  Terms and Conditions
                </>
              }
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, backgroundColor: acceptedTerms ? undefined : '#ccc', color: acceptedTerms ? undefined : '#888', boxShadow: 'none' }}
            disabled={loading || !acceptedTerms}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<FcGoogle size={22} />}
          onClick={handleGoogleSignUp}
          disabled={loading || !acceptedTerms}
          sx={{
            fontWeight: 600,
            borderColor: '#ccc',
            textTransform: 'none',
            backgroundColor: acceptedTerms ? '#fff' : '#eee',
            color: acceptedTerms ? undefined : '#888',
            boxShadow: 'none',
            '&:hover': { backgroundColor: acceptedTerms ? '#f5f5f5' : '#eee' }
          }}
        >
          {loading ? 'Connecting...' : 'Sign up with Google'}
        </Button>
      </Paper>
    </Box>
  );
};

export default SignUp;
