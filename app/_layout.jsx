import { Oswald_400Regular, Oswald_500Medium, Oswald_700Bold } from "@expo-google-fonts/oswald"
import axios from "axios"
import { useFonts } from "expo-font"
import * as Notifications from "expo-notifications"
import { Stack, useRouter } from 'expo-router'
import * as SecureStore from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import * as SystemUI from 'expo-system-ui'
import { useEffect, useRef, useState } from "react"
import { Animated, Image, StyleSheet, Text, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { Provider, useDispatch, useSelector } from "react-redux"
import { registerAndSaveToken } from "../services/notificationService"
import "./global.css"
import store from './store/store'
import { clearUser } from "./store/userSlice"
import { baseurl } from "../allapi"

// Set root background color for system UI
SystemUI.setBackgroundColorAsync('#F6EFC8');

// Prevent splash screen from auto-hiding while fonts load
SplashScreen.preventAutoHideAsync();

// ─── Default day-of-week greeting messages ───────────────────────────────────
const DEFAULT_DAY_MESSAGES = [
  { emoji: '☀️', title: 'Happy Sunday!',    message: 'Relax and recharge. Enjoy your day with pure Gaualla goodness.' },
  { emoji: '🌅', title: 'Happy Monday!',    message: 'Start your week strong with a refreshing glass of farm-fresh milk.' },
  { emoji: '💪', title: 'Happy Tuesday!',   message: 'Keep the momentum going. Fuel your day the natural way!' },
  { emoji: '🐪', title: 'Happy Wednesday!', message: "Halfway through the week! Stay refreshed with Gaualla." },
  { emoji: '⚡', title: 'Happy Thursday!',  message: "Almost there! One more push — you've got this." },
  { emoji: '🎉', title: 'Happy Friday!',    message: 'The weekend is near! Celebrate with pure, farm-fresh dairy.' },
  { emoji: '🥛', title: 'Happy Saturday!',  message: 'A perfect day to enjoy a tall glass of Gaualla milk.' },
];

const getDefaultDayMessage = () => DEFAULT_DAY_MESSAGES[new Date().getDay()];

function CustomSplash({ onAnimationComplete, greetingData }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const greetingFadeAnim = useRef(new Animated.Value(0)).current;
  const containerFadeAnim = useRef(new Animated.Value(1)).current;

  // Resolve which greeting to display
  const greeting = greetingData || getDefaultDayMessage();

  useEffect(() => {
    // 1. Fade in and spring-scale logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        friction: 6,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Fade in subtitle brand text
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        // 3. Fade in greeting card
        Animated.timing(greetingFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // 4. Pause for premium impact, then fade out container
          setTimeout(() => {
            Animated.timing(containerFadeAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }).start(() => {
              onAnimationComplete();
            });
          }, 1800);
        });
      });
    });
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: '#F6EFC8',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: containerFadeAnim,
          zIndex: 99999,
        },
      ]}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 160, height: 160 }}
          resizeMode="contain"
        />
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontFamily: 'OswaldBold', fontSize: 36, color: '#3e2723', letterSpacing: 4, textTransform: 'uppercase' }}>
            GAUALLA
          </Text>
          <Text style={{ fontSize: 13, color: '#8d6e63', fontWeight: '800', letterSpacing: 2, marginTop: 6, textTransform: 'uppercase' }}>
            Purity at its best
          </Text>
        </Animated.View>

        {/* Dynamic greeting card */}
        <Animated.View
          style={{
            opacity: greetingFadeAnim,
            marginTop: 32,
            alignItems: 'center',
            paddingHorizontal: 32,
            maxWidth: 320,
          }}
        >
          {/* Divider */}
          <View style={{ width: 40, height: 2, backgroundColor: '#c8a97a', borderRadius: 1, marginBottom: 16, opacity: 0.6 }} />

          {/* Emoji + Title row */}
          <Text style={{ fontSize: 32, marginBottom: 6 }}>{greeting.emoji}</Text>
          <Text
            style={{
              fontFamily: 'OswaldMedium',
              fontSize: 20,
              color: '#4e342e',
              letterSpacing: 1,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {greeting.title}
          </Text>

          {/* Message body */}
          <Text
            style={{
              fontSize: 13,
              color: '#795548',
              textAlign: 'center',
              lineHeight: 20,
              fontWeight: '500',
            }}
          >
            {greeting.message}
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function AppSetup({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isUser } = useSelector((state) => state.user);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401) {
          const url = error.config?.url || "";
          const isAuthRoute = url.includes("/login") || url.includes("/signup") || url.includes("/register");
          if (!isAuthRoute) {
            await SecureStore.deleteItemAsync("authToken");
            dispatch(clearUser());
            Toast.show({ type: "info", text1: "Session expired", text2: "Please login again", position: "top", visibilityTime: 2500 });
            router.replace("/singlepage/login");
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  useEffect(() => {
    if (isUser) {
      registerAndSaveToken().catch(() => { });
    }
  }, [isUser]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      Toast.show({ type: "info", text1: title, text2: body, position: "top", visibilityTime: 3000 });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.order_id) {
        router.push({ pathname: "/singlepage/orderdetails", params: { id: data.order_id } });
      } else {
        router.push("/singlepage/notifications");
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return children;
}

export default function _layout() {
  const [fontsLoaded, fontError] = useFonts({
    Oswald: Oswald_400Regular,
    OswaldMedium: Oswald_500Medium,
    OswaldBold: Oswald_700Bold,
  });

  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const [greetingData, setGreetingData] = useState(null);

  // Fetch today's active splash message from the backend.
  // This runs before the splash fades out so the data is ready.
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await axios.get(`${baseurl.replace('/api/user', '')}/api/user/splash-message`, {
          timeout: 4000,
        });
        if (res.data?.success && res.data?.data) {
          setGreetingData(res.data.data);
        }
        // If success:false → greetingData stays null → CustomSplash uses day default
      } catch {
        // Network error / timeout → silently fall back to day default
      }
    };
    fetchGreeting();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <Provider store={store}>
        <AppSetup>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tab)' />
          </Stack>
          <Toast />
        </AppSetup>
      </Provider>
      {!splashAnimationComplete && (
        <CustomSplash
          greetingData={greetingData}
          onAnimationComplete={() => setSplashAnimationComplete(true)}
        />
      )}
    </SafeAreaProvider>
  )
}