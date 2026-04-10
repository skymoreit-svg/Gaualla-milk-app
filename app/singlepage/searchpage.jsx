import { View, TextInput, TouchableOpacity, Image, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { baseurl, imgurl } from '../../allapi'
import { useRouter } from 'expo-router'


export default function searchPage() {
  const [query, setQuery] = useState("")
  const [searchData, setSearchData] = useState([])
const router=useRouter();
  const handleSearch = async () => {
    if (query.length > 1 ) {
      try {
        const response = await axios.get(`${baseurl}/getproduct/product/search/${query}`)
        const data = response.data
        if (data.success) {
          setSearchData(data.data) // ✅ update state
        } else {
          setSearchData([])
        }
      } catch (error) {
        console.error("Search error:", error)
      }
    } else {
      setSearchData([]) // clear results when query too short
    }
  }

  useEffect(() => {
    handleSearch()
  }, [query])

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-4 pt-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Search products..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Section */}
      <ScrollView className="mt-5">
        {searchData?.length > 0 ? (
          searchData.map((product, index) => {
            let imageUrl = null
            try {
              // ✅ handle both JSON string & array
              const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images
              imageUrl = `${imgurl}/${images?.[0]}`
            } catch (err) {
              console.log("Image parse error:", err)
            }

            return (
              <TouchableOpacity
              onPress={()=>router.push(`/singlepage/${product.slug}`)}
                key={index}
                className="flex-row items-center bg-white rounded-lg p-3 mb-3 shadow-sm"
              >
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-16 h-16 rounded-md mr-3"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-gray-800 font-medium">{product.name}</Text>
              </TouchableOpacity>
            )
          })
        ) : query.length > 2 ? (
          <Text className="text-center text-gray-500 mt-5">No results found</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
