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
    const testQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(1));
    await getDocs(testQuery);
    
  } catch (error) {
    console.log("Firestore access error:", error);
  }
};

createIndexes();

export { auth, db };
