import {
  FontAwesome,
  MaterialIcons,
  Ionicons,
} from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { baseurl } from '../../allapi';
import AddressForm from './AddressForm';

const Addresses = () => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [allAddress, setAllAddress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchaddress = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/get`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      if (data.success) {
        setAllAddress(data.addresses);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchaddress();
  }, []);

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddr(null);
    fetchaddress();
  };

  const handleEdit = (addr) => {
    setEditingAddr(addr);
    setShowForm(true);
  };

  const handleDelete = (addr) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this ${addr.address_type} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('authToken');
              const res = await axios.delete(`${baseurl}/address/delete/${addr.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.data.success) {
                fetchaddress();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handelDefault = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await axios.get(`${baseurl}/address/update/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        fetchaddress();
      }
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  const getTagIcon = (type) => {
    if (type === 'home') return 'home';
    if (type === 'office') return 'briefcase';
    return 'map-marker';
  };

  const getTagColor = (type) => {
    if (type === 'home') return '#6d4c41';
    if (type === 'office') return '#3b82f6';
    return '#8b5cf6';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#3e2723" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Delivery Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Ionicons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ) : null}

        {!showForm ? (
          <>
            {/* Elegant Add Address Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => { setEditingAddr(null); setShowForm(true); }}
              activeOpacity={0.9}
            >
              <FontAwesome name="plus" size={14} color="white" />
              <Text style={styles.addButtonText}>ADD NEW ADDRESS</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#6d4c41" style={{ marginTop: 40 }} />
            ) : allAddress.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <FontAwesome name="map-marker" size={32} color="#a1887f" />
                </View>
                <Text style={styles.emptyTitle}>No Addresses Saved</Text>
                <Text style={styles.emptySubtitle}>Please add your delivery coordinates to start subscribing to daily milk packs.</Text>
              </View>
            ) : (
              allAddress.map((addr) => (
                <View
                  key={addr.id}
                  style={[
                    styles.card,
                    addr.is_default ? styles.cardDefault : styles.cardRegular,
                  ]}
                >
                  {/* Tag + Default Star */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.tag, { backgroundColor: getTagColor(addr.address_type) + '12' }]}>
                      <FontAwesome name={getTagIcon(addr.address_type)} size={11} color={getTagColor(addr.address_type)} />
                      <Text style={[styles.tagText, { color: getTagColor(addr.address_type) }]}>
                        {addr.address_type}
                      </Text>
                    </View>
                    
                    {addr.is_default ? (
                      <View style={styles.defaultBadge}>
                        <MaterialIcons name="star" size={14} color="#b45309" />
                        <Text style={styles.defaultText}>Default Address</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handelDefault(addr.id)}
                        style={styles.setDefaultBtn}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="star-border" size={14} color="#9ca3af" />
                        <Text style={styles.setDefaultText}>Set default</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Address Lines */}
                  <Text style={styles.addressMain}>{addr.street}</Text>
                  {addr.landmark ? (
                    <View style={styles.landmarkContainer}>
                      <Text style={styles.landmarkLabel}>Landmark: </Text>
                      <Text style={styles.addressSub}>{addr.landmark}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.addressSub}>
                    {addr.city}, {addr.state} - {addr.zip_code}
                  </Text>
                  <Text style={styles.addressSub}>{addr.country}</Text>

                  {/* Action Buttons */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => handleEdit(addr)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="edit" size={14} color="#6d4c41" />
                      <Text style={[styles.actionText, { color: '#6d4c41' }]}>Edit Details</Text>
                    </TouchableOpacity>

                    <View style={styles.actionSeparator} />

                    <TouchableOpacity
                      onPress={() => handleDelete(addr)}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete-outline" size={14} color="#ef4444" />
                      <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <AddressForm onCancel={handleCancelForm} editAddress={editingAddr} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFC8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f5ede8',
    elevation: 2,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3e2723',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f5ede8',
    borderRadius: 24,
    marginTop: 20,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  emptyTitle: {
    color: '#3e2723',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#6d4c41',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 220,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardDefault: {
    backgroundColor: '#fffdfb',
    borderColor: '#fde68a',
  },
  cardRegular: {
    backgroundColor: '#ffffff',
    borderColor: '#f5ede8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#fde68a',
  },
  defaultText: {
    fontSize: 9,
    color: '#b45309',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginLeft: 3,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    marginLeft: 4,
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  landmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  landmarkLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  addressSub: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5ede8',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  actionSeparator: {
    width: 1,
    height: 14,
    backgroundColor: '#f5ede8',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default Addresses;
