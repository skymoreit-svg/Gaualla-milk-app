import { View, Text, ScrollView, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Leaf, Heart, Shield, Clock, Award, } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

const about = () => {
  const router = useRouter();

  const handleGoBack = () => {
    const canGoBack = router.canGoBack();
    console.log("[BackButton] about pressed", { canGoBack });
    if (router.canGoBack()) {
      console.log("[BackButton] about -> router.back()");
      router.back();
      return;
    }
    console.log("[BackButton] about -> fallback /(tab)/profile");
    router.replace("/(tab)/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="mr-4 p-2 rounded-lg"
        >
          <ArrowLeft pointerEvents="none" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">About Us</Text>
      </View>

     <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
       
        <View className="p-5 bg-green-50">
          
          <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
            Natural Taste From The Gaualla Farm!
          </Text>
          <Text className="text-gray-700 text-center">
            Enjoy the authentic, creamy taste of A2 Desi Cow milk—pure, fresh, and naturally produced on our ethical Gaualla farms.
          </Text>
        </View>

       
        <View className="p-5">
          <View className="flex-row flex-wrap justify-between">
           
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="bg-blue-100 p-3 rounded-full mb-3">
                <Award size={24} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 font-bold text-center mb-2">Pure A2 Desi Cow Milk</Text>
              <Text className="text-gray-600 text-xs text-center">
                Wholesome, A2-certified milk sourced from indigenous cows raised ethically with love and care.
              </Text>
            </View>

            
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="bg-red-100 p-3 rounded-full mb-3">
                <Shield size={24} color="#dc2626" />
              </View>
              <Text className="text-gray-900 font-bold text-center mb-2">Chemical & Antibiotic Free</Text>
              <Text className="text-gray-600 text-xs text-center">
                No adulteration, no antibiotics—just 100% natural, healthy milk for your family's well-being.
              </Text>
            </View>

            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="bg-green-100 p-3 rounded-full mb-3">
                <Leaf size={24} color="#16a34a" />
              </View>
              <Text className="text-gray-900 font-bold text-center mb-2">Sustainable Farming Practices</Text>
              <Text className="text-gray-600 text-xs text-center">
                We use cow dung and urine for organic soil health and natural pest control, promoting sustainability.
              </Text>
            </View>

           
            <View className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-4 items-center">
              <View className="bg-amber-100 p-3 rounded-full mb-3">
                <Clock size={24} color="#d97706" />
              </View>
              <Text className="text-gray-900 font-bold text-center mb-2">Tradition & Freshness Focused</Text>
              <Text className="text-gray-600 text-xs text-center">
                Daily milk sourced traditionally with care, maintaining freshness and quality from farm to home.
              </Text>
            </View>
          </View>
        </View>

        <View className="p-5 bg-gray-50">
          <Text className="text-xl font-bold text-center text-gray-900 mb-6">
            Our Commitment to Quality
          </Text>

          <View className="space-y-5">
          
            <View className="flex-row items-start">
              <View className="bg-blue-100 p-2 rounded-full mr-4">
                <Award size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold mb-1">Certified A2 Milk</Text>
                <Text className="text-gray-600">
                  This milk is certified A2 and is sourced exclusively from indigenous Indian cow breeds raised with ethical care.
                </Text>
              </View>
            </View>

        
            <View className="flex-row items-start">
              <View className="bg-red-100 p-2 rounded-full mr-4">
                <Shield size={20} color="#dc2626" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold mb-1">Zero Chemicals, No Adulteration</Text>
                <Text className="text-gray-600">
                  We strictly avoid synthetic antibiotics, hormones, and preservatives to give you only pure and natural nutrition.
                </Text>
              </View>
            </View>

          
            <View className="flex-row items-start">
              <View className="bg-green-100 p-2 rounded-full mr-4">
                <Leaf size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold mb-1">Sustainable & Ethical Farming</Text>
                <Text className="text-gray-600">
                  Cow dung and urine naturally enrich the soil, ensuring chemical-free, fertile land where cows thrive.
                </Text>
              </View>
            </View>

            
            <View className="flex-row items-start">
              <View className="bg-amber-100 p-2 rounded-full mr-4">
                <Heart size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold mb-1">Tradition Meets Purity</Text>
                <Text className="text-gray-600">
                  We blend time-honoured practices with modern cleanliness to deliver milk and ghee filled with natural goodness.
                </Text>
              </View>
            </View>
          </View>
        </View>

      
        <View className="p-5 bg-white">
          <Text className="text-xl font-bold text-center text-gray-900 mb-4">Our Farm Story</Text>
          <View className="bg-green-50 p-5 rounded-xl">
            <Text className="text-gray-700 text-center mb-3">
              Founded in 2010, Gaualla Farms began with a simple mission: to provide families with pure, unadulterated dairy products while treating our cows with the respect and care they deserve.
            </Text>
            <Text className="text-gray-700 text-center">
              Today, we continue this tradition, delivering farm-fresh A2 milk directly to your doorstep while maintaining our commitment to sustainable farming practices.
            </Text>
          </View>
        </View>

       
        <View className="p-5 bg-gray-100 items-center">
          <Text className="text-gray-500 text-sm">© 2023 Gaualla Farms</Text>
          <Text className="text-gray-500 text-sm">Pure A2 Milk Delivery</Text>
        </View>
      </ScrollView> 
    </SafeAreaView>
  );
};

export default about;