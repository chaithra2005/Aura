# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the location picker feature in your camera rental app.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Camera Rental App")
5. Click "Create"

### 2. Enable Required APIs

1. In your new project, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** - For displaying maps
   - **Geocoding API** - For converting coordinates to addresses
   - **Places API** - For place autocomplete (optional but recommended)

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict the API Key (Recommended for Security)

1. Click on the API key you just created
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - For development: `localhost:*`
   - For production: `yourdomain.com/*`
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled (Maps JavaScript API, Geocoding API, Places API)
6. Click "Save"

### 5. Update Your Application

1. Open `src/config/maps.js`
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```javascript
export const GOOGLE_MAPS_API_KEY = 'AIzaSyYourActualAPIKeyHere';
```

### 6. Test the Integration

1. Start your development server
2. Go to the checkout page
3. Click "📍 Use My Current Location"
4. Allow location access when prompted
5. You should see your location on a map with the correct address

## Features

With this setup, your app will have:

- **Current Location Detection**: Users can get their exact location with one click
- **Address Geocoding**: Converts GPS coordinates to human-readable addresses
- **Interactive Map**: Shows the selected location on a map
- **Manual Address Entry**: Users can still enter addresses manually
- **Delivery Optimization**: Precise coordinates for better delivery routing

## Troubleshooting

### Common Issues

1. **"Failed to load Google Maps"**
   - Check if your API key is correct
   - Ensure the Maps JavaScript API is enabled
   - Verify API key restrictions allow your domain

2. **"Location access denied"**
   - Users need to allow location access in their browser
   - Check if the site is served over HTTPS (required for geolocation)

3. **"Could not find address for your location"**
   - Ensure Geocoding API is enabled
   - Check if the location is in a supported region

### API Quotas

- Google Maps APIs have usage quotas
- For development, the free tier should be sufficient
- For production, monitor usage in Google Cloud Console
- Consider setting up billing alerts

## Security Best Practices

1. **Restrict API Key**: Always restrict your API key to specific domains
2. **Monitor Usage**: Regularly check API usage in Google Cloud Console
3. **HTTPS Only**: Serve your app over HTTPS for geolocation to work
4. **User Consent**: Always ask for user permission before accessing location

## Cost Considerations

- **Free Tier**: $200 monthly credit (usually sufficient for small apps)
- **Pricing**: 
  - Maps JavaScript API: $7 per 1,000 map loads
  - Geocoding API: $5 per 1,000 requests
  - Places API: $17 per 1,000 requests

For a typical camera rental app, the free tier should be more than sufficient. 