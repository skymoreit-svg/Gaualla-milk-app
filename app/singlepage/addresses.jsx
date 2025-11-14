import {
  FontAwesome,
  MaterialIcons
} from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { baseurl } from '../Components/allapi';
import AddressForm from './AddressForm';

const addresses = () => {
  const router = useRouter();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [error, setError] = useState('');

  const [allAddress, setAllAddress] = useState([]);
  const [defaultAddress, setDefaultAddressState] = useState(null);
  const [loading, setLoading] = useState(true);
 

 

  const fetchaddress = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      if (data.success) {
        setAllAddress(data.addresses);
        const defaultAddr = data.addresses.find((addr) => addr.is_default === 1);

        if (defaultAddr) {
          setDefaultAddressState(defaultAddr.id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  
      fetchaddress();
   
  }, [ ]);

  const handleCancelForm = () => {
    setShowNewAddress(false);
    fetchaddress();
  };

  const handelDefault = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/update/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      if (data.success) {
        fetchaddress();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {error ? (
          <View style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={20} color="red" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Text style={styles.errorClose}>&times;</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.contentContainer}>
          <View style={styles.mainSection}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome name="map-marker" size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}> Address</Text>
              </View>

              {!showNewAddress ? (
                <>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={() => setShowNewAddress(true)}
                  >
                    <FontAwesome name="plus" size={16} color="white" />
                    <Text style={styles.addAddressText}>Add New Address</Text>
                  </TouchableOpacity>

                  {loading ? (
                    <ActivityIndicator
                      size="large"
                      color="#3b82f6"
                      style={styles.loader}
                    />
                  ) : (
                    <View style={styles.addressList}>
                      {allAddress.length > 0 ? (
                        allAddress.map((addr) => (
                          <View
                            key={addr.id}
                            style={[
                              styles.addressCard,
                              addr.is_default
                                ? styles.defaultAddressCard
                                : styles.regularAddressCard,
                            ]}
                          >
                            <View style={styles.addressHeader}>
                              <View style={styles.addressType}>
                                {addr.address_type === 'home' ? (
                                  <FontAwesome
                                    name="home"
                                    size={16}
                                    color="#3b82f6"
                                  />
                                ) : (
                                  <FontAwesome
                                    name="building"
                                    size={16}
                                    color="#10b981"
                                  />
                                )}
                                <Text style={styles.addressTypeText}>
                                  {addr.address_type}
                                </Text>
                              </View>
                              {addr.is_default ? (
                                <MaterialIcons
                                  name="star"
                                  size={20}
                                  color="#f59e0b"
                                />
                              ) : (
                                <MaterialIcons
                                  name="star-border"
                                  size={20}
                                  color="#9ca3af"
                                  onPress={() => handelDefault(addr.id)}
                                />
                              )}
                            </View>

                            <Text style={styles.addressName}>
                              {addr.first_name} {addr.last_name}
                            </Text>
                            <Text style={styles.addressText}>
                              {addr.street}, {addr.city}
                            </Text>
                            <Text style={styles.addressText}>
                              {addr.state}, {addr.zip_code}
                            </Text>
                            <Text style={styles.addressText}>{addr.country}</Text>
                            <Text style={styles.phoneText}>📞 {addr.phone}</Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.emptyAddress}>
                          <FontAwesome
                            name="map-marker"
                            size={40}
                            color="#9ca3af"
                          />
                          <Text style={styles.emptyAddressText}>
                            No addresses saved yet.
                          </Text>
                          <Text style={styles.emptyAddressSubtext}>
                            Please add an address to continue with your order.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              ) : (
               
                <AddressForm onCancel={handleCancelForm} />
              )}
            </View>
          </View>

        
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
  errorClose: {
    color: '#dc2626',
    fontSize: 20,
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
  },
  mainSection: {
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 12,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#60BE74',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addAddressText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  loader: {
    padding: 40,
  },
  addressList: {
    marginTop: 8,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  defaultAddressCard: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
  },
  regularAddressCard: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTypeText: {
    textTransform: 'capitalize',
    color: '#6b7280',
    marginLeft: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  addressText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2,
  },
  phoneText: {
    color: '#374151',
    marginTop: 4,
  },
  emptyAddress: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  emptyAddressText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  },
  emptyAddressSubtext: {
    color: '#9ca3af',
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
    marginBottom: 16,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  productQuantity: {
    color: '#6b7280',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  priceBreakdown: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    color: '#6b7280',
  },
  priceValue: {
    color: '#374151',
  },
  freeShipping: {
    color: '#10b981',
    fontWeight: '500',
  },
  oneTimeBadge: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  oneTimeText: {
    color: '#1e40af',
    fontWeight: '500',
  },
  frequencySelector: {
    marginBottom: 16,
  },
  selectorLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  frequencyButtonDefault: {
    backgroundColor: '#f3f4f6',
  },
  frequencyButtonSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderWidth: 1,
  },
  frequencyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyButtonTextDefault: {
    color: '#6b7280',
  },
  frequencyButtonTextSelected: {
    color: '#166534',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeOrderButton: {
    backgroundColor: '#60BE74',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noOrderText: {
    color: '#6b7280',
    textAlign: 'center',
    padding: 40,
  },
});

export default addresses;