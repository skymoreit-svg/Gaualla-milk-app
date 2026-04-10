import React from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import axios from "axios";
import { clearUser } from "../store/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseurl } from "../../allapi";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  FileText,
  Info,
  LogOut,
  MapPin,
  Heart,
  Shield,
  Bell,
  HelpCircle,
  ChevronRight,
  Trash2,
} from "lucide-react-native";

export default function Profile() {
  const { isUser, info } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("authToken");
              dispatch(clearUser());
            } catch (error) {
              Alert.alert("Error", "Failed to clear token");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and personal data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("authToken");
              if (!token) {
                Alert.alert("Session Expired", "Please login again.");
                return;
              }

              const response = await axios.delete(`${baseurl}/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response?.data?.success) {
                await SecureStore.deleteItemAsync("authToken");
                dispatch(clearUser());
                Alert.alert("Account Deleted", "Your account has been deleted successfully.");
              } else {
                Alert.alert("Error", response?.data?.message || "Failed to delete account.");
              }
            } catch (error) {
              console.log("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (!isUser) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6" edges={['top', 'left', 'right']}>
        <User size={64} color="#9ca3af" />
        <Text className="text-xl font-bold text-gray-800 mt-4">You're not logged in</Text>
        <Text className="text-gray-500 mt-2 text-center">
          Please log in to view your profile and manage your account.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/singlepage/login")}
          className="mt-6 bg-green-600 px-8 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-lg">Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const MenuItem = ({ icon: Icon, label, onPress, showChevron = true }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white"
    >
      <View className="flex-row items-center space-x-4">
        <View className="bg-gray-100 p-2 rounded-lg">
          <Icon size={20} color="#4b5563" />
        </View>
        <Text className="text-gray-800 text-base font-medium">{label}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">My Profile</Text>
        </View>

        {/* User Profile Section */}
        <View className="bg-white p-5 mt-4 mx-4 rounded-xl shadow-sm">
          <View className="flex-row items-center">
            <View className="bg-blue-100 p-4 rounded-full">
              <User size={28} color="#3b82f6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {info?.user?.name || "User Name"}
              </Text>
              <Text className="text-gray-500 mt-1">
                {info?.user?.email || "user@example.com"}
              </Text>
              <Text className="text-gray-500">
                {info?.user?.phone || "+1 234 567 8900"}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push("/singlepage/edit-profile")}
              className="bg-blue-50 p-2 rounded-lg"
            >
              <Text className="text-blue-600 font-medium">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View className="mt-6 mx-4 rounded-xl overflow-hidden">
          <Text className="text-gray-500 text-sm font-medium px-5 py-2 bg-gray-50">
            ACCOUNT
          </Text>
          <MenuItem
            icon={User}
            label="Personal Information"
            onPress={() => router.push("/singlepage/personal-info")}
          />
          <MenuItem
            icon={MapPin}
            label="Address"
            onPress={() => router.push("/singlepage/addresses")}
          />
        </View>

        {/* Activities Section */}
        <View className="mt-6 mx-4 rounded-xl overflow-hidden">
          <Text className="text-gray-500 text-sm font-medium px-5 py-2 bg-gray-50">
            ACTIVITIES
          </Text>
          <MenuItem
            icon={ShoppingBag}
            label="My Orders"
            onPress={() => router.push("/(tab)/order")}
          />
          <MenuItem
            icon={Heart}
            label="Wishlist"
            onPress={() => router.push("/singlepage/wishlist")}
          />
        </View>

        {/* Support Section */}
        <View className="mt-6 mx-4 rounded-xl overflow-hidden">
          <Text className="text-gray-500 text-sm font-medium px-5 py-2 bg-gray-50">
            SUPPORT
          </Text>
          <MenuItem
            icon={HelpCircle}
            label="Help Center"
            onPress={() => router.push("/singlepage/help")}
          />
          <MenuItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => router.push("/singlepage/Privacy")}
          />
          <MenuItem
            icon={FileText}
            label="Terms & Conditions"
            onPress={() => router.push("/singlepage/terms")}
          />
        </View>

        {/* App Settings Section */}
        <View className="mt-6 mx-4 rounded-xl overflow-hidden">
          <Text className="text-gray-500 text-sm font-medium px-5 py-2 bg-gray-50">
            APP SETTINGS
          </Text>
          <MenuItem
            icon={Bell}
            label="Notifications"
            onPress={() => router.push("/singlepage/notifications")}
          />
          <MenuItem
            icon={Info}
            label="About Us"
            onPress={() => router.push("/singlepage/about")}
          />
        </View>

        {/* App Version */}
        <View className="items-center my-6">
          <Text className="text-gray-400">App Version 1.2.3</Text>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-2 mb-10">
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-red-100 py-4 rounded-xl flex-row items-center justify-center border border-red-200 mb-3"
          >
            <Trash2 size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold text-base ml-2">Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-4 rounded-xl flex-row items-center justify-center shadow-md"
          >
            <LogOut size={22} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}