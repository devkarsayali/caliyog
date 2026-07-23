import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, getDocs, getDoc, 
  addDoc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Generic Firestore CRUD helper functions
export const firestoreHelpers = {
  getAll: async (collectionName) => {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Firestore getAll error for ${collectionName}:`, error);
      return [];
    }
  },

  getById: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          _id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error(`Firestore getById error for ${collectionName}:`, error);
      return null;
    }
  },

  create: async (collectionName, data) => {
    try {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, data);
      return { _id: docRef.id, ...data };
    } catch (error) {
      console.error(`Firestore create error for ${collectionName}:`, error);
      throw error;
    }
  },

  update: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error(`Firestore update error for ${collectionName}:`, error);
      throw error;
    }
  },

  delete: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Firestore delete error for ${collectionName}:`, error);
      throw error;
    }
  }
};

// Upload media file to Firebase Storage
export const uploadToFirebaseStorage = async (file) => {
  if (!file) return null;
  
  // Create a unique filepath
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  const storageRef = ref(storage, `caliyog_uploads/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    return null;
  }
};
