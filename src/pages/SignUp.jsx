import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Alert, Divider } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { FcGoogle } from 'react-icons/fc';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google sign-up failed');
    }
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
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
          sx={{
            fontWeight: 600,
            borderColor: '#ccc',
            textTransform: 'none',
            backgroundColor: '#fff',
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          Sign up with Google
        </Button>
      </Paper>
    </Box>
  );
};

export default SignUp;
