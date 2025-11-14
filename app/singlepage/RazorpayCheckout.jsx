import { View, Text, Button, Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
// import * as Razorpay from "expo-razorpay";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { baseurl } from "../Components/allapi";
import RazorpayCheckout  from "react-native-razorpay";


const RazorpayScreen = () => {
  const router = useRouter();
  const { defaultAddress, product_id, quantity, price, amountToPay } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    setLoading(true);
    const token = await SecureStore.getItemAsync('authToken');

    // console.log({token,defaultAddress, product_id, quantity, price, amountToPay})
    try {
    //   // 1️⃣ Create order on backend
      const { data } = await axios.post(`${baseurl}/order/create`, {
        amount: amountToPay,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

   

      if (!data.success) {
        Alert.alert("Error", "Failed to create Razorpay order");
        setLoading(false);
        return;
      }

    //   // 2️⃣ Setup Razorpay options
      const options = {
        description: "Order Payment",
        image: "https://i.imgur.com/3g7nmJC.jpg",
        currency: "INR",
        key: "rzp_test_RAm3ngY6JIbOzo", // replace with your Razorpay Key
        amount: (parseFloat(amountToPay) * 100).toString(), // paise as string
        name: "Milk App",
        order_id: data.order.id, // from backend
        prefill: {
          email: "test@example.com",
          contact: "9999999999",
          name: "Jon",
        },
        theme: { color: "#3399cc" },
      };






    //   // 3️⃣ Open Razorpay checkout
      const paymentData = await RazorpayCheckout.open(options);
      // console.log(paymentData)

      // await Razorpay.open(options)
      
    //   // 4️⃣ Verify payment on success
      // if (paymentData) {
      //   const verifyRes = await axios.post(`${baseurl}/order/verify`, {
      //     razorpay_order_id: paymentData.razorpay_order_id,
      //     razorpay_payment_id: paymentData.razorpay_payment_id,
      //     razorpay_signature: paymentData.razorpay_signature,
      //     address_id: defaultAddress,
      //     total_amount: amountToPay,
      //     cart_items: [
      //       {
      //         product_id,
      //         quantity,
      //         price,
      //       },
      //     ],
      //   }, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });

      //   if (verifyRes.data.success) {
      //     Alert.alert("Success", "Payment Successful!");
      //     router.push("/");
      //   } else {
      //     Alert.alert("Error", "Payment verification failed!");
      //   }
      // }
    } catch (err) {
      // Handle different error types
      if (err.code === 'PAYMENT_CANCELLED') {
        Alert.alert("Cancelled", "Payment was cancelled by user");
      } else if (err.code === 'NETWORK_ERROR') {
        Alert.alert("Network Error", "Please check your internet connection");
      } else {
        console.error("Payment error:", err);
        Alert.alert("Error", err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Payment</Text>
      <Text style={styles.amount}>Amount to Pay: ₹{amountToPay}</Text>
      
      <Button 
        title={loading ? "Processing..." : `Pay ₹${amountToPay}`} 
        onPress={handlePlaceOrder} 
        disabled={loading} 
        color="#3399cc"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  amount: {
    fontSize: 18,
    marginBottom: 30,
    color: "#333",
  },
});

export default RazorpayScreen;