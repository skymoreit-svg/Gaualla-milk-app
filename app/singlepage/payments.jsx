import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Phone, CreditCard, Banknote, Smartphone, Globe, Building, Wallet, Shield, Check } from 'lucide-react-native';

const Payments = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const paymentMethods = [
    { id: 1, name: 'UPI', icon: <Smartphone size={28} color="#6366f1" />, color: '#6366f1' },
    { id: 2, name: 'PhonePe', icon: <Phone size={28} color="#673ab7" />, color: '#673ab7' },
    { id: 3, name: 'Paytm', icon: <Wallet size={28} color="#002970" />, color: '#002970' },
    { id: 4, name: 'Google Pay', icon: <Smartphone size={28} color="#4285f4" />, color: '#4285f4' },
    { id: 5, name: 'Credit Card', icon: <CreditCard size={28} color="#3b82f6" />, color: '#3b82f6' },
    { id: 6, name: 'Debit Card', icon: <CreditCard size={28} color="#10b981" />, color: '#10b981' },
    { id: 7, name: 'Net Banking', icon: <Globe size={28} color="#6366f1" />, color: '#6366f1' },
    { id: 8, name: 'Cash on Delivery', icon: <Banknote size={28} color="#6b7280" />, color: '#6b7280' },
  ];

 
  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-indigo-50 to-white">
      <Animated.View style={{ opacity: fadeAnim }} className="p-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-indigo-900 mb-2">Payment Methods</Text>
          <Text className="text-gray-600">Choose your preferred payment option</Text>
        </View>
        
        {/* Payment Methods Grid */}
        <View className="bg-white rounded-3xl shadow-lg p-6 mb-6 shadow-indigo-100">
          <View className="flex-row items-center justify-center mb-6">
            <View className="h-px bg-gray-200 flex-1" />
            <Text className="text-lg font-semibold text-gray-800 px-4">Select Payment Method</Text>
            <View className="h-px bg-gray-200 flex-1" />
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id}
                className={`w-[45%] rounded-2xl p-5 mb-5 items-center justify-center border-2 border-indigo-500 bg-indigo-50 shadow-sm`}
                
                activeOpacity={0.7}
              >
                <View className={`p-3 rounded-full mb-3  bg-indigo-100`}>
                  {method.icon}
                </View>
                <Text className="text-sm font-medium text-gray-800">{method.name}</Text>
                
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Security Badge */}
        <View className="bg-white rounded-3xl shadow-lg p-6 mb-6 shadow-indigo-100">
          <View className="flex-row items-center justify-center">
            <Shield size={20} color="#10b981" />
            <Text className="text-green-600 font-medium ml-2">Secure & Encrypted</Text>
          </View>
          <Text className="text-center text-gray-500 mt-2">
            Your payment details are protected with bank-level security
          </Text>
        </View>
        
        {/* Payment Button */}
       
        
        {/* Accepted Payments */}
        <View className="mt-8 mb-4">
          <Text className="text-center text-gray-500 text-sm">
            We accept all major payment methods
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default Payments;