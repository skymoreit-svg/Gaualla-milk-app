import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { baseurl } from "../../allapi";

const RazorpayScreen = () => {
  const router = useRouter();
  const { defaultAddress, amountToPay, selectedFrequency, cartItems, cartid, selectedDates } = useLocalSearchParams();
  const { info } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const parsedCartItems = cartItems ? JSON.parse(cartItems) : [];
  const userName = info?.user?.name || "Customer";
  const userEmail = info?.user?.email || "";
  const userPhone = info?.user?.phone || "";

  useEffect(() => {
    fetchRazorpayKey();
    getAuthToken();
  }, []);

  const getAuthToken = async () => {
    const token = await SecureStore.getItemAsync("authToken");
    setAuthToken(token);
  };

  const fetchRazorpayKey = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.get(`${baseurl}/order/key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Razorpay key response:", res.data);
      if (res.data.success && res.data.key_id) {
        setRazorpayKey(res.data.key_id);
      }
    } catch (err) {
      console.error("Failed to fetch Razorpay key:", err);
      Alert.alert("Error", "Failed to load payment gateway");
    }
  };

  const handlePayment = async () => {
    if (!razorpayKey) {
      Alert.alert("Gateway Loading", "Payment gateway is initializing. Please wait.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${baseurl}/order/create`,
        { amount: parseFloat(amountToPay) },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!data.success || !data.order?.id) {
        Alert.alert("Order Failure", data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      // Generate HTML form for Razorpay Hosted Checkout
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f9fafb;
            }
            .container {
              text-align: center;
              padding: 24px;
              background: white;
              border-radius: 24px;
              box-shadow: 0 4px 20px rgba(62, 39, 35, 0.05);
              border: 1px solid #f5ede8;
              max-width: 320px;
            }
            .spinner {
              border: 3px solid #fdf6f3;
              border-top: 3px solid #3e2723;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px;
            }
            p {
              font-size: 14px;
              color: #6d4c41;
              margin: 0;
              font-weight: 500;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            form { display: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <p>Directing to secure payment window...</p>
          </div>

          <form id="paymentForm" method="POST" action="https://api.razorpay.com/v1/checkout/embedded">
            <input type="hidden" name="key_id" value="${razorpayKey}">
            <input type="hidden" name="order_id" value="${data.order.id}">
            <input type="hidden" name="name" value="Gaualla">
            <input type="hidden" name="description" value="Order Payment">
            <input type="hidden" name="customer_details[name]" value="${userName}">
            <input type="hidden" name="customer_details[email]" value="${userEmail}">
            <input type="hidden" name="customer_details[contact]" value="${userPhone}">
            <input type="hidden" name="amount" value="${Math.round(parseFloat(amountToPay) * 100)}">
            <input type="hidden" name="currency" value="INR">
            <input type="hidden" name="theme[color]" value="#3e2723">
            <input type="hidden" name="notes[address_id]" value="${defaultAddress}">
          </form>

          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script>
            window.onload = function() {
              const form = document.getElementById('paymentForm');
              const options = {
                key: '${razorpayKey}',
                order_id: '${data.order.id}',
                name: 'Gaualla',
                description: 'Order Payment',
                image: '',
                prefill: {
                  name: '${userName}',
                  email: '${userEmail}',
                  contact: '${userPhone}'
                },
                theme: {
                  color: '#3e2723'
                },
                modal: {
                  ondismiss: function() {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'PAYMENT_CANCELLED'
                    }));
                  }
                },
                handler: function(response) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_SUCCESS',
                    data: response
                  }));
                },
                retry: {
                  enabled: true,
                  max_count: 3
                }
              };

              const rzp = new Razorpay(options);
              rzp.open();

              rzp.on('payment.failed', function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_FAILED',
                  error: response.error
                }));
              });
            };
          </script>
        </body>
        </html>
      `;

      setPaymentHtml(html);
      setShowWebView(true);
    } catch (err) {
      console.error("Payment initialization error:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "PAYMENT_SUCCESS") {
        setShowWebView(false);
        setLoading(true);

        try {
          const verifyRes = await axios.post(
            `${baseurl}/order/verify`,
            {
              razorpay_order_id: message.data.razorpay_order_id,
              razorpay_payment_id: message.data.razorpay_payment_id,
              razorpay_signature: message.data.razorpay_signature,
              address_id: parseInt(defaultAddress),
              total_amount: amountToPay,
              type: selectedFrequency,
              custom_delivery_dates: selectedDates ? JSON.parse(selectedDates) : null,
              cart_items: parsedCartItems,
            },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          if (verifyRes.data.success) {
            try {
              if (cartid && cartid !== "all") {
                await axios.delete(`${baseurl}/cart/deletecart/${cartid}`, {
                  headers: { Authorization: `Bearer ${authToken}` },
                });
              } else {
                await axios.delete(`${baseurl}/cart/clearall`, {
                  headers: { Authorization: `Bearer ${authToken}` },
                });
              }
            } catch (clearErr) {
              console.error("Cart clear error (non-critical):", clearErr);
            }

            setPaymentDone(true);
            Alert.alert("Success", "Payment verified. Your order has been placed successfully!", [
              {
                text: "View Orders",
                onPress: () => router.replace("/(tab)/order"),
              },
              {
                text: "Go Home",
                onPress: () => router.replace("/(tab)"),
              },
            ]);
          } else {
            Alert.alert("Verification Failed", "Payment verification could not be completed. Please contact support.");
          }
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
          Alert.alert("Error", "Failed to verify payment details.");
        } finally {
          setLoading(false);
        }
      } else if (message.type === "PAYMENT_CANCELLED") {
        setShowWebView(false);
        Alert.alert("Payment Cancelled", "Transaction was aborted by the user.");
      } else if (message.type === "PAYMENT_FAILED") {
        setShowWebView(false);
        const errorMsg = message.error?.description || "Transaction failed. Please try again.";
        Alert.alert("Payment Failed", errorMsg);
      }
    } catch (err) {
      console.error("WebView message error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {showWebView && paymentHtml ? (
        <>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => setShowWebView(false)}
              style={styles.backBtn}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#3e2723" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Complete Payment</Text>
            <View style={{ width: 40 }} />
          </View>
          <WebView
            source={{ html: paymentHtml }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#3e2723" />
                <Text style={styles.webViewLoadingText}>Launching payment gate...</Text>
              </View>
            )}
            style={{ flex: 1 }}
          />
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
              <ArrowLeft size={20} color="#3e2723" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}>
            {/* Order Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <CreditCard size={18} color="#6d4c41" />
                <Text style={styles.summaryTitle}>Payment Summary</Text>
              </View>

              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <Text style={styles.rowLabel}>Total Order Items</Text>
                  <Text style={styles.rowValue}>{parsedCartItems.length} item(s)</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.rowLabel}>Delivery Mode</Text>
                  <Text style={styles.rowValue}>
                    {selectedFrequency === "one_time" ? "One Time" : selectedFrequency === "daily" ? "30 Days" : "Alternative Days"}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Payable</Text>
                  <Text style={styles.totalValue}>₹{parseFloat(amountToPay).toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* Security Notice Card */}
            <View style={styles.securityCard}>
              <View style={styles.securityHeader}>
                <ShieldCheck size={18} color="#16a34a" />
                <Text style={styles.securityTitle}>Secure Gateway Verification</Text>
              </View>
              <Text style={styles.securityDesc}>
                Your payment is handled under fully encrypted layers. We support major card brands, netbanking options, wallets, and UPI payments.
              </Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              onPress={handlePayment}
              disabled={loading || !razorpayKey || paymentDone}
              style={[
                styles.payBtn,
                paymentDone ? styles.successPayBtn : loading || !razorpayKey ? styles.disabledPayBtn : null
              ]}
              activeOpacity={0.9}
            >
              {paymentDone ? (
                <Text style={styles.payBtnText}>ORDER PLACED SUCCESSFULLY ✓</Text>
              ) : loading ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.payBtnText, { marginLeft: 10 }]}>PROCESSING...</Text>
                </View>
              ) : (
                <Text style={styles.payBtnText}>
                  {razorpayKey ? `PAY ₹${parseFloat(amountToPay).toFixed(2)}` : "PREPARING GATEWAY..."}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFC8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f5ede8',
    elevation: 2,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f5ede8',
  },
  webViewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  webViewLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  webViewLoadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#6d4c41',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f5ede8',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
    paddingBottom: 12,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  summaryBody: {
    paddingTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  rowValue: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5ede8',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3e2723',
  },
  securityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f5ede8',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803d',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  securityDesc: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
  payBtn: {
    backgroundColor: '#3e2723',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  successPayBtn: {
    backgroundColor: '#15803d',
  },
  disabledPayBtn: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  payBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default RazorpayScreen;
