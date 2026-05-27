import { View, Text, ScrollView, Linking, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/profile");
    }
  };

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
    Alert.alert('Live Chat Support', 'Our live support assistant will connect with you shortly.');
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HelpCircle size={20} color="#6d4c41" />
            <Text style={styles.headerTitle}>Help & Support</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Support Banner Info */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>
            We're here to help you with any questions or concerns regarding our A2 dairy delivery service.
          </Text>
        </View>

        {/* Quick Support Options */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Get Quick Help</Text>
          <View style={styles.supportOptionsRow}>
            {/* Phone Support */}
            <TouchableOpacity 
              style={styles.supportOptionCard}
              onPress={callSupport}
              activeOpacity={0.8}
            >
              <View style={styles.supportIconWrapper}>
                <Phone size={20} color="#6d4c41" />
              </View>
              <Text style={styles.supportOptionText}>Call Us</Text>
            </TouchableOpacity>
            
            {/* Email Support */}
            <TouchableOpacity 
              style={styles.supportOptionCard}
              onPress={emailSupport}
              activeOpacity={0.8}
            >
              <View style={styles.supportIconWrapper}>
                <Mail size={20} color="#6d4c41" />
              </View>
              <Text style={styles.supportOptionText}>Email Support</Text>
            </TouchableOpacity>
            
            {/* Chat Support */}
            <TouchableOpacity 
              style={styles.supportOptionCard}
              onPress={chatSupport}
              activeOpacity={0.8}
            >
              <View style={styles.supportIconWrapper}>
                <MessageCircle size={20} color="#6d4c41" />
              </View>
              <Text style={styles.supportOptionText}>Live Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Support Hours Card */}
          <View style={styles.hoursCard}>
            <Clock size={16} color="#b45309" />
            <Text style={styles.hoursText}>Support Hours: 7 AM - 11 PM (Everyday)</Text>
          </View>
        </View>

        {/* FAQ Sections */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqData.map((section) => {
            const isExpanded = expandedSections[section.id];
            return (
              <View key={section.id} style={styles.faqWrapper}>
                <TouchableOpacity 
                  style={[
                    styles.faqHeader,
                    isExpanded ? styles.faqHeaderExpanded : null
                  ]}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <section.icon size={16} color="#6d4c41" />
                    <Text style={styles.faqSectionTitle}>{section.title}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={16} color="#9ca3af" />
                  ) : (
                    <ChevronDown size={16} color="#9ca3af" />
                  )}
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.faqQuestionsContainer}>
                    {section.questions.map((item, index) => (
                      <View key={index} style={styles.faqQuestionRow}>
                        <Text style={styles.questionText}>• {item.q}</Text>
                        <Text style={styles.answerText}>{item.a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Emergency Contact */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Emergency Quality Support</Text>
            <Text style={styles.emergencyDesc}>
              If you have consumed our dairy product and are experiencing critical concerns, reach our escalation desk directly:
            </Text>
            <TouchableOpacity onPress={callSupport} style={styles.emergencyBtn} activeOpacity={0.9}>
              <Phone size={14} color="#dc2626" style={{ marginRight: 6 }} />
              <Text style={styles.emergencyPhone}>+91-8378-000052</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    marginLeft: 6,
  },
  bannerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f5ede8',
  },
  bannerText: {
    fontSize: 13,
    color: '#6d4c41',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 2,
  },
  supportOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  supportOptionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#white',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f5ede8',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  supportIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf8f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  supportOptionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1f2937',
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    gap: 8,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  faqWrapper: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f5ede8',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
  },
  faqSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 10,
  },
  faqQuestionsContainer: {
    padding: 16,
    backgroundColor: '#fdfbf9',
  },
  faqQuestionRow: {
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f5ede8',
    paddingBottom: 10,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3e2723',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  emergencyCard: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 20,
    padding: 16,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#991b1b',
    marginBottom: 4,
  },
  emergencyDesc: {
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 18,
    marginBottom: 12,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#fca5a5',
  },
  emergencyPhone: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
});

export default Help;