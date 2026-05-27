import { MaterialIcons } from '@expo/vector-icons';
import axios from "axios";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { baseurl } from '../../allapi';
import ProductCard from '../Components/ProductCard';

const { width } = Dimensions.get("window");

// Helper to assign premium icons/emojis to categories
const getCategoryIcon = (catName) => {
  const name = catName.toLowerCase();
  if (name.includes('milk')) return '🐄';
  if (name.includes('paneer')) return '🧀';
  if (name.includes('ghee')) return '🏺';
  if (name.includes('curd') || name.includes('yogurt')) return '🥣';
  if (name.includes('butter')) return '🧈';
  return '🥛';
};

export default function CategoriesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [cat, setCat] = useState([]);
  const [allproduct, setAllproduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const flatListRef = useRef(null);

  // Combined categories list (All Products + dynamic categories)
  const categoryList = [
    { name: "all", label: "ALL PRODUCTS", emoji: "🥛" },
    ...(cat || []).map((item) => ({
      name: item.name,
      label: item.name,
      emoji: getCategoryIcon(item.name),
      id: item.id
    }))
  ];

  // Auto-scroll the selected category to the horizontal center
  useEffect(() => {
    if (categoryList.length > 0 && flatListRef.current) {
      const idx = categoryList.findIndex(item => item.name === selectedCategory);
      if (idx !== -1) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: idx,
            animated: true,
            viewPosition: 0.5 // 0.5 centers the active item horizontally
          });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedCategory, cat]);

  const handleScrollToIndexFailed = (info) => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5
      });
    }, 100);
    return () => clearTimeout(timer);
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${baseurl}/category/`);
      const data = response.data;
      if (data.success) {
        setCat(data.category);
      }
    } catch (err) {
      console.log("Category fetch error:", err);
    }
  };

  const handelcatagypress = async (categoryName = "all") => {
    try {
      const response = await axios.get(`${baseurl}/getproduct/${categoryName}`);
      const data = response.data;
      if (data.success) {
        setAllproduct(data.product);
      }
    } catch (err) {
      console.log("Product fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    const initialCategory = typeof category === "string" && category.trim()
      ? category
      : "all";
    setSelectedCategory(initialCategory);
    handelcatagypress(initialCategory);
  }, [category]);

  const onCategoryPress = (categoryName) => {
    const nextCategory = categoryName || "all";
    setSelectedCategory(nextCategory);
    handelcatagypress(nextCategory);
    router.setParams({ category: nextCategory });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      {/* 🌟 Premium Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
        <View>
          <Text className="text-2xl font-oswald-bold text-gray-900 tracking-wide uppercase">Gaualla Dairy</Text>
          <Text className="text-xs text-primary-600 font-bold mt-0.5 tracking-wider uppercase">Explore Farm-Fresh Collection</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/singlepage/searchpage")}
          className="bg-primary-50 p-2.5 rounded-full border border-primary-100 shadow-sm"
          activeOpacity={0.8}
        >
          <MaterialIcons name="search" size={22} color="#6d4c41" />
        </TouchableOpacity>
      </View>

      {/* Layout */}
      <View className="flex-1">
        {/* 🥛 Luxurious Horizontal Category Pills */}
        <View className="bg-white py-3.5 border-b border-gray-100 shadow-sm">
          <FlatList
            ref={flatListRef}
            data={categoryList}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
            keyExtractor={(item) => item.name}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.name;
              return (
                <TouchableOpacity
                  onPress={() => onCategoryPress(item.name)}
                  className={`py-2.5 px-5 rounded-full mr-3 flex-row items-center space-x-1.5 transition-all ${
                    isSelected
                      ? "bg-primary-600 border border-primary-700 shadow-md shadow-primary-600/30"
                      : "bg-white border border-gray-200 shadow-sm"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className="text-base mr-1">{item.emoji}</Text>
                  <Text className={`font-oswald-bold text-sm tracking-wider uppercase ${isSelected ? "text-white" : "text-gray-700"}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Product Area */}
        <View className="flex-1 bg-appBackground">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 144 }}
          >
            {/* Category Section Header */}
            <View className="mt-6 mb-6">
              <View className="flex-row items-center px-4 justify-between">
                <View className="flex-1 h-3 overflow-hidden">
                  <Image
                    source={require("../../assets/images/design_cat.png")}
                    style={{ width: '100%', height: '500%' }}
                    resizeMode="repeat"
                  />
                </View>
                <View className="items-center mx-3">
                  <Text className="text-2xl font-oswald-bold text-gray-900 tracking-wide uppercase">
                    {selectedCategory === 'all' ? 'ALL PRODUCTS' : (selectedCategory ? selectedCategory.toUpperCase() : '')}
                  </Text>
                  <View className="bg-primary-50 py-0.5 px-3 rounded-full border border-primary-100 mt-1 shadow-sm">
                    <Text className="text-[10px] font-extrabold text-primary-800 uppercase tracking-widest">
                      {allproduct ? allproduct.length : 0} Items Available
                    </Text>
                  </View>
                </View>
                <View className="flex-1 h-3 overflow-hidden">
                  <Image
                    source={require("../../assets/images/design_cat.png")}
                    style={{ width: '100%', height: '500%' }}
                    resizeMode="repeat"
                  />
                </View>
              </View>
            </View>

            {/* Product Grid */}
            <View className="flex-row flex-wrap justify-between px-4">
              {allproduct && allproduct.length > 0 ? (
                allproduct.map((item, index) => (
                  <View
                    key={`prod-${item.id || index}`}
                    style={{ width: "48%", marginBottom: 16 }}
                  >
                    <ProductCard product={item} wid="w-full" m="" />
                  </View>
                ))
              ) : (
                <View className="w-full items-center justify-center mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <View className="bg-primary-50 p-6 rounded-full border border-primary-100 mb-4 shadow-sm">
                    <MaterialIcons name="inventory_2" size={48} color="#6d4c41" />
                  </View>
                  <Text className="text-gray-800 font-oswald-bold text-xl tracking-wide uppercase mb-1">No Dairy Products Found</Text>
                  <Text className="text-gray-500 text-xs text-center mb-6 leading-relaxed max-w-[220px]">
                    We couldn't find any items in this category at the moment.
                  </Text>
                  <TouchableOpacity
                    onPress={() => onCategoryPress("all")}
                    className="bg-primary-600 py-3 px-6 rounded-xl shadow-md shadow-primary-600/30"
                    activeOpacity={0.9}
                  >
                    <Text className="text-white font-oswald-bold text-xs tracking-widest uppercase">BROWSE ALL PRODUCTS</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
