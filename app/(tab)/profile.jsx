import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Phone,
  ShoppingBag,
  FileText,
  Info,
  LogOut,
  MapPin,
  CreditCard,
  Heart,
  Shield,
  Bell,
  HelpCircle,
  Star,
  Gift,
  ChevronRight,
} from "lucide-react-native";

export default function Profile() {
  const { isUser, info } = useSelector((state) => state.user);
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
              Alert.alert("Logged out", "Your session has been cleared.");
              await Updates.reloadAsync();
            } catch (error) {
              Alert.alert("Error", "Failed to clear token");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (!isUser) {
      router.push("/singlepage/login");
    }
  }, [isUser]);

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
    <SafeAreaView className="flex-1 bg-gray-50">
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
              onPress={() => router.push("/profile/edit")}
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
            label="Addresses"
            onPress={() => router.push("/singlepage/addresses")}
          />
          <MenuItem
            icon={CreditCard}
            label="Payment Methods"
            onPress={() => router.push("/singlepage/payments")}
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
            onPress={() => router.push("/wishlist")}
          />
          <MenuItem
            icon={Star}
            label="Reviews"
            onPress={() => router.push("/reviews")}
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
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <View className="flex-row items-center space-x-4">
              <View className="bg-gray-100 p-2 rounded-lg">
                <Bell size={20} color="#4b5563" />
              </View>
              <Text className="text-gray-800 text-base font-medium">Notifications</Text>
            </View>
            <Text className="text-gray-500">Enabled</Text>
          </View>
          <MenuItem
            icon={Info}
            label="About Us"
            onPress={() => router.push("/singlepage/about")}
          />
        </View>

        {/* Rewards Section */}
        <View className="m-4 p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-bold">Rewards Program</Text>
              <Text className="text-white text-sm mt-1">You have 245 points</Text>
            </View>
            <Gift size={28} color="white" />
          </View>
          <TouchableOpacity className="bg-white mt-4 py-2 rounded-full">
            <Text className="text-purple-600 text-center font-bold">View Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center my-6">
          <Text className="text-gray-400">App Version 1.2.3</Text>
        </View>

        {/* Logout Button */}
        <View className="px-6 mt-2 mb-10">
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