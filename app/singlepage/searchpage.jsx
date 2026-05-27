import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import axios from 'axios'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { baseurl, imgurl } from '../../allapi'

const trendingSearches = [
  { id: 1, label: "🥛 A2 Gir Cow Milk", query: "A2" },
  { id: 2, label: "🏺 Premium A2 Ghee", query: "A2 Ghee" },
  { id: 3, label: "🥣 Vedic Dahi", query: "Dahi" },
  { id: 4, label: "🧀 Soft Paneer", query: "Paneer" },
  { id: 5, label: "🥤 Refreshing Lassi", query: "Lassi" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [searchData, setSearchData] = useState([])
  const router = useRouter();

  const handleSearch = async () => {
    if (query.length > 1) {
      try {
        const response = await axios.get(`${baseurl}/getproduct/product/search/${query}`)
        const data = response.data
        if (data.success) {
          setSearchData(data.data)
        } else {
          setSearchData([])
        }
      } catch (error) {
        console.error("Search error:", error)
      }
    } else {
      setSearchData([])
    }
  }

  useEffect(() => {
    handleSearch()
  }, [query])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6EFC8' }} edges={['top', 'left', 'right']}>
      {/* 🔍 Premium Header & Search Bar Container */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, pb: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8', marginRight: 12 }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#3e2723" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#1f2937', letterSpacing: -0.5 }}>
            Discover Products
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf8f6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#f0e0d8' }}>
          <Feather name="search" size={18} color="#6d4c41" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: '#3e2723', fontWeight: '500', padding: 0 }}
            placeholder="Search farm fresh milk, paneer, ghee..."
            placeholderTextColor="#a1887f"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={18} color="#a1887f" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* ✨ Trending / Popular Suggestions (Shown when query is empty) */}
        {query.length === 0 ? (
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Feather name="trending-up" size={16} color="#6d4c41" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#6d4c41', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Trending Searches
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {trendingSearches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setQuery(item.query)}
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#f5ede8',
                    shadowColor: '#3e2723',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    elevation: 2
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#4b5563' }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Benefits Banner */}
            <View style={{ marginTop: 24, backgroundColor: '#fdf6f3', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f0e0d8', alignItems: 'center' }}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🥛</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#3e2723', textTransform: 'uppercase', tracking: 0.5, marginBottom: 4 }}>
                100% Traceable Purity
              </Text>
              <Text style={{ fontSize: 12, color: '#6d4c41', textAlign: 'center', lineHeight: 18, maxWidth: 240 }}>
                Type any item to explore our pristine farm-to-glass milk, paneer, and local dairy collection.
              </Text>
            </View>
          </View>
        ) : searchData?.length > 0 ? (
          /* 📦 Search Results */
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
              Found {searchData.length} matching products
            </Text>

            {searchData.map((product, index) => {
              let imageUrl = null
              try {
                const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images
                imageUrl = `${imgurl}/${images?.[0]}`
              } catch (err) {
                console.log("Image parse error:", err)
              }

              return (
                <TouchableOpacity
                  onPress={() => router.push(`/singlepage/${product.slug}`)}
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#f5ede8',
                    shadowColor: '#3e2723',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 3
                  }}
                  activeOpacity={0.85}
                >
                  {/* Product Thumbnail Container */}
                  <View style={{
                    width: 72,
                    height: 72,
                    borderRadius: 14,
                    backgroundColor: '#fdf6f3',
                    borderWidth: 1,
                    borderColor: '#f0e0d8',
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14
                  }}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={{ fontSize: 26 }}>🥛</Text>
                    )}
                  </View>

                  {/* Info details */}
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 4 }} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#6d4c41' }}>
                        ₹{product.price}
                      </Text>
                      {product.old_price && (
                        <Text style={{ fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through', marginLeft: 8 }}>
                          ₹{product.old_price}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Arrow Indicator */}
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f0e0d8' }}>
                    <Feather name="chevron-right" size={16} color="#6d4c41" />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : query.length > 2 ? (
          /* 🚫 Empty State */
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40, backgroundColor: '#fff', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fdf6f3', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#f0e0d8' }}>
              <Feather name="search" size={32} color="#a1887f" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#3e2723', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              No Products Found
            </Text>
            <Text style={{ fontSize: 12, color: '#6d4c41', textAlign: 'center', marginBottom: 20, lineHeight: 18, maxWidth: 200 }}>
              We couldn't find anything matching "{query}". Try looking for milk, paneer, or ghee.
            </Text>
            <TouchableOpacity
              onPress={() => setQuery("")}
              style={{ backgroundColor: '#3e2723', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              activeOpacity={0.9}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>CLEAR SEARCH</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
