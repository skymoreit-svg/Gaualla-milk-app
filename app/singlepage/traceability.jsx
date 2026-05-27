import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck, CheckCircle2, Award, Heart, Sparkles, FileText, Truck } from "lucide-react-native";

const purityPillars = [
  {
    id: 1,
    icon: "🐄",
    title: "Happy, Grass-Fed Cattle",
    description: "Sourced from elite dairy farms where cows roam freely on green pastures and receive regular veterinary care. Strictly 100% free from artificial growth hormones (rBST) and antibiotics.",
  },
  {
    id: 2,
    icon: "🔬",
    title: "70+ Daily Quality Checks",
    description: "Every single batch undergoes rigorous automated testing for adulterants, antibiotics, aflatoxins, water dilution, and microbial counts before being cleared for bottling.",
  },
  {
    id: 3,
    icon: "❄️",
    title: "Instant 4°C Chilling",
    description: "Milk is chilled immediately upon milking to 4°C. This state-of-the-art thermal lock preserves natural taste, creamy texture, and vital vitamins without chemical preservatives.",
  },
  {
    id: 4,
    icon: "🚚",
    title: "12-Hour Farm to Doorstep",
    description: "Milked at sunset/dawn, bottled overnight in our ultra-hygienic facility, and delivered silently to your doorstep by 7:00 AM sharp every morning.",
  },
];

export default function TraceabilityPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F6EFC8' }}>
      {/* Header */}
      <View className="bg-white flex-row items-center px-4 py-4 shadow-sm border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="p-2 rounded-lg bg-appBackground"
        >
          <ArrowLeft size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">Gaualla Purity Standards</Text>
        <View className="ml-auto bg-green-100 py-1 px-3 rounded-full border border-green-200 flex-row items-center space-x-1">
          <ShieldCheck size={14} color="#16a34a" />
          <Text className="text-green-800 text-xs font-extrabold uppercase ml-1">100% Pure</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Showcase Card */}
        <View className="m-4 bg-primary-50 rounded-3xl p-6 border border-primary-100 shadow-sm relative overflow-hidden">
          <View className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-primary-100/50 -z-10" />
          <View className="absolute right-20 -top-10 w-24 h-24 rounded-full bg-primary-200/30 -z-10" />

          <View className="flex-row items-center space-x-1 mb-3">
            <Sparkles size={16} color="#6d4c41" />
            <Text className="text-xs font-extrabold text-primary-800 tracking-widest uppercase ml-1">FARM TO GLASS PROMISE</Text>
          </View>

          <Text className="text-3xl font-oswald-bold text-gray-900 tracking-wide uppercase mb-3">
            Untouched & Pristine Dairy
          </Text>
          <Text className="text-xs text-gray-600 leading-relaxed mb-6">
            Explore how we deliver pristine, nutrient-rich dairy directly from our happy cows to your morning tea. Absolutely zero middlemen, zero adulteration, and complete transparency.
          </Text>

          <View className="flex-row items-center bg-white py-2.5 px-4 rounded-2xl border border-primary-100 shadow-sm self-start space-x-2">
            <Award size={18} color="#6d4c41" />
            <Text className="text-xs font-bold text-gray-800 ml-1.5">ISO 22000 & FSSAI Certified</Text>
          </View>
        </View>

        {/* Pillars Section */}
        <View className="px-4 mt-2">
          <Text className="text-lg font-oswald-bold text-gray-800 tracking-wide uppercase mb-4 ml-1">
            The 4 Pillars of Gaualla Purity
          </Text>

          {purityPillars.map((pillar) => (
            <View key={pillar.id} className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm flex-row items-start space-x-4">
              <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center border border-primary-100 mr-3">
                <Text className="text-2xl">{pillar.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800 mb-1">{pillar.title}</Text>
                <Text className="text-xs text-gray-500 leading-relaxed">{pillar.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Lab Report Callout */}
        <View className="m-4 bg-[#3e2723] rounded-3xl p-6 shadow-lg border border-[#5d4037] relative overflow-hidden">
          <View className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#6d4c41] opacity-30" />

          <View className="flex-row items-center space-x-2 mb-3">
            <View className="bg-amber-400/20 p-2 rounded-full border border-amber-400/30 mr-2">
              <FileText size={22} color="#fbbf24" />
            </View>
            <Text className="text-amber-400 font-oswald-bold text-lg tracking-wide uppercase">Daily Lab Reports</Text>
          </View>

          <Text className="text-xs text-gray-300 leading-relaxed mb-5 max-w-[260px]">
            We publish our daily milk test results openly. Every batch is certified antibiotic-free and pure before dispatch.
          </Text>

          <TouchableOpacity
            onPress={() => Alert.alert("Lab Report", "Sample FSSAI lab report downloaded successfully.")}
            className="bg-amber-400 py-3.5 px-6 rounded-xl flex-row items-center justify-center self-start shadow-md shadow-amber-400/20 space-x-2"
            activeOpacity={0.9}
          >
            <Text className="text-[#3e2723] font-oswald-bold text-xs tracking-wider uppercase mr-2">DOWNLOAD SAMPLE REPORT</Text>
            <FileText size={16} color="#3e2723" />
          </TouchableOpacity>
        </View>

        {/* Explore Products Call-to-Action */}
        <TouchableOpacity
          onPress={() => router.push("/(tab)/category")}
          className="mx-4 mt-2 py-4 rounded-2xl bg-primary-600 shadow-md shadow-primary-600/30 flex-row items-center justify-center space-x-2"
          activeOpacity={0.9}
        >
          <Text className="text-white font-oswald-bold text-base tracking-widest uppercase">EXPERIENCE FARM FRESH PURITY</Text>
          <Truck size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
