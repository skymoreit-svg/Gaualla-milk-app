import "./global.css"
import { useEffect, useRef } from "react"
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from "expo-status-bar"
import Toast from "react-native-toast-message"
import { Provider, useDispatch, useSelector } from "react-redux"
import store from './store/store'
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { clearUser } from "./store/userSlice"
import { registerAndSaveToken } from "../services/notificationService"

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
      registerAndSaveToken().catch(() => {});
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
  return (
  <Provider store={store}>
    <AppSetup>
      <StatusBar style="dark" />
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name='(tab)' />
      </Stack>
      <Toast />
    </AppSetup>
  </Provider>
  )
}