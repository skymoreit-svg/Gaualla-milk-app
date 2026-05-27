import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { baseurl } from "../../allapi";
import { ArrowLeft, Package, Truck, CheckCircle, Bell, ShoppingCart } from "lucide-react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ICON_MAP = {
  new_order: { icon: ShoppingCart, color: "#16a34a", bg: "#d1fae5" },
  order_assigned: { icon: Truck, color: "#3b82f6", bg: "#dbeafe" },
  order_accepted: { icon: Package, color: "#d97706", bg: "#fef3c7" },
  order_delivered: { icon: CheckCircle, color: "#16a34a", bg: "#d1fae5" },
  general: { icon: Bell, color: "#6d4c41", bg: "#fdf6f3" },
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
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/profile");
    }
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
        activeOpacity={0.75}
        style={[
          styles.itemContainer,
          { backgroundColor: isUnread ? '#fffdfb' : '#fff' }
        ]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
          <IconComp size={18} color={config.color} />
        </View>
        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.itemTitle, isUnread ? styles.itemTitleUnread : styles.itemTitleRead]} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          {item.body ? (
            <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
          ) : null}
          <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleGoBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#3e2723" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markReadBtn}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6d4c41" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <Bell size={36} color="#a1887f" />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            We will notify you here when subscription orders are dispatched or delivered.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3e2723"]} tintColor="#3e2723" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFC8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f5ede8',
    elevation: 2,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e0d8',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  markReadBtn: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  emptyTitle: {
    color: '#3e2723',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#6d4c41',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    flex: 1,
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#1f2937',
  },
  itemTitleRead: {
    fontWeight: '600',
    color: '#4b5563',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  itemBody: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
    lineHeight: 17,
  },
  timeText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 6,
    fontWeight: '600',
  },
});
