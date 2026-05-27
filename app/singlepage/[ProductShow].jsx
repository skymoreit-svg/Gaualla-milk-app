import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import RenderHtml from 'react-native-render-html';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { baseurl, imgurl } from "../../allapi";
import ProductCard from "../Components/ProductCard";

const { width } = Dimensions.get("window");

export default function ProductShow() {
  const { ProductShow } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [allproduct2, setAllproduct2] = useState([]);
  const [allProduct, setAllProduct] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { width: windowWidth } = useWindowDimensions();

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
    handelcatagypress();
  }, []);

  // Variants parsing (must be before early return to keep hooks consistent)
  let variants = [];
  try {
    variants = allProduct?.variants ? JSON.parse(allProduct.variants) : [];
  } catch {
    variants = [];
  }

  // Kept empty to maintain hook count, but we no longer auto-select a variant
  useEffect(() => {
  }, [allProduct?.variants]);

  if (!allProduct) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F6EFC8" }}>
        <SafeAreaView>
          <Text style={{ fontSize: 14, color: "#9ca3af" }}>Loading pristine product...</Text>
        </SafeAreaView>
      </View>
    );
  }

  // Images array
  let allimg = [];
  try {
    allimg = allProduct?.images ? JSON.parse(allProduct.images) : [];
  } catch {
    allimg = [];
  }

  const calculateUnitRate = (price, name) => {
    const match = name.match(/(\d+)\s*(ml|g|kg|l)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      let multiplier = 1;
      let baseUnit = 'L';
      if (unit === 'ml') { multiplier = 1000 / val; baseUnit = 'L'; }
      else if (unit === 'l') { multiplier = 1 / val; baseUnit = 'L'; }
      else if (unit === 'g') { multiplier = 1000 / val; baseUnit = 'kg'; }
      else if (unit === 'kg') { multiplier = 1 / val; baseUnit = 'kg'; }

      return `₹${Math.round(price * multiplier)}/${baseUnit}`;
    }
    return null;
  };

  // Prices & discount
  const oldPrice = parseFloat(selectedVariant ? selectedVariant.old_price : allProduct.old_price);
  const newPrice = parseFloat(selectedVariant ? selectedVariant.price : allProduct.price);
  const discount =
    oldPrice > newPrice
      ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      : 0;

  const htmlDescription = allProduct?.description || "";
  const htmlDescription2 = allProduct?.description2 || "";

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
    const response = await axios.post(`${baseurl}/cart/addtocart`, { product_id: allProduct?.id, price: newPrice, variant_name: selectedVariant?.name, quantity: 1 }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.data;
    if (data.success) {
      Toast.show({
        type: 'success',
        text1: 'Added to Cart! 🛒',
        text2: data.message,
        position: 'top',
        visibilityTime: 2000,
      });
      router.push("/(tab)/cart");
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error adding to cart',
        text2: data.message,
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // Feature details
  const features = [
    { icon: <MaterialIcons name="local-shipping" size={18} color="#6d4c41" />, text: "Free Delivery" },
    { icon: <MaterialCommunityIcons name="recycle" size={18} color="#6d4c41" />, text: "100% Natural" },
    { icon: <FontAwesome name="leaf" size={16} color="#6d4c41" />, text: "Pure organic" },
    { icon: <MaterialIcons name="verified" size={18} color="#6d4c41" />, text: "Lab Tested" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      {/* ── Premium Header ──────────────────────── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8' }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#3e2723" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 }}>
          Product Details
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8' }}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={18} color="#3e2723" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Image Carousel Container ──────────────────────── */}
        <Animated.View entering={FadeIn.duration(600)} style={{ position: 'relative', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8' }}>
          <Carousel
            width={width}
            height={width}
            autoPlay
            loop
            data={allimg}
            scrollAnimationDuration={1000}
            onProgressChange={(_, absoluteProgress) => {
              if (allimg.length > 0) {
                const rounded = Math.round(absoluteProgress);
                const index = (rounded + allimg.length) % allimg.length;
                if (index !== activeSlide) {
                  setActiveSlide(index);
                }
              }
            }}
            renderItem={({ item }) => (
              <View style={{ width: width, height: width, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  source={{ uri: `${imgurl}/${item}` }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}
          />

          {/* Dots Indicator */}
          {allimg.length > 1 && (
            <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {allimg.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: activeSlide === i ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: activeSlide === i ? '#3e2723' : '#d1d5db',
                  }}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ── Product Information Box ──────────────────────── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {/* Tag & Rating */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 0.5, borderColor: '#fde68a' }}>
              <Text style={{ color: '#b45309', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Best Seller</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#4b5563', marginLeft: 4 }}>4.8</Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 2 }}>(120 reviews)</Text>
            </View>
          </View>

          {/* Title & Units */}
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1f2937', marginBottom: 12, lineHeight: 28 }}>
            {allProduct.name}
          </Text>

          {/* Variants */}
          {variants.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1f2937', marginBottom: 12 }}>Select Variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
                {variants.map((variant, index) => {
                  const isSelected = selectedVariant?.name === variant.name;
                  const vPrice = parseFloat(variant.price);
                  const vOldPrice = parseFloat(variant.old_price);
                  const vDiscount = vOldPrice > vPrice ? Math.round(((vOldPrice - vPrice) / vOldPrice) * 100) : 0;
                  const unitRate = calculateUnitRate(vPrice, variant.name);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedVariant(isSelected ? null : variant)}
                      activeOpacity={0.8}
                      style={{
                        width: 140,
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isSelected ? '#6d4c41' : '#f5ede8',
                        overflow: 'hidden',
                        shadowColor: '#3e2723',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isSelected ? 0.1 : 0.04,
                        shadowRadius: 6,
                        elevation: isSelected ? 4 : 1
                      }}
                    >
                      <View style={{ backgroundColor: isSelected ? '#6d4c41' : '#f0e0d8', paddingVertical: 8, alignItems: 'center' }}>
                        <Text style={{ color: isSelected ? '#fff' : '#6d4c41', fontWeight: 'bold', fontSize: 14 }}>{variant.name}</Text>
                      </View>
                      <View style={{ padding: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <Text style={{ fontSize: 18, fontWeight: '900', color: '#3e2723', marginRight: 4 }}>₹{vPrice}</Text>
                          {vOldPrice > vPrice && (
                            <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through', marginRight: 4 }}>₹{vOldPrice}</Text>
                          )}
                          {vDiscount > 0 && (
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>{vDiscount}% off</Text>
                          )}
                        </View>
                        {unitRate && (
                          <Text style={{ fontSize: 11, fontWeight: '600', color: '#059669', marginTop: 4 }}>{unitRate}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Pricing Section */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Price</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: '#3e2723' }}>₹{newPrice}</Text>
                  <Text style={{ fontSize: 13, color: '#9ca3af', marginLeft: 4 }}>/ {selectedVariant ? selectedVariant.name : allProduct.unit_quantity}</Text>
                </View>
              </View>

              {oldPrice > newPrice ? (
                <View style={{ alignItems: 'end' }}>
                  <Text style={{ fontSize: 14, color: '#9ca3af', textDecorationLine: 'line-through', marginBottom: 2 }}>₹{oldPrice}</Text>
                  <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 0.5, borderColor: '#fca5a5' }}>
                    <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '800' }}>{discount}% OFF</Text>
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: '#fdf6f3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#f0e0d8' }}>
                  <Text style={{ color: '#6d4c41', fontSize: 11, fontWeight: '700' }}>Guaranteed Price</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Features Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#fff', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 }}>
            {features.map((feature, index) => (
              <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginBottom: 6 }}>
                  {feature.icon}
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#4b5563', textAlign: 'center' }}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Description Section */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f5ede8', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <MaterialIcons name="description" size={18} color="#6d4c41" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.2 }}>
                Description
              </Text>
            </View>
            <RenderHtml
              contentWidth={windowWidth - 32}
              source={{ html: htmlDescription }}
              tagsStyles={{
                p: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 8 },
                h2: { fontSize: 18, color: '#1f2937', fontWeight: 'bold', marginBottom: 10 },
                h3: { fontSize: 16, color: '#1f2937', fontWeight: 'bold', marginBottom: 8 },
                ul: { marginVertical: 8 },
                li: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 4 },
                strong: { color: '#1f2937' },
                em: { fontStyle: 'italic' },
              }}
            />
            {htmlDescription2 ? (
              <RenderHtml
                contentWidth={windowWidth - 32}
                source={{ html: htmlDescription2 }}
                tagsStyles={{
                  p: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 8 },
                  h2: { fontSize: 18, color: '#1f2937', fontWeight: 'bold', marginBottom: 10 },
                  h3: { fontSize: 16, color: '#1f2937', fontWeight: 'bold', marginBottom: 8 },
                  ul: { marginVertical: 8 },
                  li: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 4 },
                  strong: { color: '#1f2937' },
                  em: { fontStyle: 'italic' },
                }}
              />
            ) : null}
          </View>

          {/* Key Benefits Section */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f5ede8', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#6d4c41" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.2 }}>
                Key Benefits
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              {[
                "Boosts immunity and strengthens overall health",
                "Improves digestion and gut health",
                "Supports brain development and memory power",
                "Enhances energy and stamina",
                "Promotes healthy skin and glowing complexion"
              ].map((benefit, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'start' }}>
                  <MaterialIcons name="check-circle" size={16} color="#6d4c41" style={{ marginTop: 2, marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: '#4b5563', flex: 1, lineHeight: 18 }}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quality & Security Section */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f5ede8', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="security" size={18} color="#6d4c41" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.2 }}>
                Quality & Safety Assurance
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="credit-card-check-outline" size={18} color="#6d4c41" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#4b5563', fontWeight: '500' }}>Secure VIP Wallet Payments</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="certificate-outline" size={18} color="#6d4c41" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#4b5563', fontWeight: '500' }}>100% Authentic Organic Dairy</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#6d4c41" style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: '#4b5563', fontWeight: '500' }}>Untouched Farm-to-Table Guarantee</Text>
              </View>
            </View>
          </View>

          {/* Related Products */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 12, overflow: 'hidden' }}>
                <Image
                  source={require("../../assets/images/design_cat.png")}
                  style={{ width: '100%', height: '500%' }}
                  resizeMode="repeat"
                />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#3e2723', marginHorizontal: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                Related Products
              </Text>
              <View style={{ flex: 1, height: 12, overflow: 'hidden' }}>
                <Image
                  source={require("../../assets/images/design_cat.png")}
                  style={{ width: '100%', height: '500%' }}
                  resizeMode="repeat"
                />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 16 }}
            >
              {allproduct2?.map((item, index) => (
                <View key={index} style={{ width: 175 }}>
                  <ProductCard product={item} wid="w-full" m="" />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed Bottom Add to Cart Button ──────────────────────── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f5ede8",
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 14),
          shadowColor: "#3e2723",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={handelAddtoCart}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: "#3e2723",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#3e2723",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.9}
        >
          <Ionicons name="cart" size={22} color="white" />
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16, marginLeft: 10 }}>
            ADD TO CART
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}