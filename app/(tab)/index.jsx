import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { baseurl, imgurl } from '../../allapi';
import ProductCard from '../Components/ProductCard';
import { getUser } from '../store/userSlice';


const { width } = Dimensions.get('window');


const packageData = [
  {
    id: 1,
    title: 'Daily Essentials Pack',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
    itemsIncluded: ['Full Cream Milk 1L', 'Curd 500g', 'Paneer 200g'],
    oldPrice: 180,
    newPrice: 160,
    totalQuantity: 3,
    unitLabel: 'items',
  },
  {
    id: 2,
    title: 'Protein Power Pack',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    itemsIncluded: ['Paneer 500g', 'Flavored Milk 200ml x2'],
    oldPrice: 200,
    newPrice: 175,
    totalQuantity: 3,
    unitLabel: 'items',
  },
  {
    id: 3,
    title: 'Kids Special Combo',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149',
    itemsIncluded: ['Chocolate Milk 200ml', 'Vanilla Milk 200ml', 'Curd 250g'],
    oldPrice: 130,
    newPrice: 110,
    totalQuantity: 3,
    unitLabel: 'items',
  },
  {
    id: 4,
    title: 'Family Dairy Pack',
    image: 'https://images.unsplash.com/photo-1576186726115-4d51596775d1',
    itemsIncluded: ['Milk 1L x2', 'Curd 1kg', 'Paneer 250g', 'Butter 100g'],
    oldPrice: 320,
    newPrice: 290,
    totalQuantity: 5,
    unitLabel: 'items',
  },
  {
    id: 5,
    title: 'Morning Fresh Pack',
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9',
    itemsIncluded: ['Toned Milk 500ml', 'Buttermilk 200ml', 'Curd 400g'],
    oldPrice: 100,
    newPrice: 90,
    totalQuantity: 3,
    unitLabel: 'items',
  },
];


const CuratedComboCard = ({ item, onAdd }) => (
  <View className="bg-white rounded-3xl p-4 mr-4 border border-gray-100 shadow-sm shadow-gray-200/50" style={{ width: width * 0.72 }}>
    <View className="relative rounded-2xl overflow-hidden mb-3 bg-primary-50" style={{ height: 130 }}>
      <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
      <View className="absolute top-3 left-3 bg-white/90 py-1 px-2.5 rounded-full border border-white/50 shadow-sm">
        <Text className="text-[10px] font-extrabold text-primary-800 uppercase tracking-wider">{item.totalQuantity} {item.unitLabel} combo</Text>
      </View>
      <View className="absolute top-3 right-3 bg-amber-400 py-1 px-2.5 rounded-full shadow-sm">
        <Text className="text-[10px] font-extrabold text-[#3e2723]">Save ₹{item.oldPrice - item.newPrice}</Text>
      </View>
    </View>
    <Text className="font-bold text-base text-gray-800 mb-1">{item.title}</Text>
    <Text className="text-xs text-gray-500 mb-3 leading-tight" numberOfLines={2}>
      {item.itemsIncluded.join(' • ')}
    </Text>
    <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
      <View className="flex-row items-baseline space-x-1.5">
        <Text className="text-lg font-extrabold text-primary-600">₹{item.newPrice}</Text>
        <Text className="text-xs font-bold text-gray-400 line-through">₹{item.oldPrice}</Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        className="bg-primary-600 py-2 px-4 rounded-xl flex-row items-center space-x-1 shadow-sm shadow-primary-600/30"
        activeOpacity={0.9}
      >
        <Feather name="plus" size={16} color="#ffffff" />
        <Text className="text-white font-bold text-xs uppercase tracking-wider ml-1">ADD</Text>
      </TouchableOpacity>
    </View>
  </View>
);


export default function index() {
  const [bannerImage, setBannerImage] = useState([]);
  const [cat, setCat] = useState([]);
  const [allproduct, setAllproduct] = useState([]);
  const [userLocation, setUserLocation] = useState("Fetching location...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState("3h 45m");

  const player = useVideoPlayer(require('../../assets/video/Home-bg-video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused]);

  const dispatch = useDispatch();
  const router = useRouter();
  const { isUser, info } = useSelector((state) => state.user);

  const username = isUser && info?.user?.name ? info.user.name.split(' ')[0] : "Guest";

  // Dynamic greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

  // Dynamic alerts list for rotation
  const alerts = [
    {
      emoji: "⏳",
      text: () => (
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#78350f', flex: 1, lineHeight: 16 }}>
          Order in <Text style={{ color: '#d97706', fontWeight: '900' }}>{timeLeft}</Text> for guaranteed 7:00 AM delivery.
        </Text>
      ),
      badge: "⚡ FREE",
      bgColor: '#fef3c7',
      borderColor: '#fcd34d',
      badgeBg: '#fde68a',
      badgeColor: '#92400e',
    },
    {
      emoji: "🥛",
      text: () => (
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#064e3b', flex: 1, lineHeight: 16 }}>
          Subscribe to <Text style={{ color: '#059669', fontWeight: '900' }}>Daily Milk</Text> & save up to ₹150 monthly.
        </Text>
      ),
      badge: "PROMO",
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7',
      badgeBg: '#a7f3d0',
      badgeColor: '#065f46',
    },
    {
      emoji: "🛡️",
      text: () => (
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e3a8a', flex: 1, lineHeight: 16 }}>
          Purity guaranteed! <Text style={{ color: '#2563eb', fontWeight: '900' }}>100% Organic</Text> & lab tested.
        </Text>
      ),
      badge: "TRUST",
      bgColor: '#dbeafe',
      borderColor: '#93c5fd',
      badgeBg: '#bfdbfe',
      badgeColor: '#1e40af',
    }
  ];

  const [alertIndex, setAlertIndex] = useState(0);
  const alertOpacity = useRef(new Animated.Value(1)).current;

  // Live delivery cutoff timer calculation (now with real-time seconds!)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(22, 0, 0, 0); // 10 PM cutoff
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const diffMs = cutoff - now;
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${hours}h ${pad(minutes)}m ${pad(seconds)}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Alert rotation animation loop
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      Animated.timing(alertOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true
      }).start(() => {
        setAlertIndex((prev) => (prev + 1) % 3);
        Animated.timing(alertOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        }).start();
      });
    }, 6000);

    return () => clearInterval(rotationInterval);
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${baseurl}/banner`);
      const data = response.data;
      if (data.success) {
        setBannerImage(data.banners);
      }
    } catch (err) {
      console.log("Banner fetch error:", err);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${baseurl}/category/`);
      const data = response.data;
      if (data.success) {
        setCat(data.category);
      }
    } catch (err) {
      console.log("Category fetch error:", err);
    }
  };

  const handelcatagypress = async (category = "all") => {
    try {
      const response = await axios.get(`${baseurl}/getproduct/${category}`);
      const data = response.data;
      if (data.success) {
        setAllproduct(data.product);
      }
    } catch (err) {
      console.log("Product fetch error:", err);
    }
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserLocation("Location not available");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (place) {
        const parts = [place.subLocality || place.name, place.city || place.district].filter(Boolean);
        setUserLocation(parts.join(', ') || "Unknown location");
      }
    } catch (err) {
      console.log("Location error:", err);
      setUserLocation("Location unavailable");
    }
  };

  useEffect(() => {
    dispatch(getUser());
    fetchBanner();
    fetchCategory();
    handelcatagypress();
    fetchLocation();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getUser()),
        fetchBanner(),
        fetchCategory(),
        handelcatagypress(),
        fetchLocation(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handelcatagypress2 = (categoryName) => {
    router.push({
      pathname: "/(tab)/category",
      params: { category: categoryName },
    });
  };


  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6d4c41']} tintColor="#6d4c41" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 🌟 Premium Header Section */}
        <View className="px-4 pt-2 pb-1 flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center space-x-1 mb-1">
              <Text className="font-bold text-2xl text-gray-800">{getGreeting()}</Text>
              <Text className="font-extrabold text-primary-600 text-2xl" numberOfLines={1}>{username} ✨</Text>
            </View>
            <TouchableOpacity
              onPress={fetchLocation}
              className="flex-row items-center bg-white py-1.5 px-3 rounded-full border border-gray-100 shadow-sm self-start"
            >
              <MaterialIcons name="location-pin" size={18} color="#6d4c41" />
              <Text className="font-semibold text-xs text-gray-700 ml-1 mr-0.5" numberOfLines={1} style={{ maxWidth: width - 160 }}>
                {userLocation}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color="#6d4c41" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tab)/profile")}
            className="w-12 h-12 rounded-full bg-primary-50 border-2 border-primary-200 items-center justify-center shadow-sm"
          >
            <Ionicons name="person" size={22} color="#6d4c41" />
          </TouchableOpacity>
        </View>

        {/* 🔍 Ultra-Premium Search Bar */}
        <View className="px-4 my-4">
          <TouchableOpacity
            onPress={() => router.push("/singlepage/searchpage")}
            className="bg-white shadow-sm shadow-gray-200/50 rounded-full py-3.5 px-5 flex-row items-center justify-between border border-gray-100"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Feather name="search" size={20} color="#6d4c41" />
              <Text className="text-gray-400 font-medium ml-3 text-base">Search farm fresh milk, paneer, ghee...</Text>
            </View>
            <View className="bg-primary-50 p-2 rounded-full">
              <Ionicons name="options-outline" size={18} color="#6d4c41" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ⏳ Dynamic Live Alert Banner */}
        <View className="px-4 mb-4">
          <Animated.View
            style={{
              opacity: alertOpacity,
              backgroundColor: alerts[alertIndex].bgColor,
              borderColor: alerts[alertIndex].borderColor,
              borderWidth: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>{alerts[alertIndex].emoji}</Text>
              {alerts[alertIndex].text()}
            </View>
            <View
              style={{
                backgroundColor: alerts[alertIndex].badgeBg,
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 9999,
                borderWidth: 0.5,
                borderColor: alerts[alertIndex].borderColor,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: alerts[alertIndex].badgeColor, letterSpacing: 1, textTransform: 'uppercase' }}>
                {alerts[alertIndex].badge}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* 🎥 Premium Video Hero Banner */}
        <View style={{ width: '100%', height: 420, position: 'relative', overflow: 'hidden', backgroundColor: '#3e2723', marginBottom: 20 }}>
          <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            allowsFullscreen={false}
            nativeControls={false}
            contentFit="cover"
          />
          {/* Dark overlay */}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]} />

          {/* Overlay Content */}
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: 'OswaldBold', fontSize: 38, color: '#ffffff', textAlign: 'center', letterSpacing: 1.5, lineHeight: 42 }}>
              PURELY FRESH.
            </Text>
            <Text style={{ fontFamily: 'OswaldBold', fontSize: 38, color: '#fbbf24', textAlign: 'center', letterSpacing: 1.5, lineHeight: 42, marginTop: 4 }}>
              PURELY GAUALLA.
            </Text>

            <Text style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 22, marginTop: 16, fontStyle: 'italic', maxWidth: 320 }}>
              "Straight from our farm to your table. Experience the richness of 100% pure dairy products every single day."
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/(tab)/category')}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#3e2723',
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 30,
                marginTop: 24,
                borderWidth: 1,
                borderColor: '#6d4c41',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 5,
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 }}>
                SHOP THE PURITY
              </Text>
            </TouchableOpacity>
          </View>

          {/* Floating Mute/Unmute Icon */}
          <TouchableOpacity
            onPress={toggleMute}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <MaterialIcons
              name={isMuted ? "volume-off" : "volume-up"}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* 🖼️ Premium Carousel Banner */}
        {/* <View className="mt-1 px-4">
          <View className="rounded-3xl overflow-hidden shadow-md bg-white border border-gray-100">
            <Carousel
              width={width - 32}
              height={170}
              autoPlay
              loop
              data={bannerImage}
              scrollAnimationDuration={1000}
              onProgressChange={(_, absoluteProgress) => {
                if (bannerImage.length > 0) {
                  const roundedProgress = Math.round(absoluteProgress);
                  const nextIndex = ((roundedProgress % bannerImage.length) + bannerImage.length) % bannerImage.length;
                  if (nextIndex !== currentIndex) {
                    setCurrentIndex(nextIndex);
                  }
                }
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: `${imgurl}/${item?.image}` }}
                  className="w-full h-[170px]"
                  resizeMode="stretch"
                />
              )}
            />
          </View> */}

        {/* Premium Pill Pagination Dots */}
        {/* <View className="flex-row justify-center mt-3.5 items-center">
            {bannerImage.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 mx-1 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'w-6 bg-primary-600 opacity-100'
                  : 'w-1.5 bg-gray-300 opacity-60'
                  }`}
              />
            ))}
          </View>
        </View> */}

        {/* 💳 Premium VIP Wallet & Subscription Banner */}
        <View className="mt-8 px-4">
          <View className="bg-[#3e2723] rounded-3xl p-6 shadow-lg border border-[#5d4037] relative overflow-hidden">
            <View className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-[#6d4c41] opacity-30" />
            <View className="absolute right-20 -top-10 w-24 h-24 rounded-full bg-[#8d6e63] opacity-20" />

            <View className="flex-row items-center justify-between mb-4">
              <View className="bg-amber-400 py-1 px-3 rounded-full shadow-sm">
                <Text className="text-[10px] font-extrabold text-[#3e2723] tracking-widest uppercase">👑 VIP MEMBERSHIP</Text>
              </View>
              <Text className="text-amber-400 font-bold text-xs">⭐ Save up to 25%</Text>
            </View>

            <Text className="text-xl font-oswald-bold text-white tracking-wide uppercase mb-1">
              Subscribe & Auto-Deliver Daily
            </Text>
            <Text className="text-xs text-gray-300 mb-5 max-w-[240px] leading-relaxed">
              Top-up Gaualla Wallet with ₹2000 & get instant ₹500 cashback. Never run out of morning milk!
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/singlepage/wallet")}
              className="bg-amber-400 py-3 px-6 rounded-xl flex-row items-center justify-center self-start shadow-md shadow-amber-400/20"
              activeOpacity={0.9}
            >
              <Text className="text-[#3e2723] font-oswald-bold text-sm tracking-wider uppercase mr-2">EXPLORE WALLET PLANS</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#3e2723" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 🥛 Premium Categories Section */}
        <View className="mt-10">
          <View className="flex-row items-center mb-6 px-4">
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
            <Text className="text-2xl font-oswald-bold text-gray-800 mx-2 tracking-wide uppercase">
              EXPLORE CATEGORIES
            </Text>
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
          </View>

          <FlatList
            horizontal
            data={cat}
            keyExtractor={(item, index) => String(item.id || index)}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            ListFooterComponent={() => (
              <TouchableOpacity
                onPress={() => router.push("/(tab)/category")}
                className="items-center mr-5 ml-1"
                activeOpacity={0.8}
              >
                <View className="bg-white p-1 rounded-full shadow-sm border border-primary-100">
                  <View className="bg-primary-50 rounded-full items-center justify-center" style={{ height: 60, width: 60 }}>
                    <MaterialIcons name="arrow-forward" size={28} color="#6d4c41" />
                  </View>
                </View>
                <Text className="mt-2.5 text-[13px] font-extrabold text-gray-800 tracking-wide">See All</Text>
              </TouchableOpacity>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handelcatagypress2(item.name)}
                className="items-center mr-5 ml-1"
                activeOpacity={0.8}
              >
                <View className="bg-white p-1 rounded-full shadow-sm border border-primary-100">
                  <View className="bg-primary-50/60 rounded-full p-2.5">
                    <Image
                      source={{ uri: `${imgurl}/${item.image}` }}
                      style={{ height: 50, width: 50 }}
                      className="rounded-full"
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <Text className="mt-2.5 text-[13px] font-extrabold text-gray-800 tracking-wide capitalize">
                  {item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 📦 Curated Daily Combos Section */}
        {/* <View className="mt-12">
          <View className="flex-row items-center justify-between px-4 mb-5">
            <View className="flex-row items-center">
              <View className="w-1 h-6 bg-primary-600 rounded-full mr-2.5" />
              <Text className="text-xl font-oswald-bold text-gray-800 tracking-wide uppercase">Curated Value Combos</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tab)/category")}>
              <Text className="text-xs font-bold text-primary-600 uppercase tracking-wider">View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={packageData}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
            renderItem={({ item }) => (
              <CuratedComboCard
                item={item}
                onAdd={() => router.push("/(tab)/category")}
              />
            )}
          />
        </View> */}

        {/* ⭐ Premium Best Sellers Section */}
        <View className="mt-12">
          <View className="flex-row items-center mb-6 px-4">
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
            <Text className="text-2xl font-oswald-bold text-gray-800 mx-2 tracking-wide uppercase">
              BEST SELLERS
            </Text>
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between px-4">
            {allproduct.filter(p => p.is_best_seller === 1).slice(0, 6).map((item, index) => (
              <View key={item.id || index} style={{ width: '48%', marginBottom: 16 }}>
                <ProductCard product={item} wid="w-full" m="" />
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tab)/category")}
            className="mx-4 mt-3 py-4 rounded-2xl bg-primary-600 shadow-md shadow-primary-600/30 flex-row items-center justify-center space-x-2"
            activeOpacity={0.9}
          >
            <Text className="text-white font-oswald-bold text-base tracking-widest uppercase">EXPLORE ALL BEST SELLERS</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 📍 Farm Origin & Traceability Showcase */}
        <View className="mt-12 px-4">
          <View className="bg-white rounded-3xl p-6 border border-primary-100 shadow-sm relative overflow-hidden">
            <View className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-bl-full -z-10" />

            <View className="flex-row items-center space-x-2 mb-3">
              <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center border border-primary-100 mr-2.5">
                <Text className="text-lg">🐄</Text>
              </View>
              <View>
                <Text className="text-xs font-extrabold text-primary-600 tracking-widest uppercase mb-0.5">KNOW YOUR MILK</Text>
                <Text className="text-lg font-oswald-bold text-gray-800 tracking-wide uppercase">100% Farm Traceable</Text>
              </View>
            </View>

            <Text className="text-xs text-gray-600 leading-relaxed mb-4">
              Sourced directly from happy, pasture-raised cattle at our pristine green dairy farms. Chilled instantly to 4°C to lock in absolute freshness and natural nutrients.
            </Text>

            <View className="flex-row items-center space-x-4 mb-5">
              <View className="flex-row items-center bg-primary-50 py-1.5 px-3 rounded-full border border-primary-100 mr-3">
                <Ionicons name="shield-checkmark" size={16} color="#6d4c41" />
                <Text className="text-xs font-bold text-primary-900 ml-1.5">No Antibiotics</Text>
              </View>
              <View className="flex-row items-center bg-primary-50 py-1.5 px-3 rounded-full border border-primary-100">
                <Ionicons name="leaf" size={16} color="#6d4c41" />
                <Text className="text-xs font-bold text-primary-900 ml-1.5">No Preservatives</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/singlepage/traceability")}
              className="border border-primary-600 py-3 px-6 rounded-xl flex-row items-center justify-center bg-white self-start shadow-sm"
              activeOpacity={0.9}
            >
              <Text className="text-primary-600 font-oswald-bold text-xs tracking-widest uppercase mr-2">DISCOVER OUR STANDARDS</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#6d4c41" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 🌿 Farm to Glass Trust Banner */}
        <View className="mt-12 px-4">
          <View className="bg-primary-50/80 rounded-3xl p-6 border border-primary-100 shadow-sm">
            <Text className="text-lg font-oswald-bold text-primary-900 text-center tracking-wide uppercase mb-4">
              WHY CHOOSE GAUALLA?
            </Text>
            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm mb-2 border border-primary-100">
                  <Text className="text-xl">🌿</Text>
                </View>
                <Text className="text-xs font-bold text-gray-800 text-center">100% Pure</Text>
                <Text className="text-[10px] text-gray-500 text-center mt-0.5">Untouched milk</Text>
              </View>
              <View className="w-[1px] h-10 bg-primary-200 mx-2" />
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm mb-2 border border-primary-100">
                  <Text className="text-xl">🐄</Text>
                </View>
                <Text className="text-xs font-bold text-gray-800 text-center">12 Hr Delivery</Text>
                <Text className="text-[10px] text-gray-500 text-center mt-0.5">Farm to home</Text>
              </View>
              <View className="w-[1px] h-10 bg-primary-200 mx-2" />
              <View className="items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-sm mb-2 border border-primary-100">
                  <Text className="text-xl">🔬</Text>
                </View>
                <Text className="text-xs font-bold text-gray-800 text-center">70+ Checks</Text>
                <Text className="text-[10px] text-gray-500 text-center mt-0.5">Tested daily</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🛍️ All Products Section */}
        <View className="mt-12">
          <View className="flex-row items-center mb-6 px-4">
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
            <Text className="text-2xl font-oswald-bold text-gray-800 mx-2 tracking-wide uppercase">
              ALL PRODUCTS
            </Text>
            <View className="flex-1 h-3 overflow-hidden">
              <Image
                source={require("../../assets/images/design_cat.png")}
                style={{ width: '100%', height: '500%' }}
                resizeMode="repeat"
              />
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between px-4">
            {allproduct.map((item, index) => (
              <View key={item.id || index} style={{ width: '48%', marginBottom: 16 }}>
                <ProductCard product={item} wid="w-full" m="" />
              </View>
            ))}
          </View>
        </View>

        {/* ✨ Premium Brand Sign-off */}
        <View className="w-full mb-0 pb-36 mt-10 px-6 items-center justify-center">
          <View className="w-16 h-1 bg-primary-600 rounded-full mb-4 opacity-80" />
          <Text className="text-3xl font-oswald-bold text-primary-900 tracking-widest uppercase text-center">
            GAUALLA
          </Text>
          <Text className="text-base font-bold text-primary-600 tracking-wider uppercase mt-1 text-center">
            Purity at its best
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-3 max-w-[260px] leading-relaxed">
            Delivering farm-fresh goodness directly to your doorstep every morning.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}