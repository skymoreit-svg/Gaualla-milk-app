import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, CheckCircle, Clock, Gift, Plus, Wallet } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { baseurl } from "../../allapi";

const topUpOffers = [
  { id: 5, amount: 100, bonus: 0, label: "₹100" },
  { id: 6, amount: 300, bonus: 0, label: "₹300" },
  { id: 1, amount: 500, bonus: 0, label: "₹500" },
  { id: 2, amount: 1000, bonus: 100, label: "₹1,000 (+₹100 Bonus)" },
  { id: 3, amount: 2000, bonus: 300, label: "₹2,000 (+₹300 Bonus)" },
  { id: 4, amount: 5000, bonus: 1000, label: "₹5,000 (+₹1000 Bonus)" },
];

export default function WalletPage() {
  const router = useRouter();
  const { info } = useSelector((state) => state.user);
  const userName = info?.user?.name || "Customer";
  const userEmail = info?.user?.email || "";
  const userPhone = info?.user?.phone || "";

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState("1000");
  const [selectedOffer, setSelectedOffer] = useState(2); // Default to ₹1000
  const [transactions, setTransactions] = useState([]);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState(null);

  const fetchWalletData = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return;

      const response = await axios.get(`${baseurl}/wallet/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success && response.data.wallet) {
        const wallet = response.data.wallet;
        const total = wallet.total_balance ??
          (parseFloat(wallet.main_balance || 0) + parseFloat(wallet.cashback_balance || 0));
        setBalance(total);
        setCashbackBalance(parseFloat(wallet.cashback_balance || 0));
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) return;

      const response = await axios.get(`${baseurl}/wallet/transactions?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchRazorpayKey = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) return;
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

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    fetchRazorpayKey();
  }, []);

  const handleSelectOffer = (offer) => {
    setSelectedOffer(offer.id);
    setCustomAmount(offer.amount.toString());
  };

  const handleAddMoney = async () => {
    const amountNum = parseFloat(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid top-up amount.");
      return;
    }

    setLoading(true);

    let currentKey = razorpayKey;
    let errorDetail = "";
    if (!currentKey) {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
          errorDetail = "No authorization token found. Please log in again.";
        } else {
          const res = await axios.get(`${baseurl}/order/key`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success && res.data.key_id) {
            currentKey = res.data.key_id;
            setRazorpayKey(currentKey);
          } else {
            errorDetail = res.data.message || "Failed to retrieve key_id from API.";
          }
        }
      } catch (err) {
        console.error("Failed to fetch Razorpay key on demand:", err);
        errorDetail = err.message || "Network request failed";
        if (err.response?.data?.message) {
          errorDetail += ` - ${err.response.data.message}`;
        }
      }
    }

    if (!currentKey) {
      Alert.alert("Error", `Payment gateway could not be loaded: ${errorDetail}`);
      setLoading(false);
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('authToken');

      const { data } = await axios.post(
        `${baseurl}/wallet/topup/create`,
        { amount: amountNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success || !data.razorpay_order?.id) {
        Alert.alert("Error", data.message || "Failed to create top-up order");
        setLoading(false);
        return;
      }

      const orderId = data.razorpay_order.id;

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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <p>Directing to secure payment window...</p>
          </div>

          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script>
            window.onload = function() {
              const options = {
                key: '${currentKey}',
                order_id: '${orderId}',
                name: 'Gaualla Wallet Top-up',
                description: 'Wallet Funding',
                amount: ${Math.round(amountNum * 100)},
                currency: 'INR',
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

    } catch (error) {
      console.error("Top-up initialization error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to initialize top-up payment.");
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
          const token = await SecureStore.getItemAsync('authToken');
          const verifyRes = await axios.post(
            `${baseurl}/wallet/topup/verify`,
            {
              razorpay_order_id: message.data.razorpay_order_id,
              razorpay_payment_id: message.data.razorpay_payment_id,
              razorpay_signature: message.data.razorpay_signature,
              amount: parseFloat(customAmount)
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.success) {
            Toast.show({
              type: "success",
              text1: "Top-up Successful! 🎉",
              text2: `Wallet successfully funded.`,
              position: "top",
              visibilityTime: 2500,
            });
            fetchWalletData();
            fetchTransactions();
          } else {
            Alert.alert("Verification Failed", verifyRes.data.message || "Failed to verify top-up payment.");
          }
        } catch (verifyErr) {
          console.error("Top-up verification error:", verifyErr);
          Alert.alert("Error", "Failed to verify top-up details.");
        } finally {
          setLoading(false);
        }
      } else if (message.type === "PAYMENT_CANCELLED") {
        setShowWebView(false);
        Alert.alert("Top-up Cancelled", "Transaction was aborted.");
      } else if (message.type === "PAYMENT_FAILED") {
        setShowWebView(false);
        const errorMsg = message.error?.description || "Transaction failed. Please try again.";
        Alert.alert("Top-up Failed", errorMsg);
      }
    } catch (err) {
      console.error("WebView message error:", err);
    }
  };

  const formatTxDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (showWebView && paymentHtml) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8' }}>
          <TouchableOpacity
            onPress={() => setShowWebView(false)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginRight: 12 }}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#3e2723" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1f2937' }}>Complete Top-up</Text>
        </View>
        <WebView
          source={{ html: paymentHtml }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
              <ActivityIndicator size="large" color="#3e2723" />
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

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
        <Text className="text-xl font-bold text-gray-900 ml-4">Gaualla VIP Wallet</Text>
        <View className="ml-auto bg-amber-100 py-1 px-3 rounded-full border border-amber-200 flex-row items-center space-x-1">
          <Gift size={14} color="#d97706" />
          <Text className="text-amber-800 text-xs font-extrabold uppercase ml-1">VIP Active</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Wallet Balance Card */}
        <View className="m-4 bg-[#3e2723] rounded-3xl p-6 shadow-lg border border-[#5d4037] relative overflow-hidden">
          <View className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#6d4c41] opacity-30" />
          <View className="absolute right-20 -top-10 w-24 h-24 rounded-full bg-[#8d6e63] opacity-20" />

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-2">
              <View className="bg-amber-400/20 p-2 rounded-full border border-amber-400/30 mr-2">
                <Wallet size={24} color="#fbbf24" />
              </View>
              <Text className="text-gray-300 font-medium text-sm">Available Balance</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Wallet Info", "Gaualla Wallet balance can be used for all daily subscriptions and instant orders.")}>
              <Text className="text-amber-400 font-bold text-xs uppercase tracking-wider">How it works</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-4xl font-oswald-bold text-white tracking-wide mb-1">
            ₹{balance.toFixed(2)}
          </Text>
          {cashbackBalance > 0 && (
            <Text className="text-xs text-amber-300 font-semibold mb-3">
              (Includes ₹{cashbackBalance.toFixed(2)} Cashback Bonus)
            </Text>
          )}
          <Text className="text-xs text-gray-300 mb-6 max-w-[240px] leading-relaxed">
            Auto-deducts daily for morning milk delivery. Zero payment failures!
          </Text>

          <View className="flex-row items-center justify-between pt-4 border-t border-[#5d4037]/60">
            <Text className="text-amber-400/90 text-xs font-semibold">✨ Instant Refunds & 100% Secure</Text>
          </View>
        </View>

        {/* Top-up Section */}
        <View className="bg-white m-4 rounded-3xl p-6 border border-gray-100 shadow-sm">
          <Text className="text-lg font-oswald-bold text-gray-800 tracking-wide uppercase mb-2">
            Add Money to Wallet
          </Text>
          <Text className="text-xs text-gray-500 mb-5 leading-relaxed">
            Choose an exclusive top-up pack below to claim extra cash bonus.
          </Text>

          {/* Offer Pills */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
            {topUpOffers.map((offer) => {
              const isSelected = selectedOffer === offer.id;
              return (
                <TouchableOpacity
                  key={offer.id}
                  onPress={() => handleSelectOffer(offer)}
                  style={{
                    width: '48%',
                    paddingVertical: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    marginBottom: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? '#fdf8f6' : '#f9fafb',
                    borderColor: isSelected ? '#d97706' : '#e5e7eb',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? '#78350f' : '#1f2937' }}>
                    ₹{offer.amount}
                  </Text>
                  {offer.bonus > 0 ? (
                    <View style={{ marginTop: 4, backgroundColor: '#f59e0b', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 9999 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>
                        +₹{offer.bonus} Bonus
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase' }}>Regular Pack</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Amount Input */}
          <Text className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Enter Custom Amount</Text>
          <View className="flex-row items-center bg-appBackground rounded-2xl px-4 py-3 border border-gray-200 mb-6">
            <Text className="text-xl font-bold text-gray-800 mr-2">₹</Text>
            <TextInput
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedOffer(null);
              }}
              keyboardType="numeric"
              placeholder="Enter amount"
              className="flex-1 text-lg font-semibold text-gray-800"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Add Money Button */}
          <TouchableOpacity
            onPress={handleAddMoney}
            disabled={loading}
            className="bg-primary-600 py-4 rounded-2xl items-center justify-center shadow-md flex-row space-x-2"
            activeOpacity={0.9}
            style={{ backgroundColor: '#3e2723' }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Plus size={20} color="#ffffff" />
                <Text className="text-white font-oswald-bold text-base tracking-widest uppercase ml-1">
                  PROCEED TO TOP-UP ₹{customAmount || "0"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View className="m-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-oswald-bold text-gray-800 tracking-wide uppercase">Recent Transactions</Text>
            <Clock size={18} color="#6b7280" />
          </View>

          {transactions.length === 0 ? (
            <View className="py-8 items-center justify-center">
              <Text className="text-gray-400 text-sm">No transaction records found.</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} className="flex-row items-center justify-between py-3.5 border-b border-gray-100 last:border-b-0">
                <View className="flex-row items-center flex-1 mr-3">
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    backgroundColor: tx.type === "credit" ? "#f0fdf4" : "#fef2f2",
                    borderWidth: 1,
                    borderColor: tx.type === "credit" ? "#bbf7d0" : "#fecaca"
                  }}>
                    <Text style={{ fontSize: 16 }}>{tx.type === "credit" ? "➕" : "🥛"}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-sm text-gray-800 mb-0.5" numberOfLines={1}>{tx.title}</Text>
                    <Text className="text-xs text-gray-400">{formatTxDate(tx.date || tx.created_at)}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-extrabold text-base ${tx.type === "credit" ? "text-green-600" : "text-gray-800"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                  </Text>
                  <View className="flex-row items-center mt-1 space-x-1">
                    <CheckCircle size={12} color="#10b981" />
                    <Text className="text-[10px] text-green-600 font-bold ml-1">{tx.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
