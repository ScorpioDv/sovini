import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postingLoading, setPostingLoading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        navigation.replace('Auth');
      } else {
        fetchUserPosts(currentUser.uid);
      }
    });

    return () => unsubscribeAuth(); 
  }, [navigation]);

  const fetchUserPosts = async (userId) => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener for user posts
      const unsubscribePosts = onSnapshot(postsQuery, (querySnapshot) => {
        const userPosts = [];

        querySnapshot.forEach((doc) => {
          userPosts.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setPosts(userPosts);
      }, (error) => {
        console.error("Error fetching user posts: ", error);
        Alert.alert('خطأ', 'حدث خطأ أثناء جلب المنشورات');
      });

      return unsubscribePosts;
    } catch (error) {
      console.error('Error setting up posts listener:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء جلب المنشورات');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('نجاح', 'تم تسجيل الخروج بنجاح');
      navigation.replace('Auth');
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim()) {
      Alert.alert('خطأ', 'لا يمكن نشر منشور فارغ');
      return;
    }

    setPostingLoading(true);

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'مستخدم',
        content: newPost,
        createdAt: serverTimestamp()
      });

      setNewPost('');
      Alert.alert('نجاح', 'تم نشر المنشور بنجاح');
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء نشر المنشور');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      Alert.alert('نجاح', 'تم حذف المنشور بنجاح');
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حذف المنشور');
    }
  };

  const renderPostItem = ({ item }) => {
    const timestamp = item.createdAt ? new Date(item.createdAt.seconds * 1000) : new Date();
    const formattedDate = timestamp.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.postItem}>
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePost(item.id)}
          >
            <Ionicons name="trash" size={18} color="#DE0F3F" />
          </TouchableOpacity>
          <Text style={styles.postUsername}>{item.userName}</Text>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.postDate}>{formattedDate}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DE0F3F" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImageText}>
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.displayName || 'مستخدم'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.newPostContainer}>
          <Text style={styles.newPostTitle}>منشور جديد</Text>
          <TextInput
            style={styles.newPostInput}
            placeholder="ماذا يدور في ذهنك؟"
            placeholderTextColor="#95a5a6"
            multiline
            numberOfLines={4}
            value={newPost}
            onChangeText={setNewPost}
            textAlign="right"
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.postButton, !newPost.trim() && styles.disabledButton]}
            onPress={handleAddPost}
            disabled={postingLoading || !newPost.trim()}
          >
            {postingLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.postButtonText}>نشر</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.postsTitle}>منشوراتي</Text>

        {posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noPostsContainer}>
            <Ionicons name="document-text" size={48} color="#bdc3c7" />
            <Text style={styles.noPostsText}>لا توجد منشورات</Text>
            <Text style={styles.noPostsSubtext}>ابدأ بمشاركة منشورك الأول!</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.communityButton}
          onPress={() => navigation.navigate('Community')}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.communityButtonText}>عرض منشورات المجتمع</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="medkit" size={20} color="white" />
          <Text style={styles.emergencyButtonText}>العودة إلى ميزات الطوارئ</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  header: {
    backgroundColor: '#DE0F3F',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  signOutButton: {
    padding: 5,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  profileContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DE0F3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  newPostContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  newPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'right',
  },
  newPostInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 100,
    marginBottom: 15,
  },
  postButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'right',
  },
  postItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  deleteButton: {
    padding: 5,
  },
  postContent: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    lineHeight: 22,
    textAlign: 'right',
  },
  postDate: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'left',
  },
  noPostsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  noPostsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
  },
  noPostsSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  communityButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  communityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emergencyButton: {
    backgroundColor: '#DE0F3F',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;
