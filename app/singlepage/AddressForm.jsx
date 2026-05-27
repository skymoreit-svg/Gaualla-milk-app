import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { baseurl } from '../../allapi';

const PLACEHOLDER_COLOR = '#a1887f';
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

      const streetParts = [
        place?.formattedAddress,
        place?.name,
        place?.streetNumber,
        place?.street,
        place?.subregion,
        place?.district,
        place?.city,
        place?.region,
        place?.country
      ].filter(Boolean);

      const uniqueStreetParts = [...new Set(streetParts)];
      const filteredParts = uniqueStreetParts.filter((part, index, self) =>
        !self.some((other, otherIndex) => index !== otherIndex && other.includes(part))
      );

      const detailedStreet = place?.formattedAddress || filteredParts.join(', ') || prev.street;

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        city: place?.city || place?.district || prev.city,
        state: place?.region || prev.state,
        zip_code: place?.postalCode || prev.zip_code,
        street: detailedStreet,
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
      Alert.alert('Validation Error', 'Please fill Street, City, State and ZIP Code.');
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
    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f5ede8', shadowColor: '#3e2723', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 }}>
      {/* Back Button Link */}
      <TouchableOpacity
        onPress={onCancel}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={16} color="#6d4c41" />
        <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: '700', color: '#6d4c41' }}>Back to addresses</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={{ fontSize: 18, fontWeight: '950', color: '#1f2937', marginBottom: 14 }}>
        {isEditing ? "Edit Delivery Address" : "New Delivery Address"}
      </Text>

      {/* Use My Location Button */}
      <TouchableOpacity
        onPress={fetchCurrentLocation}
        disabled={fetchingLocation || isSubmitting}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fdf6f3',
          borderWidth: 1,
          borderColor: '#f0e0d8',
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: 20,
        }}
        activeOpacity={0.8}
      >
        {fetchingLocation ? (
          <ActivityIndicator size={16} color="#6d4c41" style={{ marginRight: 8 }} />
        ) : (
          <MaterialIcons name="my-location" size={16} color="#6d4c41" style={{ marginRight: 8 }} />
        )}
        <Text style={{ color: '#3e2723', fontWeight: '800', fontSize: 13 }}>
          {fetchingLocation ? "LOCATING DETAILED PATH..." : "USE MY CURRENT LOCATION"}
        </Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Street */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', marginBottom: 14, paddingHorizontal: 12 }}>
          <FontAwesome name="home" size={16} color="#a1887f" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
            placeholder="House / Flat / Street Address"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.street}
            onChangeText={(value) => handleChange("street", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* Landmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', marginBottom: 14, paddingHorizontal: 12 }}>
          <MaterialIcons name="place" size={16} color="#a1887f" />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
            placeholder="Landmark (optional)"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.landmark}
            onChangeText={(value) => handleChange("landmark", value)}
            editable={!isSubmitting}
          />
        </View>

        {/* City & State */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          {/* City */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', paddingHorizontal: 12 }}>
            <FontAwesome name="building" size={14} color="#a1887f" />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
              placeholder="City"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.city}
              onChangeText={(value) => handleChange("city", value)}
              editable={!isSubmitting}
            />
          </View>
          {/* State */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', paddingHorizontal: 12 }}>
            <MaterialIcons name="location-city" size={16} color="#a1887f" />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
              placeholder="State"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.state}
              onChangeText={(value) => handleChange("state", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* ZIP Code & Country */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
          {/* ZIP */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="numeric" size={16} color="#a1887f" />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
              placeholder="ZIP Code"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.zip_code}
              onChangeText={(value) => handleChange("zip_code", value)}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          </View>
          {/* Country */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#f0e0d8', borderRadius: 14, backgroundColor: '#fdf8f6', paddingHorizontal: 12 }}>
            <FontAwesome name="globe" size={14} color="#a1887f" />
            <TextInput
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#3e2723', fontWeight: '500' }}
              placeholder="Country"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={formData.country}
              onChangeText={(value) => handleChange("country", value)}
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Address Tag Selector */}
        <Text style={{ fontSize: 12, fontWeight: '750', color: '#6d4c41', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Save address as</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          {ADDRESS_TAGS.map((tag) => {
            const isSelected = formData.address_type === tag;
            const icon = tag === 'home' ? 'home' : tag === 'office' ? 'briefcase' : 'map-marker';
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => handleChange('address_type', tag)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  backgroundColor: isSelected ? '#3e2723' : '#fff',
                  borderColor: isSelected ? '#3e2723' : '#f0e0d8',
                }}
                activeOpacity={0.8}
              >
                <FontAwesome
                  name={icon}
                  size={12}
                  color={isSelected ? '#fff' : '#6b7280'}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: '700',
                    color: isSelected ? '#white' : '#6b7280',
                    color: isSelected ? '#fff' : '#6b7280',
                    textTransform: 'capitalize',
                  }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Default Address Switch Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fdf8f6', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#f0e0d8', marginBottom: 20 }}>
          <Text style={{ fontSize: 13, color: '#3e2723', fontWeight: '700' }}>Set as default delivery address</Text>
          <Switch
            value={formData.is_default === 1}
            onValueChange={(value) => handleChange("is_default", value ? 1 : 0)}
            disabled={isSubmitting}
            trackColor={{ false: "#d1d5db", true: "#fde68a" }}
            thumbColor={formData.is_default === 1 ? "#fbbf24" : "#f4f3f4"}
          />
        </View>

        {/* Error Alert Box */}
        {error ? (
          <View style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <Text style={{ color: '#b91c1c', fontSize: 13, fontWeight: '600' }}>{error}</Text>
          </View>
        ) : null}

        {/* Action Buttons Pairing */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              backgroundColor: '#3e2723',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting ? 0.6 : 1,
              elevation: 2,
              shadowColor: '#3e2723',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6
            }}
            onPress={handleAddressSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>
                {isEditing ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 48,
              borderRadius: 14,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              opacity: isSubmitting ? 0.6 : 1
            }}
            onPress={onCancel}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#4b5563', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddressForm;
