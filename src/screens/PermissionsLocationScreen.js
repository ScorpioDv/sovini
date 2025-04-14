import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';


const PermissionsLocationScreen = ({ navigation }) => {
  const [locationPermission, setLocationPermission] = useState(null);
  
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
  
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      // Animate out and navigate to next screen
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
        navigation.replace('PermissionsCalls');
      });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      navigation.replace('PermissionsCalls');
    }
  };
  
  const skipPermission = () => {
    // Animate out and navigate to next screen
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
      navigation.replace('PermissionsCalls');
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
          <Ionicons name="location" size={80} color="#DE0F3F" />
        </View>
        
        <Text style={styles.title}>السماح بالوصول إلى الموقع</Text>
        
        <Text style={styles.description}>
          يحتاج تطبيق "صوفيني" إلى الوصول إلى موقعك لمشاركته مع خدمات الطوارئ في حالات الطوارئ.
        </Text>
        
        <Image 
          source={{ uri: 'https://media.discordapp.net/attachments/710187572697104414/1361110568739672206/20250413_234712_0000.png?ex=67fd907f&is=67fc3eff&hm=570222171750f9d06984b265aea947d3bd363e347ec2f84f6e58d2f0a5d76dd8&=&format=webp&quality=lossless' }}
          style={styles.logo}
        />
        
        <Text style={styles.infoText}>
          سيتم استخدام موقعك فقط عند الحاجة إليه في حالات الطوارئ ولن يتم مشاركته مع أي جهة خارجية.
        </Text>
        
        <Animated.View 
          style={{
            transform: [{ scale: buttonScaleAnim }]
          }}
        >
          <TouchableOpacity 
            style={styles.allowButton}
            onPress={requestLocationPermission}
          >
            <Text style={styles.allowButtonText}>السماح بالوصول إلى الموقع</Text>
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
    backgroundColor: 'rgba(219, 52, 177, 0.1)',
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

export default PermissionsLocationScreen;
