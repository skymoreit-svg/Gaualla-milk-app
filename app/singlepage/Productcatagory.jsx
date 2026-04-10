import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { baseurl, imgurl } from '../../allapi';
import ProductCard from '../Components/ProductCard';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import BottomImage from "../../assets/bannerimages/bottimg.png";
import Carousel from 'react-native-reanimated-carousel';
const { width } = Dimensions.get('window');

export default function Productcatagory() {
   const {categoryId}=  useLocalSearchParams();
   const [allproduct,setAllproduct]=useState();
     const [bannerImage, setBannerImage] = useState([]);
       const [currentIndex, setCurrentIndex] = useState(0);
     
   
     const username="Guest"
     const location= "Delhi"
   const router= useRouter()

   const fetch_product=async()=>{
    const response = await axios.get(`${baseurl}/getproduct/${categoryId}`)
    const data = response.data;
    console.log(data);
    if(data.success){
      setAllproduct(data.product)
    }

   }  
   const fetchBanner = async () => {
  try {
    const response = await axios.get(`${baseurl}/banner`);
    const data = response.data;
    if (data.success) {
      setBannerImage(data.banners); // assuming backend returns { success: true, banner: [...] }
    }
  } catch (err) {
    console.log("Banner fetch error:", err);
  }
};

   useEffect(()=>{
fetch_product()
fetchBanner()
   },[])


  return (
   <SafeAreaView className='flex-1 '>


<ScrollView className=''>  
  <View className='px-3'>
<View className='flex flex-row gap-1'>
  <Text className='font-semibold text-xl'>Hello</Text>
  <Text className='font-semibold text-green-600 text-xl'>{username},</Text>

</View>
<View className='flex flex-row gap-1 items-center'>
<MaterialIcons name="location-pin" size={23} color="#a61407" />
<Text className='font-semibold' >{location}</Text>
<EvilIcons name="chevron-down" size={24} color="green" className='mb-3' />


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
  <View className="flex-row justify-center mt-3 ">
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


<View className='flex-row flex-wrap justify-evenly mt-8'>
 {allproduct?.map((item,index)=>(
    <ProductCard product={item} key={index} wid="w-44"/>
 ))}
</View>

  <View className=' m-6 items-center w-full'>
  <TouchableOpacity onPress={()=>router.push("/(tab)")}  className='px-3 py-1 bg-green-600  font-bold rounded-lg' >
    <Text className='text-white'>Explore More</Text>
  </TouchableOpacity>
  </View>

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