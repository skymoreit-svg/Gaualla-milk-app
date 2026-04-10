
// ============================================
// NOTE: This file is NOT used by the app
// The app uses: app/Components/allapi.js
// ============================================
// This file is kept for reference only
// All imports use: import { baseurl } from '../Components/allapi'

// export const baseurl= "https://api.gauallamilk.com/api/user";
// export const imgurl= "https://api.gauallamilk.com/uploads";

// For local development - use your computer's IP for physical devices
// export const baseurl= "http://192.168.1.11:8000/api/user";
// export const imgurl= "http://192.168.1.11:8000/uploads";





// ============================================
// API Configuration - Local Development
// ============================================
// Backend runs on port 8000 (check gauallabackend-main/app.js)

import { Platform } from 'react-native';

// Your computer's local IP address (found via ipconfig)
// Replace this with your actual IP if it changes
const LOCAL_IP = "192.168.1.2"; // Update this if your IP changes

// Determine the correct base URL based on platform
const getBaseUrl = () => {
  // For production, uncomment the line below and comment out local development
  return "https://api.gauallamilk.com/api/user";
  
  // Local development URLs
  if (Platform.OS === 'android') {
    // Check if running on emulator (__DEV__) or physical device
    // For Android Emulator: use 10.0.2.2
    // For Physical Android Device: use your computer's local IP
    // You can manually set this by uncommenting the line below and using your IP
    return `http://${LOCAL_IP}:8000/api/user`; // Physical device
    // return "http://10.0.2.2:8000/api/user"; // Uncomment for Android Emulator
  } else if (Platform.OS === 'ios') {
    // iOS Simulator can use localhost, but physical device needs IP
    return `http://${LOCAL_IP}:8000/api/user`; // Works for both simulator and device
    // return "http://localhost:8000/api/user"; // Uncomment for iOS Simulator only
  } else {
    // Web or other platforms
    return "http://localhost:8000/api/user";
  }
};

const getImgUrl = () => {
  // For production, uncomment the line below and comment out local development
  return "https://api.gauallamilk.com/uploads";
  
  // Local development URLs
  if (Platform.OS === 'android') {
    return `http://${LOCAL_IP}:8000/uploads`; // Physical device
    // return "http://10.0.2.2:8000/uploads"; // Uncomment for Android Emulator
  } else if (Platform.OS === 'ios') {
    return `http://${LOCAL_IP}:8000/uploads`; // Works for both simulator and device
    // return "http://localhost:8000/uploads"; // Uncomment for iOS Simulator only
  } else {
    return "http://localhost:8000/uploads";
  }
};

// Export the URLs
export const baseurl = getBaseUrl();
export const imgurl = getImgUrl();
export const imageurl = imgurl;

// ============================================
// Manual Configuration (if auto-detection doesn't work)
// ============================================
// Uncomment and modify these if you need to override the auto-detection:
// export const baseurl = "http://localhost:8000/api/user";  // For iOS/Web
// export const baseurl = "http://10.0.2.2:8000/api/user";    // For Android Emulator
// export const baseurl = "http://192.168.1.9:8000/api/user"; // For Physical Device (replace with your IP)
// export const imgurl = "http://localhost:8000/uploads";
// export const imgurl = "http://10.0.2.2:8000/uploads";
// export const imgurl = "http://192.168.1.9:8000/uploads";

// ============================================
// Production URLs (uncomment when deploying)
// ============================================
// export const baseurl= "https://api.gauallamilk.com/api/user";
// export const imgurl= "https://api.gauallamilk.com/uploads";