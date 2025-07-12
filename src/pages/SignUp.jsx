import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert, Divider, Checkbox, FormControlLabel, Link } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, sendEmailVerification } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { FcGoogle } from 'react-icons/fc';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // Handle redirect result from Google sign-in
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in via redirect
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Google sign-up failed. Please try again.');
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess('Account created! A verification email has been sent. Please check your inbox and verify your email before signing in.');
      setEmail('');
      setPassword('');
      // Do not navigate yet; wait for user to verify
    } catch (err) {
      setError(err.message || 'Sign up failed');
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      // Try popup first, fallback to redirect if popup fails
      try {
        await signInWithPopup(auth, provider);
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
