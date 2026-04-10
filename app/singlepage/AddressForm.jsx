import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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
import * as Location from 'expo-location';
import { baseurl } from '../../allapi';

const PLACEHOLDER_COLOR = '#9ca3af';
const ADDRESS_TAGS = ['home', 'office', 'other'];

const AddressForm = ({ onCancel, editAddress }) => {
  const isEditing = !!editAddress;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    street: editAddress?.street || '',
    landmark: editAddress?.landmark || '',
    city: editAddress?.city || '',
    state: editAddress?.state || '',
    zip_code: editAddress?.zip_code || '',
    country: editAddress?.country || 'India',
    address_type: editAddress?.address_type || 'home',
    is_default: editAddress?.is_default || 0,
    latitude: editAddress?.latitude || null,
    longitude: editAddress?.longitude || null,
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to auto-fill your address.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;

      const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        city: place?.city || place?.district || prev.city,
        state: place?.region || prev.state,
        zip_code: place?.postalCode || prev.zip_code,
        street: place?.street || place?.name || prev.street,
      }));
    } catch (err) {
      console.log("Location fetch error:", err);
      Alert.alert('Error', 'Could not fetch location. Please enter address manually.');
    } finally {
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      fetchCurrentLocation();
    }
  }, []);

  const handleAddressSubmit = async () => {
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zip_code.trim()) {
      Alert.alert('Validation', 'Please fill Street, City, State and ZIP Code.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = await SecureStore.getItemAsync('authToken');
      const payload = {
        ...formData,
        first_name: '-',
        last_name: '-',
        phone: '-',
      };

      let response;
      if (isEditing) {
        response = await axios.put(`${baseurl}/address/edit/${editAddress.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post(`${baseurl}/address/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = response.data;
      if (data.success) {
        onCancel();
      } else {
        setError(data.message || 'Failed to save address');
        Alert.alert('Error', data.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError('An error occurred while saving the address.');
      Alert.alert('Error', 'An error occurred while saving the address.');
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
      <Text className="text-xl font-bold text-gray-800 mb-2">
        {isEditing ? "Edit Address" : "Add New Address"}
      </Text>

      {/* Use My Location Button */}
      <TouchableOpacity
        onPress={fetchCurrentLocation}
        disabled={fetchingLocation}
        className="flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4"
      >
        {fetchingLocation ? (
          <ActivityIndicator size={16} color="#3b82f6" />
        ) : (
          <MaterialIcons name="my-location" size={18} color="#3b82f6" />
        )}
        <Text className="ml-2 text-blue-600 font-medium">
          {fetchingLocation ? "Fetching location..." : "Use My Current Location"}
        </Text>
      </TouchableOpacity>

      <ScrollView className="mb-4" keyboardShouldPersistTaps="handled">
        {/* Street */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <FontAwesome name="home" size={16} color="#9ca3af" style={{ paddingLeft: 12 }} />
          <TextInput
            className="flex-1 p-3 text-gray-800"
            placeholder="House / Flat / Street Address"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.street}
            onChangeText={(value) => handleChange("street", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* Landmark */}
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white mb-4">
          <MaterialIcons name="place" size={16} color="#9ca3af" style={{ paddingLeft: 12 }} />
          <TextInput
            className="flex-1 p-3 text-gray-800"
            placeholder="Landmark (optional)"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.landmark}
            onChangeText={(value) => handleChange("landmark", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* City & State */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 mr-2">
            <FontAwesome name="building" size={16} color="#9ca3af" style={{ paddingLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-gray-800"
              placeholder="City"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.city}
              onChangeText={(value) => handleChange("city", value)}
              editable={!isSubmitting}
            />
          </View>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 ml-2">
            <MaterialIcons name="location-city" size={16} color="#9ca3af" style={{ paddingLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-gray-800"
              placeholder="State"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.state}
              onChangeText={(value) => handleChange("state", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* ZIP Code & Country */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 mr-2">
            <MaterialCommunityIcons name="numeric" size={18} color="#9ca3af" style={{ paddingLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-gray-800"
              placeholder="ZIP Code"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.zip_code}
              onChangeText={(value) => handleChange("zip_code", value)}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>
          <View className="flex-row items-center border border-gray-300 rounded-lg bg-white flex-1 ml-2">
            <FontAwesome name="globe" size={16} color="#9ca3af" style={{ paddingLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-gray-800"
              placeholder="Country"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.country}
              onChangeText={(value) => handleChange("country", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Address Tag */}
        <Text className="text-gray-700 font-medium mb-2">Save as</Text>
        <View className="flex-row mb-4">
          {ADDRESS_TAGS.map((tag) => {
            const isSelected = formData.address_type === tag;
            const icon = tag === 'home' ? 'home' : tag === 'office' ? 'briefcase' : 'map-marker';
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => handleChange('address_type', tag)}
                className={`flex-row items-center mr-3 px-4 py-2.5 rounded-full border ${
                  isSelected
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-300'
                }`}
              >
                <FontAwesome
                  name={icon}
                  size={14}
                  color={isSelected ? '#fff' : '#6b7280'}
                />
                <Text
                  className={`ml-2 font-medium capitalize ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
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
            className={`flex-1 mx-1 py-3 rounded-lg items-center bg-blue-500 ${isSubmitting ? "opacity-60" : ""}`}
            onPress={handleAddressSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {isEditing ? "Update Address" : "Save Address"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 mx-1 py-3 rounded-lg items-center bg-gray-200 ${isSubmitting ? "opacity-60" : ""}`}
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
