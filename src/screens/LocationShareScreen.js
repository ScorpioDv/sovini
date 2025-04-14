import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Linking,
  Share,
  ActivityIndicator,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const LocationShareScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setError('لم يتم منح إذن الوصول إلى الموقع');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        setLocation(currentLocation);

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });

        if (reverseGeocode.length > 0) {
          const locationAddress = reverseGeocode[0];
          const addressString = `${locationAddress.street || ''} ${locationAddress.name || ''}, ${locationAddress.city || ''}, ${locationAddress.region || ''}, ${locationAddress.country || ''}`;
          setAddress(addressString);
        }
      } catch (err) {
        console.error('Location error:', err);
        setError('حدث خطأ أثناء محاولة الحصول على موقعك');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const shareLocation = async () => {
    if (!location) return;

    try {
      const locationString = `موقعي الحالي:\nخط العرض: ${location.coords.latitude}\nخط الطول: ${location.coords.longitude}\nالعنوان: ${address || 'غير متوفر'}\n\nGoogle Maps: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;

      await Share.share({
        message: locationString,
        title: 'مشاركة الموقع في حالة الطوارئ'
      });
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة مشاركة موقعك');
    }
  };

  const openInMaps = () => {
    if (!location) return;

    const url = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    Linking.openURL(url).catch(err => {
      Alert.alert('خطأ', 'لا يمكن فتح تطبيق الخرائط');
    });
  };

  const retryLocation = () => {
    setLoading(true);
    setError(null);
    setLocation(null);
    setAddress(null);

    (async () => {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        setLocation(currentLocation);

        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });

        if (reverseGeocode.length > 0) {
          const locationAddress = reverseGeocode[0];
          const addressString = `${locationAddress.street || ''} ${locationAddress.name || ''}, ${locationAddress.city || ''}, ${locationAddress.region || ''}, ${locationAddress.country || ''}`;
          setAddress(addressString);
        }
      } catch (err) {
        console.error('Location retry error:', err);
        setError('حدث خطأ أثناء محاولة الحصول على موقعك');
      } finally {
        setLoading(false);
      }
    })();
  };

  const makeEmergencyCall = () => {
    const emergencyNumber = '14';

    Alert.alert(
      'اتصال طارئ',
      'هل أنت متأكد أنك تريد الاتصال بخدمات الطوارئ في الجزائر؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel'
        },
        {
          text: 'اتصال',
          onPress: () => {
            const phoneNumber = Platform.OS === 'android' ? `tel:${emergencyNumber}` : `telprompt:${emergencyNumber}`;
            Linking.openURL(phoneNumber).catch(err => {
              Alert.alert('خطأ', 'لا يمكن إجراء المكالمة في هذا الوقت');
            });
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>مشاركة الموقع</Text>
          <Text style={styles.headerSubtitle}>
            مشاركة موقعك الحالي مع خدمات الطوارئ أو جهات الاتصال
          </Text>
        </View>

        <View style={styles.locationContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>جاري تحديد موقعك...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#DE0F3F" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryLocation}
              >
                <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          ) : location ? (
            <>
              <View style={styles.locationInfoContainer}>
                <View style={styles.locationInfoItem}>
                  <Text style={styles.locationInfoLabel}>خط العرض:</Text>
                  <Text style={styles.locationInfoValue}>
                    {location.coords.latitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.locationInfoItem}>
                  <Text style={styles.locationInfoLabel}>خط الطول:</Text>
                  <Text style={styles.locationInfoValue}>
                    {location.coords.longitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.locationInfoItem}>
                  <Text style={styles.locationInfoLabel}>الدقة:</Text>
                  <Text style={styles.locationInfoValue}>
                    {location.coords.accuracy.toFixed(2)} متر
                  </Text>
                </View>

                <View style={styles.locationInfoItem}>
                  <Text style={styles.locationInfoLabel}>العنوان:</Text>
                  <Text style={styles.locationInfoValue}>
                    {address || 'غير متوفر'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={shareLocation}
                >
                  <Ionicons name="share" size={24} color="white" />
                  <Text style={styles.actionButtonText}>مشاركة الموقع</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
                  onPress={openInMaps}
                >
                  <Ionicons name="map" size={24} color="white" />
                  <Text style={styles.actionButtonText}>فتح في الخرائط</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="location-outline" size={48} color="#7f8c8d" />
              <Text style={styles.errorText}>لم يتم العثور على معلومات الموقع</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryLocation}
              >
                <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>معلومات مهمة</Text>
          <Text style={styles.infoText}>
            في حالات الطوارئ، يمكنك مشاركة موقعك الدقيق مع خدمات الطوارئ أو جهات الاتصال الخاصة بك. سيساعد ذلك في وصول المساعدة إليك بشكل أسرع.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.emergencyCallButton}
          onPress={makeEmergencyCall}
        >
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.emergencyCallText}>اتصال بالطوارئ  SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  locationContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationInfoContainer: {
    marginBottom: 20,
  },
  locationInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  locationInfoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  locationInfoValue: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
    textAlign: 'right',
  },
  emergencyCallButton: {
    backgroundColor: '#DE0F3F',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emergencyCallText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LocationShareScreen;
