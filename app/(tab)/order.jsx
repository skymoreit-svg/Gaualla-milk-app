import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import * as SecureStore from "expo-secure-store";
import axios from 'axios';
import { baseurl, imgurl } from '../../allapi';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Order() {
  const { isUser, info } = useSelector((state) => state.user);
  const router = useRouter();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrder = async () => {
    try {
      const token = await SecureStore.getItem("authToken");
      const response = await axios.get(`${baseurl}/order/getorder`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProductImage = (imageString) => {
    try {
      const images = JSON.parse(imageString);
      return images?.[0] || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isUser) {
      router.push("/singlepage/login");
    } else {
      getOrder();
    }
  }, [isUser]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading orders...</Text>
      </View>
    );
  }

  if (!allOrders || allOrders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Text className="text-lg text-gray-600 text-center">
          No orders found
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          You haven't placed any orders yet.
        </Text>
      </View>
    );
  }

  return ( <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'left', 'right']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-3xl font-extrabold text-gray-900 mb-6">
          My Orders
        </Text>

        {allOrders.map((order) => (
          <View
            key={order.id}
            className="bg-white rounded-2xl shadow-md mb-6 p-5 border border-gray-200"
          >
            {/* Order ID + Date */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                Order #{order.id}
              </Text>
              <Text className="text-sm text-gray-500">
                {formatDate(order.created_at)}
              </Text>
            </View>

            {/* Order Items */}
            {order.items?.map((item, index) => {
              const productImage = getProductImage(item.product_image);

              return (
                <Link
                href={{ pathname: "/singlepage/orderdetails", params: { id: order.id } }}
                  key={item.id}
                  className={`flex-row pb-4 ${
                    index !== order.items.length - 1 ? "mb-4 border-b border-gray-100" : ""
                  }`}
                >
                  {productImage && (
                    <Image
                      source={{ uri: `${imgurl}/${productImage}` }}
                      className="w-20 h-20 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {item.product_name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Quantity: <Text className="font-medium">{item.quantity}</Text>
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Price: <Text className="font-medium">{formatCurrency(item.price)}</Text>
                    </Text>
                    {item.start_date && (
                      <Text className="text-xs text-gray-500 mt-1">
                        Start date: {formatDate(item.start_date)}
                      </Text>
                    )}
                  </View>
                </Link>
              );
            })}

           
           
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}