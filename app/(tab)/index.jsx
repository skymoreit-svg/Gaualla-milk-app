import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { Link, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomImage from "../../assets/bannerimages/bottimg.png";
import ComboProductCompo from '../Components/ComboProductCompo';
import ProductCard from '../Components/ProductCard';
import axios from 'axios';
import { baseurl, imgurl } from '../../allapi';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../store/userSlice';
import * as Location from 'expo-location';

import styles from '../../assets/style'

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





export default function index() {
  const [bannerImage, setBannerImage] = useState([]);
  const [cat, setCat] = useState([]);
  const [allproduct, setAllproduct] = useState([]);
  const [userLocation, setUserLocation] = useState("Fetching location...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { isUser, info } = useSelector((state) => state.user);

  const username = isUser && info?.user?.name ? info.user.name.split(' ')[0] : "Guest";

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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'left', 'right']}>
   <ScrollView
     refreshControl={
       <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} tintColor="#16a34a" />
     }
   >
<View className='px-3'>
  <View className='flex flex-row gap-1'>
    <Text className='font-semibold text-xl'>Hello</Text>
    <Text className='font-semibold text-green-600 text-xl' numberOfLines={1}>{username},</Text>
  </View>
  <View className='flex flex-row gap-1 items-center mt-1'>
    <MaterialIcons name="location-pin" size={20} color="#a61407" />
    <Text className='font-medium text-sm text-gray-700' numberOfLines={1} style={{ maxWidth: width - 80 }}>{userLocation}</Text>
    <EvilIcons name="chevron-down" size={20} color="green" />
  </View>
</View>

<View className='px-3 my-2'>
  <TouchableOpacity onPress={()=>router.push("/singlepage/searchpage")} className=' border-2 border-green-600  flex flex-row  gap-2 rounded-full px-4 py-2  items-center'>
<Octicons name="search" size={24} color="green" />
    <Text>Search</Text>
    <Text>Dairy</Text>
  </TouchableOpacity>
</View>

<View className="mt-4 px-3">
  <Carousel
    width={width - 20}
    height={160}
    autoPlay
    loop
    data={bannerImage}
    scrollAnimationDuration={2000}
    onSnapToItem={(index) => setCurrentIndex(index)}
    renderItem={({ item }) => (
      <Image
        source={{ uri: `${imgurl}/${item?.image}` }}
        className="w-full h-[160px] rounded-2xl"  // ✅ same as carousel height
        resizeMode="stretch"                       // ✅ fills nicely inside
      />
    )}
  />

  {/* Pagination Dots */}
  <View className="flex-row justify-center mt-3">
    {bannerImage.map((_, index) => (
      <View
        key={index}
        className={`w-2.5 h-2.5 mx-1 rounded-full ${
          index === currentIndex
            ? 'bg-blue-500 opacity-100'
            : 'bg-gray-300 opacity-50'
        }`}
      />
    ))}
  </View>
</View>


<View className="mt-6">

  <View className="flex flex-row justify-between items-center px-5 mb-4">
    <Text className="text-xl font-bold text-gray-800">
      Categories
    </Text>
    <Link href="/(tab)/category" >
      <Text className="text-base font-medium text-primary-500">View All</Text>
    </Link>
  </View>

  
  <FlatList
    horizontal
    data={cat}
    keyExtractor={(item, index) => String(item.id || index)}
    showsHorizontalScrollIndicator={false}
    nestedScrollEnabled
    contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => handelcatagypress2(item.name)}
        className="items-center mr-3"
        activeOpacity={0.9}
      >
        <View className="bg-gray-100 p-[2px] rounded-2xl shadow-sm">
          <Image
            source={{ uri: `${imgurl}/${item.image}` }}
            height={80}
            width={80}
            className="rounded-xl"
          />
        </View>
        <Text className="mt-2 text-sm font-medium text-gray-700">
          {item.name}
        </Text>
      </TouchableOpacity>
    )}
  />
</View>

<View className='mt-6'>
 <View className="  flex flex-row justify-between items-center px-5 mb-4">
    <Text className="text-xl font-bold text-gray-800">
      Top Product
    </Text>
    <TouchableOpacity onPress={() => router.push("/(tab)/category")}>
      <Text className="text-base font-medium text-primary-500">View All</Text>
    </TouchableOpacity>
  </View>

  <FlatList
    horizontal
    data={allproduct}
    keyExtractor={(item, index) => String(item.id || index)}
    showsHorizontalScrollIndicator={false}
    nestedScrollEnabled
    contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 }}
    renderItem={({ item }) => (
      <ProductCard product={item} wid="w-44" />
    )}
  />

  <View>


  </View>
</View>

{/* <View className='mt-6'>
 <View className="flex flex-row justify-between items-center px-5 mb-4">
    <Text className="text-xl font-bold text-gray-800">
      Package
    </Text>
    <TouchableOpacity>
      <Text className="text-base font-medium text-primary-500">View All</Text>
    </TouchableOpacity>
  </View>

 <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    className="pl-5"
    contentContainerStyle={{paddingRight: 20}}
  >

{packageData.map((item,index)=>(
  <ComboProductCompo packageItem={item} key={index} />
))}


  </ScrollView>

  <View>


  </View>
</View> */}




  <View className="w-full mb-0 pb-0 mt-3">
      <Image
        source={BottomImage}
        className="w-full "
        style={{ height: width * 0.5,width:width}} // Adjust multiplier for desired aspect ratio
        resizeMode="contain"
      />
    </View>





  </ScrollView>

    </SafeAreaView>
  )
}