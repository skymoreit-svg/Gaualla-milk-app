import { View, Text, ScrollView, Linking } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Mail, Server, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const Privacy = () => {
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
          <Shield size={22} color="#3b82f6" />
          <Text className="text-xl font-bold ml-2 text-gray-900">Privacy Policy</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-gray-500 mt-4 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Text className="text-base text-gray-700 mb-6">
          At DairyDelight, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our mobile application and services.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          1. Information We Collect
        </Text>
        <View className="flex-row items-start mb-2">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Personal Information:</Text> Name, email address, phone number, delivery address when you create an account or place an order.
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Payment Information:</Text> Credit card details, billing address (processed securely by our payment partners).
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Usage Data:</Text> Information about how you interact with our app, including order history, preferences, and device information.
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Shield size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Location Data:</Text> With your permission, we may collect precise location data to provide delivery services.
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          2. How We Use Your Information
        </Text>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Process and deliver your dairy product orders
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Communicate with you about orders, products, and promotions
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Improve our app, products, and services
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Personalize your experience and provide relevant recommendations
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Ensure the security of our services and prevent fraud
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          3. How We Share Your Information
        </Text>
        <Text className="text-gray-700 mb-6">
          We do not sell your personal information. We may share your information with:
          Service providers (payment processors, delivery partners)
          Legal authorities when required by law
          Business transfers in case of merger or acquisition
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          4. Data Security
        </Text>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            We implement appropriate security measures to protect your personal information
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Payment information is encrypted and processed by secure payment gateways
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Lock size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            Despite our efforts, no security measures are 100% secure
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          5. Your Rights and Choices
        </Text>
        <View className="flex-row items-start mb-2">
          <Eye size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Access and Update:</Text> You can review and edit your personal information in the app settings
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Trash2 size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Deletion:</Text> You can request deletion of your account and personal data
          </Text>
        </View>
        <View className="flex-row items-start mb-2">
          <Server size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Data Portability:</Text> You can request a copy of your personal data
          </Text>
        </View>
        <View className="flex-row items-start mb-6">
          <Globe size={18} color="#6b7280" className="mt-1 mr-2" />
          <Text className="text-gray-700 flex-1">
            <Text className="font-semibold">Marketing Preferences:</Text> You can opt-out of marketing communications at any time
          </Text>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          6. Data Retention
        </Text>
        <Text className="text-gray-700 mb-6">
          We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is typically retained for 5 years for tax and accounting purposes.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          7. Children's Privacy
        </Text>
        <Text className="text-gray-700 mb-6">
          Our services are not directed to individuals under 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          8. Changes to This Policy
        </Text>
        <Text className="text-gray-700 mb-6">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
        </Text>

        <Text className="text-lg font-bold text-gray-900 mb-4">
          9. Contact Us
        </Text>
        <Text className="text-gray-700 mb-2">
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <TouchableOpacity onPress={openEmail} className="mb-8">
          <Text className="text-blue-500">Gauallamilkpvtltd@gmail.com</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Privacy;