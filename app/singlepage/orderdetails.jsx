import { View, Text, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { baseurl, imgurl } from '../Components/allapi';
import * as SecureStore from "expo-secure-store";
import { 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Truck,
  Check,
  User,
  ChevronRight
} from 'lucide-react-native';

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const token = await SecureStore.getItem("authToken");
      const response = await axios.get(`${baseurl}/order/getsingleorder/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data;
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} color="#10b981" />;
      case 'processing':
        return <Clock size={20} color="#f59e0b" />;
      case 'shipped':
        return <Truck size={20} color="#3b82f6" />;
      default:
        return <Clock size={20} color="#6b7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 border-green-200';
      case 'processing':
        return 'bg-amber-100 border-amber-200';
      case 'shipped':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-800';
      case 'processing':
        return 'text-amber-800';
      case 'shipped':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg text-gray-600">Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 py-5 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Order Details</Text>
          <Text className="text-gray-500 mt-1">Order ID: #{order.id}</Text>
        </View>

        {/* Order Status Card */}
        <View className="bg-white mx-5 my-5 rounded-xl p-5 border border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              {getStatusIcon(order.status)}
              <Text className="ml-2 text-lg font-semibold text-gray-900">Order Status</Text>
            </View>
            <View className={`px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              <Text className={`text-sm font-medium capitalize ${getStatusTextColor(order.status)}`}>
                {order.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-600">Payment Status</Text>
            <View className={`px-3 py-1 rounded-full border ${getStatusColor(order.payment_status)}`}>
              <Text className={`text-sm font-medium capitalize ${getStatusTextColor(order.payment_status)}`}>
                {order.payment_status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
            <Calendar size={18} color="#6b7280" />
            <Text className="ml-2 text-gray-600">Placed on {formatDate(order.created_at)}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white mx-5 my-2 rounded-xl p-5 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <Package size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">Order Items</Text>
          </View>
          
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const images = parseProductImages(item.product_image);
              const firstImage = images.length > 0 ? images[0] : null;
              
              return (
                <View key={index} className="flex-row py-4 border-b border-gray-100 last:border-b-0">
                  {firstImage ? (
                    <Image 
                      source={{ uri: `${imgurl}/${firstImage}` }} 
                      className="w-16 h-16 rounded-lg mr-4"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-lg mr-4 bg-gray-200 items-center justify-center">
                      <Package size={24} color="#9ca3af" />
                    </View>
                  )}
                  
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-base mb-1">
                      {item.product_name}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-1">Quantity: {item.quantity}</Text>
                    <Text className="text-gray-500 text-sm">
                      Start Date: {formatDate(item.start_date)}
                    </Text>
                    
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="text-gray-500 text-sm">
                        ₹{item.price} each
                      </Text>
                      <Text className="font-semibold text-gray-900">
                        ₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text className="text-gray-500 py-3">No items information available</Text>
          )}
          
          <View className="flex-row justify-between pt-4 mt-2 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
            <Text className="text-lg font-bold text-gray-900">₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View className="bg-white mx-5 my-2 rounded-xl p-5 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <User size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">Customer Information</Text>
          </View>
          
          <Text className="text-gray-900 font-medium text-base mb-3">
            {order.first_name} {order.last_name}
          </Text>
          
          <View className="flex-row items-start">
            <MapPin size={18} color="#6b7280" className="mt-1" />
            <View className="ml-2 flex-1">
              <Text className="text-gray-600 text-sm">{order.street}</Text>
              <Text className="text-gray-600 text-sm">
                {order.city}, {order.state} {order.zip_code}
              </Text>
              <Text className="text-gray-600 text-sm">{order.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <View className="bg-white mx-5 my-2 rounded-xl p-5 border border-gray-200 mb-6">
          <View className="flex-row items-center mb-4">
            <CreditCard size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">Payment Information</Text>
          </View>
          
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Payment Method</Text>
            <Text className="font-medium text-gray-900 capitalize">{order.type || 'daily'}</Text>
          </View>
          
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Payment Status</Text>
            <View className="flex-row items-center">
              {order.payment_status === 'paid' ? (
                <Check size={16} color="#10b981" />
              ) : null}
              <Text className={`ml-1 font-medium capitalize ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {order.payment_status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between py-2 border-t border-gray-100 mt-2 pt-3">
            <Text className="text-gray-600">Order Type</Text>
            <Text className="font-medium text-gray-900 capitalize">{order.type}</Text>
          </View>
          
          {order.notes && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-gray-600 mb-1">Order Notes</Text>
              <Text className="text-gray-900">{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Support Section */}
        <View className="bg-white mx-5 my-2 rounded-xl p-5 border border-gray-200 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Need Help?</Text>
          <Text className="text-gray-600 text-sm mb-4">
            If you have any questions about your order, please contact our customer support team.
          </Text>
          <View className="flex-row justify-between items-center py-3 border-t border-gray-100">
            <Text className="text-blue-600 font-medium">Contact Support</Text>
            <ChevronRight size={18} color="#3b82f6" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetails;