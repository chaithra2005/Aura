// Google Maps API Configuration
// Replace YOUR_GOOGLE_MAPS_API_KEY with your actual Google Maps API key
// Get your API key from: https://console.cloud.google.com/apis/credentials

export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Google Maps API endpoints
export const GOOGLE_MAPS_CONFIG = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ['places'],
  version: 'weekly',
};

// Instructions for setting up Google Maps API:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable the following APIs:
//    - Maps JavaScript API
//    - Geocoding API
//    - Places API
// 4. Create credentials (API Key)
// 5. Restrict the API key to your domain for security
// 6. Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key 