import axios from "axios";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { baseurl } from "../allapi";

const isExpoGo = Constants.appOwnership === 'expo';
let Notifications = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn("expo-notifications require failed:", e);
  }
}

export async function registerForPushNotifications() {
  if (isExpoGo || !Notifications) {
    console.log("Push notifications are not supported in Expo Go. Skipping registration.");
    return null;
  }

  try {
    if (!Device.isDevice) {
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("orders", {
        name: "Orders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#942e29",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("general", {
        name: "General",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const tokenData = await Notifications.getDevicePushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.warn("Push notification registration failed:", err?.message);
    return null;
  }
}

export async function savePushTokenToBackend(deviceToken) {
  try {
    const authToken = await SecureStore.getItemAsync("authToken");
    if (!authToken || !deviceToken) return;

    await axios.post(
      `${baseurl}/fcm-token`,
      { fcm_token: deviceToken, platform: Platform.OS },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  } catch (err) {
    console.warn("Failed to save push token:", err?.message);
  }
}

export async function registerAndSaveToken() {
  try {
    const token = await registerForPushNotifications();
    if (token) {
      await savePushTokenToBackend(token);
    }
    return token;
  } catch (err) {
    console.warn("Push token registration failed:", err?.message);
    return null;
  }
}
