import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Keyboard,
  Pressable,
  useWindowDimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { baseurl } from "../../allapi";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { getUser } from "../store/userSlice";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  const handleSignup = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/signup`, {
        name,
        email,
        phone,
        password,
      });
      if (res.data.success && res.data.token) {
        await SecureStore.setItemAsync("authToken", res.data.token);
        await dispatch(getUser());
        router.replace("/(tab)");
      } else {
        Alert.alert("Signup Failed", res.data.message || "Something went wrong");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f0fdf4" }}
      contentContainerStyle={{
        minHeight: keyboardVisible ? undefined : height,
        justifyContent: keyboardVisible ? "flex-start" : "center",
        padding: 24,
        paddingTop: keyboardVisible ? 60 : 24,
        paddingBottom: keyboardVisible ? 40 : 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ alignItems: "center" }}>
        <Image
          source={{ uri: "https://img.icons8.com/color/96/milk-bottle.png" }}
          className="w-24 h-24 mb-6"
        />

        <Text className="text-3xl font-bold text-green-700 mb-2">Create Account</Text>
        <Text className="text-gray-500 mb-8">Sign up to get started</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#6b7280"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
        />

        <View className="w-full mb-6">
          <TextInput
            placeholder="Password"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 14, top: 14 }}
          >
            <Text className="text-gray-500 text-sm font-medium">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          className={`w-full rounded-xl py-3 ${loading ? "bg-green-400" : "bg-green-600"}`}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center w-full mt-4 mb-8">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-green-600 font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </ScrollView>
  );
}
