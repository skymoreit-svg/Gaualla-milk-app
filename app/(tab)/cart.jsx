import React, { useCallback, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { baseurl, imgurl } from "../Components/allapi";
import axios from "axios";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AntDesign } from "@expo/vector-icons";

export default function Cart() {
  const router = useRouter();
  const { isUser } = useSelector((state) => state.user);
  const [cartData, setCartData] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isUser) return;
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.get(`${baseurl}/cart/cartallcart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartData(res.data.success ? res.data.carts : []);
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  }, [isUser]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const updateQuantity = async (id, increment) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.put(
        `${baseurl}/cart/updatecart/${id}`,
        { increment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchCart();
        Toast.show({
          type: "success",
          text1: "Cart Updated",
          text2: increment ? "Quantity increased" : "Quantity decreased",
        });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to update quantity" });
    }
  };

  const handleRemove = async (id) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.delete(`${baseurl}/cart/deletecart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        fetchCart();
        Toast.show({
          type: "success",
          text1: "Removed",
          text2: res.data.message,
        });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to remove item" });
    }
  };

  const totalAmount = cartData.reduce((acc, item) => acc + item.total_price, 0);

  const renderItem = ({ item }) => {
    const images = JSON.parse(item.images);
    return (
      <View className="bg-white rounded-3xl shadow-lg mb-4 overflow-hidden">
        {/* Product Info */}
        <View className="flex-row p-4 items-center">
          <Image
            source={{ uri: `${imgurl}/${images[0]}` }}
            className="w-24 h-24 rounded-2xl"
          />
          <View className="flex-1 ml-4 justify-between">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-gray-600 text-sm">₹{item.product_price}</Text>

            {/* Quantity Controls */}
            <View className="flex-row items-center mt-3">
              <TouchableOpacity
                onPress={() => updateQuantity(item.cart_id, false)}
                className="bg-gray-200 w-9 h-9 rounded-full items-center justify-center mr-3"
              >
                <AntDesign name="minus" size={20} color="#374151" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-800">{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.cart_id, true)}
                className="bg-gray-200 w-9 h-9 rounded-full items-center justify-center ml-3"
              >
                <AntDesign name="plus" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="border-t border-gray-200 flex-row justify-between items-center px-4 py-3 bg-gray-50">
          <Text className="text-green-700 font-bold text-lg">₹{item.total_price}</Text>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => handleRemove(item.cart_id)}
              className="bg-red-500 px-4 py-2 rounded-xl mr-2"
            >
              <Text className="text-white font-medium">Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({pathname:"/singlepage/Checkout",params:{cartid:item.cart_id}})}
              className="bg-blue-600 px-5 py-2 rounded-xl"
            >
              <Text className="text-white font-medium">Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isUser ? (<View className="flex-1 ">
        <FlatList
          data={cartData}
          keyExtractor={(item) => item.cart_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          ListHeaderComponent={
            <Text className="text-2xl font-bold text-gray-800 text-center my-4">
              🛒 My Cart
            </Text>
          }
          
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <AntDesign name="shopping-cart" size={100} color="#d1d5db" />
              <Text className="text-gray-600 text-lg mt-4">Your cart is empty 🛍️</Text>
              <TouchableOpacity 
                onPress={() => router.push("/")}
                className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white text-base font-semibold">Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />





</View>

      ) : (
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            onPress={() => router.push("/singlepage/login")}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white text-lg font-semibold">Go to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
