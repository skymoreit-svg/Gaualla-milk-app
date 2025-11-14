import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { baseurl, imgurl } from './allapi';
import axios from 'axios';


// import MilkImage from '../../assets/images/Gaualla10.webp'; 
// import GheeImage from '../../assets/images/Gaualla6.webp';
// import ButterImage from '../../assets/images/Gaualla5.webp'; 
// import SplMilkImage from '../../assets/images/Gaualla6.webp';



// const images = [
//   MilkImage,
//   GheeImage,
//   ButterImage,
//   SplMilkImage,

// ];

const screenWidth = Dimensions.get('window').width;
const DOT_SIZE = 10;  
const DOT_MARGIN = 6; 
const DOT_SPACING = DOT_SIZE + DOT_MARGIN; 

const MyCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
    const [bannerImage, setBannerImage] = useState([]);
  
  const carouselRef = useRef(null);
  const dotTranslateX = useRef(new Animated.Value(0)).current;
  const moveIndicator = (index) => {
    setCurrentIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });

    Animated.spring(dotTranslateX, {
      toValue: index * DOT_SPACING, 
      useNativeDriver: true,
    }).start();
  };

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
     fetchBanner();
},[])




  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop
        width={screenWidth}
        height={200}
        autoPlay={true}
        autoPlayInterval={3000}
        autoplayDelay={1000}
        data={bannerImage}
        onSnapToItem={moveIndicator} 
        renderItem={({ item }) => (
          <Image source={{ uri: `${imgurl}/${item?.image}` }} style={styles.image} resizeMode="cover" />
        )}
      />

    
      <View style={styles.paginationContainer}>
        {bannerImage.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => moveIndicator(index)}>
            <View style={styles.dot} />
          </TouchableOpacity>
        ))}

        
        <Animated.View
          style={[
            styles.activeDot,
            { transform: [{ translateX: dotTranslateX }] }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginTop: 15
  },
  image: {
    width: '94%',
    height: '100%',
    borderRadius: 6,
    margin: 'auto'
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderColor: '#53B175',
    marginHorizontal: DOT_MARGIN / 2, 
    borderWidth:1
  },
  activeDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#53B175',
    position: 'absolute',
    left: 3,
  },
});


export default MyCarousel;
