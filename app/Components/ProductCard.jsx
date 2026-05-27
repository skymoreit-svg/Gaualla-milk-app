import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { baseurl, imgurl } from '../../allapi';


export default function ProductCard({ product, wid = "w-40", m = "mr-3" }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handlePress = () => {
    router.push(`/singlepage/${product.slug}`);
  }

  const addtoCart = async (product_id, price) => {
    try {
      const parsedVariants = product?.variants ? JSON.parse(product.variants) : [];
      if (parsedVariants.length > 0) {
        router.push(`/singlepage/${product.slug}`);
        return;
      }
    } catch {
      // ignore parsing errors
    }

    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      Toast.show({ type: 'info', text1: 'Please login', text2: 'Login to add items to cart', position: 'top', visibilityTime: 2000 });
      router.push('/singlepage/login');
      return;
    }
    setAddingToCart(true);
    try {
      const response = await axios.post(`${baseurl}/cart/addtocart`, { product_id, price }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      if (data.success) {
        Toast.show({ type: 'success', text1: 'Cart Updated!', text2: data.message, position: 'top', visibilityTime: 2000 });
      } else {
        Toast.show({ type: 'error', text1: 'ERROR!', text2: data.message, position: 'top', visibilityTime: 2000 });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add to cart', position: 'top', visibilityTime: 2000 });
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        Toast.show({ type: 'error', text1: 'Please login', text2: 'Login to add items to wishlist', position: 'top', visibilityTime: 2000 });
        return;
      }
      const res = await axios.post(`${baseurl}/wishlist/toggle`, { product_id: product.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWishlisted(res.data.inWishlist);
        Toast.show({
          type: 'success',
          text1: res.data.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
          text2: res.data.message,
          position: 'top',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update wishlist', position: 'top', visibilityTime: 2000 });
    }
  };

  return (
    <TouchableOpacity onPress={() => handlePress()} activeOpacity={0.9}>
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#f5ede8',
          overflow: 'hidden',
          shadowColor: '#3e2723',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
        className={`${m} ${wid}`}
      >
        {/* Product Image with Favorite Icon */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: `${imgurl}/${product?.images[0]}` }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />

          {/* Discount Badge */}
          {(product.old_price || product.oldPrice) > product.price && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 12,
              backgroundColor: '#e53935',
              padding: 4,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              shadowColor: '#3e2723',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
              zIndex: 10,
            }}>
              <View style={{
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: 11,
                  lineHeight: 12,
                  textAlign: 'center',
                }}>
                  {Math.round((((product.old_price || product.oldPrice) - product.price) / (product.old_price || product.oldPrice)) * 100)}%
                </Text>
                <Text style={{
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: 9,
                  lineHeight: 10,
                  textAlign: 'center',
                }}>
                  OFF
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleWishlist}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#f0e0d8',
              shadowColor: '#3e2723',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
              zIndex: 10,
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name={wishlisted ? "favorite" : "favorite-border"} size={16} color={wishlisted ? "#ef4444" : "#6d4c41"} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1f2937', textTransform: 'capitalize' }} numberOfLines={1}>
            {product.name ? product.name.charAt(0).toUpperCase() + product.name.slice(1) : ''}
          </Text>

          {/* Sub-row: Unit and Rating */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: '#8d6e63', fontWeight: '600' }}>
              {product.unit_quantity}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: '#fde68a' }}>
              <MaterialIcons name="star" size={11} color="#fbbf24" />
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#b45309', marginLeft: 2 }}>4.8</Text>
            </View>
          </View>

          {/* Price row */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#3e2723' }}>
              ₹{product.price}
            </Text>
            {(product.old_price || product.oldPrice) && (
              <Text style={{ fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through', marginLeft: 6 }}>
                ₹{product.old_price || product.oldPrice}
              </Text>
            )}
          </View>

          {/* Add to Cart button */}
          <TouchableOpacity
            onPress={() => addtoCart(product.id, product.price)}
            disabled={addingToCart}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#3e2723',
              borderRadius: 12,
              height: 36,
              marginTop: 12,
              borderWidth: 1,
              borderColor: '#3e2723',
              opacity: addingToCart ? 0.7 : 1,
              shadowColor: '#3e2723',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            {addingToCart ? (
              <ActivityIndicator size={16} color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>ADD TO CART</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}