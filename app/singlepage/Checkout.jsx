import {
  FontAwesome,
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { baseurl, imageurl } from '../../allapi';
import AddressForm from './AddressForm';

const Checkout = () => {
  const { cartid } = useLocalSearchParams();
  const router = useRouter();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(null);
  const [error, setError] = useState('');
  const [allAddress, setAllAddress] = useState([]);
  const [defaultAddress, setDefaultAddressState] = useState(null);
  const [order, setOrder] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('one_time');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(true);
  const [subscriptionDuration, setSubscriptionDuration] = useState(1);
  const [selectedDates, setSelectedDates] = useState(() => {
    const dates = [];
    let current = new Date();
    current.setDate(current.getDate() + 1);
    for (let i = 0; i < 15; i++) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      current.setDate(current.getDate() + 2);
    }
    return dates;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [walletBalance, setWalletBalance] = useState(2450.00);

  useEffect(() => {
    if (selectedFrequency === 'one_time') {
      setSubscriptionDuration(1);
    } else if (selectedFrequency === 'daily') {
      setSubscriptionDuration(30);
    } else if (selectedFrequency === 'alternative') {
      setSubscriptionDuration(selectedDates.length);
    }
  }, [selectedFrequency, selectedDates]);

  const handleToggleDate = (dateStr) => {
    if (selectedDates.includes(dateStr)) {
      if (selectedDates.length <= 1) {
        Alert.alert("Minimum Limit", "You must select at least 1 delivery date.");
        return;
      }
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      if (selectedDates.length >= 30) {
        Alert.alert("Maximum Limit", "You can select a maximum of 30 delivery dates.");
        return;
      }
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const generateCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ key: `empty-${i}`, isPadding: true });
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateStr < tomorrowStr;
      const isSelected = selectedDates.includes(dateStr);
      days.push({
        key: dateStr,
        dayNum: day,
        dateString: dateStr,
        isPast,
        isSelected,
        isPadding: false
      });
    }
    return days;
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1);
    const today = new Date();
    if (prev.getFullYear() < today.getFullYear() || (prev.getFullYear() === today.getFullYear() && prev.getMonth() < today.getMonth())) {
      return;
    }
    setCurrentCalendarMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1);
    const maxFuture = new Date();
    maxFuture.setMonth(maxFuture.getMonth() + 3);
    if (next > maxFuture) {
      return;
    }
    setCurrentCalendarMonth(next);
  };

  const fetchcartdata = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (data.success) {
        setOrder(data.cart);
      } else {
        setError(data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setError(
        'An error occurred while fetching order details. Please try again.'
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchaddress = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      if (data.success) {
        setAllAddress(data.addresses);
        const defaultAddr = data.addresses.find((addr) => addr.is_default === 1);

        if (defaultAddr) {
          setDefaultAddressState(defaultAddr.id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const response = await axios.get(`${baseurl}/wallet/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success && response.data.wallet) {
          const balance = response.data.wallet.total_balance ?? 
            (parseFloat(response.data.wallet.main_balance || 0) + parseFloat(response.data.wallet.cashback_balance || 0));
          setWalletBalance(balance);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    }
  };

  useEffect(() => {
    if (cartid) {
      fetchcartdata(cartid);
      fetchaddress();
      fetchWalletInfo();
    } else {
      router.push('/');
    }
  }, [cartid]);

  const handleCancelForm = () => {
    setShowNewAddress(false);
    fetchaddress();
  };

  const handelDefault = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      if (data.success) {
        fetchaddress();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handlePlaceOrder = () => {
    if (!defaultAddress) {
      setError("Please select a delivery address");
      return;
    }

    if (selectedFrequency === 'alternative' && selectedDates.length === 0) {
      setError("Please select at least 1 delivery date from the calendar");
      return;
    }

    const amountToPay = parseFloat(order.total_price * subscriptionDuration).toFixed(2);

    if (paymentMethod === 'wallet') {
      const numericAmount = parseFloat(amountToPay);
      if (walletBalance < numericAmount) {
        Alert.alert(
          "Insufficient Balance",
          `Your wallet balance (₹${walletBalance.toFixed(2)}) is less than the order amount (₹${amountToPay}). Please top up your wallet first.`,
          [
            { text: "Go to Wallet", onPress: () => router.push("/singlepage/wallet") },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }

      Alert.alert(
        "Confirm Payment",
        `Are you sure you want to pay ₹${amountToPay} using your Gaualla Wallet?`,
        [
          {
            text: "Pay Now",
            onPress: async () => {
              try {
                const token = await SecureStore.getItemAsync('authToken');
                const payload = {
                  address_id: defaultAddress,
                  total_amount: parseFloat(amountToPay),
                  type: selectedFrequency === 'alternative' ? 'custom_dates' : selectedFrequency,
                  custom_delivery_dates: selectedFrequency === 'alternative' ? selectedDates : [],
                  cart_items: [
                    {
                      product_id: order.product_id,
                      quantity: order.quantity,
                      price: parseFloat(order.cart_price || 0),
                      variant_name: order.variant_name
                    }
                  ]
                };

                const response = await axios.post(`${baseurl}/order/pay-wallet`, payload, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (response.data && response.data.success) {
                  try {
                    if (cartid && cartid !== "all") {
                      await axios.delete(`${baseurl}/cart/deletecart/${cartid}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    }
                  } catch (e) {
                    console.log("Cart clear error:", e);
                  }

                  Alert.alert(
                    "Success",
                    "Order placed successfully using wallet balance!",
                    [
                      { text: "View Orders", onPress: () => router.replace("/(tab)/order") },
                      { text: "Go Home", onPress: () => router.replace("/(tab)") }
                    ]
                  );
                } else {
                  Alert.alert("Payment Failed", response.data.message || "Failed to complete payment using wallet.");
                }
              } catch (e) {
                console.log("Wallet payment request error:", e);
                const errorMsg = e.response?.data?.message || "An error occurred during wallet payment. Please try again.";
                Alert.alert("Payment Failed", errorMsg);
              }
            }
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }

    router.push({
      pathname: "/singlepage/RazorpayCheckout",
      params: {
        defaultAddress: String(defaultAddress),
        amountToPay: amountToPay.toString(),
        selectedFrequency,
        selectedDates: selectedFrequency === 'alternative' ? JSON.stringify(selectedDates) : null,
        cartid: cartid ? String(cartid) : null,
        cartItems: JSON.stringify([
          {
            product_id: order.product_id,
            quantity: order.quantity,
            price: order.cart_price,
            variant_name: order.variant_name,
          },
        ]),
      },
    });
  };

  const renderCalendarModal = () => {
    const days = generateCalendarDays();
    const monthName = currentCalendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Schedule Deliveries</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color="#3e2723" />
              </TouchableOpacity>
            </View>

            <Text style={styles.calendarSubTitle}>
              Select between 1 and 30 delivery dates. Green highlights indicate selected days.
            </Text>

            <View style={styles.monthNav}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-back" size={20} color="#3e2723" />
              </TouchableOpacity>
              <Text style={styles.monthNameText}>{monthName}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
                <Ionicons name="chevron-forward" size={20} color="#3e2723" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map((day, idx) => (
                <Text key={idx} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {days.map((item) => {
                if (item.isPadding) {
                  return <View key={item.key} style={styles.dayCellEmpty} />;
                }

                return (
                  <TouchableOpacity
                    key={item.key}
                    disabled={item.isPast}
                    onPress={() => handleToggleDate(item.dateString)}
                    style={[
                      styles.dayCell,
                      item.isSelected && styles.dayCellSelected,
                      item.isPast && styles.dayCellPast,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        item.isSelected && styles.dayTextSelected,
                        item.isPast && styles.dayTextPast,
                      ]}
                    >
                      {item.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarFooterInfo}>
              <Text style={styles.countText}>
                Selected Days: <Text style={{ fontWeight: '800', color: '#16a34a' }}>{selectedDates.length}</Text> / 30
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              style={styles.confirmCalendarBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.confirmCalendarBtnText}>CONFIRM SCHEDULE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#3e2723" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={16} color="#dc2626" style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Text style={styles.errorClose}>&times;</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.contentContainer}>
          <View style={styles.mainSection}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="map-marker" size={18} color="#6d4c41" />
                <Text style={styles.sectionTitle}>Delivery Destination</Text>
              </View>

              {!showNewAddress ? (
                <>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={() => setShowNewAddress(true)}
                    activeOpacity={0.9}
                  >
                    <FontAwesome name="plus" size={12} color="white" />
                    <Text style={styles.addAddressText}>ADD NEW ADDRESS</Text>
                  </TouchableOpacity>

                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color="#6d4c41"
                      style={styles.loader}
                    />
                  ) : (
                    <View style={styles.addressList}>
                      {allAddress.length > 0 ? (
                        allAddress.map((addr) => (
                          <View
                            key={addr.id}
                            style={[
                              styles.addressCard,
                              addr.is_default
                                ? styles.defaultAddressCard
                                : styles.regularAddressCard,
                            ]}
                          >
                            <View style={styles.addressCardHeader}>
                              <View style={styles.addressType}>
                                {addr.address_type === 'home' ? (
                                  <FontAwesome
                                    name="home"
                                    size={14}
                                    color="#6d4c41"
                                  />
                                ) : (
                                  <FontAwesome
                                    name="building"
                                    size={14}
                                    color="#3b82f6"
                                  />
                                )}
                                <Text style={styles.addressTypeText}>
                                  {addr.address_type}
                                </Text>
                              </View>
                              {addr.is_default ? (
                                <View style={styles.defaultBadge}>
                                  <MaterialIcons name="star" size={14} color="#b45309" />
                                  <Text style={styles.defaultText}>Default</Text>
                                </View>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => handelDefault(addr.id)}
                                  style={styles.setDefaultBtn}
                                  activeOpacity={0.7}
                                >
                                  <MaterialIcons
                                    name="star-border"
                                    size={18}
                                    color="#9ca3af"
                                  />
                                  <Text style={styles.setDefaultText}>Set default</Text>
                                </TouchableOpacity>
                              )}
                            </View>

                            <Text style={styles.addressName}>
                              {addr.first_name !== '-' ? `${addr.first_name} ${addr.last_name}` : 'Customer Address'}
                            </Text>
                            <Text style={styles.addressText}>
                              {addr.street}
                            </Text>
                            {addr.landmark ? (
                              <Text style={styles.addressText}>Landmark: {addr.landmark}</Text>
                            ) : null}
                            <Text style={styles.addressText}>
                              {addr.city}, {addr.state} - {addr.zip_code}
                            </Text>
                            <Text style={styles.addressText}>{addr.country}</Text>
                            {addr.phone !== '-' && <Text style={styles.phoneText}>📞 {addr.phone}</Text>}
                          </View>
                        ))
                      ) : (
                        <View style={styles.emptyAddress}>
                          <FontAwesome
                            name="map-marker"
                            size={32}
                            color="#a1887f"
                            style={{ marginBottom: 10 }}
                          />
                          <Text style={styles.emptyAddressText}>
                            No addresses saved yet.
                          </Text>
                          <Text style={styles.emptyAddressSubtext}>
                            Please register a delivery address to verify shipping routes.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              ) : (
                <AddressForm onCancel={handleCancelForm} />
              )}
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.summarySection}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="shopping-bag" size={16} color="#6d4c41" />
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>

              {orderLoading ?
                (
                  <ActivityIndicator
                    size="large"
                    color="#6d4c41"
                    style={styles.loader}
                  />
                ) : order ? (
                  <>
                    <View style={styles.orderItem}>
                      <View style={styles.productImageContainer}>
                        <Image
                          source={{
                            uri: `${imageurl}/${JSON.parse(order.images)[0]}`,
                          }}
                          style={styles.productImage}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>
                          {order?.name} {order?.variant_name ? `(${order.variant_name})` : ""}
                        </Text>
                        <Text style={styles.productQuantity}>
                          Quantity: <Text style={{ fontWeight: '700', color: '#3e2723' }}>{order?.quantity}</Text>
                        </Text>
                      </View>
                      <Text style={styles.productPrice}>
                        ₹{parseFloat(order?.cart_price || 0).toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.priceBreakdown}>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>
                          ₹{parseFloat(order.total_price || 0).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Shipping & Delivery</Text>
                        <Text style={styles.freeShipping}>FREE</Text>
                      </View>
                    </View>

                    {order.one_time ? (
                      <View style={styles.oneTimeBadge}>
                        <Text style={styles.oneTimeText}>⚡ One-time purchase option only</Text>
                      </View>
                    ) : (
                      <View style={styles.frequencySelector}>
                        <Text style={styles.selectorLabel}>
                          Select Delivery Schedule:
                        </Text>
                        <View style={styles.frequencyButtons}>
                          <TouchableOpacity
                            style={[
                              styles.frequencyButton,
                              selectedFrequency === 'one_time'
                                ? styles.frequencyButtonSelected
                                : styles.frequencyButtonDefault,
                            ]}
                            onPress={() => {
                              setSelectedFrequency('one_time');
                              setSubscriptionDuration(1);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.frequencyButtonText,
                                selectedFrequency === 'one_time'
                                  ? styles.frequencyButtonTextSelected
                                  : styles.frequencyButtonTextDefault,
                              ]}
                            >
                              One Time
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.frequencyButton,
                              selectedFrequency === 'daily'
                                ? styles.frequencyButtonSelected
                                : styles.frequencyButtonDefault,
                            ]}
                            onPress={() => {
                              setSelectedFrequency('daily');
                              setSubscriptionDuration(30);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.frequencyButtonText,
                                selectedFrequency === 'daily'
                                  ? styles.frequencyButtonTextSelected
                                  : styles.frequencyButtonTextDefault,
                              ]}
                            >
                              30 Days
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.frequencyButton,
                              selectedFrequency === 'alternative'
                                ? styles.frequencyButtonSelected
                                : styles.frequencyButtonDefault,
                            ]}
                            onPress={() => {
                              setSelectedFrequency('alternative');
                              setSubscriptionDuration(selectedDates.length);
                              setShowCalendar(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.frequencyButtonText,
                                selectedFrequency === 'alternative'
                                  ? styles.frequencyButtonTextSelected
                                  : styles.frequencyButtonTextDefault,
                              ]}
                            >
                              Alt Days
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {selectedFrequency === 'alternative' && (
                          <View style={styles.calendarControlContainer}>
                            <Text style={styles.calendarControlTitle}>
                              Delivery Schedule:
                            </Text>
                            <TouchableOpacity
                              style={styles.openCalendarBtn}
                              onPress={() => setShowCalendar(true)}
                              activeOpacity={0.8}
                            >
                              <FontAwesome name="calendar" size={14} color="#6d4c41" style={{ marginRight: 8 }} />
                              <Text style={styles.openCalendarBtnText}>
                                Customize Dates ({selectedDates.length} selected)
                              </Text>
                            </TouchableOpacity>

                            {selectedDates.length > 0 && (
                              <View style={styles.selectedDatesListContainer}>
                                <Text style={styles.selectedDatesHeading}>Selected Dates ({selectedDates.length}/30):</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScrollContent}>
                                  {selectedDates.slice().sort().map((dateStr) => {
                                    const dateObj = new Date(dateStr);
                                    const day = dateObj.getDate();
                                    const month = dateObj.toLocaleDateString('default', { month: 'short' });
                                    return (
                                      <View key={dateStr} style={styles.dateBadge}>
                                        <Text style={styles.dateBadgeText}>{`${day} ${month}`}</Text>
                                        <TouchableOpacity
                                          onPress={() => handleToggleDate(dateStr)}
                                          style={styles.removeDateBtn}
                                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                          <Ionicons name="close-circle" size={14} color="#ef4444" style={{ marginLeft: 4 }} />
                                        </TouchableOpacity>
                                      </View>
                                    );
                                  })}
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Payment Method Selector */}
                    <View style={styles.paymentSelectorContainer}>
                      <Text style={styles.selectorLabel}>Select Payment Method:</Text>

                      {/* Option 1: Razorpay */}
                      <TouchableOpacity
                        style={[
                          styles.paymentOptionRow,
                          paymentMethod === 'razorpay' ? styles.paymentOptionRowSelected : styles.paymentOptionRowDefault
                        ]}
                        onPress={() => setPaymentMethod('razorpay')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.radioOutline}>
                          {paymentMethod === 'razorpay' && <View style={styles.radioDot} />}
                        </View>
                        <MaterialIcons
                          name="payment"
                          size={20}
                          color={paymentMethod === 'razorpay' ? '#3e2723' : '#6b7280'}
                          style={{ marginHorizontal: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.paymentOptionTitle, paymentMethod === 'razorpay' && styles.paymentOptionTitleSelected]}>
                            Online Payment (Razorpay)
                          </Text>
                          <Text style={styles.paymentOptionSub}>UPI, Cards, Netbanking, Wallets</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Option 2: Wallet */}
                      <TouchableOpacity
                        style={[
                          styles.paymentOptionRow,
                          paymentMethod === 'wallet' ? styles.paymentOptionRowSelected : styles.paymentOptionRowDefault
                        ]}
                        onPress={() => setPaymentMethod('wallet')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.radioOutline}>
                          {paymentMethod === 'wallet' && <View style={styles.radioDot} />}
                        </View>
                        <Ionicons
                          name="wallet"
                          size={20}
                          color={paymentMethod === 'wallet' ? '#3e2723' : '#6b7280'}
                          style={{ marginHorizontal: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.paymentOptionTitle, paymentMethod === 'wallet' && styles.paymentOptionTitleSelected]}>
                              Gaualla VIP Wallet
                            </Text>
                            <Text style={[
                              styles.paymentWalletBalance,
                              walletBalance >= parseFloat((order?.total_price || 0) * subscriptionDuration) ? styles.balanceSuccess : styles.balanceDanger
                            ]}>
                              ₹{walletBalance.toFixed(2)}
                            </Text>
                          </View>
                          <Text style={styles.paymentOptionSub}>Fast checkout, 100% secure, instant refund</Text>
                          {paymentMethod === 'wallet' && walletBalance < parseFloat((order?.total_price || 0) * subscriptionDuration) && (
                            <Text style={styles.insufficientText}>
                              ⚠️ Insufficient Balance. Please top up your wallet.
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Payable Amount</Text>
                      <Text style={styles.totalValue}>
                        ₹{(
                          (order?.total_price || 0) *
                          subscriptionDuration
                        ).toFixed(2)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.placeOrderButton,
                        !defaultAddress ? styles.disabledButton : null,
                      ]}
                      onPress={handlePlaceOrder}
                      disabled={!defaultAddress}
                      activeOpacity={0.9}
                    >
                      {isSettingDefault ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.placeOrderText}>
                          {!defaultAddress
                            ? 'SELECT ADDRESS TO PROCEED'
                            : 'PLACE ORDER & PAY'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.noOrderText}>
                    No order details available.
                  </Text>
                )}
            </View>
          </View>
        </View>
      </ScrollView>
      {renderCalendarModal()}
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    margin: 16,
    padding: 12,
    borderRadius: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorClose: {
    color: '#b91c1c',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
  },
  mainSection: {
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f5ede8',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
    paddingBottom: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3e2723',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  addAddressText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  loader: {
    padding: 40,
  },
  addressList: {
    marginTop: 4,
  },
  addressCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  defaultAddressCard: {
    backgroundColor: '#fffdfb',
    borderColor: '#fde68a',
  },
  regularAddressCard: {
    backgroundColor: '#ffffff',
    borderColor: '#f5ede8',
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5ede8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addressTypeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#6d4c41',
    marginLeft: 4,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#fde68a',
  },
  defaultText: {
    fontSize: 9,
    color: '#b45309',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 3,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  addressText: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 1,
  },
  phoneText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyAddress: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#f5ede8',
    borderRadius: 20,
    backgroundColor: '#fdf8f6',
  },
  emptyAddressText: {
    color: '#3e2723',
    fontWeight: '800',
    fontSize: 14,
  },
  emptyAddressSubtext: {
    color: '#a1887f',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
    paddingBottom: 14,
    marginBottom: 14,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fdf6f3',
    borderWidth: 1,
    borderColor: '#f0e0d8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 3,
  },
  productQuantity: {
    color: '#6b7280',
    fontSize: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3e2723',
  },
  priceBreakdown: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
    paddingBottom: 14,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  priceValue: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 13,
  },
  freeShipping: {
    color: '#16a34a',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  oneTimeBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 0.5,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  oneTimeText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 12,
  },
  frequencySelector: {
    marginBottom: 14,
  },
  selectorLabel: {
    color: '#6d4c41',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  frequencyButtonDefault: {
    backgroundColor: '#fff',
    borderColor: '#f0e0d8',
  },
  frequencyButtonSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  frequencyButtonTextDefault: {
    color: '#4b5563',
  },
  frequencyButtonTextSelected: {
    color: '#065f46',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5ede8',
    paddingTop: 14,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3e2723',
  },
  placeOrderButton: {
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
  disabledButton: {
    backgroundColor: '#9ca3af',
    elevation: 0,
    shadowOpacity: 0,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noOrderText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
  calendarControlContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5ede8',
  },
  calendarControlTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6d4c41',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  openCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#6d4c41',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  openCalendarBtnText: {
    color: '#6d4c41',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedDatesListContainer: {
    marginTop: 12,
  },
  selectedDatesHeading: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '700',
    marginBottom: 6,
  },
  datesScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdfb',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 6,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  removeDateBtn: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3e2723',
  },
  closeModalBtn: {
    padding: 4,
  },
  calendarSubTitle: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fdf6f3',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  monthNavBtn: {
    padding: 6,
  },
  monthNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3e2723',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a1887f',
    width: 36,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  dayCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 18,
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
    margin: 4,
  },
  dayCellSelected: {
    backgroundColor: '#16a34a',
  },
  dayCellPast: {
    backgroundColor: 'transparent',
    opacity: 0.25,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayTextPast: {
    color: '#9ca3af',
  },
  calendarFooterInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  confirmCalendarBtn: {
    backgroundColor: '#3e2723',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCalendarBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  paymentSelectorContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5ede8',
    marginBottom: 8,
  },
  paymentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  paymentOptionRowDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#f5ede8',
  },
  paymentOptionRowSelected: {
    backgroundColor: '#fffdfb',
    borderColor: '#3e2723',
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3e2723',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3e2723',
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
  },
  paymentOptionTitleSelected: {
    color: '#3e2723',
  },
  paymentOptionSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  paymentWalletBalance: {
    fontSize: 14,
    fontWeight: '800',
  },
  balanceSuccess: {
    color: '#16a34a',
  },
  balanceDanger: {
    color: '#dc2626',
  },
  insufficientText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '700',
    marginTop: 4,
  },
});

export default Checkout;