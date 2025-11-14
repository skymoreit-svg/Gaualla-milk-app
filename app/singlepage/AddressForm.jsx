import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Switch,
} from 'react-native';
import {
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { baseurl } from '../Components/allapi';

const AddressForm = ({ onCancel }) => {
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    address_type: 'home',
    is_default: 0,
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const token = await SecureStore.getItemAsync('authToken');
      let response;
      
      if (editingAddress) {
        response = await axios.put(
          `${baseurl}/address/${editingAddress.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${baseurl}/address/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      const data = response.data;
      if (data.success) {
        setFormData({
          first_name: '',
          last_name: '',
          gender: '',
          email: '',
          phone: '',
          street: '',
          landmark: '',
          city: '',
          state: '',
          zip_code: '',
          country: 'India',
          address_type: 'home',
          is_default: 0,
        });
        onCancel();
      } else {
        setError(data.message || 'Failed to save address');
        Alert.alert('Error', data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setError('An error occurred while saving the address. Please try again.');
      Alert.alert('Error', 'An error occurred while saving the address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <View className="bg-gray-50 p-4 rounded-xl">
      {/* Back Button */}
      <TouchableOpacity onPress={onCancel} className="flex-row items-center mb-4">
        <Ionicons name="arrow-back" size={20} color="#4b5563" />
        <Text className="ml-2 text-gray-600">Back to addresses</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-xl font-bold text-gray-800 mb-4">
        {editingAddress ? "Edit Address" : "Add New Address"}
      </Text>

      <ScrollView className="mb-4">
        {/* First & Last Name */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 mr-2">
            <FontAwesome name="user" size={16} color="#9ca3af" className="p-3" />
            <TextInput
              className="flex-1 p-3"
              placeholder="First Name"
              value={formData.first_name}
              onChangeText={(value) => handleChange("first_name", value)}
              editable={!isSubmitting}
            />
          </View>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 ml-2">
            <FontAwesome name="user" size={16} color="#9ca3af" className="p-3" />
            <TextInput
              className="flex-1 p-3"
              placeholder="Last Name"
              value={formData.last_name}
              onChangeText={(value) => handleChange("last_name", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Gender + Email */}
        <View className="flex-row justify-between mb-4">
          <View className="border border-gray-300 rounded-lg bg-white flex-1 mr-2">
            <TextInput
              className="p-3"
              placeholder="Gender"
              value={formData.gender}
              onChangeText={(value) => handleChange("gender", value)}
              editable={!isSubmitting}
            />
          </View>
          <TextInput
            className="border border-gray-300 rounded-lg bg-white flex-1 ml-2 p-3"
            placeholder="Email (optional)"
            value={formData.email}
            onChangeText={(value) => handleChange("email", value)}
            keyboardType="email-address"
            editable={!isSubmitting}
          />
        </View>

        {/* Phone */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <FontAwesome name="phone" size={16} color="#9ca3af" className="p-3" />
          <TextInput
            className="flex-1 p-3"
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleChange("phone", value)}
            keyboardType="phone-pad"
            editable={!isSubmitting}
          />
        </View>

        {/* Street */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <FontAwesome name="home" size={16} color="#9ca3af" className="p-3" />
          <TextInput
            className="flex-1 p-3"
            placeholder="Street Address"
            value={formData.street}
            onChangeText={(value) => handleChange("street", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* Landmark */}
        <TextInput
          className="border border-gray-300 rounded-lg bg-white mb-4 p-3"
          placeholder="Landmark (optional)"
          value={formData.landmark}
          onChangeText={(value) => handleChange("landmark", value)}
          editable={!isSubmitting}
        />

        {/* City & State */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 mr-2">
            <FontAwesome name="building" size={16} color="#9ca3af" className="p-3" />
            <TextInput
              className="flex-1 p-3"
              placeholder="City"
              value={formData.city}
              onChangeText={(value) => handleChange("city", value)}
              editable={!isSubmitting}
            />
          </View>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 ml-2">
            <MaterialIcons name="location-city" size={16} color="#9ca3af" className="p-3" />
            <TextInput
              className="flex-1 p-3"
              placeholder="State"
              value={formData.state}
              onChangeText={(value) => handleChange("state", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* ZIP Code */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <MaterialCommunityIcons name="email-check" size={16} color="#9ca3af" className="p-3" />
          <TextInput
            className="flex-1 p-3"
            placeholder="ZIP Code"
            value={formData.zip_code}
            onChangeText={(value) => handleChange("zip_code", value)}
            keyboardType="numeric"
            editable={!isSubmitting}
          />
        </View>

        {/* Country */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <FontAwesome name="globe" size={16} color="#9ca3af" className="p-3" />
          <TextInput
            className="flex-1 p-3"
            placeholder="Country"
            value={formData.country}
            onChangeText={(value) => handleChange("country", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* Address Type */}
        <View className="border border-gray-300 rounded-lg bg-white mb-4">
          <TextInput
            className="p-3"
            placeholder="Address Type"
            value={formData.address_type}
            onChangeText={(value) => handleChange("address_type", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* Default Address Switch */}
        <View className="flex-row items-center mb-4">
          <Switch
            value={formData.is_default === 1}
            onValueChange={(value) => handleChange("is_default", value ? 1 : 0)}
            disabled={isSubmitting}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={formData.is_default === 1 ? "#3b82f6" : "#f4f3f4"}
          />
          <Text className="ml-2 text-gray-800">Set as default address</Text>
        </View>

        {/* Error */}
        {error ? (
          <View className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <Text className="text-red-600">{error}</Text>
          </View>
        ) : null}

        {/* Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            className={`flex-1 mx-1 py-3 rounded-lg items-center ${isSubmitting ? "opacity-60" : "bg-blue-500"}`}
            onPress={handleAddressSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {editingAddress ? "Update Address" : "Save Address"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 mx-1 py-3 rounded-lg items-center ${isSubmitting ? "opacity-60" : "bg-gray-200"}`}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text className="text-gray-800 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};



export default AddressForm;