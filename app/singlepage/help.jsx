import { View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Truck,
  CreditCard,
  User,
  Shield,
  Package
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const Help = () => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const callSupport = () => {
    Linking.openURL('tel:+91-8378-000052');
  };

  const emailSupport = () => {
    Linking.openURL('mailto:Gauallamilkpvtltd@gmail.com-');
  };

  const chatSupport = () => {
    // In a real app, this would open a chat interface
    alert('Chat support would open here');
  };

  const faqData = [
    {
      id: 'ordering',
      title: 'Ordering & Payments',
      icon: CreditCard,
      questions: [
        {
          q: 'How do I place an order?',
          a: 'To place an order, browse our products, add items to your cart, proceed to checkout, select delivery time, and complete payment.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept credit/debit cards, UPI, net banking, and digital wallets like Paytm and Google Pay.'
        },
        {
          q: 'Can I modify my order after placing it?',
          a: 'You can modify your order within 30 minutes of placing it. After that, please contact our support team immediately.'
        }
      ]
    },
    {
      id: 'delivery',
      title: 'Delivery & Shipping',
      icon: Truck,
      questions: [
        {
          q: 'What are your delivery areas?',
          a: 'We currently deliver within city limits. You can enter your pin code on our homepage to check service availability.'
        },
        {
          q: 'What are your delivery timings?',
          a: 'We deliver from 6 AM to 10 PM daily. You can select your preferred time slot during checkout.'
        },
        {
          q: 'Do you charge for delivery?',
          a: 'Delivery is free for orders above ₹299. For smaller orders, a ₹40 delivery fee applies.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Quality',
      icon: Package,
      questions: [
        {
          q: 'How fresh are your dairy products?',
          a: 'We source milk daily from local farms and all products are made fresh. We maintain cold chain throughout delivery.'
        },
        {
          q: 'Are your products organic?',
          a: 'Yes, we work with certified organic farms. All products are clearly labeled with their certification details.'
        },
        {
          q: 'What if I receive a damaged or spoiled product?',
          a: 'We guarantee product quality. If you receive any damaged item, contact us within 24 hours with photos for a full refund or replacement.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: User,
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Go to Login screen, click "Forgot Password", enter your registered email, and follow the instructions sent to your email.'
        },
        {
          q: 'Can I have multiple delivery addresses?',
          a: 'Yes, you can save up to 3 delivery addresses in your account settings and choose your preferred address at checkout.'
        },
        {
          q: 'How do I update my personal information?',
          a: 'Go to Profile → Edit Profile to update your name, email, phone number, or other personal details.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Hygiene',
      icon: Shield,
      questions: [
        {
          q: 'What safety measures do you follow during delivery?',
          a: 'All delivery personnel wear masks and gloves, use sanitizer regularly, and maintain social distancing during deliveries.'
        },
        {
          q: 'How are your products handled?',
          a: 'Our products are handled with utmost hygiene, stored at optimal temperatures, and packaged securely to maintain freshness.'
        },
        {
          q: 'Are your delivery packages sanitized?',
          a: 'Yes, all packages are sanitized before dispatch and our delivery personnel follow strict hygiene protocols.'
        }
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <HelpCircle size={22} color="#3b82f6" />
            <Text className="text-xl font-bold ml-2 text-gray-900">Help & Support</Text>
          </View>
        </View>
        <Text className="text-gray-600 mt-2">
          We're here to help you with any questions or concerns
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Quick Support Options */}
        <View className="p-5">
          <Text className="text-lg font-bold text-gray-900 mb-4">Get Quick Help</Text>
          <View className="flex-row justify-between mb-6">
            <TouchableOpacity 
              className="items-center justify-center bg-white p-4 rounded-xl shadow-sm w-28"
              onPress={callSupport}
            >
              <Phone size={24} color="#3b82f6" />
              <Text className="text-gray-700 mt-2 text-center">Call Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center bg-white p-4 rounded-xl shadow-sm w-28"
              onPress={emailSupport}
            >
              <Mail size={24} color="#3b82f6" />
              <Text className="text-gray-700 mt-2 text-center">Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center bg-white p-4 rounded-xl shadow-sm w-28"
              onPress={chatSupport}
            >
              <MessageCircle size={24} color="#3b82f6" />
              <Text className="text-gray-700 mt-2 text-center">Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Support Hours */}
          <View className="bg-blue-50 p-4 rounded-xl mb-6">
            <View className="flex-row items-center">
              <Clock size={18} color="#3b82f6" />
              <Text className="text-blue-800 font-medium ml-2">Support Hours: 7 AM - 11 PM (Everyday)</Text>
            </View>
          </View>
        </View>

        {/* FAQ Sections */}
        <View className="px-5">
          <Text className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</Text>
          
          {faqData.map((section) => (
            <View key={section.id} className="mb-4">
              <TouchableOpacity 
                className="flex-row items-center justify-between bg-white p-4 rounded-t-xl border-b border-gray-100"
                onPress={() => toggleSection(section.id)}
              >
                <View className="flex-row items-center">
                  <section.icon size={20} color="#4b5563" />
                  <Text className="text-gray-800 font-medium ml-3">{section.title}</Text>
                </View>
                {expandedSections[section.id] ? (
                  <ChevronUp size={20} color="#9ca3af" />
                ) : (
                  <ChevronDown size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
              
              {expandedSections[section.id] && (
                <View className="bg-white rounded-b-xl overflow-hidden">
                  {section.questions.map((item, index) => (
                    <View key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                      <Text className="text-gray-900 font-medium mb-2">{item.q}</Text>
                      <Text className="text-gray-600">{item.a}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View className="p-5 mt-4">
          <View className="bg-red-50 p-5 rounded-xl">
            <Text className="text-red-800 font-bold mb-2">Emergency Quality Issue</Text>
            <Text className="text-red-700 mb-3">
              If you have consumed our product and are experiencing health issues, please contact us immediately:
            </Text>
            <TouchableOpacity onPress={callSupport} className="flex-row items-center">
              <Phone size={18} color="#dc2626" />
              <Text className="text-red-700 font-bold ml-2">+91-8378-000052</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Help;