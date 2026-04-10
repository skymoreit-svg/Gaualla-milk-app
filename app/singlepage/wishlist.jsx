import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Toast from "react-native-toast-message";
import { ArrowLeft, Heart, Trash2, ShoppingCart } from "lucide-react-native";
import { baseurl, imgurl } from "../../allapi";

export default function Wishlist() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const handleGoBack = () => {
    const canGoBack = router.canGoBack();
    console.log("[BackButton] wishlist pressed", { canGoBack });
    if (router.canGoBack()) {
      console.log("[BackButton] wishlist -> router.back()");
      router.back();
      return;
    }
    console.log("[BackButton] wishlist -> fallback /(tab)/profile");
    router.replace("/(tab)/profile");
  };

  const fetchWishlist = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${baseurl}/wishlist/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setItems(res.data.wishlist);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.delete(`${baseurl}/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      Toast.show({
        type: "success",
        text1: "Removed",
        text2: "Item removed from wishlist",
        position: "top",
        visibilityTime: 1500,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId, price) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.post(
        `${baseurl}/cart/addtocart`,
        { product_id: productId, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "Cart Updated!",
          text2: res.data.message,
          position: "top",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res.data.message,
          position: "top",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  const getFirstImage = (images) => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return parsed && parsed.length > 0 ? `${imgurl}/${parsed[0]}` : null;
    } catch {
      return null;
    }
  };

  const renderItem = ({ item }) => {
    const imageUri = getFirstImage(item.images);
    const isRemoving = removingId === item.product_id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/singlepage/${item.slug}`)}
        className="bg-white mx-4 mb-3 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      >
        <View className="flex-row">
          {/* Product Image */}
          <View className="w-28 h-28 bg-gray-100">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Heart size={32} color="#d1d5db" />
              </View>
            )}
          </View>

          {/* Product Details */}
          <View className="flex-1 p-3 justify-between">
            <View>
              <Text
                className="text-base font-semibold text-gray-800"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              {item.unit_quantity ? (
                <Text className="text-xs text-gray-500 mt-1">
                  {item.unit_quantity}
                </Text>
              ) : null}
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-900">
                  ₹{item.price}
                </Text>
                {item.old_price ? (
                  <Text className="text-xs text-gray-400 line-through ml-2">
                    ₹{item.old_price}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="justify-center items-center px-3 space-y-3">
            <TouchableOpacity
              onPress={() => handleAddToCart(item.product_id, item.price)}
              className="bg-green-50 p-2.5 rounded-xl"
            >
              <ShoppingCart size={18} color="#16a34a" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRemove(item.product_id)}
              disabled={isRemoving}
              className="bg-red-50 p-2.5 rounded-xl mt-2"
            >
              {isRemoving ? (
                <ActivityIndicator size={18} color="#ef4444" />
              ) : (
                <Trash2 size={18} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white flex-row items-center px-4 py-4 shadow-sm">
        <TouchableOpacity
          onPress={handleGoBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="p-2 rounded-lg bg-gray-100"
        >
          <ArrowLeft pointerEvents="none" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 ml-4">
          My Wishlist
        </Text>
        {items.length > 0 && (
          <View className="ml-2 bg-red-100 px-2.5 py-0.5 rounded-full">
            <Text className="text-red-600 text-xs font-bold">
              {items.length}
            </Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Heart size={64} color="#d1d5db" />
          <Text className="text-xl font-bold text-gray-700 mt-4">
            Your wishlist is empty
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Items you add to your wishlist will appear here.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tab)")}
            className="mt-6 bg-green-600 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-base">
              Browse Products
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.wishlist_id)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
