import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  I18nManager,
  Animated,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Home');
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the onAuthStateChanged listener
    } catch (error) {
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'البريد الإلكتروني غير صالح';
          break;
        case 'auth/user-not-found':
          errorMessage = 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني';
          break;
        case 'auth/wrong-password':
          errorMessage = 'كلمة المرور غير صحيحة';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة';
          break;
        case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
          errorMessage = 'خطأ في تكوين Firebase. يرجى التأكد من استبدال بيانات الاعتماد الوهمية بمفاتيح API الخاصة بك في ملف firebase.js';
          break;
      }
      
      Alert.alert('خطأ', errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('خطأ', 'يرجى إدخال جميع الحقول المطلوبة');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }
    
    if (isDoctor && (!specialization || !licenseNumber)) {
      Alert.alert('خطأ', 'يرجى إدخال التخصص ورقم الترخيص للتسجيل كطبيب');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        name: name,
        email: email,
        userType: isDoctor ? 'doctor' : 'user',
        specialization: isDoctor ? specialization : '',
        licenseNumber: isDoctor ? licenseNumber : '',
        createdAt: serverTimestamp(),
        verified: isDoctor ? false : true // Doctors need verification
      });
      
      // If user is a doctor, create a pending verification document
      if (isDoctor) {
        await setDoc(doc(db, 'doctorVerifications', user.uid), {
          userId: user.uid,
          name: name,
          email: email,
          specialization: specialization,
          licenseNumber: licenseNumber,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        
        // Show verification message
        Alert.alert(
          'تم التسجيل بنجاح',
          'تم إنشاء حسابك كطبيب. سيتم التحقق من معلوماتك قبل تفعيل ميزات الطبيب الكاملة.'
        );
      }
      
      // Navigation will be handled by the onAuthStateChanged listener
    } catch (error) {
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
          break;
        case 'auth/invalid-email':
          errorMessage = 'البريد الإلكتروني غير صالح';
          break;
        case 'auth/weak-password':
          errorMessage = 'كلمة المرور ضعيفة جدًا';
          break;
        case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
          errorMessage = 'خطأ في تكوين Firebase. يرجى التأكد من استبدال بيانات الاعتماد الوهمية بمفاتيح API الخاصة بك في ملف firebase.js';
          break;
      }
      
      Alert.alert('خطأ', errorMessage);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle between login and register
  const toggleAuthMode = () => {
    // Reset form fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setIsDoctor(false);
    setSpecialization('');
    setLicenseNumber('');
    
    // Toggle mode with animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 0,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsLogin(!isLogin);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </Text>
          </View>
          
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Image
              source={{ uri: 'https://www.who.int/images/default-source/default-album/who-emblem-rgb.jpg?sfvrsn=877bb56a_0' }}
              style={styles.logo}
            />
            
            <Text style={styles.formTitle}>
              {isLogin ? 'مرحبًا بعودتك!' : 'انضم إلينا اليوم'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isLogin 
                ? 'سجل دخولك للوصول إلى جميع ميزات التطبيق' 
                : 'أنشئ حسابًا للوصول إلى جميع ميزات التطبيق'
              }
            </Text>
            
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الاسم</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="أدخل اسمك الكامل"
                    placeholderTextColor="#95a5a6"
                    value={name}
                    onChangeText={setName}
                    textAlign="right"
                  />
                  <Ionicons name="person-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                </View>
              </View>
            )}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل بريدك الإلكتروني"
                  placeholderTextColor="#95a5a6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  textAlign="right"
                />
                <Ionicons name="mail-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor="#95a5a6"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  textAlign="right"
                />
                <Ionicons name="lock-closed-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
              </View>
            </View>
            
            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="أعد إدخال كلمة المرور"
                      placeholderTextColor="#95a5a6"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      textAlign="right"
                    />
                    <Ionicons name="lock-closed-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                  </View>
                </View>
                
                <View style={styles.doctorSwitchContainer}>
                  <Text style={styles.doctorSwitchLabel}>التسجيل كطبيب</Text>
                  <Switch
                    value={isDoctor}
                    onValueChange={setIsDoctor}
                    trackColor={{ false: '#bdc3c7', true: '#9b59b6' }}
                    thumbColor={isDoctor ? '#8e44ad' : '#f4f3f4'}
                  />
                </View>
                
                {isDoctor && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>التخصص الطبي</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="أدخل تخصصك الطبي"
                          placeholderTextColor="#95a5a6"
                          value={specialization}
                          onChangeText={setSpecialization}
                          textAlign="right"
                        />
                        <Ionicons name="medical" size={20} color="#7f8c8d" style={styles.inputIcon} />
                      </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>رقم الترخيص الطبي</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="أدخل رقم ترخيصك الطبي"
                          placeholderTextColor="#95a5a6"
                          value={licenseNumber}
                          onChangeText={setLicenseNumber}
                          textAlign="right"
                        />
                        <Ionicons name="card-outline" size={20} color="#7f8c8d" style={styles.inputIcon} />
                      </View>
                    </View>
                    
                    <View style={styles.doctorInfoContainer}>
                      <Ionicons name="information-circle" size={20} color="#3498db" />
                      <Text style={styles.doctorInfoText}>
                        سيتم التحقق من معلوماتك قبل تفعيل ميزات الطبيب الكاملة
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
            
            <TouchableOpacity
              style={styles.authButton}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleAuthMode}
              disabled={loading}
            >
              <Text style={styles.toggleButtonText}>
                {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.firebaseNoteContainer}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" />
              <Text style={styles.firebaseNoteText}>
                ملاحظة: يجب استبدال بيانات اعتماد Firebase الوهمية بمفاتيح API الخاصة بك في ملف firebase.js
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
  },
  inputIcon: {
    marginLeft: 10,
  },
  doctorSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  doctorSwitchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  doctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  doctorInfoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
  },
  authButton: {
    backgroundColor: '#3498db',
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 10,
  },
  toggleButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
  firebaseNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  firebaseNoteText: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
});

export default AuthScreen;
