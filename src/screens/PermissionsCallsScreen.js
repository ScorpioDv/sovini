import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Image,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const PermissionsCallsScreen = ({ navigation }) => {
  const [callsPermission, setCallsPermission] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const requestCallsPermission = async () => {
    try {
      // On Android, we can't directly request call permission through Expo
      // We'll use a workaround by trying to make a dummy call that will trigger the permission request
      if (Platform.OS === 'android') {
        Linking.openURL('tel:').catch(err => {
          console.log('Error opening phone app:', err);
        });
      }
      
      setCallsPermission('granted');
      
      // Animate out and navigate to home screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace('Home');
      });
    } catch (error) {
      console.error('Error requesting calls permission:', error);
      navigation.replace('Home');
    }
  };
  
  const skipPermission = () => {
    // Animate out and navigate to home screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Home');
    });
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="call" size={80} color="#DE0F3F" />
        </View>
        
        <Text style={styles.title}>السماح بإجراء المكالمات</Text>
        
        <Text style={styles.description}>
          يحتاج تطبيق "صوفيني" إلى إذن لإجراء مكالمات هاتفية للاتصال بخدمات الطوارئ في الحالات الحرجة.
        </Text>
        
        <Image 
          source={{ uri: 'https://media.discordapp.net/attachments/710187572697104414/1361110568739672206/20250413_234712_0000.png?ex=67fd907f&is=67fc3eff&hm=570222171750f9d06984b265aea947d3bd363e347ec2f84f6e58d2f0a5d76dd8&=&format=webp&quality=lossless' }}
          style={styles.logo}
        />
        
        <Text style={styles.infoText}>
          هذا الإذن ضروري للاتصال المباشر بخدمات الطوارئ في الجزائر (14) عند الضغط على زر الطوارئ.
        </Text>
        
        <Animated.View 
          style={{
            transform: [{ scale: buttonScaleAnim }]
          }}
        >
          <TouchableOpacity 
            style={styles.allowButton}
            onPress={requestCallsPermission}
          >
            <Text style={styles.allowButtonText}>السماح بإجراء المكالمات</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={skipPermission}
        >
          <Text style={styles.skipButtonText}>تخطي</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(231, 60, 160, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  allowButton: {
    backgroundColor: '#DE0F3F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  allowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
});

export default PermissionsCallsScreen;
