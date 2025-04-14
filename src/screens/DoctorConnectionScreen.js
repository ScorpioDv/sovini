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
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const doctorsData = [
  {
    "name": "د. فتيحة بن زادي",
    "specialty": "الطب العام والموجات فوق الصوتية",
    "location": "سيتي داسكي بت 2 ن° 878، قسنطينة",
    "phone": "+213 31 73 97 00",
    "email": "fatihabenzadi@yahoo.com"
  },
  {
    "name": "د. بلحاج مصطفى زوبير",
    "specialty": "أمراض القلب والأوعية الدموية",
    "location": "6، شارع الإخوة بوتامين بلفيو، قسنطينة",
    "phone": "+213 559 666 300 / +213 31 93 55 35 / +213 31 93 51 04",
    "email": "belhazo@yahoo.fr"
  },
  {
    "name": "د. آمال ناردجيس نعموس",
    "specialty": "الأشعة",
    "location": "المؤسسة المستشفية الخاصة الزهراء، 15، شارع العيادات، زواغي سليمان، قسنطينة",
    "phone": "+213 560 00 11 97",
    "email": "namous.amel@gmail.com"
  },
  {
    "name": "د. ليليا بن صالح",
    "specialty": "طب الأطفال",
    "location": "2 شارع بوزارد حسين، عنابة",
    "phone": "+213 38 40 56 17 / +213 559 87 46 07"
  },
  {
    "name": "د. نجيمة مخنشة",
    "specialty": "طب الأطفال",
    "location": "عنابة",
    "phone": "+213 30 82 02 53 / +213 664 24 84 99"
  },
  {
    "name": "د. رياض ناصر",
    "specialty": "طب الأطفال",
    "location": "عنابة",
    "phone": "+213 664 24 84 99"
  },
  {
    "name": "د. عبد الحكيم مستيري",
    "specialty": "جراحة الأسنان",
    "location": "عيادة الابتسامة، عنابة",
    "phone": "+213 661 46 08 67 / +213 660 37 58 23",
    "email": "cds_annaba@yahoo.fr"
  },
  {
    "name": "د. موفوك",
    "specialty": "أمراض القلب",
    "location": "عنابة",
    "languages": ["الفرنسية", "العربية", "القبائلية"],
    "consultation_fee": "د.ج 7,334"
  },
  {
    "name": "د. يوسف سبع",
    "specialty": "الطب العام",
    "location": "أولاد جلال، بسكرة",
    "languages": ["الإنجليزية", "الفرنسية", "العربية"],
    "consultation_fee": "د.ج 7,334"
  },
  {
    "name": "د. سبتي نصر الدين",
    "specialty": "الطب العام",
    "location": "ساكيكدة",
    "languages": ["الفرنسية", "العربية"],
    "consultation_fee": "د.ج 7,334"
  },
  {
    "name": "د. رميطة فاضل",
    "specialty": "الطب العام",
    "location": "أدرار",
    "languages": ["الإنجليزية", "الفرنسية", "العربية"],
    "consultation_fee": "د.ج 3,334"
  },
  {
    "name": "د. جميع جعفر",
    "specialty": "الطب العام",
    "location": "متليلي، غرداية",
    "languages": ["العربية", "الفرنسية", "الإنجليزية"],
    "consultation_fee": "د.ج 7,334"
  },
  {
    "name": "د. صوفان محمد شريف",
    "specialty": "الطب العام",
    "location": "حيدرة، الجزائر",
    "languages": ["الإنجليزية", "الفرنسية", "العربية"],
    "consultation_fee": "د.ج 3,334"
  },
  {
    "name": "د. محمد قلال",
    "specialty": "الطب العام",
    "location": "وهران",
    "languages": ["العربية", "الفرنسية"],
    "consultation_fee": "د.ج 7,334"
  },
  {
    "name": "د. عبد الله أحمد عمر",
    "specialty": "الأنف والأذن والحنجرة (ENT)",
    "location": "كوبا، الجزائر",
    "languages": ["الإنجليزية", "الفرنسية", "العربية"],
    "consultation_fee": "د.ج 3,334"
  }
];

const DoctorConnectionScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);

  useEffect(() => {
    // Filter doctors based on search query
    setFilteredDoctors(
      doctorsData.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  const renderDoctorItem = ({ item }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialization}>{item.specialty}</Text>
        <Text style={styles.doctorLocation}>{item.location}</Text>
        <Text style={styles.doctorPhone}>{item.phone}</Text>
        {item.email && <Text style={styles.doctorEmail}>{item.email}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>قائمة الأطباء</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن طبيب أو تخصص"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctorItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.doctorList}
          scrollEnabled={false}

        />
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
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  doctorList: {
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  doctorInfo: {
    alignItems: 'flex-start',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  doctorLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  doctorPhone: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  doctorEmail: {
    fontSize: 14,
    color: '#2c3e50',
  },
});

export default DoctorConnectionScreen;
