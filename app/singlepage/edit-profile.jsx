import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { ArrowLeft, User, Mail, Phone, Check } from "lucide-react-native";
import { baseurl } from "../../allapi";
import { getUser } from "../store/userSlice";

export default function EditProfile() {
  const { info } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = info?.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const hasChanges =
    name !== (user.name || "") ||
    email !== (user.email || "") ||
    phone !== (user.phone || "");

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Validation", "Please enter a valid email");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert("Validation", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        Alert.alert("Error", "Session expired. Please login again.");
        router.replace("/singlepage/login");
        return;
      }

      const res = await axios.put(
        `${baseurl}/updateuser`,
        { name: name.trim(), email: email.trim(), phone: phone.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        await dispatch(getUser()).unwrap();
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Update failed");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Pressable className="flex-1" onPress={Keyboard.dismiss}>
        {/* Header */}
        <View className="bg-white flex-row items-center px-4 py-4 shadow-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-lg bg-gray-100"
          >
            <ArrowLeft size={22} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 ml-4">
            Edit Profile
          </Text>
          <View className="flex-1" />
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !hasChanges}
            className={`px-5 py-2 rounded-xl ${
              hasChanges && !loading ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                className={`font-bold ${
                  hasChanges ? "text-white" : "text-gray-500"
                }`}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View className="items-center mb-8">
            <View className="bg-blue-500 w-24 h-24 rounded-full items-center justify-center">
              <Text className="text-white text-4xl font-bold">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          </View>

          {/* Name Field */}
          <View className="mb-5">
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              Full Name
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <User size={20} color="#6b7280" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-gray-800 text-base"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-5">
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              Email Address
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Mail size={20} color="#6b7280" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-gray-800 text-base"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Phone Field */}
          <View className="mb-5">
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              Phone Number
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Phone size={20} color="#6b7280" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-gray-800 text-base"
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Save Button (bottom) */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !hasChanges}
            className={`mt-6 py-4 rounded-xl flex-row items-center justify-center ${
              hasChanges && !loading ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={20} color={hasChanges ? "#fff" : "#6b7280"} />
                <Text
                  className={`ml-2 text-lg font-bold ${
                    hasChanges ? "text-white" : "text-gray-500"
                  }`}
                >
                  Save Changes
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Pressable>
    </SafeAreaView>
  );
}
