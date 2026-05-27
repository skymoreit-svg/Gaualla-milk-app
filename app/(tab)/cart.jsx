import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { baseurl, imgurl } from "../../allapi";

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
          text1: "Item Removed",
          text2: res.data.message,
        });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to remove item" });
    }
  };

  const totalAmount = (cartData || []).reduce(
    (acc, item) => acc + (parseFloat(item.total_price) || 0),
    0
  );
  const totalItems = (cartData || []).reduce(
    (acc, item) => acc + (parseInt(item.quantity) || 0),
    0
  );

  const renderItem = ({ item, index }) => {
    let images = [];
    try {
      images = JSON.parse(item.images);
    } catch (e) { }

    const isLast = index === cartData.length - 1;

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          marginBottom: 14,
          overflow: "hidden",
          shadowColor: "#3e2723",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          borderWidth: 1,
          borderColor: "#f5ede8",
        }}
      >
        {/* Product Info Row */}
        <View style={{ flexDirection: "row", padding: 14, alignItems: "center" }}>
          {/* Product Image */}
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 16,
              backgroundColor: "#fdf6f3",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#f0e0d8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {images[0] ? (
              <Image
                source={{ uri: `${imgurl}/${images[0]}` }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: 32 }}>🥛</Text>
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{ fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 2 }}
              numberOfLines={2}
            >
              {item.name} {item.variant_name ? `(${item.variant_name})` : ""}
            </Text>
            <Text style={{ fontSize: 13, color: "#9ca3af", marginBottom: 8 }}>
              ₹{item.cart_price || item.product_price} per unit
            </Text>

            {/* Quantity Controls */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() =>
                  item.quantity <= 1
                    ? handleRemove(item.cart_id)
                    : updateQuantity(item.cart_id, false)
                }
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: item.quantity <= 1 ? "#fee2e2" : "#f3f4f6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <AntDesign
                  name={item.quantity <= 1 ? "delete" : "minus"}
                  size={15}
                  color={item.quantity <= 1 ? "#ef4444" : "#374151"}
                />
              </TouchableOpacity>

              <View
                style={{
                  minWidth: 36,
                  height: 34,
                  backgroundColor: "#fdf6f3",
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 8,
                  paddingHorizontal: 8,
                  borderWidth: 1,
                  borderColor: "#f0e0d8",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#3e2723" }}>
                  {item.quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => updateQuantity(item.cart_id, true)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#3e2723",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <AntDesign name="plus" size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: "#fdf8f6",
            borderTopWidth: 1,
            borderTopColor: "#f5ede8",
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 1 }}>Subtotal</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#3e2723" }}>
              ₹{item.total_price}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleRemove(item.cart_id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fee2e2",
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 12,
                gap: 4,
              }}
              activeOpacity={0.85}
            >
              <Feather name="trash-2" size={13} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/singlepage/Checkout", params: { cartid: item.cart_id } })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#3e2723",
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 12,
                gap: 4,
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={13} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── Not logged in ──────────────────────────────────────────────
  if (!isUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#fdf6f3", alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: "#f0e0d8" }}>
          <AntDesign name="lock" size={44} color="#6d4c41" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8, textAlign: "center" }}>
          Sign In to View Cart
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 28 }}>
          Please login to see your saved items and place orders.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/singlepage/login")}
          style={{ backgroundColor: "#3e2723", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}
          activeOpacity={0.9}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Login Now</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8" }} edges={["top", "left", "right"]}>
      <FlatList
        data={cartData}
        keyExtractor={(item) => item.cart_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            {/* Page Title */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: "900", color: "#1f2937", letterSpacing: -0.5 }}>
                My Cart
              </Text>
              {cartData.length > 0 && (
                <View style={{ marginLeft: 10, backgroundColor: "#3e2723", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{totalItems}</Text>
                </View>
              )}
            </View>
            {cartData.length > 0 && (
              <Text style={{ fontSize: 13, color: "#9ca3af" }}>
                {cartData.length} {cartData.length === 1 ? "item" : "items"} in your cart
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#fdf6f3",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#f0e0d8",
              }}
            >
              <AntDesign name="shoppingcart" size={52} color="#d4a99a" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8 }}>
              Your cart is empty
            </Text>
            <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 32 }}>
              Looks like you haven't added any{"\n"}farm-fresh products yet!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/")}
              style={{
                backgroundColor: "#3e2723",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
              activeOpacity={0.9}
            >
              <Ionicons name="storefront-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />


    </SafeAreaView>
  );
}
