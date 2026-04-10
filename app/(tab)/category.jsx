import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from "axios";
import { baseurl, imgurl } from '../../allapi';
import { useEffect, useState } from 'react';
import ProductCard from '../Components/ProductCard';

const { width } = Dimensions.get("window");
const sidebarWidth = width * 0.2;
const contentWidth = width * 0.8;

export default function CategoriesScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [cat, setCat] = useState([]);
  const [allproduct, setAllproduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const handelcatagypress = async (category = "all") => {
    try {
      const response = await axios.get(`${baseurl}/getproduct/${category}`);
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Products</Text>
        <TouchableOpacity onPress={()=>router.push("/singlepage/searchpage")}>
          <MaterialIcons name="search" size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Layout */}
      <View className="flex flex-row flex-1">
        {/* Sidebar Categories */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          style={{ width: sidebarWidth, backgroundColor: "#fff", borderRightWidth: 1, borderColor: "#e5e7eb" }}
        >
          <View className="flex-col">
            {cat?.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onCategoryPress(item.name)}
                className={`rounded-lg shadow-sm mb-3 overflow-hidden border ${
                  selectedCategory === item.name ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"
                }`}
                activeOpacity={0.8}
              >
                <View className="relative">
                  <Image
                    source={{ uri: `${imgurl}/${item.image}` }}
                    style={{ width: "100%", height: 80 }}
                    resizeMode="cover"
                  />
                  <View className="absolute inset-0 bg-black/10" />
                </View>
                <View className="px-2 py-2">
                  <Text className="text-center text-xs font-medium text-gray-800" numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Product Area */}
        <View style={{ width: contentWidth }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between p-2">
              {allproduct?.map((item, index) => (
                <View
                  key={index}
                  style={{
                    width: width < 600 ? "48%" : width < 900 ? "30%" : "23%", // 2 per row on phone, 3 on tablet, 4 on large
                    marginBottom: 10,
                  }}
                >
                  <ProductCard product={item} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
