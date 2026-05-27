import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Truck,
  User
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { baseurl, imgurl } from '../../allapi';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6', icon: 'hourglass-outline' },
  processing: { label: 'Processing', color: '#f59e0b', bg: '#fef3c7', icon: 'time-outline' },
  out_for_delivery: { label: 'Out For Delivery', color: '#3b82f6', bg: '#dbeafe', icon: 'bicycle-outline' },
  completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5', icon: 'checkmark-circle-outline' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', icon: 'close-circle-outline' },
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(1);
};

const getDeliverySchemeLabel = (type) => {
  switch (type) {
    case 'custom_dates':
      return 'Custom Dates Schedule';
    case 'daily':
      return 'Daily (30 Days)';
    case 'alternative':
      return 'Alternative Days';
    case 'one_time':
      return 'One-time Delivery';
    default:
      return type ? type.replace('_', ' ') : 'Subscription';
  }
};

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const [orderRes, trackingRes] = await Promise.all([
        axios.get(`${baseurl}/order/getsingleorder/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${baseurl}/order/track/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
      ]);

      if (orderRes.data?.success) {
        setOrder(orderRes.data.order);
      }
      if (trackingRes.data?.success) {
        setTracking(trackingRes.data.tracking);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
      setTrackingLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliverySteps = (deliveryStatus) => {
    const statuses = ["unassigned", "assigned", "accepted", "picked_up", "in_transit", "delivered"];
    const currentIdx = statuses.indexOf(deliveryStatus || "unassigned");
    return [
      { key: "assigned", label: "Assigned", done: currentIdx >= 1 },
      { key: "accepted", label: "Accepted", done: currentIdx >= 2 },
      { key: "picked_up", label: "Picked Up", done: currentIdx >= 3 },
      { key: "in_transit", label: "In Transit", done: currentIdx >= 4 },
      { key: "delivered", label: "Delivered", done: currentIdx >= 5 },
    ];
  };

  // Parse product images
  const parseProductImages = (imageString) => {
    try {
      if (!imageString) return [];
      return JSON.parse(imageString);
    } catch (error) {
      console.error("Error parsing images:", error);
      return [];
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3e2723" />
        <Text style={{ marginTop: 14, color: '#9ca3af', fontSize: 14 }}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  // ── Order not found state ───────────────────────────────────
  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#3e2723', marginBottom: 8 }}>Order Not Found</Text>
        <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 }}>We couldn't retrieve the details for this order.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#3e2723', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] || {
    label: order.status || 'Pending',
    color: '#6b7280',
    bg: '#f3f4f6',
    icon: 'help-circle-outline',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      {/* ── Premium Custom Header ──────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginRight: 12 }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#3e2723" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 }}>
            Order #{order.id}
          </Text>
          <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600', marginTop: 1 }}>
            Placed on {formatDate(order.created_at)}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* ── Order Status Summary Card ──────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Package size={20} color="#6d4c41" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Delivery Status</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: statusCfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 }}>
              <Ionicons name={statusCfg.icon} size={14} color={statusCfg.color} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: statusCfg.color, textTransform: 'capitalize' }}>{statusCfg.label}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5ede8' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CreditCard size={18} color="#6d4c41" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: '#4b5563', fontWeight: '500' }}>Payment Status</Text>
            </View>
            <View style={{ backgroundColor: order.payment_status === 'paid' ? '#d1fae5' : '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 0.5, borderColor: order.payment_status === 'paid' ? '#a7f3d0' : '#fca5a5' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: order.payment_status === 'paid' ? '#065f46' : '#991b1b', textTransform: 'capitalize' }}>
                {order.payment_status}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f5ede8' }}>
            <Calendar size={18} color="#9ca3af" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '500' }}>Scheduled Morning delivery details below</Text>
          </View>
        </View>

        {/* ── Assigned Delivery Executive Card ──────────────────────── */}
        {(order.delivery_man_name || tracking?.rider) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Truck size={18} color="#6d4c41" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Delivery Executive</Text>
              </View>
              <View style={{ backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#0369a1', textTransform: 'uppercase' }}>Assigned</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#3e2723' }}>
                  {order.delivery_man_name || tracking?.rider?.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  🚘 {order.delivery_man_vehicle || tracking?.rider?.vehicle_type || 'Delivery Vehicle'}
                </Text>
              </View>

              {(order.delivery_man_phone || tracking?.rider?.phone) && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${order.delivery_man_phone || tracking.rider.phone}`)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#d1fae5',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#a7f3d0'
                  }}
                >
                  <Phone size={18} color="#065f46" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Delivery OTP Bubble */}
        {order.status !== 'cancelled' && order.delivery_otp && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#fcd34d', backgroundColor: '#fffbeb', alignItems: 'center', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
            <Text style={{ fontSize: 11, color: '#b45309', fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }}>Secure Delivery Verification OTP</Text>
            <Text style={{ fontSize: 28, letterSpacing: 6, fontWeight: '900', color: '#78350f' }}>{order.delivery_otp}</Text>
            <Text style={{ fontSize: 11, color: '#b45309', textAlign: 'center', marginTop: 6 }}>Share this pin code with the rider upon doorstep delivery.</Text>
          </View>
        )}

        {/* ── Custom Dates Calendar Card ──────────────────────── */}
        {order.type === 'custom_dates' && (order.daily_deliveries_summary || order.custom_delivery_dates || order.alternative_dates) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Calendar size={18} color="#6d4c41" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Delivery Schedule ({
                order.daily_deliveries_summary ? order.daily_deliveries_summary.length :
                  (Array.isArray(order.custom_delivery_dates)
                    ? order.custom_delivery_dates.length
                    : JSON.parse(order.alternative_dates || '[]').length)
              } Days)</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, fontWeight: '600' }}>
              Your fresh milk will be delivered on the following selected dates:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(() => {
                let deliveries = [];
                if (order.daily_deliveries_summary && order.daily_deliveries_summary.length > 0) {
                  deliveries = order.daily_deliveries_summary;
                } else {
                  const fallbackDates = Array.isArray(order.custom_delivery_dates)
                    ? order.custom_delivery_dates
                    : JSON.parse(order.alternative_dates || '[]');
                  deliveries = fallbackDates.map(d => ({ date: d, status: 'pending' }));
                }

                return deliveries.map((delivery, idx) => {
                  const formattedDate = new Date(delivery.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    weekday: 'short'
                  });

                  let bgColor = '#fdf8f6';
                  let borderColor = '#f0e0d8';
                  let textColor = '#6d4c41';
                  let iconName = null;
                  let iconColor = null;

                  switch (delivery.status) {
                    case 'pending':
                      bgColor = '#fef3c7';
                      borderColor = '#fde68a';
                      textColor = '#d97706';
                      iconName = 'time-outline';
                      iconColor = '#d97706';
                      break;
                    case 'delivered':
                    case 'completed':
                      bgColor = '#d1fae5';
                      borderColor = '#a7f3d0';
                      textColor = '#059669';
                      iconName = 'checkmark-circle';
                      iconColor = '#059669';
                      break;
                    case 'cancelled':
                      bgColor = '#fee2e2';
                      borderColor = '#fecaca';
                      textColor = '#dc2626';
                      iconName = 'close-circle';
                      iconColor = '#dc2626';
                      break;
                  }

                  return (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 4
                      }}
                    >
                      {iconName && <Ionicons name={iconName} size={14} color={iconColor} />}
                      <Text style={{ fontSize: 12, fontWeight: '700', color: textColor }}>
                        {formattedDate}
                      </Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        )}

        {/* ── Delivery Live Tracking ──────────────────────── */}
        {order.status !== 'cancelled' && !trackingLoading && tracking?.delivery_status && tracking.delivery_status !== "unassigned" && (
          <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Truck size={20} color="#6d4c41" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Delivery Tracking</Text>
            </View>

            {/* Steps timeline view */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', marginBottom: 10 }}>Rider Timeline</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {getDeliverySteps(tracking.delivery_status).map((step) => (
                  <View
                    key={step.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: step.done ? '#d1fae5' : '#f3f4f6',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 0.5,
                      borderColor: step.done ? '#a7f3d0' : '#e5e7eb',
                      gap: 4
                    }}
                  >
                    {step.done && <Ionicons name="checkmark" size={12} color="#065f46" />}
                    <Text style={{ fontSize: 11, fontWeight: '700', color: step.done ? '#065f46' : '#6b7280' }}>
                      {step.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Rider profile card */}
            {tracking.rider && (
              <View style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#f0e0d8', backgroundColor: '#fdf8f6', marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>Assigned Courier</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#3e2723' }}>{tracking.rider.name}</Text>
                <Text style={{ fontSize: 13, color: '#6d4c41', marginTop: 2 }}>{tracking.rider.phone || "Phone hidden by privacy"}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, textTransform: 'capitalize' }}>
                  🚘 {tracking.rider.vehicle_type || "Delivery Vehicle"} {tracking.rider.vehicle_number ? `• ${tracking.rider.vehicle_number}` : ""}
                </Text>
              </View>
            )}

            {/* Delivery OTP Bubble */}
            {tracking.delivery_status === "in_transit" && tracking.delivery_otp && (
              <View style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fcd34d', backgroundColor: '#fffbeb', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: '#b45309', fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }}>Secure Delivery Verification OTP</Text>
                <Text style={{ fontSize: 28, letterSpacing: 6, fontWeight: '900', color: '#78350f' }}>{tracking.delivery_otp}</Text>
                <Text style={{ fontSize: 11, color: '#b45309', textAlign: 'center', marginTop: 6 }}>Share this pin code with the rider upon doorstep delivery.</Text>
              </View>
            )}

            {/* Live Map Frame */}
            {["picked_up", "in_transit"].includes(tracking.delivery_status) &&
              (tracking.rider?.latitude || order?.address?.latitude) && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Live Delivery Map</Text>
                    {tracking.rider?.latitude && tracking.rider?.longitude && order?.address?.latitude && order?.address?.longitude && (
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#059669' }}>
                        {calculateDistance(
                          parseFloat(tracking.rider.latitude),
                          parseFloat(tracking.rider.longitude),
                          parseFloat(order.address.latitude),
                          parseFloat(order.address.longitude)
                        )} km away
                      </Text>
                    )}
                  </View>
                  <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f5ede8' }}>
                    <MapView
                      style={{ height: 220 }}
                      initialRegion={{
                        latitude: parseFloat(tracking.rider?.latitude || order.address.latitude),
                        longitude: parseFloat(tracking.rider?.longitude || order.address.longitude),
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }}
                    >
                      {tracking.rider?.latitude && tracking.rider?.longitude && (
                        <Marker
                          coordinate={{
                            latitude: parseFloat(tracking.rider.latitude),
                            longitude: parseFloat(tracking.rider.longitude),
                          }}
                          title="Gaualla Rider"
                          description={tracking.rider.name || "Courier"}
                        />
                      )}
                      {order?.address?.latitude && order?.address?.longitude && (
                        <Marker
                          coordinate={{
                            latitude: parseFloat(order.address.latitude),
                            longitude: parseFloat(order.address.longitude),
                          }}
                          title="Home Address"
                          description="Your delivery doorstep"
                        />
                      )}
                      {tracking.rider?.latitude && tracking.rider?.longitude && order?.address?.latitude && order?.address?.longitude && (
                        <Polyline
                          coordinates={[
                            {
                              latitude: parseFloat(tracking.rider.latitude),
                              longitude: parseFloat(tracking.rider.longitude),
                            },
                            {
                              latitude: parseFloat(order.address.latitude),
                              longitude: parseFloat(order.address.longitude),
                            },
                          ]}
                          strokeColor="#6d4c41"
                          strokeWidth={4}
                        />
                      )}
                    </MapView>
                  </View>
                </View>
              )}
          </View>
        )}

        {/* ── Order Items List Card ──────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Package size={20} color="#6d4c41" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Items Ordered</Text>
          </View>

          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const images = parseProductImages(item.product_image);
              const firstImage = images.length > 0 ? images[0] : null;
              const isLast = index === order.items.length - 1;

              return (
                <View key={index} style={{ flexDirection: 'row', paddingVertical: 14, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#f5ede8' }}>
                  {/* Thumbnail Container */}
                  <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    backgroundColor: '#fdf6f3',
                    borderWidth: 1,
                    borderColor: '#f0e0d8',
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14
                  }}>
                    {firstImage ? (
                      <Image
                        source={{ uri: `${imgurl}/${firstImage}` }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={{ fontSize: 24 }}>🥛</Text>
                    )}
                  </View>

                  {/* Info details */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 3 }} numberOfLines={1}>
                      {item.product_name}
                    </Text>
                    {item.variant_name ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <View style={{ backgroundColor: '#6d4c41', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.4 }}>{item.variant_name}</Text>
                        </View>
                      </View>
                    ) : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        Qty: <Text style={{ fontWeight: '700', color: '#3e2723' }}>{item.quantity}</Text>
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        Price: <Text style={{ fontWeight: '700', color: '#3e2723' }}>₹{item.price}</Text>
                      </Text>
                    </View>

                    {item.start_date && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
                        <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                          Starts: {formatDate(item.start_date)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#3e2723' }}>
                      ₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={{ fontSize: 13, color: '#9ca3af', py: 4 }}>No item details available</Text>
          )}

          {/* Subtotal Total Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', pt: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f5ede8', marginTop: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Total Paid Amount</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#3e2723' }}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* ── Customer Delivery Address Card ──────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <User size={18} color="#6d4c41" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Customer & Destination</Text>
          </View>

          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
            {order.first_name} {order.last_name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'start' }}>
            <MapPin size={16} color="#9ca3af" style={{ marginTop: 2, marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 18 }}>{order.street}</Text>
              <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 18 }}>
                {order.city}, {order.state} {order.zip_code}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{order.country}</Text>
            </View>
          </View>
        </View>

        {/* ── Billing details Card ──────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <CreditCard size={18} color="#6d4c41" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937' }}>Billing details</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', py: 2, paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Payment Method</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#3e2723', textTransform: 'uppercase' }}>{order.payment_method || 'Razorpay'}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', py: 2, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f5ede8' }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Delivery Scheme</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#3e2723', textTransform: 'capitalize' }}>{getDeliverySchemeLabel(order.type)}</Text>
          </View>

          {order.notes && (
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5ede8' }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>Order Notes</Text>
              <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 18 }}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* ── Help Support Card ──────────────────────── */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 16, padding: 20, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 6 }}>Need Assistance?</Text>
          <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 16 }}>
            If you have questions about subscription timelines or immediate deliveries, get in touch with our help desk.
          </Text>

          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+91-8378-000052')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5ede8' }}
            activeOpacity={0.7}
          >
            <Phone size={16} color="#16a34a" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '700', flex: 1 }}>Call Support Center</Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '600' }}>+91-8378-000052</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/singlepage/help')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5ede8' }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13, color: '#3b82f6', fontWeight: '700' }}>Browse Help FAQs</Text>
            <ChevronRight size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;