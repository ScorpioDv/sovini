import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import emergencyInstructions from '../data/emergencyInstructions';
import arabicEmergencyInstructions from '../data/arabicEmergencyInstructions';

// Set RTL for Arabic language
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const EmergencyInstructionsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Use Arabic emergency instructions
  const instructions = arabicEmergencyInstructions;
  
  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        Speech.stop();
      }
    };
  }, [isPlaying]);
  
  // Function to play audio instructions using Google TTS
  const playInstructions = async (steps) => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    
    // Create a string of all steps to read
    const instructionsText = steps.map(step => 
      `${step.title}. ${step.description}`
    ).join('. ');
    
    try {
      // Use Arabic voice for text-to-speech with Google provider
      await Speech.speak(instructionsText, {
        language: 'ar',
        rate: 0.9,
        pitch: 1.0,
        voice: 'ar-xa-x-ard-network', // Google TTS voice for Arabic
        provider: 'Google',  // Specify Google as the provider
        onDone: () => setIsPlaying(false),
        onError: (error) => {
          console.log('Speech error:', error);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.log('Speech error:', error);
      setIsPlaying(false);
      
      // Fallback to default TTS if Google TTS fails
      try {
        await Speech.speak(instructionsText, {
          language: 'ar',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => setIsPlaying(false),
          onError: (error) => {
            console.log('Fallback speech error:', error);
            setIsPlaying(false);
          }
        });
      } catch (fallbackError) {
        console.log('Fallback speech error:', fallbackError);
        setIsPlaying(false);
      }
    }
  };
  
  // Function to play a single step instruction
  const playStepInstruction = async (step) => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    
    try {
      // Use Arabic voice for text-to-speech with Google provider
      await Speech.speak(`${step.title}. ${step.description}`, {
        language: 'ar',
        rate: 0.9,
        pitch: 1.0,
        voice: 'ar-xa-x-ard-network', // Google TTS voice for Arabic
        provider: 'Google',  // Specify Google as the provider
        onDone: () => setIsPlaying(false),
        onError: (error) => {
          console.log('Speech error:', error);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.log('Speech error:', error);
      setIsPlaying(false);
      
      // Fallback to default TTS if Google TTS fails
      try {
        await Speech.speak(`${step.title}. ${step.description}`, {
          language: 'ar',
          rate: 0.9,
          pitch: 1.0,
          onDone: () => setIsPlaying(false),
          onError: (error) => {
            console.log('Fallback speech error:', error);
            setIsPlaying(false);
          }
        });
      } catch (fallbackError) {
        console.log('Fallback speech error:', fallbackError);
        setIsPlaying(false);
      }
    }
  };
  
  // Render emergency category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, { backgroundColor: item.color }]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons name={item.icon} size={32} color="white" />
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );
  
  // Render emergency instructions
  const renderInstructions = () => {
    if (!selectedCategory) return null;
    
    const categoryData = instructions.categories.find(
      category => category.id === selectedCategory
    );
    
    const instructionData = instructions.instructions[selectedCategory];
    
    if (!instructionData) return null;
    
    return (
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Speech.stop();
              setIsPlaying(false);
              setSelectedCategory(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.instructionTitle}>{instructionData.title}</Text>
          
          <TouchableOpacity 
            style={styles.audioButton}
            onPress={() => playInstructions(instructionData.steps)}
          >
            <Ionicons 
              name={isPlaying ? "stop-circle" : "volume-high"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.symptomsContainer}>
          <Text style={styles.symptomsTitle}>الأعراض:</Text>
          {instructionData.symptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomItem}>
              <Ionicons name="medical" size={16} color="#e74c3c" />
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.stepsTitle}>الخطوات:</Text>
        
        {instructionData.steps.map((step, index) => (
          <View 
            key={index} 
            style={[
              styles.stepContainer,
              step.critical && styles.criticalStep
            ]}
          >
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <TouchableOpacity 
                style={styles.stepAudioButton}
                onPress={() => playStepInstruction(step)}
              >
                <Ionicons 
                  name="volume-medium" 
                  size={20} 
                  color={step.critical ? "white" : "#3498db"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
        
        <View style={styles.sourceContainer}>
          <Text style={styles.sourceText}>المصدر: {instructionData.source}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.emergencyCallButton}
          onPress={() => {
            Speech.stop();
            setIsPlaying(false);
            navigation.navigate('EmergencyCall');
          }}
        >
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.emergencyCallText}>اتصل بالإسعاف</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!selectedCategory ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>تعليمات الطوارئ</Text>
              <Text style={styles.headerSubtitle}>
                اختر نوع الحالة الطارئة للحصول على تعليمات فورية
              </Text>
            </View>
            
            <FlatList
              data={instructions.categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              contentContainerStyle={styles.categoriesContainer}
              scrollEnabled={false}

            />
            
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={24} color="#3498db" />
              <Text style={styles.infoText}>
                اضغط على أيقونة الصوت للاستماع إلى التعليمات الصوتية. في حالات الطوارئ الشديدة، اتصل بالإسعاف فوراً.
              </Text>
            </View>
          </>
        ) : (
          renderInstructions()
        )}
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
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 10,
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
  },
  instructionsContainer: {
    flex: 1,
    padding: 16,
  },
  instructionHeader: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  backButton: {
    padding: 5,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  audioButton: {
    padding: 5,
  },
  symptomsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  symptomsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'right',
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  symptomText: {
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 10,
    textAlign: 'right',
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'right',
  },
  stepContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  criticalStep: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  stepAudioButton: {
    padding: 5,
    marginLeft: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    textAlign: 'right',
  },
  sourceContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emergencyCallButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  emergencyCallText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EmergencyInstructionsScreen;
