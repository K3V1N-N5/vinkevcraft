// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore import
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { getAuth } from "firebase/auth"; // Import Firebase Authentication

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAOX35VoU6pa_LE63KpQT16I7-lW0wTzmA",
  authDomain: "vinkev-craft.firebaseapp.com",
  projectId: "vinkev-craft",
  storageBucket: "vinkev-craft.appspot.com",
  messagingSenderId: "253877673444",
  appId: "1:253877673444:web:2dc71388340933851d7bf1",
  measurementId: "G-8Y7WNQ0GMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database)
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export const checkAdmin = async (uid) => {
  try {
    const adminDoc = await getDoc(doc(db, "admins", uid));
    return adminDoc.exists();  // Mengembalikan true jika user adalah admin
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;  // Lempar error jika terjadi kesalahan
  }
};

// Export Firestore, Storage, and Auth
export { db, storage, auth, checkAdmin };
