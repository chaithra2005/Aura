import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  IconButton,
} from '@mui/material';
import { LocationOn, MyLocation, Edit } from '@mui/icons-material';
import { GOOGLE_MAPS_API_KEY } from '../config/maps';

const LocationPicker = ({ onLocationSelect, initialAddress = '' }) => {
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        return Promise.resolve();
      }

              return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
    };

    loadGoogleMapsAPI().catch(err => {
      console.error('Failed to load Google Maps API:', err);
      setError('Failed to load Google Maps. Please enter address manually.');
    });
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        try {
          // Use Google Maps Geocoding API for better address results
          const geocoder = new window.google.maps.Geocoder();
          const result = await geocoder.geocode({ location: { lat: latitude, lng: longitude } });
          
          if (result.results && result.results[0]) {
            const formattedAddress = result.results[0].formatted_address;
            setAddress(formattedAddress);
            onLocationSelect(formattedAddress, { lat: latitude, lng: longitude });
            setShowMap(true);
          } else {
            setError('Could not find address for your location.');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          setError('Failed to get address. Please enter manually.');
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const initializeMap = () => {
    if (!coordinates || !mapRef.current || !window.google) return;

    const mapOptions = {
      center: coordinates,
      zoom: 16,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker
    markerRef.current = new window.google.maps.Marker({
      position: coordinates,
      map: mapInstanceRef.current,
      title: 'Your Location',
      animation: window.google.maps.Animation.DROP,
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h4 style="margin: 0 0 5px 0;">📍 Your Location</h4>
          <p style="margin: 0; font-size: 12px;">${address}</p>
        </div>
      `
    });

    markerRef.current.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, markerRef.current);
    });
  };

  useEffect(() => {
    if (showMap && coordinates) {
      // Small delay to ensure DOM is ready
      setTimeout(initializeMap, 100);
    }
  }, [showMap, coordinates]);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    onLocationSelect(e.target.value, coordinates);
  };

  const handleManualEdit = () => {
    setShowMap(false);
    setCoordinates(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="outlined"
          onClick={getCurrentLocation}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <MyLocation />}
          sx={{ 
            fontSize: '0.875rem', 
            py: 1, 
            px: 2,
            minWidth: 'auto',
            flex: 1
          }}
        >
          {loading ? 'Getting Location...' : '📍 Use My Current Location'}
        </Button>
        
        {address && (
          <IconButton 
            onClick={handleManualEdit}
            size="small"
            sx={{ border: '1px solid #ccc' }}
          >
            <Edit fontSize="small" />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Delivery Address"
        value={address}
        onChange={handleAddressChange}
        multiline
        rows={3}
        placeholder="Enter your delivery address or use current location"
        sx={{ mb: 2 }}
      />

      {showMap && coordinates && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            📍 Location Confirmed
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {address}
          </Typography>
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: 200,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            ✅ This location will be used for delivery
          </Typography>
        </Paper>
      )}

      {address && !showMap && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📝 Address entered manually. For better delivery accuracy, consider using your current location.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default LocationPicker; 