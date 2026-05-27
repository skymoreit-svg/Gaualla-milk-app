import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { baseurl, imgurl } from "../../allapi";

export default function Wishlist() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tab)/profile");
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${baseurl}/wishlist/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setItems(res.data.wishlist);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await axios.delete(`${baseurl}/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      Toast.show({
        type: "success",
        text1: "Removed",
        text2: "Item removed from wishlist",
        position: "top",
        visibilityTime: 1500,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId, price) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const res = await axios.post(
        `${baseurl}/cart/addtocart`,
        { product_id: productId, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "Cart Updated!",
          text2: res.data.message,
          position: "top",
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res.data.message,
          position: "top",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart");
    }
  };

  const getFirstImage = (images) => {
    try {
      const parsed = typeof images === "string" ? JSON.parse(images) : images;
      return parsed && parsed.length > 0 ? `${imgurl}/${parsed[0]}` : null;
    } catch {
      return null;
    }
  };

  const renderItem = ({ item }) => {
    const imageUri = getFirstImage(item.images);
    const isRemoving = removingId === item.product_id;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/singlepage/${item.slug}`)}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          {/* Image */}
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Heart size={24} color="#a1887f" />
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              {item.unit_quantity ? (
                <Text style={styles.unitText}>{item.unit_quantity}</Text>
              ) : null}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>₹{item.price}</Text>
              {item.old_price ? (
                <Text style={styles.oldPriceText}>₹{item.old_price}</Text>
              ) : null}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => handleAddToCart(item.product_id, item.price)}
              style={styles.cartBtn}
              activeOpacity={0.8}
            >
              <ShoppingCart size={16} color="#15803d" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRemove(item.product_id)}
              disabled={isRemoving}
              style={styles.removeBtn}
              activeOpacity={0.8}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Trash2 size={16} color="#dc2626" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6d4c41" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleGoBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#3e2723" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          {items.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Heart size={36} color="#a1887f" />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite organic products and fresh dairy items here for quick orders.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tab)")}
            style={styles.browseBtn}
            activeOpacity={0.9}
          >
            <Text style={styles.browseBtnText}>EXPLORE PRODUCTS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.wishlist_id)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFC8',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: '#fee2e2',
    borderWidth: 0.5,
    borderColor: '#fca5a5',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f5ede8',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#fdf6f3',
    borderRightWidth: 1,
    borderRightColor: '#f5ede8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 18,
  },
  unitText: {
    fontSize: 11,
    color: '#6d4c41',
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3e2723',
  },
  oldPriceText: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: '#f5ede8',
    gap: 8,
  },
  cartBtn: {
    backgroundColor: '#d1fae5',
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 0.5,
    borderColor: '#fca5a5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3e2723',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6d4c41',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#3e2723',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  browseBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
