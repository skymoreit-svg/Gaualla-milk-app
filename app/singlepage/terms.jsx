import { View, Text, ScrollView, Linking } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Shield, Truck, CreditCard, Store } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const Terms = () => {
  const router = useRouter();

  const openEmail = () => {
    Linking.openURL('mailto:Gauallamilkpvtltd@gmail.com');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <FileText size={22} color="#3b82f6" />
          <Text className="text-xl font-bold ml-2 text-gray-900">Terms & Conditions</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-gray-500 mt-4 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          1. Acceptance of Terms
        </Text>
        <Text className="text-gray-700 mb-6">
          By accessing or using DairyDelight mobile application, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our application.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          2. Account Registration
        </Text>
        <Text className="text-gray-700 mb-6">
          To access certain features, you must create an account. You agree to provide accurate information and keep your login credentials secure. You are responsible for all activities under your account.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          3. Product Information
        </Text>
        <Text className="text-gray-700 mb-6">
          We strive to provide accurate information about our dairy products including pricing, nutritional information, and availability. However, we cannot guarantee that all information is entirely accurate, complete, or current.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          4. Orders and Payment
        </Text>
        <View className="flex-row items-start mb-2">
          <CreditCard size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            All orders are subject to product availability. We reserve the right to limit quantities and refuse service.
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <CreditCard size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Payment must be completed at the time of order. We accept various payment methods as displayed during checkout.
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <CreditCard size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Prices are subject to change without notice but will be confirmed at the time of order.
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          5. Delivery
        </Text>
        <View className="flex-row items-start mb-2">
          <Truck size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            We deliver to specified areas during designated time slots. You must provide accurate delivery information.
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Truck size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Perishable items require someone to be present at the delivery address to receive the order.
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Truck size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Delivery fees may apply and will be displayed before order confirmation.
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          6. Returns and Refunds
        </Text>
        <Text className="text-gray-700 mb-6">
          Due to the perishable nature of dairy products, returns are only accepted for defective or spoiled items. Claims must be made within 24 hours of delivery with photographic evidence. Refunds will be processed to the original payment method.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          7. Product Safety and Storage
        </Text>
        <View className="flex-row items-start mb-2">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            It is your responsibility to properly store dairy products upon delivery at recommended temperatures.
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Consume products before the expiration date and follow any storage instructions provided.
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          8. Intellectual Property
        </Text>
        <Text className="text-gray-700 mb-6">
          All content included in this app, such as text, graphics, logos, images, and software, is the property of DairyDelight or its content suppliers and protected by intellectual property laws.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          9. Limitation of Liability
        </Text>
        <Text className="text-gray-700 mb-6">
          DairyDelight shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the application or our products.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          10. Changes to Terms
        </Text>
        <Text className="text-gray-700 mb-6">
          We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          11. Governing Law
        </Text>
        <Text className="text-gray-700 mb-6">
          These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our company is registered, without regard to its conflict of law provisions.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          12. Contact Information
        </Text>
        <View className="flex-row items-start mb-2">
          <Store size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            For questions about these Terms and Conditions, please contact us at:
          </Text>
        </View>
        <TouchableOpacity onPress={openEmail}>
          <Text className="text-blue-500 mb-8">Gauallamilkpvtltd@gmail.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;