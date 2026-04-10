import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { ArrowLeft, Lock, Eye, EyeOff, Check } from "lucide-react-native";
import { baseurl } from "../../allapi";

export default function ChangePassword() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit =
    oldPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length > 0;

  const handleChangePassword = async () => {
    Keyboard.dismiss();

    if (!oldPassword.trim()) {
      Alert.alert("Validation", "Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "New passwords do not match");
      return;
    }
    if (oldPassword === newPassword) {
      Alert.alert("Validation", "New password must be different from the current one");
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
        `${baseurl}/changepassword`,
        { oldPassword: oldPassword.trim(), newPassword: newPassword.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Alert.alert("Success", "Password changed successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", res.data.message || "Failed to change password");
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
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white flex-row items-center px-4 py-4 shadow-sm">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-lg bg-gray-100"
          >
            <ArrowLeft size={22} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 ml-4">
            Change Password
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info banner */}
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <Text className="text-blue-800 text-sm leading-5">
              For security, enter your current password first. Your new password
              must be at least 6 characters long.
            </Text>
          </View>

          {/* Current Password */}
          <View style={{ marginBottom: 20 }}>
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              Current Password
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Lock size={20} color="#6b7280" />
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showOld}
                className="flex-1 ml-3 text-gray-800 text-base"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)} style={{ padding: 4 }}>
                {showOld ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={{ marginBottom: 20 }}>
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              New Password
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Lock size={20} color="#6b7280" />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 6 chars)"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNew}
                className="flex-1 ml-3 text-gray-800 text-base"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={{ padding: 4 }}>
                {showNew ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={{ marginBottom: 20 }}>
            <Text className="text-gray-600 text-sm font-medium mb-2 ml-1">
              Confirm New Password
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Lock size={20} color="#6b7280" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirm}
                className="flex-1 ml-3 text-gray-800 text-base"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ padding: 4 }}>
                {showConfirm ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
              </TouchableOpacity>
            </View>
          </View>

          {newPassword.length > 0 && newPassword.length < 6 && (
            <Text className="text-red-500 text-xs mb-4 ml-1">
              Password must be at least 6 characters
            </Text>
          )}

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text className="text-red-500 text-xs mb-4 ml-1">
              Passwords do not match
            </Text>
          )}

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading || !canSubmit}
            className={`mt-4 py-4 rounded-xl flex-row items-center justify-center ${
              canSubmit && !loading ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={20} color={canSubmit ? "#fff" : "#6b7280"} />
                <Text
                  className={`ml-2 text-lg font-bold ${
                    canSubmit ? "text-white" : "text-gray-500"
                  }`}
                >
                  Update Password
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
