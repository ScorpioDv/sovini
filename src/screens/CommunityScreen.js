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
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
  I18nManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  onSnapshot
} from 'firebase/firestore';

const CommunityScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [postingLoading, setPostingLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch community posts with real-time updates
  useEffect(() => {
    const fetchCommunityPosts = () => {
      try {
        setLoading(true);
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        // Set up real-time listener for posts
        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
          const communityPosts = [];

          querySnapshot.forEach((doc) => {
            communityPosts.push({
              id: doc.id,
              ...doc.data()
            });
          });

          setPosts(communityPosts);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching posts: ", error);
          setLoading(false);
          Alert.alert('خطأ', 'حدث خطأ أثناء جلب المنشورات');
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up posts listener:', error);
        setLoading(false);
        Alert.alert('خطأ', 'حدث خطأ أثناء جلب المنشورات');
      }
    };

    const unsubscribe = fetchCommunityPosts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Add new post
  const handleAddPost = async () => {
    if (!user) {
      navigation.navigate('Auth');
      return;
    }

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

  // Render post item
  const renderPostItem = ({ item }) => {
    // Format timestamp
    const timestamp = item.createdAt ? new Date(item.createdAt.seconds * 1000) : new Date();
    const formattedDate = timestamp.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isCurrentUserPost = user && item.userId === user.uid;

    return (
      <View style={styles.postItem}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userImageContainer}>
              <Text style={styles.userImageText}>
                {item.userName ? item.userName[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={styles.postUsername}>{item.userName}</Text>
          </View>
          {isCurrentUserPost && (
            <TouchableOpacity
              style={styles.myPostBadge}
            >
              <Text style={styles.myPostText}>منشوري</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <Text style={styles.postDate}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#DE0F3F" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>مجتمع المستخدمين</Text>
        {user ? (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.newPostInput}
          placeholder={user ? "شارك تجربتك أو نصيحتك الطبية..." : "سجل الدخول للمشاركة..."}
          placeholderTextColor="#95a5a6"
          multiline
          numberOfLines={3}
          value={newPost}
          onChangeText={setNewPost}
          editable={!!user}
          textAlign="right"
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.postButton, (!user || !newPost.trim()) && styles.disabledButton]}
          onPress={handleAddPost}
          disabled={postingLoading || !user || !newPost.trim()}
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

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>منشورات المجتمع</Text>
        <Text style={styles.sectionSubtitle}>
          شارك تجاربك وتلقى نصائح من مستخدمين آخرين
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DE0F3F" />
            <Text style={styles.loadingText}>جاري تحميل المنشورات...</Text>
          </View>
        ) : posts.length > 0 ? (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.postsContainer}
            refreshing={loading}
            scrollEnabled={false}

            onRefresh={() => {
              // Refresh will happen automatically due to the onSnapshot listener
              setLoading(true);
            }}
          />
        ) : (
          <View style={styles.noPostsContainer}>
            <Ionicons name="chatbubbles" size={48} color="#bdc3c7" />
            <Text style={styles.noPostsText}>لا توجد منشورات</Text>
            <Text style={styles.noPostsSubtext}>كن أول من يشارك في المجتمع!</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="medkit" size={20} color="white" />
        <Text style={styles.emergencyButtonText}>العودة إلى ميزات الطوارئ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  profileButton: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  newPostContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  newPostInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 80,
    marginBottom: 10,
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
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    textAlign: 'right',
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
  postsContainer: {
    paddingBottom: 80,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userImageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  myPostBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  myPostText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: 'bold',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
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
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#DE0F3F',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CommunityScreen;
