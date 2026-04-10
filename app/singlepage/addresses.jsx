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
    if (type === 'home') return '#3b82f6';
    if (type === 'office') return '#10b981';
    return '#8b5cf6';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => { setEditingAddr(null); setShowForm(true); }}
            >
              <FontAwesome name="plus" size={14} color="white" />
              <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
            ) : allAddress.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome name="map-marker" size={40} color="#d1d5db" />
                <Text style={styles.emptyTitle}>No addresses saved</Text>
                <Text style={styles.emptySubtitle}>Add an address to get started</Text>
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
                    <View style={[styles.tag, { backgroundColor: getTagColor(addr.address_type) + '15' }]}>
                      <FontAwesome name={getTagIcon(addr.address_type)} size={12} color={getTagColor(addr.address_type)} />
                      <Text style={[styles.tagText, { color: getTagColor(addr.address_type) }]}>
                        {addr.address_type}
                      </Text>
                    </View>
                    {addr.is_default ? (
                      <View style={styles.defaultBadge}>
                        <MaterialIcons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handelDefault(addr.id)}
                        style={styles.setDefaultBtn}
                      >
                        <MaterialIcons name="star-border" size={16} color="#9ca3af" />
                        <Text style={styles.setDefaultText}>Set default</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Address Lines */}
                  <Text style={styles.addressMain}>{addr.street}</Text>
                  {addr.landmark ? (
                    <Text style={styles.addressSub}>Near {addr.landmark}</Text>
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
                    >
                      <MaterialIcons name="edit" size={16} color="#3b82f6" />
                      <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(addr)}
                      style={styles.actionBtn}
                    >
                      <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
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
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 16,
  },
  emptyTitle: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#9ca3af',
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardDefault: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
  },
  cardRegular: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 6,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  addressMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  addressSub: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 1,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default Addresses;
