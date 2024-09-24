// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore import

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

export { db };
