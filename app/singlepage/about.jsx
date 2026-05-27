import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Leaf, Heart, Shield, Clock, Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const AboutPage = () => {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/profile");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginRight: 12 }}
        >
          <ArrowLeft size={20} color="#3e2723" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 }}>About Us</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8', paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginBottom: 16 }}>
            <Award size={32} color="#6d4c41" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1f2937', textAlign: 'center', marginBottom: 8, lineHeight: 28 }}>
            Natural Taste From The Gaualla Farm!
          </Text>
          <Text style={{ fontSize: 13, color: '#6d4c41', textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
            Enjoy the authentic, creamy taste of A2 Desi Cow milk—pure, fresh, and naturally produced on our ethical Gaualla farms.
          </Text>
        </View>

        {/* Core Pillars Grid */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {/* Card 1 */}
            <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Award size={18} color="#0284c7" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 6 }}>Pure A2 Desi Milk</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', lineHeight: 15 }}>
                Wholesome, A2-certified milk sourced from indigenous cows raised with love.
              </Text>
            </View>

            {/* Card 2 */}
            <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Shield size={18} color="#dc2626" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 6 }}>Toxin & Adulteration Free</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', lineHeight: 15 }}>
                No chemicals or synthetic antibiotics—just 100% natural, healthy milk.
              </Text>
            </View>

            {/* Card 3 */}
            <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Leaf size={18} color="#16a34a" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 6 }}>Sustainable Farming</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', lineHeight: 15 }}>
                Organic soil health and natural pest control, promoting sustainability.
              </Text>
            </View>

            {/* Card 4 */}
            <View style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Clock size={18} color="#d97706" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#1f2937', marginBottom: 6 }}>Tradition & Freshness</Text>
              <Text style={{ fontSize: 11, color: '#6b7280', lineHeight: 15 }}>
                Daily milk sourced traditionally, maintaining freshness from farm to home.
              </Text>
            </View>
          </View>
        </View>

        {/* Commitment section */}
        <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Our Commitment to Quality
          </Text>

          <View style={{ backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f5ede8', padding: 16, gap: 16 }}>
            {/* Item 1 */}
            <View style={{ flexDirection: 'row', alignItems: 'start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Award size={16} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 2 }}>Certified A2 Milk</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 17 }}>
                  Our milk is certified A2 and sourced exclusively from indigenous Indian cow breeds raised with ethical care.
                </Text>
              </View>
            </View>

            {/* Item 2 */}
            <View style={{ flexDirection: 'row', alignItems: 'start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Shield size={16} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 2 }}>Zero Chemicals, No Adulteration</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 17 }}>
                  We strictly avoid synthetic hormones, antibiotics, and preservatives to preserve only pure and natural nutrition.
                </Text>
              </View>
            </View>

            {/* Item 3 */}
            <View style={{ flexDirection: 'row', alignItems: 'start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Leaf size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 2 }}>Ethical Farming</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 17 }}>
                  Natural processes enrich our soil, ensuring chemical-free, fertile fields where cows thrive in comfort.
                </Text>
              </View>
            </View>

            {/* Item 4 */}
            <View style={{ flexDirection: 'row', alignItems: 'start' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Heart size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 2 }}>Tradition Meets Purity</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 17 }}>
                  We blend time-honoured practices with modern cleanliness to deliver milk and ghee filled with natural goodness.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Our Farm Story */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Our Farm Story
          </Text>
          <View style={{ backgroundColor: '#fdf8f6', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f0e0d8' }}>
            <Text style={{ fontSize: 13, color: '#3e2723', lineHeight: 20, marginBottom: 12, textAlign: 'justify' }}>
              Founded in 2010, Gaualla Farms began with a simple mission: to provide families with pure, unadulterated dairy products while treating our cows with the respect and care they deserve.
            </Text>
            <Text style={{ fontSize: 13, color: '#3e2723', lineHeight: 20, textAlign: 'justify' }}>
              Today, we continue this tradition, delivering farm-fresh A2 milk directly to your doorstep while maintaining our commitment to sustainable farming practices.
            </Text>
          </View>
        </View>

        {/* Brand Footer */}
        <View style={{ marginTop: 32, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#f5ede8', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#9ca3af' }}>© Gaualla Farms</Text>
          <Text style={{ fontSize: 10, color: '#d1d5db' }}>Pure A2 Milk Delivery System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutPage;