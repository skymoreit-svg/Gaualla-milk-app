import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function ComboProductCompo({ packageItem }) {
  return (
    <View className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden mr-4 border border-gray-100">
      {/* Package Image with Badges */}
      <View className="relative">
        <Image 
          source={{ uri: packageItem.image }} 
          className="w-full h-40" 
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity className="absolute top-2 right-2 bg-white/90 p-2 rounded-full">
          <AntDesign name="hearto" size={16} color="#ef4444" />
        </TouchableOpacity>
        
        {/* Discount Badge */}
        {packageItem.oldPrice && (
          <View className="absolute bottom-2 left-2 bg-red-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              {Math.round(((packageItem.oldPrice - packageItem.newPrice) / packageItem.oldPrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>

      {/* Package Info */}
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={1}>
          {packageItem.title}
        </Text>
        
        {/* Included Items */}
        <View className="flex-row flex-wrap items-center mb-2">
          {packageItem.itemsIncluded.map((item, index) => (
            <View key={index} className="flex-row items-center">
              {index !== 0 && (
                <Text className="text-gray-400 mx-1">•</Text>
              )}
              <Text className="text-xs text-gray-600" numberOfLines={1}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Price and Add to Cart */}
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-baseline">
            <Text className="text-lg font-bold text-gray-900">
              ₹{packageItem.newPrice}
            </Text>
            {packageItem.oldPrice && (
              <Text className="text-xs text-gray-400 line-through ml-2">
                ₹{packageItem.oldPrice}
              </Text>
            )}
          </View>
          
          <TouchableOpacity className="bg-green-500 rounded-lg px-3 py-1 flex-row items-center">
            <MaterialIcons name="add-shopping-cart" size={16} color="white" />
            <Text className="text-white text-sm font-medium ml-1">Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}