import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { baseurl } from "../../allapi";
import RazorpayCheckout from "react-native-razorpay";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react-native";

const RazorpayScreen = () => {
  const router = useRouter();
  const { defaultAddress, amountToPay, selectedFrequency, cartItems } = useLocalSearchParams();
  const { info } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const parsedCartItems = cartItems ? JSON.parse(cartItems) : [];
  const userName = info?.user?.name || "Customer";
  const userEmail = info?.user?.email || "";
  const userPhone = info?.user?.phone || "";

  useEffect(() => {
    fetchRazorpayKey();
  }, []);

  const fetchRazorpayKey = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.get(`${baseurl}/order/key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && res.data.key_id) {
        setRazorpayKey(res.data.key_id);
      }
    } catch (err) {
      console.error("Failed to fetch Razorpay key:", err);
    }
  };

  const handlePayment = async () => {
    if (!razorpayKey) {
      Alert.alert("Error", "Payment gateway not ready. Please wait and try again.");
      return;
    }

    setLoading(true);
    const token = await SecureStore.getItemAsync("authToken");

    try {
      const { data } = await axios.post(
        `${baseurl}/order/create`,
        { amount: parseFloat(amountToPay) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success || !data.order?.id) {
        Alert.alert("Error", data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        currency: "INR",
        name: "Gaualla",
        description: "Order Payment",
        order_id: data.order.id,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        notes: {
          address_id: String(defaultAddress),
        },
        theme: { color: "#942e29" },
        retry: { enabled: true, max_count: 3 },
      };

      const paymentData = await RazorpayCheckout.open(options);

      const verifyRes = await axios.post(
        `${baseurl}/order/verify`,
        {
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          address_id: parseInt(defaultAddress),
          total_amount: amountToPay,
          type: selectedFrequency,
          cart_items: parsedCartItems,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (verifyRes.data.success) {
        try {
          await axios.delete(`${baseurl}/cart/clearall`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (clearErr) {
          console.error("Cart clear error (non-critical):", clearErr);
        }

        setPaymentDone(true);
        Alert.alert("Payment Successful", "Your order has been placed successfully!", [
          {
            text: "View Orders",
            onPress: () => router.replace("/singlepage/orders"),
          },
          {
            text: "Go Home",
            onPress: () => router.replace("/(tab)"),
          },
        ]);
      } else {
        if (verifyRes.data.order_id) {
          Alert.alert(
            "Payment Received",
            "Payment verification is processing. Please check your orders.",
            [{ text: "View Orders", onPress: () => router.replace("/singlepage/orders") }]
          );
        } else {
          Alert.alert("Error", "Payment verification failed. Contact support.");
        }
      }
    } catch (err) {
      if (err?.error?.code === "PAYMENT_CANCELLED" || err?.code === 0) {
        Alert.alert("Cancelled", "Payment was cancelled.");
      } else if (err?.error?.description) {
        Alert.alert("Payment Failed", err.error.description);
      } else {
        console.error("Payment error:", err);
        Alert.alert("Error", err.message || "Something went wrong during payment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Secure Payment</Text>
      </View>

      <View className="flex-1 px-5 pt-6">
        <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-5">
          <View className="flex-row items-center mb-4">
            <CreditCard size={22} color="#942e29" />
            <Text className="ml-3 text-lg font-semibold text-gray-900">Order Summary</Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Items</Text>
              <Text className="text-gray-900 font-medium">{parsedCartItems.length} item(s)</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Frequency</Text>
              <Text className="text-gray-900 font-medium capitalize">
                {selectedFrequency === "one_time" ? "One Time" : selectedFrequency === "daily" ? "30 Days" : "Alternative Days"}
              </Text>
            </View>
            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-green-700">₹{parseFloat(amountToPay).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 border border-gray-200 mb-5">
          <View className="flex-row items-center mb-3">
            <ShieldCheck size={20} color="#16a34a" />
            <Text className="ml-2 text-green-700 font-medium">Secure Payment via Razorpay</Text>
          </View>
          <Text className="text-gray-500 text-sm">
            Your payment is secured with 256-bit encryption. We support UPI, Cards, Net Banking, and Wallets.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading || !razorpayKey || paymentDone}
          className={`py-4 rounded-xl items-center ${paymentDone ? "bg-green-700" : loading || !razorpayKey ? "bg-gray-400" : "bg-green-600"}`}
          activeOpacity={0.8}
        >
          {paymentDone ? (
            <Text className="text-white font-semibold text-lg">Order Placed Successfully ✓</Text>
          ) : loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-semibold text-lg ml-3">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              {razorpayKey ? `Pay ₹${parseFloat(amountToPay).toFixed(2)}` : "Loading..."}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RazorpayScreen;
