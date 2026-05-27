import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, Check, Eye, EyeOff, Lock } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      Alert.alert("Validation Error", "Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match");
      return;
    }
    if (oldPassword === newPassword) {
      Alert.alert("Validation Error", "New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        Alert.alert("Session Expired", "Session expired. Please login again.");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8" }} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#f5ede8", shadowColor: "#3e2723", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#fdf6f3", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#f0e0d8", marginRight: 12 }}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#3e2723" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#1f2937", letterSpacing: -0.5 }}>
            Change Password
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={{ backgroundColor: "#fdf8f6", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 20, padding: 16, marginBottom: 24 }}>
            <Text style={{ color: "#6d4c41", fontSize: 13, lineHeight: 18, fontWeight: "500" }}>
              For security, enter your current password first. Your new password must be at least 6 characters long.
            </Text>
          </View>

          {/* Current Password */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              Current Password
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#a1887f" />
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
                placeholderTextColor="#a1887f"
                secureTextEntry={!showOld}
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)} style={{ padding: 4 }} activeOpacity={0.7}>
                {showOld ? <EyeOff size={18} color="#a1887f" /> : <Eye size={18} color="#a1887f" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              New Password
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#a1887f" />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 6 chars)"
                placeholderTextColor="#a1887f"
                secureTextEntry={!showNew}
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={{ padding: 4 }} activeOpacity={0.7}>
                {showNew ? <EyeOff size={18} color="#a1887f" /> : <Eye size={18} color="#a1887f" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              Confirm New Password
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Lock size={18} color="#a1887f" />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#a1887f"
                secureTextEntry={!showConfirm}
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ padding: 4 }} activeOpacity={0.7}>
                {showConfirm ? <EyeOff size={18} color="#a1887f" /> : <Eye size={18} color="#a1887f" />}
              </TouchableOpacity>
            </View>
          </View>

          {newPassword.length > 0 && newPassword.length < 6 && (
            <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600", marginBottom: 16, marginLeft: 2 }}>
              ⚠️ Password must be at least 6 characters
            </Text>
          )}

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600", marginBottom: 16, marginLeft: 2 }}>
              ⚠️ Passwords do not match
            </Text>
          )}

          <TouchableOpacity
            onPress={handleChangePassword}
            disabled={loading || !canSubmit}
            style={{
              marginTop: 12,
              height: 52,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: canSubmit && !loading ? "#3e2723" : "#e5e7eb",
              shadowColor: "#3e2723",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canSubmit && !loading ? 0.15 : 0,
              shadowRadius: 8,
              elevation: canSubmit && !loading ? 3 : 0,
            }}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={20} color={canSubmit ? "#fff" : "#9ca3af"} />
                <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: "800", color: canSubmit ? "#fff" : "#9ca3af", letterSpacing: 0.5 }}>
                  UPDATE PASSWORD
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
