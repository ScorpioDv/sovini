import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "XXXXXXXXXXXXXXXXXXX",
  authDomain: "XXXXXXXXXXXXXXXXXXX",
  projectId: "XXXXXXXXXXXXXXXXXXX9",
  storageBucket: "XXXXXXXXXXXXXXXXXXX",
  messagingSenderId: "XXXXXXXXXXXXXXXXXXX",
  appId: "XXXXXXXXXXXXXXXXXXX",
  measurementId: "G-XXXXXXXXXXXXXXXXXXX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const createIndexes = async () => {
  try {
    console.log("Setting up Firestore indexes...");

    console.log(`
      IMPORTANT: You need to create the following Firestore indexes:
      
      1. Collection: posts
         Fields to index: 
         - userId (Ascending)
         - createdAt (Descending)
         
      2. Collection: posts
         Fields to index:
         - createdAt (Descending)
         
      You can create these indexes in the Firebase console:
      https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
    `);
    
    const testQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    await getDocs(testQuery);
    
  } catch (error) {
    console.log("Firestore access error:", error);
    console.log("Please make sure you've replaced the Firebase config with your actual project credentials");
  }
};

createIndexes();

export { auth, db };
