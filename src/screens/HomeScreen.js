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
  I18nManager,
  Linking,
  Alert,
  Platform,
  Animated
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [glowAnim]);

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
              console.error('Error making emergency call:', err);
            });
          }
        }
      ],
      { cancelable: true }
    );
  };

  const emergencyOptions = [
    {
      id: '1',
      title: 'تعليمات الطوارئ',
      description: 'تعليمات فورية للحالات الطارئة مع إرشادات صوتية',
      icon: <FontAwesome5 name="first-aid" size={28} color="white" />,
      screen: 'EmergencyInstructions',
      color: '#DE0F3F'
    },
    {
      id: '2',
      title: 'الذكاء الاصطناعي',
      description: 'نصائح للحفاظ على صحتك وتحسين نمط حياتك',
      icon: <FontAwesome5 name="robot" size={28} color="white" />,
      screen: 'AiScreen',
      color: '#03c400'
    },
    {
      id: '3',
      title: 'مشاركة الموقع',
      description: 'مشاركة موقعك الحالي مع خدمات الطوارئ',
      icon: <MaterialIcons name="location-on" size={28} color="white" />,
      screen: 'LocationShare',
      color: '#32CD32'
    },
    {
      id: '4',
      title: 'معلومات طبية',
      description: 'معلومات طبية موثوقة من مصادر معتمدة',
      icon: <FontAwesome5 name="info-circle" size={28} color="white" />,
      screen: 'MedicalInfo',
      color: '#FF4500'
    },
    {
      id: '5',
      title: 'الاتصال بالأطباء',
      description: 'اتصال بأطباء متخصصين حسب الحالة الطبية',
      icon: <FontAwesome5 name="user-md" size={28} color="white" />,
      screen: 'DoctorConnection',
      color: '#34deeb'
    },
    {
      id: '6',
      title: 'مجتمع المستخدمين',
      description: 'شارك تجاربك وتلقى نصائح من مستخدمين آخرين',
      icon: <Ionicons name="chatbubbles" size={28} color="white" />,
      screen: 'Community',
      color: '#FFD700'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://media.discordapp.net/attachments/710187572697104414/1361110568739672206/20250413_234712_0000.png?ex=67fd907f&is=67fc3eff&hm=570222171750f9d06984b265aea947d3bd363e347ec2f84f6e58d2f0a5d76dd8&=&format=webp&quality=lossless' }}
            style={styles.logo}
          />
          <Text style={styles.title}>صوفيني</Text>
          <Text style={styles.subtitle}>أول تطبيق طوارئ في الجزائر</Text>
        </View>

        <View style={styles.userContainer}>
          {user ? (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileImageText}>
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.displayName || 'مستخدم'}</Text>
                <Text style={styles.profileViewText}>عرض الملف الشخصي</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Ionicons name="log-in" size={24} color="#3498db" />
              <Text style={styles.loginButtonText}>تسجيل الدخول / إنشاء حساب</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={makeEmergencyCall}>

        <Animated.View style={[styles.emergencyButton, { shadowOpacity: glowAnim }]}>
          <Ionicons name="call" size={32} color="white" />
            <Text style={styles.emergencyButtonText}>اتصال بالطوارئ SOS</Text>
        </Animated.View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>خدمات الطوارئ</Text>

        <View style={styles.gridContainer}>
          {emergencyOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { borderTopColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                {option.icon}
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>حول التطبيق</Text>
          <Text style={styles.infoText}>
            تطبيق "صوفيني" يوفر مساعدة طبية فورية في حالات الطوارئ في الجزائر. يتضمن تعليمات طوارئ، اتصال بالإسعاف، مشاركة الموقع، معلومات طبية موثوقة، واتصال بأطباء متخصصين.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
  logo: {
    width: 120,
    height: 80,
    borderRadius: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DE0F3F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  userContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
  },
  profileViewText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  loginButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  emergencyButton: {
    backgroundColor: '#DE0F3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    shadowColor: '#DE0F3F',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'right',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    borderTopWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
    textAlign: 'right',
  },
});

export default HomeScreen;
