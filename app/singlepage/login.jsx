import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { baseurl } from "../Components/allapi";
import * as Updates from "expo-updates";   // ✅ import this


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async() => {
      const res = await axios.post(`${baseurl}/login`, {
    email,
    password
  });
  console.log(res.data.token)
  await SecureStore.setItemAsync("authToken", res.data.token);
    await Updates.reloadAsync();

  
  };

  return (
    <View className="flex-1 bg-green-50 justify-center items-center px-6">
      {/* Logo / Branding */}
      <Image
        source={{ uri: "https://img.icons8.com/color/96/milk-bottle.png" }}
        className="w-24 h-24 mb-6"
      />

      <Text className="text-3xl font-bold text-green-700 mb-2">
        Dairy Fresh
      </Text>
      <Text className="text-gray-500 mb-8">
        Login to manage your dairy products
      </Text>

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-800"
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mb-6 text-gray-800"
      />

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        className="w-full bg-green-600 rounded-xl py-3"
      >
        <Text className="text-center text-white font-bold text-lg">
          Login
        </Text>
      </TouchableOpacity>

      {/* Extra Links */}
      <View className="flex-row justify-between w-full mt-4">
        <TouchableOpacity>
          <Text className="text-green-600">Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-green-600">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
