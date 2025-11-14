import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 8,
        },
        tabBarActiveTintColor: '#16a34a', // green-600
        tabBarInactiveTintColor: '#9ca3af', // gray-400
      }}
    >
      <Tabs.Screen 
        name='index'
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="items-center justify-center">
              <AntDesign name="home" size={24} color={color} />
            </View>
          ),
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen 
        name='category'
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="items-center justify-center">
              <MaterialIcons name="category" size={24} color={color} />
            </View>
          ),
          tabBarLabel: "Category",
        }}
      />

      <Tabs.Screen 
        name='cart'
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="items-center justify-center">
              <FontAwesome name="opencart" size={22} color={color} />
            </View>
          ),
          tabBarLabel: "Cart",
        }}
      />

      <Tabs.Screen 
        name='order'
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="items-center justify-center">
              <FontAwesome6 name="clipboard-list" size={22} color={color} />
            </View>
          ),
          tabBarLabel: "Orders",
        }}
      />

      <Tabs.Screen 
        name='profile'
        options={{
          tabBarIcon: ({ color, size }) => (
            <View className="items-center justify-center">
              <FontAwesome name="user" size={22} color={color} />
            </View>
          ),
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  )
}