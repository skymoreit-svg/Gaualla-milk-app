import { Tabs } from 'expo-router';
import { ClipboardList, Home, LayoutGrid, ShoppingCart, User } from 'lucide-react-native';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom : 6,
          alignSelf: 'center',
          width: width - 32,
          marginHorizontal: 16,
          marginLeft: 16,
          marginRight: 16,
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: '#ffffff',
          borderRadius: 32,
          borderWidth: 1,
          borderColor: 'rgba(243, 244, 246, 0.9)',
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        },
        tabBarActiveTintColor: '#6d4c41', // primary-600
        tabBarInactiveTintColor: '#9ca3af', // gray-400
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center flex-1 w-full h-full">
              <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name='category'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center flex-1 w-full h-full">
              <LayoutGrid size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name='cart'
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                top: -18,
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#6d4c41',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 10,
                shadowColor: '#6d4c41',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                borderWidth: 4,
                borderColor: '#ffffff',
              }}
            >
              <ShoppingCart size={26} color="#ffffff" strokeWidth={focused ? 2.8 : 2.2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name='order'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center flex-1 w-full h-full">
              <ClipboardList size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name='profile'
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center flex-1 w-full h-full">
              <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
