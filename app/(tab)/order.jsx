import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { baseurl, imgurl } from '../../allapi';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6', icon: 'timer-sand' },
  processing: { label: 'Processing', color: '#f59e0b', bg: '#fef3c7', icon: 'clock-outline' },
  out_for_delivery: { label: 'Out For Delivery', color: '#3b82f6', bg: '#dbeafe', icon: 'truck-delivery-outline' },
  completed: { label: 'Completed', color: '#10b981', bg: '#d1fae5', icon: 'check-circle-outline' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', icon: 'close-circle-outline' },
};

export default function Order() {
  const { isUser } = useSelector((state) => state.user);
  const router = useRouter();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('running');

  const getOrder = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const response = await axios.get(`${baseurl}/order/getorder`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("token", token);

      const data = response.data;
      if (data.success) {
        setAllOrders(data?.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  const getProductImage = (imageString) => {
    try {
      const images = JSON.parse(imageString);
      return images?.[0] || null;
    } catch {
      return null;
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isUser) {
        router.push("/singlepage/login");
      } else {
        getOrder();
      }
    }, [isUser])
  );

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6EFC8' }}>
        <ActivityIndicator size="large" color="#3e2723" />
        <Text style={{ marginTop: 14, color: '#9ca3af', fontSize: 14 }}>Fetching your orders…</Text>
      </View>
    );
  }

  // ── Empty State ─────────────────────────────────────────────────
  if (!allOrders || allOrders.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#fdf6f3',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#f0e0d8',
          }}
        >
          <MaterialCommunityIcons name="package-variant-closed" size={52} color="#d4a99a" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
          No Orders Yet
        </Text>
        <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 32 }}>
          You haven't placed any orders yet.{'\n'}Start shopping to see them here!
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={{
            backgroundColor: '#3e2723',
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
          activeOpacity={0.9}
        >
          <Ionicons name="storefront-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Shop Now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const runningOrders = allOrders.filter(
    (order) => ['pending', 'processing', 'out_for_delivery'].includes(order.status)
  );
  const historyOrders = allOrders.filter(
    (order) => ['completed', 'cancelled'].includes(order.status)
  );

  const displayedOrders = activeTab === 'running' ? runningOrders : historyOrders;

  // ── Orders List ─────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 }}>
            My Orders
          </Text>
          <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
            {allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'} placed
          </Text>
        </View>

        {/* Tab Bar */}
        <View style={{ flexDirection: 'row', backgroundColor: '#eae0d5', borderRadius: 16, padding: 4, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setActiveTab('running')}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'running' ? '#3e2723' : 'transparent',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: activeTab === 'running' ? '#fff' : '#3e2723', fontWeight: '700', fontSize: 14 }}>
              Running ({runningOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('history')}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'history' ? '#3e2723' : 'transparent',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: activeTab === 'history' ? '#fff' : '#3e2723', fontWeight: '700', fontSize: 14 }}>
              History ({historyOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {displayedOrders.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <MaterialCommunityIcons
              name={activeTab === 'running' ? "package-variant" : "history"}
              size={48}
              color="#d4a99a"
              style={{ marginBottom: 12 }}
            />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
              {activeTab === 'running' ? "No Running Orders" : "No Past Orders"}
            </Text>
            <Text style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              {activeTab === 'running'
                ? "You don't have any active deliveries right now."
                : "You don't have any completed or cancelled orders."}
            </Text>
          </View>
        ) : displayedOrders.map((order) => {
          const statusCfg = STATUS_CONFIG[order.status] || {
            label: order.status || 'Pending',
            color: '#6b7280',
            bg: '#f3f4f6',
            icon: 'help-circle-outline',
          };

          const orderTotal = (order.items || []).reduce(
            (sum, i) => sum + parseFloat(i.price || 0) * parseInt(i.quantity || 1),
            0
          );

          return (
            <View
              key={order.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 22,
                marginBottom: 18,
                overflow: 'hidden',
                shadowColor: '#3e2723',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
                borderWidth: 1,
                borderColor: '#f5ede8',
              }}
            >
              {/* ── Order Card Header ──────────────────────── */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f5ede8',
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>ORDER</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937' }}>
                    #{order.id}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: statusCfg.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    gap: 4,
                  }}
                >
                  <MaterialCommunityIcons name={statusCfg.icon} size={13} color={statusCfg.color} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: statusCfg.color }}>
                    {statusCfg.label}
                  </Text>
                </View>
              </View>

              {/* ── Order Items ──────────────────────────────── */}
              <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                {(order.items || []).map((item, index) => {
                  const productImage = getProductImage(item.product_image);
                  const isLast = index === order.items.length - 1;

                  return (
                    <Link
                      key={item.id}
                      href={{ pathname: '/singlepage/orderdetails', params: { id: order.id } }}
                      style={{
                        display: 'flex',
                        paddingBottom: 12,
                        marginBottom: isLast ? 0 : 12,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: '#f5ede8',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {/* Product Image */}
                        <View
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 14,
                            backgroundColor: '#fdf6f3',
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#f0e0d8',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                            flexShrink: 0,
                          }}
                        >
                          {productImage ? (
                            <Image
                              source={{ uri: `${imgurl}/${productImage}` }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text style={{ fontSize: 28 }}>🥛</Text>
                          )}
                        </View>

                        {/* Product Details */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 3 }}
                            numberOfLines={2}
                          >
                            {item.product_name}
                          </Text>
                          {item.variant_name ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <View style={{ backgroundColor: '#fdf6f3', borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#6d4c41' }}>{item.variant_name}</Text>
                              </View>
                            </View>
                          ) : null}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              Qty:{' '}
                              <Text style={{ fontWeight: '700', color: '#3e2723' }}>{item.quantity}</Text>
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              Price:{' '}
                              <Text style={{ fontWeight: '700', color: '#3e2723' }}>
                                {formatCurrency(item.price)}
                              </Text>
                            </Text>
                          </View>
                          {item.start_date && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Feather name="calendar" size={10} color="#9ca3af" />
                              <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                                Starts {formatDate(item.start_date)}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Arrow */}
                        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                      </View>
                    </Link>
                  );
                })}
              </View>

              {/* ── Order Card Footer ────────────────────────── */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#fdf8f6',
                  borderTopWidth: 1,
                  borderTopColor: '#f5ede8',
                  marginTop: 4,
                }}
              >
                <View>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 1 }}>
                    {formatDate(order.created_at)}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#3e2723' }}>
                    {formatCurrency(orderTotal)}
                  </Text>
                </View>
                <Link
                  href={{ pathname: '/singlepage/orderdetails', params: { id: order.id } }}
                  style={{
                    backgroundColor: '#3e2723',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Feather name="eye" size={13} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>View Details</Text>
                </Link>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}