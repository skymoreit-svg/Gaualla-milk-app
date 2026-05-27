
// ============================================
// API Configuration - Local & Production
// ============================================
// NOTE: This file is imported across the app as '../../allapi'
// Backend runs on port 8000 (check gauallabackend/app.js)

// --------------------------------------------
// CHOOSE YOUR DEVELOPMENT MODE (Set ONE to true)
// --------------------------------------------
const DEV_MODE = {
  // Mode 1: Real Android Device via USB (Requires running: adb reverse tcp:8000 tcp:8000)
  ADB_REVERSE: true,

  // Mode 2: Real Android Device over Wi-Fi (Requires both PC & phone on same Wi-Fi)
  LAN_WIFI: false,

  // Mode 3: Android Emulator (Android Studio virtual device)
  EMULATOR: false,
};

// Your computer's local Wi-Fi IP address (found via 'ipconfig' in cmd -> IPv4 Address)
// Only used if DEV_MODE.LAN_WIFI is true
const LOCAL_LAN_IP = "192.168.1.2";

// Determine the correct base URL based on platform & dev mode
const getBaseUrl = () => {
  // For production, uncomment the line below and comment out local development
  return "https://api.gauallamilk.com/api/user";

  // if (DEV_MODE.ADB_REVERSE) {
  //   return "http://localhost:8000/api/user";
  // } else if (DEV_MODE.LAN_WIFI) {
  //   return `http://${LOCAL_LAN_IP}:8000/api/user`;
  // } else if (DEV_MODE.EMULATOR) {
  //   return "http://10.0.2.2:8000/api/user";
  // } else {
  //   // Production
  //   return "https://api.gauallamilk.com/api/user";
  // }

};

const getImgUrl = () => {
  // For production, uncomment the line below and comment out local development
  return "https://api.gauallamilk.com/uploads";

  // if (DEV_MODE.ADB_REVERSE) {
  //   return "http://localhost:8000/uploads";
  // } else if (DEV_MODE.LAN_WIFI) {
  //   return `http://${LOCAL_LAN_IP}:8000/uploads`;
  // } else if (DEV_MODE.EMULATOR) {
  //   return "http://10.0.2.2:8000/uploads";
  // } else {
  //   // Production
  //   return "https://api.gauallamilk.com/uploads";
  // }

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