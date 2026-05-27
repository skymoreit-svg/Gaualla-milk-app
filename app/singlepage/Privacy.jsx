import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Eye, Trash2, Server, Globe } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const Privacy = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/profile");
    }
  };

  const openEmail = () => {
    Linking.openURL('mailto:Gauallamilkpvtltd@gmail.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#3e2723" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Shield size={20} color="#6d4c41" />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateText}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        <Text style={styles.introText}>
          At Gaualla, we take your privacy seriously. This Privacy Policy describes how we collect, use, and share your personal information when you use our mobile application and farm-to-table dairy delivery services.
        </Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>
          1. Information We Collect
        </Text>
        <View style={styles.bulletItem}>
          <Shield size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Personal Information:</Text> Name, email address, phone number, and delivery addresses when you register or order.
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Shield size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Payment Details:</Text> Transaction details and payment history. We do not store full payment credentials on our servers; they are encrypted by certified processors.
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Shield size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Usage Logs:</Text> Order selections, delivery notes, and technical logs to help customize catalog suggestions.
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Shield size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Geolocation Data:</Text> GPS coordinates used strictly with your permission to verify local route boundaries.
          </Text>
        </View>

        {/* Section 2 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          2. How We Use Your Information
        </Text>
        <View style={styles.bulletItem}>
          <Lock size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>Process and dispatch scheduled farm-to-table dairy orders</Text>
        </View>
        <View style={styles.bulletItem}>
          <Lock size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>Deliver support notifications and order tracking links</Text>
        </View>
        <View style={styles.bulletItem}>
          <Lock size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>Optimize routing efficiency for our delivery partners</Text>
        </View>
        <View style={styles.bulletItem}>
          <Lock size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>Prevent fraudulent transactions and secure payment profiles</Text>
        </View>

        {/* Section 3 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          3. How We Share Your Information
        </Text>
        <Text style={styles.bodyText}>
          We value your privacy and do not sell your personal data. We only share details with trusted logistics partners (delivery agents) and secure payment processors (like Razorpay) strictly required to fulfill your order transactions.
        </Text>

        {/* Section 4 */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          4. Your Choices & Controls
        </Text>
        <View style={styles.bulletItem}>
          <Eye size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Profile Editing:</Text> Review and edit name, phone, and addresses directly inside profile tabs.
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Trash2 size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Account Deletion:</Text> Contact us directly to wipe data histories from active databases.
          </Text>
        </View>
        <View style={styles.bulletItem}>
          <Server size={16} color="#6d4c41" style={styles.bulletIcon} />
          <Text style={styles.bulletText}>
            <Text style={styles.boldLabel}>Data Portability:</Text> Request structural reports outlining personal files currently saved.
          </Text>
        </View>

        {/* Contact */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
          5. Contact Data Protection Desk
        </Text>
        <Text style={styles.bodyText}>
          For feedback, complaints, or inquiries regarding your data security, please mail us:
        </Text>
        <TouchableOpacity onPress={openEmail} activeOpacity={0.8} style={styles.emailContainer}>
          <Text style={styles.emailText}>Gauallamilkpvtltd@gmail.com</Text>
        </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  introText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3e2723',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 10,
  },
  bulletIcon: {
    marginTop: 3,
    marginRight: 10,
  },
  bulletText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    flex: 1,
  },
  boldLabel: {
    fontWeight: '700',
    color: '#1f2937',
  },
  bodyText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  emailContainer: {
    marginTop: 4,
    backgroundColor: '#fdf6f3',
    borderWidth: 1,
    borderColor: '#f0e0d8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  emailText: {
    color: '#3e2723',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default Privacy;