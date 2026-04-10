import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { baseurl } from "../../allapi";
import { ArrowLeft, Package, Truck, CheckCircle, Bell, ShoppingCart } from "lucide-react-native";

const ICON_MAP = {
  new_order: { icon: ShoppingCart, color: "#16a34a", bg: "#f0fdf4" },
  order_assigned: { icon: Truck, color: "#2563eb", bg: "#eff6ff" },
  order_accepted: { icon: Package, color: "#d97706", bg: "#fffbeb" },
  order_delivered: { icon: CheckCircle, color: "#16a34a", bg: "#f0fdf4" },
  general: { icon: Bell, color: "#6b7280", bg: "#f9fafb" },
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleGoBack = () => {
    const canGoBack = router.canGoBack();
    console.log("[BackButton] notifications pressed", { canGoBack });
    if (router.canGoBack()) {
      console.log("[BackButton] notifications -> router.back()");
      router.back();
      return;
    }
    console.log("[BackButton] notifications -> fallback /(tab)/profile");
    router.replace("/(tab)/profile");
  };

  const fetchNotifications = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) return;

      const res = await axios.get(`${baseurl}/order/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllRead = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token || unreadCount === 0) return;

      await axios.put(`${baseurl}/order/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && unreadCount > 0) {
      const timer = setTimeout(markAllRead, 2000);
      return () => clearTimeout(timer);
    }
  }, [notifications, unreadCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const handleNotificationPress = (item) => {
    let data = item.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch (_) { data = {}; }
    }
    if (data?.order_id) {
      router.push({ pathname: "/singlepage/orderdetails", params: { id: data.order_id } });
    }
  };

  const renderItem = ({ item }) => {
    const config = ICON_MAP[item.type] || ICON_MAP.general;
    const IconComp = config.icon;
    const isUnread = item.is_read === 0;

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        className={`flex-row px-5 py-4 border-b border-gray-100 ${isUnread ? "bg-blue-50/50" : "bg-white"}`}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5"
          style={{ backgroundColor: config.bg }}
        >
          <IconComp size={20} color={config.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-base ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />}
          </View>
          {item.body ? (
            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>{item.body}</Text>
          ) : null}
          <Text className="text-xs text-gray-400 mt-1.5">{timeAgo(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="mr-4 p-2 rounded-lg"
          >
            <ArrowLeft pointerEvents="none" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-red-500 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text className="text-blue-600 text-sm font-medium">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#942e29" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Bell size={64} color="#d1d5db" />
          <Text className="text-gray-400 text-lg font-medium mt-4">No notifications yet</Text>
          <Text className="text-gray-300 text-sm text-center mt-2">
            You'll receive updates about your orders here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#942e29"]} tintColor="#942e29" />
          }
        />
      )}
    </SafeAreaView>
  );
}
