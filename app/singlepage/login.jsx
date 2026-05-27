import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { baseurl } from "../../allapi";
import { getUser } from "../store/userSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { height } = useWindowDimensions();

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/login`, { email: email.trim(), password: password.trim() });
      if (res.data.success && res.data.token) {
        await SecureStore.setItemAsync("authToken", res.data.token);
        await dispatch(getUser());
        router.replace("/(tab)");
      } else {
        Alert.alert("Login Failed", res.data.message || "Invalid credentials.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please verify your connection.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F6EFC8" }}
      contentContainerStyle={{
        minHeight: keyboardVisible ? undefined : height,
        justifyContent: "center",
        padding: 24,
        paddingTop: keyboardVisible ? 60 : 40,
        paddingBottom: keyboardVisible ? 40 : 40,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ alignItems: "center" }}>
        {/* Logo Container */}
        <View style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "#FFFFFF",
          borderWidth: 2,
          borderColor: "#f0e0d8",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          shadowColor: "#FFFFFF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
          overflow: "hidden"
        }}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Title & Slogan */}
        <Text style={{ fontSize: 32, fontWeight: "950", color: "#3e2723", marginBottom: 6, letterSpacing: -0.5 }}>
          Gaualla
        </Text>
        <Text style={{ fontSize: 13, color: "#6d4c41", fontWeight: "500", marginBottom: 32, textAlign: "center" }}>
          Premium Farm-to-Table A2 Dairy Delivery
        </Text>

        {/* Email Input */}
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#a1887f"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            width: "100%",
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#f0e0d8",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: "#3e2723",
            fontWeight: "500",
            marginBottom: 16,
          }}
        />

        {/* Password Input Wrapper */}
        <View style={{ width: "100%", marginBottom: 28, position: "relative" }}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#a1887f"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={{
              width: "100%",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#f0e0d8",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: "#3e2723",
              fontWeight: "500",
              paddingRight: 60,
            }}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 16, top: 16 }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#6d4c41", fontSize: 13, fontWeight: "800", textTransform: "uppercase" }}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Submit Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#3e2723",
            borderRadius: 16,
            paddingVertical: 15,
            alignItems: "center",
            justifyContent: "center",
            opacity: loading ? 0.7 : 1,
            shadowColor: "#3e2723",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
            marginBottom: 16,
          }}
          activeOpacity={0.9}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.5 }}>
            {loading ? "AUTHENTICATING..." : "LOG IN"}
          </Text>
        </TouchableOpacity>

        {/* Signup Redirect Footer */}
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
          <Text style={{ color: "#6d4c41", fontSize: 14 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/singlepage/signup")} activeOpacity={0.7}>
            <Text style={{ color: "#3e2723", fontWeight: "800", fontSize: 14 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </ScrollView>
  );
}
