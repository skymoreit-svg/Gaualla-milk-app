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
      Alert.alert("Validation Error", "Name cannot be empty");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert("Validation Error", "Please enter a valid 10-digit phone number");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8" }} edges={['top', 'left', 'right']}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#f5ede8", shadowColor: "#3e2723", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#fdf6f3", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#f0e0d8", marginRight: 12 }}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#3e2723" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1f2937", letterSpacing: -0.5 }}>
              Edit Profile
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !hasChanges}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: hasChanges && !loading ? "#3e2723" : "#e5e7eb",
              justifyContent: "center",
              alignItems: "center"
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: "800", color: hasChanges ? "#fff" : "#9ca3af" }}>
                SAVE
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar / Initials bubble */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: "#fdf6f3",
              borderWidth: 2,
              borderColor: "#f0e0d8",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3e2723",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2
            }}>
              <Text style={{ color: "#3e2723", fontSize: 32, fontWeight: "900" }}>
                {name ? name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 12, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>VIP MEMBER</Text>
          </View>

          {/* Full Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              Full Name
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <User size={18} color="#a1887f" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#a1887f"
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              Email Address
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Mail size={18} color="#a1887f" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#a1887f"
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: "#6d4c41", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8, marginLeft: 2, letterSpacing: 0.5 }}>
              Phone Number
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0e0d8", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Phone size={18} color="#a1887f" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#a1887f"
                style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#3e2723", fontWeight: "500", padding: 0 }}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Save Button (bottom) */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !hasChanges}
            style={{
              height: 52,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: hasChanges && !loading ? "#3e2723" : "#e5e7eb",
              shadowColor: "#3e2723",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: hasChanges && !loading ? 0.15 : 0,
              shadowRadius: 8,
              elevation: hasChanges && !loading ? 3 : 0,
            }}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={20} color={hasChanges ? "#fff" : "#9ca3af"} />
                <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: "800", color: hasChanges ? "#fff" : "#9ca3af", letterSpacing: 0.5 }}>
                  SAVE CHANGES
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Pressable>
    </SafeAreaView>
  );
}
