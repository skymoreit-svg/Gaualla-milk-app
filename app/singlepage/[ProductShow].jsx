import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { baseurl, imgurl } from "../../allapi";
import ProductCard from "../Components/ProductCard";

const { width } = Dimensions.get("window");

export default function ProductShow() {
  const { ProductShow } = useLocalSearchParams();
  const router = useRouter();
  const [allproduct2, setAllproduct2] = useState([]);
  const [allProduct, setAllProduct] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product data
  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${baseurl}/getproduct/product/${ProductShow}`
      );
      const data = response.data;
      if (data.success) {
        setAllProduct(data.product);
      }
    } catch (err) {
      console.log("Error fetching product:", err);
    }
  };

  const handelcatagypress = async (category = "all") => {
    try {
      const response = await axios.get(`${baseurl}/getproduct/${category}`);
      const data = response.data;
      if (data.success) {
        setAllproduct2(data.product);
      }
    } catch (err) {
      console.log("Product fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProduct();
    handelcatagypress()
  }, []);

  if (!allProduct) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Images array
  let allimg = [];
  try {
    allimg = allProduct?.images ? JSON.parse(allProduct.images) : [];
  } catch {
    allimg = [];
  }

  // Prices & discount
  const oldPrice = parseFloat(allProduct.old_price);
  const newPrice = parseFloat(allProduct.price);
  const discount =
    oldPrice > newPrice
      ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      : 0;

 const desText = allProduct?.description
  ?.replace(/<[^>]+>/g, "")   // remove HTML tags
  ?.replace(/\s+/g, " ")      // replace multiple spaces with a single space
  ?.trim(); 

  // Share handler
  const handleShare = async () => {
    try {
      await Share.share({
        title: allProduct.name,
        message: `${allProduct.name}\n\nPrice: ₹${newPrice}\n\nCheck it out here: https://yourapp.com/product/${allProduct.slug}`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handelAddtoCart = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      Toast.show({ type: 'info', text1: 'Please login', text2: 'Login to add items to cart', position: 'top', visibilityTime: 2000 });
      router.push('/singlepage/login');
      return;
    }
    const response = await axios.post(`${baseurl}/cart/addtocart`, { product_id: allProduct?.id, price: newPrice }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.data;
    if (data.success) {
      Toast.show({
        type: 'success',
        text1: 'Cart Updated!',
        text2: data.message,
        position: 'top',
        visibilityTime: 2000,
      })
      router.push("/(tab)/cart")
    }
    else {
      Toast.show({
        type: 'error',
        text1: 'ERROR!',
        text2: data.message,
        position: 'top',
        visibilityTime: 2000,
      })
    }
  }

  // Feature icons and details
  const features = [
    { icon: <MaterialIcons name="local-shipping" size={20} color="#16a34a" />, text: "Free Delivery" },
    { icon: <MaterialCommunityIcons name="recycle" size={20} color="#16a34a" />, text: "100% Natural" },
    { icon: <FontAwesome name="leaf" size={20} color="#16a34a" />, text: "Organic" },
    { icon: <MaterialIcons name="verified" size={20} color="#16a34a" />, text: "Quality Assured" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Product Details
        </Text>
        <View className="flex-row space-x-3">
          {/* <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            <AntDesign
              name={isFavorite ? "heart" : "hearto"}
              size={24}
              color={isFavorite ? "#ef4444" : "#111827"}
            />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Carousel */}
      <Animated.View entering={FadeIn.duration(800)}>
        <Carousel
          width={width}
          height={320}
          autoPlay
          loop
          data={allimg}
          scrollAnimationDuration={1200}
          renderItem={({ item }) => (
            <Image
              source={{ uri: `${imgurl}/${item}` }}
              className="w-full h-[320px] rounded-b-2xl"
              resizeMode="center"
            />
          )}
        />
      </Animated.View>

      {/* Product Info */}
      <ScrollView
        className="px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Title and Price */}
        <View className="justify-between flex-row mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {allProduct.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
              <Text className="text-sm text-gray-600 ml-1">4.8 (120 reviews)</Text>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-baseline">
              <Text className="text-3xl font-extrabold text-green-600">
                ₹{newPrice}
              </Text>
              <Text className="text-sm text-gray-500 ml-2">
                /{allProduct.unit_quantity}
              </Text>
            </View>
            {oldPrice > newPrice && (
              <View className="flex-row items-center">
                <Text className="text-base text-gray-400 line-through">
                  ₹{oldPrice}
                </Text>
                <View className="bg-red-100 px-2 py-1 rounded-md ml-2">
                  <Text className="text-red-600 font-semibold text-xs">
                    {discount}% OFF
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Features */}
        <View className="flex-row justify-between mb-6 bg-white p-4 rounded-xl shadow-sm">
          {features.map((feature, index) => (
            <View key={index} className="items-center">
              {feature.icon}
              <Text className="text-xs text-gray-600 mt-1 text-center" style={{ maxWidth: 60 }}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Stock Status */}
        <View className="flex-row items-center mb-6">
        
          <Text className={`ml-2 text-green-600`}>
           In Stock
          </Text>
        </View>

        {/* Description */}
        <View className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="description" size={20} color="#4b5563" />
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Description
            </Text>
          </View>
          <Text className="text-gray-600 text-justify leading-6">
            {desText}
          </Text>
        </View>

        {/* Key Benefits */}
        <View className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#4b5563" />
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Key Benefits
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2 flex-1">Boosts immunity and strengthens overall health</Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2 flex-1">Improves digestion and gut health</Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2 flex-1">Supports brain development and memory power</Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2 flex-1">Enhances energy and stamina</Text>
            </View>
            <View className="flex-row items-start">
              <MaterialIcons name="check-circle" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2 flex-1">Promotes healthy skin and glowing complexion</Text>
            </View>
          </View>
        </View>

        {/* Payment & Purity Assurance */}
        <View className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="security" size={20} color="#4b5563" />
            <Text className="text-xl font-bold text-gray-900 ml-2">
              Quality & Payment Assurance
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="credit-card-check" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2">Secure Payment</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="assignment-return" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2">Easy Returns</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="certificate" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2">100% Authentic</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={18} color="#16a34a" />
              <Text className="text-gray-600 ml-2">Quality Guaranteed</Text>
            </View>
          </View>
        </View>

        {/* Related Products */}
        <View className='mt-6'>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Related Products</Text>
            <TouchableOpacity onPress={() => router.push("/(tab)/category")}>
              <Text className="text-green-600">See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {allproduct2?.map((item, index) => (
              <ProductCard product={item} key={index} wid="w-44" />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-lg">
        <TouchableOpacity 
          onPress={handelAddtoCart} 
         
          className={`py-4 rounded-full flex-row justify-center items-center  bg-green-600`}
        >
          <AntDesign name="shopping-cart" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-3">
          Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}