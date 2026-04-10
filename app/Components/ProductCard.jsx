import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { baseurl, imgurl } from '../../allapi';
import * as SecureStore from "expo-secure-store";
import Toast from 'react-native-toast-message';
import axios from 'axios';


export default function ProductCard({product,wid="w-40"}) {
const router = useRouter();
const [wishlisted, setWishlisted] = useState(false);
const [addingToCart, setAddingToCart] = useState(false);

const handlePress = () => {
 router.push(`/singlepage/${product.slug}`);}

const addtoCart = async (product_id, price) => {
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
    <TouchableOpacity onPress={()=>handlePress()} activeOpacity={0.9}>
    <View className={` bg-white rounded-2xl shadow-md overflow-hidden mr-3 border border-gray-200 ${wid}`}>
  {/* Product Image with Favorite Icon */}
  <View className="relative">
   <Image
  source={{ uri: `${imgurl}/${product?.images[0]}` }}
  className="w-full h-36"
  resizeMode="cover"
/>
    <TouchableOpacity
      onPress={toggleWishlist}
      className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow"
    >
      <MaterialIcons name={wishlisted ? "favorite" : "favorite-border"} size={18} color="#ef4444" />
    </TouchableOpacity>
  </View>

  {/* Product Info */}
  <View className="p-4">
    <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
      {product.name}
    </Text>

    <Text className="text-xs text-gray-500 mt-1">
      {product.unit_quantity} 
    </Text>

    {/* Price Section */}
    <View className="flex-row items-center mt-2">
      <Text className="text-base font-extrabold text-gray-900">
        ₹{product.price}
      </Text>
      {product.old_price && (
        <Text className="text-xs text-gray-400 line-through ml-2">
          ₹{product.old_price}
        </Text>
      )}
      {product.oldPrice && (
        <View className="ml-2 bg-green-100 px-1.5 py-0.5 rounded">
          <Text className="text-[10px] text-green-700 font-semibold">
            {Math.round(
              ((product.old_price - product.price) / product.old_price) * 100
            )}
            % off
          </Text>
        </View>
      )}
    </View>

    {/* Add to Cart Button */}
    <TouchableOpacity
      onPress={() => addtoCart(product.id, product.price)}
      disabled={addingToCart}
      activeOpacity={0.85}
      className={`flex-row items-center justify-center bg-green-600 rounded-full px-4 py-2 mt-4 ${addingToCart ? 'opacity-70' : ''}`}
    >
      {addingToCart ? (
        <ActivityIndicator size={16} color="white" />
      ) : (
        <>
          <MaterialIcons name="add-shopping-cart" size={16} color="white" />
          <Text className="text-white text-sm font-semibold ml-2">Add</Text>
        </>
      )}
    </TouchableOpacity>
  </View>
</View>
</TouchableOpacity>
  )
}