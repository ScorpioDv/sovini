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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import medicalInformation from '../data/medicalInformation';

const MedicalInfoScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedCategories, setSavedCategories] = useState([]);

  const MEDICAL_CATEGORIES = Object.values(medicalInformation).map(item => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    source: item.source,
    lastUpdated: item.lastUpdated
  }));

  useEffect(() => {
    checkSavedCategories();
  }, []);

  const checkSavedCategories = async () => {
    try {
      const savedDir = `${FileSystem.documentDirectory}medical_info/`;
      const dirInfo = await FileSystem.getInfoAsync(savedDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(savedDir);
        setSavedCategories([]);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(savedDir);
      const savedIds = files.map(file => file.split('.')[0]);
      setSavedCategories(savedIds);
    } catch (error) {
      console.log('خطأ في التحقق من الفئات المحفوظة:', error);
    }
  };

  const saveForOffline = async (category) => {
    if (!category) return;

    setLoading(true);

    try {
      const savedDir = `${FileSystem.documentDirectory}medical_info/`;
      const dirInfo = await FileSystem.getInfoAsync(savedDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(savedDir);
      }

      const categoryData = Object.values(medicalInformation).find(
        item => item.id === category.id
      );

      if (!categoryData) {
        Alert.alert('خطأ', 'تعذر العثور على بيانات الفئة');
        setLoading(false);
        return;
      }

      const filePath = `${savedDir}${category.id}.json`;
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(categoryData),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      setSavedCategories(prev => [...prev, category.id]);
      Alert.alert('نجاح', `${category.title} تم حفظه للاستخدام دون اتصال`);
    } catch (error) {
      Alert.alert('خطأ', 'فشل حفظ المحتوى للاستخدام دون اتصال');
      console.log('خطأ في حفظ المحتوى للاستخدام دون اتصال:', error);
    }

    setLoading(false);
  };

  const removeOfflineContent = async (category) => {
    if (!category) return;

    try {
      const filePath = `${FileSystem.documentDirectory}medical_info/${category.id}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        setSavedCategories(prev => prev.filter(id => id !== category.id));
        Alert.alert('نجاح', `${category.title} تمت إزالته من التخزين دون اتصال`);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل إزالة المحتوى دون اتصال');
      console.log('خطأ في إزالة المحتوى دون اتصال:', error);
    }
  };

  const renderMedicalInfo = () => {
    if (!selectedCategory) return null;

    const category = Object.values(medicalInformation).find(
      item => item.id === selectedCategory.id
    );

    if (!category) return null;

    const isSaved = savedCategories.includes(category.id);

    return (
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>{category.title}</Text>
        <Text style={styles.infoSource}>المصدر: {category.source}</Text>
        <Text style={styles.infoDate}>آخر تحديث: {category.lastUpdated}</Text>

        <Text style={styles.infoText}>
          {category.content.introduction}
        </Text>

        <View style={styles.principlesContainer}>
          <Text style={styles.sectionTitle}>المبادئ العامة</Text>
          {category.content.generalPrinciples.map((principle, index) => (
            <View key={index} style={styles.principleItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
              <Text style={styles.principleText}>{principle}</Text>
            </View>
          ))}
        </View>

        {category.content.sections.map((section, index) => (
          <View key={index} style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionText}>{section.content}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.downloadButton,
            isSaved && styles.removeButton,
            loading && styles.disabledButton
          ]}
          onPress={() => isSaved
            ? removeOfflineContent(category)
            : saveForOffline(category)
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons
                name={isSaved ? "trash" : "download"}
                size={24}
                color="white"
              />
              <Text style={styles.downloadButtonText}>
                {isSaved ? "إزالة المحتوى دون اتصال" : "حفظ للاستخدام دون اتصال"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryItem = ({ item }) => {
    const isSaved = savedCategories.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => setSelectedCategory(item)}
      >
        <Ionicons name={item.icon} size={32} color="#3498db" />
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={styles.categorySource}>{item.source}</Text>
        {isSaved && (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!selectedCategory ? (
          <>
            <View style={styles.headerContainer}>
              <Image
                source={{ uri: 'https://www.who.int/images/default-source/default-album/who-emblem-rgb.jpg?sfvrsn=877bb56a_0' }}
                style={styles.logo}
              />
              <Text style={styles.headerText}>معلومات طبية موثوقة</Text>
              <Text style={styles.subHeaderText}>
                مصدرها منظمة الصحة العالمية والصليب الأحمر
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#3498db" />
              <Text style={styles.infoBoxText}>
                احفظ الفئات للوصول دون اتصال للتأكد من توفر المعلومات الطبية الحاسمة حتى بدون اتصال بالإنترنت.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>الفئات الطبية</Text>

            <FlatList
              data={MEDICAL_CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCategory(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#3498db" />
              <Text style={styles.backButtonText}>العودة إلى الفئات</Text>
            </TouchableOpacity>
            {renderMedicalInfo()}
          </>
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
    padding: 15,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 40,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBoxText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    minHeight: 150,
  },
  categoryTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
  categorySource: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  savedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#27ae60',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#3498db',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  infoSource: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  infoDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 20,
    lineHeight: 24,
  },
  principlesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  principleText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
  },
  downloadButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  removeButton: {
    backgroundColor: '#DE0F3F',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default MedicalInfoScreen;
